# Week 4 Testing Plan - Purchase Orders & Inventory Receipt

**Module:** Purchase Order Management, Batch Tracking & Returns  
**Test Date:** TBD  
**Tester:** [Your Name]  
**Status:** ⏳ Pending

---

## 📋 Pre-Testing Checklist

- [ ] Backend server running
- [ ] Frontend dev server running
- [ ] Database has suppliers and raw materials
- [ ] User logged in
- [ ] Purchase Orders menu accessible

---

## 🔧 Purchase Order Backend Testing

### PB-01: GET /api/purchase-orders - List All POs

**Objective:** Test fetching all purchase orders with pagination

**Test Steps:**

1. GET `/api/purchase-orders?page=1&limit=10`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Response includes purchase orders array
- ✅ Each PO includes supplier details and items
- ✅ Pagination metadata present
- ✅ POs sorted by creation date (newest first)

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-02: GET /api/purchase-orders - Filter by Status

**Objective:** Test status filtering

**Test Steps:**

1. GET `/api/purchase-orders?status=pending`
2. GET `/api/purchase-orders?status=approved`
3. GET `/api/purchase-orders?status=received`

**Expected Results:**

- ✅ Returns only POs matching status
- ✅ Valid statuses: pending, approved, received, cancelled

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-03: GET /api/purchase-orders - Filter by Supplier

**Objective:** Test supplier filtering

**Test Steps:**

1. GET `/api/purchase-orders?supplier_id=1`

**Expected Results:**

- ✅ Returns only POs for specified supplier
- ✅ Supplier details included

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-04: GET /api/purchase-orders - Date Range Filter

**Objective:** Test filtering by date range

**Test Steps:**

1. GET `/api/purchase-orders?start_date=2025-01-01&end_date=2025-12-31`

**Expected Results:**

- ✅ Returns POs within date range
- ✅ Date comparison on order_date field

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-05: GET /api/purchase-orders/:id - Get Single PO

**Objective:** Test fetching PO by ID with full details

**Test Steps:**

1. GET `/api/purchase-orders/1`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Returns complete PO object
- ✅ Includes supplier details
- ✅ Includes items array with material details
- ✅ Each item has material_code, name, quantity, unit_cost, total_cost

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-06: POST /api/purchase-orders - Create PO

**Objective:** Test creating new purchase order

**Test Steps:**

1. POST `/api/purchase-orders`
2. Body:

```json
{
  "supplier_id": 1,
  "order_date": "2025-12-19",
  "expected_delivery_date": "2025-12-26",
  "notes": "Urgent order",
  "items": [
    {
      "material_id": 1,
      "quantity": 100,
      "unit_cost": 850.0
    },
    {
      "material_id": 2,
      "quantity": 50,
      "unit_cost": 1200.0
    }
  ]
}
```

**Expected Results:**

- ✅ Status: 201 Created
- ✅ PO number auto-generated (PO-20251219-001 format)
- ✅ Status set to 'pending'
- ✅ Total amount calculated correctly (100×850 + 50×1200 = 145,000)
- ✅ Items created and linked to PO
- ✅ Returns complete PO with items

**SQL Verification:**

```sql
SELECT * FROM purchase_orders ORDER BY id DESC LIMIT 1;
SELECT * FROM po_items WHERE po_id = (SELECT MAX(id) FROM purchase_orders);
SELECT SUM(quantity * unit_cost) AS total FROM po_items WHERE po_id = ?;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-07: POST /api/purchase-orders - Validation Errors

**Objective:** Test validation

**Test Steps:**

1. POST without supplier_id
2. POST without items array
3. POST with empty items array
4. POST with negative quantity

**Expected Results:**

- ✅ Status: 400 Bad Request for each case
- ✅ Appropriate validation error messages

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-08: PUT /api/purchase-orders/:id - Update PO (Pending Only)

**Objective:** Test updating pending purchase order

**Test Steps:**

1. Create PO with status 'pending'
2. PUT `/api/purchase-orders/<id>`
3. Update items and expected_delivery_date

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Only pending POs can be updated
- ✅ Items updated successfully
- ✅ Total amount recalculated

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-09: PUT /api/purchase-orders/:id - Cannot Update Non-Pending

**Objective:** Test update restriction

**Test Steps:**

1. Create PO and set status to 'approved'
2. Try to update PO

**Expected Results:**

- ✅ Status: 400 Bad Request
- ✅ Error: "Cannot update PO that is not pending"

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-10: PUT /api/purchase-orders/:id/status - Update Status

**Objective:** Test status update endpoint

**Test Steps:**

1. PUT `/api/purchase-orders/:id/status`
2. Body: `{ "status": "approved" }`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Status updated in database
- ✅ Valid transitions only (pending → approved → received)

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-11: DELETE /api/purchase-orders/:id - Delete Pending PO

**Objective:** Test deleting pending PO

**Test Steps:**

1. Create pending PO
2. DELETE `/api/purchase-orders/<id>`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Only pending POs can be deleted
- ✅ PO and items removed from database

**SQL Verification:**

```sql
SELECT * FROM purchase_orders WHERE id = <id>;
SELECT * FROM po_items WHERE po_id = <id>;
-- Both should return 0 rows
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-12: POST /api/purchase-orders/:id/receive - Receive PO (Normal Receipt)

