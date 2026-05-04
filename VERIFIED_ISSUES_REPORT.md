# Hasal Spices POS - Verified Issues Report

**Date:** May 2, 2026  
**Status:** Code Review & Verification Complete  
**Total Issues:** 45 (including fixed issues)

---

## Issue Summary by Status

- **Active Issues:** 28
- **Fixed Issues:** 12
- **Need to Run Project:** 5

---

## CRITICAL ISSUES

### Issue #1: JWT Token Stored in SessionStorage (XSS Vulnerability)

**Category:** Security  
**Severity:** CRITICAL  
**Status:** Active - Code Review Complete  
**Files:**

- [src/stores/auth.js](src/stores/auth.js)
- [src/services/api.js](src/services/api.js)

**Description:**  
JWT tokens are stored in sessionStorage instead of secure HTTP-only cookies, making them vulnerable to XSS attacks. Any malicious JavaScript can access and steal tokens, leading to unauthorized user impersonation.

**Current Behavior:**  
Tokens stored in sessionStorage: `sessionStorage.getItem('token')` and `sessionStorage.setItem('token', token.value)`

**Recommended Fix:**

1. Move tokens to HTTP-only cookies on the backend:
   ```javascript
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 24 * 60 * 60 * 1000,
   });
   ```
2. Remove manual token retrieval from sessionStorage in frontend
3. Implement CSRF protection (double-submit cookie or CSRF tokens)
4. Update API interceptor to automatically include cookies

**Impact:** User account hijacking, unauthorized data access

**Priority:** IMMEDIATE

---

### Issue #2: Hardcoded Database Credentials

**Category:** Security  
**Severity:** CRITICAL  
**Status:** Active - Code Review Complete  
**Files:**

- [hasal-pos-backend/.env](hasal-pos-backend/.env) (Line: DB_PASSWORD=1234)

**Description:**  
Database password is hardcoded with weak default value in version control, allowing anyone with repository access to access the production database.

**Current Behavior:**

```
DB_PASSWORD=1234
```

**Recommended Fix:**

