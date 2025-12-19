# Week 7 Testing Guide

## Overview

This document outlines the testing procedures for Week 7 implementation, covering Sales Invoice Management with Returns Support, Payment Processing, and Outlet Balance Management.

**Date:** December 20, 2025  
**Modules:** Sales Invoices, Returns, Payments, Outlet Balances  
**Status:** ✅ Backend Complete | ✅ Frontend Complete | ⏳ Testing In Progress

---

## Prerequisites

### Required Data

Before testing Week 7 modules, ensure you have:

- ✅ Backend server running on `http://localhost:3000`
- ✅ Frontend dev server running on `http://localhost:5173`
- ✅ MySQL database with all migrations applied
- ✅ Valid JWT token (logged in as cashier or admin)
- ✅ Products with SKUs and available stock
- ✅ Active outlets with routes
- ✅ Active employees (sales references)
- ✅ Completed production runs (stock available for sale)

### System Requirements

- Node.js v20.19.1+
- MySQL 8.0.39+
- Browser: Chrome, Firefox, or Edge (latest)
- API testing tool: Postman or curl

---

## Module 1: Sales Invoice Creation

### Test 1.1: Create Cash Sales Invoice

**Objective:** Verify invoice creation with auto-generated invoice number

**Steps:**

1. Navigate to Sales page (`/sales`)
2. Click "New Invoice" button
3. Fill in invoice details:
   - Outlet: Select "Central Outlet"
   - Invoice Date: Today's date
   - Sales Reference: Select an employee
   - Route: Auto-filled based on outlet
   - Payment Method: "Cash"
4. Add invoice items:
   - Product SKU: "Roasted Curry Powder - 100g"
   - Quantity: 5
   - Unit Price: 250.00 (auto-filled)
   - Discount: 10.00
5. Click "Add Item"
6. Add another item:
   - Product SKU: "Chili Powder - 250g"
   - Quantity: 3
   - Unit Price: 550.00
   - Discount: 0
7. Click "Create Invoice"

**Expected Results:**

- ✅ Invoice created successfully with auto-generated number (e.g., INV-20251220-001)
- ✅ Success toast notification displayed: "Invoice created successfully"
- ✅ Redirected to invoice details or list
- ✅ Total amount calculated correctly: (5 × 250 - 10) + (3 × 550) = 1890.00
- ✅ Stock levels decreased for both SKUs
- ✅ Payment recorded with method "cash"

**Database Validation:**

```sql
-- Check invoice
SELECT invoice_number, outlet_id, invoice_date, total_amount, payment_method
FROM sales_invoices
WHERE invoice_number LIKE 'INV-20251220-%'
ORDER BY id DESC LIMIT 1;

-- Check invoice items
SELECT ii.*, ps.size, ps.unit
FROM invoice_items ii
JOIN product_skus ps ON ii.sku_id = ps.id
WHERE ii.invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = 'INV-20251220-001');

-- Check payment
SELECT * FROM payments
WHERE invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = 'INV-20251220-001');

-- Verify stock reduction
SELECT id, size, unit, stock_quantity
FROM product_skus
WHERE id IN (SELECT sku_id FROM invoice_items WHERE invoice_id = ...);
```

**API Testing (curl):**

```bash
curl -X POST http://localhost:3000/api/sales/invoices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "outlet_id": 1,
    "invoice_date": "2025-12-20",
    "sales_ref_id": 2,
    "route_id": 1,
    "payment_method": "cash",
    "items": [
      {
        "sku_id": 1,
        "quantity": 5,
        "unit_price": 250.00,
        "discount": 10.00
      },
      {
        "sku_id": 2,
        "quantity": 3,
        "unit_price": 550.00,
        "discount": 0
      }
    ]
  }'
```

---

### Test 1.2: Create Credit Sales Invoice

**Objective:** Verify credit sales update outlet balance

**Steps:**

1. Navigate to Sales page
2. Click "New Invoice" button
3. Fill in invoice details:
   - Outlet: Select "North Outlet"
   - Invoice Date: Today's date
   - Sales Reference: Select an employee
   - Payment Method: "Credit"
4. Add invoice items:
   - Product SKU: "Pepper Powder - 100g"
   - Quantity: 10
   - Unit Price: 300.00
   - Discount: 50.00
5. Click "Create Invoice"

**Expected Results:**

