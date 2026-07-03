import pool from './config/db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
    try {
        console.log("Starting database migration...");

        // 1. Recreate AuditLog table to match production requirements
        await pool.query(`DROP TABLE IF EXISTS AuditLog;`);
        await pool.query(`
            CREATE TABLE AuditLog (
                Audit_ID INT AUTO_INCREMENT PRIMARY KEY,
                Action_Type VARCHAR(50),
                User_ID INT,
                Equipment_ID INT,
                Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                Remarks VARCHAR(100),
                FOREIGN KEY (User_ID) REFERENCES AuthorizedPersonnel(Personnel_ID),
                FOREIGN KEY (Equipment_ID) REFERENCES Equipment(Equipment_ID)
            );
        `);
        console.log("AuditLog table recreated.");

        // 2. Standardize Roles in AuthorizedPersonnel
        await pool.query(`UPDATE AuthorizedPersonnel SET Role = 'Admin' WHERE Personnel_ID = 1;`);
        await pool.query(`UPDATE AuthorizedPersonnel SET Role = 'Officer' WHERE Personnel_ID = 2;`);
        console.log("Roles updated.");

        // 3. Add sample data for Procurement
        // Check if Procurement table has data
        const [procRows] = await pool.query("SELECT COUNT(*) as count FROM Procurement");
        if (procRows[0].count < 5) {
            await pool.query(`
                INSERT IGNORE INTO Procurement (Procurement_ID, Equipment_ID, Supplier_ID, Purchase_Date, Quantity) VALUES
                (11, 1, 1, '2026-04-01', 100),
                (12, 2, 2, '2026-04-05', 50),
                (13, 3, 3, '2026-04-10', 30),
                (14, 4, 1, '2026-04-12', 200),
                (15, 5, 2, '2026-04-15', 80);
            `);
            console.log("Sample procurement data added.");
        }

        // 4. Add sample data for AuditLog
        await pool.query(`
            INSERT INTO AuditLog (Action_Type, User_ID, Equipment_ID, Remarks) VALUES
            ('Issue', 1, 1, 'Standard issue to unit A'),
            ('Return', 1, 2, 'Returned after maintenance'),
            ('Update', 2, 3, 'Inventory stock correction'),
            ('Issue', 2, 1, 'Emergency dispatch'),
            ('Procurement', 1, 2, 'New stock addition');
        `);
        console.log("Sample audit logs added.");

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
