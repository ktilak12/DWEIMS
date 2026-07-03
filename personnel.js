import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // We map DefenceUnit concepts to the pre-existing personnel variables
        // to minimize massive frontend refactoring just for a single form dropdown.
        const [rows] = await pool.query('SELECT Unit_ID as id, Unit_Name as username, Unit_Type as role, Location as location FROM DefenceUnit');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
