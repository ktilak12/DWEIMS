import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/authMiddleware.js';
import { requestLogger } from './middleware/loggerMiddleware.js';

import { Server } from 'socket.io';
import { createServer } from 'http';

import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import personnelRoutes from './routes/personnel.js';
import additionalRoutes from './routes/additionalRoutes.js';
import dashboardRoutes from './routes/dashboard.js';

import pool from './config/db.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

/* ---------------- SOCKET.IO ---------------- */

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store io globally
app.set('io', io);

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors());
app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.use('/api/auth', requestLogger, authRoutes);

app.use('/api/inventory', requireAuth, requestLogger, inventoryRoutes);

app.use('/api/personnel', requireAuth, requestLogger, personnelRoutes);

app.use('/api/dashboard', requireAuth, requestLogger, dashboardRoutes);

app.use('/api', requireAuth, requestLogger, additionalRoutes);

/* ---------------- HEALTH CHECK ---------------- */

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'DWEMS Backend Running'
    });
});

/* ---------------- SOCKET CONNECTION ---------------- */

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

/* ---------------- DATABASE TEST ---------------- */

const testDatabaseConnection = async () => {
    try {
        const connection = await pool.getConnection();

        console.log('✅ Connected to Railway MySQL');

        connection.release();

    } catch (error) {

        console.error('❌ Database Connection Failed');
        console.error(error);

        process.exit(1);
    }
};

/* ---------------- INITIAL DATABASE SYNC ---------------- */

const syncDefenceUnits = async () => {
    try {

        await pool.query(`
            INSERT IGNORE INTO DefenceUnit 
            (Unit_ID, Unit_Name, Unit_Type, Location) 
            VALUES
            (1, 'Infantry Unit A', 'Infantry', 'Northern Command'),
            (2, 'Armoured Unit B', 'Armoured', 'Western Command'),
            (3, 'Artillery Unit C', 'Artillery', 'Northern Command'),
            (4, 'Air Defence Unit D', 'Air Defence', 'Western Command')
            ON DUPLICATE KEY UPDATE 
            Unit_Name = VALUES(Unit_Name),
            Unit_Type = VALUES(Unit_Type),
            Location = VALUES(Location);
        `);

        console.log('✅ Defence Units Synced');

    } catch (error) {

        console.error('❌ Defence Unit Sync Failed');
        console.error(error);
    }
};

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 5001;

const startServer = async () => {

    await testDatabaseConnection();

    await syncDefenceUnits();

    httpServer.listen(PORT, () => {
        console.log(`🚀 DWEMS Backend running on port ${PORT}`);
    });
};

startServer();