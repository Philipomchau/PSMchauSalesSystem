import { sql } from "../lib/db";
import { logAudit } from "../lib/audit";

async function testCreateSale() {
    console.log("Testing Sale Creation...");

    // Mock data
    const saleData = {
        workerId: 1, // Assuming admin exists with ID 1
        productName: "Test Product",
        quantity: 10,
        unitPrice: 1000,
        totalAmount: 10000,
        notes: "Test Sale",
        unitType: "piece",
        clientId: null,
        saleDate: new Date().toISOString()
    };

    try {
        // 1. Insert Sale
        console.log("Inserting sale...");
        const result = await sql`
      INSERT INTO sales (
        worker_id, 
        product_name, 
        quantity, 
        unit_price, 
        total_amount, 
        notes,
        unit_type,
        client_id,
        sale_datetime
      )
      VALUES (
        ${saleData.workerId}, 
        ${saleData.productName}, 
        ${saleData.quantity}, 
        ${saleData.unitPrice}, 
        ${saleData.totalAmount}, 
        ${saleData.notes},
        ${saleData.unitType},
        ${saleData.clientId},
        ${saleData.saleDate}
      )
      RETURNING *
    `;
        const sale = result[0];
        console.log("Sale inserted:", sale.id);

        // 2. Log Audit (This was a previous failure point)
        console.log("Logging audit...");
        await logAudit(saleData.workerId, "CREATE_SALE", sale.id, null, sale);
        console.log("Audit logged.");

        console.log("Sale creation test PASSED.");
    } catch (error) {
        console.error("Sale creation test FAILED:", error);
    }
}

testCreateSale();
