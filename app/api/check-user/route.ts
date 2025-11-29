import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
    try {
        const result = await sql`
      SELECT id, name, email, role, active
      FROM workers 
      WHERE email = 'philipomchau1@gmail.com'
    `

        if (result.length === 0) {
            return NextResponse.json({
                error: "User not found",
                details: "No user with email philipomchau1@gmail.com exists in the database"
            }, { status: 404 })
        }

        return NextResponse.json({
            message: "User found",
            user: result[0]
        })
    } catch (error) {
        console.error("Check user error:", error)
        return NextResponse.json({
            error: "Failed to check user",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
