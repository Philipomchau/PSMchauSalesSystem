import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
    try {
        // Alter the quantity column to be DECIMAL(10, 2) to support up to 2 decimal places
        const result = await sql`
      ALTER TABLE sales 
      ALTER COLUMN quantity TYPE DECIMAL(10, 2);
    `

        return NextResponse.json({ success: true, message: "Migration successful: quantity changed to DECIMAL", result })
    } catch (error) {
        console.error("Migration error:", error)
        return NextResponse.json({
            error: "Migration failed",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
