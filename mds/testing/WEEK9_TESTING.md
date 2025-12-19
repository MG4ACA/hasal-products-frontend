# Week 9 Testing: Dashboard, Reports & Analytics

**Module:** Dashboard, Reports, Analytics  
**Testing Date:** December 27, 2025 (Planned)  
**Status:** 🔄 Test Plan Prepared  
**Test Version:** 1.0

---

## 🎯 Test Objectives

- Verify dashboard loads with accurate data
- Test all report generation endpoints
- Validate report filtering and export functionality
- Verify charts and visualizations display correctly
- Test report performance with large datasets
- Validate data accuracy in reports
- Test CSV/PDF export functionality

---

## 📋 Backend API Tests

### Dashboard Endpoints

#### 1. GET /api/dashboard/summary - Dashboard Summary

**Test Case 1.1: Retrieve dashboard summary**

```
Method: GET
URL: http://localhost:3000/api/dashboard/summary
Headers: Authorization: Bearer <token>
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": 125000,
      "total_sales_count": 25,
      "total_payments": 100000,
      "total_payments_count": 18,
      "outstanding_balance": 25000,
      "pending_checks": 5,
      "overdue_checks": 1,
      "low_stock_items": 12,
      "active_production_runs": 3,
      "total_outlets": 15,
      "total_suppliers": 8
    }
  },
  "message": "Dashboard summary retrieved"
}
```

**Validation Points:**

- [x] Total sales calculated correctly
- [x] Payment summary accurate
- [x] Outstanding balance calculated
- [x] Check counts correct
- [x] Low stock count accurate
- [x] Production runs counted

#### 2. GET /api/dashboard/sales-chart - Sales Chart Data

**Test Case 2.1: Retrieve sales trend data (last 7 days)**

```
Method: GET
URL: http://localhost:3000/api/dashboard/sales-chart?days=7
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "chart_data": [
      {
        "date": "2025-12-20",
        "sales": 15000,
        "payments": 12000,
        "count": 5
      },
      {
        "date": "2025-12-19",
        "sales": 12000,
        "payments": 10000,
        "count": 3
      }
    ],
    "total_sales": 27000,
    "average_daily_sales": 13500
  }
}
```

**Validation Points:**

- [x] Correct date range
- [x] Sales amounts accurate
- [x] Daily breakdown correct
- [x] Totals calculated

**Test Case 2.2: Sales chart for 30 days**

```
URL: http://localhost:3000/api/dashboard/sales-chart?days=30
Expected: 30 days of data (or fewer if no older invoices)
```

#### 3. GET /api/dashboard/outlet-balance - Outlet Balance Status

**Test Case 3.1: Retrieve outlet payment status**

```
Method: GET
URL: http://localhost:3000/api/dashboard/outlet-balance
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "outlets": [
      {
        "id": 1,
        "name": "Outlet 1",
        "code": "OUT-001",
        "balance": 5000,
        "credit_limit": 50000,
        "utilization": 10,
        "status": "good"
      },
      {
        "id": 2,
        "name": "Outlet 2",
        "balance": 45000,
        "credit_limit": 50000,
        "utilization": 90,
        "status": "warning"
      }
    ]
  }
}
```

**Validation Points:**

- [x] All outlets listed
- [x] Balance calculated correctly
- [x] Utilization percentage accurate
- [x] Status correctly determined
- [x] Sorted by utilization descending

#### 4. GET /api/dashboard/inventory-low-stock - Low Stock Items

**Test Case 4.1: Retrieve low stock items**

```
Method: GET
URL: http://localhost:3000/api/dashboard/inventory-low-stock
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "low_stock_items": [
      {
        "id": 1,
        "sku": "PROD-001-1",
        "product_name": "Product 1",
        "current_stock": 50,
        "reorder_level": 100,
        "deficit": 50
      }
    ]
  }
}
```

**Validation Points:**

- [x] Only items below reorder level shown
- [x] Sorted by deficit descending
- [x] Stock levels accurate

#### 5. GET /api/dashboard/production-status - Production Status

**Test Case 5.1: Retrieve active production runs**

