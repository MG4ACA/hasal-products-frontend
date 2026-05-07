# Finished Product Inputs & Production SKU Features — Test Document

**Features covered:**

1. Allow finished products (previously produced SKUs) to be used as ingredients in recipes
2. Loose / Bulk SKU support (`is_loose` flag on `product_skus`)
3. Recipe `product_sku_id` made optional (recipe no longer requires a default output SKU)
4. BOM unit conversion cost fix (g, mg, mL → base unit)
5. BOM duplicate row merging on re-add
6. Multi-SKU output at production run completion

**Date:** May 6, 2026  
**Author:** Development Team  
**Status:** Implementation Complete — Ready for Testing

---

## 1. Feature Overview

Previously, recipe Bill of Materials (BOM) only accepted raw materials as ingredients. This feature adds support for a second ingredient type: **finished products** (i.e. a product SKU that was already produced in a prior production run).

### What changed

| Layer        | File                           | Change                                                                                                        |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Database     | `recipe_items`                 | Added `material_type` ENUM, `product_sku_id` FK, `unit_cost`; `material_id` now nullable                      |
| Database     | `production_materials`         | Added `material_type` ENUM, `product_sku_id` FK, `product_output_id` FK, `unit_cost`; `batch_id` now nullable |
| Database     | `product_skus`                 | Added `is_loose BOOLEAN NOT NULL DEFAULT FALSE`; `size` now nullable                                          |
| Database     | `recipes.product_sku_id`       | Now nullable — default output SKU is optional                                                                 |
| Model        | `RecipeItem.js`                | New fields mapped                                                                                             |
| Model        | `ProductionMaterial.js`        | New fields mapped                                                                                             |
| Model        | `ProductSku.js`                | `is_loose` field added; `size` made nullable                                                                  |
| Associations | `models/index.js`              | `RecipeItem → ProductSku`, `ProductionMaterial → ProductSku`, `ProductionMaterial → ProductionOutput`         |
| Backend      | `recipeController.js`          | `createRecipeItems()` helper; `product_sku_id` optional; full includes for both types                         |
| Backend      | `productController.js`         | `createLooseSku` handler: `POST /api/products/:id/loose-sku`                                                  |
| Backend      | `productRoutes.js`             | Route: `POST /:id/loose-sku` (admin/manager only)                                                             |
| Backend      | `productionController.js`      | `startProductionRun` FIFO for finished products; `completeProductionRun` multi-output loop                    |
| Frontend     | `RecipeForm.vue`               | Material type toggle; product autocomplete; BOM unit conversion; duplicate row merging; SKU optional          |
| Frontend     | `ProductForm.vue`              | "Add Loose SKU" button + dialog; "Loose" badge in SKU table                                                   |
| Frontend     | `CompleteProductionDialog.vue` | Dynamic output table; per-SKU quantity rows; auto-calculated waste                                            |
| Frontend     | `ProductionRunForm.vue`        | Ingredient column shows product tag for finished product items                                                |

### Business logic

- **Recipe level:** Each BOM item has a `material_type` of either `raw_material` or `finished_product`.
- **Recipe SKU:** `product_sku_id` on a recipe is now optional. If omitted, the completion dialog will not pre-fill a default SKU — the user picks output SKUs at completion time.
- **Start production:** When a run starts, finished product ingredients are consumed FIFO from `production_output` rows (oldest `id` first). Raw material FIFO logic is unchanged.
- **Stock deduction:** `product_skus.current_stock` is decremented for each finished product ingredient consumed.
- **Cost:** `unit_cost` on finished product BOM items defaults to `product_skus.price` if not specified. Raw material cost continues to use batch average cost.
- **BOM unit conversion:** All ingredient quantities are converted to a base unit before cost calculation (e.g. `g → kg`, `mL → L`). `average_cost` is stored per base unit (Rs/kg or Rs/L).
- **BOM duplicate merging:** Adding the same ingredient twice (same `raw_material_id` + `unit`, or same `product_sku_id`) merges quantities instead of creating a duplicate row.
- **Loose SKU:** A product may have at most one loose SKU (`is_loose = true`). It has no fixed size; its `size` field is `null`. It is valid as a production output target.
- **Complete production — multi-output:** The `outputs` array in the request body specifies one or more `{ sku_id, quantity }` pairs. Each receives a separate `production_output` row and a weighted-average cost update. Waste is auto-calculated as `expected_quantity − sum(output quantities)`. Waste cost is assigned to the first output row.
- **Fallback:** If `outputs` is empty and the recipe has a `product_sku_id`, a single-output is inferred from it (backward compatibility).
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

