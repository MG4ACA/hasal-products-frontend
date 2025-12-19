# Week 5 Testing Guide

## Overview

This document outlines the testing procedures for Week 5 implementation, covering Product Management, Recipe Management with BOM (Bill of Materials), and Production Management with FIFO batch consumption.

**Date:** December 19, 2025  
**Modules:** Products, Recipes, Production

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

### Test 2.1: Create Recipe with BOM

**Objective:** Verify recipe creation with Bill of Materials

**Steps:**

1. Navigate to Recipes page (`/recipes`)
2. Click "New Recipe" button
3. Select Product: "Roasted Curry Powder"
4. Select SKU: "100g Pack"
5. Enter Recipe Name: "Roasted Curry Powder Recipe"
6. Enter Batch Size: 10 (kg)
7. Select Unit: kg
8. Enter Description: "Premium blend recipe"
9. Click "Add Material" button
10. Add first material:
    - Raw Material: "Coriander Seeds"
    - Quantity: 5.00
    - Unit: kg
11. Click "Add"
12. Add second material:
    - Raw Material: "Cumin Seeds"
    - Quantity: 3.00
    - Unit: kg
13. Add third material:
    - Raw Material: "Chili Powder"
    - Quantity: 2.00
    - Unit: kg
14. Verify cost calculation displayed
15. Click "Create Recipe"

**Expected Results:**

- ✅ Recipe created with version 1
- ✅ All 3 materials added to BOM
- ✅ Total cost calculated correctly (sum of material costs)
- ✅ Cost per unit = Total Cost / Batch Size
- ✅ Success notification displayed
- ✅ Redirected to recipes list

**Database Validation:**

```sql
SELECT r.*,
       (SELECT COUNT(*) FROM recipe_items WHERE recipe_id = r.id) as item_count
FROM recipes r
WHERE r.name = 'Roasted Curry Powder Recipe';
-- Should show version = 1, item_count = 3
```

---

### Test 2.2: View Recipe Details

**Objective:** Verify recipe view displays all information

**Steps:**

1. Navigate to Recipes list
2. Click "View" icon on the created recipe
3. Review all sections:
   - Recipe Information
   - Bill of Materials
   - Cost Summary

**Expected Results:**

- ✅ Recipe details displayed correctly
- ✅ Product and SKU names shown
- ✅ BOM table shows all 3 materials with quantities
- ✅ Total Recipe Cost calculated
- ✅ Cost per Unit displayed
- ✅ Version tag shows "v1"

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

### Test 2.5: Filter Recipes

**Objective:** Verify recipe filtering by status and product

**Steps:**

1. Create 2-3 more recipes for different products
2. Test search: Enter recipe name
3. Test status filter: Select "Active"
4. Test product filter: Select a specific product
5. Clear all filters

**Expected Results:**

- ✅ Search filters by name and description
- ✅ Status filter works correctly
- ✅ Product filter shows only recipes for that product
- ✅ Filters can be combined
- ✅ Clear filters resets the list

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

**Steps:**

1. Click "Edit" icon on the planned production run
2. Modify quantity to 36 kg
3. Verify batch calculation updates to 3.00
4. Verify required materials update
5. Click "Update Production Run"

**Expected Results:**

- ✅ Only planned runs show edit button
- ✅ Changes saved successfully
- ✅ Calculations updated correctly
- ✅ Success notification displayed

---

### Test 3.4: Complete Production Run (FIFO)

**Objective:** Verify production completion with FIFO batch consumption

**Steps:**

1. From production list, click "Complete" button (check icon)
2. In completion dialog, verify:
   - Run number and recipe displayed
   - Expected output shown
3. Enter completion details:
   - Actual Output: 35.5 kg
   - Waste Quantity: 0.5 kg
   - Notes: "Minor waste during packaging"
4. Notice FIFO message
5. Click "Complete Production"

**Expected Results:**

- ✅ Completion dialog opens correctly
- ✅ FIFO information message displayed
- ✅ Production run status changed to "Completed"
- ✅ Materials deducted using FIFO (oldest batches first)
- ✅ Production output batch created for product SKU
- ✅ Product SKU stock increased by 35.5 kg
- ✅ Success notification displayed

**Database Validation:**

