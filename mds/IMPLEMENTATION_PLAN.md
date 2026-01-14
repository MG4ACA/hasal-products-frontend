# Implementation Plan - Hasal Products POS System

**Project:** POS & Inventory Management System  
**Version:** 1.1  
**Start Date:** December 18, 2025  
**Duration:** 10-12 weeks  
**Total Hours:** 232 hours

---

## 📋 Phase 1: Project Setup & Foundation (Week 1-2)

### Week 1: Environment Setup & Project Initialization

#### Backend Setup

- [x] Create backend repository `hasal-pos-backend`
- [x] Initialize Node.js project with npm
- [x] Install dependencies (Express, Sequelize, MySQL2, JWT, bcryptjs, dotenv, cors)
- [x] Install dev dependencies (nodemon, eslint, prettier, sequelize-cli)
- [x] Configure ESLint and Prettier
- [x] Set up folder structure (controllers, models, routes, middleware, utils, config)
- [x] Create `.env.development` and `.env.production` files
- [x] Configure Sequelize (`config/database.js`)
- [x] Set up Express app (`app.js` and `server.js`)
- [x] Configure CORS middleware
- [x] Set up error handling middleware
- [x] Test server startup on port 5000

#### Frontend Setup

- [x] Create frontend repository `hasal-pos-frontend`
- [x] Initialize Vite + Vue 3 project
- [x] Install dependencies (Vue Router, Pinia, PrimeVue, PrimeFlex, PrimeIcons, Axios)
- [x] Install dev dependencies (eslint, prettier, eslint-plugin-vue)
- [x] Configure ESLint and Prettier
- [x] Set up folder structure (views, components, stores, services, utils, composables)
- [x] Create `.env.development` and `.env.production` files
- [x] Configure Vite (`vite.config.js`)
- [x] Configure Vue Router (`router/index.js`)
- [x] Configure Pinia store
- [x] Set up PrimeVue (app.use with theme configuration)
- [x] Create axios instance (`services/api.js`) with interceptors
- [x] Create layout components (AppLayout, Sidebar, Topbar)
- [x] Test development server startup

#### Git & Version Control

- [ ] Initialize Git repositories (frontend & backend)
- [ ] Create `.gitignore` files
- [ ] Create initial commit
- [ ] Push to GitHub (create `main` and `develop` branches)
- [ ] Set up branch protection rules

**Deliverable:** ✅ Backend server foundation ready (12/12 tasks completed) | ✅ Frontend development environment ready (14/14 tasks completed)  
**Status:** Week 1 Complete - Backend running on port 5000, Frontend on port 5173 with API proxy  
**Effort:** 20 hours  
**Completion Date:** December 18, 2025

---

### Week 2: Database Schema & Authentication System

#### Database Setup

- [x] Create Sequelize models for all 21 tables:
  - [x] User model (`models/User.js`)
  - [x] Supplier model (`models/Supplier.js`)
  - [x] RawMaterial model (`models/RawMaterial.js`)
  - [x] RawMaterialBatch model (`models/RawMaterialBatch.js`)
  - [x] Product model (`models/Product.js`)
  - [x] ProductSku model (`models/ProductSku.js`)
  - [x] Recipe model (`models/Recipe.js`)
  - [x] RecipeItem model (`models/RecipeItem.js`)
  - [x] ProductionRun model (`models/ProductionRun.js`)
  - [x] ProductionMaterial model (`models/ProductionMaterial.js`)
  - [x] ProductionOutput model (`models/ProductionOutput.js`)
  - [x] PurchaseOrder model (`models/PurchaseOrder.js`)
  - [x] PoItem model (`models/PoItem.js`)
  - [x] Route model (`models/Route.js`)
  - [x] Outlet model (`models/Outlet.js`)
  - [x] Employee model (`models/Employee.js`)
  - [x] Vehicle model (`models/Vehicle.js`)
  - [x] RouteVehicleHistory model (`models/RouteVehicleHistory.js`)
  - [x] SalesInvoice model (`models/SalesInvoice.js`)
  - [x] InvoiceItem model (`models/InvoiceItem.js`)
  - [x] Payment model (`models/Payment.js`)
  - [x] SupplierPayment model (`models/SupplierPayment.js`)
  - [x] StockAdjustment model (`models/StockAdjustment.js`)
- [x] Define model associations in `models/index.js`
- [x] Create MySQL database (`hasal_pos_dev`)
- [x] Test database connection from backend
- [x] Run database sync to create tables
- [x] Create npm scripts for database operations (`db:create`, `db:seed`, `db:setup`)
- [x] Fix timestamp configuration in models with timestamps:false

#### Seeders (Sample Data)

- [x] Create seeder for users (admin & cashier)
- [x] Create seeder for suppliers (3 sample suppliers)
- [x] Create seeder for raw materials (5 materials)
- [x] Create seeder for products (3 products with 4 SKUs)
- [x] Create seeder for routes (3 routes)
- [x] Create seeder for outlets (3 outlets)
- [x] Create seeder for employees (3 employees)
- [x] Create seeder for vehicles (2 vehicles)
- [x] Create seeder for recipes (1 recipe with 3 recipe items)
- [x] Run all seeders successfully
- [x] Verify sample data in database

#### Authentication Backend

- [x] Create auth controller (`controllers/authController.js`)
  - [x] POST `/api/auth/login` - Login endpoint
  - [x] POST `/api/auth/register` - Register endpoint
  - [x] GET `/api/auth/me` - Get current user
  - [x] POST `/api/auth/logout` - Logout endpoint
