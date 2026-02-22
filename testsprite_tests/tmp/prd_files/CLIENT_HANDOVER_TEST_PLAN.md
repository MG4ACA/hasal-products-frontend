# Client Handover - Comprehensive System Test Plan

## Hasal Products Spices Manufacturing & Distribution POS System

**Test Plan Version:** 1.0  
**Date:** February 15, 2026  
**Purpose:** Complete A-Z system validation for client handover

---

## 1. TEST OVERVIEW

### 1.1 System Modules to Test

1. Authentication & User Management
2. Outlets Management
3. Suppliers Management
4. Raw Materials & Inventory
5. Products & Recipes
6. Purchase Orders (Raw Materials)
7. Production Management
8. Batch Management
9. Sales & Invoicing
10. Returns Management (Sales & Purchase)
11. Route Management
12. Employee Management
13. Payments (Supplier & Customer)
14. Expense Tracking
15. Reporting & Analytics
16. Dashboard & Analytics

### 1.2 Test Environment

- **Frontend:** Vue 3 + Vite (Port 5173)
- **Backend:** Node.js + Express (Port 3000)
- **Database:** MySQL
- **Test Browsers:** Chrome, Firefox, Edge
- **Test Data:** Fresh database with seed data

---

## 2. PRE-TESTING CHECKLIST

### 2.1 Environment Setup

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Database connections verified
- [ ] All migrations applied
- [ ] Test data seeded (if applicable)
- [ ] All npm dependencies installed
- [ ] Environment variables configured

### 2.2 Test Accounts Required

- [ ] Admin account (full access)
- [ ] Manager account (outlet-specific)
- [ ] Cashier account (limited sales access)
- [ ] Production Manager account
- [ ] Accounts Manager account

---

## 3. MODULE-BY-MODULE TEST CASES

## 3.1 AUTHENTICATION & USER MANAGEMENT

### Test Case 3.1.1: User Login

**Priority:** Critical  
**Steps:**

1. Navigate to login page
2. Enter valid username/email
3. Enter valid password
4. Click Login button

**Expected Results:**

- ✓ Successful login redirects to dashboard
- ✓ User token stored in localStorage
- ✓ User role and permissions loaded
- ✓ Welcome message displays user name

**Test Data:**

- Admin: username, password
- Manager: username, password
- Cashier: username, password

### Test Case 3.1.2: Login Validation

**Priority:** Critical  
**Test Scenarios:**

- [ ] Empty username and password
- [ ] Invalid username
- [ ] Invalid password
- [ ] Incorrect username/password combination
- [ ] SQL injection attempts in login fields
- [ ] XSS attempts in login fields

**Expected Results:**

- ✓ Appropriate error messages shown
- ✓ No security vulnerabilities
- ✓ Login button disabled during processing
- ✓ Error messages clear and helpful

### Test Case 3.1.3: Role-Based Access Control (RBAC)

**Priority:** Critical  
**Test Scenarios:**

1. Login as Admin → Verify access to all modules
2. Login as Manager → Verify outlet-specific access
3. Login as Cashier → Verify sales-only access
4. Login as Production Manager → Verify production access
5. Login as Accounts Manager → Verify financial access

**Expected Results:**

- ✓ Navigation menu shows only authorized modules
- ✓ Direct URL access to unauthorized pages blocked
- ✓ API calls to unauthorized endpoints return 403
- ✓ Role-specific dashboard widgets displayed

### Test Case 3.1.4: Session Management

**Priority:** High  
**Test Scenarios:**

- [ ] Session persists on page refresh
- [ ] Session expires after timeout (if configured)
- [ ] Logout clears session data
- [ ] Logout redirects to login page
- [ ] Multiple browser tabs handle session correctly
- [ ] Session hijacking prevention

### Test Case 3.1.5: User Management (Admin Only)

**Priority:** High  
**Test Scenarios:**

- [ ] Create new user with all required fields
- [ ] Edit existing user information
- [ ] Deactivate user account
- [ ] Activate deactivated user
- [ ] Assign/change user role
- [ ] Assign outlet to user
- [ ] Password reset functionality
- [ ] View user activity logs

---

## 3.2 OUTLETS MANAGEMENT

### Test Case 3.2.1: Create Outlet

**Priority:** Critical  
**Steps:**

1. Navigate to Outlets
2. Click "Add Outlet" button
3. Enter outlet details:
   - Name
   - Address
   - Contact number
   - Email
   - Manager assignment
4. Click Save

**Expected Results:**

- ✓ Outlet created successfully
- ✓ Success notification shown
- ✓ Outlet appears in outlets list
- ✓ Outlet code auto-generated

**Validation Tests:**

- [ ] Required field validation
- [ ] Valid phone number format
- [ ] Valid email format
- [ ] Duplicate outlet name prevention
- [ ] Contact number length validation

### Test Case 3.2.2: Outlet Operations

**Priority:** High  
**Test Scenarios:**

- [ ] Edit outlet information
- [ ] View outlet details
- [ ] Deactivate outlet
- [ ] Activate outlet
- [ ] Assign manager to outlet
- [ ] Change outlet manager
- [ ] View outlet sales history
- [ ] View outlet inventory
- [ ] Search outlets by name/location

### Test Case 3.2.3: Outlet-Specific Data Filtering

**Priority:** Critical  
**Test Scenarios:**

1. Login as outlet manager
2. Verify only assigned outlet data visible:
   - [ ] Sales from assigned outlet only
   - [ ] Inventory from assigned outlet only
   - [ ] Employees from assigned outlet only
   - [ ] Reports filtered to assigned outlet

---

## 3.3 SUPPLIERS MANAGEMENT

### Test Case 3.3.1: Create Supplier

**Priority:** Critical  
**Steps:**

1. Navigate to Suppliers
2. Click "Add Supplier"
3. Enter supplier details:
   - Name
   - Contact person
   - Phone number
   - Email
   - Address
   - Payment terms
   - Credit limit