```sql
-- Verify production_materials records created with FIFO
SELECT pm.*, rmb.batch_number, rmb.received_date
FROM production_materials pm
JOIN raw_material_batches rmb ON rmb.id = pm.batch_id
WHERE pm.production_run_id = [run_id]
ORDER BY rmb.received_date ASC;

-- Verify raw material batch quantities deducted
SELECT * FROM raw_material_batches
WHERE raw_material_id IN (
  SELECT raw_material_id FROM recipe_items WHERE recipe_id = [recipe_id]
)
ORDER BY received_date;

-- Verify production_outputs created
SELECT * FROM production_outputs
WHERE production_run_id = [run_id];

-- Verify product SKU stock increased
SELECT current_stock FROM product_skus
WHERE id = (SELECT product_sku_id FROM recipes WHERE id = [recipe_id]);
```

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

### Test 3.7: Delete Production Run (Validation)

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

## Module 4: End-to-End Workflow Testing

### Test 4.1: Complete Product Lifecycle

**Objective:** Test full workflow from product creation to stock via production

**Scenario:** Create "Garam Masala" product and produce it

**Steps:**

#### Step 1: Create Product

1. Navigate to Products
2. Create product: "Garam Masala"
3. Add SKU: "200g Bottle" - Price: 450.00

#### Step 2: Create Recipe

1. Navigate to Recipes
2. Create recipe for "Garam Masala - 200g Bottle"
3. Batch Size: 20 kg
4. Add materials:
   - Cinnamon - 5 kg
   - Cardamom - 4 kg
   - Cloves - 3 kg
   - Black Pepper - 8 kg

#### Step 3: Check Material Stock

1. Verify sufficient raw material batches exist
2. If not, create purchase orders and receive items

#### Step 4: Create Production Run

1. Navigate to Production
2. Create run for 40 kg (2 batches)
3. Check material availability

#### Step 5: Complete Production

1. Complete production run
2. Actual Output: 39.5 kg
3. Waste: 0.5 kg

#### Step 6: Verify Results

1. Check product SKU stock increased
2. Verify raw material batches deducted (FIFO)
3. View production run details

**Expected Results:**

- ✅ Complete workflow executes without errors
- ✅ Stock movements tracked correctly
- ✅ FIFO consumption verified
- ✅ All data consistent across modules

---

### Test 4.2: Recipe Versioning Workflow

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

---

### Test 4.3: Low Stock Alert Workflow

**Objective:** Test low stock detection and alerts

**Steps:**

1. Set low reorder levels for product SKUs
2. Complete multiple production runs
3. Check product view for low stock alerts
4. Verify stock summary highlights low stock

**Expected Results:**

- ✅ Low stock count displayed correctly
- ✅ SKUs below reorder level highlighted in red
- ✅ "Low Stock" tags displayed
- ✅ Stock dialog shows accurate counts

---

### Test 4.4: Multi-Batch Production

**Objective:** Test production with multiple batches requiring FIFO from multiple raw material batches

**Steps:**

1. Create recipe requiring 50 kg of a raw material
2. Ensure only 30 kg in oldest batch, 40 kg in newer batch
3. Create production run requiring 50 kg
4. Complete production
5. Verify FIFO: 30 kg from oldest batch, 20 kg from newer batch

**Expected Results:**

- ✅ FIFO logic correctly consumes oldest batch first
- ✅ Remainder taken from next oldest batch
- ✅ production_materials table shows multiple batch consumption
- ✅ Batch quantities updated correctly

---

## Performance Testing

### Test 5.1: Large Dataset Handling

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

### Test 5.2: Concurrent Operations

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

## Error Handling & Validation Testing

### Test 6.1: Product Validation

- ❌ Create product without name → Error
- ❌ Create SKU without price → Error
- ❌ Duplicate barcode → Error
- ❌ Delete SKU with stock → Error (after production)

### Test 6.2: Recipe Validation

- ❌ Create recipe without product → Error
- ❌ Create recipe without SKU → Error
- ❌ Create recipe without materials → Error
- ❌ Zero batch size → Error
- ❌ Negative quantities → Error

### Test 6.3: Production Validation

- ❌ Create run without recipe → Error
- ❌ Zero quantity → Error
- ❌ Negative actual output → Error
- ❌ Complete without actual output → Error
- ❌ Edit completed run → Edit button hidden
- ❌ Delete completed run → Delete button hidden

---

## API Endpoint Testing (Postman/cURL)

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

# Create recipe
POST http://localhost:3000/api/recipes
{
  "product_id": 1,
  "product_sku_id": 1,
  "name": "Test Recipe",
  "batch_size": 10,
  "unit": "kg",
  "items": [...]
}

# Get recipe by ID
GET http://localhost:3000/api/recipes/:id

# Update recipe (creates new version)
PUT http://localhost:3000/api/recipes/:id

