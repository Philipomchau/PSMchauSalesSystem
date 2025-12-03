import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
    try {
        const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sales' AND column_name = 'quantity'
    `
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