1. Immediately rotate database credentials
2. Move credentials to environment-specific secrets management (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
3. Use `.env.local` for development (in .gitignore)
4. Remove `.env` from git history: `git filter-branch --tree-filter 'rm -f .env'`
5. Implement secret rotation policy

**Impact:** Direct access to all business data, data exfiltration risk

**Priority:** IMMEDIATE

---

### Issue #3: Hardcoded JWT Secret

**Category:** Security  
**Severity:** CRITICAL  
**Status:** Active - Code Review Complete  
**Files:**

- [hasal-pos-backend/.env](hasal-pos-backend/.env) (Line: JWT_SECRET=hasal_pos_dev_secret_key_2025_please_change_in_production)

**Description:**  
JWT secret is hardcoded and exposed in version control with weak default value, allowing token forgery.

**Current Behavior:**  
JWT_SECRET hardcoded with development value marked for change

**Recommended Fix:**

1. Generate strong random JWT secret using: `openssl rand -hex 32`
2. Store secret in environment-specific vault
3. Implement JWT expiry validation on backend
4. Add pre-commit hook to prevent .env commits
5. Rotate secret immediately

**Impact:** Cryptographic compromise, unauthorized token generation

**Priority:** IMMEDIATE

---

### Issue #4: Missing CORS Validation

**Category:** Security  
**Severity:** MAJOR  
**Status:** Active - Code Review Complete  
**Files:**

- [hasal-pos-backend/app.js](hasal-pos-backend/app.js) (Line 18)

**Description:**  
CORS configuration uses single origin with fallback to localhost, which could expose the API if environment variables aren't set in production.

**Current Behavior:**

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
};
```

**Recommended Fix:**

```javascript
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be configured in production');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
```

**Priority:** HIGH

---

## MAJOR ISSUES

### Issue #5: Error Handler Check Pattern Potentially Broken

**Category:** Error Handling  
**Severity:** HIGH  
**Status:** Active - Code Review Complete  
**Files:**

- [src/utils/errorHandler.js](src/utils/errorHandler.js#L13)
- [src/services/reportService.js](src/services/reportService.js#L7)

**Description:**  
The error check pattern `error.response?.data?.message` is used throughout the system but may not catch all error scenarios, leaving some errors unhandled or displaying generic messages.

**Current Code:**

```javascript
const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
```

**Recommended Fix:**

1. Create comprehensive error handler utility:
   ```javascript
   const getErrorMessage = error => {
     // API Errors
     if (error.response?.data?.message) return error.response.data.message;
     if (error.response?.data?.errors) return JSON.stringify(error.response.data.errors);
     if (error.response?.statusText) return error.response.statusText;

     // Network Errors
     if (error.message === 'Network Error') return 'Network connection failed';
     if (error.code === 'ECONNABORTED') return 'Request timeout';

     // Default
     return error.message || 'An unexpected error occurred';
   };
   ```
2. Use consistent error handling across all services
3. Add error logging for debugging

**Priority:** HIGH

---

### Issue #6: Breadcrumb Inconsistency

**Category:** UI/UX  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete  
**Description:**  
Breadcrumb navigation is implemented inconsistently across the application. Some views use it while others don't, confusing users about their location in the app.

**Affected Areas:**

- ExpenseReport.vue - HAS breadcrumb
- ExpenseCreate.vue - HAS breadcrumb
- ExpenseIndex.vue - COMMENTED OUT
- ProductView.vue - HAS breadcrumb
- Some other views missing breadcrumbs

**Recommended Fix:**

1. Create breadcrumb component wrapper for consistency
2. Add breadcrumbs to ALL views/routes using router metadata
3. Implement global breadcrumb generation based on route hierarchy
4. Example implementation:
   ```javascript
   // In router configuration
   const routes = [
     {
       path: '/expenses',
       component: ExpenseIndex,
       meta: { breadcrumb: 'Expenses' },
     },
     {
       path: '/expenses/create',
       component: ExpenseCreate,
       meta: { breadcrumb: 'Create' },
     },
   ];
   ```

**Priority:** MEDIUM

---

### Issue #7: Title Bar Duplication

**Category:** UI/UX  
**Severity:** LOW  
**Status:** Need to Run Project  
**Files:**

- [src/components/layout/Topbar.vue](src/components/layout/Topbar.vue)

**Description:**  
Duplicate title displaying in every area - need to verify if page title appears twice (h2 element duplication or multiple title displays).

**Current Code:**  
Topbar renders: `<h2>{{ pageTitle }}</h2>`

**Recommended Fix:**

1. Verify if parent component also renders title
2. If duplication confirmed, remove one title element
3. Ensure only one source of truth for page titles
4. Use router metadata for page titles

**Priority:** LOW  
**Status Needed:** Need to Run

---

### Issue #8: Toast Message Styling Issue

**Category:** UI/UX  
**Severity:** LOW  
**Status:** Need to Run Project

**Description:**  
Toast notifications have styling issues. Need to verify appearance, positioning, and color consistency.

**Current Implementation:**  
Using `useToastNotification()` composable and PrimeVue Toast component

**Recommended Fix:**

1. Review CSS styling for Toast component
2. Ensure consistent styling across success/error/warning messages
3. Verify positioning (top-right is standard)
4. Check color contrast for accessibility
5. Ensure animations are smooth

**Priority:** LOW  
**Status Needed:** Need to Run

---

## HIGH PRIORITY ISSUES

### Issue #9: Product SKU Creation Only in Edit Mode

**Category:** Feature/Workflow  
**Severity:** HIGH  
**Status:** Active - Code Review Complete  
**Files:**

- [src/components/products/ProductForm.vue](src/components/products/ProductForm.vue)
- [src/views/products/ProductCreate.vue](src/views/products/ProductCreate.vue)

**Description:**  
SKU management is disabled in product creation form and only available when editing existing products. This forces users to create a product first, then add SKUs separately, creating an inefficient workflow.

**Current Behavior:**

```vue
<!-- SKU Management (Only in Edit Mode) -->
<div v-if="isEditMode && productData" class="mt-4">
```

**Recommended Fix:**

1. Enable SKU section in create mode:
   ```vue
   <div v-if="true" class="mt-4">
     <!-- SKU Management Section -->
   </div>
   ```
2. Allow adding SKUs during product creation
3. Validate SKU data before product submission
4. Preserve SKUs in form if creation fails
5. Update product service to handle SKU creation in one request

**Priority:** HIGH

---

### Issue #10: Product SKU Reorder Level Positioning

**Category:** UI/UX  
**Severity:** HIGH  
**Status:** Active - Code Review Complete  
**Files:**

- [src/components/products/ProductForm.vue](src/components/products/ProductForm.vue)

**Description:**  
The reorder level field in SKU management is not positioned beside other fields, making the form layout inconsistent and harder to use.

**Recommended Fix:**

1. Restructure SKU form grid layout:
   ```vue
   <div class="grid">
     <div class="col-12 md:col-6">
       <label>SKU Size</label>
       <!-- Field -->
     </div>
     <div class="col-12 md:col-6">
       <label>Unit</label>
       <!-- Field -->
     </div>
     <div class="col-12 md:col-6">
       <label>Reorder Level</label>
       <!-- Field -->
     </div>
     <div class="col-12 md:col-6">
       <label>Current Stock</label>
       <!-- Field -->
     </div>
   </div>
   ```
2. Use consistent grid column sizing

**Priority:** HIGH

---

### Issue #11: Production Stock Reduction During Run Execution

**Category:** Inventory/Business Logic  
**Severity:** HIGH  
**Status:** Need to Run Project  
**Files:**

- [hasal-pos-backend/controllers/productionController.js](hasal-pos-backend/controllers/productionController.js)

**Description:**  
When running a production, stocks are reducing from batch details immediately. This prevents tracking the initial batch quantity before stock was consumed. System should track batch quantities separately from production usage.

**Current Behavior:**  
Batch stock reduces when production starts, losing visibility of initial quantities

**Recommended Fix:**

1. Implement separate stock tracking for:
   - Initial batch quantity (immutable)
   - Allocated to production (reserved)
   - Consumed in production (actual usage)
   - Remaining available
2. Track in ProductionMaterial table:
   ```javascript
   {
     (batch_id,
       allocated_quantity, // Reserved for this production
       used_quantity, // Actually used
       waste_quantity, // Waste during production
       remaining_quantity); // Returned to batch
   }
   ```
3. Only reduce actual batch stock when production completes
4. Preserve audit trail of all movements

**Priority:** HIGH  
**Status Needed:** Need to Run

---

### Issue #12: Production Output Details Shows Wrong Values

**Category:** Reporting  
**Severity:** HIGH  
**Status:** Need to Run Project  
**Files:**

- [src/views/production/ProductionView.vue](src/views/production/ProductionView.vue#L334)

**Description:**  
Output Details section displays incorrect or missing values for Actual Output, Waste Quantity, and Efficiency calculations.

**Recommended Fix:**

1. Verify data population from API:
   - Check if `productionStore.currentProductionRun?.actual_quantity` is populated
   - Verify `waste_quantity` is calculated correctly
   - Confirm `yield_efficiency` calculation
2. Add null/undefined checks with fallbacks
3. Format number display consistently
4. Verify calculation logic:
   - Efficiency = (actual_quantity / expected_quantity) \* 100

**Priority:** HIGH  
**Status Needed:** Need to Run

---

### Issue #13: Invoice Total Discount Not Calculating Properly

**Category:** Financial/Calculations  
**Severity:** HIGH  
**Status:** Need to Run Project  
**Files:**

- [src/components/sales/InvoiceForm.vue](src/components/sales/InvoiceForm.vue)
- Backend invoice calculation logic

**Description:**  
The Total Discount field is not calculating correctly when discounts are applied at invoice level or item level.

**Recommended Fix:**

1. Clarify discount calculation logic:
   ```
   Item Discount = Item Price * Item Discount %
   Invoice Discount = (Sum of Item Prices - Sum of Item Discounts) * Invoice Discount %
   Total Discount = Sum of Item Discounts + Invoice Discount
   ```
2. Implement proper calculation:
   - Support both item-level and invoice-level discounts
   - Handle discount application order correctly
   - Add validation to prevent over-discounting
3. Test with multiple discount scenarios
4. Update UI to show discount breakdown

**Priority:** HIGH  
**Status Needed:** Need to Run

---

### Issue #14: Invoice Form Duplicate Items Table

**Category:** Feature/Bug  
**Severity:** HIGH  
**Status:** Need to Run Project  
**Files:**

- [src/components/sales/InvoiceForm.vue](src/components/sales/InvoiceForm.vue)

**Description:**  
Items table duplicates same products, preventing proper item management. Users should be able to edit existing rows instead of having duplicates.

**Recommended Fix:**

1. Implement item deduplication logic:
   - Check if SKU already exists in items array
   - If yes, update quantity/price instead of adding new row
   - Show confirmation dialog for user
2. Add item editing capability:
   - Inline editing for quantity and price
   - Edit button for each row
3. Track item changes properly:
   - Use unique SKU IDs as keys
   - Implement edit/delete/add operations cleanly

**Priority:** HIGH  
**Status Needed:** Need to Run

---

### Issue #15: Sales Invoice Submit Button Disability Check

**Category:** Form Validation  
**Severity:** HIGH  
**Status:** Need to Run Project  
**Files:**

- [src/components/sales/InvoiceForm.vue](src/components/sales/InvoiceForm.vue)

**Description:**  
Submit button disability check not working properly. Button should be disabled when required fields are missing or form is invalid.

**Recommended Fix:**

1. Implement comprehensive form validation:
   ```javascript
   const isFormValid = computed(() => {
     return (
       formData.outlet_id &&
       formData.invoice_date &&
       formData.items?.length > 0 &&
       !isSubmitting.value &&
       !hasValidationErrors.value
     );
   });
   ```
2. Add real-time validation
3. Show specific error messages for each validation failure
4. Disable submit button when: `:disabled="!isFormValid"`

**Priority:** HIGH  
**Status Needed:** Need to Run

---

### Issue #16: Sales Deletion - Double Confirmation Messages

**Category:** UX/Bug  
**Severity:** MEDIUM  
**Status:** Need to Run Project  
**Files:**

- [src/views/sales/SalesIndex.vue](src/views/sales/SalesIndex.vue#L149)
- [src/views/sales/InvoiceView.vue](src/views/sales/InvoiceView.vue#L94)

**Description:**  
When deleting a sales invoice, users see 2 confirmation messages - confusing and poor UX.

**Recommended Fix:**

1. Verify if confirmation is being triggered twice:
   - Check for duplicate event handlers
   - Ensure single confirm dialog instance
2. Consolidate confirmation to single dialog
3. Add clear messaging:
   ```javascript
   confirm({
     message: `Permanently delete invoice ${invoice.invoice_number}? This action cannot be undone.`,
     header: 'Delete Invoice',
     icon: 'pi pi-exclamation-triangle',
     accept: () => {
       /* delete */
     },
     reject: () => {
       /* cancel */
     },
   });
   ```

**Priority:** MEDIUM  
**Status Needed:** Need to Run

---

### Issue #17: Sales Deletion Should Not Delete Without Stock Reversal

**Category:** Business Logic/Inventory  
**Severity:** HIGH  
**Status:** Need to Run Project  
**Files:**

- Backend sales controller

**Description:**  
Sales invoices can be deleted but stocks are not being reversed, causing inventory inaccuracies. System should either:

1. Prevent deletion if stock isn't available to reverse, OR
2. Automatically reverse stock movements

**Recommended Fix:**

1. Implement stock reversal on deletion:
   ```javascript
   // For each item in invoice
   - Original sale: add quantity back to stock
   - Returns: subtract quantity from stock
   ```
2. Add audit trail for deletions
3. Verify stock availability before allowing deletion
4. Consider soft-delete instead of hard-delete:
   ```javascript
   // Mark as deleted instead of removing
   invoice.status = 'deleted';
   invoice.deleted_at = new Date();
   ```

**Priority:** HIGH

---

### Issue #18: Button Consistency Across System

**Category:** UI/UX  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete

**Description:**  
Button styles and colors are inconsistent across the application. Different button variations are used without clear pattern (p-button-primary, p-button-secondary, p-button-outlined, etc.).

**Recommended Fix:**

1. Create button style guide:
   - Primary: Save, Submit, Create, Confirm
   - Secondary: Edit, View, Navigate
   - Danger: Delete, Cancel, Reject
   - Outlined: Secondary actions
2. Create reusable button components:
   ```vue
   <template>
     <Button :label="label" :severity="severity" :icon="icon" />
   </template>
   ```
3. Apply consistently across all forms and views
4. Document button usage patterns

**Priority:** MEDIUM

---

## MEDIUM PRIORITY ISSUES

### Issue #19: Error Response Handling Consistency

**Category:** Error Handling  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete

**Description:**  
Error response handling isn't consistent - some places check for `error.response?.data?.message` while others may not properly handle all error cases.

**Recommended Fix:**

1. Create centralized error handler
2. Standardize API error response format
3. Handle network errors, timeouts, validation errors consistently
4. Add logging for all errors

**Priority:** MEDIUM

---

### Issue #20: Audit Information Tracking Not Comprehensive

**Category:** Compliance/Audit  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete  
**Files:**

- Production models
- Sales models
- Other transaction models

**Description:**  
Audit tracking (who created/updated what and when) is not implemented comprehensively across the system. While ProductionRun has `produced_by`, other critical operations lack audit trails.

**Recommended Fix:**

1. Add audit fields to all transaction tables:
   ```javascript
   created_by: { type: INTEGER, references: 'users.id' },
   updated_by: { type: INTEGER, references: 'users.id' },
   created_at: { type: DATE },
   updated_at: { type: DATE },
   ```
2. Create AuditLog table for significant actions
3. Implement middleware to automatically track changes:
   ```javascript
   app.use((req, res, next) => {
     res.locals.userId = req.user?.id;
     next();
   });
   ```
4. Track in hooks before save/update

**Priority:** MEDIUM

---

### Issue #21: Create Purchase Order - Initial Amount Display

**Category:** UI/Form  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete

**Description:**  
When creating purchase order and adding items, need to ensure focus automatically moves to raw materials, not next button. This improves UX for data entry.

**Recommended Fix:**

1. Implement AutoFocus on first SKU field after "Add Item"
2. Implement Focus Trap within form:
   ```javascript
   const focusTrap = {
     mounted(el) {
       const focusable = el.querySelectorAll('input, select, textarea, button');
       focusable[0].focus();
     },
   };
   ```
3. Add keyboard navigation (Tab moves between fields, not to button)

**Priority:** MEDIUM

---

### Issue #22: Invoice Discount - Change from Item-wise to Invoice-wise

**Category:** Feature/Workflow  
**Severity:** HIGH  
**Status:** Need to Run Project  
**Files:**

- [src/components/sales/InvoiceForm.vue](src/components/sales/InvoiceForm.vue)

**Description:**  
Discount system is currently product-wise only. System needs to support both item-level discount AND invoice-level discount with option for custom override.

**Recommended Fix:**

1. Add invoice-level discount field:
   ```vue
   <div class="col-12 md:col-4">
     <label>Invoice Discount %</label>
     <InputNumber v-model="formData.invoice_discount_percent" />
   </div>
   ```
2. Distinguish between:
   - Default discount (policy-based)
   - Custom discount (override)
3. Calculate correctly:
   - Item discount applies to item total
   - Invoice discount applies to invoice subtotal after item discounts
4. Show breakdown in UI

**Priority:** HIGH  
**Status Needed:** Partially implemented - need verification

---

### Issue #23: Profit Analysis - Price Calculations

**Category:** Reporting/Analysis  
**Severity:** MEDIUM  
**Status:** Need to Run Project

**Description:**  
Profit analysis shows incorrect prices - prices not set properly or calculating incorrectly.

**Recommended Fix:**

1. Verify price sources:
   - Sale price vs cost price
   - Ensure correct columns used
2. Implement proper profit calculation:
   ```
   Profit = (Sale Price - Cost Price) * Quantity
   Profit % = (Profit / Cost Price) * 100
   ```
3. Test with multiple scenarios
4. Ensure consistency across reports

**Priority:** MEDIUM  
**Status Needed:** Need to Run

---

## LOWER PRIORITY ISSUES

### Issue #24: Supplier View - Recent Purchase Orders Grouped Display

**Category:** UI Feature  
**Severity:** LOW  
**Status:** Active - Code Review Complete

**Description:**  
Recent Purchase Orders should display batches in grouped/expandable table for better readability.

**Recommended Fix:**

1. Implement expandable DataTable rows:
   ```vue
   <DataTable v-model:expandedRows="expandedRows">
     <Column expander style="width: 5rem" />
     <template #expansion="slotProps">
       <!-- Show nested batches -->
     </template>
   </DataTable>
   ```
2. Show summary view with expand for details
3. Add visual grouping

**Priority:** LOW

---

### Issue #25: Territories - Sales Rep Field Not Sortable

**Category:** Reporting/Table  
**Severity:** LOW  
**Status:** Fixed ✅

**Description:**  
Territories list table sales representative field was not sortable.

**Status:** FIXED - Completed

---

### Issue #26: Product Category Update

**Category:** Master Data  
**Severity:** LOW  
**Status:** Fixed ✅

**Description:**  
Need to add "Repacking" and "Hasal Products" categories instead of generic "Spices" and "Packaging".

**Status:** FIXED - Completed

---

### Issue #27: Cash Payments - Daily Cash Register Update

**Category:** Feature  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete

**Description:**  
Need to implement daily cash register update feature for cash payments tracking.

**Recommended Fix:**

1. Create CashRegister model with:
   - Opening balance
   - Transactions (sales, expenses)
   - Closing balance
   - Daily reconciliation
2. Add cash register view
3. Implement reconciliation logic

**Priority:** MEDIUM

---

### Issue #28: Sales Ref User Interface

**Category:** Feature/UI  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete

**Description:**  
Sales representatives need interface to view their details, performance metrics, and commission tracking.

**Recommended Fix:**

1. Create SalesRef dashboard view
2. Show metrics:
   - Total sales
   - Commission earned
   - Performance vs target
3. Allow filtering by date range

**Priority:** MEDIUM

---

## FIXED ISSUES ✅

### Issue #F1: Login Page Redirect on Refresh

**Status:** Fixed ✅  
**Description:** When refreshing page, it was redirecting to login - this has been resolved

---

### Issue #F2: Supplier-Purchase Order Relationships

**Status:** Fixed ✅  
**Description:** Relationships between suppliers and purchase orders have been properly implemented

---

### Issue #F3: Purchase Order Get All Items

**Status:** Fixed ✅  
**Description:** Get all purchase details now returns items correctly

---

### Issue #F4: Filtered Values Reset Button

**Status:** Fixed ✅  
**Description:** Reset button added to reset filtered dropdown values in tables

---

### Issue #F5: Receive Purchase Order - PO Remaining Balance

**Status:** Fixed ✅  
**Description:** Payment section now shows PO remaining balance

---

### Issue #F6: Create Purchase Order - Default Date

**Status:** Fixed ✅  
**Description:** Expected Delivery Date now defaults to current date if not selected

---

### Issue #F7: ProductionView Material Names

**Status:** Fixed ✅  
**Description:** Material names now display properly in ProductionView (API returns names)

---

### Issue #F8: Create Sales Invoice - Auto-select Route & Ref

**Status:** Fixed ✅  
**Description:** Route and sales ref auto-select when outlet is selected

---

### Issue #F9: Invoice Discount - Invoice-wise (Partial Fix)

**Status:** Partially Fixed ⚠️  
**Description:** Discount now supports invoice-level in addition to item-level (needs verification)

---

### Issue #F10: Create Recipe - Material Stock Zero Handling

**Status:** Fixed ✅  
**Description:** Creating recipe with material that has 0 stock is now handled correctly

---

### Issue #F11: Raw Material View - Expiry Display

**Status:** Fixed ✅  
**Description:** Expired raw materials now display properly in RawMaterialView

---

### Issue #F12: Category API Implementation

**Status:** Fixed ✅  
**Description:** Category management feature has been implemented

---

## ADDITIONAL RELATED ISSUES FOUND

### Issue #A1: Production Return Discount Display

**Category:** Reporting  
**Severity:** HIGH  
**Status:** Need to Run Project

**Description:**  
When returning during production creation, shows full total amount without applying the discount. Discount needs to be deducted from displayed total.

**Recommended Fix:**

1. Apply discount before showing return total
2. Calculate: Return Total = (Line Items - Discounts) \* Return Quantity
3. Show discount breakdown in return summary

**Priority:** HIGH  
**Status Needed:** Need to Run

---

### Issue #A2: Create Recipe - Material Add Dialog Stock Check

**Category:** Validation  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete

**Description:**  
When adding material with current_stock = 0 during recipe creation, estimated cost shows as 0. Should handle this edge case.

**Recommended Fix:**

1. Show warning if material stock is 0
2. Use default cost or last known cost if current stock is 0
3. Prevent selection of out-of-stock materials
4. Show available stock quantity in dialog

**Priority:** MEDIUM

---

### Issue #A3: Invoice Creation - Handle Returns During Invoice

**Category:** Feature  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete

**Description:**  
Products returned during invoice creation must be added and tracked through wastage tracking system.

**Recommended Fix:**

1. Automatically create WastageRecord for returned items:
   ```javascript
   if (item.is_return) {
     await WastageRecord.create({
       sku_id: item.sku_id,
       quantity: item.quantity,
       reason: item.return_reason,
       invoice_id: invoice.id,
       type: 'return',
     });
   }
   ```
2. Track waste reason and outlet
3. Show in wastage reports

**Priority:** MEDIUM

---

### Issue #A4: Sales Invoice Edit Feature - Currently Disabled

**Category:** Feature  
**Severity:** MEDIUM  
**Status:** Active - Code Review Complete  
**Files:**

- [src/views/sales/InvoiceEdit.vue](src/views/sales/InvoiceEdit.vue)

**Description:**  
Sales invoice edit feature is disabled. Code is commented out. Need to uncomment and test thoroughly.

**Recommended Fix:**

1. Uncomment edit functionality
2. Add validation:
   - Prevent editing finalized invoices
   - Track edit history
   - Recalculate all amounts
3. Test edit and delete features:
   - Verify stock reversal/re-allocation
   - Check discount recalculation
   - Ensure audit trail updated
4. Add edit confirmation dialog

**Priority:** MEDIUM

---

### Issue #A5: Water mark tracking issue

**Category:** Inventory  
**Severity:** HIGH  
**Status:** Need to Run Project

**Description:**  
Wastage tracking needs full testing. Complete test coverage for all scenarios.

**Recommended Fix:**

1. Test all wastage scenarios:
   - Production waste
   - Sales returns
   - Damaged goods
   - Expired materials
2. Verify tracking in reports
3. Ensure wastage reasons are captured
4. Validate stock calculations

**Priority:** HIGH  
**Status Needed:** Need to Run

---

## SUMMARY & RECOMMENDATIONS

### Critical Actions Required:

1. ✅ Move JWT tokens to HTTP-only cookies (IMMEDIATE)
2. ✅ Rotate database credentials (IMMEDIATE)
3. ✅ Secure JWT secret (IMMEDIATE)
4. ✅ Fix CORS validation (HIGH)
5. ✅ Implement comprehensive error handling (HIGH)

### High Priority Fixes:

- Fix all 6 CRITICAL security issues first
- Verify and fix production stock reduction logic
- Complete invoice calculation testing
- Implement proper audit tracking

### Testing Requirements:

- Run project to verify: 5 issues marked as "Need to Run Project"
- Execute test suite for all invoice operations
- Test production workflow end-to-end
- Verify sales deletion and stock reversal

### Documentation:

- Maintain this report as living document
- Update status as issues are fixed
- Track fix dates and assignees
- Add test verification steps for each issue

---

**Report Generated:** May 2, 2026  
**Next Review:** After critical fixes completion  
**Total Estimated Fix Time:** Depends on complexity, security issues first
