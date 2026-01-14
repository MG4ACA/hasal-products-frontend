# Hasal Products - POS & Inventory Management System

## Requirements Document

**Client:** Hasal_Products  
**Project Type:** Web-based Point of Sale & Inventory Management System  
**Version:** 1.1 (Revised)  
**Date:** December 18, 2025

---

## 1. Executive Summary

Hasal_Products requires a comprehensive web-based POS and inventory management system to manage their spices delivery business. The system will handle:

- Raw material procurement from suppliers
- Production of spices using recipes
- Packaging into multiple SKU sizes
- Sales to outlets via delivery vehicles
- Credit management and outlet tracking
- Route-based outlet organization

---

## 2. Business Overview

### 2.1 Business Model

- **Company:** Hasal_Products (single warehouse location)
- **Operations:**
  - Purchase raw materials from suppliers
  - Produce spices using variable recipes with versioning
  - Package spices in multiple unit sizes
  - Sell packaged products to retail outlets via delivery vehicles
  - Track inventory by batch
  - Manage credit sales and payments

### 2.2 Key Stakeholders

- **Admin:** Full system access, configuration, reporting
- **Cashier:** Order entry, billing, payment processing
- **Sales Refs (Employees):** Collect orders from outlets, referenced in invoices (no system login)
- **Drivers (Employees):** Deliver products (no system login, may be same as Sales Ref)
- **Warehouse Workers:** Inventory handling (future role)
- **Outlets (Customers):** Retail shops purchasing spices

---

## 3. Functional Requirements

### 3.1 User Management & Roles

#### 3.1.1 User Roles

- **Admin**
  - Full system access
  - User management (create, edit, deactivate users)
  - System configuration
  - Access all reports
  - Manage pricing and discounts
- **Cashier**
  - Create and process outlet orders (on behalf of Sales Refs)
  - Record payments (cash/credit/check)
  - View outlet balances
  - Print invoices
  - Daily cash reconciliation
  - Manage employee records (Sales Refs, Drivers)

#### 3.1.2 Employee Management (Non-Login Users)

- **Sales Refs/Sales Representatives**
  - Employee master data (code, name, phone, assigned route)
  - Track which sales ref collected each order
  - Performance tracking (future: commission calculation)
- **Drivers**
  - Driver master data (code, name, phone, license)
  - Assign driver to vehicle
  - Track delivery history

#### 3.1.3 User Management Features

- Login/logout with password authentication
- Role-based access control
- User activity logging
- Password reset functionality

---

### 3.2 Supplier Management

#### 3.2.1 Supplier Master Data

- Supplier code (auto-generated)
- Supplier name
- Contact person
- Phone, email, address
- Payment terms (cash/credit)
- Current balance
- Status (active/inactive)

#### 3.2.2 Purchase Order Management

- Create purchase orders for raw materials
- PO number (auto-generated)
- Supplier selection
- Item details with quantities
- Expected delivery date
- PO status (pending, partial, received, cancelled)
- Record batch numbers on receipt
- Update inventory on PO receipt

#### 3.2.3 Supplier Payments & Returns

- Record supplier payments (cash/credit/check)
  - For check payments: track check number, check date, clearance date
- Track supplier balances
- Process supplier returns (reduce stock and supplier balance)
  - Add return items as negative quantities in PO
- Generate supplier ledger/statement
- Payment history tracking

---

### 3.3 Inventory Management

#### 3.3.1 Raw Material Inventory

- Item master (code, name, category, unit of measure)
- Batch/lot tracking (system-generated batch numbers)
- Quantity tracking by batch
- Reorder levels
- Purchase price per batch
- Stock valuation (FIFO/Average cost)

#### 3.3.2 Finished Goods Inventory

- Product master (SKU, name, category)
- Multiple packaging sizes per product (100g, 500g, 1kg, etc.)
- Each product has a unique barcode
- Batch tracking (system-generated)
- Current stock levels by SKU
- Expiry date tracking (optional)

#### 3.3.3 Production/Manufacturing

- Recipe management:
  - Recipe code and name
  - Bill of materials (raw materials with quantities)
  - Expected yield
  - Recipe versioning (track historical changes)
  - Active/inactive status
- Production runs:
  - Select recipe and version
  - Record batch used
  - Actual quantities consumed
  - Finished goods produced
  - Packaging breakdown (e.g., 10 x 100g, 5 x 500g)
  - Production date and batch number
- Automatic inventory updates (deduct raw materials, add finished goods)

