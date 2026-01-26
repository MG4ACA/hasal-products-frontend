# ✅ Test Execution Checklist

Use this checklist to ensure smooth test execution.

## Pre-Test Setup ☑️

### 1. Database Ready

- [ ] MySQL server is running
- [ ] Database `hasal_pos` exists
- [ ] All migrations are up to date
- [ ] Database connection configured in `.env`

### 2. Backend Server

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Server starts without errors (`npm start`)
- [ ] Server running on port 5000
- [ ] Admin user exists (username: `admin`, password: `admin123`)

### 3. Test Data

- [ ] **CRITICAL**: Test data seeded with `npm run test:seed`
- [ ] Verify console shows: "✅ TEST DATA SEEDING COMPLETED"
- [ ] Confirm 3 test products created (TEST-PROD-01, 02, 03)
- [ ] Confirm 4 test batches created for FIFO testing

---

## Test Execution ▶️

### Step 1: Seed Test Data

```bash
cd hasal-pos-backend
npm run test:seed
```

**Expected Output**:

```
═══════════════════════════════════════════════════════════
✅ TEST DATA SEEDING COMPLETED
═══════════════════════════════════════════════════════════

📊 Created Test Data:
  • 1 Test Supplier (TEST-SUP)
  • 3 Test Raw Materials (TEST-MAT-01, 02, 03)
  • 3 Test Products (TEST-PROD-01, 02, 03)
  • 4 Test SKUs with pricing for profit testing
  • 3 Test Recipes with SKU relationships
  • 4 Test Purchase Orders
  • 4 Test Batches for FIFO testing
  • 1 Test Outlet

🧪 Ready for Comprehensive Testing
```

**If you see errors**:

- [ ] Check database connection
- [ ] Verify migrations are current
- [ ] Check console for specific error messages

---

### Step 2: Start Backend Server

```bash
cd hasal-pos-backend
npm start
```

**Expected Output**:

```
✅ Database connected successfully
🚀 Server running on port 5000
```

**Keep this terminal running** - Don't close it!

---

### Step 3: Run Test Suite (New PowerShell Window)

```powershell
# Navigate to project root
cd C:\Mithuranga\spices-pos

# Run comprehensive test suite
.\COMPREHENSIVE_TEST_SUITE.ps1
```

**Expected Output**:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                 COMPREHENSIVE TEST SUITE: PHASE 1 & PHASE 2               ║
╚════════════════════════════════════════════════════════════════════════════╝

... [Tests running with colored output] ...

╔════════════════════════════════════════════════════════════════════════════╗
║                          COMPREHENSIVE TEST SUMMARY                       ║
╚════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════
Total: 59 | Passed: 59 | Failed: 0
🎉 ALL TESTS PASSED!
════════════════════════════════════════
```

---

## Verify Test Results ✓

### Success Indicators

- [ ] All 59 tests show ✅ PASS
- [ ] No ❌ FAIL markers
- [ ] Summary shows "Failed: 0"
- [ ] Final message: "🎉 ALL TESTS PASSED!"

### Test Phase Completion

- [ ] Phase 1: PO Management (8/8 passed)
- [ ] Phase 2: Return Traceability (4/4 passed)
- [ ] Phase 3: Recipe-SKU Validation (7/7 passed)
- [ ] Phase 4: Production FIFO Cost Tracking (10/10 passed)
- [ ] Phase 5: Waste Allocation & Tracking (8/8 passed)
- [ ] Phase 6: Batch Number Generation (5/5 passed)
- [ ] Phase 7: Profit Analysis Endpoints (6/6 passed)
- [ ] Phase 8: Waste & Efficiency Reporting (6/6 passed)
- [ ] Phase 9: E2E Integration Workflows (5/5 passed)

---

## Troubleshooting Common Issues 🔧

### ❌ "TEST-PROD-01 not found"

**Cause**: Test data not seeded

**Solution**:

```bash
cd hasal-pos-backend
npm run test:seed
```

---

### ❌ "Connection refused" or "ECONNREFUSED"

**Cause**: Backend server not running

**Solution**:

```bash
cd hasal-pos-backend
npm start
# Keep this running and run tests in new terminal
```

---

### ❌ "Authentication failed"

**Cause**: Admin credentials incorrect

**Solution**:

- Verify username: `admin`
- Verify password: `admin123`
- Check if admin user exists in database

---

### ❌ "Batch depletion test failed"

**Cause**: Insufficient material stock from previous test runs

**Solution**:

1. Delete test data from database:
   ```sql
   DELETE FROM production_runs WHERE batch_number LIKE 'PROD-%';
   DELETE FROM raw_material_batches WHERE batch_number LIKE 'TEST-BATCH-%';
   ```
2. Re-seed test data:
   ```bash
   npm run test:seed
   ```

---

### ❌ Random test failures

**Cause**: Test data corruption or race conditions

**Solution**:

1. Stop backend server
2. Re-seed test data: `npm run test:seed`
3. Restart backend: `npm start`
4. Re-run tests

---

## Post-Test Verification 🎯

### Database Checks

- [ ] Test products exist in `products` table
- [ ] Test SKUs have `average_cost` > 0 after production
- [ ] Test production runs have `batch_number` in format `PROD-YYYYMMDD-NNN`
- [ ] Finished goods batches in format `FG-{CODE}-YYYYMMDD-NNN`

### API Endpoint Checks

You can manually verify endpoints:

```bash
# Get profit summary
curl http://localhost:5000/api/products/profit-summary

