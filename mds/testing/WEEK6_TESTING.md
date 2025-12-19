# Week 6 Testing Guide

## Overview

This document outlines the testing procedures for Week 6 implementation, covering Route Management, Outlet Management, Employee Management, and Vehicle Assignment.

**Date:** December 20, 2025  
**Modules:** Routes, Outlets, Employees, Vehicles  
**Status:** ✅ Backend Complete | ✅ Frontend Complete | ⏳ Testing In Progress

---

## Prerequisites

### Required Data

Before testing Week 6 modules, ensure you have:

- ✅ Backend server running on `http://localhost:3000`
- ✅ Frontend dev server running on `http://localhost:5173`
- ✅ MySQL database with all migrations applied
- ✅ Valid JWT token (logged in user)
- ✅ Seeded data from previous weeks

### System Requirements

- Node.js v20.19.1+
- MySQL 8.0.39+
- Browser: Chrome, Firefox, or Edge (latest)
- API testing tool: Postman or curl

---

## Module 1: Route Management

### Test 1.1: Create Route with Auto-Generated Code

**Objective:** Verify route creation with automatic code generation

**Steps:**

1. Navigate to Routes page (`/routes`)
2. Click "Add Route" button
3. Fill in route details:
   - Name: "Route 001 - Central"
   - Description: "Main delivery route covering central area"
   - Status: "Active"
4. Click "Save Route"

**Expected Results:**

- ✅ Route created successfully with auto-generated code (e.g., RT-0001)
- ✅ Success toast notification displayed: "Route created successfully"
- ✅ Redirected to routes list
- ✅ New route appears in the DataTable
- ✅ Code field is read-only in form

**Database Validation:**

```sql
SELECT id, code, name, status FROM routes WHERE name = 'Route 001 - Central';
-- Verify code format is RT-XXXX
```

**API Testing (curl):**

```bash
curl -X POST http://localhost:3000/api/routes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Route 001 - Central","description":"Main delivery route","status":"active"}'
```

---

### Test 1.2: Search and Filter Routes

**Objective:** Verify search and filter functionality

**Steps:**

1. Navigate to Routes page
2. Enter search text: "Central" in search box
3. Wait 500ms for debounce
4. Verify filtered results appear
5. Change status filter to "Inactive"
6. Verify results update

**Expected Results:**

- ✅ Routes filtered by name containing "Central"
- ✅ Status filter shows only inactive routes
- ✅ Clear button resets filters
- ✅ Search is case-insensitive

---

### Test 1.3: Edit Route

**Objective:** Verify route edit functionality

**Steps:**

1. Click "Edit" button on created route
2. Update description: "Updated central delivery route"
3. Change status to "Inactive"
4. Click "Save Route"

**Expected Results:**

- ✅ Route updated successfully
- ✅ Changes reflected in list
- ✅ Success notification: "Route updated successfully"

---

### Test 1.4: Delete Route

**Objective:** Verify route deletion with confirmation

**Steps:**

1. Click "Delete" button on a route
2. Verify confirmation dialog appears with message: "Are you sure you want to delete route...?"
3. Click "Yes" to confirm

**Expected Results:**

- ✅ Route deleted successfully
- ✅ Confirmation dialog shown before deletion
- ✅ Success notification: "Route deleted successfully"
- ✅ Route removed from list

---

### Test 1.5: View Route Outlets and Employees

**Objective:** Verify route details view

**Steps:**

1. Click "View" button on a route
2. Verify breadcrumb navigation

**Expected Results:**

- ✅ Route details page displays
- ✅ Breadcrumb shows: Dashboard → Routes → [Route Name]
- ✅ Can navigate back to routes list

---

## Module 2: Outlet Management

### Test 2.1: Create Outlet with Auto-Generated Code

**Objective:** Verify outlet creation with automatic code generation

**Steps:**

1. Navigate to Outlets page (`/outlets`)
2. Click "Add Outlet" button
3. Fill in outlet details:
   - Name: "Central City Outlet"
   - Owner Name: "John Doe"
   - Phone: "0771234567"
   - Email: "john@outlet.com"
   - Address: "123 Main Street, Central City"
   - Route: Select "Route 001 - Central"
   - Payment Terms: "Credit"
   - Default Discount: 20
   - Credit Limit: 100000
   - Status: "Active"
4. Click "Save Outlet"

**Expected Results:**

