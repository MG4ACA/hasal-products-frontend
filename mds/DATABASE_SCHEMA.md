# Hasal Products - Database Schema Design

**Project:** POS & Inventory Management System  
**Database:** MySQL  
**Version:** 1.1 (Revised)  
**Date:** December 18, 2025

---

## Table of Contents

1. [Database Schema Diagram](#database-schema-diagram)
2. [Tables Definition](#tables-definition)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Sample Queries](#sample-queries)

---

## 1. Database Schema Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   users     │         │   suppliers      │         │   routes    │
├─────────────┤         ├──────────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)          │         │ id (PK)     │
│ username    │         │ code             │         │ code        │
│ password_hash│         │ name             │         │ name        │
│ role        │         │ contact_person   │         │ description │
│ full_name   │         │ phone            │         └─────────────┘
│ status      │         │ email            │               │
│ created_at  │         │ address          │               │
└─────────────┘         │ payment_terms    │               │
                        │ balance          │               │
                        │ status           │               │
                        │ created_at       │               │
                        └──────────────────┘               │
                               │                           │
                               │                           │
┌──────────────────┐          │                           │
│ raw_materials    │          │                           │
├──────────────────┤          │                           │
│ id (PK)          │          │                           │
│ code             │          │                           │
│ name             │          │                           │
│ category         │          │                           │
│ unit             │          │                           │
│ reorder_level    │          │         ┌──────────────────┐
│ status           │          │         │   outlets        │
│ created_at       │          │         ├──────────────────┤
└──────────────────┘          │         │ id (PK)          │
        │                     │         │ code             │
        │                     │         │ name             │
        │                     │         │ owner_name       │
        ▼                     │         │ phone            │
┌─────────────────────────┐  │         │ email            │
│ raw_material_batches    │  │         │ address          │
├─────────────────────────┤  │         │ route_id (FK)────┼──────────┘
│ id (PK)                 │  │         │ default_discount │
│ material_id (FK)────────┼──┘         │ credit_limit     │
│ supplier_id (FK)────────┼────────────│ balance          │
│ batch_number            │            │ payment_terms    │
│ quantity                │            │ status           │
│ unit_cost               │            │ created_at       │
│ purchase_date           │            └──────────────────┘
│ expiry_date             │                    │
│ created_at              │                    │
└─────────────────────────┘                    │
                                               │
┌──────────────────┐                           │
│   products       │                           │
├──────────────────┤                           │
│ id (PK)          │                           │
│ code             │                           │
│ name             │                           │
│ category         │                           │
│ description      │                           │
│ status           │                           │
│ created_at       │                           │
└──────────────────┘                           │
        │                                      │
        │                                      │
        ▼                                      │
┌──────────────────┐                           │
│  product_skus    │                           │
├──────────────────┤                           │
│ id (PK)          │                           │
│ product_id (FK)  │                           │
│ size             │                           │
│ unit             │                           │
│ barcode          │                           │
│ price            │                           │
│ current_stock    │                           │
│ status           │                           │
│ created_at       │                           │
└──────────────────┘                           │
        │                                      │
        │                                      │
        ▼                                      │
┌──────────────────┐         ┌──────────────────┐
│   recipes        │         │ sales_invoices   │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │         │ id (PK)          │
│ code             │         │ invoice_number   │
│ name             │         │ outlet_id (FK)───┼──────────┘
│ version          │         │ vehicle_id (FK)  │
│ expected_yield   │         │ invoice_date     │
│ is_active        │         │ subtotal         │
│ notes            │         │ discount_percent │
│ created_at       │         │ discount_amount  │
└──────────────────┘         │ total_amount     │
        │                    │ payment_method   │
        │                    │ payment_status   │
        ▼                    │ created_by (FK)  │
┌──────────────────┐         │ created_at       │
│  recipe_items    │         └──────────────────┘
├──────────────────┤                 │
│ id (PK)          │                 │
│ recipe_id (FK)   │                 ▼
│ material_id (FK) │         ┌──────────────────┐
│ quantity         │         │ invoice_items    │
│ unit             │         ├──────────────────┤
└──────────────────┘         │ id (PK)          │
                             │ invoice_id (FK)  │
                             │ sku_id (FK)      │
┌──────────────────┐         │ quantity         │
│ production_runs  │         │ unit_price       │
├──────────────────┤         │ discount_percent │
│ id (PK)          │         │ discount_amount  │
│ recipe_id (FK)   │         │ total_amount     │
│ production_date  │         └──────────────────┘
│ batch_number     │
│ produced_by (FK) │         ┌──────────────────┐
│ status           │         │   vehicles       │
│ notes            │         ├──────────────────┤
│ created_at       │         │ id (PK)          │
└──────────────────┘         │ code             │
        │                    │ name             │
        │                    │ driver_name      │
        ▼                    │ status           │
┌───────────────────────┐    │ created_at       │
│ production_materials  │    └──────────────────┘
├───────────────────────┤            │
│ id (PK)               │            │
│ production_run_id(FK) │            ▼
│ batch_id (FK)         │    ┌──────────────────┐
│ quantity_used         │    │ vehicle_stock    │
└───────────────────────┘    ├──────────────────┤
        │                    │ id (PK)          │
        ▼                    │ vehicle_id (FK)  │
┌───────────────────────┐    │ sku_id (FK)      │
│ production_output     │    │ quantity         │
├───────────────────────┤    │ updated_at       │
│ id (PK)               │    └──────────────────┘
│ production_run_id(FK) │
│ sku_id (FK)           │    ┌──────────────────┐
│ quantity_produced     │    │   payments       │
└───────────────────────┘    ├──────────────────┤
                             │ id (PK)          │
┌──────────────────────┐     │ outlet_id (FK)   │
│  purchase_orders     │     │ payment_date     │
├──────────────────────┤     │ amount           │
│ id (PK)              │     │ payment_method   │
│ po_number            │     │ reference        │
│ supplier_id (FK)     │     │ notes            │
│ order_date           │     │ created_by (FK)  │
│ expected_date        │     │ created_at       │
│ total_amount         │     └──────────────────┘
│ status               │             │
│ created_by (FK)      │             │
│ created_at           │             ▼
└──────────────────────┘     ┌──────────────────────┐
        │                    │ payment_allocations  │
        ▼                    ├──────────────────────┤
┌──────────────────────┐     │ id (PK)              │
│    po_items          │     │ payment_id (FK)──────┼──────────┘
├──────────────────────┤     │ invoice_id (FK)      │
│ id (PK)              │     │ allocated_amount     │
│ po_id (FK)           │     │ created_at           │
│ material_id (FK)     │     └──────────────────────┘
│ quantity             │
│ unit_cost            │     ┌──────────────────────┐
│ total_amount         │     │ supplier_payments    │
└──────────────────────┘     ┌──────────────────────┐
                             │ stock_adjustments    │
                             ├──────────────────────┤
                             │ id (PK)              │
                             │ adjustment_type      │
                             │ item_type            │
                             │ item_id              │
                             │ quantity             │
                             │ reason               │
                             │ notes                │
                             │ created_by (FK)      │
                             │ created_at           │
                             └──────────────────────┘
```

---

## 2. Tables Definition

### 2.1 User Management

#### `users`

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
);
```

#### `employees`

```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('sales_ref', 'driver', 'warehouse', 'other') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    assigned_route_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_route_id) REFERENCES routes(id),
    INDEX idx_code (code),
    INDEX idx_type (type),
    INDEX idx_assigned_route (assigned_route_id),
    INDEX idx_status (status)
);
```

---

### 2.2 Supplier Management

#### `suppliers`

```sql
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    payment_terms ENUM('cash', 'credit','check') DEFAULT 'credit',
    balance DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_status (status)
);
```

#### `supplier_payments`

```sql
CREATE TABLE supplier_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    purchase_order_id INT NULL, -- Links payment to specific PO (nullable for general payments)
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'credit', 'bank_transfer', 'check') NOT NULL,
    check_number VARCHAR(50),
    check_date DATE,
    clearance_date DATE,
    reference VARCHAR(100),
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_purchase_order (purchase_order_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_check_number (check_number)
);
```

**Payment-PO Linking (Added Jan 17, 2026):**

- `purchase_order_id` (nullable): Links payment to specific PO
- NULL value indicates general payment not allocated to specific PO
- Enables PO-specific payment tracking and reporting
- ON DELETE SET NULL: If PO deleted, payment remains with NULL reference

---

### 2.3 Inventory - Raw Materials

#### `raw_materials`

```sql
CREATE TABLE raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit VARCHAR(20) NOT NULL, -- kg, liter, pieces, etc.
    reorder_level DECIMAL(10,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_status (status)
);
```

#### `raw_material_batches`

```sql
CREATE TABLE raw_material_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    supplier_id INT NOT NULL,
    purchase_order_id INT NULL, -- Links batch to the PO it was received from
    batch_number VARCHAR(50) NOT NULL, -- System-generated (e.g., RM-MAT001-20251218-001)
    batch_type ENUM('receipt', 'return') DEFAULT 'receipt', -- receipt=from PO, return=returned stock
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    expiry_date DATE,
    source_batch_id INT, -- Self-referential: for returns, points to source receipt batch
    return_reason VARCHAR(100), -- e.g., 'excess stock', 'damaged', 'quality issue'
    disposition ENUM('stock', 'dispose'), -- 'stock'=back to inventory, 'dispose'=discard
    inspection_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    inspection_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (source_batch_id) REFERENCES raw_material_batches(id),
    UNIQUE KEY unique_batch (batch_number),
    INDEX idx_material (material_id),
    INDEX idx_batch (batch_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_purchase_order (purchase_order_id),
    INDEX idx_purchase_date (purchase_date),
    INDEX idx_batch_type (batch_type),
    INDEX idx_source_batch (source_batch_id)
);
```

**Batch Traceability Features:**

- **batch_type:** Distinguishes between receipt batches (from PO) and return batches
- **purchase_order_id (Added Jan 17, 2026):** Links batch to specific PO for complete traceability
  - NULL for legacy batches or non-PO related stock adjustments
  - Enables PO-specific batch filtering in PurchaseOrderView
- **source_batch_id:** Self-referential foreign key - enables genealogy tracking
  - Receipt batches: source_batch_id = NULL
  - Return batches: source_batch_id = ID of the receipt batch being returned
- **Return Tracking:** return_reason and disposition fields document why material was returned
- **QC Workflow:** inspection_status and inspection_notes support batch approval process
- **Genealogy Queries:**
  - Find all batches from a PO: `SELECT * FROM raw_material_batches WHERE purchase_order_id = ?`
  - Find all returns from a receipt batch: `SELECT * FROM raw_material_batches WHERE source_batch_id = ?`
  - Trace return to source: `SELECT source_batch_id FROM raw_material_batches WHERE id = ? AND batch_type = 'return'`
  - Material summary: `SUM(quantity) WHERE material_id = ? AND batch_type = 'receipt'` minus `SUM(quantity) WHERE material_id = ? AND batch_type = 'return'`

### 2.4 Products & SKUs

#### `products`

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    barcode VARCHAR(50) UNIQUE, -- Product-level barcode
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_barcode (barcode),
    INDEX idx_category (category),
    INDEX idx_status (status)
);
```

#### `product_skus`

```sql
CREATE TABLE product_skus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(20) NOT NULL, -- 100g, 500g, 1kg, etc.
    unit VARCHAR(20) NOT NULL, -- g, kg, ml, l
    barcode VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_product_size (product_id, size),
    INDEX idx_barcode (barcode),
    INDEX idx_product (product_id),
    INDEX idx_status (status)
);
```

---

### 2.5 Recipes & Production

#### `recipes`

```sql
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    expected_yield DECIMAL(10,2),
    yield_unit VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code_version (code, version),
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);
```

#### `recipe_items`

```sql
CREATE TABLE recipe_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    INDEX idx_recipe (recipe_id)
);
```

#### `production_runs`

```sql
CREATE TABLE production_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    production_date DATE NOT NULL,
    batch_number VARCHAR(50) NOT NULL,
    produced_by INT NOT NULL,
    status ENUM('completed', 'cancelled') DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (produced_by) REFERENCES users(id),
    INDEX idx_recipe (recipe_id),
    INDEX idx_production_date (production_date),
    INDEX idx_batch (batch_number)
);
```

#### `production_materials`

```sql
CREATE TABLE production_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_run_id INT NOT NULL,
    batch_id INT NOT NULL,
    quantity_used DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (production_run_id) REFERENCES production_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES raw_material_batches(id),
    INDEX idx_production_run (production_run_id)
);
```

#### `production_output`

```sql
CREATE TABLE production_output (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_run_id INT NOT NULL,
    sku_id INT NOT NULL,
    quantity_produced DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (production_run_id) REFERENCES production_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (sku_id) REFERENCES product_skus(id),
    INDEX idx_production_run (production_run_id)
);
```

---

### 2.6 Purchase Orders

#### `purchase_orders`

```sql
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    order_date DATE NOT NULL,
    expected_date DATE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    status ENUM('pending', 'partial', 'received', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_po_number (po_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);
```

#### `po_items`

```sql
CREATE TABLE po_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL, -- negative for returns
    unit_cost DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    received_quantity DECIMAL(10,2) DEFAULT 0,
    is_return BOOLEAN DEFAULT FALSE,
    return_reason VARCHAR(200),
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    INDEX idx_po (po_id),
    INDEX idx_is_return (is_return)
);
```

---

### 2.7 Routes & Outlets

#### `routes`

```sql
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status)
);
```

#### `outlets`

```sql
CREATE TABLE outlets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    route_id INT,
    default_discount DECIMAL(5,2) DEFAULT 20.00, -- percentage
    credit_limit DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0, -- outstanding balance
    payment_terms ENUM('cash', 'credit') DEFAULT 'cash',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_route (route_id),
    INDEX idx_status (status)
);
```

---

<!-- need to add 2nd phase -->

### 2.8 Vehicles

#### `vehicles`

```sql
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status)
);
```

#### `route_vehicle_history`

```sql
CREATE TABLE route_vehicle_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    unassigned_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    INDEX idx_route (route_id),
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_is_current (is_current),
    INDEX idx_assigned_date (assigned_date)
);
```

    sku_id INT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (sku_id) REFERENCES product_skus(id),
    UNIQUE KEY unique_vehicle_sku (vehicle_id, sku_id),
    INDEX idx_vehicle (vehicle_id)

);

````

---

### 2.9 Sales & Invoices

#### `sales_invoices`

```sql
CREATE TABLE sales_invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    outlet_id INT NOT NULL,
    sales_ref_id INT, -- Employee who collected the order
    route_id INT, -- Route for this sale
    invoice_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'credit', 'check') NOT NULL,
    payment_status ENUM('paid', 'unpaid', 'partial') DEFAULT 'unpaid',
    check_number VARCHAR(50),
    check_date DATE,
    clearance_date DATE,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (outlet_id) REFERENCES outlets(id),
    FOREIGN KEY (sales_ref_id) REFERENCES employees(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_outlet (outlet_id),
    INDEX idx_sales_ref (sales_ref_id),
    INDEX idx_route (route_id),
    INDEX idx_invoice_date (invoice_date),
    INDEX idx_payment_status (payment_status),
    INDEX idx_check_number (check_number)
);
````