- [x] Create auth routes (`routes/authRoutes.js`)
- [x] Create JWT middleware (`middleware/authMiddleware.js`)
- [x] Hash passwords with bcryptjs
- [x] Generate JWT tokens (24-hour expiry)
- [x] Test authentication endpoints successfully
- [ ] Create Postman collection for auth endpoints
- [x] Create role-based authorization middleware (`middleware/roleCheck.js`)

#### Authentication Frontend

- [x] Create auth service (`services/authService.js`)
- [x] Create auth store (`stores/auth.js`) with Pinia
- [x] Create Login view (`views/auth/Login.vue`)
- [x] Implement login form with PrimeVue components
- [x] Store JWT in sessionStorage
- [x] Set up token expiry tracking (24 hours)
- [x] Create router navigation guards
- [x] Redirect to dashboard on successful login
- [x] Handle authentication errors (toast notifications)
- [x] Create logout functionality
- [x] Test login flow end-to-end

#### Dashboard Layout

- [x] Create Dashboard view (`views/dashboard/Dashboard.vue`)
- [x] Create dashboard widgets:
  - [x] Today's sales card
  - [x] Outstanding receivables card
  - [x] Low stock alerts card
- [ ] Create recent sales table
- [ ] Create quick action buttons
- [ ] Test navigation between pages

**Deliverable:** ✅ Complete authentication system (frontend + backend) | ✅ JWT tokens with 24-hour expiry & auto-logout | ✅ Toast error handling | ✅ Database synced with 23 tables and seed data  
**Status:** ✅ Week 2 COMPLETE - All database & auth tasks finished (32/32 tasks completed)  
**Effort:** 18 hours  
**Completion Date:** December 19, 2025

---

## 📦 Phase 2: Core Modules Development (Week 3-7)

### Week 3: Supplier & Raw Material Management

#### Supplier Module - Backend

- [x] Create Supplier controller (`controllers/supplierController.js`)
  - [x] GET `/api/suppliers` - Get all suppliers (with pagination, search, filters)
  - [x] GET `/api/suppliers/:id` - Get supplier by ID
  - [x] POST `/api/suppliers` - Create supplier (auto-generate code)
  - [x] PUT `/api/suppliers/:id` - Update supplier
  - [x] DELETE `/api/suppliers/:id` - Delete supplier (soft delete)
  - [x] GET `/api/suppliers/:id/balance` - Get supplier balance
- [x] Create supplier routes (`routes/supplierRoutes.js`)
- [x] Implement validation middleware
- [ ] Test all endpoints with Postman
- [ ] Update Postman collection

#### Supplier Module - Frontend

- [x] Create supplier service (`services/supplierService.js`)
- [x] Create supplier store (`stores/supplier.js`)
- [x] Create SupplierIndex view (`views/suppliers/SupplierIndex.vue`)
- [x] Create SupplierList component (`components/suppliers/SupplierList.vue`)
- [x] Create SupplierForm component (`components/suppliers/SupplierForm.vue`)
- [x] Create SupplierCreate view (`views/suppliers/SupplierCreate.vue`)
- [x] Create SupplierEdit view (`views/suppliers/SupplierEdit.vue`)
- [x] Create SupplierView view (`views/suppliers/SupplierView.vue`) - Read-only supplier details with balance & POs
- [x] Implement DataTable with pagination
- [x] Implement search and filter functionality
- [x] Implement form validation
- [ ] Test CRUD operations

#### Raw Material Module - Backend

- [x] Create RawMaterial controller (`controllers/rawMaterialController.js`)
  - [x] GET `/api/raw-materials` - Get all raw materials
  - [x] GET `/api/raw-materials/:id` - Get raw material by ID
  - [x] POST `/api/raw-materials` - Create raw material (auto-generate code)
  - [x] PUT `/api/raw-materials/:id` - Update raw material
  - [x] DELETE `/api/raw-materials/:id` - Delete raw material
  - [x] GET `/api/raw-materials/:id/batches` - Get batches for material
  - [x] GET `/api/raw-materials/:id/stock` - Get current stock level
- [x] Create raw material routes (`routes/rawMaterialRoutes.js`)
- [ ] Test all endpoints with Postman
- [ ] Update Postman collection

#### Raw Material Module - Frontend

- [x] Create raw material service (`services/rawMaterialService.js`)
- [x] Create raw material store (`stores/rawMaterial.js`)
- [x] Create RawMaterialIndex view
- [x] Create RawMaterialList component
- [x] Create RawMaterialForm component
- [x] Create RawMaterialCreate view
- [x] Create RawMaterialEdit view
- [x] Implement stock level display
- [x] Implement batch list view
- [ ] Test CRUD operations

**Deliverable:** Supplier and raw material modules functional  
**Effort:** 18 hours

---

### Week 4: Purchase Orders & Inventory Receipt

#### Purchase Order Module - Backend

- [x] Create PurchaseOrder controller (`controllers/purchaseOrderController.js`)
  - [x] GET `/api/purchase-orders` - Get all POs
  - [x] GET `/api/purchase-orders/:id` - Get PO by ID with items
  - [x] POST `/api/purchase-orders` - Create PO (auto-generate PO number)
  - [x] PUT `/api/purchase-orders/:id` - Update PO
  - [x] DELETE `/api/purchase-orders/:id` - Delete PO
  - [x] POST `/api/purchase-orders/:id/receive` - Receive PO (create batches)
  - [x] PUT `/api/purchase-orders/:id/status` - Update PO status
- [x] Implement batch number generation utility (`utils/batchNumberGenerator.js`)
- [x] Create batch number format: `RM-MAT001-20251218-001`
- [x] Implement PO receiving logic:
  - [x] Create raw material batches with system-generated batch numbers
  - [x] Update raw material stock levels
  - [x] Update supplier balance
  - [x] Update PO status
