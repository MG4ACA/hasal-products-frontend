# Expense Tracking System - Testing & Verification Guide

**Feature:** Company Expense Tracking  
**Last Updated:** February 9, 2026

---

## 📋 Overview

The expense tracking system allows tracking various company expenses including vehicle-related costs, utility bills, maintenance, and other operational expenses. Expenses can be filtered by date, category, and vehicle, with monthly summary reports.

### Key Features

- **8 Expense Categories:**
  - Vehicle Fuel
  - Vehicle Repair
  - Utility Bills
  - Store Maintenance
  - Equipment Repair
  - Salaries
  - Rent
  - Other

- **Vehicle Integration:** Expenses related to vehicles (fuel, repairs) can reference specific vehicles and routes
- **Monthly Reporting:** Summary reports showing total expenses and breakdown by category
- **Date Range Filtering:** View expenses for specific time periods
- **User Tracking:** All expenses track the user who created them

---

## 🗂️ Database Schema

### Table: `expenses`

| Column       | Type          | Description                  |
| ------------ | ------------- | ---------------------------- |
| id           | INT (PK)      | Auto-increment primary key   |
| expense_date | DATE          | Date of expense              |
| category     | ENUM          | Expense category (8 options) |
| amount       | DECIMAL(10,2) | Expense amount               |
| description  | TEXT          | Optional description         |
| vehicle_id   | INT (FK)      | Reference to vehicles table  |
| route_id     | INT (FK)      | Reference to routes table    |
| distance_km  | DECIMAL(10,2) | Distance traveled (for fuel) |
| created_by   | INT (FK)      | User who created the expense |
| created_at   | TIMESTAMP     | Record creation timestamp    |
| updated_at   | TIMESTAMP     | Record update timestamp      |

### Indexes

- `idx_expense_date` on `expense_date`
- `idx_category` on `category`
- `idx_vehicle_id` on `vehicle_id`
- `idx_route_id` on `route_id`

---

## 🧪 Testing Checklist

### Prerequisites

- [x] Database migration completed: `20260209000000-create-expenses-table.js`
- [x] Backend server running on port 5000
- [x] Frontend server running on port 5173
- [x] User authenticated (admin or cashier role)
- [x] Test vehicles created
- [x] Test routes created

---

## 🔍 Test Cases

### Test Category 1: CRUD Operations

#### Test Case 1.1: Create Non-Vehicle Expense

**Objective:** Create a basic expense not related to vehicles

**Steps:**

1. Navigate to **Expenses** → **Create New**
2. Fill in the form:
   - **Expense Date:** Today's date
   - **Category:** Utility Bills
   - **Amount:** 15000.00
   - **Description:** "Monthly electricity bill for January 2026"
3. Click **Save**

**Expected Results:**

✅ Success toast appears: "Expense created successfully"  
✅ Redirected to expense list page  
✅ New expense appears in the table  
✅ Category shows as "Utility Bills" with success tag

**Database Verification:**

```sql
SELECT * FROM expenses
WHERE category = 'utility_bills'
ORDER BY created_at DESC
LIMIT 1;
```

Expected values:

- `amount`: 15000.00
- `category`: 'utility_bills'
- `vehicle_id`: NULL
- `route_id`: NULL
- `distance_km`: NULL
- `created_by`: [Current user ID]

---

#### Test Case 1.2: Create Vehicle Fuel Expense

**Objective:** Create fuel expense with vehicle and route reference

**Steps:**

1. Navigate to **Expenses** → **Create New**
2. Fill in the form:
   - **Expense Date:** Today's date
   - **Category:** Vehicle Fuel
   - **Amount:** 5000.00
   - **Description:** "Fuel for route 1"
   - **Vehicle:** Select "VAN-001" (or any test vehicle)
   - **Route:** Select associated route
   - **Distance (km):** 120
3. Click **Save**

**Expected Results:**

✅ Success toast appears  
✅ Expense saved with vehicle and route references  
✅ Distance tracked in database

**Database Verification:**

```sql
SELECT e.*, v.vehicle_number, r.route_code
FROM expenses e
LEFT JOIN vehicles v ON e.vehicle_id = v.id
LEFT JOIN routes r ON e.route_id = r.id
WHERE e.category = 'vehicle_fuel'
ORDER BY e.created_at DESC
LIMIT 1;
```

Expected:

- `vehicle_id`: Not NULL
- `route_id`: Not NULL
- `distance_km`: 120.00
- Vehicle and route properly joined

---

#### Test Case 1.3: Create Vehicle Repair Expense

**Objective:** Create repair expense for specific vehicle

**Steps:**

