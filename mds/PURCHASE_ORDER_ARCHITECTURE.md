# Purchase Order Management & Batch Traceability Architecture

**Version:** 2.1.0  
**Last Updated:** January 15, 2026

---

## Overview

The Hasal POS system implements Purchase Order management as a unified workflow with integrated batch traceability. This document explains how returns, genealogy tracking, and inventory management are all part of the core Purchase Order functionality—not separate features.

---

## Architectural Model

### Core Concept: Self-Referential Batch Tracking

The `raw_material_batches` table uses a self-referential foreign key (`source_batch_id`) to create relationships between receipt batches and return batches:

```
Receipt Batch (id: 1)
├── Returns to Stock (source_batch_id: 1)
│   ├── Return Reason: "Excess stock"
│   ├── Disposition: "stock" (back to inventory)
│   └── Batch Type: "return"
│
├── Returns to Dispose (source_batch_id: 1)
│   ├── Return Reason: "Quality issue"
│   ├── Disposition: "dispose" (discard)
│   └── Batch Type: "return"
```

### Key Database Fields

**`raw_material_batches` table:**

| Field               | Type                      | Purpose                                                             |
| ------------------- | ------------------------- | ------------------------------------------------------------------- |
| `id`                | INT                       | Unique batch identifier                                             |
| `batch_type`        | ENUM('receipt', 'return') | Distinguishes receipt vs return batches                             |
| `source_batch_id`   | INT (FK)                  | Points to source receipt batch (NULL for receipts, set for returns) |
| `return_reason`     | VARCHAR                   | Why material was returned (e.g., "excess stock", "quality issue")   |
| `disposition`       | ENUM('stock', 'dispose')  | Where returned material goes                                        |
| `inspection_status` | ENUM                      | QC approval workflow                                                |

---

## Purchase Order Workflow with Returns

### Step 1: Create Purchase Order

```
POST /api/purchase-orders
{
  "supplier_id": 1,
  "items": [
    {
      "raw_material_id": 1,
      "quantity": 100,
      "unit_cost": 50
    }
  ]
}
```

**Result:** PO created with status `pending`

---

### Step 2: Receive Items (Partial or Complete)

```
POST /api/purchase-orders/1/receive
{
  "received_items": [
    {
      "raw_material_id": 1,
      "quantity_received": 50,
      "expiry_date": "2027-01-15"
    }
  ]
}
```

**Result:**

- Receipt batch created (batch_type: "receipt")
- Raw material stock increases by 50
- PO status: "partial" (if more to receive)

---

### Step 3: Process Returns (Same Endpoint)

```
POST /api/purchase-orders/1/receive
{
  "return_items": [
    {
      "raw_material_id": 1,
      "quantity_returned": 10,
      "return_reason": "Excess stock",
      "disposition": "stock",
      "source_batch_id": 5  // Links to receipt batch
    }
  ]
}
```

**Result:**

- Return batch created (batch_type: "return")
- source_batch_id: 5 (points back to receipt batch)
- Stock adjustment based on disposition:
  - If "stock": Raw material stock decreases by 10
  - If "dispose": Material removed from system

---

### Step 4: Query Batch Genealogy

```
GET /api/batches/5/genealogy
```

**Response:**

```json
{
  "receipt_batch": {
    "id": 5,
    "batch_number": "RM-MAT001-20260115-001",
    "quantity": 50,
    "batch_type": "receipt"
  },
  "returns": [
    {
      "id": 6,
      "batch_number": "RM-MAT001-20260115-001-RET",
      "quantity": 10,
      "return_reason": "Excess stock",
      "disposition": "stock",
      "batch_type": "return"
    }
  ],
  "summary": {
    "total_received": 50,
    "total_returned": 10,
    "net_available": 40
  }
}
```

**Shows:** All returns from a specific receipt batch

---

### Step 5: Trace Return Origin

```
GET /api/batches/6/origin
```

**Response:**

```json
{
  "return_batch": {
    "id": 6,
    "batch_number": "RM-MAT001-20260115-001-RET",
    "quantity": 10,
    "return_reason": "Excess stock"
  },
  "source_batch": {
    "id": 5,
    "batch_number": "RM-MAT001-20260115-001",
    "quantity": 50
  }
}
```

**Shows:** Where a return batch came from

---

### Step 6: Material Returns Summary

```
GET /api/batches/materials/1/returns-summary
```

**Response:**

```json
{
  "material_id": 1,
  "material_name": "Cinnamon",
  "totals": {
    "total_received": 150, // Sum of all receipts
    "total_returned": 25, // Sum of all returns
    "net_available": 125 // Net inventory
  }
}
```

**Shows:** Material-level inventory reporting

---

## API Endpoints Summary

### Purchase Order Management

