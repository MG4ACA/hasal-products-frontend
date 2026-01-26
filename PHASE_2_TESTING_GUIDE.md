# Phase 2: Quick Testing Guide

## Prerequisites

1. Backend server running: `cd hasal-pos-backend && npm run dev`
2. Database migrated: `npx sequelize-cli db:migrate`

## Run Automated Tests

```bash
cd hasal-pos-backend
node tests/phase2-fraud-prevention.test.js
```

Expected output: All 14 tests passing ✅

---

## Manual Testing Guide

### Part 1: Return Validation

#### Test 1: Normal Return (Within Policy)

```bash
# Step 1: Create original purchase
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {cashier_token}
Content-Type: application/json

{
  "outlet_id": 1,
  "invoice_date": "2026-01-20",
  "items": [{
    "sku_id": 1,
    "quantity": 10,
    "unit_price": 100
  }],
  "payment_method": "cash"
}

# Note the invoice ID from response

# Step 2: Create return (7 days later for damaged goods - within policy)
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {cashier_token}
Content-Type: application/json

{
  "outlet_id": 1,
  "invoice_date": "2026-01-27",
  "items": [{
    "sku_id": 1,
    "quantity": 3,
    "unit_price": 100,
    "is_return": true,
    "return_reason": "damaged",
    "return_to_stock": false,
    "original_invoice_id": {INVOICE_ID}
  }],
  "payment_method": "cash"
}

✅ Expected: Success, quantity is negative (-3)
```

#### Test 2: Return Without Original Invoice

```bash
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {cashier_token}

{
  "outlet_id": 1,
  "invoice_date": "2026-01-27",
  "items": [{
    "sku_id": 1,
    "quantity": 2,
    "unit_price": 100,
    "is_return": true,
    "return_reason": "damaged"
    # Missing: original_invoice_id
  }],
  "payment_method": "cash"
}

❌ Expected: 400 Error - "Returns must reference an original purchase invoice"
```

#### Test 3: Return Exceeding Time Limit

```bash
# Create old invoice (40 days ago)
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {cashier_token}

{
  "outlet_id": 1,
  "invoice_date": "2025-12-18",  # 40 days ago
  "items": [{
    "sku_id": 1,
    "quantity": 5,
    "unit_price": 100
  }],
  "payment_method": "cash"
}

# Try to return as "expired" (30 day limit exceeded)
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {cashier_token}

{
  "outlet_id": 1,
  "invoice_date": "2026-01-27",
  "items": [{
    "sku_id": 1,
    "quantity": 1,
    "unit_price": 100,
    "is_return": true,
    "return_reason": "expired",
    "original_invoice_id": {OLD_INVOICE_ID}
  }],
  "payment_method": "cash"
}

❌ Expected: 400 Error - "Return exceeds policy: Expired products - 30 days (40 days since purchase, limit 30 days)"
```

#### Test 4: Admin Override

```bash
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {admin_token}  # Admin token!

{
  "outlet_id": 1,
  "invoice_date": "2026-01-27",
  "items": [{
    "sku_id": 1,
    "quantity": 1,
    "unit_price": 100,
    "is_return": true,
    "return_reason": "expired",
    "original_invoice_id": {OLD_INVOICE_ID},
    "return_policy_override": true,
    "return_policy_override_reason": "VIP customer - exceptional case approved by manager"
  }],
  "payment_method": "cash"
}

✅ Expected: Success - admin override recorded
```

#### Test 5: Return Exceeding Quantity

```bash
# Try to return 15 when only 10 purchased
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {cashier_token}

{
  "outlet_id": 1,
  "invoice_date": "2026-01-27",
  "items": [{
    "sku_id": 1,
    "quantity": 15,  # More than original 10
    "unit_price": 100,
    "is_return": true,
    "return_reason": "excess",
    "original_invoice_id": {INVOICE_ID}
  }],
  "payment_method": "cash"
}

❌ Expected: 400 Error - "Return quantity exceeds original purchase"
```

#### Test 6: Get Purchase History

```bash
GET http://localhost:5000/api/sales-invoices/purchase-history?outlet_id=1&sku_id=1
Authorization: Bearer {cashier_token}

✅ Expected: List of purchases with can_return quantities
```

---

### Part 2: Check Bounce Handling

#### Test 7: Create Check Payment

```bash
# Step 1: Create invoice with check
POST http://localhost:5000/api/sales-invoices
Authorization: Bearer {cashier_token}

{
  "outlet_id": 1,
  "invoice_date": "2026-01-27",
  "items": [{
    "sku_id": 1,
    "quantity": 5,
    "unit_price": 100
  }],
  "payment_method": "check",
  "check_number": "CHK-001",
  "check_date": "2026-01-27"
}

✅ Expected: Invoice created with check_status: "pending"

# Step 2: Create payment record
POST http://localhost:5000/api/payments
Authorization: Bearer {admin_token}

{
  "outlet_id": 1,
  "payment_date": "2026-01-27",
  "amount": 500,
  "payment_method": "check",
  "check_number": "CHK-001",
  "check_date": "2026-01-27"
}

✅ Expected: Payment created with payment_status: "pending"
```

