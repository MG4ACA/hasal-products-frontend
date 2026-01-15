# 🧪 Frontend Testing Guide for Batch Traceability Features

**Date Created:** January 15, 2026  
**Status:** Active Testing  
**Component:** Purchase Order Returns & Batch Traceability

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Test Cases by Feature](#test-cases-by-feature)
4. [Integration & Navigation Tests](#integration--navigation-tests)
5. [Data Validation Tests](#data-validation-tests)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Final Validation Checklist](#final-validation-checklist)

---

## Overview

This testing guide covers the new batch traceability features added to the POS system:

- **ReceivePO Component**: Enhanced return items form with source batch tracking
- **Batch Genealogy View**: Tree visualization of receipt batches and their returns
- **Return Origin Tracer**: Trace returns back to source receipt batches
- **Material Returns Summary**: Comprehensive returns reporting by material
- **Traceability Integration**: Navigation menu and routing

**Architecture:**

- Service Layer: `purchaseOrderService.js` (3 new methods)
- Store Layer: `purchaseOrder.js` (6 new state/action methods)
- Component Layer: 3 new views + 1 enhanced component
- Router: 3 new routes for traceability views

---

## Prerequisites & Setup

### 1. Backend Verification

**Ensure backend is running:**

```powershell
# Check server is running on port 3000
# Terminal output should show: "Server running on port 3000"
```

**Verify API endpoints are accessible:**

```powershell
# Test purchase orders endpoint
$h = @{ Authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMjk0NDAwMH0.U0Hs-_1Yz5HLHIHcQRB74jR9Uj5cPz5sFTzfWvCwuYI" }
$r = Invoke-RestMethod -Uri "http://localhost:3000/api/purchase-orders?limit=5" -Method Get -Headers $h -ErrorAction SilentlyContinue
Write-Host ($r | ConvertTo-Json -Depth 5)
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "data": [...],
    "page": 1,
    "limit": 5,
    "total": X
  }
}
```

### 2. Database Verification

**Check test data availability:**

```sql
-- Check if purchase orders exist
SELECT po_number, status, total_amount FROM purchase_orders ORDER BY id DESC LIMIT 5;

-- Check if batches exist
SELECT batch_number, batch_type, quantity, return_reason FROM raw_material_batches ORDER BY id DESC LIMIT 5;

-- Check if any PO has associated batches
SELECT po.po_number, rmb.batch_number, rmb.batch_type
FROM purchase_orders po
LEFT JOIN raw_material_batches rmb ON po.id = rmb.purchase_order_id
WHERE rmb.id IS NOT NULL LIMIT 5;
```

**If no test data exists:** Create sample purchase order and receive it with returns before testing.

### 3. Frontend Dev Server

```powershell
# Start frontend dev server
npm run dev

# Expected output:
# Local:   http://localhost:5173
# Network: use --host to expose
```

**Verify no console errors:**

- Press `F12` to open Developer Tools
- Check Console tab for any red errors
- Expand any warnings to verify they're not critical

---

## 📍 Creating Test Data (IMPORTANT)

> **Read This First:** [PO_SETUP_GUIDE.md](PO_SETUP_GUIDE.md) for detailed instructions on creating pending purchase orders.

**Quick Version:**

- Status in DB: `pending` → `partial` → `received` → `cancelled`
- NO "approved" status exists (frontend UI shows it but DB doesn't have it)
- Use **pending** POs for testing
- Create via API (fastest) or UI

---

## Test Cases by Feature

### TEST 1: ReceivePO Return Form ✅

**Location:** Purchase Orders list → Find "Pending" PO → Click **✓ (checkmark)** button in Actions column → Click "Receive"

#### 1.1 Return Tab Visibility

| Step                     | Expected Result                                                   | Status |
| ------------------------ | ----------------------------------------------------------------- | ------ |
| Click "Return Items" tab | Tab appears with form content                                     | ⬜     |
| Observe tab header       | Tab header shows "Return Items"                                   | ⬜     |
| Check tab content        | Form with Material, Source Batch, Qty, Reason, Disposition fields | ⬜     |

**Notes:**

- Tab should be next to "Receive Items" tab
- Should be part of TabView component

#### 1.2 Material Dropdown Population

| Step                    | Expected Result                           | Status |
| ----------------------- | ----------------------------------------- | ------ |
| Click Material dropdown | Dropdown opens with list                  | ⬜     |
| Observe options         | Each option shows: "Material Name (CODE)" | ⬜     |
| Count options           | Number matches PO items count             | ⬜     |
| Select a material       | Material value updates in state           | ⬜     |

**Example Options:**

```
- Turmeric Powder (MAT001)
- Chili Powder (MAT002)
- Cumin (MAT003)
```

#### 1.3 Source Batch Dropdown

| Step                        | Expected Result                                     | Status |
| --------------------------- | --------------------------------------------------- | ------ |
| Before material selection   | Dropdown disabled with hint "Select material first" | ⬜     |
| Select a material           | Dropdown becomes enabled                            | ⬜     |
| Click Source Batch dropdown | Shows batches for selected material                 | ⬜     |
| Observe batch format        | Shows "BATCH_NUMBER (Qty UNIT)"                     | ⬜     |
| Select a batch              | Value updates in form                               | ⬜     |

**Example Display:**

```
- RM-MAT001-20250115-001 (100 kg)
- RM-MAT001-20250115-002 (50 kg)
```

#### 1.4 Form Validation

| Test                         | Step                                      | Expected Result              | Status |
| ---------------------------- | ----------------------------------------- | ---------------------------- | ------ |
| **Incomplete Form**          | Click "Add Return" without filling fields | Button disabled (grayed out) | ⬜     |
| **With Material Only**       | Select material only                      | Button still disabled        | ⬜     |
| **With Material & Batch**    | Select material and batch                 | Button still disabled        | ⬜     |
| **With Reason Missing**      | Fill all but reason                       | Button disabled              | ⬜     |
| **With Disposition Missing** | Fill all but disposition                  | Button disabled              | ⬜     |
| **Complete Form**            | Fill all fields including quantity        | Button enabled (blue)        | ⬜     |

#### 1.5 Add Return Item

| Step                                                                                                                                              | Expected Result                                                                 | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| Fill return form:<br>- Material: Select one<br>- Source Batch: Select one<br>- Qty: 10<br>- Reason: "Damaged"<br>- Disposition: "Return to Stock" | All fields populate                                                             | ⬜     |
| Click "Add Return"                                                                                                                                | Return item added to table below                                                | ⬜     |
| Check table row                                                                                                                                   | Shows: Material Name, Qty (10 kg), Reason (Damaged tag), Disposition (blue tag) | ⬜     |
| Check form reset                                                                                                                                  | All fields clear for next entry                                                 | ⬜     |

**Table Display Expected:**

```
Material          | Quantity      | Reason    | Disposition
Turmeric Powder   | 10 kg         | Damaged   | Return to Stock
```

#### 1.6 Multiple Return Items

| Step                                   | Expected Result            | Status |
| -------------------------------------- | -------------------------- | ------ |
| Add first return                       | Item appears in table      | ⬜     |
| Add second return (different material) | Both items in table        | ⬜     |
| Add third return                       | All 3 items in table       | ⬜     |
| Check order                            | Items in order of addition | ⬜     |

#### 1.7 Remove Return Item

| Step             | Expected Result          | Status |
| ---------------- | ------------------------ | ------ |
| Add return item  | Item appears in table    | ⬜     |
| Click trash icon | Item removed immediately | ⬜     |
| Add again        | Can re-add item          | ⬜     |

#### 1.8 Return Reason Dropdown Options

| Reason Option | Expected Display | Status |
| ------------- | ---------------- | ------ |
| damaged       | "Damaged"        | ⬜     |
| expired       | "Expired"        | ⬜     |
| excess        | "Excess"         | ⬜     |
| quality_issue | "Quality Issue"  | ⬜     |
| wrong_item    | "Wrong Item"     | ⬜     |
| other         | "Other"          | ⬜     |

#### 1.9 Disposition Toggle

| Option            | Tag Display           | Color | Status |
| ----------------- | --------------------- | ----- | ------ |
| "Return to Stock" | "Return to Stock" tag | Blue  | ⬜     |
| "Dispose"         | "Dispose" tag         | Red   | ⬜     |

#### 1.10 Form Submission with Returns

| Step                                   | Expected Result                         | Status |
| -------------------------------------- | --------------------------------------- | ------ |
| Fill Receive Items tab with quantities | Receive items populated                 | ⬜     |
| Add return items in Return tab         | Returns added to table                  | ⬜     |
| Click "Receive Purchase Order" button  | Loading state visible (spinner)         | ⬜     |
| Wait for response                      | Success toast notification appears      | ⬜     |
| Check dialog closes                    | Dialog dismisses automatically          | ⬜     |
| Verify PO status                       | PO status changes to "received" in list | ⬜     |

#### 1.11 Network Payload Verification

Open DevTools Network tab → Filter "purchase-orders" → Click Receive

**Expected POST to `/purchase-orders/:id/receive`:**

```json
{
  "received_date": "2025-01-15",
  "received_items": [
    {
      "raw_material_id": 1,
      "quantity_received": 100,
      "expiry_date": "2026-12-31"
    }
  ],
  "return_items": [
    {
      "raw_material_id": 1,
      "quantity_returned": 10,
      "return_reason": "damaged",
      "disposition": "stock",
      "source_batch_id": 5,
      "expiry_date": null
    }
  ]
}
```

**Verify:**

- ✅ `source_batch_id` is included
- ✅ `disposition` maps correctly ("stock" or "dispose")
- ✅ `return_reason` is included
- ✅ All required fields present

---

### TEST 2: Batch Genealogy View 🌳

**Location:** Raw Materials → Click "Batch Genealogy" card → `/batch-traceability/genealogy`

#### 2.1 Page Load & Layout

| Element                | Expected                                    | Status |
| ---------------------- | ------------------------------------------- | ------ |
| Page title             | "Batch Genealogy Tracer"                    | ⬜     |
| Subtitle               | "Trace all returns from a receipt batch"    | ⬜     |
| Search section visible | Card with search form                       | ⬜     |
| No data yet            | Empty state message OR no genealogy section | ⬜     |

#### 2.2 Batch Search

| Step                         | Expected Result                                         | Status |
| ---------------------------- | ------------------------------------------------------- | ------ |
| Enter batch number in search | Text appears in input                                   | ⬜     |
| Click "Search" button        | Results appear in table below                           | ⬜     |
| Search results show          | Columns: Batch Number, Material, Quantity, Date, Action | ⬜     |
| Each row has arrow button    | Click arrow to select batch                             | ⬜     |

**Example Search Results:**

```
Batch Number                    | Material          | Qty    | Date       | Action
RM-MAT001-20250115-001         | Turmeric Powder   | 100 kg | 2025-01-15 | →
RM-MAT002-20250115-001         | Chili Powder      | 50 kg  | 2025-01-15 | →
```

#### 2.3 Batch Selection

| Step                        | Expected Result                | Status |
| --------------------------- | ------------------------------ | ------ |
| Click arrow on result row   | Results table disappears       | ⬜     |
| Batch details card appears  | Shows selected batch info      | ⬜     |
| Genealogy tree card appears | Shows tree visualization below | ⬜     |

#### 2.4 Batch Details Card

**Fields Expected:**
| Field | Example Value | Status |
|-------|---------------|--------|
| Batch Number | RM-MAT001-20250115-001 | ⬜ |
| Material | Turmeric Powder (MAT001) | ⬜ |
| Quantity | 100 kg | ⬜ |
| Purchase Date | 2025-01-15 | ⬜ |
| Expiry Date | 2026-12-31 | ⬜ |
| Unit Cost | 850.00 | ⬜ |

#### 2.5 Genealogy Tree - With Returns

| Element            | Expected Display                        | Status |
| ------------------ | --------------------------------------- | ------ |
| Receipt batch node | Green "Receipt" tag + batch number      | ⬜     |
| Receipt quantity   | Shows +100 kg in green                  | ⬜     |
| Connector line     | Visual line from receipt to returns     | ⬜     |
| Return node        | Yellow "Return" tag + batch number      | ⬜     |
| Return quantity    | Shows -10 kg in red/orange              | ⬜     |
| Return reason      | "Damaged" displayed                     | ⬜     |
| Disposition tag    | Blue "Return to Stock" or Red "Dispose" | ⬜     |
| Return date        | "2025-01-15"                            | ⬜     |

**Visual Structure Expected:**

```
┌─────────────────────────────────────┐
│ Receipt: RM-MAT001-20250115-001    │
│ +100 kg                             │
└────────────────┬────────────────────┘
                 │
            ┌────┴────────────────┬───┐
            │                     │   │
      ┌─────▼──────────────┐ ┌────▼──────────────┐
      │Return batch 1      │ │Return batch 2     │
      │-10 kg (Damaged)    │ │-5 kg (Expired)    │
      │Return to Stock     │ │Dispose            │
      └────────────────────┘ └────────────────────┘
```

#### 2.6 Genealogy Tree - No Returns

| Step                         | Expected Result                           | Status |
| ---------------------------- | ----------------------------------------- | ------ |
| Select batch with no returns | Genealogy tree displays                   | ⬜     |
| Check empty state            | "No returns found for this batch" message | ⬜     |
| No return nodes              | Only receipt node visible                 | ⬜     |

#### 2.7 Summary Statistics

**If returns exist:**

| Statistic          | Calculation              | Example | Status |
| ------------------ | ------------------------ | ------- | ------ |
| Total Returns      | Count of return batches  | "2"     | ⬜     |
| Total Returned Qty | Sum of return quantities | "15 kg" | ⬜     |
| Stock Disposition  | Qty going back to stock  | "10 kg" | ⬜     |
| Disposal           | Qty being disposed       | "5 kg"  | ⬜     |

#### 2.8 Return Reason Formatting

| Code          | Display         | Status |
| ------------- | --------------- | ------ |
| damaged       | "Damaged"       | ⬜     |
| expired       | "Expired"       | ⬜     |
| excess        | "Excess"        | ⬜     |
| quality_issue | "Quality Issue" | ⬜     |
| wrong_item    | "Wrong Item"    | ⬜     |
| other         | "Other"         | ⬜     |

#### 2.9 Data Accuracy

| Check                 | Method                                  | Expected                     | Status |
| --------------------- | --------------------------------------- | ---------------------------- | ------ |
| Receipt batch correct | Verify batch_number matches             | Matches selected batch       | ⬜     |
| Returns linked        | All returns should have source_batch_id | All link to selected receipt | ⬜     |
| Quantities accurate   | Check against DB                        | Exact match                  | ⬜     |
| Dates formatted       | Check date format                       | YYYY-MM-DD format            | ⬜     |

---

### TEST 3: Return Origin Tracer 🔍

**Location:** Raw Materials → Click "Return Origin Tracer" card → `/batch-traceability/return-origin`

#### 3.1 Page Load

| Element      | Expected                                              | Status |
| ------------ | ----------------------------------------------------- | ------ |
| Page title   | "Return Origin Tracer"                                | ⬜     |
| Subtitle     | "Trace a returned batch back to its source receipt"   | ⬜     |
| Input field  | Number input for Batch ID                             | ⬜     |
| Trace button | "Trace" button next to input                          | ⬜     |
| Empty state  | "Enter a return batch ID to trace its origin" message | ⬜     |

#### 3.2 Batch ID Input

| Step                 | Expected Result                         | Status |
| -------------------- | --------------------------------------- | ------ |
| Click input field    | Cursor appears                          | ⬜     |
| Type return batch ID | Number appears in field                 | ⬜     |
| Press Enter          | Submits search (same as clicking Trace) | ⬜     |
| Click Trace button   | Data loads                              | ⬜     |

#### 3.3 Return Batch Card

After entering valid return batch ID:

| Field             | Example                                        | Status |
| ----------------- | ---------------------------------------------- | ------ |
| Tag               | "Return" (yellow)                              | ⬜     |
| Batch Number      | RM-MAT001-20250115-002                         | ⬜     |
| Status tag        | "Returned to Stock" (blue) or "Disposed" (red) | ⬜     |
| Material          | Turmeric Powder (MAT001)                       | ⬜     |
| Quantity Returned | -10 kg (red, bold)                             | ⬜     |
| Return Reason     | "Damaged" (tag)                                | ⬜     |
| Disposition       | Tag showing disposition                        | ⬜     |
| Returned Date     | 2025-01-15                                     | ⬜     |
| Unit Cost         | 850.00                                         | ⬜     |
| Return Value      | -8500.00 (red)                                 | ⬜     |

#### 3.4 Arrow Connector

| Element     | Expected                                | Status |
| ----------- | --------------------------------------- | ------ |
| Arrow icon  | ⬇ arrow between cards                   | ⬜     |
| Label       | "From" text near arrow                  | ⬜     |
| Visual flow | Clear visual link from return to source | ⬜     |

#### 3.5 Source Receipt Batch Card

| Field             | Example                  | Status |
| ----------------- | ------------------------ | ------ |
| Tag               | "Receipt" (green)        | ⬜     |
| Source tag        | "Source" (blue tag)      | ⬜     |
| Batch Number      | RM-MAT001-20250115-001   | ⬜     |
| Material          | Turmeric Powder (MAT001) | ⬜     |
| Quantity Received | +100 kg (green, bold)    | ⬜     |
| Received Date     | 2025-01-15               | ⬜     |
| Expiry Date       | 2026-12-31               | ⬜     |
| Unit Cost         | 850.00                   | ⬜     |
| Receipt Value     | +85000.00 (green)        | ⬜     |

#### 3.6 Return Rate Summary

| Metric        | Calculation                     | Example    | Status |
| ------------- | ------------------------------- | ---------- | ------ |
| Return Rate % | (return_qty / source_qty) × 100 | 10%        | ⬜     |
| Progress bar  | Bar shows % visually            | Bar at 10% | ⬜     |
| Accepted Qty  | source_qty - return_qty         | 90 kg      | ⬜     |

#### 3.7 Disposition Impact

| Field  | "Return to Stock"       | "Dispose"       | Status |
| ------ | ----------------------- | --------------- | ------ |
| Label  | "Returned to Stock"     | "Disposed"      | ⬜     |
| Color  | Blue                    | Red             | ⬜     |
| Impact | Stock increased by 10kg | Stock unchanged | ⬜     |

#### 3.8 Net Cost Impact

| Calculation | Expected               | Status           |
| ----------- | ---------------------- | ---------------- | --- |
| Formula     | return_qty × unit_cost | 10 × 850 = 8500  | ⬜  |
| Display     | Negative value in red  | "-8500.00"       | ⬜  |
| Label       | "Net Cost Impact"      | Shows in summary | ⬜  |

#### 3.9 Invalid Batch ID

| Step                  | Expected Result                     | Status |
| --------------------- | ----------------------------------- | ------ |
| Enter non-existent ID | e.g., "99999"                       | ⬜     |
| Click Trace           | Error message appears               | ⬜     |
| Error message         | "Return batch not found" or similar | ⬜     |
| State                 | Return/source cards don't appear    | ⬜     |

#### 3.10 Empty Input

| Step              | Expected Result                  | Status |
| ----------------- | -------------------------------- | ------ |
| Leave input empty | Input shows placeholder          | ⬜     |
| Click Trace       | Error message appears            | ⬜     |
| Error text        | "Please enter a return batch ID" | ⬜     |

---

### TEST 4: Material Returns Summary 📊

**Location:** Raw Materials → Click "Material Returns Summary" card → `/batch-traceability/material-summary`

#### 4.1 Page Load

| Element             | Expected                                                      | Status |
| ------------------- | ------------------------------------------------------------- | ------ |
| Page title          | "Material Returns Summary"                                    | ⬜     |
| Subtitle            | "View comprehensive returns and inventory impact by material" | ⬜     |
| Search form visible | Material search input                                         | ⬜     |
| Empty state         | Prompts to search and select material                         | ⬜     |

#### 4.2 Material Search

| Step                          | Expected Result                     | Status |
| ----------------------------- | ----------------------------------- | ------ |
| Enter material code in search | Text appears in input               | ⬜     |
| Click Search                  | Results table appears               | ⬜     |
| Results columns               | Code, Name, Unit, Current Stock     | ⬜     |
| Click arrow                   | Material selected and summary loads | ⬜     |

#### 4.3 Material Info Card

After selecting material:

| Field         | Example         | Status |
| ------------- | --------------- | ------ |
| Material Code | MAT001          | ⬜     |
| Material Name | Turmeric Powder | ⬜     |
| Unit          | kg              | ⬜     |
| Current Stock | 150 kg          | ⬜     |

#### 4.4 Statistic Cards (4 Cards)

**Card 1: Total Received**
| Element | Expected | Status |
|---------|----------|--------|
| Header | Green background, ⬇ icon, "Total Received" | ⬜ |
| Value | 200 | ⬜ |
| Unit | kg | ⬜ |
| Detail | "3 receipts" | ⬜ |

**Card 2: Total Returned**
| Element | Expected | Status |
|---------|----------|--------|
| Header | Yellow background, ⬆ icon, "Total Returned" | ⬜ |
| Value | 50 (red) | ⬜ |
| Unit | kg | ⬜ |
| Detail | "5 returns" | ⬜ |

**Card 3: Returned to Stock**
| Element | Expected | Status |
|---------|----------|--------|
| Header | Blue background, ✓ icon, "Returned to Stock" | ⬜ |
| Value | 30 | ⬜ |
| Unit | kg | ⬜ |
| Detail | "Re-entered inventory" | ⬜ |

**Card 4: Disposed**
| Element | Expected | Status |
|---------|----------|--------|
| Header | Red background, 🗑️ icon, "Disposed" | ⬜ |
| Value | 20 | ⬜ |
| Unit | kg | ⬜ |
| Detail | "Removed from inventory" | ⬜ |

#### 4.5 Key Metrics Section

| Metric              | Calculation                                | Example Value | Status |
| ------------------- | ------------------------------------------ | ------------- | ------ |
| Return Rate %       | (total_returned / total_received) × 100    | 25%           | ⬜     |
| Return Rate Bar     | Progress bar 0-100%                        | 25% filled    | ⬜     |
| Stock Disposition % | (returned_to_stock / total_returned) × 100 | 60%           | ⬜     |
| Disposition Bar     | Progress bar 0-100%                        | 60% filled    | ⬜     |
| Disposal Rate %     | (disposed / total_returned) × 100          | 40%           | ⬜     |
| Disposal Bar        | Progress bar 0-100%                        | 40% filled    | ⬜     |
| Total Cost Impact   | total_returned × unit_cost                 | -42500.00     | ⬜     |

#### 4.6 Return Reasons Breakdown Table

**Expected Columns:**
| Column | Example | Status |
|--------|---------|--------|
| Reason | "Damaged" (tag) | ⬜ |
| Count | 2 | ⬜ |
| Total Qty | 20 kg | ⬜ |
| % of Returns | 40% | ⬜ |

**Example Rows:**

```
Reason           | Count | Total Qty | % of Returns
Damaged          | 2     | 20 kg     | 40%
Expired          | 1     | 10 kg     | 20%
Quality Issue    | 1     | 15 kg     | 30%
Other            | 1     | 5 kg      | 10%
```

#### 4.7 Disposition Breakdown

**Layout:** Two boxes side by side

**Box 1: Return to Stock**
| Element | Expected | Status |
|---------|----------|--------|
| Tag | "Return to Stock" | ⬜ |
| Background | Light blue | ⬜ |
| Icon | Info icon | ⬜ |
| Count | "3 items" | ⬜ |
| Quantity | 30 kg | ⬜ |
| Percentage | "60% of returns" | ⬜ |

**Box 2: Dispose**
| Element | Expected | Status |
|---------|----------|--------|
| Tag | "Dispose" | ⬜ |
| Background | Light red | ⬜ |
| Icon | Danger icon | ⬜ |
| Count | "2 items" | ⬜ |
| Quantity | 20 kg | ⬜ |
| Percentage | "40% of returns" | ⬜ |

#### 4.8 Material with No Returns

| Step                           | Expected Result          | Status |
| ------------------------------ | ------------------------ | ------ |
| Select material with 0 returns | Data loads               | ⬜     |
| Check stat cards               | All show 0 values        | ⬜     |
| Check reason table             | Empty or shows "No data" | ⬜     |
| Check disposition boxes        | Both show 0              | ⬜     |

#### 4.9 Data Accuracy

| Check                | Method                     | Expected                 | Status |
| -------------------- | -------------------------- | ------------------------ | ------ |
| Totals match DB      | Sum receipt/return batches | Exact match              | ⬜     |
| Calculations correct | Verify math formulas       | All percentages accurate | ⬜     |
| Stock impact         | Compare to current_stock   | Correctly calculated     | ⬜     |
| Cost calculations    | return_qty × unit_cost     | Exact match              | ⬜     |

---

## Integration & Navigation Tests

### TEST 5: UI Integration 🔗

#### 5.1 Traceability Menu Cards in Raw Materials

**Navigate to:** `/raw-materials`

| Element      | Expected                   | Status |
| ------------ | -------------------------- | ------ |
| Menu visible | Below page header          | ⬜     |
| Menu title   | "Batch Traceability Tools" | ⬜     |
| Card count   | 3 cards total              | ⬜     |

**Card 1: Batch Genealogy**
| Element | Expected | Status |
|---------|----------|--------|
| Icon | Sitemap icon 🗂️ | ⬜ |
| Title | "Batch Genealogy" | ⬜ |
| Description | "Trace all returns from a receipt batch" | ⬜ |
| Arrow | Right arrow icon on right side | ⬜ |
| Hover effect | Border turns blue, lifts up | ⬜ |
| Click action | Navigate to `/batch-traceability/genealogy` | ⬜ |

**Card 2: Return Origin Tracer**
| Element | Expected | Status |
|---------|----------|--------|
| Icon | Arrow up-left icon ⬆️⬅️ | ⬜ |
| Title | "Return Origin Tracer" | ⬜ |
| Description | "Trace a return batch back to source" | ⬜ |
| Hover effect | Border turns blue, lifts up | ⬜ |
| Click action | Navigate to `/batch-traceability/return-origin` | ⬜ |

**Card 3: Material Returns Summary**
| Element | Expected | Status |
|---------|----------|--------|
| Icon | Chart bar icon 📊 | ⬜ |
| Title | "Material Returns Summary" | ⬜ |
| Description | "View comprehensive returns by material" | ⬜ |
| Hover effect | Border turns blue, lifts up | ⬜ |
| Click action | Navigate to `/batch-traceability/material-summary` | ⬜ |

#### 5.2 Responsive Design

**On Desktop (> 768px):**
| Test | Expected | Status |
|------|----------|--------|
| Cards layout | Grid with 3 columns | ⬜ |
| Card spacing | Even gaps between cards | ⬜ |
| Card width | ~280px each | ⬜ |

**On Tablet (768px - 1024px):**
| Test | Expected | Status |
|------|----------|--------|
| Cards layout | Grid with 2 columns | ⬜ |
| Card spacing | Even gaps | ⬜ |

**On Mobile (< 768px):**
| Test | Expected | Status |
|------|----------|--------|
| Cards layout | Single column (stacked) | ⬜ |
| Cards full width | Each card spans full width | ⬜ |
| Spacing maintained | Margins preserved | ⬜ |

#### 5.3 Navigation Flow

| Test               | Path                 | Expected                                           | Status |
| ------------------ | -------------------- | -------------------------------------------------- | ------ |
| From Raw Materials | Click Genealogy card | Navigate to `/batch-traceability/genealogy`        | ⬜     |
| From Genealogy     | Browser back button  | Return to `/raw-materials`                         | ⬜     |
| From Raw Materials | Click Origin card    | Navigate to `/batch-traceability/return-origin`    | ⬜     |
| From Raw Materials | Click Summary card   | Navigate to `/batch-traceability/material-summary` | ⬜     |
| URL consistency    | Each view            | URL matches route path                             | ⬜     |

#### 5.4 Cross-View Navigation

| Test                  | Steps                                | Expected                  | Status |
| --------------------- | ------------------------------------ | ------------------------- | ------ |
| **Back button**       | Any traceability view → Back         | Return to previous view   | ⬜     |
| **Browser history**   | Navigate multiple views              | History tracked correctly | ⬜     |
| **Direct URL access** | Type `/batch-traceability/genealogy` | View loads directly       | ⬜     |

---

## Data Validation Tests

### TEST 6: Calculations & Accuracy ✔️

#### 6.1 Return Rate Calculation

**Formula:** `(total_returned / total_received) × 100`

| Test Case | Received | Returned | Expected % | Status |
| --------- | -------- | -------- | ---------- | ------ |
| 1         | 100 kg   | 10 kg    | 10%        | ⬜     |
| 2         | 200 kg   | 50 kg    | 25%        | ⬜     |
| 3         | 500 kg   | 100 kg   | 20%        | ⬜     |
| 4         | 1000 kg  | 0 kg     | 0%         | ⬜     |

#### 6.2 Stock Disposition Rate

**Formula:** `(returned_to_stock / total_returned) × 100`

| Test Case | Returned | To Stock | Expected % | Status |
| --------- | -------- | -------- | ---------- | ------ |
| 1         | 100 kg   | 60 kg    | 60%        | ⬜     |
| 2         | 50 kg    | 30 kg    | 60%        | ⬜     |
| 3         | 20 kg    | 20 kg    | 100%       | ⬜     |
| 4         | 30 kg    | 0 kg     | 0%         | ⬜     |

#### 6.3 Disposal Rate

**Formula:** `(disposed / total_returned) × 100`

| Test Case | Returned | Disposed | Expected % | Status |
| --------- | -------- | -------- | ---------- | ------ |
| 1         | 100 kg   | 40 kg    | 40%        | ⬜     |
| 2         | 50 kg    | 20 kg    | 40%        | ⬜     |
| 3         | 20 kg    | 0 kg     | 0%         | ⬜     |
| 4         | 30 kg    | 30 kg    | 100%       | ⬜     |

#### 6.4 Cost Calculations

**Return Value Formula:** `quantity_returned × unit_cost`

| Qty Returned | Unit Cost | Expected Value | Status |
| ------------ | --------- | -------------- | ------ |
| 10 kg        | 850       | 8,500          | ⬜     |
| 20 kg        | 1200      | 24,000         | ⬜     |
| 5 kg         | 500       | 2,500          | ⬜     |

#### 6.5 Accepted Quantity Calculation

**Formula:** `source_qty - return_qty`

| Source Qty | Return Qty | Expected Accepted | Status |
| ---------- | ---------- | ----------------- | ------ |
| 100 kg     | 10 kg      | 90 kg             | ⬜     |
| 50 kg      | 5 kg       | 45 kg             | ⬜     |
| 200 kg     | 50 kg      | 150 kg            | ⬜     |

#### 6.6 Aggregation Accuracy

**Total Received:** Sum all receipt batch quantities

| Test       | DB Sum | UI Display | Match | Status |
| ---------- | ------ | ---------- | ----- | ------ |
| Material 1 | 250 kg | 250 kg     | ✓     | ⬜     |
| Material 2 | 150 kg | 150 kg     | ✓     | ⬜     |

**Total Returned:** Sum all return batch quantities (absolute value)

| Test       | DB Sum | UI Display | Match | Status |
| ---------- | ------ | ---------- | ----- | ------ |
| Material 1 | 50 kg  | 50 kg      | ✓     | ⬜     |
| Material 2 | 30 kg  | 30 kg      | ✓     | ⬜     |

#### 6.7 Number Formatting

| Value   | Expected Format                       | Status |
| ------- | ------------------------------------- | ------ |
| 1000    | "1,000" or "1000" (consistent)        | ⬜     |
| 8500.50 | "8,500.50" (2 decimals)               | ⬜     |
| 100     | "100" (no decimals for round numbers) | ⬜     |

#### 6.8 Date Formatting

| Date Value | Expected Format                            | Status |
| ---------- | ------------------------------------------ | ------ |
| 2025-01-15 | "01/15/2025" or "15 Jan 2025" (consistent) | ⬜     |

---

## Common Issues & Solutions

### Issue 1: Source Batch Dropdown Empty

**Symptom:** Source batch dropdown shows no options after selecting material

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| No batches created | Receive PO first to create batches | Check DB: `SELECT * FROM raw_material_batches WHERE material_id = X;` |
| Batches are return type | Filter shows only receipt batches | Verify batch_type = 'receipt' in query |
| Wrong component hook | availableMaterials computed might filter wrong | Check `availableSourceBatches` computed property |

### Issue 2: API Returns 401 Unauthorized

**Symptom:** Network requests fail with 401 error

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Token expired | Refresh page and re-login | Check DevTools → Storage → Tokens |
| Wrong auth header | Verify Bearer token format | Token should start with "Bearer eyJ..." |
| Backend auth issue | Check backend auth middleware | Verify routes have auth protection |

### Issue 3: Batch Genealogy Shows No Data

**Symptom:** Genealogy tree is empty or says "No returns found"

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Selected batch has no returns | This is correct behavior | Check if batch was actually returned |
| Wrong batch type | Genealogy only works for receipt batches | Select batch_type = 'receipt' |
| API endpoint down | Check backend traceability controller | Test: `GET /api/batches/:id/genealogy` in Postman |

### Issue 4: Return Origin Tracer Shows Error

**Symptom:** "Return batch not found" error when entering valid ID

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Entered receipt batch ID instead | Use return batch ID (batch_type='return') | Check batch_type in DB |
| Wrong backend endpoint | Verify route `/api/batches/:id/origin` exists | Test endpoint in Postman |
| Return not linked to source | Check source_batch_id in DB | Run: `SELECT source_batch_id FROM raw_material_batches WHERE id = X;` |

### Issue 5: Material Summary Shows All Zeros

**Symptom:** All statistics show 0 values

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Material has no batches | Material not used in any PO yet | Create PO and receive it first |
| Query aggregation broken | Check API response | Test: `GET /api/batches/materials/:materialId/returns-summary` |
| API returns wrong data | Verify backend calculation | Check traceabilityController.js math |

### Issue 6: Components Not Rendering

**Symptom:** Blank page or missing content

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Import path wrong | Verify component import path | Check `src/router/index.js` imports match file paths |
| Route not registered | Route missing from router | Search for `/batch-traceability/genealogy` in router |
| Missing component file | File not created or wrong location | Check file exists at `src/views/batch-traceability/` |
| JavaScript error | Check browser console | Press F12, check Console tab for red errors |

### Issue 7: Calculations Wrong

**Symptom:** Percentages don't add up or are incorrect

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Formula error | Double-check math in component | Trace through calculation step-by-step |
| Data type issue | Values might be strings not numbers | Use `parseFloat()` to convert |
| Rounding error | Verify rounding logic | Check if using `Math.round()` or similar |

### Issue 8: Dates Not Formatted

**Symptom:** Dates show as "2025-01-15T10:30:00Z" instead of formatted

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Formatter not imported | Check import at top of component | Verify: `import { formatDate } from '@/utils/formatters'` |
| Formatter not applied | Template not using function | Check v-bind uses {{ formatDate(value) }} |
| Formatter broken | Function has bug | Test formatter independently |

### Issue 9: Network Requests Failing

**Symptom:** API calls return errors

**Root Causes & Solutions:**
| Cause | Solution | Verify |
|-------|----------|--------|
| Backend not running | Server crashed or didn't start | Check terminal: "Server running on port 3000" |
| Wrong URL | API endpoint path incorrect | Verify URL matches backend routes |
| CORS error | Cross-origin request blocked | Check backend CORS configuration |
| Request timeout | Server too slow | Check if DB queries are optimized |

---

## Final Validation Checklist

Use this checklist to confirm all features are working:

### Core Functionality

- [ ] **ReceivePO Form**
  - [ ] Return items tab visible and functional
  - [ ] Source batch dropdown populated correctly
  - [ ] Add return item button works
  - [ ] Return items added to table
  - [ ] Form submission includes source_batch_id
  - [ ] Success notification on completion

- [ ] **Batch Genealogy View**
  - [ ] Page loads without errors
  - [ ] Search finds batches
  - [ ] Batch selection works
  - [ ] Genealogy tree displays
  - [ ] Returns linked to source batch
  - [ ] Summary stats calculated correctly

- [ ] **Return Origin Tracer**
  - [ ] Page loads without errors
  - [ ] Can enter return batch ID
  - [ ] Origin traced successfully
  - [ ] Return and source cards display
  - [ ] Return rate calculated correctly
  - [ ] Error handling works

- [ ] **Material Summary**
  - [ ] Page loads without errors
  - [ ] Material search works
  - [ ] Summary data displays
  - [ ] Statistics accurate
  - [ ] Breakdown tables populated
  - [ ] Disposition boxes show data

### Integration

- [ ] **Navigation**
  - [ ] Traceability menu cards visible on Raw Materials
  - [ ] Cards navigate to correct views
  - [ ] Browser back button works
  - [ ] Direct URL access works
  - [ ] No broken links

- [ ] **Data Flow**
  - [ ] Backend returns correct data
  - [ ] Frontend displays data correctly
  - [ ] Calculations match backend
  - [ ] No data duplication
  - [ ] Pagination works (if applicable)

### User Experience

- [ ] **Formatting**
  - [ ] Numbers formatted with thousands separator
  - [ ] Currency shows currency symbol
  - [ ] Dates formatted consistently
  - [ ] Percentages show % symbol

- [ ] **Responsiveness**
  - [ ] Desktop layout looks good (> 1200px)
  - [ ] Tablet layout responsive (768px - 1024px)
  - [ ] Mobile layout stacked (< 768px)
  - [ ] No horizontal scroll on mobile

- [ ] **Error Handling**
  - [ ] Invalid input shows error message
  - [ ] Network errors handled gracefully
  - [ ] Empty states handled
  - [ ] Loading states visible

### Performance

- [ ] **Loading Speed**
  - [ ] Pages load within 2 seconds
  - [ ] No lag on user interactions
  - [ ] No unnecessary API calls
  - [ ] Images/icons load quickly

- [ ] **Browser Console**
  - [ ] No red error messages
  - [ ] No console warnings (unless expected)
  - [ ] No network 404 errors

---

## Test Execution Summary

**Test Date:** **\*\***\_\_\_**\*\***  
**Tester Name:** **\*\***\_\_\_**\*\***  
**Browser/Version:** **\*\***\_\_\_**\*\***  
**Environment:** ☐ Local ☐ Dev ☐ Staging

### Overall Results

| Category         | Status          | Notes |
| ---------------- | --------------- | ----- |
| ReceivePO Form   | ⬜ Pass ⬜ Fail |       |
| Batch Genealogy  | ⬜ Pass ⬜ Fail |       |
| Return Origin    | ⬜ Pass ⬜ Fail |       |
| Material Summary | ⬜ Pass ⬜ Fail |       |
| Integration      | ⬜ Pass ⬜ Fail |       |
| Data Validation  | ⬜ Pass ⬜ Fail |       |

### Issues Found

| Issue ID | Severity                 | Component | Description | Status           |
| -------- | ------------------------ | --------- | ----------- | ---------------- |
| BT-001   | ⬜ High ⬜ Medium ⬜ Low |           |             | ⬜ Open ⬜ Fixed |
| BT-002   | ⬜ High ⬜ Medium ⬜ Low |           |             | ⬜ Open ⬜ Fixed |

### Sign-Off

**Testing Status:** ⬜ Complete ⬜ Blocked ⬜ In Progress  
**Recommendation:** ⬜ Approved ⬜ Needs Fixes ⬜ Further Testing

**Signature:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***

---

## Appendix: Quick Reference

### Useful Commands

**Check backend is running:**

```bash
curl http://localhost:3000/api/purchase-orders -H "Authorization: Bearer YOUR_TOKEN"
```

**View browser console:**

```
Press F12 → Console tab
```

**Check network requests:**

```
Press F12 → Network tab → Perform action
```

**Clear browser cache:**

```
Press F12 → Right-click reload button → "Empty cache and hard refresh"
```

### Useful URLs

| View             | URL                                                         | Purpose         |
| ---------------- | ----------------------------------------------------------- | --------------- |
| Batch Genealogy  | `http://localhost:5173/batch-traceability/genealogy`        | Trace returns   |
| Return Origin    | `http://localhost:5173/batch-traceability/return-origin`    | Trace source    |
| Material Summary | `http://localhost:5173/batch-traceability/material-summary` | View summary    |
| Raw Materials    | `http://localhost:5173/raw-materials`                       | View menu cards |

### API Endpoints to Test

| Endpoint                                             | Method | Purpose        |
| ---------------------------------------------------- | ------ | -------------- |
| `/api/purchase-orders`                               | GET    | List POs       |
| `/api/purchase-orders/:id`                           | GET    | Get PO details |
| `/api/purchase-orders/:id/receive`                   | POST   | Receive PO     |
| `/api/batches/:id/genealogy`                         | GET    | Get genealogy  |
| `/api/batches/:id/origin`                            | GET    | Get origin     |
| `/api/batches/materials/:materialId/returns-summary` | GET    | Get summary    |

---

**End of Testing Guide** ✅
