import pool from './config/db.js';

async function updateDB() {

    try {

        console.log('🔄 Syncing Defence Units...\n');

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

        console.log('✅ Defence Units Synced Successfully');

        process.exit(0);

    } catch (error) {

        console.error('❌ Database Sync Failed');
        console.error(error);

        process.exit(1);
    }
}

updateDB();