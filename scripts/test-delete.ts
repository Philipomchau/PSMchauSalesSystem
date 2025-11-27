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

async function testDelete() {
    try {
        const { sql } = await import("../lib/db")

        // Check if there are any sales
        const sales = await sql.query(`SELECT id FROM sales LIMIT 1`)
        console.log("Sample sale:", sales[0] || sales)

        if (sales.length === 0 || (Array.isArray(sales) && sales.length === 0)) {
            console.log("No sales to test deletion")
            return
        }

        // Check for foreign key constraints
        const constraints = await sql.query(`
            SELECT
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND ccu.table_name = 'sales'
        `)
        console.log("Foreign key constraints referencing sales:", constraints)

    } catch (error) {
        console.error("Error:", error)
    }
}

testDelete()
