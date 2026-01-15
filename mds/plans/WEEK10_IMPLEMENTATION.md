# Week 10 Implementation: Stock Tracking & Batch Display UI

**Module:** Raw Materials, Purchase Orders, Batch Traceability  
**Implementation Date:** January 15-16, 2026  
**Status:** ✅ COMPLETE  
**Developer:** GitHub Copilot

---

## 📋 Overview

Week 10 focuses on implementing comprehensive stock tracking and batch display features across the application. This enhances visibility into inventory status, supplier sourcing, and batch genealogy. Users can now see which supplier provided each batch, calculate weighted average costs, and track the complete batch history from receipt through returns.

### Key Features Implemented

- ✅ Current stock calculation and display in Raw Materials list
- ✅ Weighted average cost calculation for each material
- ✅ Supplier information visible in batch history
- ✅ Received batches section in Purchase Order details
- ✅ Full batch genealogy with return tracking
- ✅ Expiry date monitoring (color-coded warnings)
- ✅ Return reason and disposition tracking

---

## 🎯 Requirements Analysis

### Business Rules

1. **Stock Calculation:**
   - Current stock = SUM of all batch quantities
   - Includes both receipt (+) and return (-) quantities
   - Calculated in real-time on each API call
   - Performance optimized with parallel queries

2. **Average Cost Calculation:**
   - Weighted average = SUM(quantity × unit_cost) ÷ SUM(quantity)
   - Only includes receipt batches (excludes returns)
   - Provides insight into material sourcing trends
   - Used for financial reporting

3. **Batch Traceability:**
   - Each batch linked to supplier (code + name)
   - Shows source batch for returns (genealogy)
   - Tracks return reason (Damaged, Expired, etc.)
   - Tracks disposition (Return to Stock vs Dispose)

4. **Stock Visibility:**
   - List view shows quick overview of stock levels
   - Detail view shows batch-by-batch breakdown
   - Expiry dates color-coded for quick identification
   - Reorder level indicator for low stock

---

## 🗄️ Database Structure (Existing Tables)

### raw_material_batches

```sql
-- Existing fields used:
id, material_id, supplier_id, batch_number,
quantity, unit_cost, purchase_date, expiry_date,
batch_type, return_reason, return_disposition,
source_batch_id, inspection_status, created_at
```

### raw_materials

```sql
-- Existing fields:
id, code, name, category, unit, reorder_level, status
-- Calculated fields (not stored):
current_stock, average_cost
```

---

## 💻 Backend Implementation

### 1. Raw Material Controller Updates

#### getAllRawMaterials() - Enhanced with Stock Calculation

**Changes:**

- Added Promise.all() loop to calculate stock for each material in parallel
- Queries RawMaterialBatch and sums quantities
- Returns current_stock in response

**Code Pattern:**

```javascript
const materialsWithStock = await Promise.all(
  rows.map(async material => {
    const stockResult = await RawMaterialBatch.findOne({
      where: { material_id: material.id },
      attributes: [[sequelize.fn('SUM', sequelize.col('quantity')), 'total_stock']],
    });
    const totalStock = parseFloat(stockResult?.dataValues?.total_stock || 0);
    return { ...material.toJSON(), current_stock: totalStock };
  })
);
```

**API Response:**

```json
{
  "raw_materials": [
    {
      "id": 1,
      "code": "RM-0001",
      "name": "Turmeric",
      "current_stock": 850,
      "reorder_level": 100
    }
  ]
}
```

#### getRawMaterialById() - Enhanced with Batches & Supplier Info

**Changes:**

- Includes batches relationship with supplier data
- Calculates weighted average cost using SQL
- Returns both current_stock and average_cost

**SQL Query for Average Cost:**

```sql
SELECT SUM(quantity * unit_cost) / SUM(quantity) as avg_cost
FROM raw_material_batches
WHERE material_id = ? AND batch_type = 'receipt'
```

**API Response:**

```json
{
  "raw_material": {
    "id": 1,
    "code": "RM-0001",
    "name": "Turmeric",
    "current_stock": 850,
    "average_cost": 52.35,
    "RawMaterialBatches": [
      {
        "batch_number": "RM-0001-26010152",
        "quantity": 500,
        "unit_cost": 50,
        "expiry_date": "2026-07-15",
        "batch_type": "receipt",
        "supplier": { "code": "SUP-001", "name": "Supplier A" }
      }
    ]
  }
}
```

### 2. Purchase Order Controller Updates

#### getPurchaseOrderById() - Enhanced with Batch Data

**Changes:**

- Fetches all batches for materials in the PO
- Includes supplier relationship for each batch
- Returns batches array with PO

**Query Logic:**

```javascript
const materialIds = purchaseOrder.items.map(item => item.material_id);
let batches = await RawMaterialBatch.findAll({
  where: {
    material_id: { [Op.in]: materialIds },
    supplier_id: purchaseOrder.supplier_id,
  },
  include: [{ model: RawMaterial, as: 'material' }],
});
```

**API Response:**

```json
{
  "id": 1,
  "po_number": "PO-20260115-001",
  "status": "received",
  "batches": [
    {
      "batch_number": "RM-001-26010151",
      "batch_type": "receipt",
      "quantity": 500,
      "material": { "name": "Turmeric" },
      "expiry_date": "2026-07-15"
    }
  ]
}
```

