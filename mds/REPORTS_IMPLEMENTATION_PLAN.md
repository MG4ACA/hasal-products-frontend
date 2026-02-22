# Reports Section - Comprehensive Implementation Plan

**Date:** February 14, 2026  
**Status:** Planning Complete - Ready for Implementation  
**Approach:** Phased Implementation  
**Export Formats:** CSV + PDF

---

## 📊 Executive Summary

### Current Status

- ✅ **Dashboard** - Complete with KPIs and charts
- ✅ **Basic Reports** - Profit Analysis, Waste Cost, Efficiency (3 reports)
- ❌ **Comprehensive Business Reports** - Missing 7 critical reports

### Implementation Scope

We will build a complete Reports module with:

1. **Reports Hub** - Central navigation for all reports
2. **7 New Report Endpoints** (Backend)
3. **7 New Report Views** (Frontend)
4. **Export System** - CSV & PDF generation
5. **Print Functionality** - Browser-based printing

---

## 🎯 Phase Breakdown

### **Phase 1: Foundation** (Day 1-2, ~8 hours)

#### 1.1 Reports Hub Page

**File:** `src/views/reports/ReportsIndex.vue`

**Features:**

- Grid layout with report cards
- Categories: Sales, Financial, Inventory, Production
- Each card shows:
  - Icon
  - Report name
  - Description
  - "View Report" button
  - Last generated timestamp (optional)

#### 1.2 Export Utilities

**Files:**

- `src/utils/exportHelpers.js` - CSV & PDF helpers
- `src/utils/reportFormatters.js` - Data formatting

#### 1.3 Backend Infrastructure

**Files:**

- `hasal-pos-backend/controllers/reportsController.js` (new)
- `hasal-pos-backend/routes/reportsRoutes.js` (new)
- Update: `hasal-pos-backend/app.js`

---

### **Phase 2: Sales & Payment Reports** (Day 3-4, ~10 hours)

#### 2.1 Sales Report

**Backend:** `GET /api/reports/sales`

**Features:**

- Date range filtering
- Filter by outlet, product, route
- Sales summary with returns
- Breakdown by outlet
- Breakdown by product
- Top selling items
- CSV/PDF export

**Parameters:**

```javascript
{
  start_date: '2026-01-01',
  end_date: '2026-01-31',
  outlet_id?: 1,
  product_id?: 5,
  route_id?: 2,
  export?: 'csv' | 'pdf'
}
```

**Response:**

```javascript
{
  report_name: "Sales Report",
  period: "Jan 1 - Jan 31, 2026",
  summary: {
    total_sales: 500000,
    total_invoices: 45,
    average_invoice: 11111,
    total_returns: 25000,
    net_sales: 475000
  },
  by_outlet: [...],
  by_product: [...],
  by_route: [...],
  top_products: [...]
}
```

**Frontend:** `src/views/reports/SalesReport.vue`

---

#### 2.2 Payment Collection Report

**Backend:** `GET /api/reports/payments`

**Features:**

- Payment vs Invoice analysis
- Collection rate calculation
- Payment method breakdown
- Outlet payment performance
- Pending payments summary
- Overdue payments

**Response:**

```javascript
{
  report_name: "Payment Collection Report",
  summary: {
    total_payments: 450000,
    total_invoices_generated: 500000,
    collection_rate: 90,
    pending_payments: 50000,
    overdue_amount: 5000
  },
  by_payment_method: [...],
  by_outlet: [...],
  overdue_invoices: [...]
}
```

**Frontend:** `src/views/reports/PaymentCollectionReport.vue`

---

### **Phase 3: Financial Reports** (Day 5-6, ~10 hours)

#### 3.1 Supplier Payment Report

**Backend:** `GET /api/reports/supplier-payments`

**Features:**

- PO amount vs payments
- Outstanding supplier balances
- Payment history by supplier
- Aging analysis
- Payment terms tracking

**Frontend:** `src/views/reports/SupplierPaymentReport.vue`

---

#### 3.2 Outlet Balance & Aging Report

**Backend:** `GET /api/reports/outlet-balance`

**Features:**

- Current balance per outlet
- Credit limit utilization
- Aging buckets (0-30, 31-60, 61-90, 90+)
- Status classification (Good, Warning, Critical)
- Payment behavior score
- Overdue invoices list

**Response:**

```javascript
{
  report_name: "Outlet Balance Report",
  summary: {
    total_outstanding: 250000,
    good_standing: 8,
    warning: 5,
    critical: 2
  },
  outlets: [
    {
      outlet_id: 1,
      outlet_name: "ABC Store",
      balance: 25000,
      credit_limit: 50000,
      utilization: 50,
      aging: {
        current: 15000,
        days_30: 5000,
        days_60: 3000,
        days_90: 2000
      },
      status: "good"
    }
  ]
}
```

