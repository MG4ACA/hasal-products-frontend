# Phase 2 Frontend Testing Execution Guide

**Date:** January 27, 2026  
**Tester:** **\*\***\_**\*\***  
**Frontend URL:** http://localhost:5174  
**Backend URL:** http://localhost:5000

---

## Prerequisites Checklist

- [ ] Backend server running (`npm run dev` in hasal-pos-backend)
- [ ] Frontend server running (`npm run dev` in root)
- [ ] Database migrations applied
- [ ] At least 2 test users: Admin + Cashier
- [ ] At least 1 outlet with products configured
- [ ] Browser DevTools console open (to check for errors)

---

## Part 1: Return Validation UI Testing

### Test Case 1.1: Purchase History Lookup

**Steps:**

1. Login as cashier/admin
2. Navigate to **Sales → Create Invoice**
3. In **Invoice Details** tab, select an outlet from dropdown
4. Click on **Returns** tab
5. Select a product and SKU that has previous purchases
6. Click **"Purchase History"** button

**Expected Results:**

- [ ] Modal dialog opens with title "Purchase History"
- [ ] Table displays previous purchases with columns:
  - Invoice ID
  - Invoice Date
  - Quantity Sold
  - Days Since Purchase
  - Policy Status (tag with color)
- [ ] Color-coded tags display correctly:
  - 🟢 Green = "Within Policy"
  - 🟡 Yellow = "Near Expiry"
  - 🔴 Red = "Policy Expired"
- [ ] Table is sortable by clicking column headers
- [ ] Modal has "Close" button

**Actual Results:**

---

**Status:** ⬜ Pass
**Notes:**

---

---

### Test Case 1.2: Select Original Invoice from History

**Steps:**

1. In the Purchase History modal (from Test 1.1)
2. Click on any row in the purchase history table
3. Observe the original invoice field

**Expected Results:**

- [ ] Modal closes automatically
- [ ] Original Invoice Number field populates with selected invoice number (e.g., "INV-2026-001")
- [ ] Invoice ID displays below the field for reference
- [ ] Return Policy Info Banner **updates dynamically** with:
  - Color changes based on policy status:
    - 🟢 Green background = Within Policy
    - 🔴 Red background = Policy Exceeded
  - Status tag displays with icon:
    - ✅ "Within Policy" (green) if days ≤ policy limit
    - ⚠️ "Policy Exceeded" (red) if days > policy limit
  - Shows: Invoice number, invoice date, days since purchase, policy limit
  - Warning message appears if policy exceeded:
    - For cashier: "Contact admin for override authorization"
    - For admin: "Use Admin Override below to proceed"

**Actual Results:**

---

**Status:** ⬜ Pass
**Notes:**

---

---

### Test Case 1.3: Manual Original Invoice Entry

**Steps:**

1. In Returns tab, locate "Original Invoice Number" field
2. Note: Field is read-only (disabled) - must use Purchase History
3. Observe the form

**Expected Results:**

- [ ] Field is disabled/read-only
- [ ] Placeholder text says "Select from Purchase History"
- [ ] Can only select invoice via Purchase History button
- [ ] Shows invoice number (not numeric ID)

**Actual Results:**

---

**Status:** ⬜ Pass  
**Notes:**

---

---

### Test Case 1.4: Return Policy Info Banner Display

**Steps:**

1. Select an invoice from Purchase History first
2. Change the return reason dropdown to different options:
   - Damaged (7 days)
   - Expired (30 days)
   - Quality Issue (7 days)
   - Excess (3 days)
   - Other (3 days)
3. Observe the banner color and status tag

**Expected Results:**

- [ ] Banner displays policy time limit for each reason
- [ ] Policy status **recalculates dynamically** when reason changes:
  - Example: 10-day-old invoice
    - Damaged (7 days) → 🔴 Red "Policy Exceeded"
    - Expired (30 days) → 🟢 Green "Within Policy"
    - Excess (3 days) → 🔴 Red "Policy Exceeded"
- [ ] Banner background color changes (green/red) based on policy status
- [ ] Status tag updates with correct icon and severity
- [ ] Days since purchase message updates with new policy limit
- [ ] Warning message appears/disappears based on policy status

