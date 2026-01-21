# Comprehensive Test Suite - User Guide

## Overview

This comprehensive test suite validates all phases of the Spice POS system, from basic PO management to advanced cost tracking, profit analysis, and reporting.

**Total Test Coverage: 59 Tests across 9 Phases**

## Test Phases

### **Phase 1: PO Management** (8 tests)

- Create purchase orders
- Partial and full PO receipt
- Multiple receipt tracking
- PO cancellation
- Batch inspection approval

### **Phase 2: Return Batch Traceability** (4 tests)

- Return processing with source batch tracking
- Batch genealogy queries
- Return origin tracing
- Material returns summary

### **Phase 3: Recipe-SKU Validation** (7 tests)

- Recipe creation with product-SKU relationship
- SKU requirement validation
- Recipe querying with SKU details
- Recipe filtering by product
- SKU updates
- Product-SKU cascade verification
- Recipe deletion

### **Phase 4: Production FIFO Cost Tracking** (10 tests)

- Production run creation with batch numbers
- Production completion with FIFO cost calculation
- FIFO material consumption tracking
- SKU average cost updates
- Finished goods batch generation
- Multiple production FIFO order verification
- Production history queries
- Cost calculation accuracy validation
- Batch depletion tracking
- Production run cancellation

### **Phase 5: Waste Allocation & Tracking** (8 tests)

- Production with waste tracking
- Waste cost allocation calculation
- Yield efficiency calculation
- Waste cost reporting (monthly totals)
- Waste breakdown by product
- Waste reasons tracking
- Zero waste production handling
- High waste detection (>20%)

### **Phase 6: Batch Number Generation** (5 tests)

- Production batch number format (PROD-YYYYMMDD-NNN)
- Finished goods batch format (FG-{CODE}-YYYYMMDD-NNN)
- Batch number uniqueness
- Sequential increment verification
- Date format validation (YYYYMMDD)

### **Phase 7: Profit Analysis Endpoints** (6 tests)

- Sales invoice creation
- Individual sale profit calculation
- Sales profit summary
- Product profit summary
- SKU-level profit analysis
- Profit margin categorization (High/Medium/Low)

### **Phase 8: Waste & Efficiency Reporting** (6 tests)

- Waste cost report with date range filtering
- Waste report filtering by product
- Efficiency report overall trends
- Efficiency report filtering by recipe
- Production runs listing in efficiency report
- Yield statistics (avg, min, max)

### **Phase 9: E2E Integration Workflows** (5 tests)

- Complete workflow: Recipe → Production → Sale → Profit
- Multiple productions with FIFO validation
- Waste impact on unit costs
- Complete batch traceability
- Full reporting integration

## Prerequisites

### 1. Database Setup

Ensure your MySQL database is running and configured:

```bash
# Start MySQL (if not running)
# Windows: Start MySQL service from Services
# macOS/Linux: sudo systemctl start mysql
```

### 2. Backend Server

Start the backend server:

```bash
cd hasal-pos-backend
npm install
npm start
# Server should be running on http://localhost:5000
```

### 3. Seed Test Data

**IMPORTANT**: Before running tests, seed the test data:

```bash
cd hasal-pos-backend
node scripts/seed-test-data.js
```

This creates:

- **1 Test Supplier** (TEST-SUP)
- **3 Test Raw Materials** (TEST-MAT-01, 02, 03)
- **3 Test Products** (TEST-PROD-01, 02, 03)
- **4 Test SKUs** with specific pricing for profit testing
- **3 Test Recipes** with SKU relationships
- **4 Test Purchase Orders & Batches** for FIFO testing:
  - Batch 1 Mat1: 10kg @ 1000/kg (old cost)
  - Batch 2 Mat1: 10kg @ 1200/kg (new cost - for FIFO testing)
  - Batch 1 Mat2: 10kg @ 500/kg
  - Batch 1 Mat3: 10kg @ 300/kg
- **1 Test Outlet** for sales testing

## Running the Tests

### Full Test Suite

Run all 59 tests:

```powershell
.\COMPREHENSIVE_TEST_SUITE.ps1
```

### Expected Output

```
╔════════════════════════════════════════════════════════════════════════════╗
║                 COMPREHENSIVE TEST SUITE: PHASE 1 & PHASE 2               ║
╚════════════════════════════════════════════════════════════════════════════╝

... [Phase 1-2 tests running] ...

╔════════════════════════════════════════════════════════════════════════════╗
║                   PHASE 3: RECIPE-SKU VALIDATION                          ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ PASS: Create Recipe with Product-SKU Link
✅ PASS: Reject Recipe Without SKU
... [More tests] ...

╔════════════════════════════════════════════════════════════════════════════╗
║                          COMPREHENSIVE TEST SUMMARY                       ║
╚════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════
Total: 59 | Passed: 59 | Failed: 0
🎉 ALL TESTS PASSED!
════════════════════════════════════════
```

## Test Data Structure

### Test Products with Target Margins