**Frontend:** `src/views/reports/OutletBalanceReport.vue`

---

#### 3.3 Check Status Report

**Backend:** `GET /api/reports/check-status`

**Features:**

- Pending checks
- Cleared checks
- Overdue checks (>30 days)
- Bounced checks
- Check aging analysis
- By outlet breakdown

**Frontend:** `src/views/reports/CheckStatusReport.vue`

---

### **Phase 4: Inventory & Production Reports** (Day 7-8, ~10 hours)

#### 4.1 Inventory Valuation Report

**Backend:** `GET /api/reports/inventory`

**Features:**

- Raw materials inventory
- Finished goods inventory
- Stock valuation (FIFO/Average cost)
- Low stock items
- Zero stock items
- High-value items
- By category breakdown
- Batch expiry tracking

**Response:**

```javascript
{
  report_name: "Inventory Valuation Report",
  as_of_date: "2026-01-31",
  summary: {
    raw_materials_value: 300000,
    finished_goods_value: 200000,
    total_value: 500000,
    total_items: 200,
    low_stock_items: 15
  },
  raw_materials: [...],
  finished_goods: [...],
  low_stock_alerts: [...]
}
```

**Frontend:** `src/views/reports/InventoryReport.vue`

---

#### 4.2 Production Report

**Backend:** `GET /api/reports/production`

**Features:**

- Production runs summary
- By recipe analysis
- Efficiency metrics
- Waste analysis
- Material consumption
- Output breakdown
- Cost analysis per run

**Response:**

```javascript
{
  report_name: "Production Report",
  period: "Jan 1 - Jan 31, 2026",
  summary: {
    total_runs: 25,
    completed: 20,
    in_progress: 3,
    on_hold: 2,
    efficiency_rate: 92.5
  },
  by_recipe: [...],
  waste_analysis: {...},
  cost_summary: {...}
}
```

**Frontend:** `src/views/reports/ProductionReport.vue`

---

## 📁 File Structure

```
hasal-pos-backend/
├── controllers/
│   └── reportsController.js          ← NEW
├── routes/
│   └── reportsRoutes.js              ← NEW
└── app.js                            ← UPDATED

src/
├── views/
│   └── reports/
│       ├── ReportsIndex.vue          ← NEW (Hub)
│       ├── SalesReport.vue           ← NEW
│       ├── PaymentCollectionReport.vue ← NEW
│       ├── SupplierPaymentReport.vue  ← NEW
│       ├── OutletBalanceReport.vue    ← NEW
│       ├── CheckStatusReport.vue      ← NEW
│       ├── InventoryReport.vue        ← NEW
│       ├── ProductionReport.vue       ← NEW
│       ├── ProfitAnalysis.vue         ← EXISTS
│       ├── WasteCostReport.vue        ← EXISTS
│       └── EfficiencyReport.vue       ← EXISTS
├── utils/
│   ├── exportHelpers.js              ← NEW
│   └── reportFormatters.js           ← NEW
├── services/
│   └── reportService.js              ← NEW
├── router/
│   └── index.js                      ← UPDATED
└── components/
    └── layout/
        └── Sidebar.vue               ← UPDATED
```

---

## 🏗️ Technical Specifications

### Report Common Features

All reports will include:

- ✅ Date range filters (from/to)
- ✅ Additional filters (outlet, product, supplier, etc.)
- ✅ Summary cards with KPIs
- ✅ Detailed data table with sorting & pagination
- ✅ Export to CSV button
- ✅ Export to PDF button
- ✅ Print button
- ✅ Refresh/Reload button
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Responsive design

### Export Specifications

#### CSV Export

- Headers included
- Comma-separated values
- UTF-8 encoding
- Filename: `{report_name}_{date}.csv`
- Auto-download

#### PDF Export

- Company header
- Report title and filters
- Summary section
- Detailed data table
- Page numbers
- Generated timestamp
- Filename: `{report_name}_{date}.pdf`

### Performance Targets

- Report generation: <3 seconds
- Export: <2 seconds
- Page load: <1 second

---

## 🎨 UI/UX Guidelines

### Reports Hub Layout