#### 3.3.4 Stock Adjustments

- Stock adjustment entry (add/reduce)
- Reason codes (damage, expired, theft, correction, returns)
- Approval workflow (optional)

---

### 3.4 Customer (Outlet) Management

#### 3.4.1 Outlet Master Data

- Outlet code (auto-generated)
- Outlet name
- Owner/contact person
- Phone, email, address
- Route/area assignment
- Default discount percentage (e.g., 20%)
- Custom discount override option
- Credit limit
- Payment terms (cash/credit)
- Current outstanding balance
- Status (active/inactive)

#### 3.4.2 Route Management

- Route/area master (code, name, description)
- Assign outlets to routes
- Assign vehicle to route (dynamic, can change)
- Track vehicle-route assignment history
- View outlets by route
- Route-based reporting

**Note:** One route can have only one vehicle at a time, but vehicle assignments can change

---

### 3.5 Sales & Billing

#### 3.5.1 Order Entry & Delivery Workflow

**Step 1: Order Collection (Sales Ref)**

- Sales ref visits outlets on assigned route
- Collects orders manually (writes down items needed)
- Returns to warehouse with order list

**Step 2: Order Entry (Cashier)**

- Cashier creates bill in system:
  - Select outlet
  - Select sales ref who collected the order
  - Add items (product, size, quantity, price)
  - Apply default discount (20%) or custom discount
  - Add return items (if any) as negative line items
  - Calculate subtotal, discount, total
  - Record payment method (cash/credit/check)
  - Generate invoice number
  - Print invoice and delivery note

**Step 3: Delivery**

- Warehouse prepares only the ordered items
- Sales ref/driver delivers the prepared orders to outlets

#### 3.5.2 Future Enhancement: Mobile Order Entry

- Sales refs can add bills directly via mobile interface
- Offline order capture
- Sync to main system when online

#### 3.5.3 Pricing & Discounts

- Base price per SKU
- Default outlet discount (20%)
- Customer-specific discount override
- Manual discount adjustment per line item
- Total invoice discount option

#### 3.5.4 Payment Processing

- **Cash payments:**
  - Record amount received
  - Calculate change
  - Update daily cash register
- **Credit sales:**
  - Add to outlet's outstanding balance
  - Update credit limit usage
  - Generate receivable entry
- **Check payments:**
  - Record check number
  - Record check date
  - Track clearance date
  - Update cash register on clearance

#### 3.5.5 Product Returns from Outlets

- Add return items as negative line items in the same invoice
- Return reasons (damaged, expired, excess, quality issue)
- For usable returns:
  - Return to warehouse stock (add inventory)
- For non-usable returns:
  - Mark as disposed (no stock addition)
- Adjust outlet credit balance or refund
- Update invoice total (sales items - return items)

---

### 3.6 Credit & Receivables Management

#### 3.6.1 Credit Sales Tracking

- Record credit invoices
- Track outstanding balance per outlet
- Aging analysis (30/60/90 days)
- Credit limit enforcement (warning if exceeded)

#### 3.6.2 Payment Collection

- Record payment against outlet account
- Payment methods: cash, bank transfer, check
- For check payments:
  - Record check number
  - Record check date and expected clearance date
  - Track clearance status
- Allocate payment to specific invoices
- Payment history per outlet
- Receipt generation

#### 3.6.3 Credit Limit Management

- Set credit limit per outlet
- Alert when limit approached/exceeded
- Override option for admin

---

### 3.7 Reporting & Analytics

#### 3.7.1 Sales Reports

- Sales by route (daily, weekly, monthly)
- Sales by outlet
- Sales by product/SKU
- Sales by sales ref (performance tracking)
- Top-selling products
- Payment method summary (cash vs credit vs check)
- Returns summary (by outlet, by product)

#### 3.7.2 Inventory Reports

- Current stock levels (raw materials)
- Current stock levels (finished goods)
- Stock by batch
- Stock valuation
- Stock movement history
- Low stock alerts
- Stock aging report

#### 3.7.3 Supplier Reports

- Supplier ledger/statement
- Purchase summary by supplier
- Supplier balances (payables)
- Purchase order status report

#### 3.7.4 Financial Reports

- Daily sales summary
- Cash register reconciliation
- Outstanding receivables (by outlet, by route)
- Receivables aging
- Profit margin by product (future)

#### 3.7.5 Production Reports

- Production runs history
- Recipe usage analysis
- Raw material consumption
- Yield analysis