1. **TEST-PROD-01** (Premium Curry - High Margin)
   - 100g SKU: LKR 1000 (Target 40% margin)
   - 500g SKU: LKR 4500
   - Expected cost: ~600 LKR/kg

2. **TEST-PROD-02** (Economy Mix - Low Margin)
   - 100g SKU: LKR 800 (Target 15% margin)
   - Expected cost: ~680 LKR/kg

3. **TEST-PROD-03** (Waste Tracker)
   - 100g SKU: LKR 1200
   - Used for waste allocation testing

### FIFO Cost Testing Setup

The test data includes two batches of TEST-MAT-01 (Turmeric) at different costs:

- **Batch 1**: 10kg @ LKR 1000/kg (older)
- **Batch 2**: 10kg @ LKR 1200/kg (newer)

Productions should consume Batch 1 first (FIFO), allowing verification of:

- Cost calculation accuracy
- Batch depletion tracking
- Weighted average cost updates

## Troubleshooting

### Tests Fail with "TEST-PROD-01 not found"

**Solution**: Run the seed script first:

```bash
node hasal-pos-backend/scripts/seed-test-data.js
```

### Connection Errors

**Solution**: Ensure backend server is running on port 5000:

```bash
cd hasal-pos-backend
npm start
```

### Authentication Fails

**Solution**: Check that admin credentials are correct:

- Username: `admin`
- Password: `admin123`

### Tests Fail Intermittently

**Solution**:

1. Reset test data:
   ```bash
   # Delete test records manually or re-run seed script
   node scripts/seed-test-data.js
   ```
2. Ensure sufficient material stock for productions

### Database Sync Issues

**Solution**:

```bash
cd hasal-pos-backend
npm run migrate  # Run migrations if needed
```

## Test Validation Points

### Cost Calculation Formulas Verified

1. **Unit Cost**: `total_material_cost / (actual_quantity + waste_quantity)`
2. **Waste Cost**: `(material_cost / (actual + waste)) × waste_qty`
3. **Yield Efficiency**: `(actual_quantity / planned_quantity) × 100`
4. **Profit**: `selling_price - average_cost`
5. **Profit Margin**: `((price - cost) / price) × 100`

### Batch Number Formats Verified

1. **Production**: `PROD-YYYYMMDD-NNN` (e.g., PROD-20241225-001)
2. **Finished Goods**: `FG-{PRODUCT_CODE}-YYYYMMDD-NNN` (e.g., FG-TEST-PROD-01-20241225-001)

### Profit Margin Categories

- **High**: ≥30% margin (Green in UI)
- **Medium**: 15-30% margin (Yellow in UI)
- **Low**: <15% margin (Red in UI)

## Performance Benchmarks

Expected execution times:

- **Phase 1-2** (Legacy tests): ~10-15 seconds
- **Phase 3** (Recipe-SKU): ~8-12 seconds
- **Phase 4** (FIFO Costs): ~15-20 seconds
- **Phase 5** (Waste Tracking): ~12-18 seconds
- **Phase 6** (Batch Generation): ~6-10 seconds
- **Phase 7** (Profit Analysis): ~8-12 seconds
- **Phase 8** (Reporting): ~8-12 seconds
- **Phase 9** (E2E Workflows): ~15-25 seconds

**Total Suite**: ~90-120 seconds (1.5-2 minutes)

## CI/CD Integration

To integrate into automated pipelines:

```yaml
# Example GitHub Actions workflow
name: Comprehensive Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd hasal-pos-backend
          npm install

      - name: Seed test data
        run: node hasal-pos-backend/scripts/seed-test-data.js

      - name: Start backend
        run: |
          cd hasal-pos-backend
          npm start &

      - name: Run comprehensive tests
        run: .\COMPREHENSIVE_TEST_SUITE.ps1
```

## Extending the Test Suite

To add new tests:

1. **Add test data** to `hasal-pos-backend/scripts/seed-test-data.js`:

   ```javascript
   const [newTestProduct] = await db.Product.findOrCreate({
     where: { code: 'TEST-NEW' },
     defaults: {
       /* ... */
     },
   });
   ```

2. **Add test case** to `COMPREHENSIVE_TEST_SUITE.ps1`:

   ```powershell
   Write-Host "=== PX-TX: New Test Name ===" -ForegroundColor Cyan
   try {
       # Test logic here
       Test-Result "Test Name" $passed
   } catch {
       Test-Result "Test Name" $false $_.Exception.Message
   }
   ```

3. **Update this README** with new test description

## Support

For issues or questions:

1. Check test output for specific error messages
2. Verify all prerequisites are met
3. Review API endpoint documentation in `mds/api-docs/`
4. Check database schema in `mds/DATABASE_SCHEMA.md`

## Version History

- **v3.0** - Added Phases 3-9 (47 new tests) - Recipe-SKU, FIFO, Waste, Reporting, E2E
- **v2.0** - Phase 2: Return Batch Traceability (4 tests)
- **v1.0** - Phase 1: PO Management (8 tests)
