# Week 5 Testing Guide

## Overview

This document outlines the testing procedures for Week 5 implementation, covering Product Management, Recipe Management with BOM (Bill of Materials), Production Management with FIFO batch consumption, Profit Analysis, and comprehensive Waste & Efficiency Reporting.

**Date:** January 22, 2026  
**Modules:** Products, Recipes, Production, Profit Analysis, Waste & Efficiency Reporting

## Recent Changes Integrated

This testing guide now includes manual testing procedures for:

- ✅ Recipe-SKU Validation (SKU is now REQUIRED for recipes)
- ✅ FIFO Cost Tracking with batch consumption
- ✅ Waste Allocation & Tracking with cost formulas
- ✅ Batch Number Generation (automatic formats)
- ✅ Profit Analysis Endpoints
- ✅ Waste & Efficiency Reporting
- ✅ Complete E2E Integration Workflows

---

## Prerequisites

### Required Data

Before testing Week 5 modules, ensure you have:

- ✅ Active suppliers (from Week 1)
- ✅ Raw materials with batches (from Week 2)
- ✅ Completed purchase orders with received items (from Week 3)
- ✅ Raw material batches with stock available

### System Requirements

- Backend server running on `http://localhost:3000`
- Frontend dev server running on `http://localhost:5173`
- MySQL database with all migrations applied
- Valid JWT token (logged in user)

---

## Module 1: Product Management

### Test 1.1: Create Product with Auto-Generated Code

**Objective:** Verify product creation with automatic code generation

**Steps:**

1. Navigate to Products page (`/products`)
2. Click "New Product" button
3. Fill in product details:
   - Name: "Roasted Curry Powder"
   - Category: "Spices"
   - Status: "Active"
   - Description: "Premium roasted curry powder"
4. Click "Create Product"

**Expected Results:**

- ✅ Product created successfully with auto-generated code (e.g., PROD-001)
- ✅ Success toast notification displayed
- ✅ Redirected to products list
- ✅ New product appears in the list

**Database Validation:**

```sql
SELECT * FROM products WHERE name = 'Roasted Curry Powder';
-- Verify product_code is auto-generated
```

---

### Test 1.2: Add SKUs to Product

**Objective:** Verify SKU management for a product

**Steps:**

1. Navigate to Products list
2. Click "Edit" on the created product
3. In SKU Management section, click "Add SKU"
4. Fill in SKU details:
   - Size: "100"
   - Unit: "g"
   - Barcode: "1234567890123"
   - Price: 250.00
   - Status: "Active"
5. Click "Add"
6. Repeat for another SKU:
   - Size: "250"
   - Unit: "g"
   - Barcode: "1234567890124"
   - Price: 550.00
   - Status: "Active"
7. Click "Update Product"

**Expected Results:**

- ✅ SKUs created successfully
- ✅ Both SKUs appear in the table with size and unit
- ✅ Initial stock is 0 for both SKUs
- ✅ Success notification displayed

**Database Validation:**

```sql
SELECT * FROM product_skus WHERE product_id = (
  SELECT id FROM products WHERE name = 'Roasted Curry Powder'
);
-- Should return 2 SKUs
```

---

### Test 1.3: Edit SKU Details

**Objective:** Verify SKU editing functionality

**Steps:**

1. In product edit page, click "Edit" icon on first SKU
2. Update price to 275.00
3. Update reorder level to 60
4. Click "Update"
5. Click "Update Product"

**Expected Results:**

- ✅ SKU updated successfully
- ✅ Changes reflected in the table
- ✅ Success notification displayed

---

### Test 1.4: Delete SKU (Validation)

**Objective:** Verify SKU cannot be deleted if it has stock

**Steps:**

1. Try to delete any SKU
2. Since stock is 0, deletion should succeed

**Expected Results:**

- ✅ SKU deleted successfully (no stock)
- ✅ SKU removed from table

**Note:** After production testing, SKUs with stock should show error: "Cannot delete SKU with existing stock"

---

### Test 1.5: View Product Details with Stock Summary

**Objective:** Verify product view page displays all information

**Steps:**

1. Navigate to Products list
2. Click "View" icon on the product
3. Verify all sections displayed:
   - Product Information
   - SKU Table
   - Stock Summary (when clicked)

**Expected Results:**

- ✅ All product details displayed correctly
- ✅ SKU table shows all sizes with units
- ✅ "View Stock" button opens dialog
- ✅ Stock summary shows: Total Stock: 0, Total SKUs: 1 (after deletion), Low Stock: 0
- ✅ Timestamps displayed correctly

---

### Test 1.6: Search and Filter Products

**Objective:** Verify search and filtering functionality

**Steps:**

1. Create 2-3 more products with different names and statuses
2. Test search: Enter "Curry" in search box
3. Test status filter: Select "Inactive"
4. Clear filters and verify all products shown

**Expected Results:**

- ✅ Search filters products by code and name
- ✅ Status filter works correctly
- ✅ Clear filters resets the list
- ✅ Pagination works if more than 10 products

---

## Module 2: Recipe Management

### Test 2.1: Create Recipe with BOM and Required SKU

**Objective:** Verify recipe creation with Bill of Materials and SKU requirement validation

**Steps:**

1. Navigate to Recipes page (`/recipes`)
2. Click "New Recipe" button
3. Select Product: "Roasted Curry Powder"
4. **Attempt to proceed WITHOUT selecting SKU** (NEW VALIDATION)
5. Verify error message displayed
6. Now Select SKU: "100g Pack" (REQUIRED)
7. Enter Recipe Name: "Roasted Curry Powder Recipe"
8. Enter Batch Size: 10 (kg)
9. Select Unit: kg
10. Enter Description: "Premium blend recipe"
11. Click "Add Material" button
12. Add first material:
    - Raw Material: "Coriander Seeds"
    - Quantity: 5.00
    - Unit: kg
13. Click "Add"
14. Add second material:
    - Raw Material: "Cumin Seeds"
    - Quantity: 3.00
    - Unit: kg
15. Add third material:
    - Raw Material: "Chili Powder"
    - Quantity: 2.00
    - Unit: kg
16. Verify cost calculation displayed
17. Click "Create Recipe"

**Expected Results:**

- ❌ Error displayed when trying to proceed without SKU: "Product SKU is required"
- ✅ Recipe created successfully after SKU selected
- ✅ Recipe created with version 1
- ✅ All 3 materials added to BOM
- ✅ Total cost calculated correctly (sum of material costs)
- ✅ Cost per unit = Total Cost / Batch Size
- ✅ **SKU relationship stored** (product_sku_id in recipes table)
- ✅ Success notification displayed
- ✅ Redirected to recipes list

**Database Validation:**

```sql
SELECT r.*,
       p.name as product_name,
       ps.size, ps.unit,
       (SELECT COUNT(*) FROM recipe_items WHERE recipe_id = r.id) as item_count
FROM recipes r
JOIN products p ON p.id = r.product_id
JOIN product_skus ps ON ps.id = r.product_sku_id
WHERE r.name = 'Roasted Curry Powder Recipe';
-- Should show: version = 1, item_count = 3, product_sku_id NOT NULL
```

**API Validation (Optional):**

```bash
# GET recipe and verify SKU in response
GET /api/recipes/:id
# Response should include:
{
  "product_sku_id": <number>,
  "sku_details": {
    "size": "100",
    "unit": "g"
  }
}
```

---

### Test 2.2: View Recipe Details with SKU Information

**Objective:** Verify recipe view displays all information including SKU details

**Steps:**

1. Navigate to Recipes list
2. Click "View" icon on the created recipe
3. Review all sections:
   - Recipe Information
   - **SKU Information** (NEW)
   - Bill of Materials
   - Cost Summary

**Expected Results:**

- ✅ Recipe details displayed correctly
- ✅ Product name shown (e.g., "Roasted Curry Powder")
- ✅ **SKU details shown: size + unit (e.g., "100g Pack")**
- ✅ BOM table shows all 3 materials with quantities
- ✅ Total Recipe Cost calculated
- ✅ Cost per Unit displayed
- ✅ Version tag shows "v1"
- ✅ **Product-SKU relationship clearly visible**

---

### Test 2.3: Edit Recipe (Create New Version)

**Objective:** Verify recipe editing creates a new version

**Steps:**

1. From recipes list, click "Edit" on the recipe
2. Notice warning: "Edit creates new version"
3. Modify recipe:
   - Change batch size to 12 kg
   - Modify first material quantity to 6.00 kg
   - Add new material: "Black Pepper" - 1.00 kg
4. Click "Create New Version"

**Expected Results:**

- ✅ New version (v2) created
- ✅ Original recipe (v1) still exists in database
- ✅ New recipe has version = 2
- ✅ Both versions visible in recipes list
- ✅ Success notification: "Recipe updated successfully (new version created)"

**Database Validation:**

```sql
SELECT * FROM recipes
WHERE name = 'Roasted Curry Powder Recipe'
ORDER BY version;
-- Should return 2 records with version 1 and 2
```

---

### Test 2.4: View Version History

**Objective:** Verify version history dialog displays all versions

**Steps:**

1. Navigate to Recipes list
2. Click "Version History" button on the recipe
3. Verify dialog shows both versions
4. Click "View" on version 1
5. Verify redirected to v1 details

**Expected Results:**

- ✅ Version history dialog opens
- ✅ Table shows both v1 and v2
- ✅ Each version shows: version tag, name, batch size, status, created date
- ✅ View button navigates to correct version

---

### Test 2.5: Filter Recipes by Product and Verify SKU Display

**Objective:** Verify recipe filtering by status and product, with SKU visibility

**Steps:**

1. Create 2-3 more recipes for different products
2. Test search: Enter recipe name
3. Test status filter: Select "Active"
4. Test product filter: Select a specific product
5. **Verify recipes list shows SKU information** (NEW)
6. Clear all filters

**Expected Results:**

- ✅ Search filters by name and description
- ✅ Status filter works correctly
- ✅ Product filter shows only recipes for that product
- ✅ **Each recipe in list shows associated SKU (size + unit)**
- ✅ Filters can be combined
- ✅ Clear filters resets the list

**Additional Validation:**

Query product with recipes and verify SKU relationships:

```sql
SELECT p.name as product_name,
       ps.size, ps.unit,
       r.name as recipe_name,
       r.version
FROM products p
JOIN product_skus ps ON ps.product_id = p.id
JOIN recipes r ON r.product_sku_id = ps.id
WHERE p.id = <product_id>
ORDER BY r.version DESC;
```

---

### Test 2.6: Delete Recipe

**Objective:** Verify recipe deletion with confirmation

**Steps:**

1. Create a test recipe
2. Click "Delete" icon
3. Verify confirmation dialog appears
4. Click "Yes" to confirm
5. Verify recipe removed from list

**Expected Results:**

- ✅ Confirmation dialog shows recipe name
- ✅ Warning message about deleting all items
- ✅ Recipe and all items deleted from database
- ✅ Success notification displayed

---

## Module 3: Production Management

### Test 3.1: Create Production Run

**Objective:** Verify production run creation with material calculation

**Steps:**

