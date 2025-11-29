import { sql } from "@/lib/db"

async function migrate() {
    try {
        // Add active column if it doesn't exist
        await sql`
      ALTER TABLE workers 
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE
    `
        console.log("Added active column to workers table")
    } catch (error) {
        console.error("Migration failed:", error)
    }
}

migrate()