- [x] Handle returns in PO items (negative quantities)
  - [x] Add batch_type, return_reason, return_disposition fields to batches
  - [x] Process return_items array in receive endpoint
  - [x] Calculate net amount (total - returns)
- [x] Test all endpoints with Postman
- [x] Update Postman collection

#### Purchase Order Module - Frontend

- [x] Create PO service (`services/purchaseOrderService.js`)
- [x] Create PO store (`stores/purchaseOrder.js`)
- [x] Create PurchaseOrderIndex view
- [x] Create PurchaseOrderList component
- [x] Create PurchaseOrderForm component (multi-step)
  - [x] Step 1: Supplier selection, PO details
  - [x] Step 2: Add items (material, quantity, unit cost)
  - [x] Step 3: Review and confirm
- [x] Create PurchaseOrderCreate view
- [x] Create PurchaseOrderEdit view
- [ ] Create PurchaseOrderView component (read-only details)
- [x] Create ReceivePO dialog component with returns support
  - [x] TabView with Receive Items and Return Items tabs
  - [x] Return reason dropdown (damaged, expired, excess, quality_issue, wrong_item, other)
  - [x] Disposition selection (stock vs dispose)
  - [x] Net amount calculation display
- [ ] Implement batch tracking display
- [x] Implement returns handling (negative items)
- [x] Calculate total amounts
- [ ] Test full PO workflow (create → receive → update stock)

#### Batch Management

- [x] Create batch list view for raw materials
- [x] Display batch number, quantity, expiry date
- [ ] Implement FIFO batch consumption tracking
- [x] Test batch creation on PO receipt

**Deliverable:** Complete purchase order workflow with batch tracking  
**Effort:** 22 hours

---

### Week 5: Products, Recipes & Production

#### Product Module - Backend

- [x] Create Product controller (`controllers/productController.js`)
  - [x] GET `/api/products` - Get all products
  - [x] GET `/api/products/:id` - Get product with SKUs
  - [x] POST `/api/products` - Create product (auto-generate code)
  - [x] PUT `/api/products/:id` - Update product
  - [x] DELETE `/api/products/:id` - Delete product
  - [x] POST `/api/products/:id/skus` - Add SKU to product
  - [x] PUT `/api/products/:productId/skus/:skuId` - Update SKU
  - [x] DELETE `/api/products/:productId/skus/:skuId` - Delete SKU
  - [x] GET `/api/products/:id/stock` - Get stock for all SKUs
- [x] Add barcode field support
- [x] Validate unique barcodes
- [x] Test all endpoints

#### Product Module - Frontend

- [x] Create product service (`services/productService.js`)
- [x] Create product store (`stores/product.js`)
- [x] Create ProductIndex view
- [x] Create ProductList component
- [x] Create ProductForm component with SKU management (size/unit fields)
- [x] Support multiple SKUs per product (100g, 500g, 1kg, etc.)
- [x] Add barcode input field
- [x] Create ProductCreate view
- [x] Create ProductEdit view
- [x] Display stock levels for each SKU
- [ ] Test CRUD operations

#### Recipe Module - Backend

- [x] Create Recipe controller (`controllers/recipeController.js`)
  - [x] GET `/api/recipes` - Get all recipes
  - [x] GET `/api/recipes/:id` - Get recipe with items (BOM)
  - [x] POST `/api/recipes` - Create recipe with versioning
  - [x] PUT `/api/recipes/:id` - Update recipe (create new version)
  - [x] DELETE `/api/recipes/:id` - Delete recipe
  - [x] GET `/api/recipes/:id/versions` - Get recipe version history
  - [x] POST `/api/recipes/:id/items` - Add item to recipe
  - [x] PUT `/api/recipes/:recipeId/items/:itemId` - Update recipe item
  - [x] DELETE `/api/recipes/:recipeId/items/:itemId` - Delete recipe item
- [x] Implement recipe versioning logic (standalone, not linked to products)
- [x] Test all endpoints

#### Recipe Module - Frontend

- [x] Create recipe service (`services/recipeService.js`)
- [x] Create recipe store (`stores/recipe.js`)
- [x] Create RecipeIndex view
- [x] Create RecipeList component
- [x] Create RecipeForm component (BOM builder)
- [x] Add raw materials to recipe with quantities
- [x] Display total cost calculation
- [x] Create RecipeCreate view
- [x] Create RecipeEdit view (creates new version)
- [x] Display recipe version history
- [ ] Test recipe creation and versioning

#### Production Module - Backend

- [x] Create Production controller (`controllers/productionController.js`)
  - [x] GET `/api/production-runs` - Get all production runs
  - [x] GET `/api/production-runs/:id` - Get production run details
  - [x] POST `/api/production-runs` - Create production run
  - [x] PUT `/api/production-runs/:id` - Update production run
  - [x] DELETE `/api/production-runs/:id` - Delete production run
  - [x] POST `/api/production-runs/:id/complete` - Complete production run
  - [x] GET `/api/production-runs/:id/check-materials` - Check material availability
- [x] Implement production logic:
  - [x] Deduct raw materials from batches (FIFO)
  - [x] Create production output (finished goods)
  - [x] Update product SKU stock levels
  - [x] Link to recipe and track materials used
- [x] Test all endpoints

#### Production Module - Frontend

- [x] Create production service (`services/productionService.js`)
- [x] Create production store (`stores/production.js`)
- [x] Create ProductionIndex view
- [x] Create ProductionList component
- [x] Create ProductionForm component
  - [x] Select recipe
  - [x] Enter quantity to produce
  - [x] Display material requirements
  - [x] Check stock availability