#### Test 8: Clear Check

```bash
POST http://localhost:5000/api/payments/{payment_id}/clear
Authorization: Bearer {admin_token}

{
  "clearance_date": "2026-01-28"
}

✅ Expected: Payment status changed to "cleared"
```

#### Test 9: Bounce Check (With Allocations)

```bash
# Step 1: Create invoice with check
POST http://localhost:5000/api/sales-invoices
{
  "outlet_id": 1,
  "invoice_date": "2026-01-27",
  "items": [{"sku_id": 1, "quantity": 5, "unit_price": 100}],
  "payment_method": "check",
  "check_number": "CHK-BOUNCE-001",
  "check_date": "2026-01-27"
}

# Note invoice_id

# Step 2: Create payment
POST http://localhost:5000/api/payments
{
  "outlet_id": 1,
  "payment_date": "2026-01-27",
  "amount": 500,
  "payment_method": "check",
  "check_number": "CHK-BOUNCE-001"
}

# Note payment_id

# Step 3: Create payment allocation
POST http://localhost:5000/api/payment-allocations
{
  "payment_id": {payment_id},
  "invoice_id": {invoice_id},
  "allocated_amount": 500
}

# Step 4: Get outlet balance before bounce
GET http://localhost:5000/api/outlets/{outlet_id}
# Note the balance

# Step 5: Bounce the check
POST http://localhost:5000/api/payments/{payment_id}/bounce
Authorization: Bearer {admin_token}

{
  "bounce_reason": "Insufficient funds - returned by bank",
  "bounce_fee": 50
}

✅ Expected:
- Payment status: "bounced"
- Allocations deleted
- Outlet balance increased by 500 (payment) + 50 (fee) = 550
- Invoice check_status: "bounced"
- Invoice payment_status reverted to "unpaid"
```

#### Test 10: Try to Bounce Without Reason

```bash
POST http://localhost:5000/api/payments/{payment_id}/bounce
Authorization: Bearer {admin_token}

{}  # Empty body

❌ Expected: 400 Error - "Bounce reason is required"
```

#### Test 11: Try to Bounce as Cashier

```bash
POST http://localhost:5000/api/payments/{payment_id}/bounce
Authorization: Bearer {cashier_token}  # Not admin!

{
  "bounce_reason": "Test"
}

❌ Expected: 403 Error - "Only admins can process check bounces"
```

#### Test 12: Try to Clear Bounced Check

```bash
# After bouncing a check, try to clear it
POST http://localhost:5000/api/payments/{bounced_payment_id}/clear
Authorization: Bearer {admin_token}

{
  "clearance_date": "2026-01-28"
}

❌ Expected: 400 Error - "Bounced checks cannot be cleared"
```

---

## Verification Checklist

### Return Validation

- [ ] Returns require original invoice reference
- [ ] Returns within 7 days for "damaged" succeed
- [ ] Returns beyond time limit fail for non-admins
- [ ] Admin override works with reason
- [ ] Admin override fails without reason
- [ ] Cannot return more than purchased
- [ ] Purchase history API returns correct data
- [ ] Cumulative returns tracked correctly

### Check Bounce

- [ ] Check invoices created with status "pending"
- [ ] Checks can be cleared successfully
- [ ] Bouncing check reverses allocations
- [ ] Outlet balance restored on bounce
- [ ] Bounce fee applied to outlet balance
- [ ] Bounce requires reason
- [ ] Only admins can bounce
- [ ] Bounced checks cannot be cleared
- [ ] Invoice check_status updated correctly

---

## Database Verification

### Check New Columns Exist

```sql
-- Return validation fields
SELECT original_invoice_id, original_invoice_item_id, return_policy_override,
       return_policy_override_reason, return_policy_override_by
FROM invoice_items
WHERE is_return = 1
LIMIT 5;

-- Check bounce fields
SELECT id, check_number, payment_status, bounce_date, bounce_fee, bounce_reason
FROM payments
WHERE payment_method = 'check'
LIMIT 5;

-- Check status on invoices
SELECT invoice_number, payment_method, check_status
FROM sales_invoices
WHERE payment_method = 'check'
LIMIT 5;
```

---

## Common Issues & Solutions

### Issue 1: Migration fails

**Solution:** Check if columns already exist, run `db:migrate:undo` and retry

### Issue 2: "Payment not found"

**Solution:** Verify payment_id exists and is a check payment

### Issue 3: "Original invoice not found"

**Solution:** Ensure invoice was created with payment_status = 'paid' or 'partial'

### Issue 4: Balance calculations incorrect

**Solution:** Check payment_allocations table for orphaned records

---

## Success Criteria

✅ All automated tests pass  
✅ Manual tests match expected behavior  
✅ Database columns created  
✅ No errors in console/logs  
✅ Balances calculated correctly  
✅ Authorization enforced  
✅ Audit trail complete

**When all criteria met → Phase 2 is production-ready!**
