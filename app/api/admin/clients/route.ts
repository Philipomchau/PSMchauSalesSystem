import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        await requireAuth()
        const clients = await sql`SELECT * FROM clients ORDER BY name ASC`
        return NextResponse.json(clients)
    } catch (error) {
        console.error("Get clients error:", error)
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAuth()
        const body = await request.json()

        // Handle both single client and array of clients
        let clientsArray: any[]
        if (body.clients && Array.isArray(body.clients)) {
            clientsArray = body.clients
        } else if (body.name) {
            // Single client from manual form
            clientsArray = [{ name: body.name, phone: body.phone, email: body.email }]
        } else {
            return NextResponse.json({ error: "Invalid client data" }, { status: 400 })
        }

        if (clientsArray.length === 0) {
            return NextResponse.json({ error: "No clients provided" }, { status: 400 })
        }

        const results = await Promise.all(
            clientsArray.map((client: any) =>
                sql`
          INSERT INTO clients (name, phone, email)
          VALUES (${client.name}, ${client.phone || null}, ${client.email || null})
          ON CONFLICT DO NOTHING
          RETURNING id, name, phone, email
        `
            )
        )

        // Return single client or count based on input
        if (body.name) {
            return NextResponse.json(results[0][0], { status: 201 })
        }
        return NextResponse.json({ count: results.length }, { status: 201 })
    } catch (error) {
        console.error("Create clients error:", error)
        return NextResponse.json({ error: "Failed to create clients" }, { status: 500 })
    }
}