- [x] Create ProductionCreate view
- [x] Create ProductionView component
- [x] Display production history
- [ ] Test production workflow (recipe → deduct materials → add finished goods)

**Deliverable:** ✅ Production management module with recipe versioning (Backend & Frontend Complete)  
**Status:** Week 5 Complete - Testing Pending  
**Effort:** 25 hours  
**Completion Date:** December 19, 2025

---

### Week 6: Routes, Outlets, Employees & Vehicle Assignment

#### Route Module - Backend

- [x] Create Route controller (`controllers/routeController.js`)
  - [x] GET `/api/routes` - Get all routes
  - [x] GET `/api/routes/:id` - Get route by ID
  - [x] POST `/api/routes` - Create route (auto-generate code)
  - [x] PUT `/api/routes/:id` - Update route
  - [x] DELETE `/api/routes/:id` - Delete route
  - [x] GET `/api/routes/:id/outlets` - Get outlets on route
  - [x] GET `/api/routes/:id/employees` - Get employees on route
- [x] Test all endpoints

#### Route Module - Frontend

- [x] Create route service (`services/routeService.js`)
- [x] Create route store (`stores/route.js`)
- [x] Create RouteIndex view
- [x] Create RouteList component
- [x] Create RouteForm component
- [x] Create RouteCreate view
- [x] Create RouteEdit view
- [x] Display outlets and employees assigned to route
- [x] Test CRUD operations

#### Outlet Module - Backend

- [x] Create Outlet controller (`controllers/outletController.js`)
  - [x] GET `/api/outlets` - Get all outlets (with filters)
  - [x] GET `/api/outlets/:id` - Get outlet by ID
  - [x] POST `/api/outlets` - Create outlet (auto-generate code)
  - [x] PUT `/api/outlets/:id` - Update outlet
  - [x] DELETE `/api/outlets/:id` - Delete outlet
  - [x] GET `/api/outlets/:id/balance` - Get outlet balance
  - [x] GET `/api/outlets/:id/invoices` - Get outlet invoices
  - [x] GET `/api/outlets/:id/payments` - Get outlet payments
- [x] Test all endpoints

#### Outlet Module - Frontend

- [x] Create outlet service (`services/outletService.js`)
- [x] Create outlet store (`stores/outlet.js`)
- [x] Create OutletIndex view
- [x] Create OutletList component
- [x] Create OutletForm component
- [x] Create OutletCreate view
- [x] Create OutletEdit view
- [x] Display balance and credit limit
- [x] Filter outlets by route
- [x] Test CRUD operations

#### Employee Module - Backend

- [x] Create Employee controller (`controllers/employeeController.js`)
  - [x] GET `/api/employees` - Get all employees
  - [x] GET `/api/employees/:id` - Get employee by ID
  - [x] POST `/api/employees` - Create employee (auto-generate code)
  - [x] PUT `/api/employees/:id` - Update employee
  - [x] DELETE `/api/employees/:id` - Delete employee (soft delete)
  - [x] GET `/api/employees/:id/performance` - Get sales ref performance
- [x] Support employee types: sales_ref, driver, warehouse
- [x] Note: Employees do NOT have user accounts (no login)
- [x] Test all endpoints

#### Employee Module - Frontend

- [x] Create employee service (`services/employeeService.js`)
- [x] Create employee store (`stores/employee.js`)
- [x] Create EmployeeIndex view
- [x] Create EmployeeList component
- [x] Create EmployeeForm component
  - [x] Employee type selector (sales_ref, driver, warehouse)
  - [x] Route assignment (for sales_ref and driver)
- [x] Create EmployeeCreate view
- [x] Create EmployeeEdit view
- [x] Filter employees by type
- [x] Display assigned route
- [x] Test CRUD operations

#### Vehicle & Assignment Module - Backend

- [x] Create Vehicle controller (`controllers/vehicleController.js`)
  - [x] GET `/api/vehicles` - Get all vehicles
  - [x] GET `/api/vehicles/:id` - Get vehicle by ID
  - [x] POST `/api/vehicles` - Create vehicle (auto-generate code)
  - [x] PUT `/api/vehicles/:id` - Update vehicle
  - [x] DELETE `/api/vehicles/:id` - Delete vehicle
  - [x] GET `/api/vehicles/:id/assignment-history` - Get route assignment history
  - [x] POST `/api/vehicles/:id/assign-route` - Assign vehicle to route
  - [x] POST `/api/vehicles/:id/unassign-route` - Unassign vehicle from route
- [x] Implement route assignment logic:
  - [x] Create RouteVehicleHistory record
  - [x] Track assigned_date, unassigned_date, is_current
  - [x] One vehicle per route at a time
- [x] Test all endpoints

#### Vehicle Module - Frontend

- [x] Create vehicle service (`services/vehicleService.js`)
- [x] Create vehicle store (`stores/vehicle.js`)
- [x] Create VehicleIndex view
- [x] Create VehicleList component
- [x] Create VehicleForm component
- [x] Create VehicleCreate view
- [x] Create VehicleEdit view
- [x] Create VehicleAssignment component
  - [x] Assign vehicle to route
  - [x] Unassign vehicle
  - [x] Display current assignment
- [x] Create AssignmentHistory component
- [x] Create VehicleHistory view
- [x] Test vehicle-route assignment workflow

**Deliverable:** ✅ Route, outlet, employee, and vehicle modules with CRUD operations  
**Status:** Week 6 Complete - Backend ✅ | Frontend ✅ | Testing ⏳  
**Effort:** 22 hours  
**Completion Date:** December 20, 2025  
**Note:** All Week 6 tasks complete including vehicle-route assignment feature