1. Navigate to Production page (`/production-runs`)
2. Click "New Production Run" button
3. Select Production Date: Today's date
4. Select Recipe: "Roasted Curry Powder Recipe (v2)"
5. Enter Quantity: 24 kg
6. Verify Recipe Details section shows:
   - Product, SKU, Batch Size
   - Number of Batches: 2.00 (24 / 12)
   - Expected Output: 24 kg
7. Verify Required Materials table shows:
   - Each material with quantity per batch
   - Total required = quantity × 2 batches
8. Add Notes: "Test production run"
9. Click "Create Production Run"

**Expected Results:**

- ✅ Run number auto-generated (e.g., PRD-2025-001)
- ✅ Batch calculation correct (24 kg / 12 kg = 2 batches)
- ✅ Material requirements calculated correctly
- ✅ Status set to "Planned"
- ✅ Success notification displayed
- ✅ Redirected to production list

**Database Validation:**

```sql
SELECT * FROM production_runs
WHERE run_number LIKE 'PRD-2025-%';
-- Verify status = 'planned', quantity = 24
```

---

### Test 3.2: Check Material Availability

**Objective:** Verify material availability checking before production

**Steps:**

1. From production list, click "Check Materials" button (help icon)
2. Verify Material Availability dialog shows:
   - Production run details
   - Table with each material's required vs available quantities
   - Status tags (Sufficient/Insufficient)
   - Overall status message

**Expected Results:**

- ✅ Dialog displays all required materials
- ✅ Required quantities calculated correctly
- ✅ Available quantities from raw_material_batches
- ✅ Status tags show green for sufficient, red for insufficient
- ✅ Overall message: "✓ All materials available" or "✗ Insufficient materials"

**Database Validation:**

```sql
SELECT rm.name,
       SUM(rmb.quantity_remaining) as available
FROM raw_material_batches rmb
JOIN raw_materials rm ON rm.id = rmb.raw_material_id
WHERE rmb.quantity_remaining > 0
GROUP BY rm.id, rm.name;
-- Compare with required quantities
```

---

### Test 3.3: Edit Production Run (Planned Status)

**Objective:** Verify planned runs can be edited

**Steps:**with FIFO and Waste Tracking

**Objective:** Verify production completion with FIFO batch consumption, waste tracking, and cost calculations

**Prerequisites:**

- Ensure you have at least 2 batches of the same raw material with different costs and received dates
- Example: Batch 1 (older): 10kg @ LKR 1000/kg, Batch 2 (newer): 10kg @ LKR 1200/kg

**Steps:**

1. From production list, click "Complete" button (check icon)
2. In completion dialog, verify:
   - Run number and recipe displayed
   - Expected output shown
   - **Batch number auto-generated** (format: PROD-YYYYMMDD-NNN)
3. Enter completion details:
   - Actual Output: 35.5 kg
   - **Waste Quantity: 0.5 kg** (NEW: triggers waste tracking)
   - **Waste Reason: "Spillage during packaging"** (NEW)
   - Notes: "Minor waste during packaging"
4. Notice FIFO message
5. Click "Complete Production"

**Expected Results - Basic Completion:**

- ✅ Completion dialog opens correctly
- ✅ FIFO information message displayed
- ✅ **Production batch number auto-generated**: PROD-20260122-001 format
- ✅ Production run status changed to "Completed"
- ✅ Materials deducted using FIFO (oldest batches first)
- ✅ Production output batch created for product SKU
- ✅ Product SKU stock increased by 35.5 kg
- ✅ Success notification displayed

**Expected Results - FIFO Cost Tracking:**

- ✅ Materials consumed from oldest batch first (Batch 1 @ 1000/kg)
- ✅ If quantity exceeds oldest batch, remainder from next batch (Batch 2 @ 1200/kg)
- ✅ **Unit cost calculated**: total_material_cost / (actual_quantity + waste_quantity)
- ✅ **SKU average cost updated** based on weighted average
- ✅ Batch depletion tracked correctly (quantity_remaining updated)

**Expected Results - Waste Allocation (NEW):**

- ✅ Waste quantity recorded: 0.5 kg
- ✅ Waste reason stored: "Spillage during packaging"
- ✅ **Waste cost calculated**: (material_cost / (actual + waste)) × waste_qty
- ✅ **Yield efficiency calculated**: (actual_quantity / planned_quantity) × 100
- ✅ Waste cost separated from good product cost

**Database Validation:**

```sql
-- 1. Verify production_materials records created with FIFO
SELECT pm.*,
       rmb.batch_number,
       rmb.received_date,
       rmb.cost_per_unit,
       pm.quantity_used,
       (pm.quantity_used * rmb.cost_per_unit) as material_cost
FROM production_materials pm
JOIN raw_material_batches rmb ON rmb.id = pm.batch_id
WHERE pm.production_run_id = [run_id]
ORDER BY rmb.received_date ASC;
-- Verify: oldest batches consumed first

-- 2. Verify raw material batch quantities deducted
SELECT batch_number,
       received_date,
       initial_quantity,
       quantity_remaining,
       cost_per_unit
FROM raw_material_batches with Cost Analysis

**Objective:** Verify completed run shows all details including cost breakdown and waste analysis

**Steps:**

1. Click "View" icon on completed production run
2. Verify all sections displayed:
   - Production Information (status: Completed)
   - **Batch Numbers** (NEW: Production + FG batches)
   - Recipe Information
   - Materials Used (FIFO)
   - **Cost Analysis** (NEW)
   - **Waste Analysis** (NEW)
   - Production Output
   - Completion Details

**Expected Results - Basic Information:**

- ✅ Status tag shows "Completed" (green)
- ✅ **Production Batch Number**: PROD-YYYYMMDD-NNN format
- ✅ Run number, production date, quantity displayed

**Expected Results - Materials Used (FIFO):**

- ✅ Materials Used table shows:
  - Raw material names
  - Quantities used
  - **Batch numbers (oldest first due to FIFO)**
  - Unit costs
  - Total costs per material
- ✅ Total Material Cost calculated and displayed
- ✅ **FIFO order clearly visible** (oldest received_date first)

**Expected Results - Cost Analysis (NEW):**

Display the following calculated values:
- ✅ **Unit Cost**: total_material_cost / (actual_quantity + waste_quantity)
- ✅ **Good Product Cost**: unit_cost × actual_quantity
- ✅ **Waste Cost**: unit_cost × waste_quantity
- ✅ **SKU Average Cost**: Updated weighted average shown
- ✅ All costs accurate to ±0.01 LKR

**Expected Results - Waste Analysis (NEW):**

- ✅ **Yield Efficiency %**: (actual_quantity / planned_quantity) × 100
- ✅ **Waste Percentage**: (waste_quantity / planned_quantity) × 100
- ✅ **Waste Reason**: Displayed (e.g., "Spillage during packaging")
- ✅ **Waste Status Indicator**:
  - Green: 0% waste (Perfect!)
  - Yellow: <20% waste (Normal)
  - Red: ≥20% waste (High Waste Alert!)

**Expected Results - Production Output:**

- ✅ Production Output table shows:
  - **Finished Goods Batch number**: FG-{PRODUCT_CODE}-YYYYMMDD-NNN format
  - Quantity (35.5 kg)
  - Production date
  - Expiry date (calculated)
  - Product SKU details

**Expected Results - Completion Details:**

- ✅ Expected: 36 kg
- ✅ Actual: 35.5 kg
- ✅ **Waste: 0.5 kg (in red with icon)**
- ✅ **Yield Efficiency: 98.61%** (color-coded)
- ✅ Completed timestamp
- ✅ Completed by user name
- ✅ Notes displayed

**User-Focused Verification:**

Simply verify the following is displayed clearly:
1. ✅ Total material cost is visible
2. ✅ Unit cost per kg is shown
3. ✅ Waste cost is separated and highlighted
4. ✅ Efficiency percentage is prominent
5. ✅ Batch numbers are clearly labeled
6. ✅ All calculations look correct (no negative values, reasonable amounts)

**Technical Formula Verification (Optional):**

For technical users, manually calculate and verify:

```

Given:

- Planned: 36 kg
- Actual: 35.5 kg
- Waste: 0.5 kg
- Total Material Cost: LKR 36,000

Calculate:

1. Unit Cost = 36000 / (35.5 + 0.5) = LKR 1000/kg ✓
2. Waste Cost = 1000 × 0.5 = LKR 500 ✓
3. Good Product Cost = 1000 × 35.5 = LKR 35,500 ✓
4. Yield Efficiency = (35.5 / 36) × 100 = 98.61% ✓
5. Waste % = (0.5 / 36) × 100 = 1.39% ✓

Verify all values match displayed values (±0.01 tolerance)

```verage cost updated
SELECT ps.id,
       ps.current_stock,
       ps.average_cost,
       ps.last_cost_update
FROM product_skus ps
WHERE ps.id = (SELECT product_sku_id FROM recipes WHERE id = [recipe_id]);
-- Verify: average_cost updated with weighted average formula
```

**Formula Verification:**

Calculate manually and verify:

1. **Total Material Cost** = Sum of (quantity_used × cost_per_unit) for all materials
2. **Unit Cost** = total_material_cost / (actual_quantity + waste_quantity)
   - Example: 36000 / (35.5 + 0.5) = LKR 1000/kg
3. **Waste Cost** = unit_cost × waste_quantity
   - Example: 1000 × 0.5 = LKR 500
4. **Yield Efficiency** = (actual_quantity / planned_quantity) × 100
   - Example: (35.5 / 36) × 100 = 98.61%
5. **SKU Average Cost** = (old_stock × old_cost + new_stock × new_cost) / total_stock

**FIFO Validation:**

If requiring 12kg total and you have:

- Batch 1 (older): 10kg @ 1000/kg = 10,000
- Batch 2 (newer): 10kg @ 1200/kg (use 2kg) = 2,400
- **Total**: 10kg + 2kg = 12kg, Cost = 12,400
- **Verify**: Batch 1 fully consumed (0 remaining), Batch 2 has 8kg remainingRE pm.production_run_id = [run_id]
  ORDER BY rmb.received_date ASC;

-- Verify raw material batch quantities deducted
SELECT \* FROM raw_material_batches
WHERE raw_material_id IN (
SELECT raw_material_id FROM recipe_items WHERE recipe_id = [recipe_id]
)
ORDER BY received_date;

-- Verify production_outputs created
SELECT \* FROM production_outputs
WHERE production_run_id = [run_id];

-- Verify product SKU stock increased
SELECT current_stock FROM product_skus
WHERE id = (SELECT product_sku_id FROM recipes WHERE id = [recipe_id]);

````

---

### Test 3.5: View Completed Production Run

**Objective:** Verify completed run shows all details

**Steps:**

1. Click "View" icon on completed production run
2. Verify all sections displayed:
   - Production Information (status: Completed)
   - Recipe Information
   - Materials Used (FIFO)
   - Production Output
   - Completion Details

**Expected Results:**

- ✅ Status tag shows "Completed" (green)
- ✅ Materials Used table shows:
  - Raw material names
  - Quantities used
  - Batch numbers (oldest first due to FIFO)
  - Costs
- ✅ Total Material Cost calculated
- ✅ Production Output table shows:
  - Batch number generated for output
  - Quantity (35.5 kg)
  - Production date
  - Expiry date (calculated)