#### TC-P04 — Complete production run: single output (backward compat)

**Priority:** High  
**Pre-condition:** Run from TC-P02 is `in_progress`. Recipe has a default `product_sku_id`.

**Steps:**

1. Open the in-progress run
2. Click **Complete Production**
3. Dialog opens — the output table should be pre-filled with one row: the recipe's default SKU + `expected_quantity`
4. Leave the row as-is, click **Complete Production**

**Expected result:**

- Run status → **completed**
- One new `production_output` row created for the default SKU
- Output SKU `current_stock` incremented
- `production_runs.actual_quantity` = the output quantity
- `production_runs.yield_efficiency` = `actual / expected × 100`
- `production_runs.waste_quantity` = 0 (since no waste)

**DB verification:**

```sql
SELECT status, actual_quantity, waste_quantity, yield_efficiency FROM production_runs WHERE id = <run id>;
SELECT * FROM production_output WHERE production_run_id = <run id>;
SELECT current_stock, average_cost FROM product_skus WHERE id = <output sku id>;
```

---

#### TC-P05 — Complete production run: no outputs provided, no fallback SKU

**Priority:** High  
**Pre-condition:** Create a recipe with no `product_sku_id` (leave SKU field blank when saving recipe). Create and start a production run with it.

**Steps:**

1. Open the dialog, clear all output rows (or submit with empty outputs array via API)
2. Click **Complete Production**

**Expected result:**

- Error: "At least one output SKU is required for production output"
- Run remains `in_progress`

---

### SECTION F — Loose SKU (UI + API)

---

#### TC-LS01 — Add Loose SKU via UI

**Priority:** Critical

**Steps:**

1. Navigate to **Products → Edit** any product that has no loose SKU
2. In the SKUs section, confirm "Add Loose SKU" button is visible
3. Click **Add Loose SKU**
4. Dialog opens — enter unit `kg`
5. Click **Create Loose SKU**

**Expected result:**

- Success toast
- SKU table refreshes; new row appears with a **"Loose"** blue badge in the Size column instead of a size value
- "Add Loose SKU" button disappears (only one loose SKU allowed per product)
- DB: `product_skus` row has `is_loose = 1`, `size = NULL`, `unit = 'kg'`, `price = 0`, `current_stock = 0`

**DB verification:**

```sql
SELECT id, product_id, size, unit, is_loose, price, current_stock
FROM product_skus WHERE product_id = <product id> AND is_loose = 1;
```

---

#### TC-LS02 — Add Loose SKU: unit required validation

**Priority:** Medium

**Steps:**

1. Open a product, click **Add Loose SKU**
2. Leave unit blank, click **Create Loose SKU**

**Expected result:**

- Error toast: "Unit is required for a loose SKU"
- Dialog stays open, no DB write

---

#### TC-LS03 — Prevent duplicate loose SKU

**Priority:** High  
**Pre-condition:** Product already has a loose SKU (from TC-LS01).

**Steps:**

1. The "Add Loose SKU" button should be **hidden** in the UI (it only shows when `!hasLooseSku`)
2. As a backup test, call API directly:

```
POST /api/products/<product id>/loose-sku
Body: { "unit": "L" }
```

**Expected result:**

- API returns `400`: "A loose SKU already exists for this product"
- No new row in `product_skus`

---

#### TC-LS04 — Loose SKU visible in CompleteProductionDialog

**Priority:** High  
**Pre-condition:** Product has a loose SKU. A production run for this product is `in_progress`.

**Steps:**

1. Open **Complete Production** dialog for the run
2. Click the SKU dropdown in the output table

**Expected result:**

- The loose SKU appears as **"Loose / Bulk (kg)"** in the dropdown
- Regular SKUs appear as `<size> <unit>` (e.g. "100 g")

---

#### TC-LS05 — Use Loose SKU as production output

**Priority:** Critical  
**Pre-condition:** Product has a loose SKU with `is_loose = true`. A production run is `in_progress`.

**Steps:**

1. Open **Complete Production** dialog
2. In the output row, select the loose SKU from the dropdown
3. Enter quantity `5.00`
4. Click **Complete Production**