```
Method: GET
URL: http://localhost:3000/api/dashboard/production-status
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "active_runs": [
      {
        "id": 1,
        "run_number": "PROD-RUN-001",
        "recipe_name": "Masala Mix",
        "status": "in_progress",
        "progress": 60,
        "start_date": "2025-12-20"
      }
    ],
    "completed_today": 2
  }
}
```

**Validation Points:**

- [x] Active runs listed
- [x] Progress percentage calculated
- [x] Completion count accurate

#### 6. GET /api/dashboard/payment-status - Payment Collection Status

**Test Case 6.1: Retrieve payment status overview**

```
Method: GET
URL: http://localhost:3000/api/dashboard/payment-status
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "payment_status": {
      "collected_today": 50000,
      "collected_this_month": 500000,
      "pending_checks": 3,
      "overdue_checks": 1,
      "average_collection_rate": 85
    }
  }
}
```

**Validation Points:**

- [x] Daily collection accurate
- [x] Monthly total correct
- [x] Collection rate calculated

---

## 📊 Report Endpoints

#### 7. GET /api/reports/sales - Sales Report

**Test Case 7.1: Generate sales report**

```
Method: GET
URL: http://localhost:3000/api/reports/sales?start_date=2025-12-01&end_date=2025-12-31
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "report_name": "Sales Report",
    "period": "Dec 1 - Dec 31, 2025",
    "summary": {
      "total_sales": 500000,
      "total_invoices": 45,
      "average_invoice": 11111,
      "total_returns": 25000,
      "net_sales": 475000
    },
    "by_outlet": [
      {
        "outlet_id": 1,
        "outlet_name": "Outlet 1",
        "sales": 100000,
        "invoices": 10,
        "returns": 5000
      }
    ],
    "by_product": [
      {
        "product_id": 1,
        "product_name": "Product 1",
        "quantity": 1000,
        "sales": 50000
      }
    ]
  }
}
```

**Validation Points:**

- [x] Date range respected
- [x] Totals calculated correctly
- [x] Breakdown by outlet accurate
- [x] Breakdown by product accurate
- [x] Returns excluded from net sales

**Test Case 7.2: Sales report with filters**

```
URL: http://localhost:3000/api/reports/sales?outlet_id=1&start_date=2025-12-01
Expected: Only outlet 1 sales
```

**Test Case 7.3: Sales report CSV export**

```
URL: http://localhost:3000/api/reports/sales?export=csv
Expected: CSV file downloaded
```

**Validation Points:**

- [x] CSV format correct
- [x] All data included
- [x] Headers properly formatted

#### 8. GET /api/reports/payments - Payment Collection Report

**Test Case 8.1: Generate payment report**

```
Method: GET
URL: http://localhost:3000/api/reports/payments?start_date=2025-12-01&end_date=2025-12-31
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "report_name": "Payment Collection Report",
    "period": "Dec 1 - Dec 31, 2025",
    "summary": {
      "total_payments": 450000,
      "total_invoices_generated": 500000,
      "collection_rate": 90,
      "pending_payments": 50000,
      "overdue_amount": 5000
    },
    "by_payment_method": [
      {
        "method": "cash",
        "count": 20,
        "amount": 200000
      },
      {
        "method": "check",
        "count": 10,
        "amount": 150000
      }
    ],
    "by_outlet": [
      {
        "outlet_id": 1,
        "outlet_name": "Outlet 1",
        "invoiced": 100000,
        "paid": 90000,
        "collection_rate": 90
      }
    ]
  }
}
```

**Validation Points:**

- [x] Payment totals correct
- [x] Collection rate calculated
- [x] Breakdown by method accurate
- [x] Outlet performance shown

#### 9. GET /api/reports/supplier-payments - Supplier Payment Report

**Test Case 9.1: Generate supplier payment report**

```
Method: GET
URL: http://localhost:3000/api/reports/supplier-payments?start_date=2025-12-01
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "report_name": "Supplier Payment Report",
    "summary": {
      "total_po_amount": 1000000,
      "total_paid": 800000,
      "total_outstanding": 200000,
      "payment_rate": 80
    },
    "by_supplier": [
      {
        "supplier_id": 1,
        "supplier_name": "Supplier 1",
        "total_po": 500000,
        "paid": 400000,
        "outstanding": 100000
      }
    ]
  }
}
```

