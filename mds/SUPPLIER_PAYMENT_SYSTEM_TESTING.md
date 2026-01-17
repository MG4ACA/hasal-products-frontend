# Supplier Payment System - Testing & Verification Guide

## 📋 Complete Testing Guide

### Test Organization

Tests are organized by workflow and complexity:

- **Basic Tests** - Core functionality
- **Integration Tests** - Multi-step workflows
- **Edge Cases** - Boundary conditions
- **Database Tests** - Data integrity
- **API Tests** - Endpoint verification

---

## 🔑 Critical Business Logic (Updated January 2026)

**Understanding Balance Updates:**

1. **PO Creation** → Balance **unchanged**
   - Creating a PO does NOT affect supplier balance
   - Balance only changes when goods are received and/or payment is made

2. **First Receive from a PO** → Balance += **FULL PO Amount** - Payment
   - When receiving goods from a PO for the FIRST time (status: pending → partial/received)
   - The FULL PO amount is added to balance (not just the received portion)
   - Example: PO for 10kg @ Rs. 10,000. Receive only 5kg → Still adds Rs. 10,000 to balance
   - This represents the accounting concept that the full invoice becomes payable on first delivery

3. **Subsequent Receive from Same PO** → Balance -= Payment only
   - When receiving more goods from a PO that was already partially received (status: partial → partial/received)
   - NO goods value is added to balance (PO amount already added on first receive)
   - Only the payment (if any) reduces the balance

4. **Standalone Payment** → Balance -= Payment
   - Recording a payment outside of PO receive always reduces balance

**Example Workflow:**

```
Initial Balance: Rs. 0
Create PO (10kg @ Rs. 10,000) → Balance: Rs. 0 (no change)
First Receive 5kg + Pay Rs. 3,000 → Balance: Rs. 7,000 (0 + 10,000 - 3,000)
Subsequent Receive 5kg + Pay Rs. 2,000 → Balance: Rs. 5,000 (7,000 + 0 - 2,000)
Standalone Payment Rs. 5,000 → Balance: Rs. 0 (fully settled)
```

---

## 🧪 Test Suite 1: Standalone Payment Recording (SupplierView)

### Test 1.1: Create Cash Payment

**Purpose:** Verify basic payment recording

**Steps:**

1. Open Suppliers list
2. Select any supplier
3. Go to "Payments" tab
4. Click "Record Payment" button
5. Fill form:
   - Payment Date: Today
   - Method: Cash
   - Amount: Rs. 5,000
   - Reference: "Test payment"
6. Click Submit

**Expected Results:**

- ✅ Dialog closes
- ✅ Success toast: "Payment recorded successfully"
- ✅ New payment appears in history table
- ✅ Supplier balance decreased by 5,000
- ✅ Method shows as "Cash"

**Verification:**

```sql
SELECT * FROM SupplierPayments WHERE supplier_id = ? ORDER BY created_at DESC LIMIT 1;
SELECT balance FROM Suppliers WHERE id = ?;
```

---

### Test 1.2: Create Check Payment

**Purpose:** Verify check payment with details

**Steps:**

1. Open Suppliers list
2. Select a supplier
3. Click "Record Payment"
4. Fill form:
   - Payment Date: Today
   - Method: **Check**
   - Amount: Rs. 3,000
   - Check Number: CHK12345
   - Check Date: Tomorrow
   - Reference: "Check payment test"
5. Submit

**Expected Results:**

- ✅ Payment created
- ✅ Check fields populated
- ✅ Payment shows in history
- ✅ Status: "pending" (not cleared)
- ✅ Balance updated

**Verification:**

```sql
SELECT check_number, check_date, check_status FROM SupplierPayments
WHERE supplier_id = ? AND payment_method = 'check' LIMIT 1;
```

---

### Test 1.3: Create Bank Transfer Payment

**Purpose:** Verify bank transfer recording

**Steps:**

1. Record Payment dialog
2. Method: Bank Transfer
3. Amount: Rs. 2,000
4. Reference: "Bank transfer ABC123"
5. Submit

**Expected Results:**

- ✅ Payment recorded
- ✅ No check fields visible
- ✅ Balance updated
- ✅ Auto-cleared (no pending status)

---

### Test 1.4: Create Credit Payment

**Purpose:** Verify credit transaction

**Steps:**