**Objective:** Test receiving purchase order without returns

**Test Steps:**

1. Create PO with 2 items
2. Update status to 'approved'
3. POST `/api/purchase-orders/:id/receive`
4. Body:

```json
{
  "received_date": "2025-12-19",
  "receive_items": [
    {
      "material_id": 1,
      "quantity": 100,
      "expiry_date": "2026-12-31"
    },
    {
      "material_id": 2,
      "quantity": 50,
      "expiry_date": "2026-06-30"
    }
  ]
}
```

**Expected Results:**

- ✅ Status: 200 OK
- ✅ PO status changed to 'received'
- ✅ Batches created for each item
- ✅ Batch numbers auto-generated (RM-MAT001-20251219-001 format)
- ✅ batch_type = 'receipt'
- ✅ Raw material stock levels updated (increased)
- ✅ Supplier balance increased by total amount

**SQL Verification:**

```sql
-- Check PO status
SELECT status, received_date FROM purchase_orders WHERE id = ?;

-- Check batches created
SELECT batch_number, material_id, batch_type, initial_quantity, current_quantity, expiry_date
FROM raw_material_batches WHERE purchase_order_id = ?;

-- Check stock update
SELECT current_stock FROM raw_materials WHERE id IN (1, 2);

-- Check supplier balance
SELECT balance FROM suppliers WHERE id = ?;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-13: POST /api/purchase-orders/:id/receive - With Returns (Stock Disposition)

**Objective:** Test receiving PO with returns that go back to stock

**Test Steps:**

1. Create and approve PO
2. POST `/api/purchase-orders/:id/receive`
3. Body:

```json
{
  "received_date": "2025-12-19",
  "receive_items": [
    {
      "material_id": 1,
      "quantity": 100,
      "expiry_date": "2026-12-31"
    }
  ],
  "return_items": [
    {
      "material_id": 1,
      "quantity": 10,
      "return_reason": "damaged",
      "return_disposition": "stock",
      "expiry_date": "2026-12-31"
    }
  ]
}
```

**Expected Results:**

- ✅ Receipt batch created (quantity: 100, batch_type: 'receipt')
- ✅ Return batch created (quantity: -10, batch_type: 'return')
- ✅ return_reason = 'damaged'
- ✅ return_disposition = 'stock'
- ✅ Stock increased by net amount (100 - 10 = 90)
- ✅ Supplier balance = PO total - (10 × unit_cost)

**SQL Verification:**

```sql
-- Check both batches
SELECT batch_number, batch_type, initial_quantity, return_reason, return_disposition
FROM raw_material_batches WHERE purchase_order_id = ?
ORDER BY batch_type;

-- Check net stock increase
SELECT current_stock FROM raw_materials WHERE id = 1;
-- Should increase by 90, not 100
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-14: POST /api/purchase-orders/:id/receive - With Returns (Dispose Disposition)

