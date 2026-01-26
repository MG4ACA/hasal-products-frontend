# Sales Flow - Documentation Analysis

**Date:** January 26, 2026  
**Source:** MD Documentation Files  
**Scope:** Sales Invoice Creation, Payment Processing, Returns Management

---

## 1. Overview

Based on the documentation in the `mds` folder, the sales flow in Hasal Products POS is designed to handle:

- **Sales Invoice Creation** for outlet orders
- **Payment Collection** (Cash, Credit, Check)
- **Returns Processing** with stock management
- **Credit Management** for outlets
- **Sales Profit Tracking**

---

## 2. Sales Flow Components (As Documented)

### 2.1 Sales Invoice Process

**Database Tables Involved:**

- `sales_invoices` - Main invoice header
- `invoice_items` - Individual line items (sales and returns)
- `outlets` - Customer information and balance tracking
- `employees` - Sales representatives
- `routes` - Route-based organization
- `product_skus` - Stock tracking

**Invoice Structure:**

```
sales_invoices
├── invoice_number (auto-generated, unique)
├── outlet_id (required)
├── sales_ref_id (optional - employee who collected order)
├── route_id (optional)
├── invoice_date (required)
├── subtotal
├── discount_percent
├── discount_amount
├── total_amount
├── payment_method (cash|credit|check)
├── payment_status (paid|unpaid|partial)
├── check_number (for check payments)
├── check_date
├── clearance_date (when check clears)
└── notes
```

**Invoice Items:**

```
invoice_items
├── invoice_id
├── sku_id
├── quantity (negative for returns)
├── unit_price
├── discount_percent
├── discount_amount
├── total_amount
├── is_return (boolean)
├── return_reason (damaged|expired|excess|quality_issue|other)
└── return_to_stock (boolean)
```

### 2.2 Payment Methods

**1. Cash Payment**

- Payment status: Automatically set to "paid"
- Outlet balance: NOT affected
- Immediate settlement

**2. Credit Payment**

- Payment status: Set to "unpaid"
- Outlet balance: INCREASED by invoice total
- Requires separate payment collection via `payments` table

**3. Check Payment**

- Payment status: Set to "unpaid"
- Check details recorded (number, date)
- Requires clearance tracking
- Outlet balance: Treated similar to credit until cleared

### 2.3 Returns Processing

**Return Types:**

- Damaged goods
- Expired products
- Excess quantity
- Quality issues
- Other reasons

**Return Handling:**

1. **Return to Stock** (disposition: stock)
   - Items added back to inventory
   - Stock increased by return quantity
   - Use for: Excess quantities in good condition

2. **Dispose** (no stock return)
   - Items NOT returned to inventory
   - Stock levels unchanged
   - Use for: Damaged, expired, quality issues

**Implementation:**

- Returns are line items on invoices with `is_return = true`
- Quantities are negative
- Amounts are negative (deducted from invoice total)

### 2.4 Payment Collection (Credit Sales)

**Payment Allocation System:**

```
payments
├── outlet_id
├── payment_date
├── amount
├── payment_method (cash|bank_transfer|check)
├── check_number
├── check_date
├── clearance_date
├── reference
└── notes

payment_allocations (links payments to invoices)
├── payment_id
├── invoice_id
└── allocated_amount
```

**Payment Workflow:**

1. Customer makes payment
2. Payment record created
3. Payment allocated to specific invoices
4. Invoice `paid_amount` updated
5. Invoice `payment_status` updated (unpaid → partial → paid)
6. Outlet balance adjusted

### 2.5 Stock Management

**Stock Updates During Sales:**

- **Sales Items:** Stock DECREASED by quantity sold
- **Return to Stock:** Stock INCREASED by return quantity
- **Dispose Returns:** Stock UNCHANGED

**Critical Business Rule:**

- Stock validation must occur BEFORE invoice creation
- Insufficient stock = Transaction rejected

---

## 3. Sales Flow Workflow

### 3.1 Standard Sales Flow

```
1. Select Outlet
   └─> Load outlet info (balance, credit limit, default discount)

2. Select Sales Representative (optional)
   └─> Employee reference for commission tracking

3. Select Route (optional)
   └─> Route-based organization

4. Add Sales Items
   ├─> Select Product SKU
   ├─> Enter Quantity
   ├─> Validate Stock Availability
   ├─> Apply Discount (line-level)
   └─> Calculate Line Total

5. Add Return Items (if any)
   ├─> Select Product SKU
   ├─> Enter Return Quantity
   ├─> Select Return Reason
   ├─> Choose: Return to Stock OR Dispose
   └─> Calculate Return Deduction

6. Calculate Invoice Totals
   ├─> Subtotal = Sum of sales items
   ├─> Discount = Sum of all discounts
   ├─> Returns = Sum of return amounts
   └─> Grand Total = Subtotal - Discount - Returns

7. Select Payment Method
   ├─> Cash → Status: Paid, No balance update
   ├─> Credit → Status: Unpaid, Balance increased
   └─> Check → Status: Unpaid, Record check details

8. Submit Invoice
   ├─> Generate invoice number (INV-YYYY-####)
   ├─> Create invoice record
   ├─> Create invoice items
   ├─> Update product SKU stock
   ├─> Update outlet balance (if credit)
   └─> Return invoice confirmation
```