1. Record Payment dialog
2. Method: Credit
3. Amount: Rs. 8,000
4. Notes: "Credit terms 30 days"
5. Submit

**Expected Results:**

- ✅ Payment created
- ✅ No check fields
- ✅ Balance updated
- ✅ Recorded in history

---

### Test 1.5: Delete Payment with Balance Reversal

**Purpose:** Verify payment deletion and balance restoration

**Prerequisites:** Payment from Test 1.1 exists

**Steps:**

1. Open Suppliers → Select same supplier
2. In Payments table, click Delete on the test payment
3. Confirm deletion

**Expected Results:**

- ✅ Payment removed from table
- ✅ Success message: "Payment deleted"
- ✅ Supplier balance **increased** by payment amount
- ✅ Balance now restored

**Example:**

```
Before delete: balance = 5,000
Delete payment of 5,000
After delete: balance = 10,000 (restored)
```

---

### Test 1.6: Payment Pagination

**Purpose:** Verify payment list pagination

**Prerequisites:** Create 15+ payments for a supplier

**Steps:**

1. Open Supplier payments tab
2. Observe table
3. Scroll down
4. Check pagination controls

**Expected Results:**

- ✅ Shows 10 payments per page
- ✅ Pagination controls visible
- ✅ Can navigate to next page
- ✅ All payments displayed across pages

---

### Test 1.7: Payment History Display

**Purpose:** Verify all payment details displayed correctly

**Steps:**

1. Create payment with all details
2. View in payment history table
3. Verify each column

**Expected Results:**

- ✅ Payment Date: Formatted correctly
- ✅ Method: Shows "Cash", "Check", "Bank", or "Credit"
- ✅ Amount: Formatted currency (Rs. 5,000.00)
- ✅ Check #: Shows if method='check'
- ✅ Status: Shows if check (pending/cleared)
- ✅ Reference: Shows text entered
- ✅ Delete: Icon appears

---

## 🧪 Test Suite 2: Integrated PO Receive Payment (ReceivePO)

### Test 2.1: Receive Goods with Cash Payment

**Purpose:** Verify payment during PO receive

**Prerequisites:** Pending PO with items

**Steps:**

1. Open Purchase Orders
2. Select pending PO
3. Click "Receive"
4. Enter Received Date: Today
5. Select items to receive (check at least 2)
6. Go to "Payment (Optional)" tab
7. Enter Amount: Rs. 5,000
8. Keep Method: Cash
9. Enter Reference: "Payment with receive"
10. Click Submit

**Expected Results:**

- ✅ Dialog closes
- ✅ Success: "Purchase order received successfully and payment recorded"
- ✅ PO status: "partial" or "received"
- ✅ Batches created for received items
- ✅ Payment recorded
- ✅ Supplier balance decreased by 5,000
- ✅ Payment appears in SupplierView payments tab

---

### Test 2.2: Receive Goods WITHOUT Payment

**Purpose:** Verify optional payment can be skipped

**Prerequisites:** Pending PO

**Steps:**

1. Open ReceivePO
2. Select items
3. Skip Payment tab (leave blank)
4. Submit

**Expected Results:**

- ✅ Success: "Purchase order received successfully" (NOT "and payment recorded")
- ✅ Goods received
- ✅ Balance unchanged
- ✅ No payment record created

**Verification:**

```
Before: supplier.balance = X
After: supplier.balance = X (unchanged)
```

---

### Test 2.3: Receive with Check Payment

**Purpose:** Verify check payment with receive

**Steps:**

1. ReceivePO dialog
2. Select items
3. Payment tab:
   - Amount: Rs. 3,000
   - Method: Check
   - Check Number: CHK99999
   - Check Date: 2024-02-01
4. Submit

**Expected Results:**

- ✅ Goods received
- ✅ Payment recorded with pending status
- ✅ Check details stored
- ✅ Balance = received - payment

---

### Test 2.4: Receive with Returns + Payment

**Purpose:** Verify complex receive with returns and payment

**Steps:**

1. ReceivePO dialog
2. Receive Items tab: Select 100 units
3. Return Items tab: Return 20 units (damaged)
4. Payment tab: Rs. 8,000 cash
5. Submit

**Expected Results:**

- ✅ Received: +100 units (batches created)
- ✅ Returned: -20 units (negative batch)
- ✅ Payment: -Rs. 8,000
- ✅ Balance = 0 + 10,000 - 8,000 = Rs. 2,000
- Note: First receive adds FULL PO amount (Rs. 10,000) to balance

