# Hasal Products - UI/UX Design Mockup Structure

**Project:** POS & Inventory Management System  
**Platform:** Web Application (Responsive)  
**Framework:** Vue.js 3 (Composition API)  
**Design Style:** Clean, minimal, dashboard-based

---

## 1. Design Principles

- **Simplicity:** Easy-to-use interfaces for non-technical users
- **Efficiency:** Minimize clicks for common tasks
- **Responsive:** Works on desktop, tablet, and mobile
- **Consistency:** Uniform layout, colors, and components
- **Accessibility:** Clear labels, readable fonts, proper contrast

---

## 2. Color Scheme (Suggested)

- **Primary:** #2C3E50 (Dark Blue-Gray) - Headers, navigation
- **Secondary:** #E67E22 (Orange) - Buttons, highlights
- **Success:** #27AE60 (Green) - Success messages, paid status
- **Warning:** #F39C12 (Yellow) - Warnings, pending status
- **Danger:** #E74C3C (Red) - Errors, overdue status
- **Background:** #ECF0F1 (Light Gray) - Page background
- **White:** #FFFFFF - Card backgrounds, content areas

---

## 3. Layout Structure

### 3.1 Main Layout Components

```
┌─────────────────────────────────────────────────────────┐
│  TOP NAVIGATION BAR                                     │
│  [Logo] Hasal Products POS    [User: Admin ▼] [Logout] │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│  SIDEBAR    │         MAIN CONTENT AREA                 │
│  MENU       │                                           │
│             │   ┌─────────────────────────────────┐     │
│ Dashboard   │   │  Page Header / Breadcrumb       │     │
│ Suppliers   │   ├─────────────────────────────────┤     │
│ Raw Mat.    │   │                                 │     │
│ Products    │   │  Content (Tables, Forms, etc.)  │     │
│ Recipes     │   │                                 │     │
│ Production  │   │                                 │     │
│ Outlets     │   │                                 │     │
│ Sales       │   │                                 │     │
│ Payments    │   │                                 │     │
│ Reports     │   └─────────────────────────────────┘     │
│ Settings    │                                           │
│             │                                           │
└─────────────┴───────────────────────────────────────────┘
```

---

## 4. Page-by-Page Mockup Structure

### 4.1 Login Page

**URL:** `/login`

**Layout:**

```
┌───────────────────────────────────────┐
│                                       │
│         [Company Logo]                │
│                                       │
│     Hasal Products POS System         │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  Username: [_____________]      │  │
│  │  Password: [_____________]      │  │
│  │                                 │  │
│  │     [  Login  ]                 │  │
│  └─────────────────────────────────┘  │
│                                       │
└───────────────────────────────────────┘
```

**Features:**

- Simple username/password fields
- "Login" button
- Error message display for invalid credentials
- Remember me option (optional)

---

### 4.2 Dashboard (Home)

**URL:** `/dashboard`  
**Access:** Admin, Cashier

**Layout:**