#### `invoice_items`

```sql
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    sku_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL, -- negative for returns
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    is_return BOOLEAN DEFAULT FALSE,
    return_reason ENUM('damaged', 'expired', 'excess', 'quality_issue', 'other'),
    return_to_stock BOOLEAN DEFAULT FALSE, -- TRUE if usable, FALSE if disposed
    FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (sku_id) REFERENCES product_skus(id),
    INDEX idx_invoice (invoice_id),
    INDEX idx_is_return (is_return)
);
```

---

### 2.10 Payments

#### `payments`

```sql
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    outlet_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'check') NOT NULL,
    check_number VARCHAR(50),
    check_date DATE,
    clearance_date DATE,
    reference VARCHAR(100),
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (outlet_id) REFERENCES outlets(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_outlet (outlet_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_check_number (check_number)
);
```

---

### 2.11 Payment Allocations

#### `payment_allocations`

**Purpose:** Track how payments are allocated to specific invoices

```sql
CREATE TABLE payment_allocations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  invoice_id INT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE
);
```

---

### 2.12 Stock Adjustments

#### `stock_adjustments`

```sql
CREATE TABLE stock_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adjustment_type ENUM('add', 'reduce') NOT NULL,
    item_type ENUM('raw_material', 'finished_goods') NOT NULL,
    item_id INT NOT NULL, -- references either raw_materials or product_skus
    quantity DECIMAL(10,2) NOT NULL,
    reason VARCHAR(100) NOT NULL, -- damage, expired, theft, correction, etc.
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_item_type_id (item_type, item_id),
    INDEX idx_created_at (created_at)
);
```