```
┌──────────────────────────────────────────────────┐
│  Reports & Analytics                              │
│  Comprehensive business intelligence reports     │
└──────────────────────────────────────────────────┘

┌─────────────── SALES REPORTS ─────────────────┐

┌─────────┐  ┌─────────┐  ┌─────────┐
│  📊     │  │  💰     │  │  👥     │
│ Sales   │  │ Payment │  │ Top     │
│ Report  │  │ Report  │  │ Products│
└─────────┘  └─────────┘  └─────────┘

┌────────────── FINANCIAL REPORTS ──────────────┐

┌─────────┐  ┌─────────┐  ┌─────────┐
│  🏪     │  │  🏦     │  │  💳     │
│ Outlet  │  │Supplier │  │ Check   │
│ Balance │  │ Payment │  │ Status  │
└─────────┘  └─────────┘  └─────────┘

┌───────── INVENTORY & PRODUCTION ──────────────┐

┌─────────┐  ┌─────────┐
│  📦     │  │  🏭     │
│Inventory│  │Production│
│ Report  │  │ Report  │
└─────────┘  └─────────┘
```

### Individual Report Layout

```
┌──────────────────────────────────────────────────┐
│  Report Name                          🔄 Refresh  │
├──────────────────────────────────────────────────┤
│  Filters: [Date Range] [Outlet] [Apply]          │
├──────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ KPI 1   │  │ KPI 2   │  │ KPI 3   │          │
│  └─────────┘  └─────────┘  └─────────┘          │
├──────────────────────────────────────────────────┤
│  Data Table with Pagination                      │
│  - Column sorting                                │
│  - Search                                        │
│  - Row selection                                 │
├──────────────────────────────────────────────────┤
│  [📄 CSV] [📑 PDF] [🖨️ Print]                   │
└──────────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Unit Tests

- Report controller functions
- Export utility functions
- Data formatting

### Integration Tests

- API endpoints with various filters
- Export functionality
- Data accuracy

### Manual Tests

- UI functionality
- Print preview
- Export downloads
- Responsive design
- Error scenarios

---

## 📝 Implementation Checklist

### Phase 1: Foundation ✅

- [ ] Create ReportsIndex.vue (Hub)
- [ ] Create exportHelpers.js
- [ ] Create reportFormatters.js
- [ ] Create reportService.js
- [ ] Create reportsController.js (empty shell)
- [ ] Create reportsRoutes.js
- [ ] Update app.js (add reports routes)
- [ ] Update Sidebar.vue (add Reports menu)
- [ ] Update router (add reports routes)

### Phase 2: Sales & Payment Reports ✅

- [ ] Implement GET /api/reports/sales
- [ ] Implement GET /api/reports/payments
- [ ] Create SalesReport.vue
- [ ] Create PaymentCollectionReport.vue
- [ ] Test sales report functionality
- [ ] Test payment report functionality

### Phase 3: Financial Reports ✅

- [ ] Implement GET /api/reports/supplier-payments
- [ ] Implement GET /api/reports/outlet-balance
- [ ] Implement GET /api/reports/check-status
- [ ] Create SupplierPaymentReport.vue
- [ ] Create OutletBalanceReport.vue
- [ ] Create CheckStatusReport.vue
- [ ] Test all financial reports

### Phase 4: Inventory & Production ✅

- [ ] Implement GET /api/reports/inventory
- [ ] Implement GET /api/reports/production
- [ ] Create InventoryReport.vue
- [ ] Create ProductionReport.vue
- [ ] Test inventory & production reports

### Phase 5: Export & Polish ✅

- [ ] Implement CSV export for all reports
- [ ] Implement PDF export for all reports
- [ ] Add print functionality
- [ ] Performance optimization
- [ ] UI polish and responsiveness
- [ ] Documentation updates

---

## ⏱️ Time Estimates

| Phase     | Tasks                       | Estimated Time                   |
| --------- | --------------------------- | -------------------------------- |
| Phase 1   | Foundation & Infrastructure | 8 hours                          |
| Phase 2   | Sales & Payment Reports     | 10 hours                         |
| Phase 3   | Financial Reports           | 10 hours                         |
| Phase 4   | Inventory & Production      | 10 hours                         |
| Phase 5   | Export & Polish             | 6 hours                          |
| **TOTAL** |                             | **44 hours** (~1 week full-time) |

**Phased Delivery:**

- End of Day 2: Reports Hub + Infrastructure
- End of Day 4: Sales & Payment reports working
- End of Day 6: Financial reports complete
- End of Day 8: All reports complete with export

---

## 🚀 Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Start Phase 1** - Build foundation (Hub + Infrastructure)
3. **Incremental delivery** - Complete and test each phase
4. **User feedback** - Gather feedback after each phase
5. **Iterate** - Refine based on actual usage

---

**Ready to start implementation?** Let me know if you want to proceed with Phase 1!