# Get waste cost report
curl http://localhost:5000/api/production/waste-cost-report?month=12&year=2024

# Get efficiency report
curl http://localhost:5000/api/production/efficiency-report?start_date=2024-12-01&end_date=2024-12-31
```

---

## Clean Up (Optional) 🧹

To remove test data after testing:

```sql
-- Delete test products and related data
DELETE FROM products WHERE code LIKE 'TEST-PROD-%';

-- Delete test raw materials
DELETE FROM raw_materials WHERE code LIKE 'TEST-MAT-%';

-- Delete test suppliers
DELETE FROM suppliers WHERE code = 'TEST-SUP';

-- Delete test outlets
DELETE FROM outlets WHERE code = 'TEST-OUT';

-- Delete test production runs
DELETE FROM production_runs WHERE batch_number LIKE 'PROD-%';

-- Delete test batches
DELETE FROM raw_material_batches WHERE batch_number LIKE 'TEST-BATCH-%';
```

**OR** just re-seed fresh test data:

```bash
npm run test:seed
```

---

## Test Execution Log Template 📝

Use this to document your test run:

```
Test Execution Report
=====================
Date: ______________
Tester: ____________
Environment: [Dev/Staging/Prod]

Pre-Test Setup:
  [ ] Database ready
  [ ] Backend server running
  [ ] Test data seeded

Test Results:
  Total Tests: 59
  Passed: ____
  Failed: ____

Failed Tests (if any):
  1. ___________________________
  2. ___________________________

Notes:
  _______________________________
  _______________________________

Status: [PASS / FAIL]
Signature: ___________
```

---

## Performance Benchmarks ⏱️

Expected execution times:

| Phase                | Time        |
| -------------------- | ----------- |
| Phase 1-2 (Legacy)   | 10-15s      |
| Phase 3 (Recipe-SKU) | 8-12s       |
| Phase 4 (FIFO Costs) | 15-20s      |
| Phase 5 (Waste)      | 12-18s      |
| Phase 6 (Batch Gen)  | 6-10s       |
| Phase 7 (Profit)     | 8-12s       |
| Phase 8 (Reporting)  | 8-12s       |
| Phase 9 (E2E)        | 15-25s      |
| **Total**            | **90-120s** |

If tests take significantly longer:

- [ ] Check database performance
- [ ] Check server resources
- [ ] Verify network latency

---

## Sign-Off ✍️

### Test Completion Checklist

- [ ] All 59 tests passed
- [ ] No errors in test execution
- [ ] Backend logs show no errors
- [ ] Database data integrity verified
- [ ] Documentation reviewed
- [ ] Ready for next phase (UAT/Production)

**Tested By**: ******\_\_\_******  
**Date**: ******\_\_\_******  
**Status**: [ ] APPROVED [ ] NEEDS REVIEW

---

## Quick Reference Commands 🚀

```bash
# Full test workflow (copy-paste friendly)

# Terminal 1: Seed data
cd hasal-pos-backend
npm run test:seed

# Terminal 1: Start server
npm start

# Terminal 2: Run tests
cd C:\Mithuranga\spices-pos
.\COMPREHENSIVE_TEST_SUITE.ps1
```

---

**Version**: 3.0  
**Last Updated**: January 2026  
**Total Tests**: 59  
**Estimated Time**: 2 minutes
