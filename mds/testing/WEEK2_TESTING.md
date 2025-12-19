# Week 2 Testing Plan - Database Schema & Authentication

**Module:** Database Models, Seeders & Authentication System  
**Test Date:** TBD  
**Tester:** [Your Name]  
**Status:** ⏳ Pending

---

## 📋 Pre-Testing Checklist

- [ ] MySQL database `hasal_pos_dev` created
- [ ] Backend server running
- [ ] All models synchronized to database
- [ ] Seeders executed successfully
- [ ] Frontend login page accessible

---

## 🗄️ Database Testing

### DB-01: Database Creation

**Objective:** Verify MySQL database is created successfully

**Test Steps:**

1. Connect to MySQL: `mysql -u root -p`
2. Run: `SHOW DATABASES;`
3. Check for `hasal_pos_dev`

**Expected Results:**

- ✅ Database `hasal_pos_dev` exists
- ✅ Proper character set (utf8mb4)

**SQL Verification:**

```sql
SHOW DATABASES LIKE 'hasal_pos_dev';
SELECT DEFAULT_CHARACTER_SET_NAME FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'hasal_pos_dev';
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-02: Table Creation (All 21 Tables)

**Objective:** Verify all 21 tables are created correctly

**Test Steps:**

1. Connect to database
2. Run: `SHOW TABLES;`
3. Verify all tables exist

**Expected Results:**
All 21 tables should exist:

- ✅ users
- ✅ suppliers
- ✅ raw_materials
- ✅ raw_material_batches
- ✅ products
- ✅ product_skus
- ✅ recipes
- ✅ recipe_items
- ✅ production_runs
- ✅ production_materials
- ✅ production_outputs
- ✅ purchase_orders
- ✅ po_items
- ✅ routes
- ✅ outlets
- ✅ employees
- ✅ vehicles
- ✅ route_vehicle_histories
- ✅ sales_invoices
- ✅ invoice_items
- ✅ payments
- ✅ supplier_payments
- ✅ stock_adjustments

**SQL Verification:**

```sql
USE hasal_pos_dev;
SHOW TABLES;
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'hasal_pos_dev';
```

**Actual Results:**

- [ ] Pass (21 tables)
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-03: Table Schema Validation - Users

**Objective:** Verify users table has correct columns and constraints

**Test Steps:**

1. Run: `DESCRIBE users;`
2. Check all columns and data types

**Expected Results:**

- ✅ id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- ✅ username (VARCHAR, UNIQUE, NOT NULL)
- ✅ email (VARCHAR, UNIQUE, NOT NULL)
- ✅ password (VARCHAR, NOT NULL)
- ✅ role (ENUM: admin, cashier)
- ✅ is_active (BOOLEAN, DEFAULT true)
- ✅ createdAt (DATETIME, NOT NULL)
- ✅ updatedAt (DATETIME, NOT NULL)

**SQL Verification:**

```sql
DESCRIBE users;
SHOW CREATE TABLE users;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-04: Table Schema Validation - Suppliers

**Objective:** Verify suppliers table schema

**Test Steps:**

1. Run: `DESCRIBE suppliers;`

**Expected Results:**

- ✅ id (PRIMARY KEY)
- ✅ supplier_code (VARCHAR, UNIQUE)
- ✅ name (VARCHAR, NOT NULL)
- ✅ contact_person (VARCHAR)
- ✅ phone (VARCHAR)
- ✅ email (VARCHAR)
- ✅ address (TEXT)
- ✅ balance (DECIMAL(15,2), DEFAULT 0)
- ✅ credit_limit (DECIMAL(15,2), DEFAULT 0)
- ✅ createdAt, updatedAt

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-05: Table Schema Validation - Raw Materials

**Objective:** Verify raw_materials table schema

**Test Steps:**

1. Run: `DESCRIBE raw_materials;`

**Expected Results:**

- ✅ id (PRIMARY KEY)
- ✅ material_code (UNIQUE)
- ✅ name (NOT NULL)
- ✅ description
- ✅ unit (ENUM: kg, g, l, ml, pieces, etc.)
- ✅ current_stock (DECIMAL)
- ✅ reorder_level (DECIMAL)
- ✅ average_cost (DECIMAL)
- ✅ createdAt, updatedAt

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-06: Foreign Key Constraints