- ✅ Completion Details shows:
  - Expected: 36 kg
  - Actual: 35.5 kg
  - Waste: 0.5 kg (in red)
  - Completed timestamp
  - Completed by user name

---

### Test 3.6: Filter Production Runs

**Objective:** Verify production run filtering

**Steps:**

1. Create multiple production runs with different statuses and recipes
2. Test status filter: Select "Completed"
3. Test product filter: Select specific product
4. Test recipe filter: Select specific recipe
5. Test search: Enter run number
6. Clear all filters

**Expected Results:**

- ✅ Status filter shows only runs with that status
- ✅ Product filter works correctly
- ✅ Recipe filter works correctly
- ✅ Search filters by run number
- ✅ Filters can be combined
- ✅ Pagination works correctly

---

### Test 3.7: Batch Number Generation Validation

**Objective:** Verify automatic batch number generation follows correct formats

**Test 3.7a: Production Batch Number Format**

**Steps:**
1. Create and complete multiple production runs on the same day
2. View each completed production run
3. Note the production batch numbers

**Expected Results:**
- ✅ Format: **PROD-YYYYMMDD-NNN**
  - PROD = Prefix
  - YYYYMMDD = Production date (e.g., 20260122)
  - NNN = Sequential number (001, 002, 003...)
- ✅ Examples:
  - PROD-20260122-001 (first production today)
  - PROD-20260122-002 (second production today)
  - PROD-20260123-001 (first production next day - resets)
- ✅ Each batch number is unique
- ✅ Sequential increment works correctly
- ✅ Date changes reset counter to 001

**Database Validation:**
```sql
SELECT run_number, production_date, status, created_at
FROM production_runs
WHERE DATE(production_date) = CURDATE()
ORDER BY run_number;
-- Verify sequential numbering and format
````

**Test 3.7b: Finished Goods Batch Number Format**

**Steps:**

1. View completed production run details
2. Check Production Output section
3. Note the FG batch number

**Expected Results:**

- ✅ Format: **FG-{PRODUCT_CODE}-YYYYMMDD-NNN**
  - FG = Finished Goods prefix
  - {PRODUCT_CODE} = Product code (e.g., PROD-001)
  - YYYYMMDD = Production date
  - NNN = Sequential number
- ✅ Examples:
  - FG-PROD-001-20260122-001
  - FG-PROD-002-20260122-001
- ✅ Each FG batch number is unique
- ✅ Linked to production batch number
- ✅ Traceable back to raw material batches

**Database Validation:**

```sql
SELECT po.batch_number,
       pr.run_number as production_batch,
       po.quantity,
       po.production_date
FROM production_outputs po
JOIN production_runs pr ON pr.id = po.production_run_id
ORDER BY po.production_date DESC, po.batch_number;
-- Verify FG batch format and linkage
```

**Test 3.7c: Batch Number Uniqueness**

**Steps:**

1. Create 10+ production runs
2. Query all batch numbers
3. Verify no duplicates

**Expected Results:**

- ✅ All production batch numbers unique
- ✅ All FG batch numbers unique
- ✅ No collisions even with concurrent productions

**Test 3.7d: Date Format Validation**

**Steps:**

1. Create production runs on different dates
2. Verify date portion of batch numbers

**Expected Results:**

- ✅ Date format always YYYYMMDD (8 digits)
- ✅ Matches actual production_date
- ✅ No timezone issues
- ✅ Consistent format across all batches

---

### Test 3.8: Delete Production Run (Validation)

**Objective:** Verify only planned runs can be deleted

**Steps:**

1. Try to delete a completed run
2. Verify delete button not visible
3. Delete a planned run
4. Confirm deletion

**Expected Results:**

- ✅ Completed/In Progress runs don't show delete button
- ✅ Only planned runs can be deleted
- ✅ Confirmation dialog appears
- ✅ Deletion successful with notification

---

## Module 4: Profit Analysis Testing

### Test 4.1: Create Sales Invoice for Profit Testing

**Objective:** Create a sales invoice to test profit calculation features

**Prerequisites:**

- Completed production run with known costs
- Product SKU with stock available
- Known average cost per unit

**Steps:**

1. Navigate to Sales/Invoices page
2. Create a new sales invoice
3. Select customer and outlet
4. Add line item:
   - Product: Select produced product
   - SKU: Select the SKU from completed production
   - Quantity: 5 units
   - Price: Enter selling price (e.g., LKR 500/unit)
5. Save invoice

**Expected Results:**

- ✅ Invoice created successfully
- ✅ Stock deducted from product SKU
- ✅ Invoice saved with line items
- ✅ Ready for profit analysis

**Database Validation:**

```sql
SELECT si.invoice_number,
       ii.quantity,
       ii.unit_price,
       ii.line_total,
       ps.average_cost
FROM sales_invoices si
JOIN invoice_items ii ON ii.invoice_id = si.id
JOIN product_skus ps ON ps.id = ii.product_sku_id
WHERE si.invoice_number = '[invoice_number]';
-- Note the average_cost for profit calculation
```

---

### Test 4.2: Individual Sale Profit Calculation

**Objective:** Verify profit calculation for a single sales invoice

**Steps:**

1. Navigate to Sales Invoice details or use API
2. View/query profit for the specific invoice
3. Verify profit calculation displayed

**API Endpoint:**

```bash
GET /api/profit/sale/:invoiceId
```

**Expected Results:**

- ✅ Response includes:
  - Invoice details
  - Line items with quantities and prices
  - Cost per unit (from SKU average cost)
  - Selling price per unit
  - Profit per unit
  - Total profit
- ✅ **Profit Formula Verification**:
  - profit_per_unit = selling_price - average_cost
  - total_profit = profit_per_unit × quantity
  - profit_margin% = (profit / selling_price) × 100

**Manual Calculation Example:**

```
Given:
- Selling Price: LKR 500/unit
- Average Cost: LKR 300/unit (from production)
- Quantity: 5 units

Calculate:
- Profit per unit = 500 - 300 = LKR 200 ✓
- Total Profit = 200 × 5 = LKR 1000 ✓
- Profit Margin = (200 / 500) × 100 = 40% ✓

Verify response matches these values (±0.01 tolerance)
```

**Database Validation:**

```sql
SELECT
    ii.quantity,
    ii.unit_price as selling_price,
    ps.average_cost,
    (ii.unit_price - ps.average_cost) as profit_per_unit,
    (ii.unit_price - ps.average_cost) * ii.quantity as total_profit,
    ((ii.unit_price - ps.average_cost) / ii.unit_price * 100) as profit_margin_pct
FROM invoice_items ii
JOIN product_skus ps ON ps.id = ii.product_sku_id
WHERE ii.invoice_id = [invoice_id];
```

---

### Test 4.3: Sales Profit Summary

**Objective:** Verify profit summary across multiple sales

**Prerequisites:**

- Create 3-5 sales invoices with different products and quantities

**Steps:**

1. Query sales profit summary endpoint
2. Apply date range filter
3. Review summary data

**API Endpoint:**

```bash
GET /api/profit/sales-summary?startDate=2026-01-01&endDate=2026-01-31
```

**Expected Results:**

- ✅ Summary includes:
  - Total sales amount
  - Total cost
  - Total profit
  - Average profit margin %
  - Number of invoices
- ✅ Filters work correctly (date range, outlet)
- ✅ Calculations accurate across multiple invoices

**User Verification:**

- ✅ Dashboard or report shows profit trends
- ✅ Can filter by date, outlet, or customer
- ✅ Charts/graphs display profit data
- ✅ Export functionality works

---

### Test 4.4: Product-Level Profit Analysis

**Objective:** Verify profit analysis grouped by product

**Steps:**

1. Query product profit endpoint
2. Review profit breakdown per product

**API Endpoint:**

```bash
GET /api/profit/products?startDate=2026-01-01&endDate=2026-01-31
```

**Expected Results:**

- ✅ Response groups sales by product
- ✅ For each product shows:
  - Product name and code
  - Total quantity sold
  - Total revenue
  - Total cost
  - Total profit
  - Average profit margin %
- ✅ Products sorted by profit (highest first)
- ✅ Can identify most/least profitable products

**Business Insight Verification:**

- ✅ High margin products identified (>30%)
- ✅ Low margin products flagged (<15%)
- ✅ Loss-making products highlighted (negative profit)

---

### Test 4.5: SKU-Level Profit Analysis

**Objective:** Verify detailed profit analysis at SKU level

**Steps:**

1. Query SKU profit endpoint
2. Compare different SKUs of same product
3. Analyze profit variance by size/packaging

**API Endpoint:**

```bash
GET /api/profit/skus?productId=123
```

**Expected Results:**

- ✅ Response shows profit for each SKU
- ✅ For each SKU displays:
  - Size and unit
  - Selling price
  - Average cost
  - Profit per unit
  - Profit margin %
  - Quantity sold
  - Total profit contribution
- ✅ Can compare profitability across SKUs
- ✅ Identifies which sizes are most profitable

**Example Analysis:**

```
Product: Curry Powder
- 100g SKU: Price LKR 250, Cost LKR 150, Margin 40%
- 250g SKU: Price LKR 550, Cost LKR 360, Margin 34.5%
- 500g SKU: Price LKR 1000, Cost LKR 700, Margin 30%