```
┌───────────────────────────────────────────────────────┐
│  Dashboard                                            │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │Today's   │  │Outstanding│  │Low Stock │           │
│  │Sales     │  │Receivables│  │Alerts    │           │
│  │150,000LKR│  │  85,000   │  │    5     │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
│  Recent Sales (Last 10)                              │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Invoice  Date      Outlet    Amount   Status   │ │
│  │ INV-001  Dec 16   Outlet A   12,500   Paid     │ │
│  │ INV-002  Dec 16   Outlet B   8,300    Credit   │ │
│  │ ...                                             │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Quick Actions                                        │
│  [+ New Sale] [+ New Purchase] [+ Payment]           │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Widgets:**

1. Today's sales total
2. Outstanding receivables
3. Low stock alerts count
4. Recent sales table
5. Quick action buttons

---

### 4.3 Supplier Management

**URL:** `/suppliers`  
**Access:** Admin

#### 4.3.1 Supplier List Page

```
┌───────────────────────────────────────────────────────┐
│  Suppliers                            [+ Add Supplier]│
├───────────────────────────────────────────────────────┤
│  Search: [_________]  Filter: [All ▼]                │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Code  Name        Contact   Phone    Balance  │ │
│  │ SUP01 ABC Traders John      077123   15,000   │ │
│  │ SUP02 XYZ Limited Sarah     076456   0        │ │
│  │ ...                                  [Edit][View]│
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Pagination: [1] [2] [3] ... [Next]                  │
└───────────────────────────────────────────────────────┘
```

#### 4.3.2 Add/Edit Supplier Form

```
┌───────────────────────────────────────────────────────┐
│  Add Supplier                              [X] Close │
├───────────────────────────────────────────────────────┤
│  Code: [SUP-AUTO] (auto-generated)                   │
│  Name: [____________________]                         │
│  Contact Person: [____________________]               │
│  Phone: [____________________]                        │
│  Email: [____________________]                        │
│  Address: [____________________]                      │
│  Payment Terms: ( ) Cash  (•) Credit                  │
│  Status: [Active ▼]                                   │
│                                                       │
│         [Cancel]  [Save Supplier]                     │
└───────────────────────────────────────────────────────┘
```

---

### 4.4 Raw Material Management

**URL:** `/raw-materials`  
**Access:** Admin, Cashier

#### 4.4.1 Material List

```
┌───────────────────────────────────────────────────────┐
│  Raw Materials                    [+ Add Material]    │
├───────────────────────────────────────────────────────┤
│  Search: [_________]  Category: [All ▼]              │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Code   Name         Category   Unit   Stock    │ │
│  │ RM001  Chili Powder Spices     kg     50.5     │ │
│  │ RM002  Turmeric     Spices     kg     30.2     │ │
│  │ ...                                   [Edit][View]│
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.4.2 View Material (with Batches)

```
┌───────────────────────────────────────────────────────┐
│  Material: Chili Powder (RM001)           [X] Close  │
├───────────────────────────────────────────────────────┤
│  Category: Spices                                     │
│  Unit: kg                                             │
│  Reorder Level: 20 kg                                 │
│  Total Stock: 50.5 kg                                 │
│                                                       │
│  Batches:                                             │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Batch    Supplier  Qty   Cost/kg  Purchase Date │ │
│  │ B001     SUP01     30kg  1,200    2025-12-10   │ │
│  │ B002     SUP01     20.5  1,250    2025-12-14   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│                  [Close]                              │
└───────────────────────────────────────────────────────┘
```

---

### 4.5 Purchase Order Management

**URL:** `/purchase-orders`  
**Access:** Admin, Cashier

#### 4.5.1 PO List

```
┌───────────────────────────────────────────────────────┐
│  Purchase Orders                    [+ New PO]        │
├───────────────────────────────────────────────────────┤
│  Status: [All ▼]  Date Range: [From] - [To]         │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ PO#     Supplier   Date      Total    Status   │ │
│  │ PO-001  ABC Traders Dec 15   50,000   Received │ │
│  │ PO-002  XYZ Limited Dec 16   35,000   Pending  │ │
│  │ ...                                  [View][Edit]│
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.5.2 Create PO Form

```
┌───────────────────────────────────────────────────────┐
│  Create Purchase Order                     [X] Close │
├───────────────────────────────────────────────────────┤
│  PO Number: [PO-AUTO]                                 │
│  Supplier: [Select Supplier ▼]                        │
│  Order Date: [2025-12-16]                             │
│  Expected Date: [____-__-__]                          │
│                                                       │
│  Items:                         [+ Add Item]          │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Material     Qty    Unit Cost   Total   [Remove]│ │
│  │ Chili Powder 50kg   1,200       60,000  [x]     │ │
│  │ Turmeric     30kg   1,500       45,000  [x]     │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Total: 105,000 LKR                                   │
│                                                       │
│  Notes: [_________________________]                   │
│                                                       │
│         [Cancel]  [Save PO]                           │
└───────────────────────────────────────────────────────┘
```

#### 4.5.3 Receive PO

```
┌───────────────────────────────────────────────────────┐
│  Receive Purchase Order: PO-002            [X] Close │
├───────────────────────────────────────────────────────┤
│  Supplier: XYZ Limited                                │
│  Order Date: Dec 16, 2025                             │
│                                                       │
│  Items:                                               │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Material     Ordered  Batch#     Received Qty  │ │
│  │ Chili Powder 50kg     [B003]     [50] kg       │ │
│  │ Turmeric     30kg     [B004]     [30] kg       │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│         [Cancel]  [Receive & Update Stock]            │
└───────────────────────────────────────────────────────┘
```

---

### 4.6 Products & SKUs

**URL:** `/products`  
**Access:** Admin

#### 4.6.1 Product List

```
┌───────────────────────────────────────────────────────┐
│  Products                             [+ Add Product] │
├───────────────────────────────────────────────────────┤
│  Search: [_________]  Category: [All ▼]              │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Code   Name           Category   SKUs   Status  │ │
│  │ PRD01  Curry Powder   Spices     4       Active │ │
│  │ PRD02  Chili Powder   Spices     3       Active │ │
│  │ ...                                     [Edit][View]│
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.6.2 Add Product + SKUs