1. Navigate to **Expenses** → **Create New**
2. Fill in:
   - **Expense Date:** Yesterday
   - **Category:** Vehicle Repair
   - **Amount:** 25000.00
   - **Description:** "Engine oil change and brake pad replacement"
   - **Vehicle:** Select vehicle
   - **Route:** Optional (can be left empty)
3. Click **Save**

**Expected Results:**

✅ Expense created with vehicle reference  
✅ Route can be optional for repairs  
✅ Shows in vehicle-related expenses filter

---

#### Test Case 1.4: Edit Expense

**Objective:** Modify an existing expense

**Steps:**

1. Go to **Expenses** list
2. Click **Edit** (pencil icon) on any expense
3. Modify:
   - **Amount:** Change to 16000.00
   - **Description:** Update text
4. Click **Update**

**Expected Results:**

✅ Success toast: "Expense updated successfully"  
✅ Redirected to expense list  
✅ Changes reflected in table  
✅ `updated_at` timestamp updated

**Database Verification:**

```sql
SELECT *, updated_at > created_at as was_updated
FROM expenses
WHERE id = [EXPENSE_ID];
```

Expected: `was_updated` = 1

---

#### Test Case 1.5: Delete Expense

**Objective:** Remove an expense record

**Steps:**

1. Go to **Expenses** list
2. Click **Delete** (trash icon) on an expense
3. Confirm deletion in the dialog

**Expected Results:**

✅ Confirmation dialog appears  
✅ Success toast: "Expense deleted successfully"  
✅ Expense removed from list  
✅ Record deleted from database

**Database Verification:**

```sql
SELECT COUNT(*) FROM expenses WHERE id = [DELETED_ID];
-- Expected: 0
```

---

### Test Category 2: Filtering & Search

#### Test Case 2.1: Filter by Date Range

**Objective:** View expenses for specific month

**Steps:**

1. Go to **Expenses** list
2. Set **Date From:** 2026-01-01
3. Set **Date To:** 2026-01-31
4. Click **Apply Filters**

**Expected Results:**

✅ Only January 2026 expenses displayed  
✅ Pagination updates if needed  
✅ Total count shows filtered count

---

#### Test Case 2.2: Filter by Category

**Objective:** View only specific category expenses

**Steps:**

1. Go to **Expenses** list
2. Select **Category:** Vehicle Fuel
3. Click **Apply Filters**

**Expected Results:**

✅ Only vehicle fuel expenses shown  
✅ All entries have "Vehicle Fuel" tag  
✅ Other categories hidden

---

#### Test Case 2.3: Filter by Vehicle

**Objective:** View all expenses for a specific vehicle

**Steps:**

1. Go to **Expenses** list
2. Select **Vehicle:** VAN-001
3. Click **Apply Filters**

**Expected Results:**

✅ Only expenses for VAN-001 displayed  
✅ Includes both fuel and repair expenses  
✅ Vehicle column shows VAN-001

---

#### Test Case 2.4: Combined Filters

**Objective:** Use multiple filters together

**Steps:**

1. Set **Date From:** 2026-02-01
2. Set **Date To:** 2026-02-28
3. Select **Category:** Vehicle Fuel
4. Select **Vehicle:** VAN-001
5. Click **Apply Filters**

**Expected Results:**

✅ Only February 2026 fuel expenses for VAN-001  
✅ All filter conditions applied correctly  
✅ Results match database query

**Database Verification:**

```sql
SELECT COUNT(*) FROM expenses
WHERE expense_date BETWEEN '2026-02-01' AND '2026-02-28'
AND category = 'vehicle_fuel'
AND vehicle_id = [VAN_001_ID];
```

---

#### Test Case 2.5: Clear Filters

**Objective:** Reset all filters to default

**Steps:**

1. Apply multiple filters
2. Click **Clear Filters** button

**Expected Results:**

✅ All filter dropdowns reset  
✅ Date range clears  
✅ Full expense list displayed  
✅ URL parameters cleared

---

### Test Category 3: Monthly Report

#### Test Case 3.1: Generate Current Month Report

**Objective:** View expense summary for current month

**Steps:**

1. Navigate to **Expenses** → **Monthly Report**
2. Default date range should be current month
3. Click **Load Report**

**Expected Results:**

✅ Summary cards display:

- Total Expenses (sum of all expenses)
- Number of Expenses (count)
- Average Expense (total/count)
  ✅ Category breakdown table shows:
- Each category used this month
- Count per category
- Total amount per category
- Percentage of total

**Example Report:**

