import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAuth()
        const { id } = await params
        const clientId = Number.parseInt(id)

        // Check if client has any sales
        const salesCheck = await sql`
      SELECT COUNT(*) as count 
      FROM sales 
      WHERE client_id = ${clientId}
    `

        const salesCount = Number(salesCheck[0].count)
        if (salesCount > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete client with ${salesCount} existing sale${salesCount > 1 ? 's' : ''}. Please delete their sales first.`
                },
                { status: 400 }
            )
        }

        await sql`DELETE FROM clients WHERE id = ${clientId}`
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete client error:", error)
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }
}