**Objective:** Verify foreign key relationships are established

**Test Steps:**

1. Check foreign keys for key tables
2. Verify cascade actions

**Expected Results:**
Foreign keys should exist for:

- ✅ raw_material_batches.material_id → raw_materials.id
- ✅ raw_material_batches.supplier_id → suppliers.id
- ✅ po_items.po_id → purchase_orders.id
- ✅ po_items.material_id → raw_materials.id
- ✅ recipe_items.recipe_id → recipes.id
- ✅ recipe_items.material_id → raw_materials.id
- ✅ product_skus.product_id → products.id

**SQL Verification:**

```sql
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'hasal_pos_dev'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-07: Seeders - Users

**Objective:** Verify user seeders created sample accounts

**Test Steps:**

1. Query users table
2. Check for admin and cashier accounts

**Expected Results:**

- ✅ At least 2 users created
- ✅ One admin user
- ✅ One cashier user
- ✅ Passwords hashed (bcrypt)
- ✅ All users active (is_active = true)

**SQL Verification:**

```sql
SELECT id, username, email, role, is_active FROM users;
SELECT COUNT(*) FROM users WHERE role = 'admin';
SELECT COUNT(*) FROM users WHERE role = 'cashier';
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-08: Seeders - Suppliers

**Objective:** Verify supplier seeders created sample data

**Test Steps:**

1. Query suppliers table

**Expected Results:**

- ✅ At least 3 suppliers created
- ✅ Supplier codes auto-generated (SUP001, SUP002, etc.)
- ✅ All required fields populated
- ✅ Balance defaults to 0
- ✅ Credit limit set

**SQL Verification:**

```sql
SELECT * FROM suppliers;
SELECT COUNT(*) FROM suppliers;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-09: Seeders - Raw Materials

**Objective:** Verify raw material seeders created sample data

**Test Steps:**

1. Query raw_materials table

**Expected Results:**

- ✅ At least 5 materials created
- ✅ Material codes auto-generated (MAT001, MAT002, etc.)
- ✅ Units properly set (kg, g, l, etc.)
- ✅ Current stock set to 0 initially
- ✅ Reorder levels defined

**SQL Verification:**

```sql
SELECT * FROM raw_materials;
SELECT material_code, name, unit, current_stock, reorder_level FROM raw_materials;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-10: Seeders - Products & SKUs

**Objective:** Verify product and SKU seeders

**Test Steps:**

1. Query products table
2. Query product_skus table
3. Verify relationships

**Expected Results:**

- ✅ At least 3 products created
- ✅ Product codes auto-generated (PROD001, etc.)
- ✅ Each product has multiple SKUs (100g, 500g, 1kg, etc.)
- ✅ SKU codes follow format: PROD001-100G
- ✅ Barcodes unique
- ✅ Current stock initialized

**SQL Verification:**

```sql
SELECT * FROM products;
SELECT * FROM product_skus;
SELECT p.name, ps.sku_code, ps.variant, ps.barcode
FROM products p
JOIN product_skus ps ON p.id = ps.product_id;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-11: Seeders - Routes, Outlets, Employees

**Objective:** Verify route/outlet/employee seeders

**Test Steps:**

1. Query routes, outlets, employees tables

**Expected Results:**

- ✅ 3 routes created (route_code: R001, R002, R003)
- ✅ 3 outlets created with route assignments
- ✅ 3 employees created (sales_ref, driver, warehouse)
- ✅ Employees assigned to routes where applicable

**SQL Verification:**

```sql
SELECT * FROM routes;
SELECT * FROM outlets;
SELECT * FROM employees;
SELECT e.name, e.employee_type, r.route_code
FROM employees e
LEFT JOIN routes r ON e.route_id = r.id;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-12: Seeders - Vehicles

**Objective:** Verify vehicle seeders

**Test Steps:**

1. Query vehicles table

**Expected Results:**

- ✅ 2 vehicles created
- ✅ Vehicle codes auto-generated (VEH001, VEH002)
- ✅ License plates unique
- ✅ Status set to 'active'