```
Total Expenses: Rs. 125,450.00
Number of Expenses: 15
Average Expense: Rs. 8,363.33

Expenses by Category:
┌─────────────────────┬───────┬──────────────┬────────┐
│ Category            │ Count │ Total Amount │   %    │
├─────────────────────┼───────┼──────────────┼────────┤
│ Vehicle Fuel        │   8   │  45,000.00   │ 35.87% │
│ Utility Bills       │   3   │  40,500.00   │ 32.29% │
│ Vehicle Repair      │   2   │  25,000.00   │ 19.93% │
│ Store Maintenance   │   1   │  10,000.00   │  7.97% │
│ Salaries            │   1   │   4,950.00   │  3.95% │
└─────────────────────┴───────┴──────────────┴────────┘
```

---

#### Test Case 3.2: Custom Date Range Report

**Objective:** Generate report for specific period

**Steps:**

1. Go to **Monthly Report**
2. Set **Date From:** 2026-01-01
3. Set **Date To:** 2026-03-31 (3 months)
4. Click **Load Report**

**Expected Results:**

✅ Report covers January-March 2026  
✅ All expenses in range included  
✅ Category breakdown accurate for quarter

**Database Verification:**

```sql
-- Verify total matches report
SELECT
  COUNT(*) as total_count,
  SUM(amount) as total_amount
FROM expenses
WHERE expense_date BETWEEN '2026-01-01' AND '2026-03-31';

-- Verify category breakdown
SELECT
  category,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  ROUND(SUM(amount) / (SELECT SUM(amount) FROM expenses WHERE expense_date BETWEEN '2026-01-01' AND '2026-03-31') * 100, 2) as percentage
FROM expenses
WHERE expense_date BETWEEN '2026-01-01' AND '2026-03-31'
GROUP BY category
ORDER BY total_amount DESC;
```

---

#### Test Case 3.3: Report with No Data

**Objective:** Handle empty date ranges gracefully

**Steps:**

1. Go to **Monthly Report**
2. Set date range with no expenses (e.g., future month)
3. Click **Load Report**

**Expected Results:**

✅ No error displayed  
✅ Summary shows zeros:

- Total Expenses: Rs. 0.00
- Number of Expenses: 0
- Average Expense: Rs. 0.00
  ✅ Empty category table or "No expenses found" message

---

### Test Category 4: Validation & Error Handling

#### Test Case 4.1: Required Field Validation

**Objective:** Ensure required fields are enforced

**Steps:**

1. Go to **Create Expense**
2. Leave **Expense Date** empty
3. Try to save

**Expected Results:**

❌ Error: "Expense date is required"  
❌ Form not submitted  
❌ Field highlighted in red

**Repeat for:**

- Category (required)
- Amount (required)

---

#### Test Case 4.2: Amount Validation

**Objective:** Validate numeric constraints

**Test Steps:**

1. Enter **Amount:** -500 (negative)
   - Expected: ❌ Error: "Amount must be positive"

2. Enter **Amount:** 0
   - Expected: ❌ Error: "Amount must be greater than 0"

3. Enter **Amount:** abc (non-numeric)
   - Expected: ❌ Field prevents non-numeric input or shows error

4. Enter **Amount:** 999999999 (too large)
   - Expected: ❌ Error: "Amount exceeds maximum"

5. Enter **Amount:** 5000.50 (valid with decimals)
   - Expected: ✅ Accepted

---

#### Test Case 4.3: Vehicle-Specific Field Validation

**Objective:** Ensure vehicle-related fields appear only for vehicle categories

**Steps:**

1. Select **Category:** Utility Bills
   - Expected: ✅ Vehicle, Route, Distance fields HIDDEN

2. Select **Category:** Vehicle Fuel
   - Expected: ✅ Vehicle, Route, Distance fields SHOWN
   - Try to save without selecting vehicle
   - Expected: ❌ Error: "Vehicle is required for vehicle-related expenses"

3. Select **Category:** Vehicle Repair
   - Expected: ✅ Vehicle field SHOWN and REQUIRED
   - Expected: ✅ Route field SHOWN but OPTIONAL
   - Expected: ✅ Distance field SHOWN but OPTIONAL

---

#### Test Case 4.4: Date Validation

**Objective:** Validate date constraints

**Test Steps:**

1. Enter **Expense Date:** Future date (e.g., 2027-01-01)
   - Expected: ⚠️ Warning or allow (depends on business rule)

2. Enter **Expense Date:** Too old (e.g., 2020-01-01)
   - Expected: ⚠️ Warning or allow (depends on business rule)

3. In **Monthly Report**, set **Date From** > **Date To**
   - Expected: ❌ Error: "Start date must be before end date"

