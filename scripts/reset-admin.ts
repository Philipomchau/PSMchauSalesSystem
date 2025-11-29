import bcrypt from "bcryptjs"
import { sql } from "../lib/db"

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

async function resetAdmin() {
    try {
        const passwordHash = await hashPassword("admin123")

        // Check if admin exists
        const existing = await sql`SELECT * FROM workers WHERE role = 'admin' LIMIT 1`

        if (existing.length > 0) {
            // Update existing admin
            await sql`
        UPDATE workers 
        SET password_hash = ${passwordHash}, email = 'admin@example.com'
        WHERE id = ${existing[0].id}
      `
            console.log("Admin password reset to 'admin123'")
        } else {
            // Create new admin
            await sql`
        INSERT INTO workers (name, email, password_hash, role)
        VALUES ('Admin', 'admin@example.com', ${passwordHash}, 'admin')
      `
            console.log("Created new admin with password 'admin123'")
        }
    } catch (error) {
        console.error("Failed to reset admin:", error)
    }
}

resetAdmin()