- ✅ Invoice created successfully
- ✅ Payment recorded with method "credit"
- ✅ Outlet balance increased by total amount (2950.00)
- ✅ Stock levels decreased

**Database Validation:**

```sql
-- Check invoice and payment
SELECT si.invoice_number, si.total_amount, p.payment_method
FROM sales_invoices si
JOIN payments p ON si.id = p.invoice_id
WHERE si.invoice_number LIKE 'INV-20251220-%'
ORDER BY si.id DESC LIMIT 1;

-- Check outlet balance
SELECT name, balance
FROM outlets
WHERE id = (SELECT outlet_id FROM sales_invoices WHERE invoice_number = 'INV-20251220-002');
```

---

### Test 1.3: Create Check Payment Invoice

**Objective:** Verify check payment tracking

**Steps:**

1. Navigate to Sales page
2. Click "New Invoice" button
3. Fill in invoice details:
   - Outlet: Select "South Outlet"
   - Invoice Date: Today's date
   - Sales Reference: Select an employee
   - Payment Method: "Check"
   - Check Number: "CHK-001234"
   - Check Date: Today's date
   - Check Clearance Date: Tomorrow's date
4. Add invoice items with total ≥ 1000.00
5. Click "Create Invoice"

**Expected Results:**

- ✅ Invoice created successfully
- ✅ Payment recorded with method "check"
- ✅ Check details saved: number, date, clearance date
- ✅ Check payment visible in payments list

**Database Validation:**

```sql
SELECT p.*, si.invoice_number
FROM payments p
JOIN sales_invoices si ON p.invoice_id = si.id
WHERE p.payment_method = 'check'
ORDER BY p.id DESC LIMIT 1;
```

---

### Test 1.4: Invoice with Multiple Items and Discounts

**Objective:** Verify complex invoice calculations

**Steps:**

1. Create invoice with 5+ different items
2. Apply varying discounts to items
3. Verify total calculation

**Expected Results:**

- ✅ All items added correctly
- ✅ Item-level discounts applied
- ✅ Total = Σ(quantity × unit_price - discount)
- ✅ All stock levels updated correctly

---

### Test 1.5: Invoice Number Sequential Generation

**Objective:** Verify invoice numbering sequence

**Steps:**

1. Create 3 invoices on the same date
2. Note invoice numbers
3. Create invoice for different date
4. Verify sequence resets

**Expected Results:**

- ✅ Same-day invoices: INV-20251220-001, INV-20251220-002, INV-20251220-003
- ✅ Different-day invoice: INV-20251221-001 (sequence resets)
- ✅ No duplicate invoice numbers

**Database Validation:**

```sql
SELECT invoice_number, invoice_date
FROM sales_invoices
WHERE invoice_date >= '2025-12-20'
ORDER BY invoice_number;
```

---

## Module 2: Returns Management

### Test 2.1: Full Return to Stock

**Objective:** Verify full invoice return with stock restoration

**Steps:**

1. Navigate to Sales page
2. Find a completed cash invoice
3. Click "Return" button
4. Select "Full Return"
5. For each item, set:
   - Return Quantity: Full quantity
   - Disposition: "Stock" (return to inventory)
   - Reason: "Customer changed mind"
6. Click "Process Return"

**Expected Results:**

- ✅ Return processed successfully
- ✅ Success notification: "Return processed successfully"
- ✅ Invoice status updated to "returned"
- ✅ Stock levels increased for all items
- ✅ Return items recorded with correct disposition
- ✅ Original payment reversed (if applicable)

**Database Validation:**

```sql
-- Check invoice status
SELECT invoice_number, status
FROM sales_invoices
WHERE invoice_number = 'INV-20251220-001';

-- Check return items
SELECT ii.*, ps.size, ps.unit
FROM invoice_items ii
JOIN product_skus ps ON ii.sku_id = ps.id
WHERE ii.invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = 'INV-20251220-001');

-- Verify stock restoration
SELECT id, size, unit, stock_quantity
FROM product_skus
WHERE id IN (SELECT sku_id FROM invoice_items WHERE ...);
```

---

### Test 2.2: Partial Return with Dispose

**Objective:** Verify partial return with damaged goods disposal

**Steps:**

1. Find an invoice with multiple items
2. Click "Return" button
3. Select "Partial Return"
4. For first item:
   - Return Quantity: 2 (out of 5)
   - Disposition: "Stock"
   - Reason: "Unused portion"
