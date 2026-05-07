# Production & SKU Features — Implementation Plan

**Prepared as:** Senior Software Engineer / MVP Product Developer  
**Status:** Ready for review before implementation

---

## Executive Summary

This plan covers 5 interconnected changes:

1. **Loose SKU** — add a bulk/unpackaged stock state per product
2. **Multi-SKU production output** — decide packaging split at run completion
3. **Recipe `product_sku_id` → optional** — decouple recipe from mandatory single output SKU
4. **`expected_yield` audit** — confirm it stays (it is required for BOM scaling)
5. **RecipeForm bugs** — BOM duplicate merging + unit conversion for cost calculation

---

## Architecture Analysis & Recommendations

### A. `expected_yield` on Recipe — Keep It

**Decision: Keep `expected_yield` and `yield_unit` on recipes.**

Why: It is the **batch reference size** used in `startProductionRun` to compute the BOM scaling factor:

```
scaleFactor = productionRun.expected_quantity / recipe.expected_yield
requiredQuantity = recipeItem.quantity * scaleFactor
```

Without this, the system cannot know how many kg of raw material to pull for a given production quantity. If you enter 500g sugar as a BOM item, the recipe needs to know whether that makes 1 kg or 10 kg of product.

**What changes:** Nothing in terms of the field itself. However:

- It will no longer be used to drive the "target output SKU" — that moves to the production run completion step

---

### B. Recipe `product_sku_id` — Make Optional (Not Remove)

**Decision: Make `product_sku_id` optional (nullable) on recipes.**

