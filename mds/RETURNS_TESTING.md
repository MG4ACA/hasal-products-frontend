# Testing Returns Feature

## Test Scenario: Receive PO with Returns

### Prerequisites

1. Database migration completed: `npx sequelize-cli db:migrate`
2. Backend server running: `npm run dev`
3. Frontend server running: `npm run dev`
4. Test data seeded (suppliers, raw materials, purchase order)

### Test Case 1: Basic Return with Dispose

**Objective:** Test receiving items with damaged goods that will be disposed

**Steps:**

1. **Create a PO:**
   - Login as admin
   - Navigate to Purchase Orders → Create New
   - Select supplier: "Spice Imports Ltd"
   - Add item: Chili Powder, 100 kg, $5.00/kg
   - Save PO (Status: Pending)
   - Approve PO (Status: Approved)

2. **Receive with Returns:**
   - Click "Receive" button on the PO
   - In "Receive Items" tab:
     - Received Qty: 100 kg
     - Expiry Date: 2026-06-30
   - Switch to "Return Items" tab:
     - Material: Chili Powder
     - Quantity: 5 kg
     - Return Reason: Damaged
     - Disposition: Dispose
     - Click "Add Return"
   - Verify summary shows:
     - Total Items to Receive: 1
     - Total Returns: 1
     - Total Amount: $500.00
     - Return Amount: -$25.00
     - Net Amount: $475.00
   - Click "Receive Purchase Order"

3. **Verify Database:**

```sql
-- Check receipt batch
SELECT * FROM raw_material_batches
WHERE purchase_order_id = [PO_ID]
AND batch_type = 'receipt';
-- Expected: 1 record with quantity 100.00

-- Check return batch
SELECT * FROM raw_material_batches
WHERE purchase_order_id = [PO_ID]
AND batch_type = 'return';
-- Expected: 1 record with:
--   - initial_quantity: -5.00
--   - current_quantity: -5.00
--   - return_reason: 'damaged'
--   - return_disposition: 'dispose'

-- Check material stock (should be 100 since dispose doesn't reduce stock)
SELECT current_stock FROM raw_materials WHERE id = [MATERIAL_ID];
-- Expected: previous_stock + 100.00

-- Check supplier balance (should reflect net amount)
SELECT balance FROM suppliers WHERE id = [SUPPLIER_ID];
-- Expected: previous_balance + 475.00

-- Check PO status
SELECT status FROM purchase_orders WHERE id = [PO_ID];
-- Expected: 'received'
```

### Test Case 2: Return to Stock

**Objective:** Test returning excess items back to stock

**Steps:**

1. **Create another PO:**
   - Supplier: "Spice Imports Ltd"
   - Item: Turmeric, 50 kg, $8.00/kg
   - Total: $400.00
   - Approve PO

2. **Receive with Return to Stock:**
   - Receive Items: 60 kg (excess received)
   - Return Items:
     - Material: Turmeric
     - Quantity: 10 kg
     - Reason: Excess
     - Disposition: Return to Stock
   - Summary:
     - Total: $480.00 (60 kg × $8)
     - Return: -$80.00 (10 kg × $8)
     - Net: $400.00
   - Submit

3. **Verify Database:**

```sql
-- Check stock was increased then decreased
SELECT current_stock FROM raw_materials WHERE name = 'Turmeric';
-- Expected: previous_stock + 60 - 10 = previous_stock + 50

-- Check supplier balance reflects net amount
SELECT balance FROM suppliers WHERE name = 'Spice Imports Ltd';
-- Expected: Increased by $400.00 (not $480.00)
```

### Test Case 3: Multiple Returns

**Objective:** Test multiple return items in one receive operation

**Steps:**

1. **Create PO with multiple items:**
   - Chili Powder: 100 kg @ $5/kg = $500
   - Turmeric: 50 kg @ $8/kg = $400
   - Total: $900

2. **Receive with multiple returns:**
   - Receive both items normally
   - Add return #1:
     - Chili: 5 kg, Damaged, Dispose
   - Add return #2:
     - Turmeric: 10 kg, Quality Issue, Dispose
   - Summary:
     - Total: $900
     - Returns: -$105 ($25 + $80)
     - Net: $795
   - Submit

3. **Verify:**
   - 2 receipt batches created
   - 2 return batches created
   - Both materials: stock increased by received amounts (dispose = no reduction)
   - Supplier balance: +$795

### Edge Cases to Test

1. **No Returns:**
   - Receive PO without adding any returns
   - Should work as before (no changes)

2. **Returns Only (No Receive):**
   - Try to submit with only returns, no received items
   - Should fail validation

3. **Invalid Return Quantity:**
   - Try negative or zero quantities
   - Should be blocked by UI validation

4. **Missing Required Fields:**
   - Try to add return without reason or disposition
   - "Add Return" button should be disabled

5. **Remove Return Item:**
   - Add return, then click delete button
   - Should remove from list and recalculate summary

6. **Tab Switching:**
   - Switch between tabs multiple times
   - Form data should persist

## Expected Results Summary

✅ **Frontend:**

- TabView displays correctly with two tabs
- Return items can be added and removed
- Summary updates dynamically
- Validation works properly
- Form submission successful

✅ **Backend:**

- Receipt batches created with positive quantities
- Return batches created with negative quantities
- Stock updates based on disposition logic
- Supplier balance reflects net amount
- PO status updated to 'received'
- Transaction rollback on errors

✅ **Database:**

- `batch_type` field populated correctly ('receipt' or 'return')
- `return_reason` stored for return batches
- `return_disposition` stored for return batches
- All batch numbers unique and sequential
- Financial calculations accurate

## Common Issues & Troubleshooting

**Issue:** Migration error "column already exists"
**Solution:** Run `npx sequelize-cli db:migrate:undo` then re-run migration

**Issue:** Frontend shows "undefined" for return reasons
**Solution:** Check `getReasonLabel()` function is working

**Issue:** Stock not updating correctly
**Solution:** Verify disposition logic in controller

**Issue:** Net amount calculation wrong
**Solution:** Check `calculateReturnAmount()` in frontend and backend

**Issue:** Form validation not working
**Solution:** Ensure all required fields in `canAddReturn` computed property
