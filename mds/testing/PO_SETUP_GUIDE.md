# 📋 Purchase Order Setup Guide for Testing

**Created:** January 15, 2026  
**Purpose:** Create test purchase orders for batch traceability testing

---

## ⚠️ Database Status Reality Check

### Actual Database Statuses

The `purchase_orders` table only supports these statuses:

| Status        | Meaning                      | Notes                         |
| ------------- | ---------------------------- | ----------------------------- |
| **pending**   | PO created, awaiting receipt | Editable, can be received     |
| **partial**   | Some items received          | Cannot edit, can receive more |
| **received**  | All items received           | Cannot edit                   |
| **cancelled** | PO cancelled                 | Cannot edit                   |

### Frontend vs Database Mismatch

- **Frontend** shows: "All Statuses", "Pending", **"Approved"**, "Received", "Cancelled"
- **Database** has: pending, partial, received, cancelled
- **There is NO "Approved" status in the database**

> ℹ️ **For testing:** Always use **"pending"** POs. They are ready to receive immediately.

---

## Quick Start: Create a Pending PO

### Method 1: PowerShell API (30 seconds)

```powershell
# 1. Set variables
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMjk0NDAwMH0.U0Hs-_1Yz5HLHIHcQRB74jR9Uj5cPz5sFTzfWvCwuYI"
$headers = @{ Authorization = "Bearer $token" }

# 2. Prepare payload
$payload = @{
    supplier_id = 1
    order_date = "2025-01-15"
    expected_date = "2025-01-20"
    items = @(
        @{ raw_material_id = 1; quantity = 100; unit_cost = 850 },
        @{ raw_material_id = 2; quantity = 50; unit_cost = 1200 },
        @{ raw_material_id = 3; quantity = 75; unit_cost = 500 }
    )
} | ConvertTo-Json

# 3. Create PO
$result = Invoke-RestMethod -Uri "http://localhost:3000/api/purchase-orders" `
    -Method Post -Headers $headers -ContentType "application/json" -Body $payload

# 4. Display result
$po = $result.data
Write-Host "✅ PO Created Successfully!"
Write-Host "   PO ID: $($po.id)"
Write-Host "   PO Number: $($po.po_number)"
Write-Host "   Status: $($po.status)"
Write-Host "   Supplier ID: $($po.supplier_id)"
Write-Host "   Total: $($po.total_amount)"
```

**Expected Output:**

```
✅ PO Created Successfully!
   PO ID: 5
   PO Number: PO-0005
   Status: pending
   Supplier ID: 1
   Total: 107500.00
```

---

### Method 2: Web UI (2 minutes)

1. **Navigate to:** `http://localhost:5173/purchase-orders`
2. **Click:** "Create New PO" button (top right)
3. **Fill Form:**

   | Field                  | Value                                       |
   | ---------------------- | ------------------------------------------- |
   | Supplier               | Select any supplier (e.g., "Supplier 1")    |
   | PO Date                | Today's date (2025-01-15)                   |
   | Expected Delivery Date | Future date (2025-01-20)                    |
   | Notes                  | (optional) "Test PO for batch traceability" |

4. **Add Items:**
   - Click "Add Item" button
   - **Item 1:**
     - Material: Turmeric Powder (MAT001)
     - Quantity: 100
     - Unit Cost: 850.00
   - Click "Add Item" again
   - **Item 2:**
     - Material: Chili Powder (MAT002)
     - Quantity: 50
     - Unit Cost: 1200.00
   - (Optional) Add more items

5. **Save:** Click "Save PO" button
   - Success notification appears
   - Status shows as **"pending"**
   - You're redirected to PO list

---

### Method 3: Database Insert (Advanced)

```sql
-- Only if you need to set up multiple POs quickly
-- This bypasses the API, but use API when possible

-- 1. Create purchase order
INSERT INTO purchase_orders (
    po_number, supplier_id, order_date, expected_date,
    total_amount, status, notes, created_by, created_at, updated_at
) VALUES (
    'PO-TEST-001', 1, '2025-01-15', '2025-01-20',
    107500.00, 'pending', 'Test PO', 1, NOW(), NOW()
);

-- 2. Get the PO ID (note the value)
SELECT LAST_INSERT_ID() AS po_id;
-- Example output: po_id = 5

-- 3. Create PO items (replace po_id with actual value)
INSERT INTO po_items (po_id, material_id, quantity, unit_cost, total_amount, created_at, updated_at) VALUES
(5, 1, 100, 850.00, 85000.00, NOW(), NOW()),
(5, 2, 50, 1200.00, 60000.00, NOW(), NOW());

-- 4. Verify
SELECT * FROM purchase_orders WHERE po_number = 'PO-TEST-001';
SELECT * FROM po_items WHERE po_id = 5;
```