- ✅ Outlet created successfully with auto-generated code (e.g., OUT-0001)
- ✅ Success notification: "Outlet created successfully"
- ✅ Redirected to outlets list
- ✅ New outlet appears with all details
- ✅ Default discount stored as 20.0

**Database Validation:**

```sql
SELECT id, code, name, owner_name, route_id, default_discount, credit_limit
FROM outlets WHERE name = 'Central City Outlet';
-- Verify all fields are stored correctly
```

---

### Test 2.2: Create Outlet with Cash Payment Terms

**Objective:** Verify different payment term options

**Steps:**

1. Create new outlet with Payment Terms: "Cash"
2. Fill other required fields
3. Click "Save Outlet"

**Expected Results:**

- ✅ Outlet created with payment_terms = 'cash'
- ✅ In list, payment terms shows as "Cash" badge (info style)

---

### Test 2.3: View Outlet Balance

**Objective:** Verify outlet balance display

**Steps:**

1. Navigate to Outlets list
2. Observe balance column (LKR currency formatted)
3. Verify balance displays in format: "LKR 0.00"

**Expected Results:**

- ✅ Balance displayed with LKR prefix
- ✅ Currency formatted with 2 decimal places
- ✅ Positive balance shown in red (outstanding)
- ✅ Zero/negative balance in black

---

### Test 2.4: Filter Outlets by Route

**Objective:** Verify outlet filtering by assigned route

**Steps:**

1. Navigate to Outlets page
2. Use route filter dropdown to select "Route 001 - Central"
3. Verify filtered results

**Expected Results:**

- ✅ Only outlets assigned to selected route shown
- ✅ Route filter includes "All Routes" option
- ✅ Routes dropdown loads active routes only

---

### Test 2.5: Edit Outlet Credit Limit

**Objective:** Verify outlet edit with decimal handling

**Steps:**

1. Click "Edit" on an outlet
2. Update Credit Limit: 150000.50
3. Update Default Discount: 15.5
4. Click "Save Outlet"

**Expected Results:**

- ✅ Outlet updated successfully
- ✅ Decimal values preserved (150000.50, 15.5)
- ✅ Changes reflected in list

---

## Module 3: Employee Management

### Test 3.1: Create Sales Rep Employee

**Objective:** Verify employee creation with type selection

**Steps:**

1. Navigate to Employees page (`/employees`)
2. Click "Add Employee" button
3. Fill in employee details:
   - Name: "Ahmed Sales"
   - Type: "Sales Rep"
   - Phone: "0771234567"
   - Email: "ahmed@sales.com"
   - Assigned Route: "Route 001 - Central"
   - Status: "Active"
4. Click "Save Employee"

**Expected Results:**

- ✅ Employee created with auto-generated code (e.g., EMP-0001)
- ✅ Success notification: "Employee created successfully"
- ✅ Employee appears in list with type badge "Sales Rep" (info style)
- ✅ Route assignment shows in list

**Database Validation:**

```sql
SELECT id, code, name, type, assigned_route_id, status
FROM employees WHERE name = 'Ahmed Sales';
-- Verify type is 'sales_ref'
```

---

### Test 3.2: Create Driver Employee

**Objective:** Verify driver employee creation

**Steps:**

1. Create new employee with:
   - Name: "Mohamed Driver"
   - Type: "Driver"
   - Phone: "0779876543"
   - Assigned Route: "Route 001 - Central"
   - Status: "Active"
2. Click "Save Employee"

**Expected Results:**

- ✅ Employee created with type "Driver"
- ✅ Employee badge shows "Driver" (warning style - orange)
- ✅ Route assignment required for drivers

---

### Test 3.3: Create Warehouse Staff Employee

**Objective:** Verify warehouse staff creation (no route assignment)

**Steps:**

1. Create new employee with:
   - Name: "Fatima Warehouse"
   - Type: "Warehouse"
   - Phone: "0771111111"
   - Assigned Route: (leave empty)
   - Status: "Active"
2. Click "Save Employee"

**Expected Results:**

- ✅ Employee created without route assignment
- ✅ Employee badge shows "Warehouse" (success style - green)
- ✅ Help text appears: "Assign a route for sales reps and drivers"

---

### Test 3.4: Filter Employees by Type

**Objective:** Verify employee type filtering

**Steps:**