4. Click Save

**Expected Results:**

- ✓ Supplier created successfully
- ✓ Supplier code auto-generated
- ✓ Appears in suppliers list
- ✓ Available in purchase order dropdowns

**Validation Tests:**

- [ ] Required fields validation
- [ ] Email format validation
- [ ] Phone number validation
- [ ] Duplicate supplier detection
- [ ] Credit limit must be positive number

### Test Case 3.3.2: Supplier Operations

**Test Scenarios:**

- [ ] Edit supplier information
- [ ] View supplier details
- [ ] Deactivate/activate supplier
- [ ] View supplier transaction history
- [ ] View outstanding balance
- [ ] View purchase order history
- [ ] Search suppliers by name/code

### Test Case 3.3.3: Supplier Payments

**Priority:** High  
**Test Scenarios:**

- [ ] Record payment against purchase order
- [ ] Record advance payment
- [ ] View payment history
- [ ] View outstanding balance calculation
- [ ] Generate payment receipt
- [ ] Multiple payment methods (Cash, Bank, Cheque)
- [ ] Payment date validation

---

## 3.4 RAW MATERIALS & INVENTORY

### Test Case 3.4.1: Create Raw Material

**Priority:** Critical  
**Steps:**

1. Navigate to Raw Materials
2. Click "Add Raw Material"
3. Enter details:
   - Name
   - Code (auto-generated or manual)
   - Category
   - Unit of measurement
   - Reorder level
   - Unit price
4. Click Save

**Expected Results:**

- ✓ Raw material created successfully
- ✓ Available in purchase order
- ✓ Available in recipe creation
- ✓ Inventory initialized at 0

**Validation Tests:**

- [ ] Required fields validation
- [ ] Unique code validation
- [ ] Positive numbers for price/reorder level
- [ ] Valid unit of measurement

### Test Case 3.4.2: Raw Material Inventory Operations

**Priority:** Critical  
**Test Scenarios:**

- [ ] View current stock levels
- [ ] View stock by outlet
- [ ] Low stock alerts (below reorder level)
- [ ] View stock movement history
- [ ] Stock adjustment functionality
- [ ] Stock transfer between outlets
- [ ] Inventory valuation report

### Test Case 3.4.3: Stock Level Calculations

**Priority:** Critical  
**Verification Points:**

- [ ] Stock increases on purchase order receipt
- [ ] Stock decreases on production consumption
- [ ] Stock adjustments reflect immediately
- [ ] Stock transfers update both outlets
- [ ] Stock history accurate and complete
- [ ] Running balance calculations correct

---

## 3.5 PRODUCTS & RECIPES

### Test Case 3.5.1: Create Product

**Priority:** Critical  
**Steps:**

1. Navigate to Products
2. Click "Add Product"
3. Enter product details:
   - Name
   - Code
   - Category
   - Unit price
   - Unit of measurement
   - Barcode
4. Click Save

**Expected Results:**

- ✓ Product created successfully
- ✓ Available in sales module
- ✓ Product code unique
- ✓ Barcode scannable (if provided)

### Test Case 3.5.2: Create Recipe

**Priority:** Critical  
**Steps:**

1. Navigate to Products → Select product
2. Click "Add Recipe"
3. Enter recipe details:
   - Recipe name
   - Output quantity
   - Add raw materials with quantities
   - Add instructions
4. Click Save

**Expected Results:**

- ✓ Recipe created and linked to product
- ✓ Raw materials quantities validated
- ✓ Recipe cost calculated automatically
- ✓ Recipe appears in production module

**Validation Tests:**

- [ ] Must add at least one raw material
- [ ] Quantities must be positive
- [ ] Raw materials must exist
- [ ] Output quantity must be positive
- [ ] Recipe cost calculation accurate

### Test Case 3.5.3: Recipe Operations

**Test Scenarios:**

- [ ] Edit recipe and update materials
- [ ] Delete recipe (check constraints)
- [ ] View recipe cost breakdown
- [ ] Clone recipe to create variant
- [ ] Multiple recipes per product
- [ ] Activate/deactivate recipe
- [ ] Recipe version history

### Test Case 3.5.4: Product Categories

**Test Scenarios:**

- [ ] Create product category
- [ ] Edit category
- [ ] Delete category (check if products exist)
- [ ] Assign products to categories
- [ ] Filter products by category
- [ ] Category hierarchy (if applicable)

---

## 3.6 PURCHASE ORDERS (Raw Materials)

### Test Case 3.6.1: Create Purchase Order

**Priority:** Critical  
**Steps:**

1. Navigate to Purchase Orders
2. Click "Create Purchase Order"
3. Select supplier
4. Select outlet
5. Add raw materials:
   - Select material
   - Enter quantity
   - Enter unit price
   - View subtotal
6. Review total amount
7. Click Save

**Expected Results:**

- ✓ PO created with status "Pending"
- ✓ PO number auto-generated
- ✓ Total calculated correctly
- ✓ PO appears in pending list
- ✓ Supplier balance updated

**Validation Tests:**

- [ ] Supplier required
- [ ] Outlet required
- [ ] At least one item required
- [ ] Quantities must be positive
- [ ] Prices must be positive
- [ ] Total calculation accurate

### Test Case 3.6.2: Purchase Order Lifecycle

**Priority:** Critical  
**Test Status Flow:**

1. Create PO → Status: Pending
2. Submit PO → Status: Submitted
3. Receive PO → Status: Received (update inventory)
4. Complete PO → Status: Completed

**Test Scenarios:**

- [ ] Status transitions valid
- [ ] Cannot skip status steps
- [ ] Inventory updates on receipt
- [ ] Partial receipts allowed
- [ ] Multiple receipts for one PO
- [ ] PO cannot be edited after submission
- [ ] Cancel PO functionality

### Test Case 3.6.3: Purchase Order Receiving

**Priority:** Critical  
**Steps:**

