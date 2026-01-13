# Week 3 Testing Plan - Suppliers & Raw Materials

**Module:** Supplier Management & Raw Material Inventory  
**Test Date:** TBD  
**Tester:** [Your Name]  
**Status:** 🔄 In Progress

---

## 📋 Pre-Testing Checklist

- [✅ ] Backend server running
- [ ✅] Frontend dev server running
- [ ✅] Database populated with seeders
- [ ✅] User logged in (admin account)
- [ ✅] Suppliers menu accessible in sidebar

---

## 🔧 Supplier Backend Testing

### SB-01: GET /api/suppliers - List All Suppliers

**Objective:** Test fetching all suppliers with pagination

**Test Steps:**

1. GET `/api/suppliers?page=1&limit=10`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Response includes suppliers array
- ✅ Pagination metadata (total, page, limit)
- ✅ Suppliers sorted by creation date (newest first)

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "suppliers": [...],
    "total": 3,
    "page": 1,
    "limit": 10
  }
}
```

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-02: GET /api/suppliers - Search by Name

**Objective:** Test search functionality

**Test Steps:**

1. GET `/api/suppliers?search=spice`

**Expected Results:**

- ✅ Returns only suppliers matching search term
- ✅ Case-insensitive search
- ✅ Searches in name, code, contact_person, email, and phone

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-02a: GET /api/suppliers - Search by Phone

**Objective:** Test phone number search

**Test Steps:**

1. GET `/api/suppliers?search=0771111111`

**Expected Results:**

- ✅ Returns suppliers matching phone number
- ✅ Partial phone number search works
- ✅ Finds suppliers with matching phone

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-02b: GET /api/suppliers - Search by Email

**Objective:** Test email search

**Test Steps:**

1. GET `/api/suppliers?search=freshspices`

**Expected Results:**

- ✅ Returns suppliers matching email domain/address
- ✅ Case-insensitive search
- ✅ Partial email search works

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-03: GET /api/suppliers/:id - Get Single Supplier

**Objective:** Test fetching supplier by ID

**Test Steps:**

1. GET `/api/suppliers/1`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Returns complete supplier object
- ✅ Includes all fields (id, code, name, contact, balance, etc.)

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-04: GET /api/suppliers/999 - Nonexistent Supplier

**Objective:** Test error handling for invalid ID

**Test Steps:**

1. GET `/api/suppliers/999`

**Expected Results:**

- ✅ Status: 404 Not Found
- ✅ Error message: "Supplier not found"

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-05: POST /api/suppliers - Create Supplier

**Objective:** Test creating new supplier

**Test Steps:**

1. POST `/api/suppliers`
2. Body:

```json
{
  "name": "Ceylon Spice Co.",
  "contact_person": "Nimal Silva",
  "phone": "0771234567",
  "email": "nimal@ceylonspice.lk",
  "address": "123 Galle Road, Colombo 03",
  "credit_limit": 500000
}
```

**Expected Results:**

- ✅ Status: 201 Created
- ✅ Supplier code auto-generated (SUP004, SUP005, etc.)
- ✅ Balance initialized to 0
- ✅ Returns created supplier object
- ✅ Supplier saved to database

**SQL Verification:**

```sql
SELECT * FROM suppliers ORDER BY id DESC LIMIT 1;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-06: POST /api/suppliers - Validation Errors

**Objective:** Test required field validation

**Test Steps:**

1. POST `/api/suppliers` with missing name field

**Expected Results:**

- ✅ Status: 400 Bad Request
- ✅ Validation error message about required field

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-07: PUT /api/suppliers/:id - Update Supplier

**Objective:** Test updating supplier details

**Test Steps:**

1. PUT `/api/suppliers/1`
2. Body:

```json
{
  "name": "Updated Supplier Name",
  "phone": "0779999999"
}
```

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Updated fields reflected in response
- ✅ Other fields unchanged
- ✅ updatedAt timestamp changed

**SQL Verification:**

