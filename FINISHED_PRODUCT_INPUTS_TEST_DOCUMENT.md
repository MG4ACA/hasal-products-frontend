# Finished Product Inputs — Test Document

**Feature:** Allow finished products (previously produced SKUs) to be used as ingredients in production run recipes, in addition to existing raw materials.  
**Date:** May 4, 2026  
**Author:** Development Team  
**Status:** Implementation Complete — Ready for Testing

---

## 1. Feature Overview

Previously, recipe Bill of Materials (BOM) only accepted raw materials as ingredients. This feature adds support for a second ingredient type: **finished products** (i.e. a product SKU that was already produced in a prior production run).

### What changed

| Layer        | File                      | Change                                                                                                        |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Database     | `recipe_items`            | Added `material_type` ENUM, `product_sku_id` FK, `unit_cost`; `material_id` now nullable                      |
| Database     | `production_materials`    | Added `material_type` ENUM, `product_sku_id` FK, `product_output_id` FK, `unit_cost`; `batch_id` now nullable |
| Model        | `RecipeItem.js`           | New fields mapped                                                                                             |
| Model        | `ProductionMaterial.js`   | New fields mapped                                                                                             |
| Associations | `models/index.js`         | `RecipeItem → ProductSku`, `ProductionMaterial → ProductSku`, `ProductionMaterial → ProductionOutput`         |
| Backend      | `recipeController.js`     | `createRecipeItems()` helper; full includes for both types                                                    |
| Backend      | `productionController.js` | `startProductionRun` FIFO deduction for finished products; `getProductionRunById` uses full includes          |
| Frontend     | `RecipeForm.vue`          | Material type toggle, product autocomplete, SKU dropdown, `getIngredientName()`                               |
| Frontend     | `ProductionRunForm.vue`   | Ingredient column shows product tag for finished product items                                                |

### Business logic

- **Recipe level:** Each BOM item has a `material_type` of either `raw_material` or `finished_product`.
- **Start production:** When a run starts, finished product ingredients are consumed FIFO from `production_output` rows (oldest `id` first). Raw material FIFO logic is unchanged.
- **Stock deduction:** `product_skus.current_stock` is decremented for each finished product ingredient consumed.
- **Cost:** `unit_cost` on finished product BOM items defaults to `product_skus.price` if not specified. Raw material cost continues to use batch average cost.
- **Atomicity:** All deductions are wrapped in a single DB transaction — if anything fails, all changes roll back.

---

## 2. Test Environment

### Backend server

```
cd hasal-pos-backend
node server.js
```

Default port: `3000`  
Base URL: `http://localhost:3000/api`

### Frontend

```
npm run dev
```

Default URL: `http://localhost:5173`

### Database — useful reference data

| Table               | Key records                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| `product_skus`      | id=2 (Chili Powder, stock=17, price=100), id=25 (Turmeric Powder, stock=30), id=86 (Jujubes, stock=10) |
| `production_output` | id=1 (sku_id=2, qty=39), id=3 (sku_id=2, qty=10), id=4 (sku_id=86, qty=10), id=6 (sku_id=25, qty=10)   |
| `raw_materials`     | id=2 (Chili Powder), id=3 (Black Pepper), id=4 (Cinnamon)                                              |
| `recipes`           | id=1 (chilli powder), id=11 & 12 have mixed BOM (raw + finished product)                               |

> **Note:** Amounts above reflect DB state at time of writing. Always run the verification queries in Section 6 to get current values before testing.

### Authentication

All API calls require a JWT token:

```
POST /api/auth/login
Body: { "email": "<your email>", "password": "<your password>" }
```

Use the returned token as `Authorization: Bearer <token>` in subsequent requests.

---

## 3. Test Cases

### SECTION A — Recipe Management (UI)

---

#### TC-R01 — Create recipe: raw materials only (regression)

**Priority:** High  
**Purpose:** Confirm existing raw-material-only recipes are not broken.

**Steps:**

1. Navigate to **Recipes → New Recipe**
2. Fill in Name, Code, Output Product, Output SKU, Output Quantity
3. Click **Add Ingredient**
4. Leave type as **Raw Material**, select any raw material (e.g. Black Pepper), set quantity
5. Click Save on the BOM dialog
6. Click **Save Recipe**

**Expected result:**

