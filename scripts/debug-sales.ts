import fs from 'fs'
import path from 'path'

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env')
console.log("CWD:", process.cwd())
console.log("Env Path:", envPath)

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    console.log("Env Content Length:", envConfig.length)

    envConfig.split('\n').forEach(line => {
        const splitIndex = line.indexOf('=')
        if (splitIndex > 0) {
            const key = line.substring(0, splitIndex).trim()
            let value = line.substring(splitIndex + 1).trim()
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            process.env[key] = value
        }
    })
} else {
    console.error("Env file not found!")
}

console.log("DATABASE_URL set:", !!process.env.DATABASE_URL)
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing!")
    process.exit(1)
}

async function checkSales() {
    try {
        // Dynamic import after env is loaded
        const { sql } = await import("../lib/db")

        console.log("Checking recent sales...")
        const result = await sql.query(`
            SELECT id, sale_datetime, sale_datetime AT TIME ZONE 'Africa/Dar_es_Salaam' as local_time 
            FROM sales 
            ORDER BY sale_datetime DESC 
            LIMIT 5
        `)
        // Handle potential result structure differences
        const rows = Array.isArray(result) ? result : (result as any).rows || []
        console.log("Recent Sales:", JSON.stringify(rows, null, 2))

        const today = new Date().toLocaleDateString('en-CA') // Local YYYY-MM-DD
        console.log("Checking for date:", today)

        const query = `
            SELECT s.*, w.name as worker_name
            FROM sales s
            JOIN workers w ON s.worker_id = w.id
            WHERE DATE(s.sale_datetime AT TIME ZONE 'Africa/Dar_es_Salaam') = $1
        `
        const dailyResult = await sql.query(query, [today])
        const dailyRows = Array.isArray(dailyResult) ? dailyResult : (dailyResult as any).rows || []
        console.log("Sales found for today (query test):", dailyRows.length)

    } catch (error) {
        console.error("Error:", error)
    }
}

checkSales()