5. For second item:
   - Return Quantity: 1 (out of 3)
   - Disposition: "Dispose"
   - Reason: "Damaged packaging"
6. Click "Process Return"

**Expected Results:**

- ✅ Return processed successfully
- ✅ Invoice status updated to "partially_returned"
- ✅ Stock increased only for items with "Stock" disposition (2 units)
- ✅ No stock increase for "Dispose" items
- ✅ Return quantities and dispositions recorded correctly

**Database Validation:**

```sql
-- Check invoice status
SELECT invoice_number, status
FROM sales_invoices
WHERE invoice_number = 'INV-20251220-002';

-- Check return details
SELECT sku_id, quantity, return_quantity, return_disposition, return_reason
FROM invoice_items
WHERE invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = 'INV-20251220-002');
```

---

### Test 2.3: Return with Credit Adjustment

**Objective:** Verify credit invoice return adjusts outlet balance

**Steps:**

1. Find a credit invoice
2. Process full return
3. Verify outlet balance decreased

**Expected Results:**

- ✅ Return processed successfully
- ✅ Outlet balance decreased by returned amount
- ✅ Stock restored (if disposition = "Stock")

**Database Validation:**

```sql
-- Check outlet balance after return
SELECT name, balance
FROM outlets
WHERE id = (SELECT outlet_id FROM sales_invoices WHERE invoice_number = 'INV-20251220-003');
```

---

### Test 2.4: Cannot Return Already Returned Invoice

**Objective:** Verify duplicate return prevention

**Steps:**

1. Find an invoice with status "returned"
2. Attempt to process return again

**Expected Results:**

- ✅ Return button disabled or error shown
- ✅ Error message: "Invoice already returned"
- ✅ No duplicate return processing

---

### Test 2.5: Return Validation - Quantity Limits

**Objective:** Verify return quantity cannot exceed original

**Steps:**

1. Open return dialog
2. Attempt to enter return quantity > original quantity
3. Try to submit

**Expected Results:**

- ✅ Validation error: "Return quantity cannot exceed original"
- ✅ Form submission blocked
- ✅ Clear error message displayed

---

## Module 3: Invoice Search and Filtering

### Test 3.1: Search by Invoice Number

**Objective:** Verify invoice search functionality

**Steps:**

1. Navigate to Sales page
2. Enter invoice number in search: "INV-20251220-001"
3. Press Enter or wait for debounce

**Expected Results:**

- ✅ Only matching invoice displayed
- ✅ Search is case-insensitive
- ✅ Partial matches work (e.g., "001" finds all -001 invoices)

---

### Test 3.2: Filter by Date Range

**Objective:** Verify date range filtering

**Steps:**

1. Set start date: "2025-12-20"
2. Set end date: "2025-12-20"
3. Apply filter

**Expected Results:**

- ✅ Only invoices within date range shown
- ✅ Inclusive of both start and end dates
- ✅ Date format handled correctly

---

### Test 3.3: Filter by Outlet

**Objective:** Verify outlet filtering

**Steps:**

1. Select outlet from dropdown: "Central Outlet"
2. Verify filtered results

**Expected Results:**

- ✅ Only invoices for selected outlet shown
- ✅ Filter persists during pagination

---

### Test 3.4: Filter by Status

**Objective:** Verify status filtering

**Steps:**

1. Select status: "Completed"
2. Verify results
3. Change to "Returned"
4. Verify results update

**Expected Results:**

- ✅ Only invoices with selected status shown
- ✅ Status badge colors correct (green=completed, red=returned, yellow=partial)

---

### Test 3.5: Filter by Payment Method

**Objective:** Verify payment method filtering

**Steps:**

1. Select payment method: "Cash"
2. Verify results
3. Change to "Credit"
4. Verify results update

**Expected Results:**

- ✅ Only invoices with selected payment method shown
- ✅ Payment method icon/badge displayed correctly

---

### Test 3.6: Combined Filters

**Objective:** Verify multiple filters work together

**Steps:**

1. Set date range: Last 7 days
2. Select outlet: "North Outlet"
3. Select status: "Completed"
4. Select payment method: "Cash"

**Expected Results:**

- ✅ Results match ALL filter criteria
- ✅ Clear all filters button resets everything
- ✅ Pagination works with filters

---

## Module 4: Invoice Details and View

### Test 4.1: View Invoice Details