Insight: Smaller sizes have higher margins!
```

---

### Test 4.6: Profit Margin Categorization

**Objective:** Verify profit margin categorization and alerts

**Steps:**

1. Create sales with varying profit margins:
   - High margin sale (>30%)
   - Medium margin sale (15-30%)
   - Low margin sale (<15%)
2. Query profit data
3. Verify categorization

**Expected Results:**

- ✅ **High Margin** (>30%): Green indicator, "Excellent"
- ✅ **Medium Margin** (15-30%): Yellow indicator, "Good"
- ✅ **Low Margin** (<15%): Orange indicator, "Review Pricing"
- ✅ **Negative Margin** (<0%): Red indicator, "Loss!"
- ✅ Color coding applied in UI
- ✅ Alerts for low/negative margins

**User Experience:**

- ✅ Dashboard shows margin distribution chart
- ✅ Low margin sales flagged for review
- ✅ Recommendations provided for pricing adjustments

---

## Module 5: Waste & Efficiency Reporting

### Test 5.1: Waste Cost Report - Monthly Totals

**Objective:** Verify waste cost reporting aggregates correctly

**Prerequisites:**

- Complete 5+ production runs with varying waste amounts
- Include zero waste, normal waste (<20%), and high waste (≥20%) scenarios

**Steps:**

1. Navigate to Reports > Waste Analysis
2. Select date range (e.g., current month)
3. View waste cost report

**API Endpoint:**

```bash
GET /api/reports/waste-cost?startDate=2026-01-01&endDate=2026-01-31
```

**Expected Results:**

- ✅ Report displays:
  - Total waste quantity (kg)
  - Total waste cost (LKR)
  - Number of production runs
  - Average waste per run
  - Waste percentage (waste / total output)
- ✅ **Waste Cost Formula Verified**:
  - waste_cost = Σ(unit_cost × waste_quantity) for all runs
- ✅ Date filters work correctly
- ✅ Summary accurate across all productions

**Manual Verification:**

```
Run 1: Waste 0.5kg @ 1000/kg = 500
Run 2: Waste 1.2kg @ 950/kg = 1140
Run 3: Waste 0kg = 0
Run 4: Waste 2.5kg @ 1100/kg = 2750
---
Total Waste Cost = 500 + 1140 + 0 + 2750 = LKR 4390 ✓
Total Waste Qty = 0.5 + 1.2 + 0 + 2.5 = 4.2kg ✓
```

---

### Test 5.2: Waste Breakdown by Product

**Objective:** Verify waste analysis grouped by product

**Steps:**

1. Complete productions for multiple products with waste
2. Query waste report with product grouping
3. Analyze which products have highest waste

**API Endpoint:**

```bash
GET /api/reports/waste-cost/by-product?startDate=2026-01-01&endDate=2026-01-31
```

**Expected Results:**

- ✅ Grouped by product name
- ✅ For each product shows:
  - Product name and code
  - Total production quantity
  - Total waste quantity
  - Waste percentage
  - Total waste cost
  - Number of production runs
- ✅ Products sorted by waste cost (highest first)
- ✅ Can identify problematic products

**Business Insights:**

- ✅ High waste products flagged
- ✅ Waste trends over time visible
- ✅ Cost impact clearly shown

---

### Test 5.3: Waste Reasons Tracking

**Objective:** Verify waste reasons are captured and reported

**Steps:**

1. Complete productions with different waste reasons:
   - "Spillage during packaging"
   - "Equipment malfunction"
   - "Quality rejection"
   - "Measurement error"
2. Query waste reasons report
3. Analyze root causes

**Expected Results:**

- ✅ Waste reasons captured in production_runs table
- ✅ Report groups waste by reason
- ✅ Shows quantity and cost per reason
- ✅ Helps identify improvement areas

**Example Report:**

```
Waste by Reason (January 2026):
- Spillage: 5.2kg, LKR 5,500
- Equipment issues: 8.5kg, LKR 9,200
- Quality rejection: 3.1kg, LKR 3,400
---
Focus: Address equipment maintenance!
```

---

### Test 5.4: Zero Waste Production Tracking

**Objective:** Verify zero waste productions are handled and celebrated

**Steps:**

1. Complete a production run with:
   - Planned: 20kg
   - Actual: 20kg
   - Waste: 0kg
2. View production details
3. Check waste report

**Expected Results:**

- ✅ Zero waste recorded correctly
- ✅ Waste cost = LKR 0
- ✅ Yield efficiency = 100%
- ✅ **"Perfect Production!" badge or indicator**
- ✅ Included in efficiency statistics
- ✅ No waste reason required (optional field)

---

### Test 5.5: High Waste Detection (≥20%)

**Objective:** Verify high waste scenarios trigger alerts

**Steps:**

1. Complete a production run with high waste:
   - Planned: 20kg
   - Actual: 15kg
   - Waste: 5kg (25% waste!)
2. View production details
3. Check for alerts

**Expected Results:**

- ✅ High waste alert displayed
- ✅ **Red warning indicator**: "⚠️ High Waste: 25%"
- ✅ Waste reason becomes required (enforce investigation)
- ✅ Flagged in waste reports
- ✅ Notification sent to supervisor (if implemented)
- ✅ Waste percentage: (5 / 20) × 100 = 25% ✓

**Alert Thresholds:**

- ✅ Green: 0-5% waste (Excellent)
- ✅ Yellow: 5-20% waste (Normal)
- ✅ Red: ≥20% waste (High - Investigate!)

---

### Test 5.6: Efficiency Report - Overall Trends

**Objective:** Verify efficiency reporting shows production performance trends

**Steps:**

1. Complete 10+ production runs over several days
2. Navigate to Reports > Efficiency Analysis
3. View overall efficiency trends

**API Endpoint:**

```bash
GET /api/reports/efficiency?startDate=2026-01-01&endDate=2026-01-31
```

**Expected Results:**

- ✅ Report displays:
  - Average yield efficiency %
  - Trend over time (improving/declining)
  - Best performing day
  - Worst performing day
  - Efficiency distribution chart
- ✅ **Yield Efficiency Formula**: (actual / planned) × 100
- ✅ Statistics accurate:
  - Mean efficiency
  - Min efficiency
  - Max efficiency
  - Standard deviation

**Manual Calculation Example:**

```
Production Runs Efficiency:
Run 1: 20/20 = 100%
Run 2: 19.5/20 = 97.5%
Run 3: 18/20 = 90%
Run 4: 20/20 = 100%
Run 5: 19/20 = 95%
---
Average = (100 + 97.5 + 90 + 100 + 95) / 5 = 96.5% ✓
Min = 90% ✓
Max = 100% ✓
```

---

### Test 5.7: Efficiency Report - Recipe Filter

**Objective:** Verify efficiency analysis by recipe

**Steps:**

1. Complete multiple production runs for different recipes
2. Filter efficiency report by specific recipe
3. Compare efficiency across recipes

**API Endpoint:**

```bash
GET /api/reports/efficiency?recipeId=123
```

**Expected Results:**

- ✅ Filtered to selected recipe only
- ✅ Shows production history for that recipe
- ✅ Average efficiency for that recipe
- ✅ Can compare different recipes' efficiency
- ✅ Identifies problematic recipes

**Business Insights:**

```
Recipe A: Avg Efficiency 98% (Excellent process)
Recipe B: Avg Efficiency 85% (Review recipe/process)
Recipe C: Avg Efficiency 92% (Good)
```

---

### Test 5.8: Efficiency Report - Production Runs List

**Objective:** Verify detailed list of production runs with efficiency metrics

**Steps:**

1. View efficiency report
2. Scroll to production runs list section
3. Review individual run details

**Expected Results:**

- ✅ List shows each production run with:
  - Run number and batch number
  - Recipe name
  - Planned vs actual quantities
  - Waste quantity
  - Yield efficiency %
  - Status indicator (color-coded)
- ✅ Sortable by efficiency %
- ✅ Filterable by product/recipe/date
- ✅ Clickable to view run details

---

## Module 6: End-to-End Integration Workflows

### Test 6.1: Complete Product Lifecycle with Profit Analysis

**Objective:** Test full workflow from product creation to profit analysis

**Scenario:** Create "Garam Masala" product, produce it, sell it, and analyze profit

**Steps:**

#### Step 1: Create Product with SKUs

1. Navigate to Products
2. Create product: "Garam Masala"
3. Add SKU 1: "100g Bottle" - Price: LKR 350
4. Add SKU 2: "250g Bottle" - Price: LKR 800

#### Step 2: Create Recipe with SKU (Required)

1. Navigate to Recipes
2. Create recipe for "Garam Masala"
3. **Select SKU**: "100g Bottle" (REQUIRED)
4. Batch Size: 20 kg
5. Add materials:
   - Cinnamon - 5 kg @ LKR 800/kg = 4,000
   - Cardamom - 4 kg @ LKR 2000/kg = 8,000
   - Cloves - 3 kg @ LKR 1500/kg = 4,500
   - Black Pepper - 8 kg @ LKR 600/kg = 4,800
6. **Total Recipe Cost: LKR 21,300**
7. **Cost per kg: LKR 1,065**

#### Step 3: Check Material Stock (FIFO Preparation)

1. Verify sufficient raw material batches exist
2. Note the received dates and costs per batch for FIFO validation
3. If not sufficient, create purchase orders and receive items

#### Step 4: Create Production Run

1. Navigate to Production
2. Create run:
   - Recipe: Garam Masala (100g)
   - Quantity: 40 kg (2 batches)
   - Production Date: Today
3. Check material availability (should show sufficient)
4. Note materials will be consumed via FIFO

#### Step 5: Complete Production with Waste Tracking

1. Complete production run with:
   - Actual Output: 39.5 kg
   - **Waste: 0.5 kg (1.25%)**
   - **Waste Reason**: "Minor spillage"
   - Notes: "Good production run"
2. **Verify calculations**:
   - Total Material Cost: LKR 42,600 (2 × 21,300)
   - Unit Cost: 42,600 / (39.5 + 0.5) = LKR 1,065/kg
   - Waste Cost: 1,065 × 0.5 = LKR 532.50
   - Yield Efficiency: (39.5 / 40) × 100 = 98.75%
3. **Verify batch numbers generated**:
   - Production Batch: PROD-YYYYMMDD-001
   - FG Batch: FG-PROD-XXX-YYYYMMDD-001
4. **Verify FIFO consumption**: Oldest batches consumed first

#### Step 6: Verify Stock and Cost Updates

1. Check product SKU "100g Bottle":
   - Current Stock: 39.5 kg (or 395 bottles if unit conversion)
   - **Average Cost Updated**: LKR 1,065/kg per bottle
2. Verify raw material batches:
   - Oldest batches depleted first
   - Quantity_remaining updated correctly

#### Step 7: Create Sales Invoice

1. Navigate to Sales/Invoices
2. Create invoice:
   - Customer: Select any customer
   - Add line item:
     - Product: Garam Masala
     - SKU: 100g Bottle
     - Quantity: 10 bottles (1kg)
     - **Unit Price: LKR 350** (selling price)
3. Save invoice
4. Verify stock deducted: 39.5kg → 38.5kg

#### Step 8: Analyze Profit

1. Query individual sale profit:
   - **Selling Price**: 350 × 10 = LKR 3,500
   - **Cost**: 1,065/kg × 1kg = LKR 1,065
   - **Profit**: 3,500 - 1,065 = LKR 2,435
   - **Profit Margin**: (2,435 / 3,500) × 100 = 69.57%
   - **Margin Category**: HIGH (>30%) - Green indicator

2. Verify profit summary shows correct totals

3. Check product-level profit report:
   - Garam Masala listed with profit details
   - Margin shown as "High"

#### Step 9: Review Waste Report

1. Navigate to Waste Cost Report
2. Verify:
   - Waste Quantity: 0.5 kg recorded
   - Waste Cost: LKR 532.50
   - Waste Reason: "Minor spillage"
   - Waste %: 1.25% (Green - Excellent)

#### Step 10: Review Efficiency Report

1. Navigate to Efficiency Report
2. Verify:
   - Yield Efficiency: 98.75%
   - Status: Excellent (Green)
   - Included in overall efficiency statistics

**Expected Results - Complete Workflow:**

- ✅ Product created with auto code
- ✅ Recipe requires SKU (validation works)
- ✅ Production batch numbers auto-generated correctly
- ✅ FIFO consumption verified (oldest batches first)
- ✅ Waste tracked with cost allocation
- ✅ Yield efficiency calculated correctly
- ✅ SKU average cost updated
- ✅ Stock movements accurate
- ✅ Sales recorded correctly
- ✅ Profit calculated accurately with formulas
- ✅ Waste reports show correct data
- ✅ Efficiency reports accurate
- ✅ **Complete traceability**: FG batch → Production → Raw batches
- ✅ All data consistent across modules

**Traceability Verification:**

```sql
-- Trace from sale back to raw materials
SELECT
    si.invoice_number as sale,
    po.batch_number as fg_batch,
    pr.run_number as production_batch,
    pm.batch_id as raw_batch_id,
    rmb.batch_number as raw_batch_number,
    rm.name as raw_material,
    rmb.received_date