---

### 3.8 Additional Features

#### 3.8.1 Dashboard

- Today's sales summary
- Outstanding receivables
- Low stock alerts
- Pending purchase orders
- Quick access to common tasks

#### 3.8.2 Invoice Printing

- Professional invoice template
- Company logo and details
- Outlet information
- Itemized list with discounts
- Payment details
- Outstanding balance display

#### 3.8.3 Data Export

- Export reports to Excel/CSV
- Print-friendly report formats

---

## 4. Non-Functional Requirements

### 4.1 Technology Stack

- **Frontend:** Vue.js 3 (Composition API)
- **Backend:** Express.js (Node.js)
- **Database:** MySQL
- **Architecture:** RESTful API

### 4.2 Performance

- Page load time: < 2 seconds
- API response time: < 500ms for typical queries
- Support concurrent users: 5-10 users initially
- Database optimization with proper indexing

### 4.3 Security

- User authentication and authorization
- Role-based access control (RBAC)
- Secure password storage (bcrypt/hashing)
- Session management
- SQL injection prevention
- HTTPS recommended for production

### 4.4 Usability

- Responsive design (desktop, tablet, mobile-friendly)
- Intuitive navigation
- Form validation with clear error messages
- Confirmation dialogs for critical actions
- Search and filter capabilities

### 4.5 Reliability

- Data backup strategy
- Error logging
- Transaction integrity (ACID compliance)
- Graceful error handling

### 4.6 Scalability

- Modular architecture for future enhancements
- Database schema design to support growth
- API versioning for backward compatibility

### 4.7 Browser Compatibility

- Modern browsers: Chrome, Firefox, Edge, Safari (latest 2 versions)

---

## 5. Data Model Overview

### 5.1 Core Entities

1. **Users** (id, username, password_hash, role, full_name, status)
2. **Employees** (id, code, name, type, phone, assigned_route_id, status)
3. **Suppliers** (id, code, name, contact, phone, email, address, payment_terms, balance, status)
4. **Raw Materials** (id, code, name, category, unit, reorder_level, status)
5. **Raw Material Batches** (id, material_id, batch_number_auto, supplier_id, quantity, unit_cost, purchase_date, expiry_date)
6. **Products** (id, code, name, category, barcode, description, status)
7. **Product SKUs** (id, product_id, size, unit, barcode, price, current_stock, status)
8. **Recipes** (id, code, name, version, expected_yield, is_active, created_date)
9. **Recipe Items** (id, recipe_id, material_id, quantity)
10. **Production Runs** (id, recipe_id, recipe_version, production_date, batch_number, quantities_used, quantities_produced)
11. **Routes** (id, code, name, description)
12. **Route Vehicle History** (id, route_id, vehicle_id, assigned_date, unassigned_date, is_current)
13. **Outlets** (id, code, name, owner, phone, email, address, route_id, default_discount, credit_limit, balance, status)
14. **Vehicles** (id, code, name, registration_number, status)
15. **Purchase Orders** (id, po_number, supplier_id, order_date, expected_date, total, status)
16. **PO Items** (id, po_id, material_id, quantity, unit_cost, is_return)
17. **Sales Invoices** (id, invoice_number, outlet_id, sales_ref_id, route_id, invoice_date, subtotal, discount, total, payment_method, payment_status)
18. **Invoice Items** (id, invoice_id, sku_id, quantity, unit_price, discount, total, is_return, return_reason)
19. **Payments** (id, outlet_id, payment_date, amount, payment_method, check_number, check_date, clearance_date, reference)
20. **Supplier Payments** (id, supplier_id, payment_date, amount, payment_method, check_number, check_date, clearance_date, reference)
21. **Stock Adjustments** (id, sku_id/material_id, adjustment_type, quantity, reason, date, user_id)

---

## 6. User Workflows

### 6.1 Purchasing Workflow

1. Admin/Cashier creates purchase order for raw materials
2. Select supplier and add items
3. Submit PO (status: Pending)
4. On delivery, mark PO as received
5. System auto-generates batch numbers for received items
6. Enter quantities received
7. System updates raw material inventory
8. PO status changes to Received
9. **Returns & Traceability:** Return items can be processed through the same receive endpoint:
   - Link returns to their source receipt batch via `source_batch_id`
   - Specify return reason and disposition (stock/dispose)
   - System tracks genealogy (all returns from a receipt batch)
   - Query return origin to trace batch back to source
   - Get material returns summary (total in/out/net)

