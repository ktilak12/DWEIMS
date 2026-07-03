import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { z } from 'zod';

const router = express.Router();

const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = loginSchema.parse(req.body);
        
        const [rows] = await pool.query('SELECT * FROM AuthorizedPersonnel WHERE Username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.Personnel_ID, username: user.Username, role: user.Role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '12h' }
        );
        
        res.json({ token, user: { id: user.Personnel_ID, username: user.Username, role: user.Role } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: err.errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