# Delete recipe
DELETE http://localhost:3000/api/recipes/:id

# Get recipe versions
GET http://localhost:3000/api/recipes/:id/versions
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
  "production_date": "2025-12-19"
}

# Get production run by ID
GET http://localhost:3000/api/production/:id

# Check material availability
GET http://localhost:3000/api/production/:id/check-materials

# Complete production run
POST http://localhost:3000/api/production/:id/complete
{
  "actual_output": 19.5,
  "waste_quantity": 0.5,
  "notes": "Completed successfully"
}

# Update production run
PUT http://localhost:3000/api/production/:id

# Delete production run
DELETE http://localhost:3000/api/production/:id
```

---

## Test Results Summary

| Module     | Feature           | Status | Notes |
| ---------- | ----------------- | ------ | ----- |
| Products   | Create Product    | ⏳     |       |
| Products   | Add/Edit SKUs     | ⏳     |       |
| Products   | View Stock        | ⏳     |       |
| Products   | Search/Filter     | ⏳     |       |
| Recipes    | Create Recipe     | ⏳     |       |
| Recipes    | BOM Management    | ⏳     |       |
| Recipes    | Versioning        | ⏳     |       |
| Recipes    | Cost Calculation  | ⏳     |       |
| Production | Create Run        | ⏳     |       |
| Production | Material Check    | ⏳     |       |
| Production | FIFO Completion   | ⏳     |       |
| Production | Stock Updates     | ⏳     |       |
| E2E        | Complete Workflow | ⏳     |       |

**Legend:**

- ✅ Pass
- ❌ Fail
- ⏳ Pending
- ⚠️ Warning

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
- [ ] Backend server running
- [ ] Frontend dev server running
- [ ] Test data seeded (suppliers, raw materials, batches)
- [ ] Valid user logged in

### Product Module

- [ ] Create product with auto-code
- [ ] Add multiple SKUs
- [ ] Edit SKU details
- [ ] Delete SKU (with/without stock)
- [ ] View product details
- [ ] Search and filter products
- [ ] Stock summary dialog
- [ ] Low stock alerts

### Recipe Module

- [ ] Create recipe with BOM
- [ ] Add/edit/delete materials
- [ ] Cost calculation accuracy
- [ ] Edit recipe (version creation)
- [ ] View recipe details
- [ ] Version history dialog
- [ ] Search and filter recipes
- [ ] Delete recipe with confirmation

### Production Module

- [ ] Create production run
- [ ] Batch calculation accuracy
- [ ] Material requirements display
- [ ] Material availability check
- [ ] Edit planned production run
- [ ] Complete production (FIFO)
- [ ] View completed run details
- [ ] Stock updates verified
- [ ] Search and filter runs
- [ ] Delete validations

### End-to-End

- [ ] Complete product lifecycle
- [ ] Recipe versioning workflow
- [ ] Low stock workflow
- [ ] Multi-batch FIFO consumption
- [ ] Data consistency across modules

### Error Handling

- [ ] All validation errors work
- [ ] Network error handling
- [ ] Loading states work
- [ ] Toast notifications appear
- [ ] Error messages clear

### Performance

- [ ] Large dataset handling
- [ ] Pagination performance
- [ ] Search/filter speed
- [ ] No memory leaks

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
  code: "RCP-001",
  name: "Garam Masala Recipe",
  expected_yield: 20,
  yield_unit: "kg",
  notes: "Premium blend recipe",
  items: [
    { material_id: 1, quantity: 5, unit: "kg" },
    { material_id: 2, quantity: 4, unit: "kg" },
    { material_id: 3, quantity: 3, unit: "kg" },
    { material_id: 4, quantity: 8, unit: "kg" }
  ]
}
```

### Sample Production Data

```javascript
{
  recipe_id: 1,
  quantity: 40,
  unit: "kg",
  production_date: "2025-12-19",
  status: "planned",
  notes: "Test production run"
}

Completion:
{
  actual_output: 39.5,
  waste_quantity: 0.5,
  notes: "Minor waste during packaging"
}
```

---

## Conclusion

Week 5 testing covers comprehensive validation of Product, Recipe, and Production modules with emphasis on:

- ✅ Auto-code generation
- ✅ SKU management
- ✅ BOM builder functionality
- ✅ Recipe versioning
- ✅ FIFO batch consumption
- ✅ Stock management
- ✅ Cost calculations

All tests should pass before proceeding to Week 6 (Sales & Invoicing).

**Testing Duration:** Estimated 3-4 hours for complete testing  
**Last Updated:** December 19, 2025