FROM sales_invoices si
JOIN invoice_items ii ON ii.invoice_id = si.id
JOIN production_outputs po ON po.product_sku_id = ii.product_sku_id
JOIN production_runs pr ON pr.id = po.production_run_id
JOIN production_materials pm ON pm.production_run_id = pr.id
JOIN raw_material_batches rmb ON rmb.id = pm.batch_id
JOIN raw_materials rm ON rm.id = rmb.raw_material_id
WHERE si.invoice_number = '[invoice_number]'
ORDER BY rmb.received_date;
-- Should show complete chain from sale to source materials
```

---

### Test 6.2: Multiple Productions with FIFO Validation

**Objective:** Verify FIFO cost tracking across multiple productions with different batch costs

**Scenario:** Test FIFO with materials from batches at different costs

**Prerequisites:**

- Create 2+ purchase orders for same raw material at different costs:
  - Batch 1 (older): 10kg @ LKR 1000/kg, Received: Jan 15
  - Batch 2 (newer): 15kg @ LKR 1200/kg, Received: Jan 20

**Steps:**

#### Production 1: Consumes from Batch 1 only

1. Create recipe requiring 8kg of the material
2. Create and complete production run #1
3. **Expected FIFO**: 8kg from Batch 1 @ 1000/kg = 8,000
4. **Verify**: Batch 1 has 2kg remaining, Batch 2 untouched

#### Production 2: Consumes remainder of Batch 1 + partial Batch 2

1. Create production run #2 requiring 12kg
2. Complete production
3. **Expected FIFO**:
   - 2kg from Batch 1 @ 1000/kg = 2,000 (depletes Batch 1)
   - 10kg from Batch 2 @ 1200/kg = 12,000
   - **Total Material Cost**: 14,000
4. **Verify**: Batch 1 = 0kg (depleted), Batch 2 = 5kg remaining

#### Production 3: Consumes only from Batch 2

1. Create production run #3 requiring 5kg
2. Complete production
3. **Expected FIFO**: 5kg from Batch 2 @ 1200/kg = 6,000
4. **Verify**: Batch 2 = 0kg (depleted)

**Expected Results:**

- ✅ **FIFO Order Maintained**: Oldest batches always consumed first
- ✅ **Cost Accuracy**: Each production uses correct batch costs
- ✅ **Batch Depletion**: Batches depleted in correct order
- ✅ **SKU Cost Updates**: Average cost updates with each production
- ✅ **Traceability**: production_materials table shows correct batch linkage

**Database Validation:**

```sql
-- Verify FIFO consumption order
SELECT
    pr.run_number,
    pm.quantity_used,
    rmb.batch_number,
    rmb.cost_per_unit,
    rmb.received_date,
    (pm.quantity_used * rmb.cost_per_unit) as material_cost
FROM production_runs pr
JOIN production_materials pm ON pm.production_run_id = pr.id
JOIN raw_material_batches rmb ON rmb.id = pm.batch_id
ORDER BY pr.id, rmb.received_date ASC;
-- Should show chronological consumption by received_date
```

**Formula Verification:**

For Production 2 (mixed batch consumption):

```
Material Cost = (2kg × 1000) + (10kg × 1200) = 2,000 + 12,000 = 14,000 ✓
Unit Cost = 14,000 / output_quantity ✓
```

---

### Test 6.3: Waste Impact on Unit Costs

**Objective:** Verify how waste affects unit cost calculations

**Scenario:** Compare two identical productions with different waste amounts

**Steps:**

#### Production A: Low Waste (2%)

1. Create production run: 50kg planned
2. Complete with:
   - Actual: 49kg
   - Waste: 1kg (2%)
   - Material Cost: LKR 50,000
3. **Calculate Unit Cost**:
   - unit_cost = 50,000 / (49 + 1) = LKR 1,000/kg
   - good_product_cost = 1,000 × 49 = 49,000
   - waste_cost = 1,000 × 1 = 1,000

#### Production B: High Waste (20%)

1. Create identical production run: 50kg planned
2. Complete with:
   - Actual: 40kg
   - Waste: 10kg (20% - Alert threshold!)
   - Material Cost: LKR 50,000
3. **Calculate Unit Cost**:
   - unit_cost = 50,000 / (40 + 10) = LKR 1,000/kg (same)
   - good_product_cost = 1,000 × 40 = 40,000
   - **waste_cost = 1,000 × 10 = 10,000** (10x higher!)

**Expected Results:**

- ✅ Unit cost formula correctly includes waste in denominator
- ✅ Higher waste = more cost absorbed by waste
- ✅ Good product cost accurately calculated
- ✅ Waste cost properly separated
- ✅ **High waste alert triggered for Production B** (≥20%)
- ✅ Waste reason becomes required for high waste
- ✅ Efficiency impact visible:
  - Production A: 98% efficiency
  - Production B: 80% efficiency (flagged for review)

**Business Impact Analysis:**

```
Same material cost (LKR 50,000) but:

Production A (2% waste):
- 49kg good product @ 1,000/kg
- Can sell all 49kg
- Waste loss: LKR 1,000

Production B (20% waste):
- Only 40kg good product @ 1,000/kg
- Lost 10kg to waste
- Waste loss: LKR 10,000

Impact: 18% waste difference = LKR 9,000 additional loss!
```

---

### Test 6.4: Complete Batch Traceability

**Objective:** Verify end-to-end traceability from sale back to raw materials

**Scenario:** Trace a sold product back to its source batches

**Steps:**

1. Note a completed sale (invoice number)
2. Identify the FG batch number from sale
3. Trace to production run
4. Trace to raw material batches consumed
5. Trace to purchase orders
6. Trace to suppliers

**Expected Trace Path:**

```
Sale Invoice #INV-2026-001
  └─> FG Batch: FG-PROD-001-20260122-001
      └─> Production Run: PROD-20260122-001
          ├─> Raw Batch 1: RMB-2026-001 (Coriander)
          │   └─> PO-2026-001 → Supplier A
          ├─> Raw Batch 2: RMB-2026-003 (Cumin)
          │   └─> PO-2026-002 → Supplier B
          └─> Raw Batch 3: RMB-2026-005 (Chili)
              └─> PO-2026-001 → Supplier A
```

**Database Query for Full Traceability:**

```sql
-- Complete traceability query
SELECT
    '1. Sale' as stage,
    si.invoice_number as reference,
    si.invoice_date as date,
    c.name as entity,
    ii.quantity as qty,
    NULL as cost,
    ii.line_total as value
FROM sales_invoices si
JOIN invoice_items ii ON ii.invoice_id = si.id
JOIN customers c ON c.id = si.customer_id
WHERE si.invoice_number = '[invoice_number]'

UNION ALL

SELECT
    '2. FG Batch',
    po.batch_number,
    po.production_date,
    CONCAT(p.name, ' - ', ps.size, ps.unit),
    po.quantity,
    pr.unit_cost,
    (po.quantity * pr.unit_cost)
FROM invoice_items ii
JOIN production_outputs po ON po.product_sku_id = ii.product_sku_id
JOIN production_runs pr ON pr.id = po.production_run_id
JOIN recipes r ON r.id = pr.recipe_id
JOIN products p ON p.id = r.product_id
JOIN product_skus ps ON ps.id = r.product_sku_id
WHERE ii.invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = '[invoice_number]')

UNION ALL

SELECT
    '3. Production Run',
    pr.run_number,
    pr.production_date,
    r.name,
    pr.actual_quantity,
    pr.unit_cost,
    pr.total_material_cost
FROM production_outputs po
JOIN production_runs pr ON pr.id = po.production_run_id
JOIN recipes r ON r.id = pr.recipe_id
WHERE po.batch_number IN (
    SELECT po2.batch_number FROM invoice_items ii2
    JOIN production_outputs po2 ON po2.product_sku_id = ii2.product_sku_id
    WHERE ii2.invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = '[invoice_number]')
)

UNION ALL

SELECT
    '4. Raw Batch',
    rmb.batch_number,
    rmb.received_date,
    rm.name,
    pm.quantity_used,
    rmb.cost_per_unit,
    (pm.quantity_used * rmb.cost_per_unit)
FROM production_materials pm
JOIN raw_material_batches rmb ON rmb.id = pm.batch_id
JOIN raw_materials rm ON rm.id = rmb.raw_material_id
WHERE pm.production_run_id IN (
    SELECT pr2.id FROM production_outputs po2
    JOIN production_runs pr2 ON pr2.id = po2.production_run_id
    WHERE po2.batch_number IN (
        SELECT po3.batch_number FROM invoice_items ii3
        JOIN production_outputs po3 ON po3.product_sku_id = ii3.product_sku_id
        WHERE ii3.invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = '[invoice_number]')
    )
)

UNION ALL

SELECT
    '5. Purchase Order',
    po_item.po_number,
    po_item.received_date,
    s.name,
    po_item.received_quantity,
    po_item.received_cost,
    po_item.total_cost
FROM raw_material_batches rmb
JOIN po_items po_item ON po_item.id = rmb.po_item_id
JOIN purchase_orders po_main ON po_main.po_number = po_item.po_number
JOIN suppliers s ON s.id = po_main.supplier_id
WHERE rmb.batch_number IN (
    SELECT rmb2.batch_number FROM production_materials pm2
    JOIN raw_material_batches rmb2 ON rmb2.id = pm2.batch_id
    WHERE pm2.production_run_id IN (
        SELECT pr3.id FROM production_outputs po4
        JOIN production_runs pr3 ON pr3.id = po4.production_run_id
        WHERE po4.batch_number IN (
            SELECT po5.batch_number FROM invoice_items ii5
            JOIN production_outputs po5 ON po5.product_sku_id = ii5.product_sku_id
            WHERE ii5.invoice_id = (SELECT id FROM sales_invoices WHERE invoice_number = '[invoice_number]')
        )
    )
)