**Objective:** Verify invoice detail page displays all information

**Steps:**

1. Navigate to Sales page
2. Click "View" on an invoice
3. Review displayed information

**Expected Results:**

- ✅ Invoice number, date, outlet displayed
- ✅ Sales reference and route shown
- ✅ All invoice items listed with:
  - Product name, SKU details
  - Quantity, unit price, discount
  - Line total calculated correctly
- ✅ Payment details shown:
  - Payment method
  - Check details (if applicable)
  - Amount paid
- ✅ Status badge displayed
- ✅ Return button available (if not returned)
- ✅ Print button available

---

### Test 4.2: View Invoice with Returns

**Objective:** Verify returned invoice details

**Steps:**

1. View an invoice with partial returns
2. Check return information display

**Expected Results:**

- ✅ Return quantities shown for each item
- ✅ Return disposition indicated (Stock/Dispose)
- ✅ Return reasons displayed
- ✅ Visual indication of returned items (color, icon)

---

## Module 5: Outlet Balance Management

### Test 5.1: View Outlet Balance

**Objective:** Verify outlet balance display

**Steps:**

1. Navigate to Outlets page
2. Click "View Balance" on an outlet

**Expected Results:**

- ✅ Current balance displayed prominently
- ✅ Balance color-coded (red if negative, green if positive)
- ✅ Balance updates in real-time after transactions

---

### Test 5.2: Balance Update After Credit Sale

**Objective:** Verify balance increases with credit sales

**Steps:**

1. Note current outlet balance
2. Create credit invoice for ₹1000
3. Check outlet balance again

**Expected Results:**

- ✅ Balance increased by ₱1000
- ✅ Transaction reflected immediately

---

### Test 5.3: Balance Update After Credit Return

**Objective:** Verify balance decreases with credit returns

**Steps:**

1. Note current outlet balance
2. Process return for credit invoice (₱500)
3. Check outlet balance again

**Expected Results:**

- ✅ Balance decreased by ₱500
- ✅ Transaction reflected immediately

---

### Test 5.4: View Outlet Invoices

**Objective:** Verify outlet-specific invoice list

**Steps:**

1. Navigate to Outlets page
2. Click "View Invoices" on an outlet
3. Review invoice list

**Expected Results:**

- ✅ Only invoices for selected outlet shown
- ✅ All invoice details displayed (number, date, amount, status)
- ✅ Sorted by date (newest first)
- ✅ Pagination works correctly

---

### Test 5.5: View Outlet Payments

**Objective:** Verify outlet-specific payment history

**Steps:**

1. Navigate to Outlets page
2. Click "View Payments" on an outlet
3. Review payment list

**Expected Results:**

- ✅ Only payments for selected outlet shown
- ✅ Payment method, amount, date displayed
- ✅ Linked to invoice number
- ✅ Check details shown when applicable

---

## Module 6: Stock Level Validation

### Test 6.1: Prevent Sale with Insufficient Stock

**Objective:** Verify cannot sell more than available stock

**Steps:**

1. Check current stock for a SKU
2. Attempt to create invoice with quantity > stock
3. Try to submit

**Expected Results:**

- ✅ Validation error: "Insufficient stock available"
- ✅ Current stock level shown in error
- ✅ Form submission blocked

---

### Test 6.2: Stock Deduction on Sale

**Objective:** Verify stock decreases after sale

**Steps:**

1. Note stock level before sale
2. Create invoice with quantity = 5
3. Check stock level after

**Expected Results:**

- ✅ Stock decreased by 5 units
- ✅ Change reflected immediately
- ✅ Stock level visible in product list

**Database Validation:**

```sql
SELECT id, size, unit, stock_quantity
FROM product_skus
WHERE id = <sku_id>;
```

---

### Test 6.3: Stock Increase on Return (Stock Disposition)

**Objective:** Verify stock increases when return disposition = Stock

**Steps:**

1. Note stock level before return
2. Process return with quantity = 3, disposition = "Stock"
3. Check stock level after

**Expected Results:**

- ✅ Stock increased by 3 units
- ✅ Change reflected immediately

---

### Test 6.4: No Stock Change on Dispose

**Objective:** Verify stock unchanged when disposition = Dispose

**Steps:**

1. Note stock level before return
2. Process return with quantity = 2, disposition = "Dispose"
3. Check stock level after

**Expected Results:**

