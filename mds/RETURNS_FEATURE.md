# Purchase Order Returns Feature

## Overview

The PO Returns feature allows users to record returns of raw materials to suppliers during the receiving process. This handles scenarios like damaged goods, expired products, excess quantities, quality issues, or wrong items.

## Database Schema Changes

### Raw Material Batches Table

Three new fields were added to the `raw_material_batches` table:

| Field                | Type                      | Description                                      |
| -------------------- | ------------------------- | ------------------------------------------------ |
| `batch_type`         | ENUM('receipt', 'return') | Distinguishes normal receipts from returns       |
| `return_reason`      | VARCHAR(255)              | Reason for the return (nullable)                 |
| `return_disposition` | ENUM('stock', 'dispose')  | Whether to return to stock or dispose (nullable) |

**Migration File:** `20251219-add-return-fields-to-batches.js`

## Return Reasons

The system supports six return reasons:

1. **Damaged** - Items arrived damaged
2. **Expired** - Items are past or near expiration
3. **Excess** - More items received than ordered
4. **Quality Issue** - Items don't meet quality standards
5. **Wrong Item** - Incorrect items were shipped
6. **Other** - Any other reason

## Disposition Logic

Returns can be handled in two ways:

### Return to Stock (disposition: 'stock')

- Items are returned to inventory
- Stock levels are **decreased** by the return quantity
- Use for: Excess quantities that can be returned in good condition

### Dispose (disposition: 'dispose')

- Items are NOT returned to inventory
- Stock levels remain **unchanged**
- Use for: Damaged, expired, or quality-issue items that will be discarded

## Backend Implementation

### Receive Purchase Order Endpoint

**Endpoint:** `POST /api/purchase-orders/:id/receive`

**Request Body:**

```json
{
  "received_date": "2025-12-19",
  "received_items": [
    {
      "raw_material_id": 1,
      "quantity_received": 50.0,
      "expiry_date": "2026-06-30"
    }
  ],
  "return_items": [
    {
      "raw_material_id": 1,
      "quantity_returned": 5.0,
      "return_reason": "damaged",
      "disposition": "dispose",
      "expiry_date": "2026-06-30"
    }
  ]
}
```

### Processing Logic

1. **Receive Items:**
   - Creates batches with `batch_type='receipt'`
   - **Positive** quantities (initial_quantity and current_quantity)
   - Updates stock: `current_stock += quantity_received`
   - Generates batch number: `RM-{CODE}-{DATE}-{SEQ}`

2. **Return Items:**
   - Creates batches with `batch_type='return'`
   - **Negative** quantities (both initial and current)
   - Stores `return_reason` and `return_disposition`
   - Stock update logic:
     - If `disposition='stock'`: `current_stock -= quantity_returned`
     - If `disposition='dispose'`: No stock change

3. **Financial Impact:**
   - Calculates `totalReturnAmount = SUM(qty × unit_cost)`
   - Net amount: `total_amount - totalReturnAmount`
   - Supplier balance: `balance += netAmount`

### Transaction Safety

All operations (receipts + returns) are wrapped in a **single database transaction**. If any step fails, everything is rolled back.

## Frontend Implementation

### ReceivePO Component

The receive dialog uses a **TabView** with two tabs:

#### Tab 1: Receive Items

- Standard receiving interface
- Enter received quantities and expiry dates
- Validation: Quantity must be between 0.01 and 110% of ordered quantity

#### Tab 2: Return Items

- **Add Return Item Form:**
  - Material dropdown (filtered from PO items)
  - Quantity returned input
  - Return reason dropdown
  - Disposition selection (Return to Stock / Dispose)
  - Optional expiry date
  - Add Return button

- **Return Items List:**
  - DataTable showing all added returns
  - Columns: Material, Quantity, Reason (Tag), Disposition (Tag), Actions
  - Delete button to remove items

### Summary Display

The summary section shows:

- Total Items to Receive: count
- Total Returns: count (conditional)
- Total Amount: PO total
- Return Amount: `-$XXX` (conditional, in warning color)
- **Net Amount:** Total - Returns (bold, conditional)

### Validation

- All return items must have:
  - Selected material
  - Quantity > 0
  - Return reason
  - Disposition choice
- If receive items validation fails, user is switched to "Receive Items" tab

## Usage Workflow

### Example 1: Damaged Items (Dispose)

**Scenario:** Received 100kg of chili powder, but 5kg was damaged in shipping.

**Steps:**

1. Open PO and click "Receive"
2. In "Receive Items" tab:
   - Set received quantity: 100 kg
   - Set expiry date
3. Switch to "Return Items" tab:
   - Select material: Chili Powder
   - Quantity: 5 kg
   - Reason: Damaged
   - Disposition: Dispose
   - Click "Add Return"
4. Review summary:
   - Total Amount: $500.00
   - Return Amount: -$25.00
   - Net Amount: $475.00
5. Submit

**Result:**

- ✅ Receipt batch created: +100 kg (stock increased by 100)
- ✅ Return batch created: -5 kg (stock unchanged due to dispose)
- ✅ Supplier balance: +$475.00

### Example 2: Excess Items (Return to Stock)

**Scenario:** Ordered 50kg of turmeric, received 60kg. Returning 10kg excess.

**Steps:**

1. Open PO and click "Receive"
2. In "Receive Items" tab:
   - Set received quantity: 60 kg
   - Set expiry date
3. Switch to "Return Items" tab:
   - Select material: Turmeric
   - Quantity: 10 kg
   - Reason: Excess
   - Disposition: Return to Stock
   - Click "Add Return"
4. Submit

**Result:**

- ✅ Receipt batch created: +60 kg (stock increased by 60)
- ✅ Return batch created: -10 kg (stock decreased by 10)
- ✅ Net stock change: +50 kg
- ✅ Supplier balance reflects return credit

## Benefits

1. **Accurate Inventory:** Stock levels reflect actual usable inventory
2. **Financial Accuracy:** Supplier balances reflect net amounts after returns
3. **Audit Trail:** All returns are tracked with reasons and batch numbers
4. **Flexible Handling:** Dispose vs. Return to Stock options
5. **Quality Tracking:** Return reasons help identify supplier quality issues

## Future Enhancements

- [ ] Return reports by supplier/material/reason
- [ ] Filter batches by type (receipt vs return)
- [ ] Return authorization workflow
- [ ] Supplier return rate analytics
- [ ] Automatic quality alerts for high return rates