```
┌───────────────────────────────────────────────────────┐
│  Add Product                               [X] Close │
├───────────────────────────────────────────────────────┤
│  Product Details:                                     │
│  Code: [PRD-AUTO]                                     │
│  Name: [____________________]                         │
│  Category: [____________________]                     │
│  Description: [____________________]                  │
│                                                       │
│  SKUs (Sizes):                      [+ Add SKU]       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Size   Unit  Barcode    Price    Stock  [Remove]│ │
│  │ 100g   g     123456     250.00   0       [x]    │ │
│  │ 500g   g     123457     1,200    0       [x]    │ │
│  │ 1kg    kg    123458     2,300    0       [x]    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│         [Cancel]  [Save Product]                      │
└───────────────────────────────────────────────────────┘
```

---

### 4.7 Recipe Management

**URL:** `/recipes`  
**Access:** Admin

#### 4.7.1 Recipe List

```
┌───────────────────────────────────────────────────────┐
│  Recipes                              [+ New Recipe]  │
├───────────────────────────────────────────────────────┤
│  Search: [_________]  Status: [Active ▼]             │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Code   Name        Version  Yield   Status      │ │
│  │ RCP01  Curry Mix   v3       10kg    Active      │ │
│  │ RCP02  Chili Blend v2       8kg     Active      │ │
│  │ ...                                 [Edit][View][History]│
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.7.2 Create/Edit Recipe

```
┌───────────────────────────────────────────────────────┐
│  Create Recipe                             [X] Close │
├───────────────────────────────────────────────────────┤
│  Code: [RCP-AUTO]                                     │
│  Name: [____________________]                         │
│  Version: [1]  (new version saves as v2)              │
│  Expected Yield: [___] [kg ▼]                         │
│                                                       │
│  Ingredients (Bill of Materials): [+ Add Ingredient]  │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Raw Material    Quantity   Unit      [Remove]   │ │
│  │ Chili Powder    5          kg        [x]        │ │
│  │ Turmeric        2          kg        [x]        │ │
│  │ Coriander       3          kg        [x]        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Notes: [_________________________]                   │
│                                                       │
│  [Cancel]  [Save as New Version]  [Update Current]   │
└───────────────────────────────────────────────────────┘
```

---

### 4.8 Production Runs

**URL:** `/production`  
**Access:** Admin, Cashier

#### 4.8.1 Production List

```
┌───────────────────────────────────────────────────────┐
│  Production Runs                  [+ New Production]  │
├───────────────────────────────────────────────────────┤
│  Date Range: [From] - [To]  Recipe: [All ▼]          │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Batch#  Recipe      Date      Yield    Status   │ │
│  │ B-001   Curry Mix   Dec 14    10.5kg   Complete │ │
│  │ B-002   Chili Blend Dec 15    8.2kg    Complete │ │
│  │ ...                                     [View]   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.8.2 Create Production Run

```
┌───────────────────────────────────────────────────────┐
│  New Production Run                        [X] Close │
├───────────────────────────────────────────────────────┤
│  Recipe: [Select Recipe ▼]                            │
│  Version: [v3 (Active)]                               │
│  Batch Number: [B-AUTO]                               │
│  Production Date: [2025-12-16]                        │
│                                                       │
│  Raw Materials Used:                                  │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Material     Required  Batch#  Qty Used         │ │
│  │ Chili Powder 5kg       [B003▼] [5] kg          │ │
│  │ Turmeric     2kg       [B004▼] [2] kg          │ │
│  │ Coriander    3kg       [B005▼] [3] kg          │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Output (Finished Goods):         [+ Add Output]      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Product SKU      Quantity Produced   [Remove]   │ │
│  │ Curry Mix 100g   50 units            [x]        │ │
│  │ Curry Mix 500g   10 units            [x]        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Notes: [_________________________]                   │
│                                                       │
│         [Cancel]  [Save & Update Stock]               │
└───────────────────────────────────────────────────────┘
```

