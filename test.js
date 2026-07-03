import pool from './config/db.js';

async function test() {

    try {

        console.log('🔍 Testing Railway Database Connection...\n');

        /* ---------------- ACTIVE ISSUED ASSETS ---------------- */

        const [issuedResult] = await pool.query(`
            SELECT 
                GREATEST(
                    IFNULL(SUM(I.Issued_Quantity), 0) -
                    IFNULL((
                        SELECT SUM(R.Returned_Quantity)
                        FROM ReturnRecord R
                    ), 0),
                    0
                ) AS active_issued_assets
            FROM IssueRecord I;
        `);

        console.log('✅ Active Issued Assets:');

        console.table(issuedResult);

        /* ---------------- ISSUE RECORDS ---------------- */

        const [issueRecords] = await pool.query(`
            SELECT 
                Issue_ID,
                Equipment_ID,
                Unit_ID,
                Issued_Quantity,
                Issue_Date,
                Expected_Return
            FROM IssueRecord
            ORDER BY Issue_Date DESC;
        `);

        console.log('\n✅ Issue Records Count:', issueRecords.length);

        console.table(issueRecords);

        /* ---------------- RETURN RECORDS ---------------- */

        const [returnRecords] = await pool.query(`
            SELECT *
            FROM ReturnRecord
            ORDER BY Return_Date DESC;
        `);

        console.log('\n✅ Return Records Count:', returnRecords.length);

        console.table(returnRecords);

        console.log('\n🎉 Database Test Completed Successfully');

        process.exit(0);

    } catch (error) {

        console.error('\n❌ Database Test Failed');

        console.error(error);

        process.exit(1);
    }
}

test();