**Balance Calculation:**

```
Initial balance: Rs. 0
PO Created (100 units @ Rs. 100 = Rs. 10,000): Balance = Rs. 0 (no change)
First Receive with Payment:
  - Full PO Amount Added: Rs. 10,000 (regardless of quantity received)
  - Payment Subtracted: Rs. 8,000
  - Net Balance: 0 + 10,000 - 8,000 = Rs. 2,000
Note: Returns don't affect balance in this implementation
```

---

### Test 2.5: Multiple Receives with Payments

**Purpose:** Verify first and subsequent receives handle balance correctly

**Prerequisites:** PO for 200 units @ Rs. 100 = Rs. 20,000 total

**Steps:**

1. First Receive (IMPORTANT: First receive from this PO):
   - 100 units received
   - Payment: Rs. 5,000
2. Second Receive (subsequent receive from same PO):
   - 100 units received
   - Payment: Rs. 4,000

**Expected Results:**

- ✅ First receive: Balance = 0 + 20,000 - 5,000 = Rs. 15,000
  - Note: Full PO Rs. 20,000 added even though only 100 units received
- ✅ Second receive: Balance = 15,000 + 0 - 4,000 = Rs. 11,000
  - Note: No goods value added (PO amount already added on first receive)
- ✅ PO status: "received" (all items received)
- ✅ Outstanding balance: Rs. 11,000

---

## 🧪 Test Suite 3: Balance Calculations

### Test 3.1: Balance Formula Verification

**Purpose:** Verify balance formula accuracy (positive = we owe supplier)

**Steps:**