1. Navigate to pending POs
2. Select PO
3. Click "Receive"
4. Enter received quantities (may differ from ordered)
5. Enter actual prices (may differ from quoted)
6. Add notes (if any damage/issues)
7. Click Save

**Expected Results:**

- ✓ Inventory updated with received quantities
- ✓ Stock appears in outlet inventory
- ✓ PO status updated
- ✓ Stock movement record created
- ✓ Supplier balance updated with actual amount

**Validation Tests:**

- [ ] Received quantity can't exceed ordered (or warning shown)
- [ ] Price variations tracked
- [ ] Partial receives accumulate correctly
- [ ] Stock movement audit trail complete

### Test Case 3.6.4: Purchase Order Reports

**Test Scenarios:**

- [ ] View all purchase orders
- [ ] Filter by supplier
- [ ] Filter by date range
- [ ] Filter by status
- [ ] View PO details/print
- [ ] Export PO list to Excel
- [ ] Purchase summary by supplier
- [ ] Purchase summary by material

---

## 3.7 PRODUCTION MANAGEMENT

### Test Case 3.7.1: Create Production Order

**Priority:** Critical  
**Steps:**

1. Navigate to Production
2. Click "Create Production Order"
3. Select product
4. Select recipe
5. Enter production quantity
6. System shows required materials
7. Select outlet
8. Set production date
9. Click Save

**Expected Results:**

- ✓ Production order created (Status: Pending)
- ✓ Required materials calculated correctly
- ✓ Material availability checked
- ✓ Order number generated
- ✓ Appears in production queue

**Validation Tests:**

- [ ] Product and recipe required
- [ ] Quantity must be positive
- [ ] Material availability warning if insufficient stock
- [ ] Outlet required
- [ ] Date cannot be future (or allowed based on business rule)
- [ ] Required materials calculation accurate (quantity × recipe ratios)

### Test Case 3.7.2: Material Availability Check

**Priority:** Critical  
**Test Scenarios:**

1. Create production order with sufficient materials:
   - [ ] Order created successfully
   - [ ] No warnings shown

2. Create production order with insufficient materials:
   - [ ] Warning/error shown
   - [ ] Specifies which materials are short
   - [ ] Shows available vs required quantities
   - [ ] Option to proceed or cancel

3. Partial material availability:
   - [ ] System suggests reduced production quantity
   - [ ] Shows maximum producible quantity

### Test Case 3.7.3: Start Production

**Priority:** Critical  
**Steps:**

1. Select pending production order
2. Click "Start Production"
3. Verify material deduction preview
4. Confirm start
5. Status changes to "In Progress"

**Expected Results:**

- ✓ Raw materials deducted from inventory
- ✓ Material consumption recorded
- ✓ Stock movement entries created
- ✓ Status changed to "In Progress"
- ✓ Production cannot be started if materials insufficient

### Test Case 3.7.4: Complete Production

**Priority:** Critical  
**Steps:**

1. Select "In Progress" production order
2. Click "Complete Production"
3. Enter actual output quantity (may differ from planned)
4. Enter wastage quantity (if any)
5. Add notes
6. Click Save

**Expected Results:**

- ✓ Finished goods added to inventory
- ✓ Batch created with production details
- ✓ Status changed to "Completed"
- ✓ Wastage recorded if applicable
- ✓ Product stock increased
- ✓ Production cost calculated

**Validation Tests:**

- [ ] Output quantity positive
- [ ] Wastage tracked separately
- [ ] Yield percentage calculated (actual/planned)
- [ ] Production date cannot be future
- [ ] Cost calculation: (materials used × prices) / output quantity

### Test Case 3.7.5: Production Reports

**Test Scenarios:**

- [ ] View all production orders
- [ ] Filter by product
- [ ] Filter by date range
- [ ] Filter by status
- [ ] View production efficiency report
- [ ] View wastage report
- [ ] View cost per unit report
- [ ] Material consumption report
- [ ] Production capacity analysis

---

## 3.8 BATCH MANAGEMENT

### Test Case 3.8.1: Batch Creation (Auto)

**Priority:** High  
**Trigger:** Production order completion

**Expected Results:**

- ✓ Batch created automatically
- ✓ Batch number unique and sequential
- ✓ Linked to production order
- ✓ Manufacturing date recorded
- ✓ Expiry date calculated (if applicable)
- ✓ Quantity matches production output
- ✓ Cost per unit calculated

### Test Case 3.8.2: Batch Tracking in Sales

**Priority:** High  
**Test Scenarios:**

1. Create sale with batched product:
   - [ ] Batch selection available
   - [ ] Oldest batch suggested (FIFO)
   - [ ] Batch quantity validated
   - [ ] Multiple batches selectable for one sale

2. View batch information:
   - [ ] Manufacturing date
   - [ ] Expiry date
   - [ ] Original quantity
   - [ ] Remaining quantity
   - [ ] Unit cost
   - [ ] Sales history

### Test Case 3.8.3: Batch Expiry Management

**Test Scenarios:**

- [ ] Near-expiry batch alerts (30 days)
- [ ] Expired batch handling
- [ ] Cannot sell expired batches
- [ ] Batch disposal/writeoff process
- [ ] Expiry report generation

### Test Case 3.8.4: Batch Reports

**Test Scenarios:**

- [ ] View all batches
- [ ] Filter by product
- [ ] Filter by date range
- [ ] View batch movement history
- [ ] Near-expiry batches report
- [ ] Batch profitability analysis
- [ ] Batch cost vs revenue report

---

## 3.9 SALES & INVOICING

### Test Case 3.9.1: Create Cash Sale

**Priority:** Critical  
**Steps:**

1. Navigate to Sales
2. Click "New Sale"
3. Select outlet
4. Select customer (optional for cash sale)
5. Add products:
   - Scan barcode or select product
   - Enter quantity
   - Verify price
   - Apply discount (if any)
6. Review cart
7. Enter payment amount
8. Click "Complete Sale"

