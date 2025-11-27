import fs from 'fs'
import path from 'path'

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const splitIndex = line.indexOf('=')
        if (splitIndex > 0) {
            const key = line.substring(0, splitIndex).trim()
            let value = line.substring(splitIndex + 1).trim()
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            process.env[key] = value
        }
    })
}

async function testToday() {
    try {
        const { sql } = await import("../lib/db")

        const today = new Date().toLocaleDateString('en-CA')
        console.log("Today (local):", today)
        console.log("Today (ISO):", new Date().toISOString())

        // Test the query that the export uses
        const salesParams = new URLSearchParams()
        salesParams.set("startDate", new Date(today).toISOString())
        salesParams.set("endDate", new Date(today).toISOString())

        console.log("Start Date ISO:", new Date(today).toISOString())
        console.log("End Date ISO:", new Date(today).toISOString())

        const query = `
            SELECT COUNT(*) as count, MIN(sale_datetime) as first_sale, MAX(sale_datetime) as last_sale
            FROM sales
            WHERE sale_datetime >= $1 AND sale_datetime <= $2
        `

        const result = await sql.query(query, [
            new Date(today).toISOString(),
            new Date(today).toISOString()
        ])

        console.log("Sales found with ISO dates:", result[0] || result)

        // Also test with the date range that should work
        const startOfDay = new Date(today)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(today)
        endOfDay.setHours(23, 59, 59, 999)

        console.log("\nStart of day:", startOfDay.toISOString())
        console.log("End of day:", endOfDay.toISOString())

        const result2 = await sql.query(query, [
            startOfDay.toISOString(),
            endOfDay.toISOString()
        ])

        console.log("Sales found with full day range:", result2[0] || result2)

    } catch (error) {
        console.error("Error:", error)
    }
}

testToday()
