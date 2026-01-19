# Product, Recipe & Production Workflow - Quick Summary

**Date:** January 19, 2026

---

## 🎯 System Overview

Hasal Products POS is a **manufacturing and inventory management system** for a spices production business.

### Core Concept:

```
Raw Materials + Recipe = Production → Finished Products → Sales
```

---

## 📊 Three Main Workflows

### 1️⃣ PRODUCT MANAGEMENT

**What it is:** Product catalog with multiple package sizes (SKUs)

**Structure:**

```
Product (e.g., "Curry Powder")
  ├── SKU 1: 100g @ Rs.150
  ├── SKU 2: 500g @ Rs.700
  └── SKU 3: 1kg @ Rs.1,300
```

**Key Points:**

- Auto-generated product codes (PROD001, PROD002...)
- Each product can have multiple SKUs (different sizes)
- Initial stock = 0 (populated by production)
- Cannot delete if SKUs exist or stock > 0

**Backend:** `productController.js`, `Product.js`, `ProductSku.js` models
**Frontend:** `ProductForm.vue`, `ProductIndex.vue`
**Database:** `products` + `product_skus` tables

---

### 2️⃣ RECIPE MANAGEMENT

**What it is:** Bill of Materials (BOM) defining how to make products

**Structure:**

```
Recipe: "Curry Powder Mix"
├── Code: RECIPE001
├── Version: 1 (auto-incremented on update)
├── Expected Yield: 10 kg
└── Bill of Materials:
    ├── Turmeric: 3 kg
    ├── Coriander: 4 kg
    ├── Cumin: 2 kg
    └── Chili: 0.5 kg
```

**Key Feature: VERSIONING**

- Update creates NEW version (v1 → v2 → v3)
- Old versions preserved (inactive)
- Only ONE active version at a time
- Historical traceability maintained

**Why Versioning?**

- Track formulation changes
- Cost comparison
- Quality control
- Regulatory compliance

**Backend:** `recipeController.js`, `Recipe.js`, `RecipeItem.js` models
**Frontend:** `RecipeForm.vue`, `RecipeIndex.vue`
**Database:** `recipes` + `recipe_items` tables

---

### 3️⃣ PRODUCTION MANAGEMENT

**What it is:** Execute recipes to consume raw materials and create finished goods

**Critical Feature: FIFO (First-In-First-Out)**

**Two-Step Process:**

#### Step 1: Create Production Run

```javascript
POST /api/production-runs
{
  recipe_id: 1,
  production_date: "2026-01-19",
  batch_number: "PROD-20260119-001"
}
// Status: Planned
```

#### Step 2: Complete Production (CRITICAL!)

```javascript
POST /api/production-runs/:id/complete
{
  quantity_produced: 50,
  outputs: [{ sku_id: 5, quantity_produced: 50 }]
}
```

**What Happens:**

```
1. Calculate scale factor (50kg want / 10kg recipe = 5x)
2. For each raw material:
   ├─ Find oldest batches (FIFO)
   ├─ Deduct quantities from batches
   ├─ Record which batches used
   └─ Update batch quantities
3. Add finished goods to inventory
4. Mark production as completed
5. ALL in ONE transaction (atomic)
```

**FIFO Example:**

```
Need: 15 kg Turmeric

Available Batches:
  Batch1 (Jan 5):  7 kg ← oldest, use first
  Batch2 (Jan 10): 5 kg
  Batch3 (Jan 15): 8 kg ← newest

Consumption:
  Take 7kg from Batch1 (exhausted)
  Take 8kg from Batch2 (partial)
  = 15kg total ✓
```

**Backend:** `productionController.js`, `ProductionRun.js`, `ProductionMaterial.js`, `ProductionOutput.js`
**Frontend:** `ProductionRunForm.vue`, `ProductionIndex.vue`
**Database:** `production_runs` + `production_materials` + `production_output` tables

---

## 🔗 How They Connect

```
┌──────────────┐
│   PRODUCTS   │  (What we sell)
│   + SKUs     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   RECIPES    │  (How to make them)
│   + Items    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  PRODUCTION  │  (Making process)
│   + FIFO     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  INVENTORY   │  (Stock tracking)
│   Updates    │
└──────────────┘
```

---

## 📈 Complete Workflow Example

### Scenario: Making 50kg Curry Powder

**Step 1: Setup (One-time)**

```
✓ Product created: "Curry Powder"
✓ SKU added: 1kg package @ Rs.1,300
✓ Recipe created: "Curry Powder Mix v1"
  - Yield: 10kg per batch
  - Materials: Turmeric 3kg, Coriander 4kg, etc.
```

**Step 2: Get Raw Materials**

```
✓ Purchase Order received
✓ Batches created:
  - RM-TUR001-20260119-001: 100kg
  - RM-COR001-20260119-001: 80kg
  - etc.
```

**Step 3: Production**

```
Create Production Run:
  - Recipe: Curry Powder Mix v1
  - Want to produce: 50kg
  - Scale factor: 50/10 = 5x
  - Materials needed (scaled):
    * Turmeric: 3 × 5 = 15kg
    * Coriander: 4 × 5 = 20kg
    * etc.

Complete Production:
  ✓ FIFO deduction from oldest batches
  ✓ Batches updated:
    - RM-TUR001: 100kg → 85kg
    - RM-COR001: 80kg → 60kg
  ✓ Finished goods added:
    - Curry Powder 1kg: 0 → 50 units
  ✓ Status: Completed
```

**Step 4: Sell**

```
✓ Sales invoice created
✓ 10 units sold to ABC Store
✓ Stock: 50 → 40 units
```

---

## 🔍 Traceability

**Forward Trace (Batch → Customer):**

