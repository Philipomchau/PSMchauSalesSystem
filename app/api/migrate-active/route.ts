import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
    try {
        // Add active column if it doesn't exist
        await sql`
      ALTER TABLE workers 
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE
    `

        // Update existing workers to have active = true if NULL
        await sql`
      UPDATE workers 
      SET active = true 
      WHERE active IS NULL
    `

        return NextResponse.json({
            message: "Migration completed successfully",
            details: "Added active column to workers table and set existing workers to active"
        })
    } catch (error) {
        console.error("Migration error:", error)
        return NextResponse.json({
            error: "Migration failed",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
