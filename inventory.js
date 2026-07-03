import express from 'express';
import pool from '../config/db.js';
import { z } from 'zod';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/metrics', async (req, res) => {
    try {
        // Remaining assets = what's physically in storage right now
        const [remainingCount] = await pool.query('SELECT SUM(Quantity) as count FROM Inventory');
        
        // Assets taken = net outstanding per issue row, clamped to 0 to guard against
        // over-return data (e.g. trigger double-firing).
        const [issuedCount] = await pool.query(`
            SELECT COALESCE(SUM(
                GREATEST(0,
                    ir.Issued_Quantity - COALESCE((
                        SELECT SUM(rr.Returned_Quantity)
                        FROM ReturnRecord rr
                        WHERE rr.Issue_ID = ir.Issue_ID
                    ), 0)
                )
            ), 0) as count
            FROM IssueRecord ir
        `);

        const [maintenanceCount] = await pool.query('SELECT COUNT(*) as count FROM Equipment WHERE Status = "Under Maintenance"');
        
        // Red Flags: overdue returns + low stock items
        const [overdueCount] = await pool.query("SELECT COUNT(*) as count FROM IssueRecord WHERE Expected_Return < NOW()");
        const [lowStockCount] = await pool.query("SELECT COUNT(*) as count FROM Inventory WHERE Quantity < 15");

        const remaining = Number(remainingCount[0].count) || 0;
        const issued = Number(issuedCount[0].count) || 0;
        const repair = Number(maintenanceCount[0].count) || 0;

        // Total Assets = Remaining Assets (current physical inventory)
        res.json({
            total: remaining,
            available: remaining,
            issued: issued,
            repair: repair,
            overdue: (Number(overdueCount[0].count) || 0) + (Number(lowStockCount[0].count) || 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT E.Serial_Number as serial_number, E.Status as status, S.Location_Name as current_location,
                   E.Equipment_Name as name, C.Category_Name as type, C.Description as caliber, I.Quantity as quantity
            FROM Equipment E
            JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID
            JOIN Inventory I ON E.Equipment_ID = I.Equipment_ID
            JOIN StorageLocation S ON I.Storage_ID = S.Storage_ID
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/available', async (req, res) => {
    try {
        const query = `
            SELECT E.Equipment_ID as id, E.Serial_Number as serial_number, E.Equipment_Name as name, C.Category_Name as type, I.Quantity as max_qty
            FROM Equipment E
            JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID
            JOIN Inventory I ON E.Equipment_ID = I.Equipment_ID
            WHERE I.Quantity > 0
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/alerts', async (req, res) => {
    try {
        // Fetch overdue returns
        const [overdueRows] = await pool.query(`
            SELECT I.Issue_ID as id, I.Expected_Return as expected_return,
                   E.Serial_Number as serial_number, E.Equipment_Name as name, C.Category_Name as type,
                   D.Unit_Name as officer_name, I.Issued_Quantity as quantity, 'Overdue' as alert_type
            FROM IssueRecord I
            JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
            JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID
            JOIN DefenceUnit D ON I.Unit_ID = D.Unit_ID
            WHERE I.Expected_Return < NOW()
        `);

        // Fetch low stock
        const [lowStockRows] = await pool.query(`
            SELECT I.Inventory_ID as id, NULL as expected_return,
                   E.Serial_Number as serial_number, E.Equipment_Name as name, C.Category_Name as type,
                   S.Location_Name as officer_name, I.Quantity as quantity, 'Low Stock' as alert_type
            FROM Inventory I
            JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
            JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID
            JOIN StorageLocation S ON I.Storage_ID = S.Storage_ID
            WHERE I.Quantity < 15
        `);

        // Fetch maintenance required
        const [maintenanceRows] = await pool.query(`
            SELECT M.Maintenance_ID as id, M.Maintenance_Date as expected_return,
                   E.Serial_Number as serial_number, E.Equipment_Name as name, C.Category_Name as type,
                   M.Maintenance_Type as officer_name, NULL as quantity, 'Maintenance' as alert_type
            FROM Maintenance M
            JOIN Equipment E ON M.Equipment_ID = E.Equipment_ID
            JOIN EquipmentCategory C ON E.Category_ID = C.Category_ID
            WHERE E.Status = "Under Maintenance" OR M.Condition_Status != 'Operational'
        `);

        const allAlerts = [...overdueRows, ...lowStockRows, ...maintenanceRows];
        res.json(allAlerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

const issueSchema = z.object({
    asset_id: z.number(),
    officer_id: z.number(), // This maps to Unit_ID now
    expected_return_days: z.number().positive(),
    quantity: z.number().positive() // New field
});

router.post('/issue', requireRole(['Admin', 'Officer']), async (req, res) => {
    try {
        const { asset_id, officer_id, expected_return_days, quantity } = issueSchema.parse(req.body);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Lock the row with highest stock for this equipment
            const [invRow] = await connection.query(
                'SELECT Inventory_ID, Quantity FROM Inventory WHERE Equipment_ID = ? ORDER BY Quantity DESC LIMIT 1 FOR UPDATE',
                [asset_id]
            );
            if (invRow.length === 0 || invRow[0].Quantity < quantity) {
                throw new Error('Insufficient asset quantity available in inventory');
            }

            // Manually deduct upfront so we control exactly which row
            await connection.query(
                'UPDATE Inventory SET Quantity = Quantity - ? WHERE Inventory_ID = ?',
                [quantity, invRow[0].Inventory_ID]
            );

            const [maxIdResult] = await connection.query('SELECT MAX(Issue_ID) AS max_id FROM IssueRecord');
            const newIssueId = (maxIdResult[0].max_id || 0) + 1;

            await connection.query(
                `INSERT INTO IssueRecord (Issue_ID, Equipment_ID, Unit_ID, Issue_Date, Issued_Quantity, Expected_Return) 
                 VALUES (?, ?, ?, NOW(), ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
                [newIssueId, asset_id, officer_id, quantity, expected_return_days]
            );

            // If the SQL trigger also fired it double-deducted — detect and correct
            const [afterRow] = await connection.query(
                'SELECT Quantity FROM Inventory WHERE Inventory_ID = ?',
                [invRow[0].Inventory_ID]
            );
            const expectedQty = invRow[0].Quantity - quantity;
            if (afterRow[0].Quantity < expectedQty) {
                await connection.query(
                    'UPDATE Inventory SET Quantity = ? WHERE Inventory_ID = ?',
                    [expectedQty, invRow[0].Inventory_ID]
                );
            }

            await connection.commit();

            if (req.app.get('io')) {
                req.app.get('io').emit('inventoryUpdate');
            }

            res.json({ message: 'Asset allocated successfully' });
        } catch (err) {
            await connection.rollback();
            return res.status(400).json({ message: err.message });
        } finally {
            connection.release();
        }

    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: err.errors });
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/issued', async (req, res) => {
    try {
        const query = `
            SELECT I.Issue_ID as id, E.Serial_Number as serial_number, E.Equipment_Name as name, 
                   D.Unit_Name as unit_name, 
                   (I.Issued_Quantity - COALESCE((SELECT SUM(Returned_Quantity) FROM ReturnRecord WHERE Issue_ID = I.Issue_ID), 0)) as quantity, 
                   I.Issue_Date as issue_date, I.Expected_Return as expected_return
            FROM IssueRecord I
            JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
            JOIN DefenceUnit D ON I.Unit_ID = D.Unit_ID
            HAVING quantity > 0
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/returns', async (req, res) => {
    try {
        const query = `
            SELECT R.Return_ID as id, E.Serial_Number as serial_number, E.Equipment_Name as name, 
                   D.Unit_Name as unit_name, R.Returned_Quantity as quantity, 
                   R.Return_Date as return_date
            FROM ReturnRecord R
            JOIN IssueRecord I ON R.Issue_ID = I.Issue_ID
            JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
            JOIN DefenceUnit D ON I.Unit_ID = D.Unit_ID
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

const returnSchema = z.object({
    issue_id: z.number(),
    quantity: z.number().positive()
});

router.post('/return', requireRole(['Admin', 'Officer']), async (req, res) => {
    try {
        const { issue_id, quantity } = returnSchema.parse(req.body);
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [issue] = await connection.query(
                'SELECT Issued_Quantity, Equipment_ID FROM IssueRecord WHERE Issue_ID = ? FOR UPDATE', 
                [issue_id]
            );
            if (issue.length === 0) throw new Error('Issue record not found');
            
            const [returned] = await connection.query(
                'SELECT COALESCE(SUM(Returned_Quantity), 0) as total FROM ReturnRecord WHERE Issue_ID = ?', 
                [issue_id]
            );
            
            const outstanding = issue[0].Issued_Quantity - returned[0].total;
            if (quantity > outstanding) throw new Error('Return quantity exceeds outstanding issued quantity');

            const [maxIdResult] = await connection.query('SELECT MAX(Return_ID) AS max_id FROM ReturnRecord');
            const newReturnId = (maxIdResult[0].max_id || 0) + 1;

            // Snapshot the target inventory row BEFORE insert so we can correct any trigger side-effects
            const [preRow] = await connection.query(
                'SELECT Inventory_ID, Quantity FROM Inventory WHERE Equipment_ID = ? ORDER BY Quantity ASC LIMIT 1 FOR UPDATE',
                [issue[0].Equipment_ID]
            );
            const preQty   = preRow[0]?.Quantity ?? 0;
            const invRowId = preRow[0]?.Inventory_ID;
            const targetQty = preQty + quantity;  // what quantity SHOULD be after return

            await connection.query(
                'INSERT INTO ReturnRecord (Return_ID, Issue_ID, Return_Date, Returned_Quantity) VALUES (?, ?, NOW(), ?)',
                [newReturnId, issue_id, quantity]
            );

            // After insert, check what actually happened (trigger may or may not have fired)
            const [postRow] = await connection.query(
                'SELECT Quantity FROM Inventory WHERE Inventory_ID = ?',
                [invRowId]
            );
            const postQty = postRow[0]?.Quantity ?? preQty;

            // Force the inventory to the exact correct value regardless of trigger state
            if (postQty !== targetQty) {
                await connection.query(
                    'UPDATE Inventory SET Quantity = ? WHERE Inventory_ID = ?',
                    [targetQty, invRowId]
                );
            }

            await connection.commit();
            
            // Emit event using io object
            if (req.app.get('io')) {
                req.app.get('io').emit('inventoryUpdate');
            }

            res.json({ message: 'Asset returned successfully' });
        } catch (err) {
            await connection.rollback();
            return res.status(400).json({ message: err.message });
        } finally {
            connection.release();
        }
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: err.errors });
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
