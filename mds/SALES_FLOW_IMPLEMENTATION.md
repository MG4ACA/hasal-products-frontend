# Sales Flow - Implementation Analysis

**Date:** January 26, 2026  
**Source:** Backend Controllers, Models, Frontend Components  
**Scope:** Actual Sales Flow Implementation Review

---

## 1. Overview

This document analyzes the **actual implementation** of the sales flow in both backend and frontend code.

---

## 2. Backend Implementation

### 2.1 Sales Invoice Controller (`salesController.js`)

#### **2.1.1 Create Invoice Endpoint**

**Endpoint:** `POST /api/sales-invoices`

**Implementation Flow:**

```javascript
1. Start Transaction
2. Validate Outlet exists
3. Validate Sales Ref exists (if provided)
4. Validate items array not empty
5. Generate Invoice Number
6. For each item:
   ├─> Validate SKU exists
   ├─> Check stock availability (for sales items only)
   ├─> Calculate line amounts
   ├─> Process returns (negative quantities)
   └─> Add to processedItems array
7. Calculate invoice totals
8. Determine payment status based on method
9. Create invoice record
10. Create invoice items
11. Update SKU stock for each item
    ├─> Sales: Reduce stock
    ├─> Return to Stock: Increase stock
    └─> Dispose: No change
12. Update outlet balance (credit sales only)
13. Commit Transaction
14. Fetch and return created invoice with associations
```

**Payment Status Logic:**

```javascript
let payment_status = 'unpaid';
if (payment_method === 'cash') {
  payment_status = 'paid';
} else if (payment_method === 'check') {
  payment_status = check_number ? 'unpaid' : 'unpaid';
}
```

**Stock Update Logic:**

```javascript
if (item.is_return) {
  // For returns
  if (item.return_to_stock) {
    sku.current_stock += Math.abs(item.quantity); // Add back
  }
  // else: no stock change (disposed)
} else {
  // For sales
  sku.current_stock -= item.quantity; // Reduce stock
}
```

**Outlet Balance Update:**

```javascript
if (payment_method === 'credit') {
  outlet.balance += total_amount; // Increase balance
}
```

#### **2.1.2 Get All Invoices**

**Endpoint:** `GET /api/sales-invoices`

**Filters Supported:**

- `page`, `limit` - Pagination
- `search` - Invoice number search
- `outlet_id` - Filter by outlet
- `sales_ref_id` - Filter by sales representative
- `route_id` - Filter by route
- `payment_status` - Filter by payment status
- `payment_method` - Filter by payment method
- `start_date`, `end_date` - Date range filter

**Includes:**

- Outlet details
- Sales ref (employee) details
- Route details
- Creator (user) details

**Ordering:**

- By invoice_date DESC
- By created_at DESC

#### **2.1.3 Get Invoice By ID**

**Endpoint:** `GET /api/sales-invoices/:id`

**Includes:**

- Outlet (with balance, credit limit)
- Sales Ref
- Route
- Invoice Items with:
  - SKU details
  - Product details
- Creator user

#### **2.1.4 Update Invoice**

**Endpoint:** `PUT /api/sales-invoices/:id`

**Allowed Updates:**

- `notes` only
- `payment_status` only

**NOT allowed:**

- Cannot update items
- Cannot update amounts
- Cannot update outlet/dates

#### **2.1.5 Delete Invoice**

**Endpoint:** `DELETE /api/sales-invoices/:id`

**Deletion Process:**

```javascript
1. Start Transaction
2. Find invoice with items
3. For each item:
   ├─> Reverse stock movements
   │   ├─> Was sale: Add stock back
   │   └─> Was return to stock: Remove from stock
4. Reverse outlet balance (if credit sale)
5. Delete invoice (cascade deletes items)
6. Commit Transaction
```

**Stock Reversal Logic:**

```javascript
if (item.is_return) {
  if (item.return_to_stock) {
    sku.current_stock -= Math.abs(item.quantity); // Remove what was added
  }
} else {
  sku.current_stock += Math.abs(item.quantity); // Add back what was sold
}
```