---

## 3. Relationships Summary

- **users** → created various records (invoices, POs, payments, adjustments)
- **employees** → assigned routes, referenced in sales invoices (sales_ref)
- **suppliers** → raw_material_batches, purchase_orders, supplier_payments
- **raw_materials** → raw_material_batches, recipe_items, po_items
- **raw_material_batches** → production_materials
- **products** → product_skus
- **product_skus** → invoice_items, production_output
- **recipes** → recipe_items, production_runs
- **production_runs** → production_materials, production_output
- **routes** → outlets, employees, route_vehicle_history
- **outlets** → sales_invoices, payments
- **vehicles** → route_vehicle_history
- **purchase_orders** → po_items
- **sales_invoices** → invoice_items, employees (sales_ref), routes

---

## 4. Key Indexes

Performance-critical indexes already included in table definitions:

- Primary keys (auto-indexed)
- Foreign keys (indexed)
- Unique constraints (code, invoice_number, po_number, etc.)
- Frequently queried fields (status, dates, names)

---

## 5. Sample Queries

### 5.1 Get Outlet Outstanding Balance

```sql
SELECT
    o.code,
    o.name,
    o.balance,
    o.credit_limit,
    (o.credit_limit - o.balance) AS available_credit
FROM outlets o
WHERE o.id = ?;
```