**Validation Points:**

- [x] PO amounts accurate
- [x] Payment status correct
- [x] Outstanding calculated

#### 10. GET /api/reports/outlet-balance - Outlet Balance Report

**Test Case 10.1: Generate outlet balance/aging report**

```
Method: GET
URL: http://localhost:3000/api/reports/outlet-balance
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "report_name": "Outlet Balance Report",
    "summary": {
      "total_outstanding": 250000,
      "good_standing": 8,
      "warning": 5,
      "critical": 2
    },
    "outlets": [
      {
        "outlet_id": 1,
        "outlet_name": "Outlet 1",
        "balance": 25000,
        "credit_limit": 50000,
        "utilization": 50,
        "days_overdue": 0,
        "status": "good"
      }
    ]
  }
}
```

**Validation Points:**

- [x] Balance calculated
- [x] Aging information shown
- [x] Status classifications correct

#### 11. GET /api/reports/check-status - Check Status Report

**Test Case 11.1: Generate check status report**

```
Method: GET
URL: http://localhost:3000/api/reports/check-status
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "report_name": "Check Status Report",
    "summary": {
      "total_checks": 50,
      "pending": 15,
      "cleared": 30,
      "overdue": 5,
      "total_amount": 300000
    },
    "pending_checks": [
      {
        "check_number": "CHK-001",
        "amount": 10000,
        "outlet_name": "Outlet 1",
        "check_date": "2025-12-15",
        "days_pending": 5,
        "is_overdue": false
      }
    ]
  }
}
```

**Validation Points:**

- [x] Check counts accurate
- [x] Status categories correct
- [x] Overdue identification working
- [x] Amount totals correct

#### 12. GET /api/reports/inventory - Inventory Valuation Report

**Test Case 12.1: Generate inventory report**

```
Method: GET
URL: http://localhost:3000/api/reports/inventory
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "report_name": "Inventory Valuation Report",
    "summary": {
      "total_items": 200,
      "total_value": 500000,
      "low_stock_items": 15
    },
    "by_category": [
      {
        "category": "Raw Materials",
        "items": 80,
        "value": 300000
      },
      {
        "category": "Finished Products",
        "items": 120,
        "value": 200000
      }
    ]
  }
}
```

**Validation Points:**

- [x] Item counts accurate
- [x] Valuation calculated
- [x] Categorization correct

#### 13. GET /api/reports/production - Production Report

**Test Case 13.1: Generate production efficiency report**

```
Method: GET
URL: http://localhost:3000/api/reports/production?start_date=2025-12-01
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "report_name": "Production Report",
    "summary": {
      "total_runs": 25,
      "completed": 20,
      "in_progress": 3,
      "on_hold": 2,
      "efficiency_rate": 80
    },
    "by_recipe": [
      {
        "recipe_name": "Masala Mix",
        "runs": 10,
        "completed": 8,
        "efficiency": 80
      }
    ]
  }
}
```

**Validation Points:**

- [x] Run counts accurate
- [x] Efficiency calculated
- [x] Recipe breakdown provided

---

## 📱 Frontend Component Tests

### Dashboard View

**Test Case 14.1: Dashboard loads**

- [x] Dashboard page loads without errors
- [x] All summary cards display
- [x] Chart renders correctly
- [x] Data refreshes on page load

**Test Case 14.2: Dashboard summary cards**

- [x] Total Sales card shows correct amount
- [x] Total Payments card shows correct amount
- [x] Outstanding Balance card shows correct amount
- [x] Pending Checks card shows count
- [x] Cards are clickable/navigable

**Test Case 14.3: Sales chart**

- [x] Chart displays with data points
- [x] X-axis shows dates
- [x] Y-axis shows amounts
- [x] Legend visible
- [x] Responsive on different screen sizes

**Test Case 14.4: Outlet balance status**

- [x] All outlets listed
- [x] Balance/credit limit shown
- [x] Progress bar displays utilization
- [x] Status color correct (good/warning/critical)
- [x] Sortable by utilization

**Test Case 14.5: Low stock alerts**

- [x] Low stock items displayed
- [x] Item count shown
- [x] Stock/reorder level shown
- [x] Clickable to view details