- ✅ Stock level unchanged
- ✅ Return recorded but not added back to inventory

---

## Module 7: Pagination and Performance

### Test 7.1: Invoice List Pagination

**Objective:** Verify pagination works correctly

**Steps:**

1. Navigate to Sales page
2. Change page size to 10
3. Navigate through pages

**Expected Results:**

- ✅ 10 invoices per page
- ✅ Page numbers displayed correctly
- ✅ Previous/Next buttons work
- ✅ Total count accurate
- ✅ No duplicate invoices across pages

---

### Test 7.2: Large Dataset Performance

**Objective:** Verify system handles many invoices

**Steps:**

1. Create 50+ invoices (via API or UI)
2. Navigate to Sales page
3. Test search and filter

**Expected Results:**

- ✅ Page loads within 2 seconds
- ✅ Search/filter response < 1 second
- ✅ Pagination smooth
- ✅ No browser lag or freezing

---

## Module 8: Error Handling

### Test 8.1: Network Error During Invoice Creation

**Objective:** Verify graceful error handling

**Steps:**

1. Disconnect network
2. Attempt to create invoice
3. Observe error handling

**Expected Results:**

- ✅ User-friendly error message displayed
- ✅ No data loss (form still populated)
- ✅ Retry option available
- ✅ No partial database entries

---

### Test 8.2: Invalid Data Submission

**Objective:** Verify form validation

**Steps:**

1. Try to create invoice without required fields
2. Try to submit with invalid data

**Expected Results:**

- ✅ Validation errors shown for each field
- ✅ Clear error messages
- ✅ Focus on first error field
- ✅ Submit button disabled until valid

---

### Test 8.3: Concurrent Invoice Creation

**Objective:** Verify no duplicate invoice numbers

**Steps:**

1. Open two browser tabs
2. Create invoices simultaneously in both
3. Check invoice numbers

**Expected Results:**

- ✅ Unique invoice numbers for both
- ✅ No number collision
- ✅ Sequential numbering maintained

---

## Module 9: Role-Based Access

### Test 9.1: Cashier Permissions

**Objective:** Verify cashier can create and view invoices

**Steps:**

1. Login as cashier role
2. Navigate to Sales page
3. Attempt to create invoice

**Expected Results:**

- ✅ Can create new invoices
- ✅ Can view invoice list
- ✅ Can process returns
- ✅ Cannot edit completed invoices
- ✅ Cannot delete invoices

---

### Test 9.2: Admin Permissions

**Objective:** Verify admin has full access

**Steps:**

1. Login as admin
2. Navigate to Sales page
3. Test all operations

**Expected Results:**

- ✅ Can create, view, edit invoices
- ✅ Can process returns
- ✅ Can view outlet balances
- ✅ Can access all reports

---

## Module 10: Integration Testing

### Test 10.1: End-to-End Sales Flow

**Objective:** Verify complete sales workflow

**Steps:**

1. Create production run (Week 5)
2. Complete production to generate stock
3. Create sales invoice using produced stock
4. Verify stock deduction
5. Process partial return
6. Verify stock restoration

**Expected Results:**

- ✅ All steps complete without errors
- ✅ Stock levels accurate throughout
- ✅ Data consistency maintained
- ✅ All records properly linked

---

### Test 10.2: Route-Outlet-Sales Integration

**Objective:** Verify route assignment affects invoice

**Steps:**

1. Assign route to outlet (Week 6)
2. Create invoice for that outlet
3. Verify route auto-filled

**Expected Results:**

- ✅ Route automatically selected based on outlet
- ✅ Sales reference options filtered by route
- ✅ Data relationships maintained

---

## API Endpoint Testing

### Test All Sales Endpoints

**Base URL:** `http://localhost:3000/api/sales`

#### 1. Create Invoice

```bash
curl -X POST http://localhost:3000/api/sales/invoices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "outlet_id": 1,
    "invoice_date": "2025-12-20",
    "sales_ref_id": 2,
    "route_id": 1,
    "payment_method": "cash",
    "items": [
      {
        "sku_id": 1,
        "quantity": 5,
        "unit_price": 250.00,
        "discount": 10.00
      }
    ]
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "id": 1,
    "invoice_number": "INV-20251220-001",
    "total_amount": 1240.0,
    "status": "completed"
  }
}
```

---

#### 2. Get All Invoices