### 5.2 Sales by Route (Daily)

```sql
SELECT
    r.name AS route_name,
    e.name AS sales_ref_name,
    COUNT(DISTINCT si.id) AS invoice_count,
    SUM(si.total_amount) AS total_sales,
    SUM(CASE WHEN si.payment_method = 'cash' THEN si.total_amount ELSE 0 END) AS cash_sales,
    SUM(CASE WHEN si.payment_method = 'credit' THEN si.total_amount ELSE 0 END) AS credit_sales,
    SUM(CASE WHEN si.payment_method = 'check' THEN si.total_amount ELSE 0 END) AS check_sales
FROM sales_invoices si
LEFT JOIN employees e ON si.sales_ref_id = e.id
JOIN routes r ON si.route_id = r.id
WHERE si.invoice_date = ?
GROUP BY r.id, r.name, e.id, e.name
ORDER BY total_sales DESC;
```

### 5.3 Current Stock Levels (Finished Goods)

```sql
SELECT
    p.name AS product_name,
    ps.size,
    ps.current_stock,
    ps.price,
    (ps.current_stock * ps.price) AS stock_value
FROM product_skus ps
JOIN products p ON ps.product_id = p.id
WHERE ps.status = 'active'
ORDER BY p.name, ps.size;
```

### 5.4 Raw Material Stock by Batch

