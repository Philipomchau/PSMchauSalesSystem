import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
    try {
        // Step 1: Drop the old constraint
        await sql`
      ALTER TABLE workers 
      DROP CONSTRAINT IF EXISTS workers_role_check
    `

        // Step 2: Add new constraint with super_admin
        await sql`
      ALTER TABLE workers 
      ADD CONSTRAINT workers_role_check 
      CHECK (role IN ('worker', 'admin', 'super_admin'))
    `

        return NextResponse.json({
            message: "Database constraint updated successfully",
            details: "The workers table now accepts 'worker', 'admin', and 'super_admin' roles"
        })
    } catch (error) {
        console.error("Constraint update error:", error)
        return NextResponse.json({
            error: "Failed to update constraint",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
