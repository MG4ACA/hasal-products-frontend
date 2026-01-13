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
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***


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
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

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
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

---
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
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***


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
- [ ] Fail (describe issue): **\*\***\_\_\_**\*\***

