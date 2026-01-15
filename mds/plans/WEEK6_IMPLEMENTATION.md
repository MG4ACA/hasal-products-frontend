# Week 6 Implementation - Routes, Outlets, Employees & Vehicle Assignment

**Implementation Date:** December 20, 2025  
**Status:** ✅ Complete (Backend & Frontend)  
**Modules:** Route Management, Outlet Management, Employee Management, Vehicle Management with Assignment Feature

---

## Overview

Week 6 completes the distribution network management foundation with four interconnected modules. This implementation includes full CRUD operations for routes, outlets, employees, and vehicles, plus a comprehensive vehicle-to-route assignment system with complete history tracking.

### Key Features Implemented

- **Route Management**: Create and manage delivery routes with auto-generated codes
- **Outlet Management**: Manage customer outlets with credit management and route assignment
- **Employee Management**: Track sales representatives, drivers, and warehouse staff
- **Vehicle Management**: Complete fleet management with CRUD operations
- **Vehicle Assignment System** (NEW): Assign/unassign vehicles to routes with full history
- **Assignment History Tracking**: Complete audit trail of vehicle-route assignments
- **Multi-level Filtering**: Filter by status, route, employee type across all modules
- **Auto-code Generation**: Automatic sequential code generation (ROUTE-XXX, OUT-XXX, EMP-XXX, VEH-XXX)

---

## Backend Implementation

### 1. Route Controller (`controllers/routeController.js`)

Complete CRUD operations for delivery routes.

**Endpoints:**

- `GET /api/routes` - Get all routes with pagination & filters
- `GET /api/routes/:id` - Get route by ID with outlets & employees
- `POST /api/routes` - Create route (auto-generate ROUTE-XXX code)
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route
- `GET /api/routes/:id/outlets` - Get outlets assigned to route
- `GET /api/routes/:id/employees` - Get employees assigned to route

**Features:**

- Auto-code generation with format: `ROUTE-0001`, `ROUTE-0002`, etc.
- Search by route_name or route_code
- Filter by status (active/inactive)
- Pagination support
- Nested data: includes outlets and employees when fetching by ID

---

### 2. Outlet Controller (`controllers/outletController.js`)

Comprehensive outlet management with credit tracking.

**Endpoints:**

- `GET /api/outlets` - Get all outlets with pagination & filters
- `GET /api/outlets/:id` - Get outlet by ID
- `POST /api/outlets` - Create outlet (auto-generate OUT-XXX code)
- `PUT /api/outlets/:id` - Update outlet
- `DELETE /api/outlets/:id` - Delete outlet
- `GET /api/outlets/:id/balance` - Get outlet balance
- `GET /api/outlets/:id/invoices` - Get outlet invoices
- `GET /api/outlets/:id/payments` - Get outlet payments

**Features:**

- Auto-code generation: `OUT-0001`, `OUT-0002`, etc.
- Credit management fields: `credit_limit`, `current_balance`, `default_discount`
- Route assignment via `route_id` foreign key
- Payment terms tracking (cash/credit)
- Status management (active/inactive)
- Search by name or outlet_code
- Filter by route_id and status

---

### 3. Employee Controller (`controllers/employeeController.js`)

Employee management with type-based workflows.

**Endpoints:**

- `GET /api/employees` - Get all employees with pagination & filters
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (auto-generate EMP-XXX code)
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (soft delete)
- `GET /api/employees/:id/performance` - Get sales ref performance

**Features:**

- Auto-code generation: `EMP-0001`, `EMP-0002`, etc.
- Employee types: `sales_ref`, `driver`, `warehouse`
- Route assignment for sales_ref and driver types
- Soft delete with `deleted_at` timestamp
- Filter by employee_type and assigned_route_id
- Search by name or employee_code

**Important Note:**

- Employees do NOT have user accounts (no login functionality)
- Separate from User model which is for system authentication

---

### 4. Vehicle Controller (`controllers/vehicleController.js`)

Complete fleet management with route assignment system.

**Endpoints:**