---

## Verify PO is Ready

### 1. Check UI List

Navigate to: `http://localhost:5173/purchase-orders`

**Look for:**

- Your PO in the list
- Status shows: **"pending"** (or "Pending")
- In the **Actions** column, click the **✓ (checkmark) green button** to open the Receive dialog

### 2. Check Database

```sql
SELECT
    id,
    po_number,
    status,
    total_amount,
    created_at
FROM purchase_orders
WHERE po_number LIKE 'PO-%'
ORDER BY id DESC
LIMIT 3;
```

**Expected output:**

```
+----+----------+---------+--------------+---------------------+
| id | po_number| status  | total_amount | created_at          |
+----+----------+---------+--------------+---------------------+
| 5  | PO-0005  | pending | 107500.00    | 2025-01-15 10:30:00 |
+----+----------+---------+--------------+---------------------+
```

### 3. Check API

```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMjk0NDAwMH0.U0Hs-_1Yz5HLHIHcQRB74jR9Uj5cPz5sFTzfWvCwuYI"
$headers = @{ Authorization = "Bearer $token" }

# Get PO by ID (replace 5 with your PO ID)
$po = Invoke-RestMethod -Uri "http://localhost:3000/api/purchase-orders/5" `
    -Method Get -Headers $headers

Write-Host "PO Status: $($po.data.status)"
Write-Host "PO Items: $($po.data.items.Count)"
```

---

## Next: Receive the PO with Returns

Once you have a **pending PO**, you're ready to test the ReceivePO component:

1. Go to Purchase Orders list (`http://localhost:5173/purchase-orders`)
2. Find your pending PO in the table
3. Look at the **Actions** column (right side)
4. Click the **✓ (green checkmark) button** → "Receive PO" tooltip shows
5. **ReceivePO Dialog** opens with two tabs:
   - "Receive Items" - Receipt form
   - "Return Items" - Return form (NEW with source batch tracking)
6. Test filling return items with source batch selection

---

## Sample Data Reference

### Available Materials (common test materials)

```sql
SELECT id, code, name, unit FROM raw_materials LIMIT 10;
```

**Common materials:**

- ID 1: MAT001 - Turmeric Powder - kg
- ID 2: MAT002 - Chili Powder - kg
- ID 3: MAT003 - Cumin - kg
- ID 4: MAT004 - Coriander - kg
- ID 5: MAT005 - Fenugreek - kg

### Available Suppliers

```sql
SELECT id, code, name FROM suppliers LIMIT 5;
```

**Common suppliers:**

- ID 1: SUP001 - Supplier 1
- ID 2: SUP002 - Supplier 2
- ID 3: SUP003 - Supplier 3

---

## Troubleshooting PO Creation

| Issue                    | Cause                        | Solution                                               |
| ------------------------ | ---------------------------- | ------------------------------------------------------ |
| "Supplier not found"     | Invalid supplier_id          | Verify supplier exists: `SELECT * FROM suppliers;`     |
| "Raw material not found" | Invalid material_id in items | Verify material exists: `SELECT * FROM raw_materials;` |
| 401 Unauthorized         | Token expired or invalid     | Use fresh token from login                             |
| Cannot receive PO        | PO status is "cancelled"     | Create a new pending PO                                |
| 500 error                | Backend issue                | Check backend server logs                              |

---

## API Reference

### Create Purchase Order

```
POST /api/purchase-orders
```

**Request Body:**

```json
{
  "supplier_id": 1,
  "order_date": "2025-01-15",
  "expected_date": "2025-01-20",
  "items": [
    {
      "raw_material_id": 1,
      "quantity": 100,
      "unit_cost": 850
    }
  ]
}
```

### Get All Purchase Orders

```
GET /api/purchase-orders?status=pending&limit=10
```

### Get Purchase Order by ID

```
GET /api/purchase-orders/:id
```

### Receive Purchase Order

```
POST /api/purchase-orders/:id/receive
```

---

## Checklist: Ready to Test?

- [ ] Backend server running on port 3000
- [ ] Frontend dev server running on port 5173
- [ ] Database accessible and populated
- [ ] Created at least 1 pending PO
- [ ] PO has at least 2 items
- [ ] Can see PO in UI list with status "pending"
- [ ] Can click "Receive" button on PO

✅ **All checked? You're ready to test batch traceability features!**

---

**Next Steps:** Follow [BATCH_TRACEABILITY_TESTING_GUIDE.md](BATCH_TRACEABILITY_TESTING_GUIDE.md) → TEST 1: ReceivePO Return Form
