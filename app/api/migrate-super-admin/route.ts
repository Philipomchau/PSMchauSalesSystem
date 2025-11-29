import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
    try {
        // Step 1: Update the specific admin to super_admin
        const result = await sql`
      UPDATE workers 
      SET role = 'super_admin'
      WHERE email = 'philipomchau1@gmail.com'
      RETURNING id, name, email, role
    `

        if (result.length === 0) {
            return NextResponse.json({
                error: "Admin user not found",
                details: "No user with email philipomchau1@gmail.com was found"
            }, { status: 404 })
        }

        // Step 2: Return success
        const user = result[0]

        return NextResponse.json({
            message: "Migration completed successfully",
            details: `User ${user.name} (${user.email}) has been promoted to super_admin`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error("Migration error:", error)
        return NextResponse.json({
            error: "Migration failed",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
