# Product, Recipe, and Production Workflow - Comprehensive Analysis Report

**Project:** Hasal Products POS & Inventory Management System  
**Version:** 1.0  
**Date:** January 19, 2026  
**Prepared for:** Full System Understanding

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Product Management Workflow](#product-management-workflow)
4. [Recipe Management Workflow](#recipe-management-workflow)
5. [Production Workflow](#production-workflow)
6. [Interconnections & Data Flow](#interconnections--data-flow)
7. [Database Schema Details](#database-schema-details)
8. [API Endpoints & Operations](#api-endpoints--operations)
9. [Frontend Implementation](#frontend-implementation)
10. [Business Rules & Logic](#business-rules--logic)
11. [Traceability & Batch Management](#traceability--batch-management)
12. [Complete Workflow Diagram](#complete-workflow-diagram)

---

## 1. Executive Summary

The Hasal Products system implements a comprehensive manufacturing and inventory management solution for a spices production business. The system follows a **hierarchical product-recipe-production model** where:

- **Products** are abstract definitions of what the company manufactures
- **Product SKUs** are specific packaged variations (100g, 500g, 1kg) of products
- **Recipes** define the raw materials and quantities needed to produce specific SKUs
- **Production Runs** execute recipes to consume raw materials and create finished goods

### Key Features:

- ✅ Multi-SKU product management (different package sizes)
- ✅ Recipe versioning system for maintaining historical formulations
- ✅ FIFO (First-In-First-Out) batch consumption for raw materials
- ✅ Automatic inventory updates during production
- ✅ Batch traceability from raw materials to finished goods
- ✅ Cost tracking per recipe and production run

---

## 2. System Architecture Overview

### 2.1 Technology Stack

**Frontend:**

- Vue.js 3 (Composition API)
- Pinia for state management
- PrimeVue for UI components
- Vue Router for navigation

**Backend:**

- Node.js with Express.js
- Sequelize ORM
- MySQL database
- RESTful API architecture

**Key Architectural Patterns:**

- MVC (Model-View-Controller) pattern
- Repository pattern for data access
- Service layer for business logic
- Transaction management for data integrity

### 2.2 Module Structure

```
System Modules:
├── Product Management
│   ├── Products (base products)
│   └── Product SKUs (packaged variants)
├── Recipe Management
│   ├── Recipes (formulations)
│   ├── Recipe Items (bill of materials)
│   └── Recipe Versioning
├── Production Management
│   ├── Production Runs
│   ├── Production Materials (inputs)
│   └── Production Output (finished goods)
├── Raw Material Management
│   ├── Raw Materials
│   └── Raw Material Batches (with FIFO)
└── Inventory Management
    ├── Stock tracking
    └── Batch traceability
```

---

## 3. Product Management Workflow

### 3.1 Product Hierarchy

The system uses a two-level product structure:

```
Product (Abstract)
    ↓
Product SKUs (Concrete Implementations)
```

**Example:**

```
Product: "Curry Powder"
├── SKU 1: 100g package (Rs. 150)
├── SKU 2: 500g package (Rs. 700)
└── SKU 3: 1kg package (Rs. 1,300)
```

### 3.2 Product Creation Process

#### Backend Flow (productController.js):

```javascript
POST /api/products
├── Step 1: Validate product data (name required)
├── Step 2: Auto-generate product code (PROD001, PROD002, etc.)
├── Step 3: Create product record
└── Step 4: Return created product with empty SKUs array
```

**Database Schema - products:**

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,           -- Auto-generated (PROD001)
    name VARCHAR(100) NOT NULL,                 -- Product name
    category VARCHAR(50),                       -- Product category
    barcode VARCHAR(50) UNIQUE,                 -- Optional product barcode
    description TEXT,                           -- Product description
    status ENUM('active', 'inactive'),          -- Active/Inactive
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name),
    INDEX idx_category (category)
);
```

### 3.3 Product SKU Management

SKUs represent different package sizes or variations of a product.

#### SKU Creation Process:

```javascript
POST /api/products/:id/skus
├── Step 1: Validate product exists
├── Step 2: Validate SKU data (size, unit, price)
├── Step 3: Check barcode uniqueness (if provided)
├── Step 4: Verify no duplicate size for same product
├── Step 5: Create SKU with initial stock = 0
└── Step 6: Return created SKU
```

**Database Schema - product_skus:**

```sql
CREATE TABLE product_skus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,                    -- FK to products
    size VARCHAR(20) NOT NULL,                  -- 100g, 500g, 1kg, etc.
    unit VARCHAR(20) NOT NULL,                  -- g, kg, ml, l
    barcode VARCHAR(50),                        -- Optional SKU barcode
    price DECIMAL(10,2) NOT NULL,               -- Selling price
    current_stock DECIMAL(10,2) DEFAULT 0,      -- Current inventory level
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_product_size (product_id, size)
);
```

### 3.4 Product Operations

#### Available API Endpoints:

| Method | Endpoint                               | Description                                 |
| ------ | -------------------------------------- | ------------------------------------------- |
| GET    | `/api/products`                        | List all products with pagination & filters |
| GET    | `/api/products/:id`                    | Get single product with all SKUs            |
| POST   | `/api/products`                        | Create new product                          |
| PUT    | `/api/products/:id`                    | Update product details                      |
| DELETE | `/api/products/:id`                    | Delete product (if no SKUs exist)           |
| POST   | `/api/products/:id/skus`               | Add SKU to product                          |
| PUT    | `/api/products/:productId/skus/:skuId` | Update SKU                                  |
| DELETE | `/api/products/:productId/skus/:skuId` | Delete SKU (if no stock)                    |
| GET    | `/api/products/:id/stock`              | Get stock summary for all SKUs              |

#### Business Rules:

1. **Product Code Generation:**
   - Automatically generated as PROD + 3-digit number (PROD001, PROD002...)
   - Based on last product ID + 1

2. **SKU Constraints:**
   - Each product can have multiple SKUs
   - Each SKU must have unique size for the same product
   - Barcode must be unique across all SKUs
   - Initial stock is always 0 (populated by production)

3. **Deletion Rules:**
   - Products cannot be deleted if SKUs exist
   - SKUs cannot be deleted if stock > 0

4. **Status Management:**
   - Products/SKUs can be marked as inactive instead of deletion
   - Inactive items are hidden in active lists but preserved in history

### 3.5 Frontend Implementation

#### Product Components:

**ProductIndex.vue:**

- Lists all products with DataTable
- Provides search and filter capabilities
- Shows SKU count per product
- Navigate to product details or edit

**ProductCreate.vue:**

- Form to create new product
- Basic information: name, category, description
- Auto-generates product code on save

**ProductView.vue:**

- Display product details
- List all SKUs with prices and stock
- Option to add new SKUs
- Edit/delete SKU actions

**State Management (product.js store):**

```javascript
// Key State Properties
products: []; // All products
currentProduct: null; // Selected product with SKUs
pagination: {
  (page, limit, total, totalPages);
}
filters: {
  (search, status);
}

// Key Actions
fetchProducts(); // Get all products
fetchProductById(id); // Get single product with SKUs
createProduct(data); // Create new product
updateProduct(id, data); // Update product
addSku(productId, data); // Add SKU to product
updateSku(productId, skuId, data); // Update SKU
deleteSku(productId, skuId); // Delete SKU
```

---

## 4. Recipe Management Workflow

### 4.1 Recipe Concept

Recipes define the **Bill of Materials (BOM)** - the raw materials and quantities needed to produce a specific batch of finished product.

**Key Features:**

- Recipe versioning (v1, v2, v3...)
- Active/inactive status (only one version active at a time)
- Expected yield calculation
- Cost tracking per recipe

### 4.2 Recipe Structure

```
Recipe
├── Header Information
│   ├── Code (unique identifier)
│   ├── Name
│   ├── Version (1, 2, 3...)
│   ├── Expected Yield (quantity produced)
│   ├── Yield Unit (kg, g, L, etc.)
│   └── Active Status
└── Recipe Items (BOM)
    ├── Item 1: Raw Material + Quantity + Unit
    ├── Item 2: Raw Material + Quantity + Unit
    └── Item N: Raw Material + Quantity + Unit
```

**Example Recipe:**

```
Recipe: "Curry Powder Mix"
Code: RECIPE001
Version: 1
Expected Yield: 10 kg
Status: Active

Bill of Materials:
├── Coriander Powder: 5 kg
├── Cumin Powder: 2 kg
├── Turmeric Powder: 1.5 kg
├── Chili Powder: 1 kg
└── Fenugreek Powder: 0.5 kg
Total: 10 kg input materials
```

### 4.3 Recipe Creation Process

#### Backend Flow (recipeController.js):

```javascript
POST /api/recipes
├── Transaction Start
├── Step 1: Validate recipe data
│   ├── Check code, name, expected_yield, yield_unit
│   └── Validate no duplicate code exists
├── Step 2: Create recipe with version = 1
│   └── Set is_active = true (first version is always active)
├── Step 3: Create recipe items (loop through items array)
│   ├── Validate each item has material_id and quantity
│   ├── Verify raw material exists
│   └── Create recipe_item record
├── Transaction Commit
└── Return created recipe with all items
```

**Database Schema - recipes:**

```sql
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,                  -- Recipe identifier
    name VARCHAR(100) NOT NULL,                 -- Recipe name
    version INT NOT NULL DEFAULT 1,             -- Version number
    expected_yield DECIMAL(10,2),               -- Expected output quantity
    yield_unit VARCHAR(20),                     -- Unit (kg, g, L, ml)
    is_active BOOLEAN DEFAULT TRUE,             -- Active version flag
    notes TEXT,                                 -- Additional notes
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_code_version (code, version),
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);
```

**Database Schema - recipe_items:**

```sql
CREATE TABLE recipe_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,                     -- FK to recipes
    material_id INT NOT NULL,                   -- FK to raw_materials
    quantity DECIMAL(10,2) NOT NULL,            -- Required quantity
    unit VARCHAR(20) NOT NULL,                  -- Unit of measure
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    INDEX idx_recipe (recipe_id)
);
```

### 4.4 Recipe Versioning System

One of the most important features is **recipe versioning** which maintains historical formulations.

#### How Versioning Works:

```javascript
PUT /api/recipes/:id (Update Recipe)
├── Transaction Start
├── Step 1: Get current recipe (e.g., version 2)
├── Step 2: Mark current recipe as INACTIVE (is_active = false)
├── Step 3: Create new recipe record
│   ├── Same code as current recipe
│   ├── Version = current version + 1 (e.g., version 3)
│   ├── Updated name/yield/notes (or keep same)
│   └── Set is_active = TRUE
├── Step 4: Create new recipe items for new version
├── Transaction Commit
└── Return new recipe version
```

**Versioning Example:**

```
Timeline:
2025-01-01: Create RECIPE001 v1 (Active)
2025-06-15: Update RECIPE001
            - v1 becomes Inactive
            - v2 created (Active)
2026-01-19: Update RECIPE001
            - v2 becomes Inactive
            - v3 created (Active)

Result in Database:
RECIPE001 v1 (Inactive) - Historical
RECIPE001 v2 (Inactive) - Historical
RECIPE001 v3 (Active) - Current
```

#### Benefits of Versioning:

1. **Historical Traceability:** Know exactly what formulation was used for past production runs
2. **Audit Compliance:** Track all recipe changes with dates
3. **Rollback Capability:** Can reactivate old versions if needed
4. **Cost Analysis:** Compare material costs across versions
5. **Quality Control:** Trace quality issues back to specific formulations

### 4.5 Recipe Operations

#### Available API Endpoints:

| Method | Endpoint                               | Description                         |
| ------ | -------------------------------------- | ----------------------------------- |
| GET    | `/api/recipes`                         | List all recipes with filters       |
| GET    | `/api/recipes/:id`                     | Get single recipe with items        |
| POST   | `/api/recipes`                         | Create new recipe (version 1)       |
| PUT    | `/api/recipes/:id`                     | Update recipe (creates new version) |
| DELETE | `/api/recipes/:id`                     | Delete recipe and items             |
| GET    | `/api/recipes/:id/versions`            | Get all versions of a recipe        |
| POST   | `/api/recipes/:id/items`               | Add item to recipe                  |
| PUT    | `/api/recipes/:recipeId/items/:itemId` | Update recipe item                  |
| DELETE | `/api/recipes/:recipeId/items/:itemId` | Delete recipe item                  |

#### Business Rules:

1. **Code Uniqueness:**
   - Recipe code must be unique per code (not per code+version)
   - Multiple versions share the same code

2. **Active Version:**
   - Only ONE version can be active at a time per recipe code
   - Updating creates new version and deactivates old one
   - First version is always active by default

3. **Recipe Items:**
   - Minimum 1 item required
   - Each item must reference valid raw material
   - Quantities must be positive
   - Unit should match raw material's unit

4. **Deletion:**
   - Can delete entire recipe (all versions)
   - CASCADE delete removes all recipe items
   - Should check if recipe is used in production runs (validation)

5. **Cost Calculation:**
   - Total cost = SUM(item.quantity × material.average_cost)
   - Cost per unit = total cost / expected_yield

### 4.6 Frontend Implementation

#### Recipe Components:

**RecipeIndex.vue:**

- Lists all recipes with version info
- Filters: search, active/inactive status
- Shows total cost and cost per unit
- Navigate to recipe details or create new

**RecipeForm.vue:**

- Create new recipe or edit (creates new version)
- Product and SKU selection (Note: Current implementation shows fields but may not be fully integrated)
- Recipe name, batch size, unit
- BOM (Bill of Materials) management:
  - Add raw materials with quantities
  - Edit/delete BOM items
  - Calculate total cost
  - Calculate cost per unit
- Shows real-time cost calculation

**RecipeView.vue:**

- Display recipe details with version number
- Show all BOM items with quantities and costs
- List all versions of the recipe
- Option to create new version (edit)

**State Management (recipe.js store):**

```javascript
// Key State Properties
recipes: []; // All recipes
currentRecipe: null; // Selected recipe with items
versionHistory: []; // All versions of a recipe
filters: {
  (search, is_active, product_id);
}

// Key Actions
fetchRecipes(); // Get all recipes
fetchRecipeById(id); // Get recipe with items
createRecipe(data); // Create new recipe (v1)
updateRecipe(id, data); // Create new version
deleteRecipe(id); // Delete recipe
fetchVersionHistory(id); // Get all versions
addItem(recipeId, itemData); // Add recipe item
updateItem(recipeId, itemId, data); // Update item
deleteItem(recipeId, itemId); // Delete item
```

---

## 5. Production Workflow

### 5.1 Production Run Concept

A **Production Run** is the execution of a recipe to manufacture finished goods. It consumes raw materials and creates finished product SKUs.

**Key Characteristics:**

- Based on a specific recipe version
- Uses FIFO (First-In-First-Out) batch allocation
- Records which raw material batches were consumed
- Creates new finished goods inventory
- Generates batch numbers for traceability

### 5.2 Production Run Structure

```
Production Run
├── Header Information
│   ├── Recipe ID (which formulation to use)
│   ├── Production Date
│   ├── Batch Number (auto-generated)
│   ├── Produced By (user ID)
│   ├── Status (completed/cancelled)
│   └── Notes
├── Materials Consumed (Production Materials)
│   ├── Batch 1: Material X, Quantity Used
│   ├── Batch 2: Material Y, Quantity Used
│   └── Batch N: Material Z, Quantity Used
└── Output Produced (Production Output)
    └── SKU: Quantity Produced
```

### 5.3 Production Creation Process

This is a **three-step process**: Create → Start → Complete

#### Step 1: Create Production Run (Plan)

```javascript
POST /api/production-runs
├── Step 1: Validate data (recipe_id, expected_quantity, produced_by)
├── Step 2: Verify recipe exists and is active
├── Step 3: Validate expected_quantity > 0
├── Step 4: Create production_run record
│   ├── Status = 'planned' (default)
│   ├── Auto-generate batch number if not provided
│   ├── Record expected_quantity (for material scaling)
│   └── Record production date and producer
└── Return created production run
```

**Database Schema - production_runs:**

```sql
CREATE TABLE production_runs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,                     -- FK to recipes
    production_date DATE NOT NULL,              -- When produced
    batch_number VARCHAR(50) NOT NULL,          -- Batch identifier
    produced_by INT NOT NULL,                   -- FK to users
    expected_quantity DECIMAL(10,2) NOT NULL,   -- Target output quantity
    status ENUM('planned', 'in_progress', 'completed', 'cancelled'), -- Run status
    actual_quantity DECIMAL(10,2),              -- Actual output (after completion)
    waste_quantity DECIMAL(10,2),               -- Waste/loss quantity
    waste_reason VARCHAR(255),                  -- Reason for waste
    yield_efficiency DECIMAL(5,2),              -- (actual/expected) * 100
    notes TEXT,                                 -- Additional notes
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (produced_by) REFERENCES users(id),
    INDEX idx_recipe (recipe_id),
    INDEX idx_production_date (production_date),
    INDEX idx_batch (batch_number),
    INDEX idx_status (status)
);
```

#### Step 2: Start Production Run (Material Deduction - CRITICAL PROCESS)

This step checks material availability and performs FIFO deduction **BEFORE** production begins.

```javascript
POST /api/production-runs/:id/start
├── Transaction Start (CRITICAL - Must be atomic)
├── Step 1: Validate production run
│   └── Status must be 'planned'
│   └── expected_quantity must be > 0
├── Step 2: Fetch production run with recipe and recipe items
├── Step 3: Calculate scale factor
│   └── scale_factor = expected_quantity / recipe.expected_yield
│       Example: Want to produce 50kg, recipe yield is 10kg
│                scale_factor = 50 / 10 = 5
├── Step 4: For each recipe item (raw material):
│   ├── 4.1: Calculate required quantity
│   │   └── required = item.quantity × scale_factor
│   │       Example: Recipe needs 2kg, scale = 5
│   │                required = 2 × 5 = 10kg
│   ├── 4.2: Fetch available batches (FIFO order)
│   │   └── WHERE material_id = item.material_id
│   │       AND quantity > 0
│   │       AND batch_type = 'receipt'
│   │       AND (expiry_date IS NULL OR expiry_date > NOW())
│   │       ORDER BY created_at ASC  -- FIFO!
│   ├── 4.3: Deduct from batches using FIFO
│   │   └── For each batch (oldest first):
│   │       ├── available = batch.quantity
│   │       ├── Take min(required_qty, available)
│   │       ├── Calculate cost: batch.unit_cost × taken
│   │       ├── Update batch: quantity -= taken
│   │       ├── Record in production_materials
│   │       └── Subtract taken from required_qty
│   │       └── Continue until required_qty = 0
│   └── 4.4: Check if sufficient stock
│       └── If required_qty > 0 after all batches:
│           └── ROLLBACK and return error with details
│               "Insufficient stock for {material}. Required: X, Available: Y"
├── Step 5: Update production run status = 'in_progress'
├── Transaction Commit
└── Return updated production run with materials used
```

**Key Differences from Old Flow:**

- Material check happens **BEFORE** production (not after)
- Uses `expected_quantity` to scale materials
- Status changes to `in_progress` (not directly to completed)
- Materials are deducted from inventory immediately
- Cannot edit once in_progress (materials already deducted)

#### Step 3: Complete Production Run (Output Recording)

#### Step 3: Complete Production Run (Output Recording)

This step records the actual production output. Materials have already been deducted in Step 2.

```javascript
POST /api/production-runs/:id/complete
├── Transaction Start (CRITICAL - Must be atomic)
├── Step 1: Validate inputs
│   └── quantity_produced > 0
│   └── Status must be 'in_progress'
├── Step 2: Fetch production run with existing production_materials
├── Step 3: Calculate total material cost
│   └── Read from production_materials (created in START step)
│   └── total_cost = SUM(quantity_used × batch.unit_cost)
├── Step 4: Calculate costs
│   ├── total_expected = quantity_produced + waste_quantity
│   ├── base_unit_cost = total_material_cost / total_expected
│   ├── finished_goods_cost = base_unit_cost × quantity_produced
│   └── waste_cost = base_unit_cost × waste_quantity (tracked separately)
├── Step 5: Generate finished goods batch number
│   └── Format: FG-{sku_id}-{YYYYMMDD}-{seq}
├── Step 6: Update SKU inventory (weighted average cost)
│   ├── current_value = current_stock × average_cost
│   ├── new_value = quantity_produced × base_unit_cost
│   ├── total_value = current_value + new_value
│   ├── total_quantity = current_stock + quantity_produced
│   ├── new_avg_cost = total_value / total_quantity
│   └── Update: current_stock, average_cost, cost_last_updated
├── Step 7: Create production_output record
│   └── Records: sku_id, quantity_produced, batch_number,
│                 unit_cost, total_cost, waste_cost
├── Step 8: Calculate yield efficiency
│   └── yield_efficiency = (quantity_produced / expected_quantity) × 100
├── Step 9: Update production run
│   ├── Status = 'completed'
│   ├── actual_quantity = quantity_produced
│   ├── waste_quantity, waste_reason
│   └── yield_efficiency
├── Transaction Commit
└── Return completed production run with all details
```

**Key Changes from Old Flow:**

- **NO material deduction** (already done in START)
- Reads material costs from `production_materials` table
- Focuses on output recording and cost calculation
- Tracks yield efficiency (actual vs expected)
- Separates finished goods cost from waste cost

**Database Schema - production_materials:**

```sql
CREATE TABLE production_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_run_id INT NOT NULL,             -- FK to production_runs
    batch_id INT NOT NULL,                      -- FK to raw_material_batches
    quantity_used DECIMAL(10,2) NOT NULL,       -- Amount consumed
    FOREIGN KEY (production_run_id) REFERENCES production_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES raw_material_batches(id),
    INDEX idx_production_run (production_run_id)
);
```

**Database Schema - production_output:**

```sql
CREATE TABLE production_output (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_run_id INT NOT NULL,             -- FK to production_runs
    sku_id INT NOT NULL,                        -- FK to product_skus
    quantity_produced DECIMAL(10,2) NOT NULL,   -- Amount created
    FOREIGN KEY (production_run_id) REFERENCES production_runs(id) ON DELETE CASCADE,
    FOREIGN KEY (sku_id) REFERENCES product_skus(id),
    INDEX idx_production_run (production_run_id)
);
```

### 5.4 FIFO (First-In-First-Out) Logic

The FIFO logic ensures that oldest raw material batches are consumed first. This happens during the **START** step, not the complete step.

**Why FIFO?**

1. **Quality Control:** Use older stock before it expires
2. **Expiry Management:** Minimize waste from expired materials
3. **Cost Accuracy:** Match costs with actual consumption patterns
4. **Compliance:** Standard practice in food manufacturing
5. **Traceability:** Know exact batches used in production
6. **Inventory Accuracy:** Deduct materials before production begins

**FIFO Example (during START step):**

```
Scenario: Start production requiring 10kg of Turmeric Powder
(Expected Quantity = 120kg, Recipe Yield = 100kg, Scale Factor = 1.2)
(Recipe Item: 8.33kg × 1.2 = 10kg required)

Available Batches (FIFO sorted):
1. Batch B001 (Jan 5):  quantity = 7kg, unit_cost = $5/kg  (oldest)
2. Batch B002 (Jan 10): quantity = 5kg, unit_cost = $6/kg
3. Batch B003 (Jan 15): quantity = 8kg, unit_cost = $5.5/kg  (newest)

Deduction Process (at START):
Step 1: Take 7kg from Batch B001 (exhausted, remaining = 3kg needed)
        B001.quantity = 0kg
        Cost = 7kg × $5 = $35

Step 2: Take 3kg from Batch B002 (satisfies need)
        B002.quantity = 2kg
        Cost = 3kg × $6 = $18

Total Material Cost = $35 + $18 = $53

Result (saved in production_materials table):
- production_materials records:
  * run_id=1, batch_id=B001, quantity_used=7kg
  * run_id=1, batch_id=B002, quantity_used=3kg
- Batch B003 remains untouched (for next production)
- Production run status → 'in_progress'
- When COMPLETE is called later, it reads these costs ($53 total)
```

### 5.5 Material Availability Check

Before completing a production run, you can check if sufficient materials are available.

```javascript
GET /api/production-runs/:id/check-materials
├── Step 1: Get production run with recipe
├── Step 2: Calculate scale factor
├── Step 3: For each recipe item:
│   ├── Calculate required quantity
│   ├── Query available batches (FIFO order)
│   ├── Sum available quantities
│   ├── Determine if sufficient (available >= required)
│   └── Calculate shortage if insufficient
└── Return material check report:
    └── For each material:
        ├── Required quantity
        ├── Available quantity
        ├── Is sufficient (true/false)
        ├── Shortage amount (if any)
        └── List of available batches
```

**Use Case:**

- Pre-production planning
- Identify material shortages
- Trigger purchase orders for low stock

### 5.6 Production Operations

#### Available API Endpoints:

| Method | Endpoint                                   | Description                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/api/production-runs`                     | List all production runs with filters    |
| GET    | `/api/production-runs/:id`                 | Get single run with materials & output   |
| POST   | `/api/production-runs`                     | Create new production run                |
| PUT    | `/api/production-runs/:id`                 | Update production run (if not completed) |
| DELETE | `/api/production-runs/:id`                 | Delete run (if not completed)            |
| POST   | `/api/production-runs/:id/complete`        | Execute production (FIFO, stock updates) |
| GET    | `/api/production-runs/:id/check-materials` | Check material availability              |

#### Business Rules:

1. **Recipe Validation:**
   - Must use an existing recipe
   - Recipe should be active (recommended)
   - Recipe version is locked at creation time

2. **Batch Number:**
   - System-generated or manual
   - Format: PROD-YYYYMMDD-NNN
   - Must be unique

3. **Completion Rules:**
   - Can only complete once
   - Must have sufficient raw materials (FIFO check)
   - Updates are atomic (all or nothing transaction)
   - Cannot edit completed production runs

4. **Stock Updates:**
   - Raw material batches: Decrease current_quantity
   - Product SKUs: Increase current_stock
   - Both happen in same transaction

5. **Status Management:**
   - Planned: Created but not completed
   - Completed: Materials consumed, goods produced
   - Cancelled: Can be marked cancelled (no stock changes)

6. **Scale Factor:**
   - Allows producing different quantities than recipe batch size
   - All material quantities scaled proportionally
   - Example: Recipe for 10kg, produce 50kg = 5x scale

### 5.7 Frontend Implementation

#### Production Components:

**ProductionIndex.vue:**

- Lists all production runs
- Filters: status, product, date range
- Shows recipe name, quantity, status
- Navigate to production details or create new

**ProductionCreate.vue:**

- Wrapper component
- Loads ProductionRunForm component

**ProductionRunForm.vue:**

- Recipe selection dropdown
- Production date picker
- Quantity input with unit
- Shows recipe details when selected:
  - Product and SKU information
  - Batch size
  - Number of batches (calculated: quantity / batch_size)
  - Expected output
- Required materials table:
  - Shows each raw material
  - Quantity per batch
  - Total required (scaled)
- Status selection
- Notes field

**ProductionView.vue:**

- Display production run header info
- Show recipe used with version
- List materials consumed:
  - Which batches were used
  - Quantities from each batch
  - Batch numbers for traceability
- Show production output:
  - SKU produced
  - Quantity produced
  - Batch number of finished goods

**State Management (production.js store):**

```javascript
// Key State Properties
productionRuns: []; // All production runs
currentRun: null; // Selected run with details
filters: {
  (status, product_id, date_from, date_to);
}

// Key Actions
fetchProductionRuns(); // Get all runs
fetchProductionRunById(id); // Get single run with materials/output
createProductionRun(data); // Create new run
updateProductionRun(id, data); // Update run (if not completed)
completeProductionRun(id, data); // Execute production (FIFO)
checkMaterialAvailability(id); // Check if can produce
deleteProductionRun(id); // Delete run (if not completed)
```

---

## 6. Interconnections & Data Flow

### 6.1 Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│   products       │1      *│  product_skus    │
│                  ├─────────┤                  │
│ - id             │         │ - id             │
│ - code           │         │ - product_id (FK)│
│ - name           │         │ - size           │
│ - category       │         │ - price          │
│ - status         │         │ - current_stock  │
└──────────────────┘         └────────┬─────────┘
                                      │
                                      │*
                          ┌───────────┴──────────┐
                          │  production_output   │
                          │                      │
                          │ - production_run_id  │
                          │ - sku_id (FK)        │
                          │ - quantity_produced  │
                          └───────────┬──────────┘
                                      │*
                          ┌───────────┴──────────┐
                          │  production_runs     │
                          │                      │
                          │ - id                 │
                          │ - recipe_id (FK)     │
                          │ - production_date    │
                          │ - batch_number       │
                          │ - status             │
                          └───────────┬──────────┘
                                      │1
                                      │*
                          ┌───────────┴──────────┐
                          │  production_materials│
                          │                      │
                          │ - production_run_id  │
                          │ - batch_id (FK)      │
                          │ - quantity_used      │
                          └───────────┬──────────┘
                                      │*
                          ┌───────────┴──────────┐
                          │ raw_material_batches │
                          │                      │
                          │ - id                 │
                          │ - material_id (FK)   │
                          │ - current_quantity   │
                          │ - batch_number       │
                          └───────────┬──────────┘
                                      │*
                          ┌───────────┴──────────┐
                          │   raw_materials      │
                          │                      │
                          │ - id                 │
                          │ - code               │
                          │ - name               │
                          │ - unit               │
                          └───────────┬──────────┘
                                      │*
                          ┌───────────┴──────────┐
                          │   recipe_items       │
                          │                      │
                          │ - recipe_id (FK)     │
                          │ - material_id (FK)   │
                          │ - quantity           │
                          └───────────┬──────────┘
                                      │*
                          ┌───────────┴──────────┐
                          │      recipes         │
                          │                      │
                          │ - id                 │
                          │ - code               │
                          │ - version            │
                          │ - expected_yield     │
                          │ - is_active          │
                          └──────────────────────┘
```

### 6.2 Complete Data Flow: Raw Material → Finished Product

```
Step 1: Purchase Order Created
    └→ Raw materials ordered from supplier

Step 2: Purchase Order Received
    └→ raw_material_batches created
       - batch_number: "RM-TUR001-20260119-001"
       - quantity: 100 kg
       - current_quantity: 100 kg
       - type: 'receipt'

Step 3: Recipe Created
    └→ recipes + recipe_items
       Recipe: Curry Powder Mix v1
       - Expected yield: 10 kg
       Items:
       ├─ Turmeric: 3 kg
       ├─ Coriander: 4 kg
       └─ Cumin: 2 kg

Step 4: Production Run Created
    └→ production_runs record
       - recipe_id: Recipe v1
       - batch_number: "PROD-20260119-001"
       - status: 'planned'

Step 5: Production Completed (CRITICAL)
    ├─ Fetch recipe items
    ├─ Calculate required quantities (with scale factor)
    ├─ FIFO batch selection and deduction:
    │  └→ production_materials records created
    │     ├─ Material: Turmeric, Batch: RM-TUR001-..., Used: 3 kg
    │     ├─ Material: Coriander, Batch: RM-COR002-..., Used: 4 kg
    │     └─ Material: Cumin, Batch: RM-CUM003-..., Used: 2 kg
    │  └→ raw_material_batches updated (current_quantity decreased)
    │     ├─ Turmeric batch: 100 kg → 97 kg
    │     ├─ Coriander batch: 50 kg → 46 kg
    │     └─ Cumin batch: 30 kg → 28 kg
    ├─ Create finished goods:
    │  └→ production_output record
    │     - sku_id: Curry Powder 1kg package
    │     - quantity_produced: 10 units
    │  └→ product_skus updated (current_stock increased)
    │     - Curry Powder 1kg: 0 → 10 units
    └─ production_runs.status → 'completed'

Step 6: Sales Invoice Created
    └→ product_skus.current_stock decreased
       - Curry Powder 1kg: 10 → 5 units (sold 5)
```

### 6.3 Traceability Chain

The system provides **complete forward and backward traceability**:

#### Forward Traceability (Raw Material → Customer):

```
Raw Material Batch
    ↓ (used in)
Production Run
    ↓ (produced)
Finished Goods Batch
    ↓ (sold in)
Sales Invoice
    ↓ (delivered to)
Customer Outlet
```

**Query Example:**
"Which customers received products made from Batch RM-TUR001-20260119-001?"

```sql
SELECT DISTINCT o.name as outlet_name, si.invoice_number
FROM raw_material_batches rmb
JOIN production_materials pm ON pm.batch_id = rmb.id
JOIN production_runs pr ON pr.id = pm.production_run_id
JOIN production_output po ON po.production_run_id = pr.id
JOIN product_skus ps ON ps.id = po.sku_id
JOIN invoice_items ii ON ii.sku_id = ps.id
JOIN sales_invoices si ON si.id = ii.invoice_id
JOIN outlets o ON o.id = si.outlet_id
WHERE rmb.batch_number = 'RM-TUR001-20260119-001';
```

#### Backward Traceability (Customer → Raw Material):

```
Sales Invoice
    ↓ (contained)
Invoice Item (SKU)
    ↓ (produced by)
Production Output
    ↓ (from)
Production Run
    ↓ (consumed)
Production Materials
    ↓ (from batches)
Raw Material Batches
```

**Query Example:**
"What raw material batches were used to make products in Invoice INV-2026-001?"

```sql
SELECT rmb.batch_number, rm.name, pm.quantity_used
FROM sales_invoices si
JOIN invoice_items ii ON ii.invoice_id = si.id
JOIN product_skus ps ON ps.id = ii.sku_id
JOIN production_output po ON po.sku_id = ps.id
JOIN production_runs pr ON pr.id = po.production_run_id
JOIN production_materials pm ON pm.production_run_id = pr.id
JOIN raw_material_batches rmb ON rmb.id = pm.batch_id
JOIN raw_materials rm ON rm.id = rmb.material_id
WHERE si.invoice_number = 'INV-2026-001';
```

### 6.4 Stock Movement Tracking

#### Raw Material Stock:

```
Increase:
├─ Purchase Order Receipt (+)
└─ Stock Adjustment (+)

Decrease:
├─ Production Run Completion (-)
├─ Supplier Return (-)
└─ Stock Adjustment (-)

Query:
SELECT
    material_id,
    SUM(CASE WHEN type = 'receipt' THEN quantity ELSE 0 END) as total_received,
    SUM(quantity_used) as total_used,
    current_quantity
FROM raw_material_batches
WHERE material_id = ?
```

#### Finished Goods Stock:

```
Increase:
├─ Production Run Output (+)
└─ Customer Return (+)

Decrease:
├─ Sales Invoice (-)
└─ Stock Adjustment (-)

Query:
SELECT
    sku_id,
    SUM(quantity_produced) as total_produced,
    SUM(quantity_sold) as total_sold,
    current_stock
FROM product_skus
WHERE sku_id = ?
```

---

## 7. Database Schema Details

### 7.1 Key Tables Summary

| Table                    | Purpose                | Key Fields                                           |
| ------------------------ | ---------------------- | ---------------------------------------------------- |
| **products**             | Product master         | id, code, name, category, status                     |
| **product_skus**         | Product variants       | id, product_id, size, price, current_stock           |
| **recipes**              | Production formulas    | id, code, version, expected_yield, is_active         |
| **recipe_items**         | Bill of materials      | id, recipe_id, material_id, quantity                 |
| **production_runs**      | Production jobs        | id, recipe_id, production_date, batch_number, status |
| **production_materials** | Raw materials used     | id, production_run_id, batch_id, quantity_used       |
| **production_output**    | Finished goods made    | id, production_run_id, sku_id, quantity_produced     |
| **raw_materials**        | Raw material master    | id, code, name, unit, reorder_level                  |
| **raw_material_batches** | Raw material inventory | id, material_id, batch_number, current_quantity      |

### 7.2 Foreign Key Relationships

```
products (1) ──→ (M) product_skus
recipes (1) ──→ (M) recipe_items
recipes (1) ──→ (M) production_runs
production_runs (1) ──→ (M) production_materials
production_runs (1) ──→ (M) production_output
product_skus (1) ──→ (M) production_output
raw_materials (1) ──→ (M) raw_material_batches
raw_materials (1) ──→ (M) recipe_items
raw_material_batches (1) ──→ (M) production_materials
users (1) ──→ (M) production_runs
```

### 7.3 Indexes for Performance

**Critical Indexes:**

- `products.code` (UNIQUE) - Fast product lookup
- `product_skus.barcode` - Barcode scanning
- `product_skus(product_id, size)` (UNIQUE) - Prevent duplicate SKUs
- `recipes(code, version)` (UNIQUE) - Recipe version control
- `recipes.is_active` - Find active recipes quickly
- `recipe_items.recipe_id` - Join performance
- `production_runs.batch_number` - Traceability queries
- `production_runs.production_date` - Date range reports
- `production_materials.production_run_id` - Material tracking
- `raw_material_batches.batch_number` (UNIQUE) - Batch lookup
- `raw_material_batches.material_id` - Stock queries

### 7.4 Cascade Delete Rules

**ON DELETE CASCADE:**

- Delete recipe → Delete all recipe_items
- Delete production_run → Delete all production_materials and production_output

**ON DELETE RESTRICT (Implicit):**

- Cannot delete product if SKUs exist
- Cannot delete SKU if stock > 0
- Cannot delete raw material if used in recipes
- Cannot delete recipe if used in production runs

---

## 8. API Endpoints & Operations

### 8.1 Product APIs

```
BASE: /api/products

GET    /                           # List products (paginated)
       ?page=1&limit=10&search=curry&status=active
       Response: { data: [...], total, page, totalPages }

GET    /:id                        # Get product with SKUs
       Response: { id, code, name, skus: [...] }

POST   /                           # Create product
       Body: { name, category, description, status }
       Response: { id, code: "PROD001", ... }

PUT    /:id                        # Update product
       Body: { name, category, description, status }
       Response: { id, code, name, ... }

DELETE /:id                        # Delete product (if no SKUs)
       Response: { message: "Product deleted" }

POST   /:id/skus                   # Add SKU to product
       Body: { size, unit, barcode, price, status }
       Response: { id, product_id, size, price, ... }

PUT    /:productId/skus/:skuId     # Update SKU
       Body: { size, unit, barcode, price, status }
       Response: { id, size, price, ... }

DELETE /:productId/skus/:skuId     # Delete SKU (if stock = 0)
       Response: { message: "SKU deleted" }

GET    /:id/stock                  # Get stock summary
       Response: { product_id, skus: [...], total_stock }
```

### 8.2 Recipe APIs

```
BASE: /api/recipes

GET    /                           # List recipes
       ?page=1&limit=10&search=curry&is_active=true
       Response: { data: [...], total, page }

GET    /:id                        # Get recipe with items
       Response: {
           id, code, name, version, expected_yield,
           items: [{ material_id, quantity, unit, material: {...} }],
           total_cost, cost_per_unit
       }

POST   /                           # Create recipe (version 1)
       Body: {
           code, name, expected_yield, yield_unit, notes,
           items: [{ material_id, quantity, unit }, ...]
       }
       Response: { id, code, version: 1, ... }

PUT    /:id                        # Update (creates new version)
       Body: { name, expected_yield, yield_unit, notes, items: [...] }
       Response: { id, code, version: N+1, ... }

DELETE /:id                        # Delete recipe
       Response: { message: "Recipe deleted" }

GET    /:id/versions               # Get all versions
       Response: [
           { id, code, version: 1, is_active: false, ... },
           { id, code, version: 2, is_active: true, ... }
       ]

POST   /:id/items                  # Add item to recipe
       Body: { material_id, quantity, unit }
       Response: { id, recipe_id, material_id, ... }

PUT    /:recipeId/items/:itemId    # Update recipe item
       Body: { quantity, unit }
       Response: { id, quantity, unit, ... }

DELETE /:recipeId/items/:itemId    # Delete recipe item
       Response: { message: "Item deleted" }
```

### 8.3 Production APIs

```
BASE: /api/production-runs

GET    /                           # List production runs
       ?page=1&limit=10&status=completed&product_id=1
       &date_from=2026-01-01&date_to=2026-01-31
       Response: { data: [...], total, page }

GET    /:id                        # Get production run details
       Response: {
           id, recipe_id, production_date, batch_number, status,
           expected_quantity, actual_quantity, waste_quantity,
           yield_efficiency,
           recipe: { id, name, version, expected_yield, yield_unit, ... },
           materials: [
               { id, batch_id, quantity_used,
                 batch: { batch_number, unit_cost, material: {...} } }
           ],
           outputs: [
               { id, sku_id, quantity_produced, batch_number,
                 unit_cost, total_cost, waste_cost,
                 sku: { size, unit, product: {...} } }
           ]
       }

POST   /                           # Create production run
       Body: {
           recipe_id, production_date, batch_number,
           expected_quantity, produced_by, notes, status
       }
       Validation:
       - recipe_id: required, must exist
       - expected_quantity: required, must be > 0
       - produced_by: required (user ID)
       - status: defaults to 'planned'
       Response: { id, recipe_id, batch_number, status: 'planned', ... }

PUT    /:id                        # Update run (only if status='planned')
       Body: { production_date, expected_quantity, notes, status }
       Restrictions:
       - Cannot update if status = 'in_progress' or 'completed'
       - expected_quantity must be > 0
       Response: { id, ... }

DELETE /:id                        # Delete run (only if status='planned')
       Restrictions:
       - Cannot delete if status = 'completed'
       Response: { message: "Production run deleted" }

POST   /:id/start                  # START PRODUCTION (FIFO Material Deduction)
       Body: {} (no body needed)
       Process:
       1. Validate status = 'planned'
       2. Calculate scale_factor = expected_quantity / recipe.expected_yield
       3. For each recipe item:
          - Calculate required = item.quantity × scale_factor
          - Fetch available batches (FIFO: ORDER BY created_at ASC)
          - WHERE quantity > 0 AND batch_type = 'receipt'
          - Deduct quantities using FIFO
          - Record in production_materials
          - Update raw_material_batches.quantity
       4. If insufficient stock → ROLLBACK, return error
       5. Update status to 'in_progress'
       Response: {
           id, status: 'in_progress',
           materials: [{ batch_id, quantity_used, batch: {...} }],
           ...
       }
       Errors:
       - 400: "Production run must be in planned status to start"
       - 400: "Expected quantity is required to start production"
       - 400: "Insufficient stock for {material}. Required: X, Available: Y"

POST   /:id/complete               # COMPLETE PRODUCTION (Record Output)
       Body: {
           quantity_produced,      # Required, > 0
           waste_quantity,         # Optional, >= 0
           waste_reason,           # Required if waste_quantity > 0
           production_date,        # Optional, defaults to run's date
           notes,                  # Optional
           outputs: [{ sku_id, quantity_produced }]  # Optional, defaults to recipe SKU
       }
       Process:
       1. Validate status = 'in_progress'
       2. Read material costs from production_materials table
       3. Calculate costs (total, base_unit_cost, waste_cost)
       4. Generate finished goods batch number
       5. Update product_skus inventory (weighted average)
       6. Create production_output record
       7. Calculate yield_efficiency = (actual / expected) × 100
       8. Update status to 'completed'
       Response: {
           id, status: 'completed',
           actual_quantity, waste_quantity, yield_efficiency,
           outputs: [{ batch_number, unit_cost, total_cost, ... }],
           ...
       }
       Errors:
       - 400: "Production run must be in progress to complete"
       - 400: "Valid quantity produced is required"
       - 400: "Please provide waste reason when waste quantity > 0"

GET    /:id/check-materials        # Check if can produce (DEPRECATED - use START)
       Note: Material check now happens automatically during START
       Response: {
           production_run_id, expected_quantity, can_produce,
           materials: [
               {
                   raw_material_id, raw_material_name,
                   required_quantity, available_quantity,
                   is_sufficient, shortage,
                   batches: [{ batch_number, available, expiry_date }]
               }
           ]
       }
```

---

## 9. Frontend Implementation

### 9.1 State Management Architecture (Pinia)

Each domain has its own store following a consistent pattern:

```javascript
// Store Structure Pattern
export const useXxxStore = defineStore('xxx', () => {
  // State
  const items = ref([])
  const currentItem = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({ page, limit, total, totalPages })
  const filters = ref({ search, status, ... })

  // Getters (computed)
  const activeItems = computed(() => items.value.filter(...))

  // Actions
  const fetchItems = async () => { ... }
  const fetchItemById = async (id) => { ... }
  const createItem = async (data) => { ... }
  const updateItem = async (id, data) => { ... }
  const deleteItem = async (id) => { ... }

  return { items, currentItem, loading, error, ... }
})
```

**Stores:**

- `product.js` - Product & SKU management
- `recipe.js` - Recipe & versioning
- `production.js` - Production runs
- `rawMaterial.js` - Raw materials & batches

### 9.2 Component Architecture

**Page Components (Views):**

```
views/
├── products/
│   ├── ProductIndex.vue        # List page
│   ├── ProductCreate.vue       # Create page (uses ProductForm)
│   ├── ProductEdit.vue         # Edit page (uses ProductForm)
│   └── ProductView.vue         # Detail page
├── recipes/
│   ├── RecipeIndex.vue
│   ├── RecipeCreate.vue
│   ├── RecipeEdit.vue
│   └── RecipeView.vue
└── production/
    ├── ProductionIndex.vue
    ├── ProductionCreate.vue
    ├── ProductionEdit.vue
    └── ProductionView.vue
```

**Reusable Components:**

```
components/
├── common/
│   ├── AppDataTable.vue        # Reusable table
│   ├── AppDialog.vue           # Modal dialogs
│   ├── PageHeader.vue          # Page title/breadcrumb
│   └── ConfirmDialog.vue       # Confirmation prompts
├── products/
│   └── ProductForm.vue         # Product CRUD form
├── recipes/
│   └── RecipeForm.vue          # Recipe CRUD form (with BOM)
└── production/
    └── ProductionRunForm.vue   # Production form
```

### 9.3 Form Handling Pattern

All forms follow a consistent pattern:

```vue
<template>
  <Card>
    <template #title>Title</template>
    <template #content>
      <form @submit.prevent="handleSubmit">
        <!-- Form fields -->
        <Button type="submit" :loading="loading" />
        <Button type="button" @click="handleCancel" />
      </form>
    </template>
  </Card>
</template>

<script setup>
const formData = ref({ ... })
const errors = ref({})
const loading = ref(false)

const handleSubmit = async () => {
  errors.value = {}
  // Validate
  // Call store action
  // Navigate on success
}

const handleCancel = () => {
  router.push('/list-page')
}
</script>
```

### 9.4 Data Fetching Pattern

```javascript
// In component onMounted
onMounted(async () => {
  await store.fetchItems(); // Load data
  if (props.id) {
    await loadItem(props.id); // Load specific item if editing
  }
});

// Computed properties for derived data
const totalCost = computed(() => {
  return items.value.reduce((sum, item) => sum + item.cost, 0);
});

// Watchers for reactive updates
watch(
  () => formData.value.recipe_id,
  async newId => {
    if (newId) {
      await loadRecipeDetails(newId);
    }
  }
);
```

---

## 10. Business Rules & Logic

### 10.1 Product Management Rules

1. **Product Code Generation:**
   - Pattern: PROD + 3-digit sequential number
   - Start: PROD001
   - Auto-increment based on last product ID

2. **SKU Uniqueness:**
   - (product_id, size) must be unique
   - Barcode must be globally unique
   - Example: Can't have two "100g" SKUs for same product

3. **Stock Initialization:**
   - New SKUs always start with stock = 0
   - Stock only increases via production or stock adjustment

4. **Deletion Constraints:**
   - Cannot delete product if SKUs exist
   - Cannot delete SKU if current_stock > 0
   - Use status = 'inactive' instead for soft delete

5. **Price Management:**
   - Price required for all SKUs
   - Price must be > 0
   - No historical price tracking (future enhancement)

### 10.2 Recipe Management Rules

1. **Versioning Logic:**
   - First version is always 1
   - Update creates new version (N+1)
   - Old version marked as inactive (is_active = false)
   - New version marked as active (is_active = true)
   - Only ONE active version per recipe code at a time

2. **Recipe Items (BOM):**
   - Minimum 1 item required
   - Each item must reference valid raw material
   - Quantities must be positive
   - Unit should match raw material unit (recommended)

3. **Active Version Enforcement:**

   ```sql
   -- Ensure only one active version per code
   UNIQUE constraint on (code, is_active) WHERE is_active = true
   ```

4. **Cost Calculation:**
   - Total cost = SUM(quantity × material.average_cost)
   - Cost per unit = total cost / expected_yield
   - Costs are estimates (actual costs from batches)

5. **Historical Preservation:**
   - Never delete old versions
   - Production runs reference specific version
   - Enables historical cost analysis

### 10.3 Production Management Rules

1. **FIFO Implementation:**
   - Always consume oldest batches first
   - Based on `created_at` timestamp
   - Skip expired batches (expiry_date < NOW())
   - Only use 'receipt' type batches (not returns)

2. **Scale Factor Logic:**

   ```
   scale_factor = quantity_to_produce / recipe.batch_size
   required_quantity = recipe_item.quantity × scale_factor
   ```

   - Allows flexible production quantities
   - All materials scaled proportionally

3. **Insufficient Stock Handling:**
   - Check all materials before starting
   - If ANY material insufficient → ROLLBACK entire transaction
   - Provide clear error message with shortage details

4. **Atomic Operations:**
   - All production completion operations in ONE transaction
   - Either ALL succeed or ALL rollback
   - Prevents partial inventory updates

5. **Status Workflow:**

   ```
   Created (planned)
       ↓
   Completed (materials consumed, goods produced)
       or
   Cancelled (no inventory changes)
   ```

6. **Batch Number Generation:**
   - Pattern: PROD-YYYYMMDD-NNN
   - Example: PROD-20260119-001
   - Must be unique across all production runs

7. **Update Restrictions:**
   - Can update: planned or in_progress runs
   - Cannot update: completed or cancelled runs
   - Cannot change recipe after completion

### 10.4 Inventory Update Rules

1. **Raw Material Batch Updates:**

   ```
   During Production:
   - batch.current_quantity -= quantity_used
   - If current_quantity = 0 → batch depleted (keep record)
   - Never delete batch records (traceability)
   ```

2. **Finished Goods Updates:**

   ```
   During Production:
   - sku.current_stock += quantity_produced

   During Sales:
   - sku.current_stock -= quantity_sold
   ```

3. **Batch Tracking:**
   - Every raw material receipt creates new batch
   - Every production run creates new finished goods batch
   - Batch numbers never reused

4. **Stock Adjustments:**
   - Manual adjustments for damage, theft, corrections
   - Require reason and approval (optional)
   - Logged with user and timestamp

### 10.5 Data Validation Rules

1. **Required Fields:**
   - Products: name
   - SKUs: product_id, size, unit, price
   - Recipes: code, name, expected_yield, yield_unit
   - Recipe Items: recipe_id, material_id, quantity, unit
   - Production Runs: recipe_id, production_date, batch_number, produced_by

2. **Positive Values:**
   - All quantities > 0
   - All prices > 0
   - expected_yield > 0

3. **Status Values:**
   - Products/SKUs: 'active' | 'inactive'
   - Recipes: is_active boolean
   - Production Runs: 'completed' | 'cancelled'

4. **Foreign Key Validation:**
   - All referenced IDs must exist
   - Checked before save
   - Proper error messages

---

## 11. Traceability & Batch Management

### 11.1 Batch Number Schemes

**Raw Material Batches:**

```
Format: RM-{MATERIAL_CODE}-{YYYYMMDD}-{SEQUENCE}
Example: RM-TUR001-20260119-001
         RM-TUR001-20260119-002
```

**Production Batches:**

```
Format: PROD-{YYYYMMDD}-{SEQUENCE}
Example: PROD-20260119-001
         PROD-20260119-002
```

### 11.2 Traceability Scenarios

#### Scenario 1: Food Safety Recall

**Problem:** Quality issue detected in products sold in January 2026

**Forward Trace (Batch → Customers):**

```sql
-- Find all customers who received products from batch PROD-20260119-001
SELECT DISTINCT
    o.name AS outlet,
    o.phone,
    si.invoice_number,
    si.invoice_date,
    ii.quantity
FROM production_runs pr
JOIN production_output po ON po.production_run_id = pr.id
JOIN product_skus ps ON ps.id = po.sku_id
JOIN invoice_items ii ON ii.sku_id = ps.id
JOIN sales_invoices si ON si.id = ii.invoice_id
JOIN outlets o ON o.id = si.outlet_id
WHERE pr.batch_number = 'PROD-20260119-001'
ORDER BY si.invoice_date;
```

#### Scenario 2: Raw Material Quality Issue

**Problem:** Supplier notified contamination in specific raw material batch

**Backward Trace (Raw Batch → Finished Products):**

```sql
-- Find all finished products that used batch RM-TUR001-20260119-001
SELECT DISTINCT
    p.name AS product,
    ps.size,
    pr.batch_number AS production_batch,
    pr.production_date,
    po.quantity_produced
FROM raw_material_batches rmb
JOIN production_materials pm ON pm.batch_id = rmb.id
JOIN production_runs pr ON pr.id = pm.production_run_id
JOIN production_output po ON po.production_run_id = pr.id
JOIN product_skus ps ON ps.id = po.sku_id
JOIN products p ON p.id = ps.product_id
WHERE rmb.batch_number = 'RM-TUR001-20260119-001';
```

#### Scenario 3: Recipe Change Impact

**Problem:** Need to identify products made with old recipe formulation

```sql
-- Find production runs using specific recipe version
SELECT
    pr.batch_number,
    pr.production_date,
    p.name AS product,
    r.name AS recipe,
    r.version
FROM production_runs pr
JOIN recipes r ON r.id = pr.recipe_id
JOIN production_output po ON po.production_run_id = pr.id
JOIN product_skus ps ON ps.id = po.sku_id
JOIN products p ON p.id = ps.product_id
WHERE r.code = 'RECIPE001' AND r.version = 1
ORDER BY pr.production_date;
```

### 11.3 Batch Genealogy

**Complete Lineage Tracking:**

```
Supplier → Purchase Order → Raw Material Batch
                                    ↓
                         Recipe + Production Run
                                    ↓
                         Finished Goods Batch
                                    ↓
                            Sales Invoice
                                    ↓
                          Customer Outlet
```

**Genealogy Query Example:**

```sql
-- Complete lineage from raw material to customer
SELECT
    s.name AS supplier,
    rmb.batch_number AS raw_batch,
    rm.name AS raw_material,
    pm.quantity_used,
    pr.batch_number AS production_batch,
    r.name AS recipe,
    r.version AS recipe_version,
    p.name AS product,
    ps.size,
    po.quantity_produced,
    si.invoice_number,
    o.name AS customer
FROM raw_material_batches rmb
JOIN suppliers s ON s.id = rmb.supplier_id
JOIN raw_materials rm ON rm.id = rmb.material_id
JOIN production_materials pm ON pm.batch_id = rmb.id
JOIN production_runs pr ON pr.id = pm.production_run_id
JOIN recipes r ON r.id = pr.recipe_id
JOIN production_output po ON po.production_run_id = pr.id
JOIN product_skus ps ON ps.id = po.sku_id
JOIN products p ON p.id = ps.product_id
LEFT JOIN invoice_items ii ON ii.sku_id = ps.id
LEFT JOIN sales_invoices si ON si.id = ii.invoice_id
LEFT JOIN outlets o ON o.id = si.outlet_id
WHERE rmb.batch_number = 'RM-TUR001-20260119-001'
ORDER BY pr.production_date, si.invoice_date;
```

### 11.4 Reporting Capabilities

**Production Report:**

- Total production by product
- Material consumption by recipe
- Production efficiency (actual vs expected yield)
- Cost per unit analysis

**Inventory Report:**

- Current stock by SKU
- Batch aging (raw materials and finished goods)
- Expiry tracking
- FIFO compliance audit

**Traceability Report:**

- Batch history (forward and backward)
- Material usage by production run
- Customer delivery tracking
- Quality issue investigation

---

## 12. Complete Workflow Diagram

### 12.1 End-to-End Manufacturing Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     HASAL PRODUCTS WORKFLOW                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 1: PRODUCT SETUP (One-time Configuration)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1.1 Create Product                                          │
│      Admin → Products → Create                               │
│      Input: Name, Category, Description                      │
│      Output: Product with auto-code (PROD001)                │
│                                                              │
│  1.2 Add Product SKUs                                        │
│      Product Details → Add SKU                               │
│      Input: Size (100g, 500g, 1kg), Price                    │
│      Output: SKU with barcode, initial stock = 0             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: RECIPE CREATION (Formulation)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  2.1 Create Recipe                                           │
│      Admin → Recipes → Create                                │
│      Input:                                                  │
│        - Recipe Code (RECIPE001)                             │
│        - Recipe Name ("Curry Powder Mix")                    │
│        - Expected Yield (10 kg)                              │
│        - Bill of Materials:                                  │
│          * Turmeric Powder: 3 kg                             │
│          * Coriander Powder: 4 kg                            │
│          * Cumin Powder: 2 kg                                │
│          * Chili Powder: 0.5 kg                              │
│          * Fenugreek: 0.5 kg                                 │
│      Output: Recipe v1 (Active)                              │
│                                                              │
│  2.2 Update Recipe (Future)                                  │
│      Recipe Details → Edit                                   │
│      Process:                                                │
│        - Mark v1 as Inactive                                 │
│        - Create v2 (Active)                                  │
│        - Update BOM items                                    │
│      Output: Recipe v2 (Active), v1 (Archived)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: RAW MATERIAL PROCUREMENT                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  3.1 Create Purchase Order                                   │
│      Cashier → Purchase Orders → Create                      │
│      Input: Supplier, Items, Quantities                      │
│      Output: PO (Status: Pending)                            │
│                                                              │
│  3.2 Receive Purchase Order                                  │
│      PO Details → Receive                                    │
│      Process:                                                │
│        - Record received quantities                          │
│        - System creates batches:                             │
│          * Batch: RM-TUR001-20260119-001 (100 kg)            │
│          * Batch: RM-COR001-20260119-001 (80 kg)             │
│          * etc.                                              │
│        - Update PO status to Received                        │
│      Output: Raw Material Batches Created                    │
│                                                              │
│  Database State:                                             │
│  raw_material_batches:                                       │
│    - RM-TUR001-20260119-001: 100 kg (current: 100)           │
│    - RM-COR001-20260119-001: 80 kg (current: 80)             │
│    - RM-CUM001-20260119-001: 50 kg (current: 50)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: PRODUCTION PLANNING                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  4.1 Create Production Run                                   │
│      Admin/Cashier → Production → Create                     │
│      Input:                                                  │
│        - Recipe: Curry Powder Mix v1                         │
│        - Quantity to Produce: 50 kg                          │
│        - Production Date: 2026-01-19                         │
│      System Calculations:                                    │
│        - Batch Size: 10 kg (from recipe)                     │
│        - Scale Factor: 50 / 10 = 5                           │
│        - Required Materials (scaled):                        │
│          * Turmeric: 3 × 5 = 15 kg                           │
│          * Coriander: 4 × 5 = 20 kg                          │
│          * Cumin: 2 × 5 = 10 kg                              │
│          * Chili: 0.5 × 5 = 2.5 kg                           │
│          * Fenugreek: 0.5 × 5 = 2.5 kg                       │
│      Output: Production Run (Status: Planned)                │
│                                                              │
│  4.2 Check Material Availability (Optional)                  │
│      GET /api/production-runs/:id/check-materials            │
│      Response:                                               │
│        can_produce: true                                     │
│        materials:                                            │
│          - Turmeric: required 15kg, available 100kg ✓        │
│          - Coriander: required 20kg, available 80kg ✓        │
│          - Cumin: required 10kg, available 50kg ✓            │
│          - All sufficient                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: PRODUCTION EXECUTION (CRITICAL)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  5.1 Complete Production Run                                 │
│      Production Run Details → Complete                       │
│      POST /api/production-runs/:id/complete                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TRANSACTION START                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  5.2 Fetch Recipe & Items                                    │
│      Recipe: Curry Powder Mix v1                             │
│      Items: 5 raw materials                                  │
│                                                              │
│  5.3 Calculate Requirements (Scale Factor = 5)               │
│      For Each Recipe Item × 5:                               │
│        - Turmeric: 15 kg                                     │
│        - Coriander: 20 kg                                    │
│        - Cumin: 10 kg                                        │
│        - Chili: 2.5 kg                                       │
│        - Fenugreek: 2.5 kg                                   │
│                                                              │
│  5.4 FIFO Batch Consumption                                  │
│                                                              │
│      ┌────────────────────────────────────────────┐          │
│      │  Material: Turmeric (need 15 kg)          │          │
│      ├────────────────────────────────────────────┤          │
│      │  Available Batches (FIFO sorted):         │          │
│      │    1. RM-TUR001-20260110-001: 8 kg ───┐   │          │
│      │    2. RM-TUR001-20260119-001: 100 kg   │   │          │
│      │                                         │   │          │
│      │  Consumption:                           │   │          │
│      │    Take 8 kg from Batch 1 ──────────────┘   │          │
│      │      → Batch 1: 8 → 0 kg (depleted)         │          │
│      │      → remaining need: 7 kg                 │          │
│      │    Take 7 kg from Batch 2                   │          │
│      │      → Batch 2: 100 → 93 kg                 │          │
│      │      → remaining need: 0 kg ✓               │          │
│      │                                             │          │
│      │  Records Created:                           │          │
│      │    production_materials:                    │          │
│      │      - run_id=1, batch_id=B1, used=8kg     │          │
│      │      - run_id=1, batch_id=B2, used=7kg     │          │
│      └────────────────────────────────────────────┘          │
│                                                              │
│      Repeat FIFO for all materials...                        │
│                                                              │
│  5.5 Update Raw Material Batches                             │
│      raw_material_batches updates:                           │
│        - RM-TUR001-20260110-001: 8 → 0 kg                    │
│        - RM-TUR001-20260119-001: 100 → 93 kg                 │
│        - RM-COR001-20260119-001: 80 → 60 kg                  │
│        - RM-CUM001-20260119-001: 50 → 40 kg                  │
│        - (etc for all materials)                             │
│                                                              │
│  5.6 Create Finished Goods                                   │
│      Input: outputs = [{ sku_id: 5, quantity_produced: 50 }] │
│      Process:                                                │
│        - Find SKU: Curry Powder 1kg package                  │
│        - Create production_output record                     │
│        - Update product_skus:                                │
│          current_stock: 0 → 50 units                         │
│                                                              │
│  5.7 Update Production Run                                   │
│      production_runs:                                        │
│        - status: 'planned' → 'completed'                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  TRANSACTION COMMIT                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Output: ✅ Production Completed Successfully                │
│          - 50 kg produced                                    │
│          - 50 units of 1kg SKU added to inventory            │
│          - Raw materials consumed (FIFO)                     │
│          - Full traceability recorded                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: SALES & DELIVERY                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  6.1 Create Sales Invoice                                    │
│      Cashier → Sales → Create Invoice                        │
│      Input:                                                  │
│        - Outlet: ABC Store                                   │
│        - Items: Curry Powder 1kg × 10 units                  │
│        - Price: Rs. 1,300 each                               │
│      Process:                                                │
│        - Create sales_invoices record                        │
│        - Create invoice_items records                        │
│        - Update product_skus:                                │
│          current_stock: 50 → 40 units                        │
│      Output: Invoice INV-2026-001                            │
│                                                              │
│  6.2 Delivery                                                │
│      Warehouse prepares items                                │
│      Sales ref/driver delivers to outlet                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: TRACEABILITY                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Forward Trace (Raw Material → Customer):                    │
│    Batch RM-TUR001-20260119-001                              │
│      ↓ used in                                               │
│    Production Run PROD-20260119-001                          │
│      ↓ produced                                              │
│    Product SKU: Curry Powder 1kg                             │
│      ↓ sold in                                               │
│    Invoice INV-2026-001                                      │
│      ↓ delivered to                                          │
│    Customer: ABC Store                                       │
│                                                              │
│  Backward Trace (Customer → Raw Material):                   │
│    Invoice INV-2026-001                                      │
│      ↓ contained                                             │
│    Product SKU: Curry Powder 1kg                             │
│      ↓ produced by                                           │
│    Production Run PROD-20260119-001 (Recipe v1)              │
│      ↓ consumed                                              │
│    Raw Material Batches:                                     │
│      - RM-TUR001-20260119-001 (7 kg)                         │
│      - RM-TUR001-20260110-001 (8 kg)                         │
│      - RM-COR001-20260119-001 (20 kg)                        │
│      - etc.                                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Summary of Key Processes

| Process                  | Key Operations              | Critical Logic                                 | Outcome                            |
| ------------------------ | --------------------------- | ---------------------------------------------- | ---------------------------------- |
| **Product Setup**        | Create product & SKUs       | Auto-code generation, unique constraints       | Product catalog ready              |
| **Recipe Creation**      | Define BOM, set yield       | Versioning on update                           | Formulation documented             |
| **Raw Material Receipt** | PO receipt, batch creation  | Auto batch numbering                           | Inventory available                |
| **Production Planning**  | Select recipe, set quantity | Scale factor calculation                       | Run planned                        |
| **Production Execution** | Complete production run     | **FIFO batch consumption**, atomic transaction | Goods produced, materials consumed |
| **Sales**                | Create invoice              | Stock deduction                                | Products delivered                 |
| **Traceability**         | Query batch lineage         | Join across multiple tables                    | Full transparency                  |

---

## 13. Conclusion

### 13.1 System Strengths

1. **Complete Traceability:**
   - Track every raw material batch from supplier to customer
   - Trace finished products back to source materials
   - Critical for food safety and quality compliance

2. **Recipe Versioning:**
   - Maintain historical formulations
   - Support recipe evolution without losing history
   - Enable cost comparison across versions

3. **FIFO Inventory Management:**
   - Automatic oldest-first consumption
   - Reduces expiry waste
   - Industry-standard practice

4. **Atomic Operations:**
   - All-or-nothing production completion
   - Prevents partial inventory corruption
   - Ensures data integrity

5. **Multi-SKU Support:**
   - Flexible packaging options
   - Different prices per size
   - Individual stock tracking

6. **Scalable Production:**
   - Produce any quantity (not limited to recipe batch size)
   - Automatic material scaling
   - Flexible manufacturing

### 13.2 Key Integrations

```
Product ←→ Recipe ←→ Production ←→ Inventory ←→ Sales

All connected with full traceability
```

### 13.3 Business Impact

- **Quality Control:** Quick identification of affected batches in recalls
- **Cost Management:** Accurate recipe costing and production costs
- **Inventory Optimization:** FIFO ensures material rotation
- **Compliance:** Audit trail for food safety regulations
- **Planning:** Material availability checks before production
- **Reporting:** Comprehensive production and inventory reports

---

## Appendix A: Quick Reference

### Common Operations

**Create Product with SKUs:**

```
1. POST /api/products { name, category }
2. POST /api/products/:id/skus { size, price } (repeat for each size)
```

**Create Recipe:**

```
1. POST /api/recipes {
     code, name, expected_yield, yield_unit,
     items: [{ material_id, quantity, unit }, ...]
   }
```

**Execute Production:**

```
1. POST /api/production-runs { recipe_id, production_date, batch_number }
2. POST /api/production-runs/:id/complete {
     quantity_produced,
     outputs: [{ sku_id, quantity_produced }]
   }
```

### Database Quick Queries

**Current Stock by Product:**

```sql
SELECT p.name, ps.size, ps.current_stock
FROM products p
JOIN product_skus ps ON ps.product_id = p.id
WHERE p.status = 'active'
ORDER BY p.name, ps.size;
```

**Active Recipes:**

```sql
SELECT code, name, version, expected_yield
FROM recipes
WHERE is_active = true
ORDER BY code;
```

**Production Summary:**

```sql
SELECT
    pr.production_date,
    r.name AS recipe,
    p.name AS product,
    SUM(po.quantity_produced) AS total_produced
FROM production_runs pr
JOIN recipes r ON r.id = pr.recipe_id
JOIN production_output po ON po.production_run_id = pr.id
JOIN product_skus ps ON ps.id = po.sku_id
JOIN products p ON p.id = ps.product_id
WHERE pr.status = 'completed'
GROUP BY pr.production_date, r.name, p.name;
```

---

**End of Report**

This comprehensive report provides a complete understanding of how products, recipes, and production workflows interconnect in the Hasal Products POS & Inventory Management System.