```
Raw Material Batch RM-TUR001-20260119-001
  ↓ used in
Production Run PROD-20260119-001
  ↓ produced
Curry Powder 1kg SKU
  ↓ sold in
Invoice INV-2026-001
  ↓ to
ABC Store
```

**Backward Trace (Customer → Batch):**

```
Invoice INV-2026-001
  ↓ contained
Curry Powder 1kg
  ↓ made by
Production PROD-20260119-001 (Recipe v1)
  ↓ used batches
- RM-TUR001-20260119-001 (15kg)
- RM-COR001-20260119-001 (20kg)
- etc.
```

**Why Important?**

- Food safety recalls
- Quality issue investigation
- Compliance & auditing
- Cost tracking

---

## 💡 Key Business Rules

### Products:

- ✅ Auto-generated codes
- ✅ Multiple SKUs per product
- ❌ Can't delete if SKUs exist
- ❌ Can't delete SKU if stock > 0

### Recipes:

- ✅ Auto-versioning on update
- ✅ Only one active version per code
- ✅ Old versions preserved
- ❌ Minimum 1 item required

### Production:

- ✅ FIFO batch consumption (oldest first)
- ✅ Flexible quantities (scale factor)
- ✅ Atomic transactions (all or nothing)
- ❌ Can't update after completion
- ❌ Rolls back if insufficient stock

---

## 🗄️ Database Tables

**Products:**

- `products` - Product master
- `product_skus` - Package sizes

**Recipes:**

- `recipes` - Recipe versions
- `recipe_items` - Bill of materials

**Production:**

- `production_runs` - Production jobs
- `production_materials` - Materials consumed (FIFO)
- `production_output` - Goods produced

**Inventory:**

- `raw_materials` - Material master
- `raw_material_batches` - Material batches (FIFO)

---

## 🎨 Frontend Structure

```
views/
├── products/
│   ├── ProductIndex.vue (list)
│   ├── ProductCreate.vue (create)
│   └── ProductView.vue (details)
├── recipes/
│   ├── RecipeIndex.vue (list)
│   ├── RecipeCreate.vue (create)
│   └── RecipeView.vue (details + versions)
└── production/
    ├── ProductionIndex.vue (list)
    ├── ProductionCreate.vue (create)
    └── ProductionView.vue (details + materials)

stores/
├── product.js (state management)
├── recipe.js (state management)
└── production.js (state management)
```

---

## 🚀 API Endpoints Summary

### Products

```
GET    /api/products              # List all
GET    /api/products/:id          # Get with SKUs
POST   /api/products              # Create
POST   /api/products/:id/skus     # Add SKU
PUT    /api/products/:id          # Update
DELETE /api/products/:id          # Delete
```

### Recipes

```
GET    /api/recipes               # List all
GET    /api/recipes/:id           # Get with items
POST   /api/recipes               # Create (v1)
PUT    /api/recipes/:id           # Update (creates v+1)
GET    /api/recipes/:id/versions  # Get all versions
```

### Production

```
GET    /api/production-runs                  # List all
GET    /api/production-runs/:id              # Get details
POST   /api/production-runs                  # Create run
POST   /api/production-runs/:id/complete     # Execute (FIFO!)
GET    /api/production-runs/:id/check-materials  # Check availability
```

---

## 📌 Critical Implementation Details

### 1. FIFO Logic (productionController.js)

```javascript
// Get batches in FIFO order
const batches = await RawMaterialBatch.findAll({
  where: {
    material_id: item.material_id,
    current_quantity: { [Op.gt]: 0 },
    type: 'receipt',
    expiry_date: { [Op.or]: [null, { [Op.gt]: new Date() }] },
  },
  order: [['created_at', 'ASC']], // ← FIFO!
});

// Deduct from oldest first
for (const batch of batches) {
  const quantityToDeduct = Math.min(remainingQuantity, batch.current_quantity);
  await batch.update({
    current_quantity: batch.current_quantity - quantityToDeduct,
  });
  // Record usage...
}
```

### 2. Recipe Versioning (recipeController.js)

```javascript
// Mark current as inactive
await currentRecipe.update({ is_active: false });

// Create new version
const newRecipe = await Recipe.create({
  code: currentRecipe.code,
  version: currentRecipe.version + 1, // ← Increment
  is_active: true, // ← New version active
  // ... other fields
});
```

### 3. Scale Factor (productionController.js)

```javascript
const scaleFactor = quantity_produced / recipe.batch_size;
// Example: 50kg wanted / 10kg recipe = 5x scale

// Scale all materials
const requiredQuantity = recipeItem.quantity × scaleFactor;
// Example: 3kg in recipe × 5 = 15kg needed
```

---

## ✅ Testing Workflow

### Manual Test Sequence:

1. **Create Product**
   - POST /api/products { name: "Test Curry" }
   - POST /api/products/1/skus { size: "1kg", price: 1300 }

2. **Create Recipe**
   - POST /api/recipes { code: "TEST001", items: [...] }

3. **Receive Raw Materials**
   - Create PO and receive (creates batches)

4. **Execute Production**
   - POST /api/production-runs
   - POST /api/production-runs/1/complete { quantity_produced: 10 }
   - Check: raw_material_batches quantities decreased
   - Check: product_skus stock increased

5. **Verify Traceability**
   - Query production_materials (which batches used)
   - Query production_output (what was produced)

---

## 📚 Related Documents

- **Full Report:** `PRODUCT_RECIPE_PRODUCTION_WORKFLOW_REPORT.md` (detailed)
- **Database Schema:** `DATABASE_SCHEMA.md`
- **Project Requirements:** `PROJECT_REQUIREMENTS.md`
- **API Testing:** `api-docs/API_TESTING_README.md`

---

**For detailed explanations, SQL queries, and troubleshooting, refer to the full report!**