**Expected result:**

- Run completes successfully
- `production_output` row created with `sku_id` = loose SKU id, `quantity_produced = 5`
- Loose SKU `current_stock` = 5, `average_cost` updated

**DB verification:**

```sql
SELECT id, sku_id, quantity_produced, unit_cost FROM production_output
WHERE production_run_id = <run id>;

SELECT id, is_loose, current_stock, average_cost FROM product_skus WHERE id = <loose sku id>;
```

---

#### TC-LS06 — POST /api/products/:id/loose-sku — API test

```
POST /api/products/<product_id>/loose-sku
Content-Type: application/json
Authorization: Bearer <token>

{ "unit": "L" }
```

**Expected `201` response:**

```json
{
  "success": true,
  "data": {
    "id": <new id>,
    "product_id": <product_id>,
    "size": null,
    "unit": "L",
    "is_loose": true,
    "price": 0,
    "current_stock": 0,
    "status": "active"
  }
}
```

---

### SECTION G — Recipe Optional SKU

---

#### TC-RS01 — Create recipe without a default output SKU

**Priority:** Critical

**Steps:**

1. Navigate to **Recipes → New Recipe**
2. Fill in Name, Code, Output Product, Expected Yield, Yield Unit
3. Leave **SKU (Optional)** field blank
4. Add at least one BOM ingredient
5. Click **Save Recipe**

**Expected result:**

- Recipe saves successfully (no validation error for missing SKU)
- DB: `recipes.product_sku_id = NULL`

**DB verification:**

```sql
SELECT id, name, product_id, product_sku_id FROM recipes WHERE id = <new recipe id>;
-- product_sku_id must be NULL
```

---

#### TC-RS02 — Complete production run with no-SKU recipe

**Priority:** Critical  
**Pre-condition:** Recipe from TC-RS01; production run created and started with it.

**Steps:**

1. Open **Complete Production** dialog
2. The output table should have an empty row (no pre-fill since recipe has no default SKU)
3. Click the SKU dropdown and select a SKU manually
4. Enter quantity, click **Complete Production**

**Expected result:**

- Run completes; output recorded for the manually selected SKU

---

#### TC-RS03 — Edit existing recipe: clear the default SKU

**Priority:** Medium

**Steps:**

1. Open a recipe that currently has `product_sku_id` set
2. Clear the SKU field (set to empty/optional)
3. Save

**Expected result:**

- Recipe saved; `product_sku_id = NULL` in DB
- No error

---

### SECTION H — BOM Unit Conversion & Duplicate Merging

---

#### TC-BOM01 — Cost calculation with sub-unit ingredient (g)

**Priority:** Critical  
**Purpose:** Verify that recipe estimated cost is correct when a raw material is entered in `g` but `average_cost` is stored as Rs/kg.

**Setup:**

- Raw material: Chili Powder, `average_cost = 500` (Rs/kg)
- BOM item: 250 g of Chili Powder

**Steps:**

1. Create a recipe with above ingredient
2. Observe the estimated cost for that BOM row in the dialog
3. Observe the total estimated cost

**Expected result:**

- BOM row cost = `500 × 0.250 = Rs 125.00` (not `500 × 250 = Rs 125,000`)
- Total estimated cost reflects the correctly scaled value

---

#### TC-BOM02 — Cost calculation with mL ingredient

**Priority:** High  
**Setup:** Raw material with `average_cost = 200` (Rs/L); BOM item: 500 mL

**Expected result:**

- Cost = `200 × 0.500 = Rs 100.00`

---

#### TC-BOM03 — Duplicate BOM row merging: raw material

**Priority:** High

**Steps:**

1. In BOM dialog, add: Black Pepper, qty=2, unit=kg → Save
2. In BOM dialog again, add: Black Pepper, qty=3, unit=kg → Save (same material, same unit)
3. Check the BOM table

**Expected result:**

- Only **one** row for Black Pepper, quantity = **5 kg** (merged, not two separate rows)
- No duplicate row created

---

#### TC-BOM04 — No merge for same material different unit

**Priority:** Medium

**Steps:**

1. Add: Black Pepper, qty=1, unit=kg → Save
2. Add: Black Pepper, qty=500, unit=g → Save (same material, different unit)

**Expected result:**

- **Two separate rows** — one for kg, one for g (different units are not merged)