**Expected Results:**

- ✓ Invoice generated with unique number
- ✓ Inventory reduced immediately
- ✓ Cash payment recorded
- ✓ Receipt printable
- ✓ Invoice appears in sales list
- ✓ Dashboard stats updated

**Validation Tests:**

- [ ] Outlet required
- [ ] At least one product required
- [ ] Quantities must be positive
- [ ] Stock availability checked
- [ ] Discount percentage ≤ 100%
- [ ] Payment amount ≥ total amount
- [ ] Change calculated correctly
- [ ] Subtotal, tax, discount calculations accurate

### Test Case 3.9.2: Create Credit Sale

**Priority:** Critical  
**Steps:**

1. Create sale as above
2. Select customer (required for credit)
3. Select payment method: "Credit"
4. Check credit limit
5. Complete sale

**Expected Results:**

- ✓ Sale recorded as credit
- ✓ Customer balance increased
- ✓ Credit limit warning if exceeded
- ✓ Invoice marked as unpaid
- ✓ Appears in accounts receivable

**Validation Tests:**

- [ ] Customer required for credit sale
- [ ] Credit limit validation
- [ ] Warning if limit exceeded (allow/block based on config)
- [ ] Customer balance updated
- [ ] Payment terms displayed

### Test Case 3.9.3: Invoice Operations

**Test Scenarios:**

- [ ] View invoice details
- [ ] Print invoice
- [ ] Email invoice (if configured)
- [ ] Edit invoice (before completion)
- [ ] Cancel/void invoice
- [ ] View invoice payment history
- [ ] Search invoices by number/customer/date
- [ ] Export invoices to PDF/Excel

### Test Case 3.9.4: Payment Collection (Credit Sales)

**Priority:** Critical  
**Steps:**

1. Navigate to Accounts Receivable
2. Select customer with outstanding balance
3. Click "Receive Payment"
4. Select invoices to pay
5. Enter payment amount
6. Select payment method
7. Enter payment date
8. Add reference number (if bank/cheque)
9. Click Save

**Expected Results:**

- ✓ Payment recorded against invoices
- ✓ Customer balance reduced
- ✓ Invoice status updated (partial/full payment)
- ✓ Payment receipt generated
- ✓ Cash/bank account updated

**Validation Tests:**

- [ ] Payment amount ≤ outstanding balance
- [ ] Payment amount > 0
- [ ] Payment date validation
- [ ] Multiple invoices payable in one transaction
- [ ] Partial payments allowed
- [ ] Payment allocation tracked per invoice

### Test Case 3.9.5: Sales with Batch Selection

**Priority:** High  
**Test Scenarios:**

1. Add batched product to sale:
   - [ ] Batch selection interface appears
   - [ ] Available batches listed
   - [ ] Batch details shown (mfg date, expiry, qty)
   - [ ] FIFO batch auto-selected
   - [ ] Manual batch selection allowed
   - [ ] Cannot sell from expired batch
   - [ ] Cannot sell more than batch quantity

### Test Case 3.9.6: Sales Discounts

**Test Scenarios:**

- [ ] Line item discount (% or amount)
- [ ] Invoice-level discount
- [ ] Maximum discount validation (role-based)
- [ ] Discount reason required (if configured)
- [ ] Discount approval workflow (if configured)
- [ ] Discount reflected in total calculation
- [ ] Discount reported separately

### Test Case 3.9.7: Sales Reports

**Test Scenarios:**

- [ ] Daily sales summary
- [ ] Sales by outlet
- [ ] Sales by product
- [ ] Sales by customer
- [ ] Sales by payment method
- [ ] Salesperson performance
- [ ] Hourly sales pattern
- [ ] Top-selling products
- [ ] Slow-moving products

---

## 3.10 RETURNS MANAGEMENT

### Test Case 3.10.1: Sales Return

**Priority:** High  
**Steps:**

1. Navigate to Returns
2. Click "Sales Return"
3. Enter/search invoice number
4. Invoice details loaded
5. Select items to return
6. Enter return quantities
7. Enter return reason
8. Select refund method (Cash/Credit Note)
9. Click Save

**Expected Results:**

- ✓ Return recorded with unique number
- ✓ Inventory increased
- ✓ Batch stock restored (if batched)
- ✓ Refund processed (cash) or credit note created
- ✓ Original invoice updated with return reference
- ✓ Customer balance adjusted (if credit sale)

**Validation Tests:**

- [ ] Valid invoice number required
- [ ] Return quantity ≤ original invoice quantity
- [ ] Reason required
- [ ] Return within allowed period (policy check)
- [ ] Refund amount calculated correctly
- [ ] Cannot return already returned items

### Test Case 3.10.2: Purchase Return

**Priority:** High  
**Steps:**

1. Navigate to Returns
2. Click "Purchase Return"
3. Select supplier
4. Select purchase order
5. Select items to return
6. Enter return quantities
7. Enter return reason
8. Generate debit note
9. Click Save

**Expected Results:**

- ✓ Return recorded
- ✓ Inventory decreased
- ✓ Supplier balance reduced
- ✓ Debit note generated
- ✓ Purchase order updated with return reference

**Validation Tests:**

- [ ] Valid PO required
- [ ] Return quantity ≤ received quantity
- [ ] Reason required
- [ ] Debit note amount calculated
- [ ] Inventory adjustment accurate

### Test Case 3.10.3: Return Reports

**Test Scenarios:**

- [ ] Sales returns summary
- [ ] Purchase returns summary
- [ ] Returns by reason
- [ ] Returns by product
- [ ] Return rate analysis
- [ ] Return trends over time

---

## 3.11 ROUTE MANAGEMENT

### Test Case 3.11.1: Create Route

**Priority:** Medium  
**Steps:**

1. Navigate to Routes
2. Click "Add Route"
3. Enter route details:
   - Name
   - Code
   - Description
   - Assigned salesperson