---

#### Test Case 4.5: Distance Validation

**Objective:** Validate distance for fuel expenses

**Test Steps:**

1. Select **Category:** Vehicle Fuel
2. Enter **Distance:** -50
   - Expected: ❌ Error: "Distance must be positive"

3. Enter **Distance:** 0
   - Expected: ⚠️ Allow (vehicle might be idling)

4. Enter **Distance:** 9999
   - Expected: ⚠️ Warning: "Unusually high distance"

---

### Test Category 5: User Access & Permissions

#### Test Case 5.1: Admin Access

**Objective:** Verify admin can perform all operations

**Steps:**

1. Login as **admin**
2. Navigate to Expenses
3. Perform all CRUD operations

**Expected Results:**

✅ Can create expenses  
✅ Can edit any expense  
✅ Can delete any expense  
✅ Can view all expenses  
✅ Can access monthly reports

---

#### Test Case 5.2: Cashier Access

**Objective:** Verify cashier can manage expenses

**Steps:**

1. Login as **cashier**
2. Navigate to Expenses
3. Perform CRUD operations

**Expected Results:**

✅ Can create expenses  
✅ Can edit expenses (own or all - per business rule)  
✅ Can delete expenses (own or all - per business rule)  
✅ Can view expenses  
✅ Can access reports

**Note:** Adjust based on actual role permissions defined

---

#### Test Case 5.3: Unauthorized Access

**Objective:** Ensure protected routes are secure

**Steps:**

1. Without logging in, try to access:
   - `/expenses`
   - `/expenses/create`
   - `/expenses/report`

**Expected Results:**

❌ Redirected to login page  
❌ Cannot access protected routes  
❌ API returns 401 Unauthorized

---

### Test Category 6: Integration Tests

#### Test Case 6.1: Vehicle Reference Integrity

**Objective:** Ensure vehicle deletion is handled properly

**Steps:**

1. Create expense referencing Vehicle A
2. Try to delete Vehicle A from system

**Expected Results:**

❌ Error: "Cannot delete vehicle with associated expenses"  
OR  
✅ Vehicle deleted, expense.vehicle_id set to NULL (soft reference)

**Database Verification:**

```sql
-- Check foreign key constraint
SELECT
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  DELETE_RULE
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'expenses'
AND COLUMN_NAME = 'vehicle_id';
```

Expected: `DELETE_RULE` = 'SET NULL' or 'RESTRICT'

---

#### Test Case 6.2: User Reference Integrity

**Objective:** Ensure expense creator is tracked

**Steps:**

1. Login as User A
2. Create multiple expenses
3. Query expenses by creator

**Database Verification:**

```sql
SELECT e.*, u.username
FROM expenses e
JOIN users u ON e.created_by = u.id
WHERE u.username = 'testuser';
```

Expected: All expenses created by testuser shown with proper join

---

#### Test Case 6.3: Route-Vehicle Consistency

**Objective:** Ensure route belongs to selected vehicle (if business rule)

**Steps:**

1. Select **Vehicle:** VAN-001 (assigned to Route A)
2. Try to select **Route:** Route B (not assigned to VAN-001)

**Expected Results:**

❌ Route dropdown shows only routes for selected vehicle  
OR  
⚠️ Warning: "Selected route not assigned to this vehicle"

---

### Test Category 7: Performance & Data Integrity

#### Test Case 7.1: Large Dataset Performance

**Objective:** Test system with many expenses

**Prerequisites:** Insert 10,000 test expenses

**Steps:**

1. Navigate to expense list
2. Apply filters
3. Generate monthly report

**Expected Results:**

✅ List loads within 2 seconds  
✅ Pagination works smoothly  
✅ Filters respond quickly  
✅ Report generates in < 5 seconds

---

#### Test Case 7.2: Decimal Precision

**Objective:** Ensure amount calculations are accurate

**Steps:**

1. Create expenses:
   - Expense 1: Rs. 5000.55
   - Expense 2: Rs. 3000.45
   - Expense 3: Rs. 1000.99
2. View monthly report

**Expected Results:**

✅ Total: Rs. 9001.99 (exact, no rounding errors)  
✅ Average: Rs. 3000.66 (rounded to 2 decimals)  
✅ Database stores with DECIMAL(10,2) precision

**Database Verification:**

```sql
SELECT
  SUM(amount) as total,
  ROUND(AVG(amount), 2) as average
FROM expenses
WHERE id IN [EXPENSE_IDS];
```

---

#### Test Case 7.3: Concurrent Creation

**Objective:** Test simultaneous expense creation

**Steps:**