- `GET /api/vehicles` - Get all vehicles with pagination & filters
- `GET /api/vehicles/:id` - Get vehicle by ID with current assignment
- `POST /api/vehicles` - Create vehicle (auto-generate VEH-XXX code)
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/:id/assignment-history` - Get route assignment history
- `POST /api/vehicles/:id/assign-route` - Assign vehicle to route
- `POST /api/vehicles/:id/unassign-route` - Unassign vehicle from route

**Features:**

- Auto-code generation: `VEH-0001`, `VEH-0002`, etc.
- Vehicle fields: `vehicle_number`, `registration_number`, `vehicle_type`, `capacity`
- Status management (active/inactive)
- Search by vehicle_number or registration_number
- Filter by status

**Route Assignment Logic:**

- Creates `RouteVehicleHistory` record on assignment
- Sets `is_current = true` for active assignment
- Updates vehicle's `current_route_id`
- On unassign: sets `unassigned_date` and `is_current = false`
- Tracks complete history with dates and notes
- One vehicle can only be assigned to one route at a time
- Validates route exists before assignment

---

## Frontend Implementation

### 1. Route Module

**Files Created:**

- `services/routeService.js` - API wrapper (7 methods)
- `stores/route.js` - Pinia state management
- `views/routes/RouteIndex.vue` - List view with filters
- `views/routes/RouteCreate.vue` - Create view
- `views/routes/RouteEdit.vue` - Edit view
- `components/routes/RouteList.vue` - DataTable component
- `components/routes/RouteForm.vue` - Form component

**Features:**

- Search by route name or code
- Status filter (All/Active/Inactive)
- DataTable with 5 columns (code, name, description, status, actions)
- Pagination (10/25/50 rows per page)
- Auto-generate code on save
- Toast notifications

---

### 2. Outlet Module

**Files Created:**

- `services/outletService.js` - API wrapper (8 methods)
- `stores/outlet.js` - Pinia state management
- `views/outlets/OutletIndex.vue` - List view with filters
- `views/outlets/OutletCreate.vue` - Create view
- `views/outlets/OutletEdit.vue` - Edit view
- `components/outlets/OutletList.vue` - DataTable component
- `components/outlets/OutletForm.vue` - Form component

**Features:**

- Search by outlet name or code
- Filter by route and status
- Display credit limit and current balance
- Payment terms dropdown (cash/credit)
- Route assignment dropdown (searchable)
- Default discount percentage field
- DataTable with 8 columns
- Currency formatting for balance and credit limit

---

### 3. Employee Module

**Files Created:**

- `services/employeeService.js` - API wrapper (6 methods)
- `stores/employee.js` - Pinia state management
- `views/employees/EmployeeIndex.vue` - List view with filters
- `views/employees/EmployeeCreate.vue` - Create view
- `views/employees/EmployeeEdit.vue` - Edit view
- `components/employees/EmployeeList.vue` - DataTable component
- `components/employees/EmployeeForm.vue` - Form component

**Features:**

- Search by employee name or code
- Filter by employee type (All/Sales Rep/Driver/Warehouse)
- Filter by assigned route
- Employee type dropdown (sales_ref, driver, warehouse)
- Conditional route assignment (only for sales_ref and driver)
- Phone and email fields
- Status management (active/inactive)
- DataTable with 7 columns

---

### 4. Vehicle Module with Assignment Feature

**Files Created:**

- `services/vehicleService.js` - API wrapper (8 methods including assignment)
- `stores/vehicle.js` - Pinia state management
- `views/vehicles/VehicleIndex.vue` - List view with filters and assignment trigger
- `views/vehicles/VehicleCreate.vue` - Create view
- `views/vehicles/VehicleEdit.vue` - Edit view
- `views/vehicles/VehicleHistory.vue` - **NEW** Assignment history view
- `components/vehicles/VehicleList.vue` - DataTable component
- `components/vehicles/VehicleForm.vue` - Form component
- `components/vehicles/VehicleAssignment.vue` - **NEW** Assignment dialog component
- `components/vehicles/AssignmentHistory.vue` - **NEW** History DataTable component

**VehicleIndex Features:**

- Search by vehicle number or registration
- Status filter (All/Active/Inactive)
- "View" button to open history page
- "Assign" button to open assignment dialog (from list)
- DataTable with 6 columns
- Pagination

**VehicleAssignment Component (`VehicleAssignment.vue`):**

Dialog-based assignment interface.

**Features:**

- PrimeVue Dialog with modal overlay
- Display current vehicle information (number, type, status)
- Show current assignment status with route details
- Route dropdown (searchable, filtered to active routes only)
- Conditional buttons:
  - "Assign" button (green) when not assigned
  - "Unassign" button (red) when currently assigned
- Loading states during API calls
- Auto-refresh on successful assign/unassign
- Emits events: `assigned`, `unassigned`, `update:visible`

**Component Structure:**

```vue
<VehicleAssignment
  v-model:visible="showAssignmentDialog"
  :vehicle-id="selectedVehicleId"
  @assigned="handleAssignmentChange"
  @unassigned="handleAssignmentChange"
