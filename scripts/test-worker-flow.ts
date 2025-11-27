import { sql } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/auth";

async function testWorkerFlow() {
    console.log("Testing Worker Creation and Login Flow...");

    const testEmail = `testworker_${Date.now()}@example.com`;
    const testPassword = "password123";

    try {
        // 1. Create Worker (Simulate API logic)
        console.log(`Creating worker: ${testEmail}`);
        const passwordHash = await hashPassword(testPassword);

        const createResult = await sql`
      INSERT INTO workers (name, email, password_hash, role)
      VALUES ('Test Worker', ${testEmail}, ${passwordHash}, 'worker')
      RETURNING *
    `;
        const worker = createResult[0];
        console.log("Worker created:", worker.id);

        // 2. Verify Password (Simulate Login logic)
        console.log("Verifying password...");

        // Fetch worker by email
        const fetchResult = await sql`
      SELECT * FROM workers WHERE email = ${testEmail}
    `;

        if (fetchResult.length === 0) {
            throw new Error("Worker not found after creation!");
        }

        const fetchedWorker = fetchResult[0];
        console.log("Fetched worker hash:", fetchedWorker.password_hash);

        const isValid = await verifyPassword(testPassword, fetchedWorker.password_hash);

        if (isValid) {
            console.log("SUCCESS: Password verified correctly.");
        } else {
            console.error("FAILURE: Password verification FAILED.");
            console.log("Input Password:", testPassword);
            console.log("Stored Hash:", fetchedWorker.password_hash);
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testWorkerFlow();