**Balance Reversal:**

```javascript
if (invoice.payment_method === 'credit') {
  outlet.balance -= invoice.total_amount; // Decrease balance
}
```

#### **2.1.6 Get Sale Profit**

**Endpoint:** `GET /api/sales/invoices/:invoiceId/profit`

**Calculation:**

```javascript
For each item:
  revenue = unit_price × quantity
  cost = sku.average_cost × quantity
  profit = revenue - cost
  margin = (profit / revenue) × 100

Invoice Total:
  total_revenue = sum(item revenues)
  total_cost = sum(item costs)
  total_profit = total_revenue - total_cost
  overall_margin = (total_profit / total_revenue) × 100
```

**⚠️ ISSUE:** Uses `item.price` instead of `item.unit_price` (potential bug)

#### **2.1.7 Get Profit Summary**

**Endpoint:** `GET /api/sales/profit-summary`

**Parameters:**

- `period` - 'daily' or 'monthly'
- `date_from`, `date_to` - Date range

**Groups By:**

- Daily: YYYY-MM-DD
- Monthly: YYYY-MM

**Returns:**

- Breakdown by period
- Overall totals
- Invoice counts per period

### 2.2 Payment Controller (`paymentController.js`)

#### **2.2.1 Create Payment**

**Endpoint:** `POST /api/payments`

**Implementation Flow:**

```javascript
1. Start Transaction
2. Validate required fields
3. Validate amount > 0
4. Validate check details (if check payment)
5. Verify outlet exists
6. Validate allocations array not empty
7. Calculate total allocated amount
8. Verify total allocated = payment amount
9. Verify all invoices exist and belong to outlet
10. Verify allocations don't exceed outstanding amounts
11. Create payment record
12. Create payment allocations
13. Update each invoice:
    ├─> Increase paid_amount
    └─> Update payment_status (unpaid → partial → paid)
14. Decrease outlet balance
15. Commit Transaction
```

**Payment Status Update Logic:**

```javascript
const newPaidAmount = invoice.paid_amount + allocated_amount;

if (Math.abs(newPaidAmount - invoice.total_amount) < 0.01) {
  paymentStatus = 'paid';
} else if (newPaidAmount > 0) {
  paymentStatus = 'partial';
} else {
  paymentStatus = 'unpaid';
}
```

**⚠️ CRITICAL ISSUE:** Code appears incomplete in the provided snippet

#### **2.2.2 Get All Payments**

**Filters:**

- `outlet_id`
- `payment_method`
- `start_date`, `end_date`
- `check_status` (pending/cleared/overdue)

**Check Status Logic:**

- **Pending:** `clearance_date` is null
- **Cleared:** `clearance_date` is not null
- **Overdue:** Pending for > 30 days

### 2.3 Database Models

#### **SalesInvoice Model**

- ✅ All required fields defined
- ✅ Enums for payment_method, payment_status
- ✅ Proper indexes on key fields
- ✅ Timestamps enabled
- ✅ Foreign key constraints

#### **InvoiceItem Model**

- ✅ All required fields defined
- ✅ Return fields: is_return, return_reason, return_to_stock
- ✅ Cascade delete enabled
- ✅ No timestamps (design choice)

#### **Payment Model**

- ✅ All fields defined
- ✅ Check payment fields included
- ✅ createdAt timestamp only (no updatedAt)

#### **PaymentAllocation Model**

- ✅ Links payments to invoices
- ✅ Tracks allocated amounts
- ✅ CreatedAt only (immutable)

---

## 3. Frontend Implementation

### 3.1 Sales Store (`stores/sales.js`)

**State:**

```javascript
- invoices: ref([])
- currentInvoice: ref(null)
- totalInvoices: ref(0)
- loading: ref(false)
- error: ref(null)
```

**Computed:**