1. Navigate to Employees page
2. Use type filter: Select "Sales Rep"
3. Verify only sales reps shown
4. Change filter to "Driver"
5. Verify only drivers shown
6. Change filter to "All Types"
7. Verify all employees shown

**Expected Results:**

- ✅ Type filter works correctly
- ✅ Filter options: All Types, Sales Rep, Driver, Warehouse, Other
- ✅ Results update immediately

---

### Test 3.5: Filter Employees by Route

**Objective:** Verify route-based employee filtering

**Steps:**

1. Use route filter to select "Route 001 - Central"
2. Verify only employees assigned to that route shown
3. Select "All Routes"
4. Verify all employees shown

**Expected Results:**

- ✅ Route filter loads active routes from store
- ✅ Employees correctly filtered by assigned_route_id
- ✅ Unassigned employees (warehouse staff) appear in "All Routes"

---

### Test 3.6: Edit Employee

**Objective:** Verify employee update

**Steps:**

1. Click "Edit" on employee
2. Change assigned route to different route
3. Update phone number
4. Click "Save Employee"

**Expected Results:**

- ✅ Employee updated successfully
- ✅ Route assignment changed
- ✅ Changes reflected in list

---

## Module 4: Vehicle Management

### Test 4.1: Create Vehicle with Auto-Generated Code

**Objective:** Verify vehicle creation with automatic code generation

**Steps:**

1. Navigate to Vehicles page (`/vehicles`)
2. Click "Add Vehicle" button
3. Fill in vehicle details:
   - Name: "Delivery Van 001"
   - Registration Number: "ABC-1234"
   - Status: "Active"
4. Click "Save Vehicle"

**Expected Results:**

- ✅ Vehicle created with auto-generated code (e.g., VEH-0001)
- ✅ Success notification: "Vehicle created successfully"
- ✅ Redirected to vehicles list
- ✅ New vehicle appears in DataTable

**Database Validation:**

```sql
SELECT id, code, name, registration_number, status FROM vehicles
WHERE name = 'Delivery Van 001';
-- Verify code format is VEH-XXXX
```

---

### Test 4.2: Create Multiple Vehicles

**Objective:** Verify multiple vehicle creation

**Steps:**

1. Create Vehicle 2:
   - Name: "Delivery Van 002"
   - Registration Number: "DEF-5678"
2. Create Vehicle 3:
   - Name: "Pickup Truck"
   - Registration Number: "GHI-9012"

**Expected Results:**

- ✅ All vehicles created with sequential codes (VEH-0001, VEH-0002, VEH-0003)
- ✅ All appear in list with registration numbers displayed

---

### Test 4.3: Search Vehicles

**Objective:** Verify vehicle search functionality

**Steps:**

1. Navigate to Vehicles page
2. Enter search text: "Van"
3. Verify filtered results
4. Enter search: "ABC-1234"
5. Verify registration search works

**Expected Results:**

- ✅ Search filters by name and registration number
- ✅ Results update with 500ms debounce
- ✅ Case-insensitive search

---

### Test 4.4: Filter Vehicles by Status

**Objective:** Verify status filtering

**Steps:**

1. Use status filter: "Active"
2. Verify only active vehicles shown
3. Change filter to "Inactive"
4. Create inactive vehicle for testing
5. Verify only inactive vehicles shown

**Expected Results:**

- ✅ Status filter works correctly
- ✅ Filter options: All Status, Active, Inactive

---

### Test 4.5: Edit Vehicle

**Objective:** Verify vehicle update

**Steps:**

1. Click "Edit" on a vehicle
2. Update registration number: "ZZZ-9999"
3. Change status to "Inactive"
4. Click "Save Vehicle"

**Expected Results:**

- ✅ Vehicle updated successfully
- ✅ Changes reflected in list
- ✅ Success notification displayed

---

### Test 4.6: Delete Vehicle

**Objective:** Verify vehicle deletion

**Steps:**

1. Click "Delete" button on a vehicle
2. Verify confirmation dialog
3. Click "Yes" to confirm

**Expected Results:**

- ✅ Vehicle deleted successfully
- ✅ Confirmation dialog shown
- ✅ Vehicle removed from list

---

## Integration Tests

### Test 5.1: Route → Outlet Assignment

**Objective:** Verify outlet is correctly linked to route

**Steps:**

1. Create Route and Outlet (linked in step 2.1)
2. Navigate to route's outlets view (if available)
3. Verify outlet appears

**Expected Results:**