```bash
curl -X GET "http://localhost:3000/api/sales/invoices?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**

```json
{
  "success": true,
  "invoices": [...],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

---

#### 3. Get Invoice by ID

```bash
curl -X GET http://localhost:3000/api/sales/invoices/1 \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**

```json
{
  "success": true,
  "invoice": {
    "id": 1,
    "invoice_number": "INV-20251220-001",
    "items": [...],
    "payment": {...}
  }
}
```

---

#### 4. Process Return

```bash
curl -X POST http://localhost:3000/api/sales/invoices/1/return \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "item_id": 1,
        "return_quantity": 2,
        "return_disposition": "stock",
        "return_reason": "Customer changed mind"
      }
    ]
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Return processed successfully",
  "invoice": {
    "status": "partially_returned"
  }
}
```

---

#### 5. Get Outlet Balance

```bash
curl -X GET http://localhost:3000/api/outlets/1/balance \
  -H "Authorization: Bearer <token>"
```

**Expected Response:**

```json
{
  "success": true,
  "balance": 15000.0
}
```

---

#### 6. Get Outlet Invoices

```bash
curl -X GET http://localhost:3000/api/outlets/1/invoices \
  -H "Authorization: Bearer <token>"
```

---

#### 7. Get Outlet Payments

```bash
curl -X GET http://localhost:3000/api/outlets/1/payments \
  -H "Authorization: Bearer <token>"
```

---

## Database Verification Queries

### Invoice Summary

```sql
-- Get invoice summary for today
SELECT
  COUNT(*) as total_invoices,
  SUM(total_amount) as total_sales,
  payment_method,
  status
FROM sales_invoices
WHERE DATE(invoice_date) = CURDATE()
GROUP BY payment_method, status;
```

### Stock Movement Audit

```sql
-- Audit stock changes for a SKU
SELECT
  ps.id,
  ps.size,
  ps.unit,
  ps.stock_quantity as current_stock,
  (SELECT SUM(quantity) FROM invoice_items WHERE sku_id = ps.id) as total_sold,
  (SELECT SUM(return_quantity) FROM invoice_items WHERE sku_id = ps.id AND return_disposition = 'stock') as total_returned
FROM product_skus ps
WHERE ps.id = 1;
```

### Outlet Balance Audit

```sql
-- Verify outlet balance calculation
SELECT
  o.name,
  o.balance as recorded_balance,
  COALESCE(SUM(CASE WHEN si.payment_method = 'credit' THEN si.total_amount ELSE 0 END), 0) as credit_sales,
  COALESCE(SUM(CASE WHEN ii.return_disposition IS NOT NULL THEN ii.return_quantity * ii.unit_price ELSE 0 END), 0) as returns
FROM outlets o
LEFT JOIN sales_invoices si ON o.id = si.outlet_id
LEFT JOIN invoice_items ii ON si.id = ii.invoice_id
WHERE o.id = 1
GROUP BY o.id;
```

### Return Disposition Analysis

```sql
-- Analyze return dispositions
SELECT
  return_disposition,
  COUNT(*) as return_count,
  SUM(return_quantity) as total_quantity,
  SUM(return_quantity * unit_price) as total_value