| Endpoint                                | Method | Purpose                          |
| --------------------------------------- | ------ | -------------------------------- |
| `/api/purchase-orders`                  | POST   | Create PO                        |
| `/api/purchase-orders/:id`              | GET    | Get PO details                   |
| `/api/purchase-orders/:id/receive`      | POST   | Receive items OR process returns |
| `/api/purchase-orders/:id/cancel`       | PATCH  | Cancel pending PO                |
| `/api/raw-material-batches/:id/inspect` | PATCH  | QC inspection/approval           |

### Batch Traceability Queries (Read-Only)

| Endpoint                                             | Method | Purpose                            |
| ---------------------------------------------------- | ------ | ---------------------------------- |
| `/api/batches/:id/genealogy`                         | GET    | Get all returns from receipt batch |
| `/api/batches/:id/origin`                            | GET    | Trace return to source receipt     |
| `/api/batches/materials/:materialId/returns-summary` | GET    | Material-level inventory summary   |

---

## Business Logic: Inventory Management

### When Receiving Items

```
raw_material_stock += received_quantity
batch_type = 'receipt'
source_batch_id = NULL
```

### When Returning to Stock

```
raw_material_stock -= returned_quantity
batch_type = 'return'
source_batch_id = <receipt_batch_id>
disposition = 'stock'
```

### When Returning to Dispose

```
raw_material_stock -= returned_quantity  (if it was in stock)
batch_type = 'return'
source_batch_id = <receipt_batch_id>
disposition = 'dispose'
```

---

## QC Workflow

All batches (receipt & return) support inspection:

```
1. Batch created → inspection_status: 'pending'
2. QC review performed
3. PATCH /api/raw-material-batches/:id/inspect
{
  "inspection_status": "approved",
  "accepted_quantity": 45,
  "inspection_notes": "Minor damage on 5 units"
}
4. Batch approved → inspection_status: 'approved'
```

---

## Return Dispositions

### Stock Disposition

- Material is accepted and returned to inventory
- Stock increased: `stock += quantity`
- Use case: Excess received, outlet return, quality acceptable

### Dispose Disposition

- Material is rejected and removed from system
- Stock remains unchanged
- Material not added to inventory
- Use case: Damaged, expired, quality failed

---

## Database Design: Why Self-Referential?

### Advantages of Self-Referential Design

1. **Single Table** - No separate return_batches table needed
2. **Genealogy Tracking** - Easy to query all returns: `WHERE source_batch_id = 5`
3. **Hierarchy Support** - Could support multi-level returns (returns of returns)
4. **Consistency** - Same model handles both receipt and return scenarios
5. **Flexibility** - Easy to add business logic (return reason, disposition)

### Example Query: Batch Genealogy

```sql
SELECT
  rb.id,
  rb.batch_number,
  rb.batch_type,
  rb.quantity,
  rb.return_reason,
  rb.disposition
FROM raw_material_batches rb
WHERE rb.source_batch_id = 5
  OR rb.id = 5
ORDER BY rb.batch_type DESC, rb.created_at;
```

---

## Implementation Status

### ✅ Completed

- Receipt batch creation on PO receive
- Return batch creation with source_batch_id linking
- Batch genealogy query (all returns from receipt)
- Return origin query (source of return)
- Material returns summary (totals)
- Inventory updates (stock/dispose dispositions)
- QC inspection workflow (pending/approved/rejected)
- Batch number generation (unique, timestamp-based)

### 🧪 Testing

- 12/12 comprehensive tests passing
- All workflows validated
- Edge cases handled (null source_batch_id, invalid dispositions)

### 📚 Documentation

- Postman collection (functional grouping)
- Swagger API spec (2.1.0)
- API Testing README (workflow examples)
- This architecture document

---

## Integration with Other Modules

### Production Module

- Uses receipt batches (source_batch_id = NULL)
- FIFO batch selection for material consumption
- Tracks which batches used in which production runs

### Sales Module

- Links to invoice line items
- Does not directly interact with returns
- Inventory adjustments handled by PO module

### Reporting

- Material returns summary for inventory reporting
- Batch genealogy for audit trails
- Disposition tracking for accounting

---

## Future Enhancements

1. **Multi-Level Returns** - Return of returned materials
   - Chain: Receipt → Return-1 → Return-2 (source_batch_id: Return-1.id)

2. **Return Authorization** - Workflow approval before accepting return

3. **Cost Allocation** - Track cost impact of returns

4. **Supplier Management** - Credit notes for returned materials

5. **Batch Aging** - Track age of returned materials

---

## Why Not Separate "Phases"?

The original project planning used "Phase 1" and "Phase 2" terminology to organize delivery milestones. However, the implementation reveals that:

1. **Returns are integral to PO workflow** - Not a separate feature
2. **Single receive endpoint** - Handles both receipts and returns
3. **Unified data model** - Returns use the same batch table
4. **Atomic transactions** - Receipt and return are part of same PO lifecycle
5. **Business requirement** - Material tracking (genealogy/origin) is essential for compliance

Therefore, the system architecture reflects **unified Purchase Order management** with integrated traceability—not separate phases.

---

**End of Architecture Document**