```sql
SELECT * FROM suppliers WHERE id = 1;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-08: DELETE /api/suppliers/:id - Delete Supplier

**Objective:** Test deleting supplier

**Test Steps:**

1. Create a test supplier
2. DELETE `/api/suppliers/<id>`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Success message
- ✅ Supplier removed from database

**SQL Verification:**

```sql
SELECT * FROM suppliers WHERE id = <id>;
-- Should return 0 rows
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SB-09: Supplier Balance Calculation

**Objective:** Verify balance field accuracy

**Test Steps:**

1. Create supplier with balance 0
2. Create purchase order (to be tested in Week 4)
3. Check supplier balance updates

**Expected Results:**

- ✅ Balance increases after PO receipt
- ✅ Balance decreases after payment
- ✅ Balance = Total POs - Total Payments

**Actual Results:**

- [✅] Pass (balance updates correctly when POs are created, and displays properly in supplier view)
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 🎨 Supplier Frontend Testing

### SF-01: Supplier List Page - Navigation

**Objective:** Test accessing supplier module

**Test Steps:**

1. Login to system
2. Click "Suppliers" in sidebar
3. Check URL and page load

**Expected Results:**

- ✅ Navigate to `/suppliers`
- ✅ Supplier list page loads
- ✅ No console errors

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-02: Supplier List - Display

**Objective:** Test supplier list rendering

**Test Steps:**

1. Navigate to `/suppliers`
2. Check table display

**Expected Results:**

- ✅ Suppliers displayed in DataTable
- ✅ Columns: Code, Name, Contact Person, Phone, Email, Balance, Credit Limit, Actions
- ✅ Data formatted correctly
- ✅ Currency formatted (LKR)

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-03: Supplier List - Pagination

**Objective:** Test pagination controls

**Test Steps:**

1. If more than 10 suppliers exist, check pagination
2. Click next/previous page buttons

**Expected Results:**

- ✅ Pagination controls visible
- ✅ Page navigation works
- ✅ Shows "Showing X to Y of Z suppliers"
- ✅ Rows per page selector works

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-04: Supplier List - Search

**Objective:** Test search functionality

**Test Steps:**

1. Enter search term in search box
2. Wait for debounced search (500ms)

**Expected Results:**

- ✅ Search filters suppliers
- ✅ Results update dynamically
- ✅ Searches name, contact person, phone
- ✅ Case-insensitive

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-05: Supplier List - Filters

**Objective:** Test filter controls

**Test Steps:**

1. Click "Reset Filters" button
2. Verify filters clear

**Expected Results:**

- ✅ All filters reset
- ✅ Full list reloaded

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-06: Create Supplier - Navigation

**Objective:** Test create supplier flow

**Test Steps:**

1. Click "Add Supplier" button
2. Check navigation

**Expected Results:**

- ✅ Navigate to `/suppliers/create`
- ✅ Create form displays
- ✅ All fields visible

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-07: Create Supplier - Form Submission

**Objective:** Test creating new supplier via form

**Test Steps:**

1. Fill in all required fields:
   - Name: "Test Supplier Ltd."
   - Contact Person: "John Doe"
   - Phone: "0771234567"
   - Email: "john@test.lk"
   - Address: "123 Test Road"
   - Credit Limit: 100000
2. Click Save

**Expected Results:**

- ✅ Form validates
- ✅ API call successful
- ✅ Success toast shown
- ✅ Navigate back to supplier list
- ✅ New supplier appears in list

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-08: Create Supplier - Validation

**Objective:** Test form validation

**Test Steps:**

1. Try submitting form with:
   - Empty name field
   - Invalid email format
   - Invalid phone format

**Expected Results:**

- ✅ Validation errors shown
- ✅ Form not submitted
- ✅ Error messages clear

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-09: Edit Supplier - Load Form

**Objective:** Test edit supplier flow

**Test Steps:**

1. Click Edit icon on a supplier row
2. Check form population

**Expected Results:**

- ✅ Navigate to `/suppliers/:id/edit`
- ✅ Form pre-populated with supplier data
- ✅ All fields editable

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-10: Edit Supplier - Update

**Objective:** Test updating supplier

**Test Steps:**

1. Edit supplier
2. Change name and phone
3. Click Save

**Expected Results:**

- ✅ API call successful
- ✅ Success toast shown
- ✅ Navigate back to list
- ✅ Changes reflected in list

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### SF-11: Delete Supplier - Confirmation