### 3.2 Payment Collection Flow (Credit Sales)

```
1. Identify Outlet with Outstanding Balance

2. Record Payment
   ├─> Enter payment amount
   ├─> Select payment method (cash|bank_transfer|check)
   └─> Record reference/notes

3. Allocate Payment to Invoices
   ├─> Select unpaid/partial invoices
   ├─> Allocate amounts (total must = payment amount)
   └─> Validate allocation doesn't exceed outstanding

4. Process Payment
   ├─> Create payment record
   ├─> Create payment allocations
   ├─> Update invoice paid_amount
   ├─> Update invoice payment_status
   └─> Decrease outlet balance
```

---

## 4. Key Business Rules (Documented)

### 4.1 Invoice Creation

- **Minimum 1 item** required (sales or return)
- **Stock validation** mandatory before submission
- **Auto-generated invoice numbers** (INV-YYYY-####)
- **Credit limit checking** for credit sales
- **Negative quantities** for returns

### 4.2 Payment Processing

- **Payment must equal allocated amount** exactly
- **Allocations must match outlet** and belong to same outlet
- **Cannot over-allocate** payment to invoices
- **Check payments** require number and date

### 4.3 Stock Management

- **FIFO not mentioned** for sales (only for production)
- **Real-time stock deduction** on invoice creation
- **Stock reversal** on invoice deletion
- **Return to stock** is optional for returns

### 4.4 Credit Management

- Outlets have **credit limits**
- **Available credit** = Credit Limit - Current Balance
- **Balance increases** with credit sales
- **Balance decreases** with payments

---

## 5. Reporting Features (Documented)

### 5.1 Sales Reports

- **Sales by Route** (daily breakdown)
- **Receivables Aging** (30/60/90+ days)
- **Sales Profit Summary** (daily/monthly)
- **Product Returns Summary**
- **Employee Performance** (by sales ref)
- **Check Status Tracking** (pending/cleared/overdue)

### 5.2 Profit Calculation

```
Per Item:
├─> Revenue = Unit Price × Quantity
├─> Cost = Average Cost × Quantity
├─> Profit = Revenue - Cost
└─> Margin = (Profit / Revenue) × 100

Per Invoice:
└─> Sum of all item profits

Summary Reports:
└─> Aggregated by period (daily/monthly)
```

---

## 6. Data Integrity & Constraints

### 6.1 Database Constraints

- **Unique invoice numbers** (per system)
- **Foreign key integrity** (outlets, employees, routes, SKUs)
- **Cascade delete** for invoice_items when invoice deleted
- **Indexed fields** for performance (invoice_number, dates, status)

### 6.2 Transaction Safety

- **All operations atomic** (all-or-nothing)
- **Rollback on error** preserves data integrity
- **Stock updates transactional** with invoice creation

---

## 7. Outstanding Features

### 7.1 Documented but Not Detailed

- **PDF Invoice Generation** (placeholder mentioned)
- **Vehicle Stock Management** (table exists, usage unclear)
- **Multi-currency** (not mentioned - assumed single currency LKR)

### 7.2 Advanced Features

- **Batch invoice processing** (not mentioned)
- **Invoice modification** (limited to notes and status only)
- **Invoice voiding/cancellation** (delete with reversal only)

---

## 8. Critical Gaps in Documentation

1. **Outlet Credit Limit Enforcement**
   - Is it validated during invoice creation?
   - What happens when limit exceeded?

2. **Check Clearance Process**
   - Who updates clearance_date?
   - What happens to payment status when check bounces?

3. **Partial Payment Handling**
   - Detailed workflow for partial allocations
   - Multiple payments per invoice

4. **Return Validation**
   - Can returns exceed original purchase quantity?
   - Time limits for returns?

5. **Stock Adjustment Integration**
   - How stock_adjustments table relates to sales
   - Manual corrections for discrepancies

6. **Route-Vehicle Assignment**
   - How route assignment affects invoice creation
   - Vehicle stock vs. warehouse stock

---

## 9. Summary

**Strengths:**

- ✅ Clear invoice structure with returns support
- ✅ Flexible payment methods
- ✅ Comprehensive payment allocation system
- ✅ Transaction safety emphasized
- ✅ Good reporting capabilities

**Weaknesses:**

- ❌ Missing detailed workflows for edge cases
- ❌ Credit limit enforcement unclear
- ❌ Check bounce handling not defined
- ❌ Return validation rules incomplete
- ❌ Vehicle stock integration unclear

**Recommendations:**

- Document credit limit validation process
- Define check payment lifecycle completely
- Clarify return business rules
- Specify invoice modification rules
- Add validation rules documentation

---

**End of Documentation Analysis**