---

### Week 7: Sales & Invoicing (with Returns)

#### Sales Invoice Module - Backend

- [x] Create Sales controller (`controllers/salesController.js`)
  - [x] GET `/api/sales-invoices` - Get all invoices (with filters)
  - [x] GET `/api/sales-invoices/:id` - Get invoice by ID with items
  - [x] POST `/api/sales-invoices` - Create invoice (auto-generate invoice number)
  - [x] PUT `/api/sales-invoices/:id` - Update invoice
  - [x] DELETE `/api/sales-invoices/:id` - Delete invoice
  - [x] GET `/api/sales-invoices/:id/pdf` - Generate PDF (placeholder - 501)
- [x] Implement invoice number generation (`utils/invoiceNumberGenerator.js`)
- [x] Implement invoice creation logic:
  - [x] Add invoice items (positive quantities for sales)
  - [x] Add return items (negative quantities)
  - [x] Track return reason and disposition (stock/dispose)
  - [x] Calculate subtotal, discount, total
  - [x] Update outlet balance for credit sales
  - [x] Update product SKU stock levels
  - [x] Process returns to stock if applicable
  - [x] Link to sales ref and route
- [x] Support payment methods: cash, credit, check
- [x] Add check tracking fields (check_number, check_date, clearance_date)
- [x] Register sales routes in app.js
- [ ] Test all endpoints with Postman

#### Sales Invoice Module - Frontend

- [x] Create sales service (`services/salesService.js`)
- [x] Create sales store (`stores/salesStore.js`)
- [x] Create SalesIndex view with comprehensive filters
- [x] Create InvoiceList component (DataTable)
- [x] Create InvoiceForm component (multi-tab with TabView)
  - [x] Tab 1: Invoice details (outlet, sales ref, route, date, payment method, check fields)
  - [x] Tab 2: Sales items manager (add/remove items, SKU selection, pricing, discounts)
  - [x] Tab 3: Returns manager (return items, reason, disposition)
  - [x] Tab 4: Summary & notes (totals calculation, notes textarea)
- [x] Create InvoiceCreate view
- [x] Create InvoiceEdit view (limited to notes & payment_status)
- [x] Create InvoiceView component (read-only with separate sales/returns tables)
- [x] Implement discount calculation (outlet default + custom per item)
- [x] Display outlet in dropdown with name and code
- [x] Calculate subtotal, discount, returns, total (real-time)
- [x] Support cash/credit/check payment methods
- [x] Add conditional check payment fields (number, date, clearance date)
- [x] Display sales ref selector (employee dropdown)
- [x] Display route selector
- [x] Add sales routes to router (4 routes: index, create, edit, view)
- [x] Validate stock availability before saving
- [ ] Test invoice creation with returns

#### Returns Handling

- [x] Add return items as negative line items
- [x] Return reason dropdown (damaged, expired, excess, quality_issue, other)
- [x] Return disposition checkbox (return_to_stock true/false)
- [x] Update inventory based on disposition in backend
- [x] Display returns in separate DataTable in invoice view
- [ ] Test returns workflow

**Deliverable:** ✅ Sales, invoicing, and returns module (Backend & Frontend Complete)  
**Status:** Week 7 Complete - Testing Pending  
**Effort:** 28 hours  
**Completion Date:** December 20, 2025  
**Documentation:** See WEEK7_IMPLEMENTATION.md for detailed implementation notes

---

## � Core Modules: Purchase Orders & Batch Traceability (Week 5)

---

## 💰 Payments & Reporting Module (Week 8-9)

#### Payment Module - Backend

- [x] Create Payment controller (`controllers/paymentController.js`)
  - [x] GET `/api/payments` - Get all payments with pagination & filters
  - [x] GET `/api/payments/:id` - Get payment by ID with allocations
  - [x] POST `/api/payments` - Record payment with allocations
  - [x] PUT `/api/payments/:id` - Update payment
  - [x] DELETE `/api/payments/:id` - Delete payment
  - [x] GET `/api/outlets/:id/outstanding-invoices` - Get unpaid invoices
  - [x] GET `/api/payments/pending-checks` - Get pending/overdue checks
- [x] Create PaymentAllocation model (`models/PaymentAllocation.js`)
  - [x] Track payment-to-invoice allocations
  - [x] Store allocated_amount for partial payments
  - [x] Link to Payment and SalesInvoice
- [x] Implement payment allocation logic:
  - [x] Reduce outlet balance via payment
  - [x] Update invoice payment status (paid/partial/unpaid)
  - [x] Link payment to specific invoices
  - [x] Validate allocations match payment amount
  - [x] Handle multiple allocations per payment
- [x] Support check payment tracking:
  - [x] Store check_number, check_date, clearance_date
  - [x] Track check status (pending/cleared/overdue)
  - [x] Identify overdue checks (>30 days)
- [x] Create payment routes (`routes/paymentRoutes.js`)
- [x] Test endpoints with Postman

#### Supplier Payment Module - Backend

- [x] Create Supplier Payment endpoints in supplier controller
  - [x] GET `/api/supplier-payments` - Get all supplier payments
  - [x] POST `/api/supplier-payments` - Record supplier payment
  - [x] GET `/api/suppliers/:id/payments` - Get payments for supplier
- [x] Implement supplier payment logic:
  - [x] Reduce supplier balance
  - [x] Support cash/bank_transfer/check payment methods
  - [x] Track check details
- [x] Test all endpoints

#### Payment Module - Frontend