4. Add customers to route
5. Set visit sequence
6. Click Save

**Expected Results:**

- ✓ Route created successfully
- ✓ Route code unique
- ✓ Customers linked to route
- ✓ Visit sequence saved

### Test Case 3.11.2: Route Operations

**Test Scenarios:**

- [ ] Edit route details
- [ ] Add/remove customers from route
- [ ] Reassign route to different salesperson
- [ ] Deactivate/activate route
- [ ] View route performance
- [ ] Optimize route sequence

### Test Case 3.11.3: Route Sales Tracking

**Test Scenarios:**

- [ ] Record route visit
- [ ] Create sale during route visit
- [ ] Mark customer as visited/not visited
- [ ] Record visit notes
- [ ] View route completion status
- [ ] Route sales vs target comparison

---

## 3.12 EMPLOYEE MANAGEMENT

### Test Case 3.12.1: Create Employee

**Priority:** High  
**Steps:**

1. Navigate to Employees
2. Click "Add Employee"
3. Enter employee details:
   - Name
   - Employee ID
   - Contact information
   - Designation
   - Department
   - Outlet assignment
   - Salary (optional)
4. Create user account (optional)
5. Click Save

**Expected Results:**

- ✓ Employee created
- ✓ Employee ID unique
- ✓ User account created if selected
- ✓ Appears in employee list

### Test Case 3.12.2: Employee Operations

**Test Scenarios:**

- [ ] Edit employee information
- [ ] View employee details
- [ ] Assign employee to outlet
- [ ] Change employee designation
- [ ] Deactivate/activate employee
- [ ] Link user account to employee
- [ ] View employee sales performance (if salesperson)

### Test Case 3.12.3: Employee Reports

**Test Scenarios:**

- [ ] Employee directory
- [ ] Employees by outlet
- [ ] Employees by designation
- [ ] Active/inactive employees
- [ ] Employee sales performance

---

## 3.13 EXPENSE TRACKING

### Test Case 3.13.1: Record Expense

**Priority:** High  
**Steps:**

1. Navigate to Expenses
2. Click "Add Expense"
3. Enter expense details:
   - Outlet
   - Category
   - Amount
   - Date
   - Description
   - Payment method
   - Receipt number
4. Upload receipt (optional)
5. Click Save

**Expected Results:**

- ✓ Expense recorded
- ✓ Expense number generated
- ✓ Affects outlet financials
- ✓ Appears in expense list

**Validation Tests:**

- [ ] Outlet required
- [ ] Category required
- [ ] Amount must be positive
- [ ] Date cannot be future
- [ ] Description required

### Test Case 3.13.2: Expense Categories

**Test Scenarios:**

- [ ] Create expense category
- [ ] Edit category
- [ ] Deactivate category
- [ ] Assign expenses to categories
- [ ] Budget limits per category (if applicable)

### Test Case 3.13.3: Expense Reports

**Test Scenarios:**

- [ ] Expenses by category
- [ ] Expenses by outlet
- [ ] Expenses by date range
- [ ] Expense vs budget comparison
- [ ] Expense trends
- [ ] Export expenses to Excel

---

## 3.14 PAYMENTS MODULE

### Test Case 3.14.1: Supplier Payments

**Priority:** High  
**Covered in Section 3.3.3**

### Test Case 3.14.2: Customer Payments

**Priority:** High  
**Covered in Section 3.9.4**

### Test Case 3.14.3: Payment Reports

**Test Scenarios:**

- [ ] Supplier payment history
- [ ] Customer payment history
- [ ] Payment by method (Cash/Bank/Cheque)
- [ ] Outstanding payables
- [ ] Outstanding receivables
- [ ] Aging report (receivables)
- [ ] Aging report (payables)
- [ ] Payment collection performance

---

## 3.15 REPORTING & ANALYTICS

### Test Case 3.15.1: Financial Reports

**Priority:** Critical  
**Test Scenarios:**

- [ ] Profit & Loss Statement
  - Revenue
  - Cost of Goods Sold
  - Gross Profit
  - Operating Expenses
  - Net Profit
  - Date range filtering
  - Outlet filtering

- [ ] Balance Sheet
  - Assets (Inventory, Receivables, Cash)
  - Liabilities (Payables)
  - Equity

- [ ] Cash Flow Statement
  - Operating activities
  - Cash inflows
  - Cash outflows
  - Net cash flow

### Test Case 3.15.2: Sales Reports

**Test Scenarios:**

- [ ] Daily sales report
- [ ] Monthly sales summary
- [ ] Sales by product
- [ ] Sales by category
- [ ] Sales by outlet
- [ ] Sales by customer
- [ ] Sales by salesperson
- [ ] Sales trends (graphs)
- [ ] Top-selling products
- [ ] Sales vs target

### Test Case 3.15.3: Inventory Reports

**Test Scenarios:**

- [ ] Current stock levels
- [ ] Stock by outlet
- [ ] Stock movement report
- [ ] Low stock alerts
- [ ] Overstock items
- [ ] Stock valuation
- [ ] Inventory aging
- [ ] Dead stock analysis
- [ ] Stock turnover ratio

### Test Case 3.15.4: Production Reports

**Test Scenarios:**

- [ ] Production summary
- [ ] Production by product
- [ ] Production efficiency
- [ ] Wastage report
- [ ] Cost of production
- [ ] Material consumption
- [ ] Yield analysis

### Test Case 3.15.5: Purchase Reports

**Test Scenarios:**

- [ ] Purchase orders summary
- [ ] Purchase by supplier
- [ ] Purchase by material
- [ ] Purchase trends
- [ ] Supplier performance
- [ ] Price variance report

### Test Case 3.15.6: Report Export & Print

**Test Scenarios:**

- [ ] Export to PDF
- [ ] Export to Excel
- [ ] Print report
- [ ] Email report
- [ ] Schedule recurring reports

---

## 3.16 DASHBOARD & ANALYTICS