---

## 🎨 Frontend Implementation

### 1. RawMaterialView.vue Enhancements

#### Current Stock Display

- Displays `current_stock` calculated from all batches
- Shows with material unit (e.g., "850 kg")
- Color-coded: Red if below reorder level

#### Average Cost Display

- Shows weighted average cost: `Rs. 52.35/kg`
- Calculated from receipt batches only
- Provides insight into sourcing trends

#### Recent Batches Table

- **New Column: Supplier**
  - Displays supplier name (bold, primary text)
  - Shows supplier code (smaller, gray text)
  - Uses flexbox for clean vertical stacking

- **Columns:** Batch Number | Supplier | Received Date | Expiry Date | Quantity | Unit Cost | Type

- **Styling:**
  - Expiry dates color-coded:
    - Yellow: Expiring within 30 days
    - Red: Already expired
  - Batch type tagged (green=Receipt, orange=Return)

**Component Structure:**

```vue
<Column field="supplier.name" header="Supplier" style="width: 15%">
  <template #body="{ data }">
    <div v-if="data.supplier" class="supplier-info">
      <span class="supplier-name">{{ data.supplier.name }}</span>
      <span class="supplier-code">{{ data.supplier.code }}</span>
    </div>
  </template>
</Column>
```

### 2. PurchaseOrderView.vue Enhancements

#### Received Batches Section

- **Visibility:** Only shows when batches exist
- **Columns:** Batch Number | Type | Material | Quantity | Expiry Date | [Return Reason | Disposition]

- **Data Displayed:**
  - Receipt batches: Green tag, positive quantity
  - Return batches: Orange tag, negative quantity, reason, disposition

- **Empty State:**
  - Shows info card when no batches yet
  - Indicates batches appear after receiving

**Component Structure:**

```vue
<Card v-if="batches.length > 0" class="batches-card">
  <template #header>
    <h3>Received Batches</h3>
    <span class="batch-count">{{ batches.length }} batches</span>
  </template>
  <DataTable :value="batches">
    <!-- Columns defined here -->
  </DataTable>
</Card>

<Card v-else-if="purchaseOrder.status !== 'pending'" class="info-card">
  <!-- Empty state message -->
</Card>
```

---

## 📊 Data Calculations

### Current Stock Formula

```
Current Stock = SUM(quantity) for all batches where material_id = X
Includes: Receipts (+) and Returns (-)
Example: 500 + 300 - 50 = 750 kg
```

### Weighted Average Cost Formula

```
Average Cost = SUM(quantity × unit_cost) / SUM(quantity)
Where batch_type = 'receipt'

Example:
  Batch 1: 100 kg @ Rs. 50/kg = Rs. 5000
  Batch 2: 50 kg @ Rs. 60/kg = Rs. 3000
  Average = (5000 + 3000) / (100 + 50) = Rs. 53.33/kg
```

---

## 🧪 Test Coverage

### Backend Tests

- ✅ getAllRawMaterials returns current_stock for each material
- ✅ getRawMaterialById calculates accurate average_cost
- ✅ Supplier data included with each batch
- ✅ getPurchaseOrderById returns batches array
- ✅ Batch type and return info included

### Frontend Tests

- ✅ Raw Materials list displays stock column
- ✅ Raw Material detail shows average cost
- ✅ Recent Batches table shows supplier (name + code)
- ✅ Purchase Order view shows Received Batches section
- ✅ Expiry dates color-coded correctly
- ✅ Return reasons and disposition displayed
- ✅ Empty states show appropriate messages

---

## 📁 Files Modified

### Backend

- `hasal-pos-backend/controllers/rawMaterialController.js`
  - getAllRawMaterials(): Added stock calculation
  - getRawMaterialById(): Added supplier includes and average cost

- `hasal-pos-backend/controllers/purchaseOrderController.js`
  - getPurchaseOrderById(): Added batch fetching

### Frontend

- `src/views/raw-materials/RawMaterialView.vue`
  - Added supplier column and styling

- `src/components/purchase-orders/PurchaseOrderView.vue`
  - Updated batches computed property
  - Added empty state card
  - Fixed field references

---

## ✅ Implementation Checklist

- [x] Backend: getAllRawMaterials stock calculation
- [x] Backend: getRawMaterialById average cost calculation
- [x] Backend: getPurchaseOrderById batch integration
- [x] Frontend: Current stock display in list
- [x] Frontend: Average cost display in detail
- [x] Frontend: Supplier column in batches table
- [x] Frontend: Received batches section in PO view
- [x] Frontend: Empty state messages
- [x] Frontend: Styling and color-coding
- [x] Testing: Update WEEK3 and WEEK4 test files
- [x] Documentation: Update PHASE2_IMPLEMENTATION_PLAN

---

## 📝 Notes

- Stock calculations done in parallel for performance
- Average cost uses SQL for accuracy and efficiency
- No database schema changes required
- Backward compatible with existing data
- All calculations done in real-time (not cached)
- Supplier data enriches batch traceability

---

## 🔗 Related Features

- **Batch Genealogy Tracer:** Uses supplier data from batches
- **Material Returns Summary:** Uses average cost and stock calculations
- **Purchase Order Status:** Determines when batches should appear
- **Stock Reorder Alerts:** Uses current stock vs reorder level
