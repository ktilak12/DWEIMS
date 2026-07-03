import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// 1. PROCUREMENT DATA
router.get('/procurement', async (req, res) => {
    try {
        const query = `
            SELECT 
                E.Equipment_Name, 
                S.Supplier_Name, 
                P.Quantity, 
                P.Purchase_Date as Procurement_Date
            FROM Procurement P
            JOIN Equipment E ON P.Equipment_ID = E.Equipment_ID
            JOIN Supplier S ON P.Supplier_ID = S.Supplier_ID;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 2. SUPPLIER DATA
router.get('/suppliers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Supplier');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 3. AUDIT LOGS
router.get('/audit', async (req, res) => {
    try {
        const query = `
            SELECT 
                'Audit' AS Action_Type, 
                A.Audit_Date AS Timestamp, 
                'System' AS Username, 
                E.Equipment_Name AS Equipment_Name
            FROM AuditLog A
            JOIN Inventory I ON A.Inventory_ID = I.Inventory_ID
            JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
            
            UNION ALL
            
            SELECT 
                'Issue' AS Action_Type,
                IR.Issue_Date AS Timestamp,
                D.Unit_Name AS Username,
                E.Equipment_Name AS Equipment_Name
            FROM IssueRecord IR
            JOIN Equipment E ON IR.Equipment_ID = E.Equipment_ID
            JOIN DefenceUnit D ON IR.Unit_ID = D.Unit_ID
            
            UNION ALL
            
            SELECT 
                'Return' AS Action_Type,
                RR.Return_Date AS Timestamp,
                D.Unit_Name AS Username,
                E.Equipment_Name AS Equipment_Name
            FROM ReturnRecord RR
            JOIN IssueRecord IR ON RR.Issue_ID = IR.Issue_ID
            JOIN Equipment E ON IR.Equipment_ID = E.Equipment_ID
            JOIN DefenceUnit D ON IR.Unit_ID = D.Unit_ID
            
            ORDER BY Timestamp DESC;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// 4. ISSUES (FIXED)
router.get('/issues', async (req, res) => {
    try {
        const query = `
            SELECT 
                I.Issue_ID as id,
                E.Serial_Number as serial_number, 
                E.Equipment_Name as name, 
                D.Unit_Name as unit_name, 
                (I.Issued_Quantity - COALESCE((SELECT SUM(Returned_Quantity) FROM ReturnRecord WHERE Issue_ID = I.Issue_ID), 0)) as quantity, 
                I.Issue_Date as issue_date, 
                I.Expected_Return as expected_return
            FROM IssueRecord I
            JOIN Equipment E ON I.Equipment_ID = E.Equipment_ID
            JOIN DefenceUnit D ON I.Unit_ID = D.Unit_ID
            HAVING quantity > 0;
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