- `getInvoiceById` - Find invoice by ID
- `paidInvoices` - Filter paid invoices
- `unpaidInvoices` - Filter unpaid invoices
- `partialInvoices` - Filter partial invoices

**Actions:**

- `fetchInvoices(params)` - Get all with filters
- `fetchInvoiceById(id)` - Get single invoice
- `createInvoice(data)` - Create new invoice
- `updateInvoice(id, data)` - Update invoice
- `deleteInvoice(id)` - Delete invoice
- `clearError()` - Clear error state
- `clearCurrentInvoice()` - Clear current invoice

### 3.2 Invoice Form Component (`InvoiceForm.vue`)

#### **3.2.1 Form Structure**

**Tab 1: Invoice Details**

- Outlet selection (required)
- Sales ref selection (optional)
- Route selection (optional)
- Invoice date (required, defaults to today)
- Payment method (cash/credit/check)
- Check details (if check selected)

**Tab 2: Sales Items**

- Product selection
- SKU selection (filtered by product)
- Quantity input
- Unit price (auto-filled from SKU)
- Discount percent (defaults to outlet default_discount)
- Stock validation
- Add to items list

**Tab 3: Returns**

- Product selection
- SKU selection
- Return quantity
- Return reason (damaged/expired/excess/quality_issue/other)
- Return to stock checkbox
- Add to items list

**Tab 4: Summary & Notes**

- Subtotal display
- Total discount display
- Returns total display
- Grand total display
- Notes textarea

#### **3.2.2 Key Computed Properties**

**Stock Validation:**

```javascript
hasInsufficientStock = computed(() => {
  const salesItems = items.filter(item => !item.is_return);
  return salesItems.some(item => {
    const sku = findSku(item.sku_id);
    return sku && sku.current_stock < item.quantity;
  });
});
```

**Totals Calculation:**

```javascript
subtotal = sum of (quantity × unit_price) for sales items

totalDiscount = sum of ((quantity × unit_price × discount_percent) / 100)

returnsTotal = sum of (abs(quantity) × unit_price) for return items

grandTotal = subtotal - totalDiscount - returnsTotal
```

**Form Validation:**

```javascript
isFormValid = computed(
  () => outlet_id && invoice_date && payment_method && items.length > 0 && !hasInsufficientStock
);
```

#### **3.2.3 Stock Validation Logic**

**Real-time Validation:**

```javascript
watch(selectedSku, () => {
  validateStock();
});

watch(itemQuantity, () => {
  validateStock();
});

validateStock() {
  const sku = findSku(selectedSku);
  if (sku.current_stock < itemQuantity) {
    stockError = `Insufficient stock. Only ${sku.current_stock} units available.`;
    return false;
  }
  return true;
}
```

**Prevents submission if:**

- Any sales item has insufficient stock
- Displays error message per item
- Disables "Add" button until stock available

#### **3.2.4 Item Management**

**Add Sales Item:**

```javascript
addSalesItem() {
  // Validate stock first
  if (!validateStock()) return;

  items.push({
    sku_id,
    product_name,
    sku_label,
    quantity,
    unit_price,
    discount_percent,
    is_return: false
  });

  // Reset form
}
```

**Add Return Item:**

```javascript
addReturnItem() {
  items.push({
    sku_id,
    product_name,
    sku_label,
    quantity,
    unit_price,
    discount_percent: 0,
    is_return: true,
    return_reason,
    return_to_stock
  });

  // Reset form
}
```

### 3.3 Sales Index Page (`SalesIndex.vue`)

**Filters Panel:**

- Search by invoice number
- Filter by outlet
- Filter by sales ref
- Filter by route
- Filter by payment status
- Filter by payment method
- Date range filter

**Features:**

- Pagination
- Filter badge count
- Clear filters button
- Create invoice button
- Refresh button
- View/Edit/Delete actions per row

**Delete Confirmation:**

- Confirms before deletion
- Shows invoice number in confirmation
- Success/error toast notifications

### 3.4 Sales Service (`salesService.js`)

**API Endpoints:**