**Actual Results:**

---

**Status:** ⬜ Pass
**Notes:**

---

---

### Test Case 1.5: Return Validation - Missing Original Invoice

**Steps:**

1. Select return item (is_return = true)
2. Fill in quantity, price, return reason
3. **DO NOT** select an Original Invoice from Purchase History
4. Click "Add Return Item" button

**Expected Results:**

- [ ] Error toast appears: "Please select an original invoice for this return"
- [ ] Item is NOT added to invoice
- [ ] Form remains on Returns tab
- [ ] Original Invoice field highlighted/focused

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 1.6: Return Validation - Exceeding Quantity

**Steps:**

1. Create a test purchase: SKU #5, Quantity = 10
2. Create return invoice
3. Select same SKU, enter quantity = 15 (more than purchased)
4. Enter original invoice ID from step 1
5. Try to add item

**Expected Results:**

- [ ] Error toast: "Cannot return more than purchased quantity"
- [ ] Shows purchased quantity vs. return quantity
- [ ] Item NOT added to invoice
- [ ] Quantity field highlighted

**Actual Results:**

---

**Status:** ⬜ Pass 
**Notes:**

---

---

### Test Case 1.7: Return Validation - Time Policy Exceeded (Non-Admin)

**Steps:**

1. **Login as cashier** (non-admin)
2. Create return for invoice older than policy allows
   - e.g., 10-day-old invoice with "damaged" reason (7-day limit)
3. Fill in all fields including original invoice
4. Try to click "Add Return Item" button

**Expected Results:**

- [ ] Error toast appears: "Policy Violation - Return exceeds policy limit ([X] days ago, limit [Y] days). Contact admin for override."
- [ ] Item is NOT added to invoice
- [ ] Form remains on Returns tab
- [ ] Return Policy Info Banner shows RED background with "Policy Exceeded" tag
- [ ] Admin override section NOT visible (cashier has no access)

**Actual Results:**

---

**Status:** ⬜ Pass
**Notes:**

---

---

### Test Case 1.8: Admin Override - Visibility Check

**Steps:**

1. **Login as admin**
2. Navigate to Returns tab
3. Select an invoice that exceeds policy from Purchase History
4. Observe the form

**Expected Results:**

- [ ] "Admin Override" section is visible
- [ ] Contains checkbox: "Override Return Policy"
- [ ] Contains textarea: "Override Reason" (disabled until checkbox is checked)
- [ ] Section has amber/yellow background indicating special permission
- [ ] Clicking "Add Return Item" WITHOUT override checked shows warning:
  - "Admin Override Required - This return exceeds the policy limit. Please enable Admin Override and provide a reason."

**Actual Results:**

---

**Status:** ⬜ Pass 
**Notes:**

---

---

### Test Case 1.9: Admin Override - Without Reason
select return invoice that exceeds policy
2. Check "Override Return Policy" checkbox
3. Leave "Override Reason" blank
4. Try to click "Add Return Item" button

**Expected Results:**

- [ ] Error toast: "Validation Error - Admin override requires a reason"
- [ ] Override Reason field highlighted/focused
- [ ] Item is NOT added to invoice items table
- [ ] Form validation prevents adding the itemide reason is required for admin overrides"
- [ ] Override Reason field highlighted
- [ ] Form validation prevents submission
- [ ] Invoice NOT created

**Actual Results:**

---

**Status:** ⬜ Pass 
**Notes:**

---

---

### Test Case 1.10: Admin Override - Successful Override

**Steps:**

1. **As admin**, create return for old invoice (exceeds policy)
2. Check "Override Return Policy"
3. Enter reason: "Customer loyalty - special case"
4. Fill all other required fields
5. Submit invoice

**Expected Results:**

- [ ] Success toast: "Invoice created successfully" (or similar)
- [ ] Invoice created with negative quantity
- [ ] Database stores:
  - return_policy_override = true
  - return_policy_override_reason = "Customer loyalty - special case"
- [ ] Invoice appears in invoice list

**Actual Results:**

---

**Status:** ⬜ Pass 
**Notes:**

---