### Test Case 3.16.1: Dashboard Widgets

**Priority:** High  
**Test Scenarios:**

- [ ] Today's sales (amount & count)
- [ ] This month's sales
- [ ] Revenue chart (daily/weekly/monthly)
- [ ] Top-selling products
- [ ] Low stock alerts
- [ ] Recent invoices
- [ ] Outstanding receivables
- [ ] Outstanding payables
- [ ] Inventory value
- [ ] Profit margin

### Test Case 3.16.2: Dashboard Filtering

**Test Scenarios:**

- [ ] Date range filter
- [ ] Outlet filter (admin view)
- [ ] Real-time data refresh
- [ ] Drill-down capability

### Test Case 3.16.3: Analytics Charts

**Test Scenarios:**

- [ ] Sales trend chart
- [ ] Product category performance
- [ ] Revenue vs expenses
- [ ] Customer purchase patterns
- [ ] Supplier comparison
- [ ] Interactive charts (tooltips, zoom)

---

## 4. INTEGRATION TESTING

### Test Case 4.1: End-to-End Purchase to Sale Flow

**Priority:** Critical  
**Flow:**

1. Create supplier
2. Create raw materials
3. Create purchase order
4. Receive purchase order → Stock increases
5. Create product with recipe
6. Create production order
7. Start production → Raw materials decrease
8. Complete production → Finished goods increase
9. Create sale → Finished goods decrease, revenue recorded
10. Verify inventory movements
11. Verify financial reports

**Verification Points:**

- [ ] Stock levels accurate at each step
- [ ] Financial transactions recorded correctly
- [ ] Reports reflect all transactions
- [ ] No data inconsistencies

### Test Case 4.2: Credit Sale to Payment Flow

**Priority:** Critical  
**Flow:**

1. Create customer
2. Create credit sale
3. Verify customer balance increased
4. Verify invoice marked as unpaid
5. Receive partial payment
6. Verify invoice marked as partial
7. Verify customer balance reduced
8. Receive full payment
9. Verify invoice marked as paid
10. Verify customer balance zero

### Test Case 4.3: Production with Insufficient Materials

**Priority:** High  
**Flow:**

1. Check current raw material stock
2. Create production order requiring more materials
3. Verify warning shown
4. Create purchase order for materials
5. Receive purchase order
6. Retry production order
7. Verify production successful

### Test Case 4.4: Multi-Outlet Inventory Transfer

**Priority:** High  
**Flow:**

1. Create stock in Outlet A
2. Transfer stock to Outlet B
3. Verify Outlet A stock decreased
4. Verify Outlet B stock increased
5. Verify transfer recorded in stock movements
6. Cannot oversell from Outlet A

### Test Case 4.5: Returns and Inventory Restoration

**Priority:** High  
**Flow:**

1. Create sale with batched product
2. Batch quantity decreased
3. Create sales return
4. Verify batch quantity increased
5. Verify inventory restored
6. Verify refund processed

---

## 5. DATA VALIDATION & BUSINESS RULES

### Test Case 5.1: Stock Consistency

**Priority:** Critical  
**Verification:**

- [ ] Stock never goes negative
- [ ] Stock movements balance (in = out + current)
- [ ] Batch quantities sum to total stock
- [ ] Reserved stock calculations correct
- [ ] Stock across outlets sums to total stock

### Test Case 5.2: Financial Consistency

**Priority:** Critical  
**Verification:**

- [ ] Sales revenue = invoice totals
- [ ] COGS calculations accurate
- [ ] Customer balances = unpaid invoices
- [ ] Supplier balances = unpaid POs
- [ ] Cash/bank balances reconcile
- [ ] Profit calculations (Revenue - COGS - Expenses) correct

### Test Case 5.3: Access Control

**Priority:** Critical  
**Verification:**

- [ ] Users see only authorized outlets
- [ ] Managers cannot access admin functions
- [ ] Cashiers limited to sales only
- [ ] API endpoints enforce permissions
- [ ] Direct URL access blocked for unauthorized pages

### Test Case 5.4: Audit Trail

**Priority:** High  
**Verification:**

- [ ] All transactions logged
- [ ] User actions tracked
- [ ] Timestamps accurate
- [ ] Cannot delete audit logs
- [ ] Audit logs searchable

### Test Case 5.5: Date/Time Handling

**Priority:** High  
**Verification:**

- [ ] Future dates blocked where appropriate
- [ ] Date formats consistent
- [ ] Timezone handling correct
- [ ] Date range filters work correctly
- [ ] Date sorting accurate

---

## 6. PERFORMANCE TESTING

### Test Case 6.1: Load Testing

**Test Scenarios:**

- [ ] Dashboard loads in < 2 seconds
- [ ] Sales transaction completes in < 1 second
- [ ] Reports generate in < 5 seconds
- [ ] Search results in < 1 second
- [ ] Page navigation responsive
- [ ] Concurrent users (5, 10, 20 users simultaneously)

### Test Case 6.2: Data Volume Testing

**Test Scenarios:**

- [ ] 10,000+ invoices in system
- [ ] 1,000+ products
- [ ] 100+ users
- [ ] 50+ outlets
- [ ] Large report generation (1 year data)
- [ ] Pagination works correctly

### Test Case 6.3: Database Performance

**Test Scenarios:**

- [ ] Query optimization for large datasets
- [ ] Index usage verified
- [ ] No N+1 query problems
- [ ] Connection pooling configured
- [ ] Database backup/restore tested

---

## 7. SECURITY TESTING

### Test Case 7.1: Authentication Security

**Test Scenarios:**

- [ ] Password complexity requirements
- [ ] SQL injection prevention (login)
- [ ] XSS prevention (login)
- [ ] Brute force protection
- [ ] Session timeout
- [ ] Secure password storage (hashed)
- [ ] Password reset security

### Test Case 7.2: Authorization Security

**Test Scenarios:**