### 6.2 Production Workflow

1. Select active recipe and version
2. Record production run details
3. System selects batches of raw materials (FIFO)
4. Enter finished goods produced (by SKU size)
5. System deducts raw material inventory
6. System adds finished goods inventory with new batch number
7. Generate production report

### 6.3 Sales Workflow (Updated)

**Order Collection & Processing:**

1. Sales ref visits outlets on assigned route
2. Sales ref collects orders manually (paper/notepad)
3. Sales ref returns to warehouse with order list

**Phase 2: Order Processing** 4. Cashier logs into system 5. Create new invoice, select outlet 6. Select sales ref who collected the order 7. Add line items (product, size, qty) 8. If outlet is returning items:

- Add return items as negative line items
- Select return reason (damaged/expired/excess/quality)
- Choose disposition (return to stock/dispose)

9. System applies default/custom discount
10. Select payment method (cash/credit/check)
11. If check: enter check number, check date, expected clearance date
12. Save and print invoice and delivery note
13. If credit: update outlet balance
14. If cash/check: add to cash register
15. If returns to stock: system updates inventory

**Phase 3: Delivery** 16. Warehouse prepares exact items from invoice 17. Sales ref/driver delivers to outlet 18. Collect payment if COD

### 6.4 Credit Collection Workflow

1. Cashier selects outlet
2. View outstanding invoices
3. Record payment amount and method (cash/bank/check)
4. If check: record check number, check date, clearance date
5. Allocate to invoices (auto or manual)
6. Print receipt
7. Update outlet balance
8. For check payments: track clearance separately

### 6.5 Route & Vehicle Management

1. Admin assigns vehicle to route
2. System records assignment with date
3. When reassigning vehicle to different route:
   - System marks previous assignment as ended
   - Creates new assignment record
4. View assignment history for reporting

---

## 7. Future Enhancements (Out of Scope for v1.0)

1. **Mobile app** for sales refs (offline order capture and entry)
2. **Commission calculation** for sales ref performance
3. **Barcode scanning** for faster entry
4. **SMS/WhatsApp** notifications for orders and payments
5. **Integration** with accounting software
6. **Advanced analytics** and forecasting
7. **Multi-warehouse** support
8. **E-commerce portal** for outlets to place orders online
9. **Production cost calculation** per unit
10. **Loyalty programs** for outlets
11. **GPS tracking** for delivery vehicles

---

## 8. Assumptions & Constraints

### 8.1 Assumptions

- Single warehouse operation
- Internet connectivity available at warehouse
- Drivers currently do not use mobile devices for order entry
- All transactions in LKR currency
- No tax/VAT calculation required initially
- Standard operating hours (no 24/7 requirement)

### 8.2 Constraints

- Budget: 300,000 LKR
- Timeline: TBD based on project estimate
- No existing data migration required
- Desktop/laptop browser-based access (responsive for tablets)

### 8.3 Dependencies

- Client provides company logo and invoice template preferences
- Client provides sample data (supplier, outlet, product lists) for initial setup
- Client provides server/hosting environment or cloud hosting budget

---

## 9. Acceptance Criteria

The system will be considered complete when:

1. All functional requirements in section 3 are implemented
2. Admin can create users, suppliers, outlets, routes, products, recipes
3. Cashier can create purchase orders and record receipts
4. Cashier can create production runs using recipes
5. Cashier can create sales invoices for outlets
6. System tracks credit balances and outstanding amounts
7. All reports in section 3.7 are functional
8. Invoice printing works correctly
9. Data validation prevents invalid entries
10. User roles restrict access appropriately
11. System tested with sample data and runs without critical errors
12. Basic user documentation provided

---

## 10. Deliverables

1. **Web Application**
   - Frontend (Vue.js)
   - Backend API (Express.js)
   - MySQL database with schema

2. **Documentation**
   - User manual (admin guide)
   - API documentation
   - Database schema diagram
   - Deployment guide

3. **Source Code**
   - Version-controlled repository (Git)
   - README with setup instructions

4. **Testing**
   - Unit tests for critical functions
   - Basic QA testing report

---

## 11. Project Timeline (Estimated)

See separate PROJECT_TIMELINE.md for detailed breakdown.

---

## 12. Sign-off

**Client Approval:**

Name: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***  
Signature: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***  
Date: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

**Developer:**

Name: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***  
Signature: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***  
Date: \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

---

**End of Requirements Document**