---

### Test Case 1.11: Return Within Policy - Normal Flow

**Steps:**

1. Login as cashier
2. Create return for recent invoice (within policy)
   - e.g., 3-day-old invoice, "damaged" reason (7-day limit)
3. Fill in all fields correctly
4. Submit without admin override

**Expected Results:**

- [ ] Green "Within Policy" tag displays
- [ ] Success toast appears
- [ ] Invoice created successfully
- [ ] return_policy_override = false in database
- [ ] Negative quantity recorded correctly

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

## Part 2: Check Bounce Management UI Testing

### Test Case 2.1: Pending Checks View Access

**Steps:**

1. Login as cashier
2. Navigate to **Payments → Pending Checks**

**Expected Results:**

- [ ] Page loads with pending checks list
- [ ] Amber banner displays: "Only administrators can bounce checks. Please contact admin for check bounce operations."
- [ ] Each check shows: Check Number, Date, Amount, Outlet, Status
- [ ] **Bounce button NOT visible** for cashier
- [ ] Clear button visible (if cashier has permission)

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.2: Admin Bounce Button Visibility

**Steps:**

1. **Login as admin**
2. Navigate to **Payments → Pending Checks**

**Expected Results:**

- [ ] Bounce button IS visible for each pending check
- [ ] Button has red/danger styling
- [ ] Tooltip shows "Bounce Check (Admin Only)"
- [ ] Admin notice banner NOT displayed (admin can see bounce button)

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.3: Bounce Dialog Display

**Steps:**

1. **As admin**, click "Bounce" button on any pending check

**Expected Results:**

- [ ] Dialog opens with title "Bounce Check"
- [ ] Red summary box displays:
  - Check Number
  - Check Date
  - Amount (large, bold)
  - Days Pending
- [ ] Form fields visible:
  - Bounce Reason (textarea, required)
  - Bounce Fee (number input, optional)
  - Bounce Date (calendar, required, max=today)
- [ ] Amber warning box displays explaining consequences:
  - "This will reverse all allocations..."
  - Shows amount to be restored
- [ ] "Cancel" and "Bounce Check" buttons

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.4: Bounce Validation - Missing Reason

**Steps:**

1. Open bounce dialog
2. Leave "Bounce Reason" blank
3. Fill in bounce date
4. Click "Bounce Check"

**Expected Results:**

- [ ] Validation error: "Bounce reason is required"
- [ ] Bounce Reason field highlighted
- [ ] Dialog remains open
- [ ] Check NOT bounced

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.5: Bounce Validation - Missing Date

**Steps:**

1. Open bounce dialog
2. Fill in bounce reason: "NSF - Insufficient funds"
3. Leave bounce date blank
4. Click "Bounce Check"

**Expected Results:**

- [ ] Validation error: "Bounce date is required"
- [ ] Bounce Date field highlighted
- [ ] Dialog remains open
- [ ] Check NOT bounced

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.6: Successful Check Bounce (No Fee)

**Steps:**

1. **As admin**, open bounce dialog
2. Fill in:
   - Bounce Reason: "NSF - Insufficient funds"
   - Bounce Fee: (leave blank or 0)
   - Bounce Date: Today's date
3. Click "Bounce Check"

**Expected Results:**

- [ ] Success toast: "Check bounced successfully"
- [ ] Dialog closes
- [ ] Check REMOVED from pending checks list
- [ ] Database updated:
  - payment_status = 'bounced'
  - bounce_reason = "NSF - Insufficient funds"
  - bounce_date = today
  - bounce_fee = 0
- [ ] Invoice allocations reversed
- [ ] Outlet balance increased by check amount

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.7: Successful Check Bounce (With Fee)

**Steps:**

1. Create invoice with check payment (note outlet balance)
2. **As admin**, bounce the check with:
   - Bounce Reason: "Closed account"
   - Bounce Fee: 25.00
   - Bounce Date: Today
3. Observe results

**Expected Results:**

- [ ] Success toast appears
- [ ] Check removed from pending list
- [ ] Database:
  - bounce_fee = 25.00
