# Test Suite Quick Reference

## Quick Start (3 Commands)

```bash
# 1. Seed test data (REQUIRED - Run once before testing)
cd hasal-pos-backend
node scripts/seed-test-data.js

# 2. Start backend server (Keep running in separate terminal)
npm start

# 3. Run comprehensive tests (In new PowerShell window)
cd ..
.\COMPREHENSIVE_TEST_SUITE.ps1
```

## Test Coverage Summary

| Phase | Feature Area          | Tests  | Key Validations                            |
| ----- | --------------------- | ------ | ------------------------------------------ |
| **1** | PO Management         | 8      | Partial receipts, inspection, cancellation |
| **2** | Return Traceability   | 4      | Batch genealogy, origin tracking           |
| **3** | Recipe-SKU Validation | 7      | SKU relationships, validation rules        |
| **4** | FIFO Cost Tracking    | 10     | Cost calculation, batch consumption        |
| **5** | Waste Allocation      | 8      | Waste costs, yield efficiency              |
| **6** | Batch Generation      | 5      | Number formats, uniqueness                 |
| **7** | Profit Analysis       | 6      | Sale profit, margins, categorization       |
| **8** | Reporting             | 6      | Waste reports, efficiency trends           |
| **9** | E2E Workflows         | 5      | Complete integration flows                 |
|       | **TOTAL**             | **59** | All P1-P5 features                         |

## Test Data Created

### Products (3)

```
TEST-PROD-01 → Premium Curry (40% margin target)
  ├─ 100g SKU @ LKR 1000
  └─ 500g SKU @ LKR 4500

TEST-PROD-02 → Economy Mix (15% margin target)
  └─ 100g SKU @ LKR 800

TEST-PROD-03 → Waste Tracker
  └─ 100g SKU @ LKR 1200
```

### Materials (3) + FIFO Batches

```
TEST-MAT-01 (Turmeric)
  ├─ Batch 1: 10kg @ 1000/kg (old)
  └─ Batch 2: 10kg @ 1200/kg (new) ← For FIFO testing

TEST-MAT-02 (Chili)
  └─ Batch 1: 10kg @ 500/kg

TEST-MAT-03 (Coriander)
  └─ Batch 1: 10kg @ 300/kg
```

### Recipes (3)

```
TEST-RECIPE-01 → Premium Curry (High margin, FIFO testing)
TEST-RECIPE-02 → Economy Mix (Low margin testing)
TEST-RECIPE-03 → Waste Tracker (Waste allocation testing)
```

## Expected Results

✅ **59/59 Tests Pass** - Full system validation

- All cost calculations accurate (±0.01 LKR)
- All batch numbers properly formatted
- All reports generate with correct data
- E2E workflows complete successfully

## Common Test Scenarios

### FIFO Cost Verification

```
Production 1 → Uses Batch 1 @ 1000/kg → Lower cost
Production 2 → Uses Batch 2 @ 1200/kg → Higher cost
Result: Different unit costs per production ✓
```

### Waste Cost Allocation

```
Material Cost: 1000 LKR
Output: 9 kg | Waste: 1 kg
Base Cost: 1000 / 10 = 100 LKR/kg
Waste Cost: 100 × 1 = 100 LKR ✓
Unit Cost: 100 LKR/kg (allocated to both output & waste) ✓
```

### Yield Efficiency

```
Planned: 10 kg | Actual: 8.5 kg
Yield: (8.5 / 10) × 100 = 85% ✓
```

### Profit Margin Categories

```
High: ≥30% → Green indicator
Medium: 15-30% → Yellow indicator
Low: <15% → Red indicator
```

## Batch Number Formats

```
Production: PROD-20241225-001
           └─────┬────┘ └┬┘
                 │       └─ Sequence (001-999)
                 └───────── Date (YYYYMMDD)

Finished Goods: FG-TEST-PROD-01-20241225-001
               │  └────┬────┘ └─────┬────┘ └┬┘
               │       │             │       └─ Sequence
               │       │             └──────── Date
               │       └────────────────────── Product Code
               └────────────────────────────── Prefix
```

## Troubleshooting

| Issue                       | Solution                                      |
| --------------------------- | --------------------------------------------- |
| ❌ "TEST-PROD-01 not found" | Run `node scripts/seed-test-data.js`          |
| ❌ Connection refused       | Start backend with `npm start`                |
| ❌ Authentication failed    | Check username: `admin`, password: `admin123` |
| ❌ Tests fail randomly      | Re-seed data or check material stock          |

## Test Execution Time

- **Full Suite**: 90-120 seconds
- **Per Phase**: 6-25 seconds
- **Average per Test**: ~2 seconds

## Key Endpoints Tested

### Production

- `POST /api/production/runs` - Start production
- `POST /api/production/runs/:id/complete` - Complete with costs
- `GET /api/production/waste-cost-report` - Waste reporting
- `GET /api/production/efficiency-report` - Efficiency trends

### Products

- `GET /api/products/profit-summary` - Product profitability
- `GET /api/products/:id/skus/:sku/profit` - SKU profit analysis

### Sales

- `POST /api/sales/invoices` - Create sale
- `GET /api/sales/invoices/:id/profit` - Sale profit
- `GET /api/sales/profit-summary` - Sales profit summary

### Recipes

- `POST /api/recipes` - Create with SKU (required)
- `GET /api/recipes/:id` - Query with SKU details
- `PUT /api/recipes/:id` - Update SKU relationship

## Next Steps After Tests Pass

1. ✅ **Review Reports** - Check UI for profit, waste, efficiency reports
2. ✅ **Test Frontend** - Manually verify all new UI components
3. ✅ **Performance Test** - Run with larger datasets
4. ✅ **User Acceptance** - Demo to stakeholders
5. ✅ **Production Deploy** - Deploy to production environment

---

**Test Suite Version**: 3.0  
**Features Covered**: P1-P5 (Recipe-SKU, FIFO, Waste, Profit, Reporting)  
**Last Updated**: January 2026