- [x] Create payment service (`services/paymentService.js`)
  - [x] getAllPayments(), getPaymentById(), createPayment(), updatePayment(), deletePayment()
  - [x] getPendingChecks(), getOutstandingInvoices()
- [x] Create payment store (`stores/payment.js`)
  - [x] State: payments, selectedPayment, filters, pending checks
  - [x] Actions: fetch, create, update, delete, filter
  - [x] Getters: hasPayments, hasPendingChecks, totalOutstanding
- [x] Create PaymentIndex view with filters & pagination
- [x] Create PaymentCreate view (record payment & allocate to invoices)
  - [x] Payment details form (outlet, amount, method, date)
  - [x] Check fields (conditional: number, date, clearance)
  - [x] Invoice allocation table
  - [x] Real-time validation
- [x] Create PaymentDetails view (read-only)
- [x] Create PendingChecks view
  - [x] List pending checks with due dates
  - [x] Highlight overdue checks
  - [x] Mark check as cleared
- [x] Add 4 router entries
- [x] Add Payments menu item to Sidebar
- [x] Test payment workflow

#### Supplier Payment Frontend

- [x] Create SupplierPaymentForm component
- [x] Integrate with supplier module
- [x] Support check payment tracking
- [x] Display supplier payment history
- [x] Test supplier payment workflow

**Deliverable:** ✅ Complete Payment Collection & Credit Management (Backend & Frontend)  
**Status:** Week 8 Complete - Database schema alignment complete  
**Bug Fixes Applied:**

- [x] Fixed outlet.location → outlet.address (5 methods)
- [x] Fixed createdBy.name → createdBy.full_name (5 methods)
- [x] Removed invalid created_at ordering
- [x] Fixed aliases: creator → createdBy
      **Effort:** 26 hours  
       **Completion Date:** December 20, 2025  
       **Documentation:** See WEEK8_IMPLEMENTATION.md

---

## 📊 Phase 3B: Reporting & Dashboard (Week 9-10)

### Week 9: Dashboard, Reports & Analytics

#### Dashboard Module - Backend

- [ ] Create dashboard controller (`controllers/dashboardController.js`)
  - [ ] GET `/api/dashboard/summary` - Total sales, payments, balance, checks pending
  - [ ] GET `/api/dashboard/sales-chart` - Sales by date (last 7/30 days)
  - [ ] GET `/api/dashboard/outlet-balance` - Outlet payment status
  - [ ] GET `/api/dashboard/inventory-low-stock` - Low stock items
  - [ ] GET `/api/dashboard/production-status` - Active production runs
  - [ ] GET `/api/dashboard/payment-status` - Payment collection status

#### Reports Module - Backend

- [ ] Create reports controller (`controllers/reportsController.js`)
  - [ ] GET `/api/reports/sales` - Sales report (by date, outlet, product)
  - [ ] GET `/api/reports/payments` - Payment collection report
  - [ ] GET `/api/reports/supplier-payments` - Supplier payment report
  - [ ] GET `/api/reports/inventory` - Inventory valuation report
  - [ ] GET `/api/reports/production` - Production efficiency report
  - [ ] GET `/api/reports/outlet-balance` - Outlet balance & aging report
  - [ ] GET `/api/reports/check-status` - Check clearing status
- [ ] Implement report filtering by date range, outlet, supplier, product
- [ ] Implement CSV export for reports

#### Dashboard & Reports - Frontend

- [ ] Create dashboard view (DashboardIndex.vue)
  - [ ] Summary cards (total sales, payments, pending balance, pending checks)
  - [ ] Sales chart (last 7/30 days)
  - [ ] Outlet balance status
  - [ ] Low stock alert
  - [ ] Recent payments
  - [ ] Pending checks
- [ ] Create Reports view (ReportsIndex.vue)
  - [ ] Sales report with filters & export
  - [ ] Payment collection report
  - [ ] Supplier payment report
  - [ ] Inventory report
  - [ ] Production report
  - [ ] Outlet balance report
  - [ ] Check status report
- [ ] Add reporting routes to router

**Deliverable:** Dashboard and reports module  
**Effort:** 16 hours

---

### Week 10: Testing & Documentation Updates

**Deliverable:** Payment and receivables management with check tracking  
**Effort:** 18 hours

---

### Week 9: Reports & Analytics

#### Report Module - Backend

- [ ] Create Report controller (`controllers/reportController.js`)
  - [ ] GET `/api/reports/sales-by-route` - Sales by route report
  - [ ] GET `/api/reports/sales-by-outlet` - Sales by outlet report
  - [ ] GET `/api/reports/sales-by-sales-ref` - Sales by sales ref report
  - [ ] GET `/api/reports/sales-by-product` - Sales by product report
  - [ ] GET `/api/reports/stock-raw-materials` - Raw material stock report
  - [ ] GET `/api/reports/stock-finished-goods` - Finished goods stock report
  - [ ] GET `/api/reports/receivables-aging` - Receivables aging report
  - [ ] GET `/api/reports/supplier-ledger` - Supplier ledger report
  - [ ] GET `/api/reports/product-returns` - Product returns summary
  - [ ] GET `/api/reports/check-status` - Check payment status report
  - [ ] GET `/api/reports/vehicle-assignment-history` - Vehicle history report
  - [ ] GET `/api/reports/employee-performance` - Sales ref performance
  - [ ] GET `/api/reports/dashboard-stats` - Dashboard statistics
- [ ] Implement date range filtering
- [ ] Support export to Excel/CSV (future enhancement)
- [ ] Test all report endpoints

#### Report Module - Frontend