- [ ] Cannot access unauthorized API endpoints
- [ ] Cannot view other outlets' data (managers)
- [ ] Cannot perform unauthorized actions
- [ ] Token validation on every request
- [ ] Token expiration handled

### Test Case 7.3: Input Validation

**Test Scenarios:**

- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] File upload validation
- [ ] Maximum input length enforced
- [ ] Special character handling
- [ ] HTML in text fields sanitized

### Test Case 7.4: Data Protection

**Test Scenarios:**

- [ ] Sensitive data encrypted
- [ ] HTTPS configured (production)
- [ ] Database credentials secured
- [ ] API keys protected
- [ ] No sensitive data in logs
- [ ] Personal data privacy

---

## 8. UI/UX TESTING

### Test Case 8.1: Responsive Design

**Test Scenarios:**

- [ ] Desktop (1920×1080)
- [ ] Laptop (1366×768)
- [ ] Tablet (768×1024)
- [ ] Mobile (375×667)
- [ ] Navigation menu responsive
- [ ] Tables scrollable on small screens
- [ ] Forms usable on all devices

### Test Case 8.2: Browser Compatibility

**Test Browsers:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if Mac available)

### Test Case 8.3: User Interface

**Test Scenarios:**

- [ ] Navigation intuitive
- [ ] Buttons clearly labeled
- [ ] Icons meaningful
- [ ] Color coding consistent
- [ ] Forms well-organized
- [ ] Required fields marked
- [ ] Help text/tooltips available
- [ ] Loading indicators shown
- [ ] Error messages clear and helpful
- [ ] Success messages shown

### Test Case 8.4: Accessibility

**Test Scenarios:**

- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] Color contrast sufficient
- [ ] Screen reader compatible (basic)

---

## 9. ERROR HANDLING & EDGE CASES

### Test Case 9.1: Network Errors

**Test Scenarios:**

- [ ] API timeout handling
- [ ] Connection lost during transaction
- [ ] Retry mechanism
- [ ] Offline mode (if applicable)
- [ ] Error messages user-friendly

### Test Case 9.2: Database Errors

**Test Scenarios:**

- [ ] Database connection failure
- [ ] Duplicate key errors
- [ ] Foreign key constraint errors
- [ ] Transaction rollback on error
- [ ] Error logging

### Test Case 9.3: Edge Cases

**Test Scenarios:**

- [ ] Empty database (first use)
- [ ] Zero quantity transactions
- [ ] Very large numbers
- [ ] Very long text inputs
- [ ] Special characters in names
- [ ] Date boundaries (year end, month end)
- [ ] Negative number handling
- [ ] Division by zero prevention
- [ ] Null/undefined handling

---

## 10. BARCODE & PRINTING

### Test Case 10.1: Barcode Scanning

**Test Scenarios:**

- [ ] Scan product barcode in sales
- [ ] Barcode adds product to cart
- [ ] Duplicate barcode warning
- [ ] Invalid barcode handling
- [ ] Barcode search functionality

### Test Case 10.2: Receipt Printing

**Test Scenarios:**

- [ ] Print sales receipt
- [ ] Receipt format correct
- [ ] All details included (outlet, date, items, total)
- [ ] Barcode on receipt
- [ ] Print preview available
- [ ] Multiple copies

### Test Case 10.3: Report Printing

**Test Scenarios:**

- [ ] Print all report types
- [ ] Page breaks appropriate
- [ ] Headers and footers on each page
- [ ] Logo included
- [ ] Print landscape/portrait options

---

## 11. DATA IMPORT/EXPORT

### Test Case 11.1: Data Export

**Test Scenarios:**

- [ ] Export products to Excel
- [ ] Export sales to Excel
- [ ] Export inventory to Excel
- [ ] Export customers to Excel
- [ ] Export format correct (headers, data types)
- [ ] Large dataset export

### Test Case 11.2: Data Import

**Test Scenarios (if implemented):**

- [ ] Import products from Excel
- [ ] Import customers from Excel
- [ ] Validate data before import
- [ ] Error reporting for invalid rows
- [ ] Duplicate detection
- [ ] Transaction rollback on error
- [ ] Import progress indicator

---

## 12. BACKUP & RECOVERY

### Test Case 12.1: Database Backup

**Test Scenarios:**

- [ ] Manual backup creation
- [ ] Scheduled backup (if configured)
- [ ] Backup file location
- [ ] Backup file size reasonable
- [ ] Backup includes all tables

### Test Case 12.2: Database Recovery

**Test Scenarios:**

- [ ] Restore from backup
- [ ] Data integrity after restore
- [ ] Application functions after restore
- [ ] Foreign key relationships intact

---

## 13. CLIENT TRAINING VERIFICATION

### Test Case 13.1: User Manual

**Verification:**

- [ ] User manual available
- [ ] Covers all modules
- [ ] Step-by-step instructions with screenshots
- [ ] Troubleshooting section
- [ ] FAQ section
- [ ] Contact information

### Test Case 13.2: Training Completion

**Verification:**

- [ ] Admin trained on all modules
- [ ] Managers trained on outlet operations
- [ ] Cashiers trained on sales
- [ ] Production staff trained on production module
- [ ] Accounts staff trained on financial modules

### Test Case 13.3: Client Acceptance

**Verification:**

- [ ] Client performs tests independently
- [ ] Client confirms all features working
- [ ] Client signs acceptance document
- [ ] Client receives credentials
- [ ] Client receives backup procedures
- [ ] Support contact provided

---

## 14. TEST EXECUTION TRACKING

### Daily Test Log Template

| Date | Module | Test Case ID | Tester | Status | Issues Found | Notes |
| ---- | ------ | ------------ | ------ | ------ | ------------ | ----- |
|      |        |              |        | ✓/✗/⏸  |              |       |

### Status Codes

- ✓ = Passed
- ✗ = Failed
- ⏸ = Blocked/Pending
- ⚠ = Passed with issues

### Defect Tracking Template