1. Open two browser tabs
2. Login in both tabs
3. Create expense in Tab 1
4. Create expense in Tab 2 simultaneously

**Expected Results:**

✅ Both expenses created successfully  
✅ No data loss  
✅ Unique IDs assigned  
✅ Both appear in expense list

---

### Test Category 8: UI/UX Testing

#### Test Case 8.1: Responsive Design

**Objective:** Verify mobile/tablet compatibility

**Steps:**

1. Test on different viewport sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

**Expected Results:**

✅ Layout adapts to screen size  
✅ Buttons remain accessible  
✅ Tables scroll horizontally if needed  
✅ Forms stack on mobile  
✅ Filters collapse on small screens

---

#### Test Case 8.2: Loading States

**Objective:** Verify loading indicators

**Steps:**

1. Create expense with slow network (throttle to 3G)
2. Load expense list with filters
3. Generate monthly report

**Expected Results:**

✅ Loading spinner shown during API calls  
✅ Buttons disabled during submission  
✅ Skeleton loaders for tables (if implemented)  
✅ No duplicate submissions

---

#### Test Case 8.3: Error Messages

**Objective:** Ensure user-friendly error display

**Steps:**

1. Disconnect backend server
2. Try to create expense

**Expected Results:**

❌ Error toast: "Failed to create expense. Please try again."  
❌ Not raw error message or stack trace  
❌ Form data preserved (not lost)

---

## 📊 Testing Summary Template

### Test Execution Checklist

| Test Case                         | Status | Notes | Tested By | Date |
| --------------------------------- | ------ | ----- | --------- | ---- |
| 1.1 Create Non-Vehicle Expense    | ⬜     |       |           |      |
| 1.2 Create Vehicle Fuel Expense   | ⬜     |       |           |      |
| 1.3 Create Vehicle Repair Expense | ⬜     |       |           |      |
| 1.4 Edit Expense                  | ⬜     |       |           |      |
| 1.5 Delete Expense                | ⬜     |       |           |      |
| 2.1 Filter by Date Range          | ⬜     |       |           |      |
| 2.2 Filter by Category            | ⬜     |       |           |      |
| 2.3 Filter by Vehicle             | ⬜     |       |           |      |
| 2.4 Combined Filters              | ⬜     |       |           |      |
| 2.5 Clear Filters                 | ⬜     |       |           |      |
| 3.1 Current Month Report          | ⬜     |       |           |      |
| 3.2 Custom Date Range Report      | ⬜     |       |           |      |
| 3.3 Report with No Data           | ⬜     |       |           |      |
| 4.1 Required Field Validation     | ⬜     |       |           |      |
| 4.2 Amount Validation             | ⬜     |       |           |      |
| 4.3 Vehicle Field Validation      | ⬜     |       |           |      |
| 4.4 Date Validation               | ⬜     |       |           |      |
| 4.5 Distance Validation           | ⬜     |       |           |      |
| 5.1 Admin Access                  | ⬜     |       |           |      |
| 5.2 Cashier Access                | ⬜     |       |           |      |
| 5.3 Unauthorized Access           | ⬜     |       |           |      |
| 6.1 Vehicle Reference Integrity   | ⬜     |       |           |      |
| 6.2 User Reference Integrity      | ⬜     |       |           |      |
| 6.3 Route-Vehicle Consistency     | ⬜     |       |           |      |
| 7.1 Large Dataset Performance     | ⬜     |       |           |      |
| 7.2 Decimal Precision             | ⬜     |       |           |      |
| 7.3 Concurrent Creation           | ⬜     |       |           |      |
| 8.1 Responsive Design             | ⬜     |       |           |      |
| 8.2 Loading States                | ⬜     |       |           |      |
| 8.3 Error Messages                | ⬜     |       |           |      |

**Legend:**

- ⬜ Not Started
- 🔄 In Progress
- ✅ Passed
- ❌ Failed
- ⚠️ Blocked

---

## 🐛 Known Issues & Workarounds

_Document any issues found during testing here_

### Issue 1: [Title]

**Status:** Open/Fixed  
**Severity:** Critical/High/Medium/Low  
**Description:**  
**Steps to Reproduce:**  
**Workaround:**  
**Fix:**

---

## 📝 Notes

- Test with realistic data volumes (minimum 100 expenses)
- Test all expense categories at least once
- Verify report calculations manually for accuracy
- Test with different user roles
- Check browser console for JavaScript errors
- Monitor backend logs for errors during testing

---

**Document Version:** 1.0  
**Created:** February 9, 2026  
**Last Updated:** February 9, 2026  
**Maintained By:** Development Team