/>
```

---

**AssignmentHistory Component (`AssignmentHistory.vue`):**

DataTable displaying complete assignment history.

**Features:**

- PrimeVue DataTable with pagination (10/25/50 rows)
- Columns:
  - Route (name + code nested display)
  - Assigned Date (formatted: DD MMM YYYY)
  - Unassigned Date (formatted or "N/A" for current)
  - Duration (calculated: "X days", "X months Y days", or "Current")
  - Status (Tag: "Current" in green, "Past" in gray)
  - Notes (optional column)
- Empty state with inbox icon when no history
- Striped rows for readability
- Responsive layout
- Auto-refresh via exposed `refresh()` method
- Loading state during fetch

**Duration Calculation Logic:**

- Calculates days between assigned and unassigned dates
- For current assignments: uses today as end date
- Formats as:
  - "Today" for 0 days
  - "X day(s)" for < 30 days
  - "X month(s) Y day(s)" for >= 30 days

---

**VehicleHistory View (`VehicleHistory.vue`):**

Dedicated page for viewing vehicle details and complete assignment history.

**Features:**

- Breadcrumb navigation (Dashboard → Vehicles → Assignment History)
- Vehicle information card:
  - Vehicle number (large heading with icon)
  - Registration number, type, capacity
  - Status tag
  - Current route assignment (if any) with highlighted card
  - "Manage Assignment" button to open dialog
  - "Back" button to return to vehicle list
- Assignment History card:
  - Embedded AssignmentHistory component
  - Auto-refresh after assignment changes
- Loading state while fetching vehicle data
- 404 redirect if vehicle not found
- Integration with VehicleAssignment dialog

**Route:**

```
/vehicles/:id/history
```

---

### Router Integration

**Routes Added (Week 6):**

```javascript
// Routes
{ path: '/routes', name: 'Routes', component: RouteIndex }
{ path: '/routes/create', name: 'RouteCreate', component: RouteCreate }
{ path: '/routes/:id/edit', name: 'RouteEdit', component: RouteEdit }

// Outlets
{ path: '/outlets', name: 'Outlets', component: OutletIndex }
{ path: '/outlets/create', name: 'OutletCreate', component: OutletCreate }
{ path: '/outlets/:id/edit', name: 'OutletEdit', component: OutletEdit }

// Employees
{ path: '/employees', name: 'Employees', component: EmployeeIndex }
{ path: '/employees/create', name: 'EmployeeCreate', component: EmployeeCreate }
{ path: '/employees/:id/edit', name: 'EmployeeEdit', component: EmployeeEdit }