```sql
SELECT
    rm.name AS material_name,
    rmb.batch_number,
    s.name AS supplier_name,
    rmb.quantity,
    rm.unit,
    rmb.unit_cost,
    (rmb.quantity * rmb.unit_cost) AS batch_value,
    rmb.purchase_date,
    rmb.expiry_date
FROM raw_material_batches rmb
JOIN raw_materials rm ON rmb.material_id = rm.id
JOIN suppliers s ON rmb.supplier_id = s.id
WHERE rmb.quantity > 0
ORDER BY rm.name, rmb.purchase_date;
```

### 5.5 Supplier Balance

```sql
SELECT
    s.name AS supplier_name,
    s.balance,
    (
        SELECT SUM(po.total_amount)
        FROM purchase_orders po
        WHERE po.supplier_id = s.id AND po.status IN ('received', 'partial')
    ) AS total_purchases,
    (
        SELECT SUM(sp.amount)
        FROM supplier_payments sp
        WHERE sp.supplier_id = s.id
    ) AS total_payments
FROM suppliers s
WHERE s.status = 'active'
ORDER BY s.balance DESC;
```

### 5.6 Top Selling Products (Excluding Returns)

```sql
SELECT
    p.name AS product_name,
    ps.size,
    SUM(ii.quantity) AS total_sold,
    SUM(ii.total_amount) AS revenue
FROM invoice_items ii
JOIN product_skus ps ON ii.sku_id = ps.id
JOIN products p ON ps.product_id = p.id
JOIN sales_invoices si ON ii.invoice_id = si.id
WHERE si.invoice_date BETWEEN ? AND ?
  AND ii.is_return = FALSE
GROUP BY p.id, ps.id
ORDER BY total_sold DESC
LIMIT 10;
```

### 5.7 Receivables Aging