FROM invoice_items
WHERE return_disposition IS NOT NULL
GROUP BY return_disposition;
```

---

## Performance Benchmarks

### Expected Response Times

| Operation           | Target  | Acceptable | Notes                      |
| ------------------- | ------- | ---------- | -------------------------- |
| Create Invoice      | < 500ms | < 1s       | Includes stock update      |
| Load Invoice List   | < 300ms | < 500ms    | 10 items per page          |
| Process Return      | < 800ms | < 1.5s     | Includes stock restoration |
| Search/Filter       | < 200ms | < 300ms    | With debounce              |
| Get Invoice Details | < 200ms | < 400ms    | Includes items & payment   |

---

## Common Issues and Solutions

### Issue 1: Invoice Number Duplicate

**Symptom:** Error creating invoice - duplicate invoice number

**Cause:** Concurrent requests or database transaction issue

**Solution:**

- Ensure invoice number generation is in transaction
- Check for database locks
- Verify unique constraint on invoice_number

---

### Issue 2: Stock Going Negative

**Symptom:** Stock quantity becomes negative after sale

**Cause:** Insufficient stock validation not working

**Solution:**

- Check validation in salesController
- Verify stock check happens before deduction
- Add database constraint: CHECK (stock_quantity >= 0)

---

### Issue 3: Outlet Balance Incorrect

**Symptom:** Balance doesn't match credit sales

**Cause:** Balance not updated on returns or payment changes

**Solution:**

- Verify balance update in return processing
- Check transaction rollback on errors
- Recalculate balance from invoices

---

### Issue 4: Return Not Restoring Stock

**Symptom:** Stock not increasing after return with "Stock" disposition

**Solution:**

- Check return_disposition value in database
- Verify stock update logic in completeReturn
- Check for transaction rollback

---

## Testing Checklist

### Pre-Testing Setup

- [ ] Database seeded with required data
- [ ] Backend server running without errors
- [ ] Frontend dev server accessible
- [ ] Valid JWT tokens for different roles
- [ ] API testing tool configured

### Module 1: Sales Invoice Creation

- [ ] Test 1.1: Create Cash Sales Invoice
- [ ] Test 1.2: Create Credit Sales Invoice
- [ ] Test 1.3: Create Check Payment Invoice
- [ ] Test 1.4: Invoice with Multiple Items
- [ ] Test 1.5: Invoice Number Sequential Generation

### Module 2: Returns Management

- [ ] Test 2.1: Full Return to Stock
- [ ] Test 2.2: Partial Return with Dispose
- [ ] Test 2.3: Return with Credit Adjustment
- [ ] Test 2.4: Cannot Return Already Returned Invoice
- [ ] Test 2.5: Return Validation - Quantity Limits

### Module 3: Search and Filtering

- [ ] Test 3.1: Search by Invoice Number
- [ ] Test 3.2: Filter by Date Range
- [ ] Test 3.3: Filter by Outlet
- [ ] Test 3.4: Filter by Status
- [ ] Test 3.5: Filter by Payment Method
- [ ] Test 3.6: Combined Filters

### Module 4: Invoice Details

- [ ] Test 4.1: View Invoice Details
- [ ] Test 4.2: View Invoice with Returns

### Module 5: Outlet Balance

- [ ] Test 5.1: View Outlet Balance
- [ ] Test 5.2: Balance Update After Credit Sale
- [ ] Test 5.3: Balance Update After Credit Return
- [ ] Test 5.4: View Outlet Invoices
- [ ] Test 5.5: View Outlet Payments

### Module 6: Stock Validation

- [ ] Test 6.1: Prevent Sale with Insufficient Stock
- [ ] Test 6.2: Stock Deduction on Sale
- [ ] Test 6.3: Stock Increase on Return
- [ ] Test 6.4: No Stock Change on Dispose

### Module 7: Pagination

- [ ] Test 7.1: Invoice List Pagination
- [ ] Test 7.2: Large Dataset Performance

### Module 8: Error Handling

- [ ] Test 8.1: Network Error During Creation
- [ ] Test 8.2: Invalid Data Submission
- [ ] Test 8.3: Concurrent Invoice Creation

### Module 9: Role-Based Access

- [ ] Test 9.1: Cashier Permissions
- [ ] Test 9.2: Admin Permissions

### Module 10: Integration

- [ ] Test 10.1: End-to-End Sales Flow
- [ ] Test 10.2: Route-Outlet-Sales Integration

### API Testing

- [ ] All endpoints return correct status codes
- [ ] All endpoints return correct data structure
- [ ] All endpoints handle errors gracefully

### Database Verification

- [ ] All queries run without errors
- [ ] Data integrity maintained
- [ ] No orphaned records

---

## Sign-Off

**Tested By:** ********\_********  
**Date:** ********\_********  
**Status:** [ ] Pass [ ] Fail [ ] Partial  
**Notes:**

---

## Appendix

### Test Data Template

```sql
-- Insert test outlet
INSERT INTO outlets (name, address, contact_number, status, balance)
VALUES ('Test Outlet', '123 Test St', '0771234567', 'active', 0);

-- Insert test employee
INSERT INTO employees (emp_code, name, role, contact_number, status)
VALUES ('EMP-TEST', 'Test Sales Rep', 'sales_ref', '0777654321', 'active');

-- Check available SKUs with stock
SELECT ps.id, p.name, ps.size, ps.unit, ps.stock_quantity, ps.price
FROM product_skus ps
JOIN products p ON ps.product_id = p.id
WHERE ps.stock_quantity > 0;
```

---

**End of Week 7 Testing Guide**
