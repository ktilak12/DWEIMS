import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/metrics', async (req, res) => {
    try {
        // 1. Assets Taken
        const [takenResult] = await pool.query(`
            SELECT 
                GREATEST(
                    IFNULL((SELECT SUM(Issued_Quantity) FROM IssueRecord), 0) - 
                    IFNULL((SELECT SUM(Returned_Quantity) FROM ReturnRecord), 0),
                    0
                ) AS assets_taken
        `);
        const taken = Number(takenResult[0].assets_taken) || 0;

        // 2. Red Flags (Overdue Returns + Low Stock Items)
        const [redFlagsResult] = await pool.query(`
            SELECT 
                (
                    (SELECT COUNT(*) FROM IssueRecord WHERE Expected_Return < NOW())
                    +
                    (SELECT COUNT(DISTINCT Equipment_ID) FROM Inventory WHERE Quantity < 15)
                ) AS red_flags
        `);
        const redFlags = Number(redFlagsResult[0].red_flags) || 0;

        // 3. In Maintenance (Unique equipment items)
        const [maintenanceResult] = await pool.query(`
            SELECT COUNT(DISTINCT Equipment_ID) AS maintenance
            FROM Equipment 
            WHERE Status = 'Under Maintenance'
        `);
        const maintenance = Number(maintenanceResult[0].maintenance) || 0;

        // 4. Remaining Assets
        const [remainingResult] = await pool.query(`
            SELECT IFNULL(SUM(Quantity), 0) AS remaining 
            FROM Inventory
        `);
        const remaining = Number(remainingResult[0].remaining) || 0;

        res.json({
            remaining,
            taken,
            maintenance,
            redFlags
        });

    } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
