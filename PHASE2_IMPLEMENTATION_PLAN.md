# Phase 2 Implementation - Return Batch Traceability

**Date:** January 15, 2026  
**Status:** 🔄 IN PROGRESS  
**Estimated Duration:** 5 hours

---

## Objective

Add source_batch_id tracking to enable full return item genealogy and traceability.

---

## Requirements

✅ Track which specific batch is being returned  
✅ Link return items to their source receipt batches  
✅ Enable batch genealogy queries  
✅ Support batch-level return audit trail

---

## Implementation Roadmap

### Step 1: Update RawMaterialBatch Model

- Add `source_batch_id` field to model
- Add self-referential foreign key
- Add validation for batch-to-material matching

### Step 2: Update API - POST /purchase-orders/:id/receive

- Add `source_batch_id` to return_items array schema
- Validate source_batch_id belongs to same material
- Link return batches to source batches

### Step 3: Add Batch Traceability Queries

- Get batch history (original receipt + returns)
- Get return origin (which batch this return came from)

### Step 4: Testing

- Test return items with source_batch_id
- Verify batch genealogy linkage
- Test error cases (invalid batch IDs)

---

## Files to Modify

1. **models/RawMaterialBatch.js** - Add source_batch_id field
2. **controllers/purchaseOrderController.js** - Update receive endpoint
3. **controllers/batchController.js** - Add traceability queries (NEW)
4. **routes/batchRoutes.js** - Add new endpoints (if needed)

---

## Database Changes

```sql
ALTER TABLE `raw_material_batches` ADD COLUMN (
  `source_batch_id` INT,
  FOREIGN KEY (`source_batch_id`) REFERENCES `raw_material_batches`(`id`) ON DELETE SET NULL
);
```

---

## Implementation Status

- [x] Update RawMaterialBatch model - ✅ COMPLETE (self-referential association configured)
- [x] Update receive endpoint - ✅ COMPLETE (validation for source_batch_id added)
- [x] Add validation logic - ✅ COMPLETE (batch existence, material matching, receipt type checks)
- [x] Create traceability controller - ✅ COMPLETE (genealogy, origin, returns summary queries)
- [x] Add traceability routes - ✅ COMPLETE (3 new endpoints registered)
- [ ] Create test suite - 🔄 IN PROGRESS
- [ ] All tests passing - 🔄 PENDING

---

## Notes

- Sequelize `sync({ alter: true })` will handle schema updates automatically
- No data migration needed (existing returns will have NULL source_batch_id)
- Backward compatible with existing code
