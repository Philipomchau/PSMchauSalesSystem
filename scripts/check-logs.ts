import { sql } from "../lib/db";

async function checkAuditLogs() {
    console.log("Checking recent audit logs...");
    try {
        const result = await sql`
      SELECT * FROM audit_logs 
      ORDER BY timestamp DESC 
      LIMIT 10
    `;
        console.log("Recent Logs:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
    }
}

checkAuditLogs();