// Vehicles
{ path: '/vehicles', name: 'Vehicles', component: VehicleIndex }
{ path: '/vehicles/create', name: 'VehicleCreate', component: VehicleCreate }
{ path: '/vehicles/:id/edit', name: 'VehicleEdit', component: VehicleEdit }
{ path: '/vehicles/:id/history', name: 'VehicleHistory', component: VehicleHistory } // NEW
```

All routes have `meta: { requiresAuth: true }`.

---

## Database Schema Usage

### Tables Utilized

**Primary Tables:**

- `routes` - Delivery routes with auto-generated codes
- `outlets` - Customer outlets with credit management
- `employees` - Sales reps, drivers, warehouse staff
- `vehicles` - Fleet vehicles

**Relationship Table:**

- `route_vehicle_history` - Tracks vehicle-route assignments over time

### Key Relationships

- **Outlets → Routes**: `route_id` foreign key
- **Employees → Routes**: `assigned_route_id` foreign key (for sales_ref and driver types)
- **Vehicles → Routes**: `current_route_id` foreign key (current assignment)
- **RouteVehicleHistory → Vehicles**: `vehicle_id` foreign key
- **RouteVehicleHistory → Routes**: `route_id` foreign key

### route_vehicle_history Schema

```sql
CREATE TABLE route_vehicle_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  route_id INT NOT NULL,
  assigned_date DATE NOT NULL,
  unassigned_date DATE NULL,
  is_current BOOLEAN DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (route_id) REFERENCES routes(id)
);
```

---

## Key Achievements

### ✅ Auto-Code Generation System

All modules use sequential code generation:

- Routes: `ROUTE-0001`, `ROUTE-0002`, etc.
- Outlets: `OUT-0001`, `OUT-0002`, etc.
- Employees: `EMP-0001`, `EMP-0002`, etc.
- Vehicles: `VEH-0001`, `VEH-0002`, etc.

### ✅ Comprehensive Filtering

- Search across multiple fields
- Status filters (active/inactive)
- Route-based filtering (outlets, employees)
- Employee type filtering

### ✅ Vehicle Assignment System

- Dialog-based assignment interface
- One-click assign/unassign
- Current assignment display
- Complete history tracking
- Date-based duration calculations
- Audit trail with notes

### ✅ Credit Management

Outlets have complete credit tracking:

- Credit limit
- Current balance
- Default discount percentage
- Payment terms (cash/credit)

### ✅ Soft Delete

Employees use soft delete pattern with `deleted_at` timestamp

### ✅ Consistent UI Patterns

- DataTable with pagination
- Search with 500ms debounce
- Filter dropdowns
- Toast notifications
- Confirmation dialogs
- Loading states
- Empty states

---

## Files Created/Modified (Week 6)

### Backend (Controllers, Routes, Utilities)

1. `hasal-pos-backend/controllers/routeController.js` (~250 lines)
2. `hasal-pos-backend/controllers/outletController.js` (~280 lines)
3. `hasal-pos-backend/controllers/employeeController.js` (~260 lines)
4. `hasal-pos-backend/controllers/vehicleController.js` (~320 lines with assignment logic)
5. `hasal-pos-backend/routes/routeRoutes.js`
6. `hasal-pos-backend/routes/outletRoutes.js`
7. `hasal-pos-backend/routes/employeeRoutes.js`
8. `hasal-pos-backend/routes/vehicleRoutes.js` (includes assignment endpoints)
9. `hasal-pos-backend/app.js` - Registered 4 new route modules

### Frontend (Services)

10. `src/services/routeService.js`
11. `src/services/outletService.js`
12. `src/services/employeeService.js`
13. `src/services/vehicleService.js` (8 methods including assignment)

### Frontend (Stores)

14. `src/stores/route.js`
15. `src/stores/outlet.js`
16. `src/stores/employee.js`
17. `src/stores/vehicle.js` (added assignment method aliases)

### Frontend (Views - 13 files)

18. `src/views/routes/RouteIndex.vue`
19. `src/views/routes/RouteCreate.vue`
20. `src/views/routes/RouteEdit.vue`
21. `src/views/outlets/OutletIndex.vue`
22. `src/views/outlets/OutletCreate.vue`
23. `src/views/outlets/OutletEdit.vue`
24. `src/views/employees/EmployeeIndex.vue`
25. `src/views/employees/EmployeeCreate.vue`
26. `src/views/employees/EmployeeEdit.vue`
27. `src/views/vehicles/VehicleIndex.vue` (with assignment integration)
28. `src/views/vehicles/VehicleCreate.vue`
29. `src/views/vehicles/VehicleEdit.vue`
30. `src/views/vehicles/VehicleHistory.vue` **NEW**

### Frontend (Components - 14 files)

31. `src/components/routes/RouteList.vue`
32. `src/components/routes/RouteForm.vue`
33. `src/components/outlets/OutletList.vue`
34. `src/components/outlets/OutletForm.vue`
35. `src/components/employees/EmployeeList.vue`
36. `src/components/employees/EmployeeForm.vue`
37. `src/components/vehicles/VehicleList.vue`
38. `src/components/vehicles/VehicleForm.vue`
39. `src/components/vehicles/VehicleAssignment.vue` **NEW**
40. `src/components/vehicles/AssignmentHistory.vue` **NEW**

### Frontend (Router)

41. `src/router/index.js` - Added 13 routes (including VehicleHistory)

### Documentation

42. `mds/WEEK6_IMPLEMENTATION.md` - This file
43. `mds/IMPLEMENTATION_PLAN.md` - Updated Week 6 section with completed tasks
44. `mds/testing/WEEK6_TESTING.md` - Updated with assignment tests (3 new tests added)

**Total:** 44 files created/modified

---

## Testing Requirements

### Backend API Testing (Postman)

**Route Endpoints (5 tests):**

1. Create route with auto-code
2. Get all routes with filters
3. Get route by ID with outlets/employees
4. Update route
5. Delete route

**Outlet Endpoints (6 tests):**

1. Create outlet with route assignment
2. Get outlets filtered by route
3. Get outlet balance
4. Update outlet credit limit
5. Search outlets by name
6. Delete outlet

**Employee Endpoints (6 tests):**

1. Create employee with type selection
2. Filter employees by type (sales_ref/driver/warehouse)
3. Filter employees by route
4. Update employee route assignment
5. Soft delete employee
6. Get employee performance (sales_ref only)

**Vehicle Endpoints (9 tests):**

1. Create vehicle with auto-code
2. Get all vehicles with filters
3. Get vehicle by ID
4. Update vehicle
5. Delete vehicle
6. **Assign vehicle to route** (NEW)
7. **Unassign vehicle from route** (NEW)
8. **Get vehicle assignment history** (NEW)
9. **Verify history tracking and is_current flag** (NEW)

### Frontend UI Testing (Manual)

**Route Module (5 tests):**

1. Navigate to routes page, verify list loads
2. Create route, verify auto-code generation
3. Search and filter routes
4. Edit route
5. Delete route with confirmation

**Outlet Module (6 tests):**

1. Create outlet with route assignment
2. Verify credit fields display correctly
3. Filter outlets by route
4. Search outlets
5. Edit outlet payment terms
6. Delete outlet

**Employee Module (6 tests):**

1. Create sales_ref with route assignment
2. Create driver with route assignment
3. Create warehouse staff (no route required)
4. Filter by employee type
5. Edit employee and change route
6. Delete employee

**Vehicle Module (9 tests):**

1. Create vehicle, verify auto-code
2. Navigate to vehicle list
3. **Click "View" to open history page** (NEW)
4. **Open assignment dialog, verify vehicle info displayed** (NEW)
5. **Assign vehicle to route, verify success** (NEW)
6. **Verify current assignment shows in history** (NEW)
7. **Unassign vehicle, verify history updated** (NEW)
8. **Assign vehicle to different route, verify old assignment marked as past** (NEW)
9. **Verify assignment history DataTable shows all records correctly** (NEW)
10. Edit vehicle details
11. Delete vehicle

### Integration Testing

**E2E Workflow:**

1. Create Route "North Route"
2. Create Outlet assigned to "North Route"
3. Create Sales Rep assigned to "North Route"
4. Create Driver assigned to "North Route"
5. Create Vehicle
6. **Assign vehicle to "North Route"**
7. **Verify vehicle shows in route's vehicles (if endpoint available)**
8. **Navigate to vehicle history page, verify assignment shown**
9. **Unassign vehicle, verify history updated with unassigned_date**
10. Filter outlets by route → verify outlet appears
11. Filter employees by route → verify sales rep and driver appear
12. Delete route → verify foreign key constraints

---

## Status Summary

| Component             | Status | Notes                                        |
| --------------------- | ------ | -------------------------------------------- |
| Route Backend         | ✅     | All endpoints complete                       |
| Route Frontend        | ✅     | Full CRUD with filters                       |
| Outlet Backend        | ✅     | All endpoints complete                       |
| Outlet Frontend       | ✅     | Full CRUD with credit management             |
| Employee Backend      | ✅     | All endpoints complete                       |
| Employee Frontend     | ✅     | Full CRUD with type-based workflows          |
| Vehicle Backend       | ✅     | All endpoints + assignment complete          |
| Vehicle Frontend      | ✅     | Full CRUD + assignment system                |
| Vehicle Assignment    | ✅     | Dialog-based UI complete                     |
| Assignment History    | ✅     | DataTable with history tracking              |
| Vehicle History View  | ✅     | Dedicated page with all details              |
| Router Integration    | ✅     | 13 routes added                              |
| Documentation         | ✅     | Implementation plan updated                  |
| Testing Documentation | ✅     | 44 test cases defined (3 new for assignment) |
| **Overall Week 6**    | **✅** | **100% Complete**                            |

---

## Next Steps

1. **Execute Testing:**
   - Run all 44 test cases from WEEK6_TESTING.md
   - Test vehicle assignment workflow thoroughly
   - Verify assignment history tracking
   - Test database constraints

2. **Bug Fixes:**
   - Address any issues found during testing
   - Verify foreign key constraints
   - Test edge cases (assign already assigned vehicle, etc.)

3. **Week 7 Preparation:**
   - Begin Sales & Invoicing module (already complete)
   - Continue with Week 8 Payment Collection

---

**Implementation Complete:** December 20, 2025  
**Testing Status:** Pending  
**Estimated Testing Time:** 3-4 hours  
**Next Milestone:** Week 7 Sales & Invoicing (Complete) → Week 8 Payment Collection