---

### 4.9 Employee Management

**URL:** `/employees`  
**Access:** Admin

#### 4.9.1 Employee List

```
┌───────────────────────────────────────────────────────┐
│  Employees                          [+ Add Employee]  │
├───────────────────────────────────────────────────────┤
│  Search: [_________]  Type: [All Types ▼]            │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Code   Name       Type        Route     Phone    │ │
│  │ SR01   John Doe   Sales Ref   Route 1   0771234  │ │
│  │ DR01   Jane Smith Driver      Route 2   0761234  │ │
│  │ WH01   Bob Kumar  Warehouse   -         0751234  │ │
│  │ ...                            [Edit][Deactivate]│
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.9.2 Add Employee Form

```
┌───────────────────────────────────────────────────────┐
│  Add Employee                              [X] Close │
├───────────────────────────────────────────────────────┤
│  Code: [EMP-AUTO]                                     │
│  Name: [____________________]                         │
│  Employee Type: ( ) Sales Ref  ( ) Driver  ( ) Warehouse│
│  Phone: [____________________]                        │
│  Assigned Route: [Select Route ▼] (for Sales Ref/Driver)│
│  Status: (•) Active  ( ) Inactive                     │
│                                                       │
│  Note: Employees are tracked for reference only.     │
│        No system login credentials are created.      │
│                                                       │
│         [Cancel]  [Save Employee]                     │
└───────────────────────────────────────────────────────┘
```

---

### 4.10 Routes & Outlets

**URL:** `/outlets`  
**Access:** Admin

#### 4.10.1 Outlet List

```
┌───────────────────────────────────────────────────────┐
│  Outlets                              [+ Add Outlet]  │
├───────────────────────────────────────────────────────┤
│  Search: [_________]  Route: [All Routes ▼]          │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Code   Name      Route    Phone    Balance  Status│
│  │ OUT01  Shop A    Route 1  077123   15,000   Active│
│  │ OUT02  Store B   Route 2  076456   0        Active│
│  │ ...                                 [Edit][View]  │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.10.2 Add Outlet Form

```
┌───────────────────────────────────────────────────────┐
│  Add Outlet                                [X] Close │
├───────────────────────────────────────────────────────┤
│  Code: [OUT-AUTO]                                     │
│  Name: [____________________]                         │
│  Owner: [____________________]                        │
│  Phone: [____________________]                        │
│  Email: [____________________]                        │
│  Address: [____________________]                      │
│  Route: [Select Route ▼]                              │
│  Default Discount: [20] %                             │
│  Credit Limit: [____] LKR                             │
│  Payment Terms: ( ) Cash  (•) Credit                  │
│                                                       │
│         [Cancel]  [Save Outlet]                       │
└───────────────────────────────────────────────────────┘
```

---

### 4.11 Sales & Invoicing (with Returns)

**URL:** `/sales`  
**Access:** Admin, Cashier

#### 4.11.1 Invoice List