- [ ] Create report service (`services/reportService.js`)
- [ ] Create report store (`stores/report.js`)
- [ ] Create ReportIndex view (dashboard)
- [ ] Create report components:
  - [ ] SalesByRouteReport
  - [ ] SalesByOutletReport
  - [ ] SalesBySalesRefReport
  - [ ] SalesByProductReport
  - [ ] StockReportRaw
  - [ ] StockReportFinished
  - [ ] ReceivablesAgingReport
  - [ ] SupplierLedgerReport
  - [ ] ProductReturnsReport
  - [ ] CheckStatusReport
  - [ ] VehicleHistoryReport
  - [ ] EmployeePerformanceReport
- [ ] Add date range picker (PrimeVue Calendar)
- [ ] Add filters (route, outlet, sales ref, etc.)
- [ ] Display reports in DataTable format
- [ ] Add export to CSV functionality (use utility function)
- [ ] Create dashboard widgets with key metrics
- [ ] Test all reports with sample data

#### Export Functionality

- [ ] Create export utility (`utils/exportHelpers.js`)
- [ ] Implement CSV export function
- [ ] Add export buttons to all reports
- [ ] Test export with large datasets

**Deliverable:** Comprehensive reporting module with new analytics  
**Effort:** 24 hours

---

## 🧪 Testing, Documentation & Deployment (Week 10-12)

### Week 10: Testing & Bug Fixes

#### Backend Testing

- [ ] Create test database (`hasal_pos_test`)
- [ ] Write unit tests for critical functions:
  - [ ] Batch number generation
  - [ ] Invoice number generation
  - [ ] Authentication and JWT
  - [ ] Payment allocation logic
  - [ ] Stock update logic
- [ ] Write integration tests for API endpoints:
  - [ ] Auth endpoints
  - [ ] CRUD operations for each module
  - [ ] Complex workflows (PO receive, invoice with returns, payment allocation)
- [ ] Test error handling and validation
- [ ] Test edge cases (negative quantities, out of stock, etc.)
- [ ] Run all tests and fix failures

#### Frontend Testing

- [ ] Test component rendering
- [ ] Test form validation
- [ ] Test user flows:
  - [ ] Login → Dashboard → Logout
  - [ ] Create supplier → Create PO → Receive PO
  - [ ] Create product → Create recipe → Run production
  - [ ] Create invoice with items
  - [ ] Create invoice with returns
  - [ ] Record payment → Allocate to invoices
  - [ ] View reports with filters
- [ ] Test error handling (network errors, validation errors)
- [ ] Test loading states
- [ ] Test pagination and search

#### End-to-End Testing

- [ ] Full supplier-to-sale workflow:
  - [ ] Add supplier
  - [ ] Create PO with items
  - [ ] Receive PO (generate batches)
  - [ ] Verify raw material stock updated
  - [ ] Create product and recipe
  - [ ] Run production
  - [ ] Verify finished goods stock updated
  - [ ] Create sales invoice
  - [ ] Verify outlet balance updated
  - [ ] Record payment
  - [ ] Verify balance reduced
- [ ] Test returns workflow
- [ ] Test check payment workflow
- [ ] Test employee and vehicle assignment

#### Bug Fixes & Optimization

- [ ] Fix bugs found during testing
- [ ] Optimize database queries (add indexes if needed)
- [ ] Optimize frontend performance (lazy loading, code splitting)
- [ ] Review and refactor code
- [ ] Security review (SQL injection, XSS prevention)
- [ ] Test on different browsers (Chrome, Firefox, Edge)
- [ ] Test responsive design on tablet and mobile

**Deliverable:** Stable, tested application  
**Effort:** 18 hours

---

### Week 11: Documentation & Training

#### API Documentation

- [ ] Create Postman collection for all endpoints
- [ ] Add request examples and descriptions
- [ ] Add response examples
- [ ] Document authentication headers
- [ ] Document query parameters and filters
- [ ] Document error responses
- [ ] Export Postman collection
- [ ] Share collection with client

#### User Documentation

- [ ] Create user manual (Markdown or PDF)
  - [ ] Introduction and overview
  - [ ] Login instructions
  - [ ] Admin role guide:
    - [ ] Supplier management
    - [ ] Purchase orders
    - [ ] Product & recipe management
    - [ ] Production runs
    - [ ] Route & outlet management
    - [ ] Employee management
    - [ ] Vehicle assignment
    - [ ] Reports
  - [ ] Cashier role guide:
    - [ ] Creating sales invoices
    - [ ] Recording payments
    - [ ] Viewing reports
  - [ ] Troubleshooting section
  - [ ] FAQ
- [ ] Add screenshots to user manual
- [ ] Create quick reference guide (1-page cheatsheet)

#### Database Documentation

- [ ] Create ER diagram (entity-relationship diagram)
- [ ] Document all tables and columns
- [ ] Document relationships and foreign keys
- [ ] Document indexes
- [ ] Already created in DATABASE_SCHEMA.md

#### Deployment Documentation