| ID  | Severity                 | Module | Description | Steps to Reproduce | Status                        | Assigned To | Fixed Date |
| --- | ------------------------ | ------ | ----------- | ------------------ | ----------------------------- | ----------- | ---------- |
|     | Critical/High/Medium/Low |        |             |                    | Open/In Progress/Fixed/Closed |             |            |

---

## 15. SIGN-OFF CRITERIA

### 15.1 Functional Requirements

- [ ] All critical test cases passed (100%)
- [ ] All high-priority test cases passed (≥95%)
- [ ] All medium-priority test cases passed (≥90%)
- [ ] Known issues documented and accepted

### 15.2 Non-Functional Requirements

- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Browser compatibility verified
- [ ] Responsive design verified

### 15.3 Documentation

- [ ] User manual complete
- [ ] Technical documentation complete
- [ ] API documentation (if applicable)
- [ ] Database schema documented
- [ ] Deployment guide available

### 15.4 Training & Support

- [ ] Training completed
- [ ] Training materials provided
- [ ] Support process defined
- [ ] Maintenance plan agreed

### 15.5 Client Acceptance

- [ ] Client UAT completed
- [ ] All critical issues resolved
- [ ] Client sign-off obtained
- [ ] Handover meeting conducted

---

## 16. POST-DEPLOYMENT CHECKLIST

### 16.1 Production Environment

- [ ] Database configured
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Monitoring configured
- [ ] Error logging configured

### 16.2 Go-Live Day

- [ ] Final data migration
- [ ] System smoke test
- [ ] All users have credentials
- [ ] Support team on standby
- [ ] Rollback plan ready

### 16.3 Post-Launch Support

- [ ] Day 1: Monitor closely, resolve critical issues
- [ ] Week 1: Daily check-ins with client
- [ ] Month 1: Weekly reviews
- [ ] Warranty period defined

---

## 17. TEST AUTOMATION (Optional/Future)

### Automated Test Candidates

- [ ] Login flow automation
- [ ] Sales transaction automation
- [ ] Purchase order creation automation
- [ ] Report generation automation
- [ ] API endpoint testing
- [ ] Load testing scripts
- [ ] Regression test suite

---

## 18. RISK ASSESSMENT

### High-Risk Areas Requiring Extra Testing

1. **Financial Calculations:** Profit/loss, COGS, inventory valuation
2. **Inventory Management:** Stock consistency across transactions
3. **Multi-Outlet Data Segregation:** Ensure no data leakage
4. **Production Material Consumption:** Accurate deductions
5. **Credit Limit Management:** Prevent over-credit sales
6. **Batch Tracking:** FIFO compliance and expiry management
7. **Returns Processing:** Accurate inventory restoration
8. **Role-Based Access Control:** Authorization enforcement

---

## 19. CLIENT-SPECIFIC TESTING

### Customize Based on Client Setup

- [ ] Number of outlets: **\_**
- [ ] Number of users: **\_**
- [ ] Number of products: **\_**
- [ ] Average daily transactions: **\_**
- [ ] Peak transaction periods: **\_**
- [ ] Custom workflows: **\_**
- [ ] Integration requirements: **\_**
- [ ] Reporting requirements: **\_**

---

## 20. TEST EXECUTION SCHEDULE

### Suggested Timeline

**Week 1:**

- Day 1-2: Authentication, User Management, Outlets
- Day 3-4: Suppliers, Raw Materials, Products
- Day 5: Purchase Orders

**Week 2:**

- Day 1-2: Production Management, Batch Management
- Day 3-4: Sales & Invoicing
- Day 5: Returns Management

**Week 3:**

- Day 1: Routes, Employees, Expenses
- Day 2-3: Payments Module
- Day 4-5: Reports & Dashboard

**Week 4:**

- Day 1-2: Integration Testing
- Day 3: Performance & Security Testing
- Day 4: UI/UX Testing
- Day 5: Edge Cases & Error Handling

**Week 5:**

- Day 1-2: Client UAT
- Day 3: Bug Fixes
- Day 4: Regression Testing
- Day 5: Final Sign-off

---

## APPENDICES

### Appendix A: Test Data Requirements

- 5 Outlets
- 10 Suppliers
- 20 Raw Materials
- 30 Products with Recipes
- 20 Customers
- 15 Employees
- 50 Purchase Orders
- 100 Sales Invoices
- 20 Production Orders

### Appendix B: Test Environment Setup

```bash
# Backend
cd hasal-pos-backend
npm install
cp .env.example .env
# Configure database in .env
npm run migrate
npm start

# Frontend
cd ..
npm install
npm run dev
```

### Appendix C: Database Test Reset Script

```sql
-- Use with caution - this deletes all transactional data
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE production_orders;
TRUNCATE TABLE sales_items;
TRUNCATE TABLE sales;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE payments;
TRUNCATE TABLE expenses;
-- Add more as needed
```

### Appendix D: Test Credentials

```
Admin:
Username: admin
Password: [provided separately]

Manager:
Username: manager1
Password: [provided separately]

Cashier:
Username: cashier1
Password: [provided separately]
```

### Appendix E: Known Issues/Limitations

- Document any known issues that are acceptable for go-live
- Note any features marked as "Phase 2"
- List any browser/device limitations

---

## CONCLUSION

This comprehensive test plan ensures thorough validation of the Hasal Products Spices Manufacturing & Distribution POS System. All modules, integrations, and edge cases are covered to guarantee a successful client handover.

**Test Team:**

- Lead Tester: ********\_********
- Module Testers: ********\_********
- Client UAT Lead: ********\_********

**Approval:**

- Developer Sign-off: ********\_******** Date: **\_\_\_**
- Test Lead Sign-off: ********\_******** Date: **\_\_\_**
- Client Sign-off: ********\_******** Date: **\_\_\_**

---

**Document Version:** 1.0  
**Last Updated:** February 15, 2026  
**Next Review:** Post-UAT Phase