- Recipe saves with `201` / success toast
- BOM row shows the raw material name — no coloured tag
- DB: `recipe_items` row has `material_type = 'raw_material'`, `material_id` populated, `product_sku_id = NULL`, `unit_cost = NULL`

**DB verification:**

```sql
SELECT * FROM recipe_items WHERE recipe_id = <new recipe id>;
```

---

#### TC-R02 — Create recipe: finished product ingredient

**Priority:** Critical

**Steps:**

1. **Recipes → New Recipe**, fill header fields
2. Click **Add Ingredient**
3. Toggle material type from **Raw Material** → **Finished Product**
4. In the product autocomplete, type `Chili`
5. Select **Chili Powder** from the dropdown
6. SKU dropdown populates — select SKU id=2
7. Set quantity = `2`, unit_cost = `120`
8. Click Save on BOM dialog
9. Click **Save Recipe**

**Expected result:**

- Recipe saved
- BOM row displays blue **"Product"** tag + "Chili Powder"
- DB: `material_type = 'finished_product'`, `product_sku_id = 2`, `material_id = NULL`, `unit_cost = 120.00`

**DB verification:**

```sql
SELECT id, material_type, material_id, product_sku_id, quantity, unit_cost
FROM recipe_items WHERE recipe_id = <new recipe id>;
```

---

#### TC-R03 — Create recipe: mixed BOM (raw material + finished product)

**Priority:** Critical

**Steps:**

1. **Recipes → New Recipe**, fill header fields
2. Add one raw material BOM item (e.g. Black Pepper, qty=5, unit=kg)
3. Add one finished product BOM item (Chili Powder SKU id=2, qty=1, unit_cost=100)
4. Save recipe

**Expected result:**

- Both rows visible in BOM table
- Total estimated cost = (batch avg cost of Black Pepper × 5) + (100 × 1)
- DB has two `recipe_items` rows — one per `material_type`

---

#### TC-R04 — Edit recipe: modify finished product ingredient

**Priority:** High

**Steps:**

1. Open the recipe created in TC-R03
2. Click the edit (pencil) icon on the finished product BOM row
3. Change quantity from 1 → 3
4. Click Save on dialog
5. Click **Save Recipe**

**Expected result:**

- BOM row updated to qty=3
- DB `recipe_items` row reflects `quantity = 3.00`

---

#### TC-R05 — BOM dialog validation: no SKU selected

**Priority:** Medium

**Steps:**

1. In BOM dialog, toggle to **Finished Product**
2. Select a product in autocomplete but do NOT select a SKU
3. Click Save

**Expected result:**

- Dialog stays open
- Validation error message shown near SKU field

---

#### TC-R06 — BOM dialog validation: no product selected

**Priority:** Medium

**Steps:**

1. Toggle to Finished Product, leave autocomplete empty, click Save

**Expected result:**

- Validation error shown, dialog does not close

---

### SECTION B — Production Run (UI)

---

#### TC-P01 — Create production run with mixed-BOM recipe

**Priority:** Critical

**Steps:**

1. Navigate to **Production → New Run**
2. Select the mixed-BOM recipe from TC-R03
3. Fill in planned date, notes
4. Save

**Expected result:**

- Production run created with status **planned**
- Materials preview table shows both ingredient types
- Finished product row shows blue **"Product"** tag
- Raw material row shows no tag

---

#### TC-P02 — Start production run: happy path

**Priority:** Critical  
**Pre-condition:** Chili Powder SKU id=2 has `current_stock ≥ recipe quantity`. Production output rows id=1 (qty=39) and id=3 (qty=10) exist.

**Before starting, record these values:**

```sql
SELECT id, quantity_produced FROM production_output WHERE sku_id = 2 ORDER BY id;
SELECT current_stock FROM product_skus WHERE id = 2;
```

**Steps:**

1. Open the planned production run from TC-P01
2. Click **Start Production**
3. Confirm

**Expected result:**

- Run status → **in_progress**
- Success toast
- DB: `production_materials` rows created; finished product row has `product_output_id = 1` (oldest batch first — FIFO), `material_type = 'finished_product'`
- DB: `production_output` id=1 `quantity_produced` reduced by the recipe quantity
- DB: `product_skus` id=2 `current_stock` reduced by the recipe quantity

**DB verification:**