Current: Recipe requires both `product_id` and `product_sku_id`.  
Proposed: Recipe requires `product_id` (to know _what_ you're making), but `product_sku_id` is optional (a default output SKU suggestion for the completion dialog).

Why not remove it: Existing recipes all have it set. It serves as a useful pre-fill in the completion dialog. Removing it would break backward compatibility and lose useful data.

Why make it optional: Users will now decide packaging split at completion time. For a "makes chili powder" recipe, you don't need to commit to "100g packets" in the recipe — you decide that when you actually run it.

---

### C. Loose SKU Concept

A `loose` SKU represents bulk/unpackaged stock for a product. Key properties:

- Same as a regular SKU but with `is_loose = true`
- `size` = null, `unit` = base unit (kg or L)
- Only one loose SKU per product (enforced)
- Stock tracked in `current_stock` like any other SKU
- Can be used as a BOM ingredient (finished product type) in recipes
- Production outputs can target a loose SKU

---

## Database Changes (1 migration)

### Migration: `20260502000000-loose-sku-and-optional-recipe-sku.js`

```sql
-- 1. Add is_loose to product_skus
ALTER TABLE product_skus
  ADD COLUMN is_loose BOOLEAN NOT NULL DEFAULT FALSE AFTER status;

-- 2. Make product_sku_id nullable on recipes (it's already nullable in the DB likely — verify)
ALTER TABLE recipes
  MODIFY COLUMN product_sku_id INT NULL;
```

**No other schema changes needed.** The existing `production_output` table already supports multiple rows per production run (one per SKU). The existing `production_runs.actual_quantity` becomes the sum of all output quantities.

---

## Backend Changes

### 1. `models/ProductSku.js`

- Add `is_loose: { type: DataTypes.BOOLEAN, defaultValue: false }` field

### 2. `controllers/productController.js`

- Add route handler: `POST /api/products/:id/loose-sku`
  - Validates: product exists, no loose SKU already exists for this product
  - Creates `ProductSku` with `is_loose: true`, `size: null`, `unit` from request body
  - Returns the created SKU

### 3. `controllers/productionController.js` — `completeProductionRun`

**Current behavior:**

- Accepts `outputs[]` but only uses `outputs[0]?.sku_id` as a single fallback
- Creates ONE `ProductionOutput` row and updates ONE SKU

**New behavior:**

- Accept `outputs: [{ sku_id, quantity }, ...]` array (must sum close to `quantity_produced`)
- `quantity_produced` = total of all outputs (validation: sum of output quantities)
- Distribute material cost proportionally across outputs by quantity ratio
- For each output: create `ProductionOutput` row, update that SKU's stock + average cost
- If `outputs` is empty/not provided, fall back to `recipe.product_sku_id` (backward compat)
- Remove the `targetSkuId` single-SKU logic, replace with loop

**Cost distribution:**

```
baseUnitCost = totalMaterialCost / (quantity_produced + waste_quantity)
Each output: unit_cost = baseUnitCost (same per-unit cost, cost proportional to qty)
```

### 4. `controllers/recipeController.js` — `createRecipe` / `updateRecipe`

- Remove validation: `if (!product_sku_id) return errorResponse(...)`
- `product_sku_id` becomes optional — only validated if provided (must belong to product)
- `cost_per_unit` calc: divide by `expected_yield` (unchanged, but yield_unit normalization added)

### 5. `routes/productRoutes.js`

- Add: `router.post('/:id/loose-sku', productController.createLooseSku)`

---

## Frontend Changes

### 1. ProductEdit.vue + ProductCreate.vue — Loose SKU

**ProductEdit.vue:**

- Show "Add Loose SKU" button in the SKUs section, only if no loose SKU exists for this product
- On click: show a small confirm dialog asking for `unit` (kg or L)
- Calls `POST /api/products/:id/loose-sku`, refreshes the SKU list
- If a loose SKU already exists, show a `<Tag value="Loose/Bulk" severity="warning" />` badge on that SKU row instead of the button

**ProductCreate.vue:**

- Add a checkbox: "Also create a Loose/Bulk SKU for this product"
- If checked, show a `unit` selector (kg or L)
- After product is saved, immediately call `POST /api/products/:id/loose-sku` with the selected unit

### 2. CompleteProductionDialog.vue — Multi-SKU Output Selection

**Biggest UI change.** Replaces the single `quantity_produced` input with an output planning table.

**New layout:**

```
Production Run Info (unchanged)

── Output Planning ──────────────────────────────
[+ Add Output SKU]
┌──────────────────────┬────────────┬─────────────┐
│ SKU                  │ Qty        │             │
├──────────────────────┼────────────┼─────────────┤
│ Chili 100g           │ 50         │ [×]         │
│ Chili 50g            │ 20         │ [×]         │
│ Chili Loose (bulk)   │ 2.5 kg     │ [×]         │
└──────────────────────┴────────────┴─────────────┘
Total Output: 8.5 kg | Expected: 9 kg | Waste: 0.5 kg

── Waste ────────────────────────────────────────
Waste Quantity: [auto-calculated = expected - total]
Waste Reason: [dropdown, required if waste > 0]
```

**SKU dropdown for output:** Filtered to `product_id` of the recipe's product. Includes loose SKUs (shown with "Loose/Bulk" tag).

**Auto-calculate waste:** `waste = expected_quantity - sum(output quantities)`. Allow user to override if positive variance (produced more than expected).

**Validation:**

- At least one output required
- No duplicate SKU in outputs
- Total output + waste should roughly equal `expected_quantity` (show warning if off by >10%, don't block)

### 3. RecipeForm.vue — Bug Fix: BOM Duplicate Merging

In `saveBomItem()`, before pushing to `formData.items`:

```js
// Check for existing item with same key
const existingIndex = formData.value.items.findIndex(existing => {
  if (bomFormData.value.material_type === 'raw_material') {
    return (
      existing.material_type === 'raw_material' &&
      existing.raw_material_id === bomFormData.value.raw_material_id
    );
  } else {
    return (
      existing.material_type === 'finished_product' &&
      existing.product_sku_id === bomFormData.value.product_sku_id
    );
  }
});

if (existingIndex !== -1 && bomEditIndex.value === null) {
  // Merge: accumulate quantity
  formData.value.items[existingIndex].quantity += bomFormData.value.quantity;
  showSuccess(
    `Quantity merged: ${getIngredientName(formData.value.items[existingIndex])} → ${formData.value.items[existingIndex].quantity} ${formData.value.items[existingIndex].unit}`
  );
  closeBomDialog();
  return;
}
```

### 4. RecipeForm.vue — Bug Fix: Unit Conversion for Cost Calculation

Add a `toBaseUnit(quantity, unit)` utility that normalizes to kg/L:

```js
const toBaseUnit = (quantity, unit) => {
  const conversions = {
    g: 0.001, // → kg
    mg: 0.000001, // → kg
    kg: 1,
    mL: 0.001, // → L
    L: 1,
    pcs: 1,
    box: 1,
  };
  return quantity * (conversions[unit] ?? 1);
};
```

The raw material's `average_cost` is stored **per unit as recorded** (e.g., Rs/kg if the material is tracked in kg). The BOM item may specify `quantity: 500, unit: 'g'`. The correct cost is:

```
itemCost = average_cost * toBaseUnit(quantity, unit)
         = avg_cost_per_kg * 0.5  (for 500g)
```

Update `calculateItemCost()` and the `totalCost` computed property.

> **Note:** This assumes raw material `average_cost` is always stored in the material's base unit. Verify this is true for your data (it should be since costs are entered per kg when receiving stock).

### 5. RecipeForm.vue — Make `product_sku_id` Optional

Remove the `required` validator for the SKU dropdown. Show a helper text: "Optional — can be set as default output for production runs."

---

## Implementation Order (Sequence)

This order minimizes risk since each step builds on the previous:

| Step  | What                                                                                                  | Why This Order                        |
| ----- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **1** | DB migration (is_loose + recipe sku nullable)                                                         | Foundation for everything             |
| **2** | `ProductSku` model: add `is_loose` field                                                              | Required by backend changes           |
| **3** | Backend: `productController` — add `createLooseSku` endpoint                                          | Needed before UI can call it          |
| **4** | Backend: `recipeController` — make `product_sku_id` optional                                          | Allows UI to save recipes without SKU |
| **5** | Backend: `productionController` — multi-output `completeProductionRun`                                | Core logic change                     |
| **6** | Frontend: `RecipeForm.vue` — BOM merge + unit conversion + sku optional                               | Bug fixes, no new features            |
| **7** | Frontend: `ProductEdit.vue` + `ProductCreate.vue` — Loose SKU button/checkbox + loose tag on SKU rows | Depends on step 3                     |
| **8** | Frontend: `CompleteProductionDialog.vue` — multi-output selection UI                                  | Depends on step 5                     |
| **9** | Test end-to-end                                                                                       | Full smoke test                       |

---

## What Does NOT Change

- `production_runs` table schema — no changes needed
- `recipe_items` — no changes needed
- `production_materials` — no changes needed
- `startProductionRun` logic — the scale factor mechanism is unchanged
- All existing production runs remain valid — the multi-output only activates at completion
- Recipe versioning system — unchanged
- Reports — minor update to handle optional `product_sku_id` in recipe displays

---

## Open Risk Items

1. **Unit normalization assumption**: The fix assumes raw material `average_cost` is always stored per the material's declared unit (e.g., kg). If any materials were set up with `unit: g` and cost per gram, the conversion will double-count. Recommend running a quick check: `SELECT name, unit, average_cost FROM raw_materials WHERE unit = 'g'` to confirm.

2. **Existing completion dialog**: The `outputs` array in `CompleteProductionDialog.vue` currently hardcodes `sku_id: recipe.product_sku_id`. After change, if `product_sku_id` is null on recipe, the fallback will fail unless the UI requires at least one output SKU be entered.

3. **Reports**: `reportsController.js` line 805 fetches `expected_yield, yield_unit` — this is fine since we're keeping those fields.

---

## Summary of Files Modified

**Backend:**

- `hasal-pos-backend/migrations/20260502000000-loose-sku-and-optional-recipe-sku.js` (new)
- `hasal-pos-backend/models/ProductSku.js`
- `hasal-pos-backend/controllers/productController.js`
- `hasal-pos-backend/controllers/recipeController.js`
- `hasal-pos-backend/controllers/productionController.js`
- `hasal-pos-backend/routes/productRoutes.js`

**Frontend:**

- `src/components/recipes/RecipeForm.vue`
- `src/views/products/ProductEdit.vue`
- `src/views/products/ProductCreate.vue`
- `src/components/production/CompleteProductionDialog.vue`

**Total: 9 files touched** (3 new lines/file + targeted edits)

---

_Ready to implement. Confirm to start with Step 1 (migration) or ask any questions about the above._