**SQL Verification:**

```sql
SELECT * FROM vehicles;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### DB-13: Seeders - Recipe

**Objective:** Verify recipe and recipe items seeders

**Test Steps:**

1. Query recipes table
2. Query recipe_items table

**Expected Results:**

- ✅ 1 recipe created
- ✅ Recipe has version = 1
- ✅ Recipe linked to a product
- ✅ 3 recipe items created
- ✅ Recipe items linked to raw materials
- ✅ Quantities specified

**SQL Verification:**

```sql
SELECT * FROM recipes;
SELECT r.recipe_code, ri.quantity, ri.unit, rm.name
FROM recipes r
JOIN recipe_items ri ON r.id = ri.recipe_id
JOIN raw_materials rm ON ri.material_id = rm.id;
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

## 🔐 Authentication Backend Testing

### AB-01: POST /api/auth/register - Create User

**Objective:** Test user registration endpoint

**Test Steps:**

1. Use Postman/cURL to POST to `/api/auth/register`
2. Body:

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@123",
  "role": "cashier"
}
```

**Expected Results:**

- ✅ Status: 201 Created
- ✅ Response includes user object (without password)
- ✅ Response includes JWT token
- ✅ Password is hashed in database (check DB)
- ✅ User created with is_active = true

**SQL Verification:**

```sql
SELECT id, username, email, role, is_active, password
FROM users WHERE username = 'testuser';
```

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-02: POST /api/auth/login - Valid Credentials

**Objective:** Test login with correct credentials

**Test Steps:**

1. POST to `/api/auth/login`
2. Body:

```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Response includes user object
- ✅ Response includes JWT token
- ✅ Token has 24-hour expiry
- ✅ Password not included in response

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-03: POST /api/auth/login - Invalid Credentials

**Objective:** Test login with wrong password

**Test Steps:**

1. POST to `/api/auth/login` with wrong password

**Expected Results:**

- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid credentials"
- ✅ No token returned

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-04: POST /api/auth/login - Nonexistent User

**Objective:** Test login with username that doesn't exist

**Test Steps:**

1. POST to `/api/auth/login` with nonexistent username

**Expected Results:**

- ✅ Status: 401 Unauthorized
- ✅ Error message: "Invalid credentials"
- ✅ No token returned

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-05: GET /api/auth/me - With Valid Token

**Objective:** Test getting current user with valid JWT

**Test Steps:**

1. Login to get token
2. GET to `/api/auth/me`
3. Include token in Authorization header: `Bearer <token>`

**Expected Results:**

- ✅ Status: 200 OK
- ✅ Returns current user object
- ✅ Password not included

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-06: GET /api/auth/me - Without Token

**Objective:** Test protected endpoint without authentication

**Test Steps:**

1. GET to `/api/auth/me` without Authorization header

**Expected Results:**

- ✅ Status: 401 Unauthorized
- ✅ Error message about missing token

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-07: GET /api/auth/me - With Invalid Token

**Objective:** Test with malformed or expired token

**Test Steps:**

1. GET to `/api/auth/me` with invalid token

**Expected Results:**

- ✅ Status: 401 Unauthorized
- ✅ Error message about invalid token

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-08: JWT Middleware

**Objective:** Verify JWT middleware protects routes

**Test Steps:**

1. Try accessing protected routes without token
2. Try with valid token

**Expected Results:**

- ✅ Without token: 401 Unauthorized
- ✅ With valid token: Access granted
- ✅ User object attached to req.user

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AB-09: Role-Based Authorization

**Objective:** Test role check middleware

**Test Steps:**

1. Login as cashier
2. Try accessing admin-only endpoint (if any exist)

**Expected Results:**

- ✅ Status: 403 Forbidden (if admin-only)
- ✅ Proper error message about permissions

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

## 🎨 Authentication Frontend Testing

### AF-01: Login Page Rendering

**Objective:** Verify login page displays correctly

**Test Steps:**

1. Navigate to `/login`
2. Check page elements

**Expected Results:**

- ✅ Login form displays
- ✅ Username input field
- ✅ Password input field
- ✅ Login button
- ✅ No console errors
- ✅ PrimeVue components render

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-02: Login - Valid Credentials