```sql
-- Check production materials
SELECT * FROM production_materials WHERE production_run_id = <run id>;

-- Check FIFO: oldest batch (id=1) should be reduced first
SELECT id, quantity_produced FROM production_output WHERE sku_id = 2 ORDER BY id;

-- Check stock deducted
SELECT current_stock FROM product_skus WHERE id = 2;
```

---

#### TC-P03 — Start production run: insufficient stock

**Priority:** High  
**Pre-condition:** Create a recipe requiring 999 units of Chili Powder SKU. Create a production run with it.

**Steps:**

1. Start the production run

**Expected result:**

- Error toast / error message — not enough stock
- Run status remains **planned**
- DB: no new `production_materials` rows, `current_stock` unchanged, `production_output` quantities unchanged (full rollback)

**DB verification:**

```sql
SELECT COUNT(*) FROM production_materials WHERE production_run_id = <run id>;
SELECT current_stock FROM product_skus WHERE id = 2;
```

---

#### TC-P04 — Complete production run

**Priority:** High  
**Pre-condition:** Run from TC-P02 is `in_progress`

**Steps:**

1. Open the in-progress run
2. Click **Complete Production**
3. Enter actual quantity produced

**Expected result:**

- Run status → **completed**
- New `production_output` row created for the output SKU
- Output SKU `current_stock` incremented

---

### SECTION C — Backend API

> All requests use `Authorization: Bearer <token>` header.

---

#### TC-API-01 — POST recipe with finished product item

```
POST /api/recipes
Content-Type: application/json

{
  "name": "API Test Mixed Recipe",
  "code": "ATM-001",
  "product_id": 1,
  "sku_id": 5,
  "output_quantity": 10,
  "output_unit": "kg",
  "items": [
    {
      "material_type": "raw_material",
      "material_id": 3,
      "quantity": 5,
      "unit": "kg"
    },
    {
      "material_type": "finished_product",
      "product_sku_id": 2,
      "quantity": 2,
      "unit": "pcs",
      "unit_cost": 100.00
    }
  ]
}
```

**Expected:** `201` — recipe object returned, `items` array contains both entries with correct `material_type` values.

---

#### TC-API-02 — GET recipe: verify nested includes

```
GET /api/recipes/<id from TC-API-01>
```

**Expected response includes:**

```json
{
  "items": [
    {
      "material_type": "raw_material",
      "material": { "id": 3, "name": "Black Pepper" },
      "productSku": null
    },
    {
      "material_type": "finished_product",
      "material": null,
      "productSku": {
        "id": 2,
        "product": { "name": "Chili Powder" }
      }
    }
  ]
}
```

---

#### TC-API-03 — POST start production run

```
POST /api/production/<run_id>/start
```

**Expected:** `200` response with full production run object  
**Response `materials` array** should contain:

- Raw material entries with `batch` → `material` nested
- Finished product entries with `productSku` → `product` and `productOutput` nested
- Each finished product entry has `material_type: "finished_product"`, `product_output_id` set, `batch_id: null`

---

#### TC-API-04 — POST start: insufficient stock error

Create a run requiring more finished product than available, then:

```
POST /api/production/<run_id>/start
```

**Expected:** `400` or `422` error response with descriptive message. No DB side effects.

---

#### TC-API-05 — GET production run: verify full includes

```
GET /api/production/<run_id>
```

Where the run has been started with mixed BOM.

**Expected:**

```json
{
  "materials": [
    {
      "material_type": "raw_material",
      "batch": { "id": ..., "material": { "name": "..." } },
      "productSku": null,
      "productOutput": null
    },
    {
      "material_type": "finished_product",
      "batch": null,
      "productSku": { "id": 2, "product": { "name": "Chili Powder" } },
      "productOutput": { "id": 1, "batch_number": "FG-PROD0005-20260221-001" }
    }
  ]
}
```

---

### SECTION D — Database Verification

These queries should be run directly against the MySQL database after each major test.

---

#### TC-DB-01 — Verify migration applied correctly

```sql
DESCRIBE recipe_items;
```

**Expected columns include:** `material_type` enum('raw_material','finished_product'), `product_sku_id` int nullable, `unit_cost` decimal(10,2) nullable

```sql
DESCRIBE production_materials;
```

**Expected columns include:** `material_type` enum, `product_sku_id` int nullable, `product_output_id` int nullable, `unit_cost` decimal(10,2) nullable

---

#### TC-DB-02 — Verify recipe_items stored correctly