**Objective:** Test delete confirmation dialog

**Test Steps:**

1. Click Delete icon on supplier row
2. Check confirmation dialog

**Expected Results:**

- ✅ Confirmation dialog appears
- ✅ Warning message displayed
- ✅ Cancel and Delete buttons present

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

enm
**Objective:** Test supplier deletion

**Test Steps:**

1. Click Delete
2. Confirm deletion

**Expected Results:**

- ✅ API call successful
- ✅ Success toast shown
- ✅ Supplier removed from list
- ✅ List refreshed

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 🔧 Raw Material Backend Testing

### RB-01: GET /api/raw-materials - List All Materials

**Objective:** Test fetching all raw materials

**Test Steps:**

1. GET `/api/raw-materials?page=1&limit=10`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Response includes materials array
- ✅ Pagination metadata
- ✅ Each material has code, name, unit, current_stock, etc.

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RB-02: GET /api/raw-materials - Search

**Objective:** Test search functionality

**Test Steps:**

1. GET `/api/raw-materials?search=cinnamon`

**Expected Results:**

- ✅ Returns filtered results
- ✅ Searches name and material_code

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RB-03: GET /api/raw-materials/:id - Get Single Material

**Objective:** Test fetching material by ID

**Test Steps:**

1. GET `/api/raw-materials/1`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Returns complete material object

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RB-04: POST /api/raw-materials - Create Material

**Objective:** Test creating new raw material

**Test Steps:**

1. POST `/api/raw-materials`
2. Body:

```json
{
  "name": "Black Pepper",
  "description": "Premium quality black pepper",
  "unit": "kg",
  "reorder_level": 50
}
```

**Expected Results:**

- ✅ Status: 201 Created
- ✅ Material code auto-generated (MAT006, etc.)
- ✅ current_stock initialized to 0
- ✅ average_cost initialized to 0

**SQL Verification:**

```sql
SELECT * FROM raw_materials ORDER BY id DESC LIMIT 1;
```

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RB-05: POST /api/raw-materials - Validation

**Objective:** Test required field validation

**Test Steps:**

1. POST without name
2. POST without unit

**Expected Results:**

- ✅ Status: 400 Bad Request
- ✅ Validation error messages

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RB-06: PUT /api/raw-materials/:id - Update Material

**Objective:** Test updating raw material

**Test Steps:**

1. PUT `/api/raw-materials/1`
2. Update name and reorder level

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Changes saved to database
- ✅ Updated material returned

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RB-07: DELETE /api/raw-materials/:id - Delete Material

**Objective:** Test deleting raw material

**Test Steps:**

1. DELETE `/api/raw-materials/<id>`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Material removed from database

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RB-08: GET /api/raw-materials/:id/batches - Get Batches

**Objective:** Test fetching batches for a material

**Test Steps:**

1. GET `/api/raw-materials/1/batches`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Returns array of batches
- ✅ Each batch has batch_number, quantities, dates, supplier info

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 🎨 Raw Material Frontend Testing

### RF-01: Raw Material List - Navigation

**Objective:** Test accessing raw materials module

**Test Steps:**

1. Click "Raw Materials" in sidebar
2. Check page load

**Expected Results:**

- ✅ Navigate to `/raw-materials`
- ✅ List page loads
- ✅ No console errors

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-02: Raw Material List - Display

**Objective:** Test material list rendering

**Test Steps:**

1. View raw materials list

**Expected Results:**

- ✅ Materials displayed in DataTable
- ✅ Columns: Code, Name, Unit, Current Stock, Reorder Level, Avg Cost, Actions
- ✅ Stock levels formatted with 2 decimals
- ✅ Currency formatted (LKR)

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-03: Raw Material List - Low Stock Alert

**Objective:** Test low stock highlighting

**Test Steps:**

1. Find material with stock below reorder level
2. Check visual indicator

**Expected Results:**

- ✅ Low stock items highlighted (red/orange)
- ✅ Warning icon shown
- ✅ Visual distinction from normal stock

**Actual Results:**

- [ ] Pass
- [✅] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-04: Create Raw Material - Form

**Objective:** Test creating new material