**Objective:** Test returns that are disposed (don't return to stock)

**Test Steps:**

1. POST receive with return_disposition = 'dispose'

**Expected Results:**

- ✅ Return batch created (quantity: -10)
- ✅ return_disposition = 'dispose'
- ✅ Stock increased by full receipt amount (not reduced by return)
- ✅ Supplier balance still reduced by return amount

**SQL Verification:**

```sql
-- Check disposition
SELECT return_disposition FROM raw_material_batches
WHERE purchase_order_id = ? AND batch_type = 'return';

-- Stock should increase by full receive amount
SELECT current_stock FROM raw_materials WHERE id = ?;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-15: Batch Number Generation - Sequential

**Objective:** Test batch number increments correctly

**Test Steps:**

1. Receive multiple POs on same day for same material
2. Check batch numbers

**Expected Results:**

- ✅ Format: RM-{MATERIAL_CODE}-{YYYYMMDD}-{SEQ}
- ✅ Sequence increments: 001, 002, 003, etc.
- ✅ Sequence resets daily
- ✅ Each material has separate sequence

**SQL Verification:**

```sql
SELECT batch_number, material_id, created_at
FROM raw_material_batches
WHERE material_id = 1
ORDER BY created_at DESC LIMIT 5;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-16: Batch Number Generation - Return Batches

**Objective:** Verify return batches get unique batch numbers

**Test Steps:**

1. Receive PO with returns
2. Check return batch numbers

**Expected Results:**

- ✅ Return batches have unique batch numbers
- ✅ Follow same format as receipt batches
- ✅ Increment in same sequence

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-17: POST /api/purchase-orders/:id/receive - Multiple Partial Receives (Phase 2)

**Objective:** Test receiving items in multiple transactions - supplier delivers in 3 shipments

**Test Steps:**

1. Create PO with 3 items (RM001: 100kg, RM002: 50kg, RM003: 30kg)
2. First receive call: receive only RM001 (100kg)
3. POST `/api/purchase-orders/:id/receive`

```json
{
  "received_date": "2025-12-20",
  "received_items": [
    {
      "material_id": 1,
      "quantity_received": 100,
      "expiry_date": "2026-12-31"
    }
  ]
}
```

4. Verify PO status = "partial"
5. Second receive call: receive RM002 (50kg)
6. POST `/api/purchase-orders/:id/receive`

```json
{
  "received_date": "2025-12-21",
  "received_items": [
    {
      "material_id": 2,
      "quantity_received": 50,
      "expiry_date": "2026-12-31"
    }
  ]
}
```

7. Verify PO status still = "partial"
8. Third receive call: receive RM003 (30kg) - final delivery
9. POST `/api/purchase-orders/:id/receive`

```json
{
  "received_date": "2025-12-22",
  "received_items": [
    {
      "material_id": 3,
      "quantity_received": 30,
      "expiry_date": "2026-12-31"
    }
  ]
}
```

10. Verify PO status = "received"

**Expected Results:**

- ✅ First receive: Status → "partial", received_quantity[RM001] = 100
- ✅ Second receive: Status → "partial", received_quantity[RM002] = 50
- ✅ Third receive: Status → "received" (all items complete), received_quantity[RM003] = 30
- ✅ Each batch created separately: 3 batches total
- ✅ Supplier balance updated after each receive
- ✅ No errors or duplicate entries

**SQL Verification:**

```sql
-- Verify received quantities cumulative
SELECT material_id, received_quantity FROM po_items WHERE po_id = ?;
-- Should show: RM001: 100, RM002: 50, RM003: 30

-- Verify PO status progression
SELECT status, updated_at FROM purchase_orders WHERE id = ? ORDER BY updated_at;

-- Verify all 3 batches created
SELECT batch_number, material_id, initial_quantity, created_at
FROM raw_material_batches WHERE po_id = ? ORDER BY created_at;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-18: POST /api/purchase-orders/:id/receive - Quantity Validation (Phase 2)

**Objective:** Test prevention of over-receiving items - ensure cumulative quantities are tracked

**Test Steps:**

1. Create PO with item: RM001 (10kg total)
2. First receive: 7kg
3. Verify received_quantity = 7kg, remaining = 3kg
4. Second receive attempt: try to receive 5kg (exceeds remaining)

**Request:**

```json
{
  "received_date": "2025-12-21",
  "received_items": [
    {
      "material_id": 1,
      "quantity_received": 5,
      "expiry_date": "2026-12-31"
    }
  ]
}
```

**Expected Results:**

- ✅ Error response: 400 Bad Request
- ✅ Error message: "Cannot receive 5kg for material RM001. Already received 7kg of 10kg ordered. Only 3kg remaining."
- ✅ PO not updated
- ✅ No batch created

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-19: POST /api/purchase-orders/:id/receive - Receive Exact Remaining (Phase 2)

**Objective:** Test receiving exact remaining quantity after partial receives

**Test Steps:**

1. Create PO with item: RM001 (10kg total)
2. First receive: 7kg (received_quantity = 7, remaining = 3)
3. Second receive: exactly 3kg
4. POST `/api/purchase-orders/:id/receive`

```json
{
  "received_date": "2025-12-21",
  "received_items": [
    {
      "material_id": 1,
      "quantity_received": 3,
      "expiry_date": "2026-12-31"
    }
  ]
}
```

**Expected Results:**

- ✅ Success: 200 OK
- ✅ received_quantity updated to 10kg
- ✅ PO status changed to "received"
- ✅ Second batch created (3kg)
- ✅ Supplier balance fully updated

**SQL Verification:**

```sql
SELECT received_quantity, status FROM po_items WHERE po_id = ? AND material_id = 1;
-- Should show: 10, PO status = "received"
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-20: Frontend - Receive Items Tab Validation (Phase 2)

**Objective:** Test UI validation for partial receives

**Test Steps:**

1. Open Receive PO dialog
2. See 3 items in table
3. Leave Item 1 and Item 3 with 0 quantity
4. Enter 25 for Item 2
5. Try to submit

**Expected Results:**

- ✅ Only Item 2 included in payload (items with 0 qty skipped)
- ✅ No errors for items with 0 quantity
- ✅ Submission succeeds
- ✅ Server only processes Item 2

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-21: Frontend - Receive Empty Submission Prevention (Phase 2)

**Objective:** Test that all 0 quantities cannot be submitted

**Test Steps:**

1. Open Receive PO dialog
2. Leave all items with 0 quantity
3. Click "Receive Purchase Order" button

**Expected Results:**

- ✅ Error message: "Please enter quantity for at least one item"
- ✅ Tab switches to "Receive Items"
- ✅ Submit is prevented
- ✅ API is not called

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-22: Frontend - Quantity Exceeds Remaining Validation (Phase 2)

**Objective:** Test frontend validation when user tries to exceed remaining quantity

**Test Steps:**

1. Open Receive PO for item with 10kg ordered, 7kg already received
2. Try to enter 5kg in quantity field (exceeds 3kg remaining)
3. Observe input validation

**Expected Results:**

- ✅ Input max set to remaining quantity (3kg)
- ✅ User cannot enter 5 in field
- ✅ Shows hint: "7kg already received"
- ✅ Validation error if max is bypassed: "Cannot receive 5kg... Only 3kg remaining"

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-23: GET /api/purchase-orders/:id - Batches Array Included (NEW - Week 10)

**Objective:** Test that batches array is included in purchase order response

**Test Steps:**

1. GET `/api/purchase-orders/1`
2. Check response for batches array
3. Verify batches include material and supplier info

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Response includes `batches` array
- ✅ Batches are fetched from RawMaterialBatch table
- ✅ Each batch includes:
  - batch_number
  - quantity
  - unit_cost
  - expiry_date
  - batch_type (receipt/return)
  - return_reason (for returns)
  - return_disposition (stock/dispose for returns)
  - material (with name, code)
- ✅ Batches filtered by material_id (items in PO) and supplier_id (PO supplier)
- ✅ Sorted by created_at DESC (newest first)

**Example Response:**

```json
{
  "po_number": "PO-0001",
  "supplier_id": 1,
  "batches": [
    {
      "batch_number": "RM-0001-26010152",
      "quantity": 500,
      "unit_cost": 50,
      "expiry_date": "2026-07-15",
      "batch_type": "receipt",
      "return_reason": null,
      "return_disposition": null,
      "material": {
        "id": 1,
        "name": "Turmeric",
        "code": "RM-0001"
      }
    }
  ]
}
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PB-24: GET /api/purchase-orders/:id - Batches with Multiple Types (NEW - Week 10)

**Objective:** Test that batches array includes both receipt and return batches

**Test Steps:**

1. GET `/api/purchase-orders/1` where PO has receipts + returns
2. Check batches array for type diversity
3. Verify return batches include return_reason and return_disposition

**Expected Results:**

- ✅ Batches array includes both receipt and return type batches
- ✅ Receipt batches: batch_type = "receipt", return fields empty
- ✅ Return batches: batch_type = "return", return_reason populated, return_disposition = "stock" or "dispose"
- ✅ Can distinguish types easily
- ✅ Quantities shown correctly (positive for receipt, positive for return quantity)

**Example:**

```
Receipt Batch:  RM-0001-26010152 | Receipt | 500 kg | 50/kg | 2026-07-15
Return Batch:   RM-0001-26010153 | Return  | 50 kg  | 50/kg | 2026-01-15 | Expired | Stock
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 🎨 Purchase Order Frontend Testing

### PF-01: PO List - Navigation

**Objective:** Test accessing PO module

**Test Steps:**

1. Click "Purchase Orders" in sidebar

**Expected Results:**

- ✅ Navigate to `/purchase-orders`
- ✅ PO list page loads
- ✅ No console errors

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-02: PO List - Display

**Objective:** Test PO list rendering

**Test Steps:**

1. View purchase orders list

**Expected Results:**

- ✅ POs displayed in DataTable
- ✅ Columns: PO Number, Supplier, Order Date, Expected Delivery, Total, Status, Actions
- ✅ Currency formatted
- ✅ Dates formatted
- ✅ Status tags colored correctly

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-03: PO List - Filters

**Objective:** Test filtering functionality

**Test Steps:**

1. Filter by status dropdown
2. Filter by supplier
3. Filter by date range
4. Use search box

**Expected Results:**

- ✅ All filters work independently
- ✅ Can combine filters
- ✅ Results update correctly
- ✅ Reset filters button clears all

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-04: Create PO - Navigation

**Objective:** Test create PO flow

**Test Steps:**

1. Click "New Purchase Order" button

**Expected Results:**

- ✅ Navigate to `/purchase-orders/create`
- ✅ Create form loads
- ✅ All sections visible

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-05: Create PO - Form Completion

**Objective:** Test creating purchase order via form

**Test Steps:**

1. Select supplier from dropdown
2. Set order date and expected delivery date
3. Add notes (optional)
4. Click "Add Item" button
5. Select raw material
6. Enter quantity: 100
7. Enter unit cost: 850.00
8. Add another item
9. Click Save

**Expected Results:**

- ✅ Supplier dropdown populated
- ✅ Date pickers work
- ✅ Can add multiple items
- ✅ Item table shows material, quantity, cost, total
- ✅ Grand total calculated correctly
- ✅ Form validates
- ✅ API call successful
- ✅ Success toast shown
- ✅ Navigate back to list
- ✅ New PO appears with 'pending' status

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-06: Create PO - Item Management

**Objective:** Test adding/editing/removing items

**Test Steps:**

1. Add item
2. Edit item quantity
3. Remove item

**Expected Results:**

- ✅ Items added to table
- ✅ Can edit inline or via dialog
- ✅ Remove button deletes item
- ✅ Totals recalculate on changes

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-07: Create PO - Validation

**Objective:** Test form validation

**Test Steps:**

1. Try saving without supplier
2. Try saving without items
3. Try adding item without material
4. Try negative quantity

**Expected Results:**

- ✅ Validation errors shown
- ✅ Cannot proceed with invalid data
- ✅ Error messages clear

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-08: Edit PO - Pending Only

**Objective:** Test editing pending PO

**Test Steps:**

1. Click Edit on pending PO
2. Modify items
3. Save

**Expected Results:**

- ✅ Form pre-populated with PO data
- ✅ Can modify supplier, dates, items
- ✅ Update successful
- ✅ Changes reflected in list

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-09: Edit PO - Cannot Edit Approved/Received

**Objective:** Test edit restriction

**Test Steps:**

1. Try clicking Edit on approved or received PO

**Expected Results:**

- ✅ Edit button disabled or not shown
- ✅ If clicked, error message shown
- ✅ Cannot modify non-pending POs

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-10: View PO - Details Page

**Objective:** Test PO view component

**Test Steps:**

1. Click View icon on any PO

**Expected Results:**

- ✅ Navigate to `/purchase-orders/:id/view` or dialog opens
- ✅ Shows PO header (number, supplier, dates, status)
- ✅ Shows info card with all details
- ✅ Shows items table
- ✅ Shows batches table (if received)
- ✅ Shows audit info (created, updated timestamps)
- ✅ Action buttons visible based on status

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-11: View PO - Action Buttons

**Objective:** Test conditional action buttons

**Test Steps:**

1. View pending PO - should see Edit button
2. View approved PO - should see Receive button
3. View received PO - no action buttons (read-only)

**Expected Results:**

- ✅ Edit button only for pending
- ✅ Receive button only for approved
- ✅ Buttons trigger correct actions

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-12: Delete PO - Pending Only

**Objective:** Test deleting PO

**Test Steps:**

1. Click Delete on pending PO
2. Confirm deletion

**Expected Results:**

- ✅ Delete button only enabled for pending POs
- ✅ Confirmation dialog shown
- ✅ Delete successful
- ✅ PO removed from list

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-13: Receive PO - Dialog Display

**Objective:** Test receive PO dialog

**Test Steps:**

1. Click Receive button on approved PO
2. Check dialog

**Expected Results:**

- ✅ Dialog opens with TabView
- ✅ Two tabs: "Receive Items" and "Return Items"
- ✅ Receive Items tab shows PO items with quantity, expiry date inputs
- ✅ Return Items tab has add return form

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-14: Receive PO - Normal Receipt

**Objective:** Test receiving without returns

**Test Steps:**

1. Open Receive dialog
2. Stay on "Receive Items" tab
3. Enter expiry dates for all items
4. Verify quantities match PO
5. Click Submit

**Expected Results:**

- ✅ Expiry date pickers work
- ✅ Quantities pre-filled from PO
- ✅ Can adjust received quantities if needed
- ✅ Submit successful
- ✅ Success toast shown
- ✅ PO status changes to 'received'
- ✅ List refreshes

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-15: Receive PO - With Returns

**Objective:** Test receiving with returns

**Test Steps:**

1. Open Receive dialog
2. Fill "Receive Items" tab
3. Switch to "Return Items" tab
4. Click "Add Return"
5. Select material
6. Enter return quantity: 10
7. Select return reason: "damaged"
8. Select disposition: "Return to Stock"
9. Enter expiry date
10. Submit

**Expected Results:**

- ✅ Can add multiple returns
- ✅ Return reason dropdown has options: damaged, expired, excess, quality_issue, wrong_item, other
- ✅ Disposition toggle: "Return to Stock" / "Dispose"
- ✅ Return items table shows added returns
- ✅ Net amount displayed (Total - Return Amount)
- ✅ Submit successful
- ✅ Both receipt and return batches created

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-16: Receive PO - Net Amount Calculation

**Objective:** Test net amount display

**Test Steps:**

1. Add returns to receive dialog
2. Check net amount calculation

**Expected Results:**

- ✅ Original PO total displayed
- ✅ Return amount calculated (quantity × unit_cost)
- ✅ Net amount = Total - Returns
- ✅ All amounts formatted as currency

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-17: Receive PO - Validation

**Objective:** Test receive form validation

**Test Steps:**

1. Try submitting without expiry dates
2. Try return quantity > received quantity
3. Try negative quantities

**Expected Results:**

- ✅ Validation errors shown
- ✅ Cannot submit invalid data
- ✅ Clear error messages

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-18: PO Detail View - Received Batches Section Displays (NEW - Week 10)

**Objective:** Test that Received Batches section appears in PO detail view when batches exist

**Test Steps:**

1. Navigate to Purchase Order detail view
2. Open a PO that has received batches
3. Scroll to find "Received Batches" section
4. Verify section is visible with batch data

**Expected Results:**

- ✅ "Received Batches" section visible in PO detail
- ✅ Section appears only when batches exist (hidden for pending POs with no receipts)
- ✅ Shows info card with message "No batches have been received..." when empty
- ✅ Batches displayed in DataTable format
- ✅ All batch columns present: Batch #, Type, Material, Quantity, Expiry Date, [Returns]
- ✅ No console errors
- ✅ Smooth component rendering

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-19: PO Detail View - Received Batches Table Content (NEW - Week 10)

**Objective:** Test that Received Batches table displays accurate batch information

**Test Steps:**

1. Open PO detail with received batches
2. Review each column in the batches table
3. Verify data accuracy and formatting

**Expected Results:**

- ✅ Batch # column shows batch_number (e.g., RM-0001-26010152)
- ✅ Type column shows tag: "Receipt" (green) or "Return" (orange)
- ✅ Material column shows material name and code
- ✅ Quantity column shows numeric value with unit
- ✅ Expiry Date column formatted as date (e.g., 15 Jul 2026)
- ✅ All batches sorted by creation date (newest first)
- ✅ Currency values formatted with Rs. symbol
- ✅ No null/undefined values in cells

**Example Table:**

```
[Batch # | Type | Material | Quantity | Expiry Date]
[RM-0001-26010152 | Receipt | Turmeric (RM-0001) | 500 kg | 15 Jul 2026]
[RM-0001-26010153 | Return | Turmeric (RM-0001) | 50 kg | 15 Jan 2026]
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-20: PO Detail View - Batch Type Color Coding (NEW - Week 10)

**Objective:** Test that batch types are color-coded appropriately

**Test Steps:**

1. Open PO with both receipt and return batches
2. Check Type column for color-coded badges
3. Verify visual distinction

**Expected Results:**

- ✅ Receipt batches show green badge/tag
- ✅ Return batches show orange/warning badge/tag
- ✅ Color coding consistent across all batches
- ✅ Badge text clearly readable
- ✅ Visual distinction immediately apparent

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### PF-21: PO Detail View - Return Batch Details Display (NEW - Week 10)

**Objective:** Test that return batch details (reason, disposition) are displayed

**Test Steps:**

1. Open PO with return batches
2. Locate return batch rows in Received Batches table
3. Check for return reason and disposition columns
4. Verify data is populated for returns

**Expected Results:**

- ✅ Return batches show return_reason column (e.g., "Expired", "Damaged", "Wrong Item")
- ✅ Return batches show return_disposition column (e.g., "Stock", "Dispose")
- ✅ Receipt batches show "-" in return columns
- ✅ Return information clearly visible and readable
- ✅ No missing or null values for return batches

**Example Display:**

```
Return Row:
[RM-0001-26010153 | Return | Turmeric | 50 kg | 15 Jan 2026 | Expired | Stock]
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 🗄️ Batch Tracking Testing

### BT-01: View Batches from Raw Material

**Objective:** Test batch list from raw material page

**Test Steps:**

1. Go to Raw Materials list
2. Click "View Batches" for a material

**Expected Results:**

- ✅ Batch list dialog opens
- ✅ Shows all batches for that material
- ✅ Summary cards show totals
- ✅ DataTable with all batch details

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### BT-02: Batch List - Type Column

**Objective:** Test batch type display

**Test Steps:**

1. View batches for material that has both receipts and returns

**Expected Results:**

- ✅ Type column shows Tags
- ✅ "Receipt" tag is green
- ✅ "Return" tag is yellow/warning
- ✅ Visual distinction clear

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### BT-03: Batch List - Return Columns (Conditional)

**Objective:** Test conditional return columns

**Test Steps:**

1. View batches with no returns - check columns
2. View batches with returns - check columns

**Expected Results:**

- ✅ If no returns: "Return Reason" and "Disposition" columns hidden
- ✅ If returns exist: both columns shown
- ✅ Return batches show reason and disposition
- ✅ Receipt batches show "-" in return columns

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### BT-04: Batch List - Negative Quantities

**Objective:** Test negative quantity highlighting

**Test Steps:**

1. View return batches

**Expected Results:**

- ✅ Negative quantities displayed with minus sign
- ✅ Negative values in red color
- ✅ Bold font weight
- ✅ Visual distinction from positive quantities

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### BT-05: Batch List - Filter by Type

**Objective:** Test batch type filter

**Test Steps:**

1. Open batch list
2. Select "Receipts Only" from filter
3. Select "Returns Only"
4. Select "All Batches"

**Expected Results:**

- ✅ Filter dropdown works
- ✅ "Receipts Only" shows only receipt batches
- ✅ "Returns Only" shows only return batches
- ✅ "All Batches" shows everything

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### BT-06: Batch List - Return Reason Formatting

**Objective:** Test return reason display

**Test Steps:**

1. View return batches with different reasons

**Expected Results:**

- ✅ Reasons displayed in Title Case
- ✅ damaged → "Damaged"
- ✅ quality_issue → "Quality Issue"
- ✅ wrong_item → "Wrong Item"

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### BT-07: Batch List - Disposition Tags

**Objective:** Test disposition tag display

**Test Steps:**

1. View return batches

**Expected Results:**

- ✅ "Return to Stock" tag is blue (info)
- ✅ "Dispose" tag is red (danger)
- ✅ Tags only show for return batches

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### BT-08: Batch Details in PO View

**Objective:** Test batch display in PO view page

**Test Steps:**

1. View a received PO

**Expected Results:**

- ✅ Batches card visible
- ✅ Shows all batches created from this PO
- ✅ Both receipt and return batches shown
- ✅ Batch details include type, quantity, expiry, reason, disposition

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 🔄 Integration & Workflow Testing

### WT-01: End-to-End PO Workflow (Normal Receipt)

**Objective:** Test complete PO lifecycle without returns

**Test Steps:**

1. Create new PO with 2 items (100 kg @ 850, 50 kg @ 1200)
2. Verify PO created with status 'pending'
3. Edit PO to change quantity
4. Update status to 'approved'
5. Receive PO with expiry dates
6. Verify batches created
7. Check stock levels increased
8. Check supplier balance increased

**Expected Results:**

- ✅ PO created successfully
- ✅ Can edit while pending
- ✅ Cannot edit after approved
- ✅ Receive creates batches
- ✅ Stock levels = old_stock + received_quantities
- ✅ Supplier balance = old_balance + PO_total

**SQL Verification:**

```sql
-- Check PO
SELECT * FROM purchase_orders WHERE id = ?;

-- Check batches
SELECT batch_number, material_id, initial_quantity, current_quantity
FROM raw_material_batches WHERE purchase_order_id = ?;

-- Check stock
SELECT material_code, current_stock FROM raw_materials WHERE id IN (?,?);

-- Check supplier balance
SELECT balance FROM suppliers WHERE id = ?;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### WT-02: End-to-End PO Workflow (With Returns - Stock Disposition)

**Objective:** Test complete workflow with returns going back to stock

**Test Steps:**

1. Note initial stock for material
2. Note initial supplier balance
3. Create PO: 100 kg @ 850 (Total: 85,000)
4. Approve PO
5. Receive with:
   - Receive: 100 kg
   - Return: 10 kg (reason: damaged, disposition: stock)
6. Verify batches
7. Check stock increased by 90 kg (100 - 10)
8. Check supplier balance increased by 76,500 (85,000 - 8,500)

**Expected Results:**

- ✅ Receipt batch: +100 kg
- ✅ Return batch: -10 kg
- ✅ Net stock increase: 90 kg
- ✅ Return reduces supplier balance

**SQL Verification:**

```sql
-- Check both batches
SELECT batch_type, initial_quantity, return_reason, return_disposition
FROM raw_material_batches WHERE purchase_order_id = ?;

-- Check net stock
SELECT current_stock FROM raw_materials WHERE id = ?;
-- Should be: initial_stock + 90

-- Check supplier balance
SELECT balance FROM suppliers WHERE id = ?;
-- Should be: initial_balance + 76,500
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### WT-03: End-to-End PO Workflow (With Returns - Dispose Disposition)

**Objective:** Test workflow with disposed returns

**Test Steps:**

1. Create and approve PO: 100 kg @ 850
2. Receive with:
   - Receive: 100 kg
   - Return: 10 kg (reason: expired, disposition: dispose)
3. Check stock increased by 100 kg (full amount)
4. Check supplier balance increased by 76,500 (still reduced)

**Expected Results:**

- ✅ Return batch created but doesn't reduce stock
- ✅ Stock = initial + 100 (not 90)
- ✅ Supplier balance still reduced by return amount

**SQL Verification:**

```sql
SELECT return_disposition FROM raw_material_batches
WHERE purchase_order_id = ? AND batch_type = 'return';

SELECT current_stock FROM raw_materials WHERE id = ?;
-- Should be: initial_stock + 100
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### WT-04: Batch Number Uniqueness

**Objective:** Verify all batch numbers are unique

**Test Steps:**

1. Receive multiple POs
2. Check all batch numbers

**Expected Results:**

- ✅ No duplicate batch numbers
- ✅ Numbers increment correctly
- ✅ Format consistent

**SQL Verification:**

```sql
SELECT batch_number, COUNT(*)
FROM raw_material_batches
GROUP BY batch_number
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### WT-05: Multiple Returns on Same PO

**Objective:** Test handling multiple return items

**Test Steps:**

1. Create PO with 3 different materials
2. Receive with returns for 2 materials

**Expected Results:**

- ✅ Multiple return batches created
- ✅ Each with correct material, quantity, reason
- ✅ Stock adjustments correct for each material
- ✅ Total return amount calculated correctly

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 📊 Test Summary

### Backend Tests

- Total: 24 (was 22 + 2 new for batches)
- Passed: \_\_\_
- Failed: \_\_\_

### Frontend Tests

- Total: 21 (was 17 + 4 new for received batches)
- Passed: \_\_\_
- Failed: \_\_\_

### Batch Tracking Tests

- Total: 8
- Passed: \_\_\_
- Failed: \_\_\_

### Workflow Tests

- Total: 5
- Passed: \_\_\_
- Failed: \_\_\_

### Overall

- **Total Tests:** 58 (was 46 + 12 new tests for stock tracking and batches)
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Pass Rate:** \_\_\_%

---

## 🐛 Issues Found

| ID  | Severity | Module | Test Case | Description | Status |
| --- | -------- | ------ | --------- | ----------- | ------ |
| 1   |          |        |           |             |        |

---

## ✅ Sign-off

**Tested By:** **\*\***\_\_\_**\*\***  
**Date:** January 15, 2026  
**Status:** ⏳ Pending / ✅ Approved / ❌ Rejected  
**Notes:**

- Added tests for Purchase Order batches array in API response (PB-23, PB-24)
- Added tests for Received Batches section display in PO detail view (PF-18 through PF-21)
- Tests verify batch type color coding (Receipt green, Return orange)
- Tests verify return batch details (reason, disposition) are displayed
- Tests ensure empty state card shows when no batches received
- Integration with Week 10 stock tracking and batch display features