```javascript
GET    /sales-invoices          - Get all invoices
GET    /sales-invoices/:id      - Get invoice by ID
POST   /sales-invoices          - Create invoice
PUT    /sales-invoices/:id      - Update invoice
DELETE /sales-invoices/:id      - Delete invoice
GET    /sales-invoices/:id/pdf  - Get PDF (not implemented)
GET    /sales/invoices/:id/profit - Get profit for invoice
GET    /sales/profit-summary    - Get profit summary
```

**Error Handling:**

- All requests wrapped in try-catch
- Uses `handleApiError` utility
- Returns error object on failure

---

## 4. Implementation Issues & Gaps

### 4.1 Critical Issues

**1. Profit Calculation Bug**

```javascript
// salesController.js line ~480
const unitPrice = parseFloat(item.price || 0); // WRONG
// Should be:
const unitPrice = parseFloat(item.unit_price || 0);
```

**2. Payment Controller Incomplete**

- Code appears truncated in `paymentController.js`
- Missing outlet balance update logic
- Missing transaction commit

**3. No Credit Limit Validation**

- Frontend: No check before allowing credit sales
- Backend: No validation of outlet credit_limit
- Can create invoices exceeding credit limit

**4. No Invoice Number Collision Handling**

- `generateInvoiceNumber()` implementation not shown
- Potential race condition in concurrent invoice creation

### 4.2 Missing Features

**1. Check Clearance Functionality**

- No endpoint to update `clearance_date`
- No UI for marking checks as cleared
- No check bounce handling

**2. Invoice Modification Restrictions**

- Cannot modify invoice after creation
- Only notes and status can be updated
- No partial refund mechanism

**3. Return Validation**

- No check if return quantity > original sale
- No time limit enforcement for returns
- No validation that product was actually sold to outlet

**4. Stock Adjustment Integration**

- `stock_adjustments` table exists but not used
- No manual correction mechanism
- No stock reconciliation process

**5. Vehicle Stock Management**

- Models exist but not integrated
- No vehicle loading process
- No vehicle stock depletion on sales

### 4.3 Data Inconsistencies

**1. Payment Status Field Duplication**

- `SalesInvoice.payment_status` exists
- Also have `Payment` table with separate tracking
- Potential for sync issues

**2. Paid Amount Tracking**

- References to `invoice.paid_amount` in payment controller
- But field doesn't exist in `SalesInvoice` model
- **CRITICAL BUG**

**3. Return Quantity Handling**

- Backend stores as negative quantity
- Frontend displays as positive
- Potential for sign confusion

### 4.4 Performance Concerns

**1. N+1 Query Problem**

- `getAllInvoices` loads multiple associations
- Could be optimized with better eager loading
- Large datasets will be slow

**2. No Caching**

- Outlet, product, employee data fetched repeatedly
- No client-side caching strategy
- API calls on every form load

**3. No Pagination in Profit Reports**

- `getProfitSummary` loads all invoices in range
- No limit on result set size
- Large date ranges will timeout

### 4.5 Security Issues

**1. No Input Sanitization**

- Direct use of user inputs in queries
- Potential SQL injection (mitigated by Sequelize)
- XSS vulnerabilities in notes fields

**2. No Authorization Checks**

- Only authentication checked (`req.user.id`)
- No role-based access control in sales routes
- Cashier can delete any invoice

**3. No Audit Trail**

- Deletions are permanent
- No log of who modified what
- Cannot track invoice changes

---

## 5. Workflow Analysis

### 5.1 Happy Path - Cash Sale

```
User Actions:
1. Navigate to /sales/create
2. Select outlet
3. Add product items (stock validated)
4. Select payment method: Cash
5. Submit invoice

System Processing:
1. ✅ Validate outlet exists
2. ✅ Validate stock availability
3. ✅ Generate invoice number
4. ✅ Create invoice (status: paid)
5. ✅ Create invoice items
6. ✅ Reduce stock
7. ✅ Do NOT update outlet balance
8. ✅ Return to invoice list

Result: ✅ Clean sale, stock updated, no balance impact
```