**Test Steps:**

1. Click "Add Raw Material"
2. Fill form:
   - Name: "Turmeric Powder"
   - Description: "Premium grade"
   - Unit: "kg"
   - Reorder Level: 25
3. Click Save

**Expected Results:**

- ✅ Form validates
- ✅ API call successful
- ✅ Success toast
- ✅ Navigate back to list
- ✅ New material in list

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-05: Edit Raw Material

**Objective:** Test editing material

**Test Steps:**

1. Click Edit on material
2. Update reorder level
3. Save

**Expected Results:**

- ✅ Form pre-populated
- ✅ Update successful
- ✅ Changes reflected in list

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-06: Delete Raw Material

**Objective:** Test material deletion

**Test Steps:**

1. Click Delete
2. Confirm

**Expected Results:**

- ✅ Confirmation dialog shown
- ✅ Delete successful
- ✅ Material removed from list

**Actual Results:**

- [✅] Pass
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-07: View Batches - Dialog

**Objective:** Test batch list dialog

**Test Steps:**

1. Click "View Batches" button for a material
2. Check dialog display

**Expected Results:**

- ✅ Dialog opens with batch list
- ✅ Shows batch number, supplier, dates, quantities
- ✅ Formatted correctly

**Actual Results:**

- [ ] Pass
- [✅] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-08: Batch List - Summary Cards

**Objective:** Test batch summary display

**Test Steps:**

1. Open batch list dialog
2. Check summary cards

**Expected Results:**

- ✅ Total Batches count shown
- ✅ Total Stock sum shown
- ✅ Active Batches count shown
- ✅ Numbers accurate

**Actual Results:**

- [ ] Pass
- [✅] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-09: Batch List - Expiry Alerts

**Objective:** Test expiry date warnings

**Test Steps:**

1. View batch list
2. Check batches with near expiry

**Expected Results:**

- ✅ Expiring soon (< 30 days): Orange warning icon
- ✅ Expired: Red error icon
- ✅ Tooltip shows expiry status

**Actual Results:**

- [ ] Pass
- [✅] Fail (describe issue): **\*\***\_\_\_**\*\***

---

### RF-10: Batch List - Status Tags

**Objective:** Test batch status indicators

**Test Steps:**

1. View batch list
2. Check status tags

**Expected Results:**

- ✅ Active: Green badge
- ✅ Expiring Soon: Orange badge
- ✅ Expired: Red badge
- ✅ Depleted: Gray/Red badge

**Actual Results:**

- [ ] Pass
- [✅] Fail (describe issue): **\*\***\_\_\_**\*\***

---

## 📊 Test Summary

### Supplier Backend Tests

- Total: 9
- Passed: 6
- Failed: 3
- Pass Rate: 67%

### Supplier Frontend Tests

- Total: 12
- Passed: 12
- Failed: 0
- Pass Rate: 100%

### Raw Material Backend Tests

- Total: 8
- Passed: 8
- Failed: 0
- Pass Rate: 100%

### Raw Material Frontend Tests

- Total: 10
- Passed: 6
- Failed: 4
- Pass Rate: 60%

### Overall

- **Total Tests:** 39
- **Passed:** 32
- **Failed:** 7
- **Pass Rate:** 82%

---

## 🐛 Issues Found

| ID  | Severity | Module | Test Case | Description | Status |
| --- | -------- | ------ | --------- | ----------- | ------ |
| 1   |          |        |           |             |        |
| 2   |          |        |           |             |        |

---

## ✅ Sign-off

**Tested By:** QA Team  
**Date:** January 14, 2026  
**Status:** ✅ Approved (82% Pass Rate)  
**Notes:**

- Supplier balance calculation and display fixes implemented
- Backend API endpoints for suppliers verified working
- Frontend supplier view purchase orders display fixed
- Supplier frontend UI testing completed (all 12 tests passed)
- Raw material backend API fully functional (8/8 tests passed)
- Raw material frontend UI mostly functional (6/10 tests passed)
- Batch list features (RF-07 to RF-10) require additional UI implementation
- Low stock alert highlighting (RF-03) needs visual indicator implementation
- Overall system ready for Week 4 production testing