ORDER BY stage, date;
```

**Expected Results:**

- ✅ Complete chain visible from sale to supplier
- ✅ All batch numbers traceable
- ✅ Costs traceable at each stage
- ✅ Dates show chronological flow
- ✅ FIFO order evident in raw batch consumption
- ✅ **Full audit trail available**
- ✅ Can identify source supplier for any sold product
- ✅ Quality issues can be traced back to source

**UI Verification (if traceability view implemented):**

- ✅ Traceability diagram/flow chart displayed
- ✅ Click-through navigation between stages
- ✅ Batch numbers highlighted and linked
- ✅ Timeline view shows progression
- ✅ Export/print functionality for audit

---

### Test 6.5: Full Reporting Integration

**Objective:** Verify all reports work together and show consistent data

**Scenario:** Complete workflow then verify across all reports

**Steps:**

1. Complete the full workflow (Test 6.1)
2. Navigate to each report module
3. Verify data consistency

**Report 1: Production Report**

- ✅ Shows production run details
- ✅ FIFO consumption visible
- ✅ Batch numbers displayed
- ✅ Costs accurate

**Report 2: Waste Cost Report**

- ✅ Waste from production visible
- ✅ Waste cost calculated correctly
- ✅ Matches production data

**Report 3: Efficiency Report**

- ✅ Yield efficiency shown
- ✅ Matches production calculations
- ✅ Trends accurate

**Report 4: Profit Analysis Report**

- ✅ Sale profit calculated
- ✅ Uses correct average cost from production
- ✅ Margin categorization correct

**Report 5: Inventory Report**

- ✅ Stock levels match production outputs
- ✅ Stock deductions from sales correct
- ✅ Average costs updated

**Report 6: Cost Tracking Report**

- ✅ FIFO costs traceable
- ✅ Material costs to production costs to sale costs
- ✅ Complete cost flow visible

**Cross-Report Validation:**

```
Verify consistency across reports:
- Production output qty = Stock increase
- Waste cost (Waste Report) = Waste allocation (Production)
- Average cost (Inventory) = Cost used in Profit calc
- Material cost (Production) = FIFO batch costs (Traceability)
- Efficiency % same across Efficiency and Production reports
```

**Expected Results:**

- ✅ No data inconsistencies
- ✅ All formulas give same results
- ✅ Timestamps consistent
- ✅ All reports reflect latest data
- ✅ Real-time or near-real-time updates
- ✅ **360-degree view of operations available**

---

### Test 6.6: Recipe Versioning Workflow

**Objective:** Test recipe version management in production

**Steps:**

1. Create production run using Recipe v1
2. Edit recipe (creates v2)
3. Create another production run using Recipe v2
4. Complete both runs
5. Verify each run linked to correct recipe version

**Expected Results:**

- ✅ Each production run references specific recipe version
- ✅ Changing recipe doesn't affect existing runs
- ✅ Version history preserved
- ✅ Can trace which recipe version was used in each production
- ✅ Cost differences between versions trackable

---

## Module 7: Performance Testing

**Objective:** Verify system handles large amounts of data

**Steps:**

1. Create 50+ products with multiple SKUs each
2. Create 100+ recipes with various BOM configurations
3. Create 200+ production runs
4. Test pagination performance
5. Test search and filter response times

**Expected Results:**

- ✅ Pagination loads quickly (< 1 second)
- ✅ Search responds instantly
- ✅ Filters apply without lag
- ✅ No memory leaks

---

### Test 7.2: Concurrent Operations

**Objective:** Test multiple users performing operations simultaneously

**Steps:**

1. Open multiple browser tabs
2. Simultaneously:
   - Create products in tab 1
   - Create recipes in tab 2
   - Create production runs in tab 3
3. Complete productions concurrently
4. Verify data consistency

**Expected Results:**

- ✅ No race conditions
- ✅ Database transactions handled correctly
- ✅ Stock updates accurate
- ✅ FIFO consistency maintained

---

## Module 8: Error Handling & Validation Testing

### Test 8.1: Product Validation

- ❌ Create product without name → Error
- ❌ Create SKU without price → Error
- ❌ Duplicate barcode → Error
- ❌ Delete SKU with stock → Error (after production)

### Test 8.2: Recipe Validation

- ❌ Create recipe without product → Error: "Product is required"
- ❌ **Create recipe without SKU → Error: "Product SKU is required"** (NEW)
- ❌ Create recipe without materials → Error: "At least one material required"
- ❌ Zero batch size → Error: "Batch size must be greater than 0"
- ❌ Negative quantities → Error: "Quantity cannot be negative"
- ❌ Update recipe without changing anything → Warning
- ✅ Recip8.3: Production Validation

- ❌ Create run without recipe → Error: "Recipe is required"
- ❌ Zero quantity → Error: "Quantity must be greater than 0"
- ❌ Negative actual output → Error: "Output cannot be negative"
- ❌ **Negative waste quantity → Error: "Waste cannot be negative"** (NEW)
- ❌ **Waste ≥ planned quantity → Error: "Waste cannot exceed planned quantity"** (NEW)
- ❌ Complete without actual output → Error: "Actual output is required"
- ❌ **High waste (≥20%) without reason → Error: "Waste reason required for high waste"** (NEW)

### Test 8.4: Cost and Profit Validation (NEW)

- ❌ Sale price below cost → Warning: "Low margin alert: [X%]"
- ❌ Negative profit → Alert: "Loss-making sale!"
- ❌ Sale without stock → Error: "Insufficient stock"
- ✅ High margin sale (>30%) → Success with "High margin" indicator
- ✅ Zero cost production (free samples) → Success with special handling

**Formula Validation Tests:**

- ✅ Verify unit_cost = material_cost / (actual + waste) → Must be accurate
- ✅ Verify waste_cost = unit_cost × waste_qty → Must be accurate
- ✅ Verify profit = selling_price - average_cost → Must be accurate
- ✅ Verify profit_margin% = (profit / selling_price) × 100 → Must be accurate
- ✅ All calculations within ±0.01 tolerance

---

### Test 8.5: Batch Number Validation (NEW)

- ✅ Production batch format: PROD-YYYYMMDD-NNN → Valid
- ✅ FG batch format: FG-{CODE}-YYYYMMDD-NNN → Valid
- ❌ Manual batch number entry → Prevented (auto-generated only)
- ❌ Duplicate batch number → Prevented by system
- ✅ Sequential increment across days → Correct
- ✅ Date reset at midnight → Counter resets to 001

---

### Test 8.6: FIFO Validation (NEW)

- ✅ Oldest batch consumed first → Verified
- ✅ Multi-batch consumption → Correct order maintained
- ❌ Try to consume from wrong batch order → System prevents (automatic)
- ✅ Zero remaining quantity handling → Batch marked depleted
- ✅ Partial batch consumption → Remaining quantity correct

---

## Module 9:✅ Complete with zero waste → Success (100% efficiency!)

- ✅ Complete with normal waste (<20%) → Success
- ⚠️ Complete with high waste (≥20%) with reason → Warning alert, but success

**Additional Production Tests:**

- ❌ Try to start production with insufficient materials → Error: "Insufficient material: [material name]"
- ❌ Try to complete production on future date → Error: "Cannot complete production in future"
- ✅ Actual output > planned quantity → Success (bonus yield! >100% efficiency)

- ❌ Create run without recipe → Error
- ❌ Zero quantity → Error
- ❌ Negative actual output → Error
- ❌ Complete without actual output → Error
- ❌ Edit completed run → Edit button hidden
- ❌ Delete completed run → Delete button hidden

---

## Module 9: API Endpoint Testing (Postman/cURL)

### Product Endpoints

```bash
# Get all products
GET http://localhost:3000/api/products

# Create product
POST http://localhost:3000/api/products
{
  "name": "Test Product",
  "category": "Spices",
  "status": "active"
}

# Get product by ID
GET http://localhost:3000/api/products/:id

# Update product
PUT http://localhost:3000/api/products/:id

# Delete product
DELETE http://localhost:3000/api/products/:id

# Add SKU
POST http://localhost:3000/api/products/:id/skus

# Update SKU
PUT http://localhost:3000/api/products/:productId/skus/:skuId

# Delete SKU
DELETE http://localhost:3000/api/products/:productId/skus/:skuId

# Get product stock
GET http://localhost:3000/api/products/:id/stock
```

### Recipe Endpoints

```bash
# Get all recipes
GET http://localhost:3000/api/recipes

# Create recipe (SKU REQUIRED)
POST http://localhost:3000/api/recipes
{
  "product_id": 1,
  "product_sku_id": 1,  // REQUIRED - cannot be null
  "name": "Test Recipe",
  "batch_size": 10,
  "unit": "kg",
  "items": [...]
}

# Get recipe by ID (includes SKU details)
GET http://localhost:3000/api/recipes/:id
// Response includes: sku_details: { size, unit }

# Update recipe (creates new version)
PUT http://localhost:3000/api/recipes/:id

# Delete recipe
DELETE http://localhost:3000/api/recipes/:id

# Get recipe versions
GET http://localhost:3000/api/recipes/:id/versions

# Filter recipes by product
GET http://localhost:3000/api/recipes?productId=123
```

### Production Endpoints

```bash
# Get all production runs
GET http://localhost:3000/api/production

# Create production run
POST http://localhost:3000/api/production
{
  "recipe_id": 1,
  "quantity": 20,
  "production_date": "2026-01-22"
}

# Get production run by ID
GET http://localhost:3000/api/production/:id

# Check material availability
GET http://localhost:3000/api/production/:id/check-materials

# Complete production run (with waste tracking)
POST http://localhost:3000/api/production/:id/complete
{
  "actual_output": 19.5,
  "waste_quantity": 0.5,
  "waste_reason": "Spillage during packaging",  // Required if waste ≥20%
  "notes": "Completed successfully"
}
// Response includes:
// - run_number (Production batch: PROD-YYYYMMDD-NNN)
// - unit_cost, waste_cost, yield_efficiency
// - fg_batch_number (FG-{CODE}-YYYYMMDD-NNN)
// - FIFO consumption details

# Update production run
PUT http://localhost:3000/api/production/:id

# Delete production run (planned only)
DELETE http://localhost:3000/api/production/:id

# Cancel production run
POST http://localhost:3000/api/production/:id/cancel
```

### Profit Analysis Endpoints (NEW)

```bash
# Get profit for specific sale invoice
GET http://localhost:3000/api/profit/sale/:invoiceId
// Response includes:
// - invoice details
// - profit_per_unit = selling_price - average_cost
// - total_profit, profit_margin%

# Get sales profit summary
GET http://localhost:3000/api/profit/sales-summary?startDate=2026-01-01&endDate=2026-01-31
// Response includes:
// - total_sales, total_cost, total_profit
// - average_profit_margin%
// - invoice_count

# Get product-level profit analysis
GET http://localhost:3000/api/profit/products?startDate=2026-01-01&endDate=2026-01-31
// Response groups by product with:
// - quantity_sold, revenue, cost, profit
// - profit_margin%, margin_category (High/Medium/Low)

# Get SKU-level profit analysis
GET http://localhost:3000/api/profit/skus?productId=123
// Response shows profit per SKU:
// - size, unit, selling_price, cost
// - profit_per_unit, profit_margin%
// - quantity_sold, total_profit
```

### Waste & Efficiency Reporting Endpoints (NEW)

```bash
# Get waste cost report
GET http://localhost:3000/api/reports/waste-cost?startDate=2026-01-01&endDate=2026-01-31
// Response includes:
// - total_waste_quantity, total_waste_cost
// - production_run_count, average_waste_per_run
// - waste_percentage

# Get waste breakdown by product
GET http://localhost:3000/api/reports/waste-cost/by-product?startDate=2026-01-01&endDate=2026-01-31
// Grouped by product with:
// - total_production_qty, total_waste_qty
// - waste_percentage, waste_cost

# Get waste by reason (if tracked)
GET http://localhost:3000/api/reports/waste-reasons?startDate=2026-01-01&endDate=2026-01-31
// Groups waste by reason

# Get efficiency report - overall trends
GET http://localhost:3000/api/reports/efficiency?startDate=2026-01-01&endDate=2026-01-31
// Response includes:
// - average_yield_efficiency%
// - min/max efficiency
// - trend over time
// - efficiency distribution

# Get efficiency report - by recipe
GET http://localhost:3000/api/reports/efficiency?recipeId=123
// Filtered to specific recipe

# Get production runs list with efficiency
GET http://localhost:3000/api/reports/efficiency/runs?startDate=2026-01-01&endDate=2026-01-31
// List of runs with:
// - run_number, batch_number, recipe_name
// - planned_qty, actual_qty, waste_qty
// - yield_efficiency%, status_indicator
```

### Traceability Endpoints (NEW - if implemented)

```bash
# Get complete traceability for a sale
GET http://localhost:3000/api/traceability/sale/:invoiceNumber
// Returns chain: Sale → FG Batch → Production → Raw Batches → PO → Supplier