```sql
SELECT id, recipe_id, material_type, material_id, product_sku_id, quantity, unit_cost
FROM recipe_items
WHERE recipe_id = <test recipe id>
ORDER BY id;
```

**Expected:**

- Raw material rows: `material_type='raw_material'`, `material_id` set, `product_sku_id=NULL`
- Finished product rows: `material_type='finished_product'`, `product_sku_id` set, `material_id=NULL`

---

#### TC-DB-03 — Verify FIFO deduction order

Run this before and after starting a production run that uses Chili Powder (SKU id=2) as a finished product ingredient:

```sql
-- Before start
SELECT id, sku_id, quantity_produced FROM production_output
WHERE sku_id = 2 ORDER BY id ASC;
-- id=1: qty=39, id=3: qty=10

-- After start (recipe qty=2)
-- Expected: id=1 reduced to 37, id=3 unchanged
SELECT id, sku_id, quantity_produced FROM production_output
WHERE sku_id = 2 ORDER BY id ASC;
```

---

#### TC-DB-04 — Verify current_stock decremented

```sql
-- Before
SELECT current_stock FROM product_skus WHERE id = 2;

-- [Start production run using 2 units of SKU id=2]

-- After: should be reduced by 2
SELECT current_stock FROM product_skus WHERE id = 2;
```

---

#### TC-DB-05 — Verify production_materials record

```sql
SELECT
  pm.id,
  pm.material_type,
  pm.batch_id,
  pm.product_sku_id,
  pm.product_output_id,
  pm.quantity_used,
  pm.unit_cost
FROM production_materials pm
WHERE pm.production_run_id = <run id>;
```

**Expected for finished product row:**

- `batch_id = NULL`
- `product_sku_id = 2`
- `product_output_id = 1` (oldest batch)
- `unit_cost` = value from recipe item

---

#### TC-DB-06 — Verify atomicity (rollback on failure)

1. Create recipe requiring 999 units of Chili Powder (SKU id=2) — more than available
2. Start the production run
3. Verify no partial writes occurred:

```sql
-- No production_materials rows for this run
SELECT COUNT(*) FROM production_materials WHERE production_run_id = <run id>;

-- current_stock unchanged
SELECT current_stock FROM product_skus WHERE id = 2;

-- production_output unchanged
SELECT quantity_produced FROM production_output WHERE sku_id = 2 ORDER BY id;
```

All values must be identical to before the start attempt.

---

### SECTION E — Edge Cases

---

#### TC-E01 — Finished product qty exactly equals available stock

**Setup:** Create recipe requiring exactly 17 units of SKU id=2 (current_stock=17)  
**Steps:** Start the run  
**Expected:** Succeeds, `product_skus.current_stock = 0` after start

---

#### TC-E02 — FIFO spans two production_output batches

**Setup:** Create recipe requiring 45 units of Chili Powder SKU (id=2). Current batches: id=1 (qty=39), id=3 (qty=10) — total=49.  
**Steps:** Start the run  
**Expected:**

- `production_output` id=1: `quantity_produced = 0` (fully consumed)
- `production_output` id=3: `quantity_produced = 4` (39+10-45=4 remaining)
- Two `production_materials` rows created — one per batch consumed

```sql
SELECT id, quantity_produced FROM production_output WHERE sku_id = 2 ORDER BY id;
SELECT * FROM production_materials WHERE production_run_id = <run id> AND material_type = 'finished_product';
```

---

#### TC-E03 — No production_output rows exist for the ingredient SKU

**Setup:** Add a finished product ingredient whose SKU has `current_stock > 0` but zero `production_output` rows with `quantity_produced > 0`  
**Steps:** Start the run  
**Expected:** Error response — cannot start, no batches available

---

#### TC-E04 — unit_cost explicitly set to 0

**Setup:** Add finished product BOM item with `unit_cost = 0`  
**Expected:** Stored as `0.00`, not overridden by SKU price

```sql
SELECT unit_cost FROM recipe_items WHERE recipe_id = <id> AND material_type = 'finished_product';
-- Expected: 0.00
```

---

#### TC-E05 — unit_cost left blank (null)

**Setup:** Add finished product BOM item without entering unit_cost  
**Expected:** `unit_cost = NULL` in DB; recipe cost display falls back to `product_skus.price`

---

#### TC-E06 — Mixed-BOM recipe version history

**Steps:**