**Objective:** Test successful login flow

**Test Steps:**

1. Enter username: "admin"
2. Enter password: "Admin@123"
3. Click Login button

**Expected Results:**

- ✅ API call to `/api/auth/login` succeeds
- ✅ Token stored in sessionStorage
- ✅ User data stored in auth store
- ✅ Redirect to dashboard
- ✅ Success toast notification shown

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-03: Login - Invalid Credentials

**Objective:** Test login with wrong password

**Test Steps:**

1. Enter valid username
2. Enter wrong password
3. Click Login

**Expected Results:**

- ✅ Error toast notification shown
- ✅ User stays on login page
- ✅ No token stored
- ✅ Form not cleared (username remains)

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-04: Token Storage

**Objective:** Verify JWT is stored correctly

**Test Steps:**

1. Login successfully
2. Open browser DevTools → Application → Session Storage
3. Check for auth token

**Expected Results:**

- ✅ Token present in sessionStorage
- ✅ Key: "auth_token" or similar
- ✅ Token is valid JWT format

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-05: Auth Store State

**Objective:** Verify Pinia auth store manages state correctly

**Test Steps:**

1. Check auth store before login
2. Login
3. Check auth store after login

**Expected Results:**

- ✅ Before: user = null, isAuthenticated = false
- ✅ After: user object populated, isAuthenticated = true
- ✅ Token stored in store

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-06: Navigation Guard - Unauthenticated

**Objective:** Test route protection for unauthenticated users

**Test Steps:**

1. Clear sessionStorage (logout)
2. Try navigating to `/dashboard`

**Expected Results:**

- ✅ Redirected to `/login`
- ✅ Cannot access protected routes

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-07: Navigation Guard - Authenticated

**Objective:** Test route access for authenticated users

**Test Steps:**

1. Login successfully
2. Navigate to `/dashboard`

**Expected Results:**

- ✅ Can access protected routes
- ✅ Dashboard loads successfully

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-08: Logout Functionality

**Objective:** Test logout clears auth state

**Test Steps:**

1. Login
2. Click Logout button (in topbar/sidebar)
3. Check auth state and sessionStorage

**Expected Results:**

- ✅ Token removed from sessionStorage
- ✅ Auth store cleared (user = null)
- ✅ Redirected to login page
- ✅ Cannot access protected routes after logout

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-09: Token Expiry Handling

**Objective:** Verify app handles expired tokens

**Test Steps:**

1. Login
2. Manually set token expiry to past date
3. Try accessing protected route

**Expected Results:**

- ✅ Token detected as expired
- ✅ User logged out automatically
- ✅ Redirected to login
- ✅ Toast notification about session expiry

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

### AF-10: Axios Interceptors

**Objective:** Test request/response interceptors

**Test Steps:**

1. Login
2. Make API request
3. Check Network tab in DevTools

**Expected Results:**

- ✅ Authorization header added automatically
- ✅ Token format: "Bearer <token>"
- ✅ 401 responses trigger logout

**Actual Results:**

- [ ] Pass
- [ ] Fail (describe issue): ******\_\_\_******

---

## 📊 Test Summary

### Database Tests

- Total: 13
- Passed: \_\_\_
- Failed: \_\_\_
- Pass Rate: \_\_\_%

### Auth Backend Tests

- Total: 9
- Passed: \_\_\_
- Failed: \_\_\_
- Pass Rate: \_\_\_%

### Auth Frontend Tests

- Total: 10
- Passed: \_\_\_
- Failed: \_\_\_
- Pass Rate: \_\_\_%

### Overall

- **Total Tests:** 32
- **Passed:** \_\_\_
- **Failed:** \_\_\_
- **Pass Rate:** \_\_\_%

---

## 🐛 Issues Found

| ID  | Severity | Test Case | Description | Status | Notes |
| --- | -------- | --------- | ----------- | ------ | ----- |
| 1   |          |           |             |        |       |
| 2   |          |           |             |        |       |
| 3   |          |           |             |        |       |

---

## ✅ Sign-off

**Tested By:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Status:** ⏳ Pending / ✅ Approved / ❌ Rejected  
**Notes:**