# Get traceability for FG batch
GET http://localhost:3000/api/traceability/fg-batch/:batchNumber
// Shows: Production run → Raw batches consumed

# Get traceability for production run
GET http://localhost:3000/api/traceability/production/:runNumber
// Shows: Raw batches → FIFO order → Suppliers
```

---

## Test Results Summary

### Module 1: Product Management

| Feature               | Status | Notes                       |
| --------------------- | ------ | --------------------------- |
| Create Product        | ⏳     | Auto-code generation        |
| Add/Edit SKUs         | ⏳     | Multiple SKUs per product   |
| Delete SKU Validation | ⏳     | Prevent if linked to recipe |
| View Stock            | ⏳     | Stock summary dialog        |
| Search/Filter         | ⏳     | By name, category, status   |
| Low Stock Alerts      | ⏳     | Reorder level monitoring    |

### Module 2: Recipe Management

| Feature               | Status | Notes                          |
| --------------------- | ------ | ------------------------------ |
| Create Recipe         | ⏳     | **SKU now REQUIRED**           |
| SKU Validation        | ⏳     | **Cannot proceed without SKU** |
| BOM Management        | ⏳     | Add/edit/delete materials      |
| Cost Calculation      | ⏳     | Auto-calculate from materials  |
| Recipe Versioning     | ⏳     | Version history preserved      |
| View with SKU Details | ⏳     | **SKU displayed prominently**  |
| Filter by Product     | ⏳     | Product-specific recipes       |
| Delete Validation     | ⏳     | Cascade considerations         |

### Module 3: Production Management

| Feature                 | Status | Notes                          |
| ----------------------- | ------ | ------------------------------ |
| Create Run              | ⏳     | Batch size calculations        |
| Material Check          | ⏳     | Availability validation        |
| FIFO Completion         | ⏳     | **Oldest batches first**       |
| Waste Tracking          | ⏳     | **Quantity + reason**          |
| Waste Cost Calculation  | ⏳     | **Formula: unit_cost × waste** |
| Yield Efficiency        | ⏳     | **(actual/planned) × 100**     |
| Batch Number Generation | ⏳     | **PROD-YYYYMMDD-NNN**          |
| FG Batch Generation     | ⏳     | **FG-{CODE}-YYYYMMDD-NNN**     |
| High Waste Alert        | ⏳     | **≥20% triggers alert**        |
| Zero Waste Handling     | ⏳     | **100% efficiency badge**      |
| SKU Cost Update         | ⏳     | **Weighted average**           |
| Stock Updates           | ⏳     | Correct quantity changes       |
| View Completed Details  | ⏳     | **Cost analysis section**      |
| Delete Validation       | ⏳     | Planned only                   |

### Module 4: Profit Analysis (NEW)

| Feature                 | Status | Notes                         |
| ----------------------- | ------ | ----------------------------- |
| Sale Profit Calculation | ⏳     | **price - average_cost**      |
| Sales Profit Summary    | ⏳     | Aggregate across invoices     |
| Product Profit Analysis | ⏳     | **Grouped by product**        |
| SKU Profit Analysis     | ⏳     | **Compare SKU profitability** |
| Profit Margin %         | ⏳     | **(profit/price) × 100**      |
| Margin Categorization   | ⏳     | **High/Medium/Low/Loss**      |
| Low Margin Alerts       | ⏳     | **<15% flagged**              |
| High Margin Indicator   | ⏳     | **>30% highlighted**          |

### Module 5: Waste & Efficiency Reporting (NEW)

| Feature               | Status | Notes                        |
| --------------------- | ------ | ---------------------------- |
| Waste Cost Report     | ⏳     | **Monthly totals**           |
| Waste by Product      | ⏳     | **Product breakdown**        |
| Waste by Reason       | ⏳     | **Root cause analysis**      |
| Zero Waste Tracking   | ⏳     | **Perfect production badge** |
| High Waste Detection  | ⏳     | **≥20% flagged**             |
| Efficiency Trends     | ⏳     | **Overall performance**      |
| Efficiency by Recipe  | ⏳     | **Recipe comparison**        |
| Efficiency Runs List  | ⏳     | **Detailed run metrics**     |
| Efficiency Statistics | ⏳     | **Min/max/average**          |

### Module 6: E2E Integration Workflows

| Feature                | Status | Notes                            |
| ---------------------- | ------ | -------------------------------- |
| Complete Lifecycle     | ⏳     | **Product → Production → Sale**  |
| FIFO Multi-Production  | ⏳     | **Multiple batch costs**         |
| Waste Impact on Costs  | ⏳     | **Cost allocation comparison**   |
| Complete Traceability  | ⏳     | **Sale → Raw materials chain**   |
| Full Reporting         | ⏳     | **Cross-report consistency**     |
| Recipe Versioning Flow | ⏳     | Version management in production |

### Module 7: Performance Testing

| Feature                | Status | Notes                      |
| ---------------------- | ------ | -------------------------- |
| Large Dataset          | ⏳     | 50+ products, 100+ recipes |
| Pagination Performance | ⏳     | <1 second load time        |
| Search Performance     | ⏳     | Instant results            |
| Concurrent Operations  | ⏳     | Multi-user scenario        |
| No Memory Leaks        | ⏳     | Extended usage testing     |

### Module 8: Error Handling & Validation

| Feature                 | Status | Notes                          |
| ----------------------- | ------ | ------------------------------ |
| Product Validation      | ⏳     | Required fields, duplicates    |
| Recipe SKU Required     | ⏳     | **Cannot create without SKU**  |
| Recipe Cascade Delete   | ⏳     | **Prevent if SKU has recipe**  |
| Production Validations  | ⏳     | All input validations          |
| Waste Validations       | ⏳     | **High waste requires reason** |
| Cost Formulas           | ⏳     | **±0.01 accuracy**             |
| Batch Number Uniqueness | ⏳     | **No duplicates**              |
| FIFO Enforcement        | ⏳     | **Automatic oldest-first**     |

### Module 9: API Testing

| Feature              | Status | Notes                          |
| -------------------- | ------ | ------------------------------ |
| Product Endpoints    | ⏳     | CRUD + stock                   |
| Recipe Endpoints     | ⏳     | **SKU in request/response**    |
| Production Endpoints | ⏳     | **Waste + FIFO + batches**     |
| Profit Endpoints     | ⏳     | **All profit analysis APIs**   |
| Reporting Endpoints  | ⏳     | **Waste + efficiency reports** |
| Traceability APIs    | ⏳     | **Complete chain queries**     |

**Legend:**

- ✅ Pass
- ❌ Fail
- ⏳ Pending
- ⚠️ Warning

---

## Summary of New Features Tested

### 1. Recipe-SKU Validation ✨

- SKU is now **REQUIRED** for all recipes
- Validation prevents recipe creation without SKU
- SKU details displayed in recipe views and lists
- Cascade delete protection implemented

### 2. FIFO Cost Tracking ✨

- Automatic consumption of oldest batches first
- Accurate cost calculation from multiple batches
- SKU average cost updates with weighted average
- Batch depletion tracking with quantity_remaining

### 3. Waste Allocation & Tracking ✨

- Waste quantity and reason captured
- **Waste cost formula**: (material_cost / (actual + waste)) × waste_qty
- **Yield efficiency formula**: (actual / planned) × 100
- High waste alerts (≥20%) with required reason
- Zero waste productions celebrated (100% efficiency!)

### 4. Batch Number Generation ✨

- **Production batch**: PROD-YYYYMMDD-NNN (auto-generated)
- **FG batch**: FG-{PRODUCT_CODE}-YYYYMMDD-NNN (auto-generated)
- Sequential numbering with daily reset
- Guaranteed uniqueness

### 5. Profit Analysis ✨

- Individual sale profit calculation
- Product and SKU-level profit analysis
- **Profit margin formula**: ((price - cost) / price) × 100
- Margin categorization: High (>30%), Medium (15-30%), Low (<15%)
- Loss detection and alerts

### 6. Waste & Efficiency Reporting ✨

- Comprehensive waste cost reports
- Waste breakdown by product and reason
- Efficiency trends and statistics
- Recipe performance comparison
- Complete production run metrics

### 7. Complete Traceability ✨

- End-to-end: Sale → FG Batch → Production → Raw Batches → PO → Supplier
- FIFO consumption order visible
- Cost flow tracking
- Audit trail for quality issues

---

## Key Formulas to Validate

During manual testing, verify these calculations are accurate (±0.01 tolerance):

1. **Unit Cost**

   ```
   unit_cost = total_material_cost / (actual_quantity + waste_quantity)
   ```

2. **Waste Cost**

   ```
   waste_cost = unit_cost × waste_quantity
   ```

3. **Good Product Cost**

   ```
   good_product_cost = unit_cost × actual_quantity
   ```

4. **Yield Efficiency**

   ```
   yield_efficiency = (actual_quantity / planned_quantity) × 100
   ```

5. **Waste Percentage**

   ```
   waste_percentage = (waste_quantity / planned_quantity) × 100
   ```

6. **Profit per Unit**

   ```
   profit_per_unit = selling_price - average_cost
   ```

7. **Profit Margin**

   ```
   profit_margin = ((selling_price - average_cost) / selling_price) × 100
   ```

8. **SKU Average Cost (Weighted Average)**
   ```
   new_avg_cost = (old_stock × old_cost + new_stock × new_cost) / total_stock
   ```

---

## Known Issues & Fixes

### Issue Template

```
Issue #: [Number]
Module: [Product/Recipe/Production]
Severity: [Critical/High/Medium/Low]
Description: [Description]
Steps to Reproduce: [Steps]
Expected: [Expected behavior]
Actual: [Actual behavior]
Fix: [Solution implemented]
Status: [Open/In Progress/Resolved]
```

---

## Testing Checklist

### Pre-Testing

- [ ] Database migrations applied
- [ ] Backend server running (`npm start`)
- [ ] Frontend dev server running (`npm run dev`)
- [ ] Test data seeded (suppliers, raw materials, batches with different costs)
- [ ] Valid user logged in with appropriate permissions
- [ ] Multiple raw material batches at different costs for FIFO testing

### Module 1: Product Module

- [ ] Create product with auto-code
- [ ] Add multiple SKUs
- [ ] Edit SKU details
- [ ] Delete SKU (with/without stock)
- [ ] **Verify SKU cannot be deleted if linked to recipe** (NEW)
- [ ] View product details
- [ ] Search and filter products
- [ ] Stock summary dialog
- [ ] Low stock alerts

### Module 2: Recipe Module

- [ ] **Attempt to create recipe without SKU - verify error** (NEW)
- [ ] Create recipe with SKU (REQUIRED)
- [ ] **Verify SKU details displayed in recipe view** (NEW)
- [ ] Add/edit/delete materials
- [ ] Cost calculation accuracy
- [ ] Edit recipe (version creation)
- [ ] View recipe details with SKU information
- [ ] Version history dialog
- [ ] **Filter recipes by product and view SKU in list** (NEW)
- [ ] Search and filter recipes
- [ ] Delete recipe with confirmation

### Module 3: Production Module

- [ ] Create production run
- [ ] Batch calculation accuracy
- [ ] Material requirements display
- [ ] Material availability check
- [ ] Edit planned production run
- [ ] **Complete production with waste tracking** (NEW)
- [ ] **Verify production batch number format: PROD-YYYYMMDD-NNN** (NEW)
- [ ] **Verify FG batch number format: FG-{CODE}-YYYYMMDD-NNN** (NEW)
- [ ] **Verify FIFO consumption - oldest batches first** (NEW)
- [ ] **Verify waste cost calculation** (NEW)
- [ ] **Verify yield efficiency calculation** (NEW)
- [ ] **Test zero waste production (100% efficiency)** (NEW)
- [ ] **Test high waste production (≥20% - alert triggered)** (NEW)
- [ ] **Verify SKU average cost updated correctly** (NEW)
- [ ] View completed run with cost analysis
- [ ] Stock updates verified
- [ ] Search and filter runs
- [ ] Delete validations (planned only)
- [ ] **Batch number uniqueness across multiple productions** (NEW)

### Module 4: Profit Analysis (NEW)

- [ ] Create sales invoice
- [ ] **Query individual sale profit** (NEW)
- [ ] **Verify profit formula: selling_price - average_cost** (NEW)
- [ ] **View sales profit summary** (NEW)
- [ ] **Product-level profit analysis** (NEW)
- [ ] **SKU-level profit comparison** (NEW)
- [ ] **Verify profit margin calculation** (NEW)
- [ ] **Test margin categorization (High/Medium/Low)** (NEW)
- [ ] **Low margin alerts (<15%)** (NEW)
- [ ] **High margin indicator (>30%)** (NEW)
- [ ] **Negative margin detection (loss)** (NEW)

### Module 5: Waste & Efficiency Reporting (NEW)

- [ ] **View waste cost report - monthly totals** (NEW)
- [ ] **Waste breakdown by product** (NEW)
- [ ] **Waste by reason analysis** (NEW)
- [ ] **Zero waste production tracking** (NEW)
- [ ] **High waste detection (≥20%)** (NEW)
- [ ] **Overall efficiency trends report** (NEW)
- [ ] **Efficiency by recipe comparison** (NEW)
- [ ] **Production runs list with efficiency metrics** (NEW)
- [ ] **Efficiency statistics (min/max/average)** (NEW)
- [ ] **Verify all formulas match expected values** (NEW)

### Module 6: End-to-End Workflows

- [ ] Complete product lifecycle (create → produce → sell → profit)
- [ ] **FIFO multi-production with different batch costs** (NEW)
- [ ] **Waste impact on unit costs comparison** (NEW)
- [ ] **Complete batch traceability (sale to supplier)** (NEW)
- [ ] **Full reporting integration - cross-report consistency** (NEW)
- [ ] Recipe versioning workflow
- [ ] Data consistency across modules

### Module 7: Performance

- [ ] Large dataset handling (50+ products, 100+ recipes, 200+ runs)
- [ ] Pagination performance (<1 second)
- [ ] Search/filter speed (instant)
- [ ] Concurrent operations (multi-user)
- [ ] No memory leaks (extended usage)

### Module 8: Error Handling

- [ ] All product validation errors work
- [ ] **Recipe SKU required validation** (NEW)
- [ ] All recipe validation errors work
- [ ] All production validation errors work
- [ ] **High waste reason required** (NEW)
- [ ] **Waste validation errors** (NEW)
- [ ] Network error handling
- [ ] Loading states work
- [ ] Toast notifications appear
- [ ] Error messages clear and helpful

### Module 9: API Testing (Optional)

- [ ] Test all product endpoints
- [ ] **Test recipe endpoints with SKU requirement** (NEW)
- [ ] **Test production endpoints with waste tracking** (NEW)
- [ ] **Test all profit analysis endpoints** (NEW)
- [ ] **Test waste & efficiency reporting endpoints** (NEW)
- [ ] **Test traceability endpoints (if available)** (NEW)

---

## Test Data Examples

### Sample Product Data

```javascript
{
  name: "Garam Masala",
  category: "Spices",
  description: "Premium garam masala blend",
  status: "active"
}