---

#### TC-BOM05 — Duplicate BOM row merging: finished product

**Priority:** High

**Steps:**

1. Add finished product BOM item: Chili Powder SKU id=2, qty=3 → Save
2. Add same: Chili Powder SKU id=2, qty=2 → Save again (not in edit mode)

**Expected result:**

- Only one row, quantity = 5

---

### SECTION I — Multi-SKU Production Output

---

#### TC-MO01 — Complete production run: split output across two SKUs

**Priority:** Critical  
**Pre-condition:** A production run is `in_progress`. The product has two active SKUs (e.g. 100g pack and 500g pack).

**Steps:**

1. Open **Complete Production** dialog
2. Default row is pre-filled — change its quantity to `3`
3. Click **Add Output Row**
4. Select the second SKU, enter quantity `7`
5. Click **Complete Production**

**Expected result:**

- Two `production_output` rows created — one per SKU
- Each gets its own `batch_number`
- SKU 1 `current_stock` increases by 3; SKU 2 by 7
- `production_runs.actual_quantity = 10`
- Waste = `expected_quantity − 10` (auto-calculated)
- First output row carries all `waste_cost`; second has `waste_cost = 0.00`

**DB verification:**

```sql
SELECT sku_id, quantity_produced, unit_cost, total_cost, waste_cost, batch_number
FROM production_output WHERE production_run_id = <run id>;

SELECT id, current_stock, average_cost FROM product_skus WHERE id IN (<sku1 id>, <sku2 id>);

SELECT actual_quantity, waste_quantity, yield_efficiency, status
FROM production_runs WHERE id = <run id>;
```

---

#### TC-MO02 — Complete production run: output + loose SKU

**Priority:** High  
**Pre-condition:** Product has both a regular SKU and a loose SKU.

**Steps:**

1. Open **Complete Production** dialog
2. Row 1: regular SKU, qty=8
3. Add Row 2: loose SKU ("Loose / Bulk"), qty=2
4. Click **Complete Production**

**Expected result:**

- Regular SKU stock +8, loose SKU stock +2
- Waste = `expected − 10`

---

#### TC-MO03 — Validation: output row with no SKU selected

**Priority:** High

**Steps:**

1. In dialog, click **Add Output Row**
2. Leave SKU blank, enter qty=5
3. Click **Complete Production**

**Expected result:**

- Error: "All output rows must have a SKU selected and quantity > 0"
- Run NOT completed

---

#### TC-MO04 — Validation: output row with quantity = 0

**Priority:** Medium

**Steps:**

1. In dialog, pre-filled row has `quantity = 0` (or user clears it)
2. Click **Complete Production**

**Expected result:**

- Error toast — run not completed

---

#### TC-MO05 — Waste auto-calculation in dialog

**Priority:** High  
**Pre-condition:** `expected_quantity = 10`

**Steps:**

1. Open dialog; enter output qty = 8 in the single row
2. Observe "Waste / Loss" read-only field

**Expected result:**

- Waste field shows `2.00` automatically
- Waste Reason dropdown becomes enabled
- Yield Efficiency indicator shows `80%`

---

#### TC-MO06 — Waste reason required when waste > 0

**Priority:** High

**Steps:**

1. Output qty = 8, expected = 10 (waste = 2)
2. Do NOT select a waste reason
3. Click **Complete Production**

**Expected result:**

- Error: "Please provide a waste reason — there is unaccounted output"
- Run not completed

---

#### TC-MO07 — Complete via API: multi-output

```
POST /api/production-runs/<run_id>/complete
Content-Type: application/json
Authorization: Bearer <token>

{
  "quantity_produced": 10,
  "waste_quantity": 2,
  "waste_reason": "Spillage",
  "production_date": "2026-05-06",
  "notes": "API test multi-output",
  "outputs": [
    { "sku_id": <sku1_id>, "quantity": 6 },
    { "sku_id": <sku2_id>, "quantity": 4 }
  ]
}
```

**Expected `200` response:** completed production run object with `outputs` array containing two rows.

**DB verification:**

```sql
SELECT sku_id, quantity_produced, unit_cost, waste_cost
FROM production_output WHERE production_run_id = <run_id>;
-- Row 1: waste_cost > 0; Row 2: waste_cost = 0.00
```

---

#### TC-MO08 — Complete via API: invalid sku_id in outputs