- [ ] Outlet balance = original_balance + check_amount + bounce_fee
- [ ] Warning in dialog showed "+ Rs. 25.00 fee" before submission

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.8: Non-Admin Bounce Attempt

**Steps:**

1. **Login as cashier**
2. Try to access bounce functionality (if button somehow visible via URL/API)
3. OR check that bounce button is hidden

**Expected Results:**

- [ ] Bounce button NOT rendered in UI
- [ ] If API called directly, returns 403 Forbidden
- [ ] Toast warning: "Only administrators can bounce checks"
- [ ] Operation blocked

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.9: Clear Check Functionality (Existing Feature)

**Steps:**

1. Login as admin/accountant
2. Navigate to Pending Checks
3. Click "Clear" button on any pending check
4. Fill in clearance date
5. Submit

**Expected Results:**

- [ ] Success toast: "Check cleared successfully"
- [ ] Check removed from pending list
- [ ] Payment status = 'cleared'
- [ ] Allocations remain intact (not reversed)
- [ ] Uses new API endpoint: POST /payments/:id/clear

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.10: Error Handling - Network Failure

**Steps:**

1. Stop the backend server
2. Try to:
   - a) Load purchase history
   - b) Bounce a check
   - c) Clear a check

**Expected Results:**

- [ ] Error toast appears for each operation
- [ ] User-friendly error message (not raw error)
- [ ] No console errors breaking the app
- [ ] Loading states handled gracefully

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### Test Case 2.11: Console Error Check

**Steps:**

1. Open Browser DevTools → Console tab
2. Perform all operations above
3. Check for errors/warnings

**Expected Results:**

- [ ] No JavaScript errors
- [ ] No failed API calls (other than intentional network test)
- [ ] No Vue warnings
- [ ] No deprecated function warnings

**Actual Results:**

---

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

## Part 3: End-to-End Workflow Testing

### E2E Test 1: Complete Return Flow

**Scenario:** Customer returns damaged goods within policy

1. [ ] Create purchase invoice (SKU #2, Qty 20, Rs. 50 each)
2. [ ] Note invoice ID and outlet balance
3. [ ] Create return invoice (same SKU, Qty 5, "damaged" reason)
4. [ ] Use purchase history lookup to find original invoice
5. [ ] Select original invoice from modal
6. [ ] Verify policy shows "Within Policy" (green)
7. [ ] Submit return successfully
8. [ ] Verify outlet balance decreased by Rs. 250
9. [ ] Verify invoice shows negative quantity (-5)

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### E2E Test 2: Admin Override Flow

**Scenario:** Admin approves old return with valid business reason

1. [ ] Create old purchase invoice (set date to 40 days ago manually in DB)
2. [ ] Login as admin
3. [ ] Try to create return for "damaged" (7-day policy)
4. [ ] See policy expired warning (red tag)
5. [ ] Check "Override Return Policy"
6. [ ] Enter reason: "Valued customer - goodwill gesture"
7. [ ] Submit successfully
8. [ ] Verify override logged in database

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

### E2E Test 3: Check Bounce with Balance Reversal

**Scenario:** Customer's check bounces, balance must be restored

1. [ ] Create invoice with check payment (Rs. 1000)
2. [ ] Note outlet balance (should be reduced by Rs. 1000)
3. [ ] Verify check appears in Pending Checks
4. [ ] Login as admin
5. [ ] Bounce check with fee Rs. 50
6. [ ] Verify outlet balance increased by Rs. 1050 (1000 + 50)
7. [ ] Verify check removed from pending list
8. [ ] Verify invoice status updated correctly

**Status:** ⬜ Pass ⬜ Fail  
**Notes:**

---

---

## Test Summary

**Total Test Cases:** 25  
**Passed:** ** all the Test Case 1 are done **  
**Failed:** **\_**  
**Blocked:** **\_**

### Critical Issues Found

1. ***
2. ***
3. ***

### Minor Issues Found

1. ***
2. ***

### Recommendations

---

---

---

---

**Tester Signature:** **\*\***\_\_\_**\*\***  
**Date Completed:** **\*\***\_\_\_**\*\***  
**Overall Status:** ⬜ Ready for Production ⬜ Needs Fixes