```sql
SELECT
    o.code,
    o.name,
    r.name AS route_name,
    SUM(CASE WHEN DATEDIFF(CURDATE(), si.invoice_date) <= 30 THEN si.total_amount ELSE 0 END) AS current_30,
    SUM(CASE WHEN DATEDIFF(CURDATE(), si.invoice_date) BETWEEN 31 AND 60 THEN si.total_amount ELSE 0 END) AS days_31_60,
    SUM(CASE WHEN DATEDIFF(CURDATE(), si.invoice_date) BETWEEN 61 AND 90 THEN si.total_amount ELSE 0 END) AS days_61_90,
    SUM(CASE WHEN DATEDIFF(CURDATE(), si.invoice_date) > 90 THEN si.total_amount ELSE 0 END) AS over_90,
    o.balance AS total_outstanding
FROM outlets o
LEFT JOIN routes r ON o.route_id = r.id
LEFT JOIN sales_invoices si ON o.id = si.outlet_id AND si.payment_status IN ('unpaid', 'partial')
WHERE o.balance > 0
GROUP BY o.id
ORDER BY total_outstanding DESC;
```

### 5.8 Product Returns Summary

```sql
SELECT
    p.name AS product_name,
    ps.size,
    ii.return_reason,
    SUM(ABS(ii.quantity)) AS returned_quantity,
    SUM(ABS(ii.total_amount)) AS return_value,
    SUM(CASE WHEN ii.return_to_stock = TRUE THEN ABS(ii.quantity) ELSE 0 END) AS returned_to_stock,
    SUM(CASE WHEN ii.return_to_stock = FALSE THEN ABS(ii.quantity) ELSE 0 END) AS disposed
FROM invoice_items ii
JOIN product_skus ps ON ii.sku_id = ps.id
JOIN products p ON ps.product_id = p.id
JOIN sales_invoices si ON ii.invoice_id = si.id
WHERE ii.is_return = TRUE
  AND si.invoice_date BETWEEN ? AND ?
GROUP BY p.id, ps.id, ii.return_reason
ORDER BY return_value DESC;
```

### 5.9 Employee Performance (Sales Ref)

```sql
SELECT
    e.code,
    e.name AS sales_ref_name,
    r.name AS assigned_route,
    COUNT(DISTINCT si.id) AS total_orders,
    SUM(si.total_amount) AS total_sales,
    AVG(si.total_amount) AS avg_order_value,
    SUM(CASE WHEN si.payment_method = 'cash' THEN 1 ELSE 0 END) AS cash_orders,
    SUM(CASE WHEN si.payment_method = 'credit' THEN 1 ELSE 0 END) AS credit_orders
FROM employees e
LEFT JOIN routes r ON e.assigned_route_id = r.id
LEFT JOIN sales_invoices si ON e.id = si.sales_ref_id
WHERE e.type = 'sales_ref'
  AND e.status = 'active'
  AND si.invoice_date BETWEEN ? AND ?
GROUP BY e.id
ORDER BY total_sales DESC;
```

### 5.10 Vehicle Route History

```sql
SELECT
    v.code AS vehicle_code,
    v.name AS vehicle_name,
    r.name AS route_name,
    rvh.assigned_date,
    rvh.unassigned_date,
    DATEDIFF(
        COALESCE(rvh.unassigned_date, CURDATE()),
        rvh.assigned_date
    ) AS days_assigned,
    rvh.is_current
FROM route_vehicle_history rvh
JOIN vehicles v ON rvh.vehicle_id = v.id
JOIN routes r ON rvh.route_id = r.id
WHERE rvh.vehicle_id = ?
ORDER BY rvh.assigned_date DESC;
```

### 5.11 Check Payment Status

```sql
SELECT
    si.invoice_number,
    o.name AS outlet_name,
    si.check_number,
    si.check_date,
    si.clearance_date,
    si.total_amount,
    CASE
        WHEN si.clearance_date IS NOT NULL THEN 'Cleared'
        WHEN DATEDIFF(CURDATE(), si.check_date) > 30 THEN 'Overdue'
        ELSE 'Pending'
    END AS check_status,
    DATEDIFF(CURDATE(), si.check_date) AS days_pending
FROM sales_invoices si
JOIN outlets o ON si.outlet_id = o.id
WHERE si.payment_method = 'check'
  AND si.clearance_date IS NULL
ORDER BY si.check_date;
```

---

**End of Database Schema Document**