1. Initial balance = Rs. 0
2. Create PO #1 (Rs. 20,000)
3. Check balance: Should be Rs. 0 (PO creation doesn't affect balance)
4. First Receive PO #1 + Pay Rs. 5,000
5. Check balance: Should be Rs. 15,000 (0 + 20,000 - 5,000)
6. Create PO #2 (Rs. 10,000)
7. Check balance: Should be Rs. 15,000 (no change)
8. Standalone Pay Rs. 10,000
9. Check balance: Should be Rs. 5,000 (15,000 - 10,000)
10. First Receive PO #2 + Pay Rs. 3,000
11. Check balance: Should be Rs. 12,000 (5,000 + 10,000 - 3,000)
12. Standalone Pay Rs. 12,000
13. Check balance: Should be Rs. 0 (settled)

**Balance at each step:**

```
Start: Rs. 0 (square)
Create PO #1 (Rs. 20,000) → Rs. 0 (no change on PO creation)
First Receive PO #1 + Pay Rs. 5,000 → Rs. 15,000 (0 + 20,000 - 5,000)
Create PO #2 (Rs. 10,000) → Rs. 15,000 (no change)
Standalone Pay Rs. 10,000 → Rs. 5,000 (15,000 - 10,000)
First Receive PO #2 + Pay Rs. 3,000 → Rs. 12,000 (5,000 + 10,000 - 3,000)
Final Pay Rs. 12,000 → Rs. 0 (settled)
```

**Verification:**

```sql
SELECT balance FROM Suppliers WHERE id = ?;
-- Should show: 0, 0, 15000, 15000, 5000, 12000, 0
```

---

### Test 3.2: Payment Reversal Accuracy

**Purpose:** Verify deletion reverses balance correctly

**Steps:**

1. Balance: 10,000
2. Create payment: 3,000
3. Check balance: 7,000
4. Delete payment
5. Check balance: 10,000 (restored)

---

### Test 3.3: Decimal Precision

**Purpose:** Verify no rounding errors

**Steps:**

1. Create payment: Rs. 1,234.56
2. Create payment: Rs. 2,345.67
3. Create payment: Rs. 3,456.78
4. Total paid: 7,037.01
5. Check balance reflects exactly

**Verification:**

```sql
SELECT SUM(amount) as total FROM SupplierPayments
WHERE supplier_id = ? AND deleted_at IS NULL;

SELECT balance FROM Suppliers WHERE id = ?;
-- balance = received - returned - SUM(payments)
```

---

## 🧪 Test Suite 4: Edge Cases & Error Handling

### Test 4.1: Zero Amount Payment

**Purpose:** Verify zero amount doesn't create payment

**Steps:**

1. Record Payment dialog
2. Amount: 0
3. Submit

**Expected Results:**

- ✅ Payment NOT created
- ✅ Balance unchanged
- ✅ Success message (but no payment)

---

### Test 4.2: Overpayment Prevention

**Purpose:** Verify system prevents paying more than allowed

**Test 4.2a: Overpayment on First Receive**

**Steps:**

1. Current Balance: Rs. 5,000 (existing debt)
2. Create PO: Rs. 10,000
3. First Receive + Attempt payment: Rs. 16,000
4. Try to submit

**Expected Results:**

- ✅ Backend validation: Error 400 "Payment amount (Rs. 16000) exceeds total payable amount (Rs. 15000.00). Current balance: Rs. 5000.00, PO total: Rs. 10000.00"
- ✅ Balance remains: Rs. 5,000
- ✅ Payment NOT created
- ✅ Max allowed: Rs. 15,000 (current balance + PO amount)

**Test 4.2b: Overpayment on Subsequent Receive**

**Steps:**

1. Balance after first receive: Rs. 8,000
2. Subsequent Receive + Attempt payment: Rs. 9,000
3. Try to submit

**Expected Results:**

- ✅ Backend validation: Error 400 "Payment amount (Rs. 9000) exceeds outstanding balance (Rs. 8000.00)"
- ✅ Balance remains: Rs. 8,000
- ✅ Payment NOT created
- ✅ Max allowed: Rs. 8,000 (current balance only)

**Verification:**

```sql
SELECT balance FROM Suppliers WHERE id = ?;
-- Should remain unchanged after rejection
```

**Edge Cases:**

- First receive: Can pay up to (current balance + PO amount)
- Subsequent receive: Can only pay up to current balance
- Standalone payment: Can only pay up to current balance
- Attempt to pay when balance = 0 → REJECTED
- Attempt to pay exact balance → ACCEPTED (balance = 0)

---

### Test 4.3: Negative Amount Rejected

**Purpose:** Verify system prevents negative amounts

**Steps:**

1. Try to enter negative amount in form
2. Or try via API with negative amount

**Expected Results:**

- ✅ Frontend: InputNumber prevents negative input
- ✅ Backend: Error 400 "Amount cannot be negative"
- ✅ Balance unchanged

---

### Test 4.3: Missing Required Fields

**Purpose:** Verify validation of required fields

**Steps:**

1. Try to submit payment form without:
   - Amount
   - Method
   - Date

**Expected Results:**

- ✅ Form validation prevents submit
- ✅ Error message shown
- ✅ Payment not created

---

### Test 4.4: Check Fields Visibility

**Purpose:** Verify check fields appear/hide correctly

**Steps:**

1. Select Cash method
2. Check: Check fields NOT visible
3. Select Check method
4. Check: Check fields visible
5. Select Bank Transfer
6. Check: Check fields hidden

---

### Test 4.5: Amount Decimal Precision

**Purpose:** Verify decimal handling

**Steps:**

1. Enter amount: 1,234.567 (3 decimals)
2. Submit
3. Verify: Rounded to 2 decimals (1,234.57)

---

### Test 4.6: Concurrent Payments

**Purpose:** Verify system handles multiple payments

**Steps:**

1. Create 5 payments rapidly
2. Check: All created
3. Verify: Balances calculated correctly

---

## 🧪 Test Suite 5: API Testing (Postman/Curl)

### Test 5.1: Create Payment API

```bash
POST /api/suppliers/1/payments

{
  "amount": 5000,
  "payment_date": "2024-01-15",
  "payment_method": "cash",
  "reference": "Test payment"
}

Expected: 201 + payment object
```

---

### Test 5.2: Get Payments List

```bash
GET /api/suppliers/1/payments?page=1&limit=10

Expected: 200 + paginated list
```

---

### Test 5.3: Get Payment Summary

```bash
GET /api/suppliers/1/payments/summary

Expected: 200 + {
  total_paid: 15000,
  cash: 5000,
  check: 3000,
  bank: 7000,
  credit: 0,
  pending_checks: 2
}
```

---

### Test 5.4: Delete Payment

```bash
DELETE /api/suppliers/1/payments/123

Expected: 200 + confirmation
Balance should revert
```

---

### Test 5.5: Receive PO with Payment

```bash
PUT /api/purchase-orders/1/receive

{
  "received_date": "2024-01-15",
  "received_items": [{...}],
  "payment": {
    "amount": 5000,
    "payment_method": "cash"
  }
}

Expected: 200 + {po, batches, payment}
```

---

## 🗄️ Database Verification Tests

### Test 6.1: Payment Record Integrity

```sql
SELECT * FROM SupplierPayments
WHERE supplier_id = 1
ORDER BY created_at DESC;

-- Verify:
-- - All fields present
-- - Dates correct
-- - Amount decimal precision
-- - created_by populated
```

---

### Test 6.2: Balance Consistency

```sql
SELECT
  s.id,
  s.name,
  s.balance,
  (SELECT COALESCE(SUM(quantity * unit_cost), 0)
   FROM RawMaterialBatches
   WHERE supplier_id = s.id AND batch_type = 'receipt') as received_amount,
  (SELECT COALESCE(SUM(ABS(quantity) * unit_cost), 0)
   FROM RawMaterialBatches
   WHERE supplier_id = s.id AND batch_type = 'return') as return_amount,
  (SELECT COALESCE(SUM(amount), 0)
   FROM SupplierPayments
   WHERE supplier_id = s.id) as paid_amount
FROM Suppliers s;

-- Verify:
-- balance = received_amount - return_amount - paid_amount
```

---

### Test 6.3: Audit Trail

```sql
SELECT
  sp.id,
  sp.amount,
  sp.created_by,
  u.full_name as created_by_user,
  sp.created_at
FROM SupplierPayments sp
LEFT JOIN Users u ON sp.created_by = u.id
ORDER BY sp.created_at DESC;

-- Verify: All payments tracked with user info
```

---

## ✅ Test Execution Checklist

### Standalone Payment Tests

- [ ] Test 1.1: Cash payment
- [ ] Test 1.2: Check payment
- [ ] Test 1.3: Bank transfer
- [ ] Test 1.4: Credit payment
- [ ] Test 1.5: Delete payment
- [ ] Test 1.6: Pagination
- [ ] Test 1.7: History display

### PO Receive Tests

- [ ] Test 2.1: Receive + cash payment
- [ ] Test 2.2: Receive without payment
- [ ] Test 2.3: Receive + check payment
- [ ] Test 2.4: Receive + returns + payment
- [ ] Test 2.5: Multiple receives

### Balance Tests

- [ ] Test 3.1: Formula accuracy
- [ ] Test 3.2: Reversal accuracy
- [ ] Test 3.3: Decimal precision

### Edge Cases

- [ ] Test 4.1: Zero amount
- [ ] Test 4.2: Negative amount
- [ ] Test 4.3: Missing fields
- [ ] Test 4.4: Field visibility
- [ ] Test 4.5: Decimal handling
- [ ] Test 4.6: Concurrent payments

### API Tests

- [ ] Test 5.1: Create API
- [ ] Test 5.2: Get list API
- [ ] Test 5.3: Summary API
- [ ] Test 5.4: Delete API
- [ ] Test 5.5: Receive with payment

### Database Tests

- [ ] Test 6.1: Record integrity
- [ ] Test 6.2: Balance consistency
- [ ] Test 6.3: Audit trail

---

## 📊 Test Results Template

```
Test Date: ________________
Tested By: ________________
Environment: [ ] Dev [ ] Staging [ ] Production

Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___

Pass Rate: ___%

Issues Found:
1. ___________
2. ___________
3. ___________

Sign-Off: ________________
Status: [ ] Ready [ ] Issues Found
```

---

## 🐛 Troubleshooting

### Issue: Balance not updating

**Diagnostics:**

1. Check: Payment record created → `SELECT * FROM SupplierPayments...`
2. Check: Supplier ID correct
3. Check: Amount converted to float
4. Check: Transaction committed (no rollback)
5. Check: No database constraints violated

### Issue: Check fields not showing

**Diagnostics:**

1. Check: payment_method = 'check'
2. Check: Browser console for errors
3. Check: Vue DevTools component state
4. Check: v-if condition in template

### Issue: Payment form won't submit

**Diagnostics:**

1. Check: All required fields filled
2. Check: Amount is number
3. Check: Date fields valid
4. Check: Browser console errors
5. Check: Network tab → API response

### Issue: Receive payment not recorded

**Diagnostics:**

1. Check: Payment amount provided
2. Check: Payment object in payload
3. Check: Backend logs for errors
4. Check: Transaction commit/rollback
5. Check: Database payment record

---

## 🧪 Test Suite 5: PO Payment Linking (Added Jan 17, 2026)

### Test 5.1: PO Receive with Payment - Verify PO-Specific Display

**Purpose:** Verify PurchaseOrderView shows only that PO's batches and payments

**Setup:**

- Create Supplier A with 2 materials (M1, M2)
- Create PO-001: M1 10kg @ Rs. 100
- Create PO-002: M2 5kg @ Rs. 200

**Steps:**

1. Receive PO-001:
   - Material M1: 10kg
   - Payment: Rs. 80
   - Click Submit
2. Receive PO-002:
   - Material M2: 5kg
   - Payment: Rs. 150
   - Click Submit
3. Open PO-001 detail page
4. Check Batches & Returns tab
5. Check Payments tab

**Expected Results:**

✅ PO-001 Batches tab shows:

- Only 1 batch (M1, 10kg)
- Does NOT show M2 batch from PO-002

✅ PO-001 Payments tab shows:

- Only 1 payment (Rs. 80)
- Does NOT show Rs. 150 payment from PO-002

✅ Database verification:

```sql
-- Should return 1 batch for PO-001
SELECT * FROM raw_material_batches WHERE purchase_order_id = [PO-001-ID];

-- Should return 1 payment for PO-001
SELECT * FROM supplier_payments WHERE purchase_order_id = [PO-001-ID];
```

---

### Test 5.2: Standalone Payment with PO Link

**Purpose:** Verify PO dropdown in payment form and linkage

**Setup:**

- Supplier A with PO-003 (status: partial, Rs. 5,000 balance)

**Steps:**

1. Go to Suppliers list
2. Select Supplier A
3. Go to Payments tab
4. Click "Record Payment"
5. Verify PO dropdown loads
6. Fill form:
   - Payment Date: Today
   - Purchase Order: Select PO-003 from dropdown
   - Payment Method: Bank Transfer
   - Amount: Rs. 2,000
   - Reference: "Partial payment for PO-003"
7. Click Submit

**Expected Results:**

✅ PO dropdown shows PO-003 with:

- PO number
- Total amount (Rs. 5,000)
- Status (partial)

✅ After submit:

- Success toast shown
- Payment appears in history
- Supplier balance reduced by Rs. 2,000

✅ Database verification:

```sql
-- Should link payment to PO-003
SELECT purchase_order_id FROM supplier_payments
WHERE supplier_id = [SUPPLIER-A-ID]
ORDER BY created_at DESC LIMIT 1;
-- Expected: purchase_order_id = [PO-003-ID]
```

✅ PO-003 detail page:

- Shows Rs. 2,000 payment in Payments tab

---

### Test 5.3: Standalone Payment WITHOUT PO Link (General Payment)

**Purpose:** Verify NULL purchase_order_id for general payments

**Setup:**

- Supplier B with Rs. 10,000 balance
- No need for specific PO

**Steps:**

1. Go to Suppliers list
2. Select Supplier B
3. Go to Payments tab
4. Click "Record Payment"
5. Fill form:
   - Payment Date: Today
   - Purchase Order: **Leave empty** (do not select)
   - Payment Method: Cash
   - Amount: Rs. 3,000
   - Reference: "General payment"
6. Click Submit

**Expected Results:**

✅ Form accepts empty PO selection

✅ After submit:

- Success toast shown
- Payment appears in history
- Supplier balance reduced by Rs. 3,000

✅ Database verification:

```sql
-- Should have NULL purchase_order_id
SELECT purchase_order_id FROM supplier_payments
WHERE supplier_id = [SUPPLIER-B-ID]
ORDER BY created_at DESC LIMIT 1;
-- Expected: purchase_order_id = NULL
```

✅ Payment appears in supplier history but NOT in any PO detail page

---

### Test 5.4: PO Dropdown Filtering

**Purpose:** Verify dropdown only shows pending/partial/received POs

**Setup:**

- Supplier C with multiple POs:
  - PO-004: status = 'pending'
  - PO-005: status = 'partial'
  - PO-006: status = 'received'
  - PO-007: status = 'cancelled'

**Steps:**

1. Go to Suppliers → Select Supplier C → Payments tab
2. Click "Record Payment"
3. Open PO dropdown
4. Check available options

**Expected Results:**

✅ Dropdown shows:

- PO-004 (pending)
- PO-005 (partial)
- PO-006 (received)

✅ Dropdown does NOT show:

- PO-007 (cancelled)

✅ POs ordered by date DESC (newest first)

✅ Max 50 POs shown (if supplier has >50 POs)

---

### Test 5.5: Multiple POs Correctly Isolated

**Purpose:** Verify batches and payments don't mix between POs

**Setup:**

- Supplier D
- Create 3 POs with different materials

**Steps:**

1. Create PO-008: Material A, 10kg, Rs. 1,000
2. Create PO-009: Material B, 5kg, Rs. 500
3. Create PO-010: Material C, 20kg, Rs. 2,000

4. Receive PO-008:
   - Material A: 10kg
   - Payment: Rs. 800
5. Receive PO-009:
   - Material B: 5kg
   - Payment: Rs. 400
6. Go to SupplierView → Record standalone payment:
   - Link to PO-010
   - Amount: Rs. 1,500

7. Open each PO detail page and verify batches/payments

**Expected Results:**

✅ PO-008 detail page shows:

- 1 batch (Material A, 10kg)
- 1 payment (Rs. 800)

✅ PO-009 detail page shows:

- 1 batch (Material B, 5kg)
- 1 payment (Rs. 400)

✅ PO-010 detail page shows:

- 0 batches (not received yet)
- 1 payment (Rs. 1,500 standalone)

✅ Supplier balance calculation correct:

- Started: Rs. 0
- After PO-008 receive: Rs. 200 (1,000 - 800)
- After PO-009 receive: Rs. 300 (200 + 500 - 400)
- After standalone payment: Rs. -1,200 (300 + 2,000 - 1,500)
  _(Note: PO-010 amount added because payment was made)_

---

### Test 5.6: PO Dropdown Loading States

**Purpose:** Verify UX during PO fetch

**Steps:**

1. Go to Suppliers → Select any supplier
2. Click "Record Payment"
3. Observe PO dropdown immediately

**Expected Results:**

✅ Dropdown shows loading spinner initially

✅ After data loads:

- Dropdown becomes interactive
- Shows PO options or "No POs found"

✅ If API error:

- Error toast shown
- Dropdown shows empty state

---

### Test 5.7: Traceability Verification

**Purpose:** Verify complete audit trail from payment to materials

**Setup:**

- Complete PO-011 workflow with receive and payment

**Steps:**

1. Create PO-011 for Supplier E:
   - Material X: 15kg @ Rs. 150
   - Material Y: 10kg @ Rs. 100
   - Total: Rs. 2,750

2. Receive PO-011:
   - Material X: 15kg, batch# RM-X-20260117-001
   - Material Y: 10kg, batch# RM-Y-20260117-001
   - Payment: Rs. 2,000

3. Trace payment using SQL:

```sql
-- Step 1: Find payment
SELECT id, purchase_order_id, amount
FROM supplier_payments
WHERE amount = 2000;
-- Result: payment_id = P123, purchase_order_id = 11

-- Step 2: Find PO details
SELECT po_number, supplier_id, order_date, total_amount
FROM purchase_orders
WHERE id = 11;
-- Result: PO-011, Supplier E, date, Rs. 2,750

-- Step 3: Find all batches from this PO
SELECT batch_number, material_id, quantity, unit_cost
FROM raw_material_batches
WHERE purchase_order_id = 11;
-- Result: 2 batches (RM-X-..., RM-Y-...)

-- Step 4: Find materials
SELECT name, sku, unit
FROM raw_materials
WHERE id IN (SELECT material_id FROM raw_material_batches WHERE purchase_order_id = 11);
-- Result: Material X, Material Y details
```

**Expected Results:**

✅ Complete trace path exists:

- Payment P123 → PO-011 → 2 Batches → 2 Materials

✅ No orphaned records

✅ Referential integrity maintained

---

## 📞 Support

For implementation details, see: [SUPPLIER_PAYMENT_SYSTEM_IMPLEMENTATION.md](./SUPPLIER_PAYMENT_SYSTEM_IMPLEMENTATION.md)

For quick reference, see: [Quick Reference at root](../QUICK_REFERENCE.md)