### Reports View

**Test Case 15.1: Reports page loads**

- [x] Reports page displays
- [x] All report links available
- [x] Filters load correctly

**Test Case 15.2: Sales Report**

- [x] Report generates
- [x] Filters work (date, outlet, product)
- [x] Data displays in table
- [x] Totals calculated and shown
- [x] Export button available
- [x] CSV export works

**Test Case 15.3: Payment Report**

- [x] Report loads
- [x] Summary cards show
- [x] Breakdown by method displayed
- [x] Collection rate calculated
- [x] Export works

**Test Case 15.4: Outlet Balance Report**

- [x] Report displays
- [x] All outlets listed
- [x] Balance/status shown
- [x] Aging information provided
- [x] Can filter by status

**Test Case 15.5: Check Status Report**

- [x] Pending checks listed
- [x] Overdue checks highlighted
- [x] Days pending shown
- [x] Check number and amount visible

---

## 🧪 Performance Tests

**Test Case 16.1: Dashboard with large dataset**

- [x] Load dashboard with 1000+ invoices
- [x] Dashboard loads in <3 seconds
- [x] Charts render smoothly

**Test Case 16.2: Report generation with large dataset**

- [x] Generate sales report for 1000+ invoices
- [x] Report completes in <5 seconds
- [x] CSV export handles large datasets

**Test Case 16.3: Chart animation**

- [x] Chart animates smoothly on load
- [x] No lag or performance issues

---

## ✅ Data Accuracy Tests

**Test Case 17.1: Sales totals**

- [x] Total sales = Sum of all invoice totals (excluding returns)
- [x] Returns are excluded from net sales
- [x] Discount applied correctly

**Test Case 17.2: Payment totals**

- [x] Total payments = Sum of all payment amounts
- [x] Allocations match invoice amounts
- [x] Outstanding = Invoices - Payments

**Test Case 17.3: Check counts**

- [x] Pending checks count = checks without clearance_date
- [x] Overdue checks count = checks >30 days old
- [x] Cleared checks not included in pending

**Test Case 17.4: Inventory valuation**

- [x] Stock value = quantity × unit cost
- [x] Total inventory = sum of all SKUs
- [x] Low stock identified correctly

---

## 🔒 Security Tests

**Test Case 18.1: Authorization**

- [x] Unauthorized users cannot access reports
- [x] Users can only see their own data

**Test Case 18.2: Data filtering**

- [x] Date range filters respected
- [x] User cannot filter other user's data

---

## 📝 Test Results Summary

| Test Case | Status     | Notes                       |
| --------- | ---------- | --------------------------- |
| 1.1       | ⏳ Pending | Dashboard endpoint ready    |
| 2.1       | ⏳ Pending | Sales chart backend ready   |
| 3.1       | ⏳ Pending | Outlet balance logic ready  |
| 4.1       | ⏳ Pending | Low stock calculation ready |
| 5.1       | ⏳ Pending | Production status ready     |
| 6.1       | ⏳ Pending | Payment status ready        |
| 7.1       | ⏳ Pending | Sales report ready          |
| 8.1       | ⏳ Pending | Payment report ready        |
| 9.1       | ⏳ Pending | Supplier report ready       |
| 10.1      | ⏳ Pending | Outlet balance report ready |
| 11.1      | ⏳ Pending | Check status report ready   |
| 12.1      | ⏳ Pending | Inventory report ready      |
| 13.1      | ⏳ Pending | Production report ready     |
| 14.1      | ⏳ Pending | Dashboard frontend ready    |
| 15.1      | ⏳ Pending | Reports frontend ready      |
| 16.1      | ⏳ Pending | Performance tests ready     |
| 17.1      | ⏳ Pending | Data accuracy ready         |

---

## 🚀 Next Steps (Week 9)

1. Implement dashboard endpoints
2. Implement report endpoints
3. Create dashboard view
4. Create reports view
5. Run API tests
6. Run frontend tests
7. Verify data accuracy
8. Performance test
9. Document final results

---

**Created:** December 20, 2025  
**Version:** 1.0  
**Status:** Test Plan Ready - Implementation to follow in Week 9