- ✅ Outlet assigned to route via route_id foreign key
- ✅ Filter by route shows correct outlets
- ✅ Route dropdown in outlet form shows active routes only

---

### Test 5.2: Route → Employee Assignment

**Objective:** Verify employees are correctly linked to routes

**Steps:**

1. Create Route and Employee (sales rep/driver)
2. Verify employee appears in route's employees list
3. Filter employees by route

**Expected Results:**

- ✅ Employee assigned to route via assigned_route_id
- ✅ Filter by route shows correct employees
- ✅ Warehouse staff not shown in route filters (no route required)

---

### Test 5.3: Full Route Setup Workflow

**Objective:** Verify complete route setup

**Steps:**

1. Create Route: "Route 002 - North"
2. Create Outlet assigned to this route
3. Create Sales Rep assigned to this route
4. Create Driver assigned to this route
5. Verify all relationships in filters

**Expected Results:**

- ✅ All entities correctly linked via route_id/assigned_route_id
- ✅ Filters work across all modules
- ✅ Data consistency maintained

---

## UI/UX Testing

### Test 6.1: Responsive Design - Mobile

**Objective:** Verify responsive layout on mobile devices

**Steps:**

1. Open browser DevTools (F12)
2. Switch to mobile view (375px width)
3. Navigate through Routes, Outlets, Employees, Vehicles pages
4. Test on iPhone 12/Android phone emulation

**Expected Results:**

- ✅ Forms stack single column on mobile
- ✅ DataTable responsive layout works
- ✅ Buttons are touch-friendly
- ✅ Search and filters remain accessible
- ✅ Pagination works on mobile

---

### Test 6.2: Form Validation

**Objective:** Verify form validation rules

**Steps:**

1. Try to create outlet without required fields (name, payment terms, status)
2. Try to create employee without name or type
3. Try to create vehicle without name
4. Verify save button disabled when form invalid

**Expected Results:**

- ✅ Required fields marked with red asterisk (\*)
- ✅ Save button disabled when required fields empty
- ✅ Save button enabled when form valid
- ✅ Validation errors shown in toast

---

### Test 6.3: Toast Notifications

**Objective:** Verify user feedback messages

**Steps:**

1. Create a route (success notification)
2. Try invalid action (error notification)
3. Delete a route (success confirmation)

**Expected Results:**

- ✅ Success toast appears with checkmark
- ✅ Error toast appears with error icon
- ✅ Messages clear and descriptive
- ✅ Toasts auto-dismiss after 3 seconds

---

### Test 6.4: Navigation and Breadcrumbs

**Objective:** Verify navigation flow

**Steps:**

1. Create Route: verify breadcrumb "Dashboard → Routes → Create"
2. Edit Route: verify breadcrumb "Dashboard → Routes → Edit"
3. Click breadcrumb links to navigate back

**Expected Results:**

- ✅ Breadcrumbs display correct path
- ✅ Breadcrumb links are clickable
- ✅ Back button works
- ✅ Router history maintained

---

## Error Handling Tests

### Test 7.1: Network Error Handling

**Objective:** Verify error handling when backend unavailable

**Steps:**

1. Stop backend server
2. Try to create a route
3. Verify error message appears

**Expected Results:**

- ✅ Error toast displayed: "Failed to create route"
- ✅ User not redirected (stays on form)
- ✅ Can retry after backend restarts

---

### Test 7.2: Validation Error Handling

**Objective:** Verify backend validation errors

**Steps:**

1. Create route with name that already exists (if unique constraint)
2. Try to assign outlet to non-existent route

**Expected Results:**

- ✅ Error message displayed from backend
- ✅ Specific validation error shown
- ✅ Form remains for correction

---

### Test 7.3: Permission/Authorization Errors

**Objective:** Verify auth error handling

**Steps:**

1. If using role-based access, verify admin-only operations
2. Check JWT token handling

**Expected Results:**

- ✅ Unauthorized operations blocked
- ✅ Clear error messages
- ✅ Redirect to login if token expired

---

## Performance Tests

### Test 8.1: Pagination Performance

**Objective:** Verify pagination with large dataset

**Steps:**

1. Create 50+ routes
2. Navigate through pages
3. Verify performance

**Expected Results:**

- ✅ Page loads in <1 second
- ✅ No lag when switching pages
- ✅ Pagination controls work smoothly

---

### Test 8.2: Search Performance

**Objective:** Verify search debouncing