1. Save a recipe with mixed BOM
2. Edit and change a quantity
3. Check `GET /api/recipes/<id>/versions`

**Expected:** Both versions returned, each with correct BOM items and `material_type` values

---

## 4. Test Execution Checklist

Run tests in this order to ensure proper data dependencies:

```
[ ] TC-DB-01   Verify migration schema
[ ] TC-R01     Create raw-material-only recipe (regression)
[ ] TC-R02     Create recipe with finished product ingredient
[ ] TC-R03     Create mixed-BOM recipe
[ ] TC-R04     Edit finished product ingredient
[ ] TC-R05     BOM validation: no SKU
[ ] TC-R06     BOM validation: no product
[ ] TC-API-01  POST recipe via API
[ ] TC-API-02  GET recipe verify includes
[ ] TC-DB-02   Verify recipe_items in DB
[ ] TC-P01     Create production run with mixed recipe
[ ] TC-P02     Start production run (happy path)
[ ] TC-DB-03   Verify FIFO order
[ ] TC-DB-04   Verify current_stock deducted
[ ] TC-DB-05   Verify production_materials record
[ ] TC-API-03  POST start run via API
[ ] TC-API-05  GET production run via API
[ ] TC-P03     Start run with insufficient stock
[ ] TC-DB-06   Verify rollback
[ ] TC-API-04  POST start: insufficient stock API error
[ ] TC-P04     Complete production run
[ ] TC-E01     Exact stock consumption
[ ] TC-E02     FIFO spans two batches
[ ] TC-E03     No production_output rows
[ ] TC-E04     unit_cost = 0
[ ] TC-E05     unit_cost = null
[ ] TC-E06     Mixed BOM version history
```

---

## 5. Pass/Fail Summary Sheet

| Test Case | Description                      | Pass / Fail | Notes |
| --------- | -------------------------------- | ----------- | ----- |
| TC-DB-01  | Migration schema correct         |             |       |
| TC-R01    | Raw material recipe (regression) |             |       |
| TC-R02    | Recipe with finished product     |             |       |
| TC-R03    | Mixed BOM recipe                 |             |       |
| TC-R04    | Edit finished product item       |             |       |
| TC-R05    | BOM validation: no SKU           |             |       |
| TC-R06    | BOM validation: no product       |             |       |
| TC-API-01 | POST recipe                      |             |       |
| TC-API-02 | GET recipe includes              |             |       |
| TC-DB-02  | recipe_items DB verify           |             |       |
| TC-P01    | Create production run            |             |       |
| TC-P02    | Start run — happy path           |             |       |
| TC-DB-03  | FIFO deduction order             |             |       |
| TC-DB-04  | current_stock deducted           |             |       |
| TC-DB-05  | production_materials record      |             |       |
| TC-API-03 | POST start run                   |             |       |
| TC-API-05 | GET run includes                 |             |       |
| TC-P03    | Start run — insufficient stock   |             |       |
| TC-DB-06  | Rollback verified                |             |       |
| TC-API-04 | API error on insufficient stock  |             |       |
| TC-P04    | Complete production run          |             |       |
| TC-E01    | Exact stock consumption          |             |       |
| TC-E02    | FIFO spans two batches           |             |       |
| TC-E03    | No production_output rows        |             |       |
| TC-E04    | unit_cost = 0                    |             |       |
| TC-E05    | unit_cost = null                 |             |       |
| TC-E06    | Version history mixed BOM        |             |       |

---

## 6. Quick Reference SQL Queries

```sql
-- Current stock snapshot for test SKUs
SELECT id, current_stock, price FROM product_skus WHERE id IN (2, 25, 86);

-- Production output batches for Chili Powder (SKU 2)
SELECT id, quantity_produced, batch_number FROM production_output WHERE sku_id = 2 ORDER BY id;

-- All recipe items for a recipe
SELECT id, material_type, material_id, product_sku_id, quantity, unit_cost
FROM recipe_items WHERE recipe_id = <id> ORDER BY id;

-- All production materials for a run
SELECT id, material_type, batch_id, product_sku_id, product_output_id, quantity_used, unit_cost
FROM production_materials WHERE production_run_id = <id>;

-- Check SequelizeMeta (migration tracking)
SELECT name FROM SequelizeMeta ORDER BY name;

-- Rollback check: confirm no partial writes
SELECT COUNT(*) as material_count FROM production_materials WHERE production_run_id = <id>;
```