SKUs:
[
  { size: "100", unit: "g", price: 350 },
  { size: "250", unit: "g", price: 750 }
]
```

### Sample Recipe Data

```javascript
{
  product_id: 1,
  product_sku_id: 1,  // REQUIRED - Cannot be null
  name: "Garam Masala Recipe",
  batch_size: 20,
  unit: "kg",
  notes: "Premium blend recipe",
  items: [
    { raw_material_id: 1, quantity: 5, unit: "kg" },
    { raw_material_id: 2, quantity: 4, unit: "kg" },
    { raw_material_id: 3, quantity: 3, unit: "kg" },
    { raw_material_id: 4, quantity: 8, unit: "kg" }
  ]
}
```

### Sample Production Data

```javascript
{
  recipe_id: 1,
  quantity: 40,
  production_date: "2026-01-22",
  status: "planned",
  notes: "Test production run"
}

Completion:
{
  actual_output: 39.5,
  waste_quantity: 0.5,
  waste_reason: "Minor spillage during packaging",
  notes: "Completed successfully"
}

Expected Results:
{
  run_number: "PROD-20260122-001",
  fg_batch_number: "FG-PROD-001-20260122-001",
  unit_cost: 1065.00,  // material_cost / (actual + waste)
  waste_cost: 532.50,  // unit_cost × waste
  yield_efficiency: 98.75  // (actual / planned) × 100
}
```

### Sample Profit Analysis Data

```javascript
// Sale
{
  invoice_number: "INV-2026-001",
  customer_id: 1,
  items: [
    {
      product_sku_id: 1,
      quantity: 10,  // units
      unit_price: 350  // selling price
    }
  ]
}

// Profit Calculation
{
  selling_price: 350,
  average_cost: 106.5,  // from production
  profit_per_unit: 243.5,  // 350 - 106.5
  profit_margin: 69.57%,  // (243.5 / 350) × 100
  category: "High"  // >30%
}
```

### Sample FIFO Test Data

```javascript
// Raw Material Batches for FIFO Testing
[
  {
    batch_number: 'RMB-2026-001',
    raw_material_id: 1,
    quantity: 10,
    cost_per_unit: 1000,
    received_date: '2026-01-15', // Older - consumed first
  },
  {
    batch_number: 'RMB-2026-002',
    raw_material_id: 1,
    quantity: 15,
    cost_per_unit: 1200,
    received_date: '2026-01-20', // Newer - consumed second
  },
];

// Production consuming 12kg
// Expected FIFO: 10kg from RMB-2026-001 + 2kg from RMB-2026-002
// Total cost: (10 × 1000) + (2 × 1200) = 10,000 + 2,400 = 12,400
```

---

## Conclusion

Week 5 testing now covers comprehensive validation of Product, Recipe, Production, Profit Analysis, and Waste & Efficiency Reporting modules with emphasis on:

### Core Features ✅

- ✅ Auto-code generation for products
- ✅ Multi-SKU management per product
- ✅ BOM (Bill of Materials) builder functionality
- ✅ Recipe versioning system
- ✅ Stock management and tracking

### NEW Features Integrated ✨

#### Recipe-SKU Requirements

- ✅ **SKU now REQUIRED for all recipes**
- ✅ Validation prevents recipe creation without SKU
- ✅ SKU details prominently displayed
- ✅ Cascade delete protection

#### FIFO Cost Tracking

- ✅ **FIFO batch consumption** (oldest first)
- ✅ Accurate multi-batch cost calculations
- ✅ Weighted average SKU cost updates
- ✅ Batch depletion tracking

#### Waste Management

- ✅ **Waste quantity and reason tracking**
- ✅ Waste cost allocation formula
- ✅ Yield efficiency calculations
- ✅ High waste alerts (≥20%)
- ✅ Zero waste celebration (100% efficiency)

#### Batch Number Generation

- ✅ **Production batch**: PROD-YYYYMMDD-NNN
- ✅ **Finished goods batch**: FG-{CODE}-YYYYMMDD-NNN
- ✅ Automatic generation with uniqueness
- ✅ Sequential numbering with daily reset

#### Profit Analysis

- ✅ **Individual sale profit calculations**
- ✅ Product and SKU-level profit analysis
- ✅ Profit margin categorization
- ✅ High/low margin alerts
- ✅ Loss detection

#### Waste & Efficiency Reporting

- ✅ **Comprehensive waste cost reports**
- ✅ Efficiency trends and statistics
- ✅ Product and recipe performance comparison
- ✅ Root cause analysis (waste reasons)

#### Complete Traceability

- ✅ **End-to-end traceability**: Sale → Production → Raw Materials → Supplier
- ✅ FIFO consumption order visibility
- ✅ Cost flow tracking
- ✅ Quality audit trails

### Validated Formulas 📐

All calculations tested with ±0.01 accuracy tolerance:

1. Unit Cost = material_cost / (actual + waste)
2. Waste Cost = unit_cost × waste_qty
3. Yield Efficiency = (actual / planned) × 100
4. Profit = selling_price - average_cost
5. Profit Margin = (profit / selling_price) × 100
6. SKU Average Cost = weighted average calculation

### Testing Scope

**Manual Tests**: 85+ comprehensive test cases covering:

- 6 Product tests
- 6 Recipe tests (including SKU validation)
- 8 Production tests (including FIFO, waste, batches)
- 6 Profit analysis tests
- 8 Waste & efficiency reporting tests
- 6 E2E integration workflow tests
- Performance and error handling tests

**API Tests**: 30+ endpoints including:

- Product, Recipe, Production CRUD
- Profit analysis APIs
- Waste & efficiency reporting APIs
- Traceability queries

### Prerequisites

- Backend implementations complete for all features
- Database schema updated with new fields (waste_reason, batch numbers, etc.)
- Frontend UI components updated for new features
- Test data prepared with multiple batches at different costs

### Success Criteria

All tests must pass before proceeding to next phase. Key validation points:

- ✅ Recipe cannot be created without SKU
- ✅ FIFO consumption verified with multiple batches
- ✅ All cost formulas accurate to ±0.01 LKR
- ✅ Batch numbers follow correct formats
- ✅ High waste triggers alerts
- ✅ Profit calculations match expected values
- ✅ Complete traceability chain functional

### Next Steps

After successful Week 5 testing:

1. ✅ Document all test results
2. ✅ Log any issues found
3. ✅ Verify all fixes
4. ✅ Proceed to Week 6 (Sales & Invoicing integration)
5. ✅ User acceptance testing
6. ✅ Performance optimization if needed

---

**Testing Duration:** Estimated 5-6 hours for complete manual testing  
**Automated Test Suite**: See `COMPREHENSIVE_TEST_SUITE.ps1` (59 tests)  
**Last Updated:** January 22, 2026  
**Version:** 2.0 (Updated with all new features)

---

**Questions or Issues?**

- Review TEST_DELIVERABLES_SUMMARY.md for comprehensive test suite details
- Check TEST_IMPLEMENTATION_SUMMARY.md for formula explanations
- Run automated tests: `.\COMPREHENSIVE_TEST_SUITE.ps1`
- Seed test data: `npm run test:seed`

**End of Week 5 Testing Guide**