**Steps:**

1. Type search query character by character
2. Verify API call happens every 500ms (not on every keystroke)

**Expected Results:**

- ✅ Search debounces correctly (500ms)
- ✅ No excessive API calls
- ✅ Search results display quickly

---

## Browser Compatibility

### Test 9.1: Chrome Browser

**Objective:** Verify functionality in Chrome

**Steps:**

1. Test all CRUD operations
2. Test forms and validation
3. Test responsive design

**Expected Results:**

- ✅ All features working
- ✅ No console errors
- ✅ Responsive design correct

---

### Test 9.2: Firefox Browser

**Objective:** Verify functionality in Firefox

**Steps:**

1. Repeat Test 9.1 in Firefox

**Expected Results:**

- ✅ Same as Chrome

---

### Test 9.3: Safari Browser (Optional)

**Objective:** Verify functionality in Safari

**Steps:**

1. Test on macOS or iOS Safari

**Expected Results:**

- ✅ All features working

---

## Data Consistency Tests

### Test 10.1: Auto-Generated Codes Sequential

**Objective:** Verify codes are sequential and unique

**Steps:**

1. Create 5 routes
2. Verify codes: RT-0001, RT-0002, RT-0003, RT-0004, RT-0005
3. Delete a route (e.g., RT-0003)
4. Create new route
5. Verify new code continues sequence (RT-0006, not RT-0003)

**Expected Results:**

- ✅ Codes are sequential
- ✅ No duplicate codes
- ✅ Deleted routes don't reuse codes

---

### Test 10.2: Referential Integrity

**Objective:** Verify foreign key relationships

**Steps:**

1. Try to delete a route that has assigned outlets/employees

**Expected Results:**

- ✅ Error shown if cascade not configured
- ✅ Foreign key relationships enforced
- ✅ Data integrity maintained

---

## Database Verification

### Test 11.1: Data Persistence

**Objective:** Verify data saved to database correctly

**Steps:**

```sql
-- Check routes table
SELECT COUNT(*) as route_count FROM routes WHERE status = 'active';
-- Should match count in UI

-- Check outlets table
SELECT COUNT(*) as outlet_count FROM outlets;

-- Check employees table
SELECT COUNT(*) as employee_count FROM employees WHERE type = 'sales_ref';

-- Check vehicles table
SELECT COUNT(*) as vehicle_count FROM vehicles;
```

**Expected Results:**

- ✅ Data counts match between frontend and database
- ✅ All fields stored correctly
- ✅ Timestamps auto-set

---

## Test Summary

| Module      | Total Tests  | Status |
| ----------- | ------------ | ------ |
| Routes      | 5 + 2        | ⏳     |
| Outlets     | 6 + 2        | ⏳     |
| Employees   | 6 + 2        | ⏳     |
| Vehicles    | 6 + 1        | ⏳     |
| Integration | 3            | ⏳     |
| UI/UX       | 4            | ⏳     |
| Errors      | 3            | ⏳     |
| Performance | 2            | ⏳     |
| Browser     | 3            | ⏳     |
| Data        | 2            | ⏳     |
| Database    | 1            | ⏳     |
| **TOTAL**   | **41 tests** | ⏳     |

---

## Testing Checklist

- [ ] Module 1: Route Management (5 tests)
- [ ] Module 2: Outlet Management (6 tests)
- [ ] Module 3: Employee Management (6 tests)
- [ ] Module 4: Vehicle Management (6 tests)
- [ ] Integration Tests (3 tests)
- [ ] UI/UX Testing (4 tests)
- [ ] Error Handling (3 tests)
- [ ] Performance Tests (2 tests)
- [ ] Browser Compatibility (3 tests)
- [ ] Data Consistency (2 tests)
- [ ] Database Verification (1 test)

---

## Issues Found

| #   | Issue | Severity | Status | Notes |
| --- | ----- | -------- | ------ | ----- |
|     |       |          |        |       |

---

## Conclusion

Week 6 implementation provides the foundation for distribution network management with routes, outlets, employees, and vehicles. All modules follow consistent patterns established in previous weeks (Composition API, DataTable, forms, pagination, filtering).

**Next Steps:**

- Complete all tests above
- Fix any issues found
- Prepare for Week 7 (Sales & Invoicing)

---

**Document Created:** December 20, 2025  
**Last Updated:** December 20, 2025  
**Status:** Ready for Testing