```json
"outputs": [{ "sku_id": 99999, "quantity": 5 }]
```

**Expected:** `404` — "Product SKU 99999 not found"

---

#### TC-MO09 — Complete via API: missing sku_id in output row

```json
"outputs": [{ "quantity": 5 }]
```

**Expected:** `400` — "Each output must have a sku_id"

---

#### TC-MO10 — Weighted average cost after multi-output

**Priority:** High  
**Purpose:** Confirm `average_cost` is updated correctly for each output SKU.

**Setup (record before completing):**

```sql
SELECT id, current_stock, average_cost FROM product_skus WHERE id IN (<sku1>, <sku2>);
```

Say SKU1: stock=20, avg_cost=100; SKU2: stock=10, avg_cost=200.  
Production material cost = Rs 3000 total. Outputs: SKU1=6 units, SKU2=4 units.  
`adjustedBaseUnitCost = 3000 / (10 + waste)`.

**Expected after completion:**

- SKU1 new avg = `(20×100 + 6×adjustedBaseUnitCost) / 26`
- SKU2 new avg = `(10×200 + 4×adjustedBaseUnitCost) / 14`

Verify with:

```sql
SELECT id, current_stock, average_cost FROM product_skus WHERE id IN (<sku1>, <sku2>);
```

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
[ ] TC-P04     Complete production run: single output (backward compat)
[ ] TC-P05     Complete production run: no outputs, no fallback SKU
[ ] TC-E01     Exact stock consumption
[ ] TC-E02     FIFO spans two batches
[ ] TC-E03     No production_output rows
[ ] TC-E04     unit_cost = 0
[ ] TC-E05     unit_cost = null
[ ] TC-E06     Mixed BOM version history

--- Loose SKU ---
[ ] TC-LS01    Add Loose SKU via UI
[ ] TC-LS02    Loose SKU: unit required validation
[ ] TC-LS03    Prevent duplicate loose SKU
[ ] TC-LS04    Loose SKU visible in CompleteProductionDialog
[ ] TC-LS05    Use Loose SKU as production output
[ ] TC-LS06    POST /api/products/:id/loose-sku API test

--- Optional Recipe SKU ---
[ ] TC-RS01    Create recipe without default output SKU
[ ] TC-RS02    Complete production run with no-SKU recipe
[ ] TC-RS03    Edit existing recipe: clear default SKU

--- BOM Cost & Duplicate Merge ---
[ ] TC-BOM01   Cost calculation with sub-unit (g)
[ ] TC-BOM02   Cost calculation with mL ingredient
[ ] TC-BOM03   No merge for same material different unit
[ ] TC-BOM04   Duplicate BOM row merging: raw material
[ ] TC-BOM05   Duplicate BOM row merging: finished product