- [ ] Create deployment guide
  - [ ] Server requirements (Ubuntu, Node.js, MySQL)
  - [ ] Installation steps (clone repos, install dependencies)
  - [ ] Database setup (create database, run migrations, run seeders)
  - [ ] Environment configuration (.env setup)
  - [ ] Build frontend (npm run build)
  - [ ] Configure Nginx (reverse proxy, static files)
  - [ ] Configure PM2 (process manager for Node.js)
  - [ ] SSL certificate setup (Let's Encrypt)
  - [ ] Backup and restore procedures
- [ ] Create maintenance guide
  - [ ] How to update the application
  - [ ] How to backup database
  - [ ] How to monitor logs
  - [ ] Common issues and solutions

#### Training Preparation

- [ ] Prepare training slides/demo
- [ ] Set up demo data
- [ ] Practice demo walkthrough
- [ ] Prepare training exercises
- [ ] Schedule 2-hour training session with client

#### Training Session (2 hours)

- [ ] Overview of system capabilities (15 min)
- [ ] Admin workflow demo (45 min):
  - [ ] Supplier & PO management
  - [ ] Product & production
  - [ ] Employee & vehicle setup
  - [ ] Sales & invoicing
  - [ ] Payments
  - [ ] Reports
- [ ] Cashier workflow demo (30 min):
  - [ ] Creating invoices
  - [ ] Recording payments
- [ ] Hands-on practice (20 min)
- [ ] Q&A (10 min)

**Deliverable:** Complete documentation package and training  
**Effort:** 12 hours

---

### Week 12: Deployment & Handover

#### Production Environment Setup

- [ ] Provision Ubuntu server (client's server or cloud)
- [ ] Install Node.js v20.19.1
- [ ] Install MySQL 8.0.39
- [ ] Install Nginx
- [ ] Install PM2 globally
- [ ] Configure firewall (allow HTTP, HTTPS, SSH)
- [ ] Create database user with appropriate permissions
- [ ] Set up SSH keys for secure access

#### Backend Deployment

- [ ] Clone backend repository to server
- [ ] Install production dependencies (npm install --production)
- [ ] Create `.env.production` file
- [ ] Configure database connection
- [ ] Set JWT secret (secure random string)
- [ ] Run migrations (npx sequelize-cli db:migrate)
- [ ] Run seeders (npx sequelize-cli db:seed:all)
- [ ] Start backend with PM2 (pm2 start server.js --name hasal-pos-api)
- [ ] Configure PM2 to start on boot (pm2 startup, pm2 save)
- [ ] Test backend API endpoints

#### Frontend Deployment

- [ ] Clone frontend repository to server
- [ ] Install dependencies (npm install)
- [ ] Update `.env.production` with production API URL
- [ ] Build for production (npm run build)
- [ ] Configure Nginx:
  - [ ] Serve static files from dist/
  - [ ] Reverse proxy /api to backend
  - [ ] Enable gzip compression
  - [ ] Set up SSL certificate (Let's Encrypt certbot)
- [ ] Restart Nginx
- [ ] Test frontend in browser

#### Domain & SSL

- [ ] Configure domain DNS (if applicable)
- [ ] Install SSL certificate with Let's Encrypt
- [ ] Configure auto-renewal for SSL
- [ ] Force HTTPS redirect

#### Final Testing on Production

- [ ] Smoke test all modules
- [ ] Test login/logout
- [ ] Test CRUD operations for each module
- [ ] Test reports
- [ ] Test on different devices
- [ ] Check browser console for errors
- [ ] Monitor server logs

#### Handover

- [ ] Provide client with:
  - [ ] Access credentials (admin, cashier)
  - [ ] Server access details (SSH keys)
  - [ ] Database credentials
  - [ ] GitHub repository access
  - [ ] Postman collection
  - [ ] User manual
  - [ ] Deployment guide
- [ ] Conduct handover meeting
- [ ] Demonstrate live system
- [ ] Answer client questions
- [ ] Get client sign-off

#### Post-Deployment Support Setup

- [ ] Set up monitoring (PM2 monitoring or other tool)
- [ ] Set up automated database backups (cron job)
- [ ] Document support contact process
- [ ] Begin 30-day support period

**Deliverable:** Live production system  
**Effort:** 10 hours

---

## 📊 Summary

### Total Effort Breakdown

| Phase     | Description                | Hours   |
| --------- | -------------------------- | ------- |
| 1         | Project Setup & Foundation | 35      |
| 2         | Core Modules Development   | 115     |
| 3         | Payments & Reporting       | 42      |
| 4         | Testing & Deployment       | 40      |
| **TOTAL** |                            | **232** |

### Key Milestones

| Week | Milestone                        | Payment           |
| ---- | -------------------------------- | ----------------- |
| 2    | Auth system complete             | -                 |
| 4    | Purchase order workflow complete | -                 |
| 5    | Production module complete       | -                 |
| 7    | Sales & invoicing complete       | 120,000 LKR (40%) |
| 9    | Reports complete                 | -                 |
| 12   | Deployment & handover            | 90,000 LKR (30%)  |

**Initial Payment:** 90,000 LKR (30%) - Upon project kickoff

---

## 🎯 Success Criteria

- [ ] All 11 core modules fully functional
- [ ] Authentication and authorization working
- [ ] All CRUD operations tested
- [ ] Reports displaying accurate data
- [ ] Invoice PDF generation working
- [ ] Database properly indexed and optimized
- [ ] Application responsive on mobile/tablet
- [ ] No critical bugs in production
- [ ] Client trained and comfortable using system
- [ ] Documentation complete and delivered
- [ ] Source code handed over

---

## 📝 Notes

- Refer to **PROJECT_STRUCTURE.md** for coding patterns and standards
- Refer to **PROJECT_REQUIREMENTS.md** for detailed feature requirements
- Refer to **DATABASE_SCHEMA.md** for database design details
- Refer to **UI_MOCKUPS.md** for UI/UX guidelines
- All dates are tentative and subject to client feedback
- Weekly progress updates recommended
- Use Postman for API testing throughout development
- Commit code regularly to Git with meaningful messages
- Create feature branches for each module

---

**Created:** December 18, 2025  
**Status:** Ready to implement  
**Next Action:** Begin Week 1 - Backend Setup