### 5.2 Happy Path - Credit Sale + Payment

```
Invoice Creation:
1. User creates invoice with payment method: Credit
2. ✅ Invoice created with status: unpaid
3. ✅ Outlet balance increased
4. ✅ Stock reduced

Payment Collection:
1. User navigates to payments
2. Selects outlet
3. Enters payment amount
4. Allocates to invoices
5. Submits payment

System Processing:
1. ✅ Validate allocations
2. ✅ Create payment record
3. ✅ Create allocations
4. ❌ Update invoice.paid_amount (FIELD MISSING!)
5. ✅ Update payment_status
6. ❌ Decrease outlet balance (CODE INCOMPLETE!)

Result: ⚠️ Partial success, missing critical updates
```

### 5.3 Edge Case - Sale with Returns

```
User Actions:
1. Add sales items (e.g., 10 units @ Rs.100)
2. Add return items (e.g., 2 units damaged, dispose)
3. Submit invoice

System Processing:
1. ✅ Sales items: Reduce stock by 10
2. ✅ Return items: Stock unchanged (dispose)
3. ✅ Calculate total: (10 × 100) - (2 × 100) = Rs.800
4. ✅ Create invoice with mixed items

Result: ✅ Correct handling of returns
```

### 5.4 Edge Case - Insufficient Stock

```
User Actions:
1. Add item with quantity > available stock
2. Attempt to submit

Frontend:
1. ✅ Stock validation shows error
2. ✅ "Add" button disabled
3. ✅ Form submit disabled
4. ✅ Error message displayed

Backend (if bypassed):
1. ✅ Stock check in controller
2. ✅ Transaction rolled back
3. ✅ Error returned

Result: ✅ Well protected against insufficient stock
```

### 5.5 Edge Case - Exceeding Credit Limit

```
User Actions:
1. Create credit sale for outlet near credit limit
2. Total exceeds available credit
3. Submit invoice

Frontend:
1. ❌ No validation
2. ❌ Form submits successfully

Backend:
1. ❌ No credit limit check
2. ✅ Invoice created
3. ✅ Balance increased beyond limit

Result: ❌ CRITICAL BUG - No credit limit enforcement
```

---

## 6. API Response Structure

### 6.1 Success Response

```json
{
  "success": true,
  "data": {
    /* result */
  }
}
```

### 6.2 Error Response

```json
{
  "success": false,
  "error": true,
  "message": "Error description",
  "code": 400
}
```

### 6.3 Paginated Response

```json
{
  "success": true,
  "data": {
    "invoices": [...],
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
}
```

---

## 7. Summary of Implementation

### ✅ Well Implemented

1. **Stock Validation**
   - Real-time frontend validation
   - Backend double-check
   - Clear error messages

2. **Transaction Safety**
   - All database operations in transactions
   - Proper rollback on errors
   - Atomic updates

3. **Return Handling**
   - Flexible return-to-stock option
   - Multiple return reasons
   - Negative quantity tracking

4. **Invoice Deletion**
   - Proper stock reversal
   - Balance reversal
   - Cascade item deletion

5. **Filter & Search**
   - Comprehensive filter options
   - Efficient query building
   - Proper indexing

### ❌ Poorly Implemented / Missing

1. **Credit Limit Enforcement**
   - No validation anywhere
   - Major business rule violation

2. **Payment Processing**
   - Code incomplete
   - Missing outlet balance update
   - `paid_amount` field doesn't exist

3. **Check Management**
   - No clearance tracking UI
   - No bounce handling
   - Incomplete workflow

4. **Invoice Modification**
   - Too restrictive (only notes/status)
   - No edit capability
   - No void/cancel option

5. **Audit Trail**
   - No change tracking
   - No deletion log
   - Cannot trace modifications

6. **Authorization**
   - No role-based access control
   - Anyone can delete invoices
   - No permission system

---

**End of Implementation Analysis**