--- Multi-Output Production ---
[ ] TC-MO01    Complete production: split output two SKUs
[ ] TC-MO02    Complete production: output + loose SKU
[ ] TC-MO03    Validation: output row no SKU selected
[ ] TC-MO04    Validation: output row quantity = 0
[ ] TC-MO05    Waste auto-calculation in dialog
[ ] TC-MO06    Waste reason required when waste > 0
[ ] TC-MO07    Complete via API: multi-output
[ ] TC-MO08    Complete via API: invalid sku_id
[ ] TC-MO09    Complete via API: missing sku_id in row
[ ] TC-MO10    Weighted average cost after multi-output
```

---

## 5. Pass/Fail Summary Sheet

| Test Case | Description                            | Pass / Fail | Notes |
| --------- | -------------------------------------- | ----------- | ----- |
| TC-DB-01  | Migration schema correct               |             |       |
| TC-R01    | Raw material recipe (regression)       |             |       |
| TC-R02    | Recipe with finished product           |             |       |
| TC-R03    | Mixed BOM recipe                       |             |       |
| TC-R04    | Edit finished product item             |             |       |
| TC-R05    | BOM validation: no SKU                 |             |       |
| TC-R06    | BOM validation: no product             |             |       |
| TC-API-01 | POST recipe                            |             |       |
| TC-API-02 | GET recipe includes                    |             |       |
| TC-DB-02  | recipe_items DB verify                 |             |       |
| TC-P01    | Create production run                  |             |       |
| TC-P02    | Start run — happy path                 |             |       |
| TC-DB-03  | FIFO deduction order                   |             |       |
| TC-DB-04  | current_stock deducted                 |             |       |
| TC-DB-05  | production_materials record            |             |       |
| TC-API-03 | POST start run                         |             |       |
| TC-API-05 | GET run includes                       |             |       |
| TC-P03    | Start run — insufficient stock         |             |       |
| TC-DB-06  | Rollback verified                      |             |       |
| TC-API-04 | API error on insufficient stock        |             |       |
| TC-P04    | Complete production: single output     |             |       |
| TC-P05    | Complete: no outputs, no fallback SKU  |             |       |
| TC-E01    | Exact stock consumption                |             |       |
| TC-E02    | FIFO spans two batches                 |             |       |
| TC-E03    | No production_output rows              |             |       |
| TC-E04    | unit_cost = 0                          |             |       |
| TC-E05    | unit_cost = null                       |             |       |
| TC-E06    | Version history mixed BOM              |             |       |
| TC-LS01   | Add Loose SKU via UI                   |             |       |
| TC-LS02   | Loose SKU: unit required               |             |       |
| TC-LS03   | Prevent duplicate loose SKU            |             |       |
| TC-LS04   | Loose SKU in dialog dropdown           |             |       |
| TC-LS05   | Use Loose SKU as output                |             |       |
| TC-LS06   | POST /api/products/:id/loose-sku       |             |       |
| TC-RS01   | Recipe without SKU                     |             |       |
| TC-RS02   | Complete run with no-SKU recipe        |             |       |
| TC-RS03   | Edit recipe: clear default SKU         |             |       |
| TC-BOM01  | BOM cost: g → kg conversion            |             |       |
| TC-BOM02  | BOM cost: mL → L conversion            |             |       |
| TC-BOM03  | No merge: same material different unit |             |       |
| TC-BOM04  | Duplicate merge: raw material          |             |       |
| TC-BOM05  | Duplicate merge: finished product      |             |       |
| TC-MO01   | Multi-output: two SKUs                 |             |       |
| TC-MO02   | Multi-output: regular + loose SKU      |             |       |
| TC-MO03   | Validation: row missing SKU            |             |       |
| TC-MO04   | Validation: row qty = 0                |             |       |
| TC-MO05   | Waste auto-calculation                 |             |       |
| TC-MO06   | Waste reason required                  |             |       |
| TC-MO07   | API multi-output complete              |             |       |
| TC-MO08   | API: invalid sku_id                    |             |       |
| TC-MO09   | API: missing sku_id in row             |             |       |
| TC-MO10   | Weighted avg cost after multi-output   |             |       |

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

-- Check is_loose column exists
DESCRIBE product_skus;

-- All loose SKUs across products
SELECT id, product_id, unit, is_loose, current_stock, status
FROM product_skus WHERE is_loose = 1;

-- Verify recipe with null product_sku_id
SELECT id, name, product_id, product_sku_id FROM recipes WHERE id = <id>;

-- Multiple production_output rows for a multi-SKU run
SELECT id, sku_id, quantity_produced, batch_number, unit_cost, total_cost, waste_cost
FROM production_output WHERE production_run_id = <id> ORDER BY id;

-- Verify production_run totals after multi-output completion
SELECT actual_quantity, waste_quantity, yield_efficiency, status
FROM production_runs WHERE id = <id>;

-- Verify weighted average cost was updated for each output SKU
SELECT id, current_stock, average_cost FROM product_skus WHERE id IN (<sku1_id>, <sku2_id>);
```

### API reference: complete production with multi-output

```
POST /api/production-runs/<run_id>/complete
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "quantity_produced": 10,
  "waste_quantity": 2,
  "waste_reason": "Spillage",
  "production_date": "2026-05-06",
  "notes": "Multi-output test",
  "outputs": [
    { "sku_id": <sku1_id>, "quantity": 6 },
    { "sku_id": <sku2_id>, "quantity": 4 }
  ]
}
```

### API reference: create loose SKU

```
POST /api/products/<product_id>/loose-sku
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{ "unit": "kg" }
```

**Expected 201 response:**

```json
{
  "success": true,
  "data": {
    "id": <new_id>,
    "product_id": <product_id>,
    "size": null,
    "unit": "kg",
    "is_loose": true,
    "price": 0,
    "current_stock": 0,
    "status": "active"
  }
}
```