```
┌───────────────────────────────────────────────────────┐
│  Sales Invoices                       [+ New Invoice] │
├───────────────────────────────────────────────────────┤
│  Date Range: [From] - [To]  Status: [All ▼]          │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Invoice#  Date     Outlet    SalesRef  Amount   │ │
│  │ INV-001   Dec 16   Shop A    John D    12,500   │ │
│  │ INV-002   Dec 16   Store B   Jane S    8,300    │ │
│  │ ...                                  [View][Print]│
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.11.2 Create Invoice

```
┌───────────────────────────────────────────────────────┐
│  New Sales Invoice                         [X] Close │
├───────────────────────────────────────────────────────┤
│  Invoice#: [INV-AUTO]   Date: [2025-12-16]           │
│  Outlet: [Select Outlet ▼]  (Balance: 15,000 LKR)    │
│  Sales Ref: [Select Sales Ref ▼]                      │
│  Route: [Select Route ▼]                              │
│                                                       │
│  Items:                              [+ Add Item]     │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Product         Qty  Price  Disc%  Total [Remove]│
│  │ Curry Mix 100g  10   250    20%    2,000  [x]   │ │
│  │ Chili Pwd 500g  5    1,200  20%    4,800  [x]   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Returns:                            [+ Add Return]   │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Product         Qty  Reason         Disposition  │ │
│  │ Curry Mix 100g  -2   Damaged        Dispose [x] │ │
│  │ Chili Pwd 500g  -1   Excess         Stock   [x] │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Subtotal:          6,800 LKR                         │
│  Returns:            -750 LKR                         │
│  Discount (20%):   -1,210 LKR                         │
│  ───────────────────────────────                      │
│  Total:             4,840 LKR                         │
│                                                       │
│  Payment Method: (•) Cash  ( ) Credit  ( ) Check      │
│  (If Check) Check#: [______] Date: [______]           │
│                                                       │
│         [Cancel]  [Save & Print]                      │
└───────────────────────────────────────────────────────┘
```

---

### 4.12 Payment Collection (with Check Tracking)

**URL:** `/payments`  
**Access:** Admin, Cashier

#### 4.12.1 Payment List

```
┌───────────────────────────────────────────────────────┐
│  Payments                            [+ Record Payment]│
├───────────────────────────────────────────────────────┤
│  Date Range: [From] - [To]  Outlet: [All ▼]          │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Date     Outlet    Amount   Method   Check#     │ │
│  │ Dec 16   Shop A    10,000   Cash     -          │ │
│  │ Dec 15   Store B   5,000    Bank     -          │ │
│  │ Dec 14   Shop C    8,000    Check    CHK001     │ │
│  │ ...                                   [View]     │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.12.2 Record Payment

```
┌───────────────────────────────────────────────────────┐
│  Record Payment                            [X] Close │
├───────────────────────────────────────────────────────┤
│  Outlet: [Select Outlet ▼]                            │
│  Current Balance: 15,000 LKR                          │
│                                                       │
│  Payment Date: [2025-12-16]                           │
│  Amount: [________] LKR                               │
│  Payment Method: ( ) Cash  ( ) Bank Transfer  ( ) Check│
│  Reference: [____________________]                    │
│                                                       │
│  If Check Payment:                                    │
│    Check Number: [____________________]               │
│    Check Date: [__________]                           │
│    Clearance Date: [__________] (optional)            │
│                                                       │
│  Outstanding Invoices:                                │
│  ┌─────────────────────────────────────────────────┐ │
│  │ [✓] Invoice#  Date      Amount   Pay Amount    │ │
│  │ [✓] INV-010   Dec 10    5,000    [5,000]       │ │
│  │ [✓] INV-015   Dec 14    10,000   [5,000]       │ │
│  │ [ ] INV-020   Dec 16    8,000    [____]        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  New Balance: 5,000 LKR                               │
│                                                       │
│         [Cancel]  [Save Payment]                      │
└───────────────────────────────────────────────────────┘
```

---

### 4.13 Reports

**URL:** `/reports`  
**Access:** Admin, Cashier (view only)

#### 4.13.1 Reports Dashboard

```
┌───────────────────────────────────────────────────────┐
│  Reports                                              │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Sales Reports:                                       │
│  • [Sales by Route]                                   │
│  • [Sales by Outlet]                                  │
│  • [Sales by Sales Ref]                               │
│  • [Product Returns Summary]                          │
│  • [Sales by Product]                                 │
│  • [Daily Sales Summary]                              │
│                                                       │
│  Inventory Reports:                                   │
│  • [Current Stock (Raw Materials)]                    │
│  • [Current Stock (Finished Goods)]                   │
│  • [Stock Valuation]                                  │
│  • [Low Stock Alerts]                                 │
│                                                       │
│  Financial Reports:                                   │
│  • [Outstanding Receivables]                          │
│  • [Receivables Aging]                                │
│  • [Supplier Ledger]                                  │
│  • [Cash Register Summary]                            │
│  • [Check Payment Status]                             │
│                                                       │
│  Production Reports:                                  │
│  • [Production Runs History]                          │
│  • [Recipe Usage]                                     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

#### 4.12.2 Sample Report Page (Sales by Route)

```
┌───────────────────────────────────────────────────────┐
│  Report: Sales by Route              [Export Excel]  │
├───────────────────────────────────────────────────────┤
│  Date Range: [2025-12-01] to [2025-12-16]  [Generate]│
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Route    Invoices  Total Sales  Cash    Credit  │ │
│  │ Route 1  25        250,000      200,000  50,000 │ │
│  │ Route 2  18        180,000      150,000  30,000 │ │
│  │ Route 3  12        120,000      100,000  20,000 │ │
│  │ ───────────────────────────────────────────────  │ │
│  │ TOTAL    55        550,000      450,000 100,000 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  [Print]  [Download PDF]                             │
└───────────────────────────────────────────────────────┘
```

---

### 4.13 User Management (Admin Only)

**URL:** `/users`  
**Access:** Admin

```
┌───────────────────────────────────────────────────────┐
│  Users                                  [+ Add User]  │
├───────────────────────────────────────────────────────┤
│  Search: [_________]  Role: [All ▼]                  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Username  Name        Role     Status   Actions  │ │
│  │ admin     Admin User  Admin    Active   [Edit]  │ │
│  │ cashier1  John Doe    Cashier  Active   [Edit]  │ │
│  │ driver1   Jane Smith  Driver   Inactive [Edit]  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 5. Common UI Components

### 5.1 Navigation Menu (Sidebar)

```
Dashboard
├── Home

Inventory
├── Suppliers
├── Raw Materials
├── Products & SKUs
├── Recipes
├── Production Runs
├── Stock Adjustments

Sales
├── Outlets & Routes
├── Vehicles
├── Sales Invoices
├── Payment Collection

Purchasing
├── Purchase Orders

Reports
├── Sales Reports
├── Inventory Reports
├── Financial Reports
├── Production Reports

Settings
├── Users (Admin only)
├── Company Settings
└── Logout
```

---

### 5.2 Common Buttons

- **Primary Action:** [+ New Item] (Orange)
- **Secondary:** [Cancel] [Close] (Gray)
- **Success:** [Save] [Submit] (Green)
- **Danger:** [Delete] [Remove] (Red)
- **Info:** [View] [Details] (Blue)

---

### 5.3 Table Features

- Sortable columns (click header)
- Search/filter bar
- Pagination (10, 25, 50 per page)
- Action buttons per row (Edit, View, Delete)
- Responsive (stack on mobile)

---

### 5.4 Form Validation

- Required field indicators (red asterisk)
- Inline error messages (red text below field)
- Success messages (green toast notification)
- Confirm dialogs for delete actions

---

## 6. Responsive Design Notes

### Desktop (> 1024px)

- Full sidebar visible
- Multi-column layouts
- Tables with all columns

### Tablet (768px - 1024px)

- Collapsible sidebar
- 2-column layouts
- Tables with important columns

### Mobile (< 768px)

- Hamburger menu
- Single-column layouts
- Card-based list view instead of tables
- Simplified forms (one field per row)

---

## 7. Printing & PDF Templates

### Invoice Template

```
─────────────────────────────────────────────
           HASAL PRODUCTS
     123 Main Street, Colombo, Sri Lanka
           Tel: +94 77 123 4567
─────────────────────────────────────────────

INVOICE: INV-001               Date: Dec 16, 2025

Bill To:
Shop A
Colombo Road
Tel: 077 123 4567

┌───────────────────────────────────────────┐
│ Item            Qty  Price   Disc   Total │
├───────────────────────────────────────────┤
│ Curry Mix 100g  10   250.00  20%   2,000 │
│ Chili Pwd 500g  5    1,200   20%   4,800 │
└───────────────────────────────────────────┘

                        Subtotal:    6,800.00
                        Discount:   -1,360.00
                        ─────────────────────
                        TOTAL:       5,440.00

Payment Method: Cash
Outstanding Balance: 15,000.00

Thank you for your business!
─────────────────────────────────────────────
```

---

**End of UI/UX Mockup Document**
