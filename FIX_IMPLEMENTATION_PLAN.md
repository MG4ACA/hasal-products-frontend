# Fix Implementation Plan - Hasal Spices POS

**Created:** May 3, 2026  
**Target Completion:** Phased approach over 4 sprints  
**Current Status:** Planning Phase

---

## 📋 Executive Summary

This plan addresses 28 active issues across Security, Business Logic, UI/UX, and Error Handling categories.

**Total Estimated Effort:** 60-80 hours  
**Critical Issues:** 3 (Must fix first)  
**High Priority:** 8 (Week 1-2)  
**Medium Priority:** 12 (Week 2-3)  
**Low Priority:** 5 (Week 3-4)

---

## 🔴 PHASE 1: CRITICAL SECURITY FIXES (Week 1)

**Effort:** 12-15 hours | **Risk:** HIGH | **Dependency:** None

### Sprint 1.1: JWT Token Security (Est. 6 hours)

#### Issue #1: JWT Token in SessionStorage

**Priority:** IMMEDIATE  
**Files to Modify:**

- `hasal-pos-backend/app.js` - Add cookie middleware
- `hasal-pos-backend/controllers/authController.js` - Set token in cookie
- `src/services/api.js` - Remove token from sessionStorage
- `src/stores/auth.js` - Stop storing token in sessionStorage

**Steps:**

1. **Backend Changes (2 hours)**

   ```javascript
   // app.js - Add cookie parser
   const cookieParser = require('cookie-parser');
   app.use(cookieParser());

   // authController.js - Set secure cookie after login
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict',
     maxAge: 24 * 60 * 60 * 1000,
   });
   ```

2. **Frontend Changes (2 hours)**
   - Remove token getter/setter from auth.js
   - Update API interceptor to use automatic cookie handling
   - Add CSRF token handling
   - Remove sessionStorage references

3. **Testing (2 hours)**
   - Verify token is in HTTP-only cookie
   - Test XSS vulnerability with console injection
   - Verify CSRF protection
   - Test auto-logout when cookie expires

**Verification:**

```bash
# Check cookie is HTTP-only
curl -i http://localhost:5000/api/auth/login
# Should see Set-Cookie with HttpOnly flag
```

---

#### Issue #2: Database Credentials Hardcoded

**Priority:** IMMEDIATE  
**Files to Modify:**

- `hasal-pos-backend/.env` - Update credentials
- `hasal-pos-backend/.env.example` - Template only
- `hasal-pos-backend/.gitignore` - Ensure .env is ignored

**Steps:**

1. **Immediate Actions (1 hour)**

   ```bash
   # 1. Generate new strong password (32 chars)
   openssl rand -base64 32

   # 2. Update database password
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'NEW_STRONG_PASSWORD';
   FLUSH PRIVILEGES;

   # 3. Update .env with new password
   DB_PASSWORD=NEW_STRONG_PASSWORD
   ```

2. **Clean Git History (2 hours)**

   ```bash
   # Remove .env from git history
   git filter-branch --tree-filter 'rm -f .env' HEAD

   # Or use BFG Repo-Cleaner
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

3. **Environment-Specific Setup (1 hour)**
   - Create `.env.local` for development (in .gitignore)
   - Create `.env.production` (outside repo, deployed via CI/CD)
   - Create `.env.example` with only required keys

4. **Testing (1 hour)**
   - Verify new password works
   - Confirm .env not in git history
   - Test with wrong password fails

---

#### Issue #3: JWT Secret Hardcoded

**Priority:** IMMEDIATE  
**Files to Modify:**

- `hasal-pos-backend/.env` - Update secret
- `hasal-pos-backend/config/database.js` - Reference from env

**Steps:**

1. **Generate New Secret (30 mins)**

   ```bash
   openssl rand -hex 32
   # Update .env: JWT_SECRET=<new_hex_value>
   ```

2. **Rotate Existing Tokens (1 hour)**
   - Invalidate all existing tokens
   - Force all users to re-login
   - Add `tokenVersion` field to users table
   - Update token validation to check version

3. **Add JWT Expiry (1.5 hours)**

   ```javascript
   // authController.js
   const token = jwt.sign(
     { id: user.id, tokenVersion: user.token_version },
     process.env.JWT_SECRET,
     { expiresIn: '24h' } // Add expiry
   );
   ```

4. **Testing (1 hour)**
   - Verify old tokens invalid
   - Test new token generation
   - Test token expiry
   - Verify refresh token logic

---

### Sprint 1.2: CORS & Error Handling (Est. 4 hours)

#### Issue #4: CORS Validation

**Priority:** HIGH  
**Files to Modify:**

- `hasal-pos-backend/app.js` - Fix CORS configuration

**Steps:**

1. **Code Changes (2 hours)**

   ```javascript
   // app.js
   const allowedOrigins = process.env.CORS_ORIGINS
     ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
     : [];

   if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
     throw new Error('CORS_ORIGINS must be configured in production');
   }

   const corsOptions = {
     origin: (origin, callback) => {
       if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true,
   };

   app.use(cors(corsOptions));
   ```

2. **Environment Setup (1 hour)**
   - Add to .env.example: `CORS_ORIGINS=http://localhost:5173,https://app.example.com`
   - Document CORS setup

3. **Testing (1 hour)**
   - Test allowed origin succeeds
   - Test disallowed origin fails
   - Test production validation

---

#### Issue #5: Error Handler Consistency

**Priority:** HIGH  
**Files to Modify:**

- `src/utils/errorHandler.js` - Comprehensive error handling
- All service files using error handling

**Steps:**

1. **Create Centralized Error Handler (2 hours)**

   ```javascript
   // src/utils/errorHandler.js
   export const getErrorMessage = error => {
     // API Errors
     if (error.response?.data?.message) {
       return error.response.data.message;
     }
     if (error.response?.data?.errors) {
       return error.response.data.errors[0]?.message || JSON.stringify(error.response.data.errors);
     }
     if (error.response?.statusText) {
       return error.response.statusText;
     }

     // Network Errors
     if (error.message === 'Network Error') {
       return 'Network connection failed. Please check your internet connection.';
     }
     if (error.code === 'ECONNABORTED') {
       return 'Request timeout. Please try again.';
     }
     if (error.code === 'ECONNREFUSED') {
       return 'Unable to connect to server. Please try again later.';
     }

     // Fallback
     return error.message || 'An unexpected error occurred';
   };

   export const getErrorSeverity = error => {
     if (error.response?.status >= 500) return 'error';
     if (error.response?.status >= 400) return 'warn';
     return 'error';
   };
   ```

2. **Update Service Files (1.5 hours)**
   - Replace all error handling with centralized function
   - Add error logging

3. **Testing (0.5 hours)**
   - Test various error scenarios
   - Verify consistent messaging

---

**Phase 1 Total: 16 hours**

---

## 🟠 PHASE 2: HIGH PRIORITY BUSINESS LOGIC (Week 1-2)

**Effort:** 20-25 hours | **Risk:** MEDIUM

### Sprint 2.1: Invoice & Sales Operations (Est. 12 hours)

#### Issue #13: Invoice Discount Calculation

**Priority:** HIGH  
**Files to Modify:**

- `src/components/sales/InvoiceForm.vue` - Add invoice discount field
- `hasal-pos-backend/controllers/salesController.js` - Calculate correctly
- Database schema if needed

**Steps:**

1. **Frontend Changes (4 hours)**

   ```vue
   <!-- InvoiceForm.vue -->
   <!-- Items section with item discounts -->
   <div class="col-12 md:col-6">
     <label>Item Discount %</label>
     <InputNumber v-model="selectedItem.discount_percent" min="0" max="100" />
   </div>

   <!-- Invoice-level discount -->
   <div class="col-12 md:col-6">
     <label>Invoice Discount %</label>
     <InputNumber v-model="formData.invoice_discount_percent" min="0" max="100" />
   </div>

   <!-- Discount breakdown -->
   <div class="discount-summary">
     <p>Item Discounts: {{ calculateItemDiscounts() }}</p>
     <p>Invoice Discount: {{ calculateInvoiceDiscount() }}</p>
     <p><strong>Total Discount: {{ calculateTotalDiscount() }}</strong></p>
   </div>
   ```

2. **Backend Calculation (4 hours)**

   ```javascript
   // Calculate discounts properly
   function calculateInvoiceTotal(items, invoiceDiscountPercent) {
     // Step 1: Calculate item subtotals
     let itemsSubtotal = 0;
     const itemDetails = items.map(item => {
       const itemSubtotal = item.unit_price * item.quantity;
       const itemDiscount = (itemSubtotal * (item.discount_percent || 0)) / 100;
       const itemTotal = itemSubtotal - itemDiscount;
       itemsSubtotal += itemTotal;
       return { itemSubtotal, itemDiscount, itemTotal };
     });

     // Step 2: Apply invoice-level discount
     const invoiceDiscount = (itemsSubtotal * (invoiceDiscountPercent || 0)) / 100;
     const finalTotal = itemsSubtotal - invoiceDiscount;

     return {
       itemsSubtotal,
       itemDiscounts: itemDetails.map(d => d.itemDiscount),
       invoiceDiscount,
       finalTotal,
       totalDiscount: itemDetails.reduce((sum, d) => sum + d.itemDiscount, 0) + invoiceDiscount,
     };
   }
   ```

3. **Testing (4 hours)**
   - Test item-only discount
   - Test invoice-only discount
   - Test combined discounts
   - Test edge cases (0% discount, 100% discount)
   - Verify correct calculation in reports

---

#### Issue #14: Invoice Duplicate Items

**Priority:** HIGH  
**Files to Modify:**

- `src/components/sales/InvoiceForm.vue` - Deduplicate items

**Steps:**

1. **Add Item Deduplication (3 hours)**

   ```javascript
   // In InvoiceForm.vue
   const addItem = () => {
     const existingItem = formData.items.find(item => item.sku_id === selectedSku.value?.id);

     if (existingItem) {
       // Update existing
       existingItem.quantity += itemQuantity.value;
       existingItem.unit_price = itemPrice.value;
       existingItem.discount_percent = itemDiscount.value;

       // Show toast
       toast.add({
         severity: 'info',
         summary: 'Item Updated',
         detail: `Quantity updated for ${existingItem.sku_id}`,
         life: 2000,
       });
     } else {
       // Add new
       formData.items.push({
         sku_id: selectedSku.value.id,
         quantity: itemQuantity.value,
         unit_price: itemPrice.value,
         discount_percent: itemDiscount.value,
       });
     }
     resetItemForm();
   };
   ```

2. **Add Edit/Delete Capabilities (2 hours)**

   ```vue
   <!-- Items table with edit/delete -->
   <DataTable :value="formData.items">
     <Column field="sku_id" header="SKU" />
     <Column field="quantity" header="Qty">
       <template #body="{ data, index }">
         <InputNumber
           v-model="formData.items[index].quantity"
           @update:modelValue="recalculateTotal"
         />
       </template>
     </Column>
     <Column header="Action" style="width: 100px">
       <template #body="{ index }">
         <Button
           icon="pi pi-trash"
           severity="danger"
           size="small"
           @click="removeItem(index)"
         />
       </template>
     </Column>
   </DataTable>
   ```

3. **Testing (2 hours)**
   - Add same SKU twice
   - Verify deduplication works
   - Test quantity update
   - Test item deletion

---

#### Issue #15: Submit Button Disability

**Priority:** HIGH  
**Files to Modify:**

- `src/components/sales/InvoiceForm.vue` - Button validation

**Steps:**

1. **Add Form Validation (2 hours)**

   ```javascript
   // InvoiceForm.vue
   const isFormValid = computed(() => {
     return (
       formData.outlet_id &&
       formData.invoice_date &&
       formData.items?.length > 0 &&
       !isSubmitting.value &&
       validateAllItems()
     );
   });

   const validateAllItems = () => {
     return formData.items.every(item => item.sku_id && item.quantity > 0 && item.unit_price > 0);
   };

   const validationErrors = computed(() => {
     const errors = [];
     if (!formData.outlet_id) errors.push('Outlet is required');
     if (!formData.invoice_date) errors.push('Invoice date is required');
     if (!formData.items?.length) errors.push('At least one item is required');
     formData.items?.forEach((item, idx) => {
       if (item.quantity <= 0) errors.push(`Item ${idx + 1}: Quantity must be > 0`);
     });
     return errors;
   });
   ```

2. **Update Submit Button (1 hour)**

   ```vue
   <Button label="Submit Invoice" :disabled="!isFormValid" @click="handleSubmit" />

   <!-- Show validation errors -->
   <Message v-if="validationErrors.length" severity="error">
     <ul>
       <li v-for="error in validationErrors" :key="error">{{ error }}</li>
     </ul>
   </Message>
   ```

3. **Testing (1 hour)**
   - Test button disabled with no outlet
   - Test button disabled with no items
   - Test button enabled with valid data
   - Test error messages display

---

#### Issue #16: Sales Deletion Double Confirmation

**Priority:** MEDIUM-HIGH  
**Files to Modify:**

- `src/views/sales/SalesIndex.vue` - Consolidate confirmation
- `src/views/sales/InvoiceView.vue` - Same fix

**Steps:**

1. **Debug Duplicate Confirmation (1 hour)**
   - Check if `useConfirm` is being called twice
   - Verify event handlers aren't duplicated
   - Check for multiple dialog instances

2. **Consolidate to Single Confirmation (1 hour)**

   ```javascript
   // SalesIndex.vue & InvoiceView.vue
   const handleDelete = invoice => {
     confirm.require({
       message: `Permanently delete invoice ${invoice.invoice_number}? This action cannot be undone and will reverse all stock movements.`,
       header: 'Delete Invoice',
       icon: 'pi pi-exclamation-triangle',
       accept: () => deleteInvoice(invoice.id),
       reject: () => {}, // Do nothing on cancel
     });
   };
   ```

3. **Testing (1 hour)**
   - Click delete
   - Verify only one confirmation dialog
   - Test accept and reject flows

---

#### Issue #17: Sales Deletion Stock Reversal

**Priority:** HIGH  
**Files to Modify:**

- `hasal-pos-backend/controllers/salesController.js` - Implement stock reversal
- `hasal-pos-backend/models/SalesInvoice.js` - Add deleted_at field (soft delete option)

**Steps:**

1. **Implement Stock Reversal (4 hours)**

   ```javascript
   // salesController.js - deleteInvoice
   exports.deleteInvoice = async (req, res) => {
     const transaction = await db.sequelize.transaction();
     try {
       const invoice = await SalesInvoice.findByPk(req.params.id, {
         include: [
           {
             model: InvoiceItem,
             as: 'items',
           },
         ],
       });

       if (!invoice) return errorResponse(res, 'Invoice not found', 404);

       // Reverse all stock movements
       for (const item of invoice.items) {
         const sku = await ProductSku.findByPk(item.sku_id, { transaction });

         if (item.is_return) {
           // Returns: subtract quantity from stock (reverse the return)
           sku.current_stock -= Math.abs(item.quantity);
         } else {
           // Sales: add quantity back (reverse the sale)
           sku.current_stock += item.quantity;
         }

         // Verify stock doesn't go negative
         if (sku.current_stock < 0) {
           await transaction.rollback();
           return errorResponse(res, 'Insufficient stock to reverse sale', 400);
         }

         await sku.save({ transaction });

         // Log the reversal
         await StockMovement.create(
           {
             sku_id: item.sku_id,
             quantity: item.is_return ? -Math.abs(item.quantity) : item.quantity,
             type: 'invoice_deletion_reversal',
             reference_id: invoice.id,
           },
           { transaction }
         );
       }

       // Mark invoice as deleted (soft delete)
       invoice.status = 'deleted';
       invoice.deleted_at = new Date();
       await invoice.save({ transaction });

       await transaction.commit();
       return successResponse(res, { message: 'Invoice deleted and stock reversed' });
     } catch (error) {
       await transaction.rollback();
       return errorResponse(res, error.message, 500);
     }
   };
   ```

2. **Add Audit Logging (2 hours)**
   - Track who deleted what
   - Track timestamp
   - Log stock reversal details

3. **Testing (2 hours)**
   - Delete normal sale, verify stock increases
   - Delete return, verify stock decreases
   - Verify stock never goes negative
   - Test with insufficient stock scenario

---

### Sprint 2.2: Production & Inventory (Est. 8 hours)

#### Issue #11: Production Stock Reduction Tracking

**Priority:** HIGH  
**Files to Modify:**

- `hasal-pos-backend/models/ProductionMaterial.js` - Track allocated vs used
- `hasal-pos-backend/controllers/productionController.js` - Update stock management

**Steps:**

1. **Schema Changes (2 hours)**

   ```javascript
   // ProductionMaterial.js - Add new fields
   {
     allocated_quantity: {
       type: DataTypes.DECIMAL(10, 2),
       comment: 'Quantity reserved for this production'
     },
     actual_used_quantity: {
       type: DataTypes.DECIMAL(10, 2),
       defaultValue: 0,
       comment: 'Quantity actually used in production'
     },
     waste_quantity: {
       type: DataTypes.DECIMAL(10, 2),
       defaultValue: 0,
       comment: 'Waste/loss during production'
     },
     returned_quantity: {
       type: DataTypes.DECIMAL(10, 2),
       defaultValue: 0,
       comment: 'Unused quantity returned to stock'
     }
   }

   // Create migration
   npx sequelize-cli migration:create --name add-production-material-tracking
   ```

2. **Update Production Workflow (3 hours)**

   ```javascript
   // When starting production
   // - Allocate (reserve) materials, don't reduce stock yet

   // When completing production
   // - Reduce stock by actual_used_quantity
   // - Track waste separately
   // - Return unused allocated quantities

   exports.completeProduction = async (req, res) => {
     const transaction = await db.sequelize.transaction();
     try {
       const production = await ProductionRun.findByPk(req.body.production_id, {
         include: [
           {
             model: ProductionMaterial,
             as: 'materials',
           },
         ],
       });

       for (const material of production.materials) {
         const batch = await RawMaterialBatch.findByPk(material.batch_id, { transaction });

         // Update batch quantities
         batch.current_quantity -= material.actual_used_quantity;
         batch.current_quantity -= material.waste_quantity;
         batch.current_quantity += material.returned_quantity;

         await batch.save({ transaction });

         // Log movement
         await StockMovement.create(
           {
             batch_id: batch.id,
             quantity_used: -material.actual_used_quantity,
             quantity_waste: -material.waste_quantity,
             type: 'production_completion',
           },
           { transaction }
         );
       }

       production.status = 'completed';
       production.actual_quantity = req.body.actual_quantity;
       await production.save({ transaction });

       await transaction.commit();
       return successResponse(res, production);
     } catch (error) {
       await transaction.rollback();
       return errorResponse(res, error.message, 500);
     }
   };
   ```

3. **Testing (3 hours)**
   - Create production with materials
   - Verify stock allocated but not reduced
   - Complete production with waste
   - Verify final stock calculation
   - Verify audit trail complete

---

#### Issue #12: Production Output Wrong Values

**Priority:** HIGH  
**Files to Modify:**

- `src/views/production/ProductionView.vue` - Fix display logic
- `hasal-pos-backend/controllers/productionController.js` - Verify calculations

**Steps:**

1. **Verify Data Population (2 hours)**
   - Check if API returns: `actual_quantity`, `waste_quantity`, `yield_efficiency`
   - Verify calculations in backend
   - Test with actual data

2. **Fix Frontend Display (2 hours)**

   ```vue
   <!-- ProductionView.vue -->
   <div class="output-item">
     <div class="output-label">Actual Output</div>
     <div class="output-value primary">
       {{ formatNumber(productionRun?.actual_quantity ?? 0) }}
       {{ productionRun?.recipe?.yield_unit || 'units' }}
     </div>
   </div>

   <div class="output-item">
     <div class="output-label">Expected Output</div>
     <div class="output-value">
       {{ formatNumber(productionRun?.recipe?.expected_yield ?? 0) }}
       {{ productionRun?.recipe?.yield_unit || 'units' }}
     </div>
   </div>

   <div class="output-item">
     <div class="output-label">Waste Quantity</div>
     <div class="output-value" :class="{ 'text-red': productionRun?.waste_quantity > 0 }">
       {{ formatNumber(productionRun?.waste_quantity ?? 0) }}
       {{ productionRun?.recipe?.yield_unit || 'units' }}
     </div>
   </div>

   <div class="output-item">
     <div class="output-label">Efficiency</div>
     <div class="output-value">
       {{ calculateEfficiency() }}%
     </div>
   </div>

   <script>
   const calculateEfficiency = () => {
     if (!productionRun?.recipe?.expected_yield || productionRun.recipe.expected_yield === 0) {
       return '0';
     }
     const efficiency = (productionRun.actual_quantity / productionRun.recipe.expected_yield) * 100;
     return efficiency.toFixed(2);
   };
   </script>
   ```

3. **Testing (2 hours)**
   - Create and complete production
   - Verify actual_quantity displays
   - Verify efficiency calculation
   - Test with zero expected yield (edge case)

---

**Phase 2 Total: 20 hours**

---

## 🟡 PHASE 3: UI/UX & MEDIUM PRIORITY (Week 2-3)

**Effort:** 15-18 hours | **Risk:** LOW

### Sprint 3.1: UI Consistency & Features (Est. 10 hours)

#### Issue #6: Breadcrumb Inconsistency

**Priority:** MEDIUM  
**Files to Modify:**

- All view files
- Router configuration
- Create breadcrumb utility

**Steps:**

1. **Create Breadcrumb Utility (2 hours)**

   ```javascript
   // src/utils/breadcrumbGenerator.js
   export const generateBreadcrumbs = route => {
     const breadcrumbs = [{ label: 'Dashboard', to: '/' }];

     const routePath = route.path.split('/').filter(Boolean);
     let currentPath = '';

     for (const segment of routePath) {
       currentPath += `/${segment}`;
       const label = segment
         .replace(/-/g, ' ')
         .split(' ')
         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
         .join(' ');

       breadcrumbs.push({
         label,
         to: currentPath,
       });
     }

     // Override with route meta if provided
     if (route.meta?.breadcrumb) {
       breadcrumbs[breadcrumbs.length - 1].label = route.meta.breadcrumb;
     }

     return breadcrumbs;
   };
   ```

2. **Update Router Meta (2 hours)**

   ```javascript
   // router/index.js
   const routes = [
     {
       path: '/expenses',
       component: ExpenseIndex,
       meta: { breadcrumb: 'Expenses' },
       children: [
         {
           path: 'create',
           component: ExpenseCreate,
           meta: { breadcrumb: 'Create Expense' },
         },
         {
           path: ':id/edit',
           component: ExpenseEdit,
           meta: { breadcrumb: 'Edit Expense' },
         },
       ],
     },
     // ... more routes
   ];
   ```

3. **Create Breadcrumb Component (2 hours)**

   ```vue
   <!-- src/components/common/BreadcrumbNav.vue -->
   <template>
     <Breadcrumb :home="home" :model="breadcrumbs" class="mb-4" />
   </template>

   <script setup>
   import { computed } from 'vue';
   import { useRoute } from 'vue-router';
   import Breadcrumb from 'primevue/breadcrumb';
   import { generateBreadcrumbs } from '@/utils/breadcrumbGenerator';

   const route = useRoute();
   const home = { icon: 'pi pi-home', to: '/' };

   const breadcrumbs = computed(() => generateBreadcrumbs(route));
   </script>
   ```

4. **Update All Views (3 hours)**
   - Replace individual breadcrumb implementations
   - Use BreadcrumbNav component in all views
   - Remove commented-out breadcrumbs

5. **Testing (1 hour)**
   - Navigate through all views
   - Verify breadcrumbs show correctly
   - Test breadcrumb navigation

---

#### Issue #9: Product SKU Creation in Create Mode

**Priority:** HIGH  
**Files to Modify:**

- `src/components/products/ProductForm.vue` - Enable SKU in create mode
- Backend if needed

**Steps:**

1. **Frontend Changes (3 hours)**

   ```vue
   <!-- ProductForm.vue -->
   <!-- Enable SKU section in both create and edit modes -->
   <div v-if="true" class="sku-section mt-4">
     <h3>Product SKUs</h3>

     <!-- Add SKU form -->
     <Card>
       <template #title>Add New SKU</template>
       <template #content>
         <div class="grid">
           <div class="col-12 md:col-6">
             <label>Size <span class="text-red-500">*</span></label>
             <InputText v-model="newSku.size" placeholder="e.g., 500g" />
           </div>
           <div class="col-12 md:col-6">
             <label>Unit <span class="text-red-500">*</span></label>
             <Dropdown
               v-model="newSku.unit"
               :options="['Kg', 'Liter', 'Piece', 'Box']"
             />
           </div>
           <div class="col-12 md:col-6">
             <label>Price <span class="text-red-500">*</span></label>
             <InputNumber v-model="newSku.price" />
           </div>
           <div class="col-12 md:col-6">
             <label>Reorder Level <span class="text-red-500">*</span></label>
             <InputNumber v-model="newSku.reorder_level" />
           </div>
         </div>
         <Button label="Add SKU" @click="addSku" />
       </template>
     </Card>

     <!-- SKUs Table -->
     <DataTable v-if="formData.skus?.length" :value="formData.skus" class="mt-4">
       <Column field="size" header="Size" />
       <Column field="unit" header="Unit" />
       <Column field="price" header="Price" />
       <Column field="reorder_level" header="Reorder Level" />
       <Column header="Action">
         <template #body="{ index }">
           <Button
             icon="pi pi-trash"
             severity="danger"
             size="small"
             @click="removeSku(index)"
           />
         </template>
       </Column>
     </DataTable>
   </div>

   <script setup>
   const newSku = ref({
     size: '',
     unit: '',
     price: 0,
     reorder_level: 0
   });

   const addSku = () => {
     if (!newSku.value.size || !newSku.value.unit || newSku.value.price <= 0) {
       showError('Please fill all SKU fields');
       return;
     }

     if (!formData.skus) formData.skus = [];
     formData.skus.push({ ...newSku.value });

     // Reset form
     newSku.value = { size: '', unit: '', price: 0, reorder_level: 0 };
     showSuccess('SKU added');
   };

   const removeSku = (index) => {
     formData.skus.splice(index, 1);
   };
   </script>
   ```

2. **Backend Changes (1.5 hours)**
   - Accept SKUs array in product creation
   - Validate all SKUs before saving
   - Create SKUs as part of product creation transaction

3. **Testing (1.5 hours)**
   - Create product with multiple SKUs
   - Verify SKUs saved correctly
   - Test with invalid SKU data
   - Test SKU deletion

---

#### Issue #10: SKU Reorder Level Positioning

**Priority:** MEDIUM  
**Files to Modify:**

- `src/components/products/ProductForm.vue` - Grid layout

**Steps:**

1. **Fix Grid Layout (1 hour)**
   ```vue
   <div class="grid">
     <!-- Row 1 -->
     <div class="col-12 md:col-6">
       <label>SKU Size</label>
       <InputText v-model="sku.size" />
     </div>
     <div class="col-12 md:col-6">
       <label>Unit</label>
       <Dropdown v-model="sku.unit" />
     </div>

     <!-- Row 2 -->
     <div class="col-12 md:col-6">
       <label>Price</label>
       <InputNumber v-model="sku.price" />
     </div>
     <div class="col-12 md:col-6">
       <label>Reorder Level</label>
       <InputNumber v-model="sku.reorder_level" />
     </div>

     <!-- Row 3 -->
     <div class="col-12 md:col-6">
       <label>Current Stock</label>
       <InputNumber v-model="sku.current_stock" disabled />
     </div>
     <div class="col-12 md:col-6">
       <label>Average Cost</label>
       <InputNumber v-model="sku.average_cost" disabled />
     </div>
   </div>
   ```

---

#### Issue #18: Button Consistency

**Priority:** MEDIUM  
**Files to Modify:**

- Create button style guide
- Update all button usages

**Steps:**

1. **Create Button Component Library (3 hours)**

   ```vue
   <!-- src/components/common/AppButton.vue -->
   <template>
     <Button
       :label="label"
       :icon="icon"
       :severity="severity"
       :class="buttonClass"
       v-bind="$attrs"
     />
   </template>

   <script setup>
   const props = defineProps({
     label: String,
     icon: String,
     variant: {
       type: String,
       default: 'primary',
       validator: v => ['primary', 'secondary', 'danger', 'success', 'outlined'].includes(v),
     },
   });

   const severity = computed(() => {
     const map = {
       primary: 'primary',
       secondary: 'secondary',
       danger: 'danger',
       success: 'success',
       outlined: undefined,
     };
     return map[props.variant];
   });

   const buttonClass = computed(() => {
     return {
       'p-button-outlined': props.variant === 'outlined',
     };
   });
   </script>
   ```

2. **Create Button Usage Guide (1 hour)**
   - Primary: Create, Save, Submit
   - Secondary: Edit, View, Navigate
   - Danger: Delete, Cancel
   - Success: Confirm, Complete
   - Outlined: Secondary options

3. **Update All Views (4 hours)**
   - Replace Button components
   - Use consistent patterns
   - Test all buttons

---

### Sprint 3.2: Error Handling & Features (Est. 5 hours)

#### Issue #7: Title Bar Duplication

**Priority:** LOW  
**Files to Modify:**

- `src/components/layout/Topbar.vue`
- Parent layout component

**Steps:**

1. **Debug (1 hour)**
   - Check if parent also renders title
   - Verify route title setup

2. **Fix (1 hour)**
   - Remove duplicate title
   - Use single source of truth from router

3. **Testing (1 hour)**
   - Navigate through pages
   - Verify title appears once

---

#### Issue #8: Toast Message Styling

**Priority:** LOW  
**Files to Modify:**

- CSS for Toast component
- Toast usage

**Steps:**

1. **Create Toast Styles (1.5 hours)**

   ```css
   .p-toast {
     top: 20px !important;
     right: 20px !important;
     z-index: 9999;
   }

   .p-toast-message {
     border-radius: 4px;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
   }

   .p-toast-message.p-toast-message-success {
     background-color: #10b981;
     color: white;
   }

   .p-toast-message.p-toast-message-error {
     background-color: #ef4444;
     color: white;
   }
   ```

2. **Update Toast Composable (1 hour)**
   - Ensure consistent usage
   - Standardize message formatting

3. **Testing (0.5 hours)**
   - Trigger various toast notifications
   - Verify styling and positioning

---

#### Issue #22: Invoice Discount - Complete Implementation

**Priority:** HIGH  
**Files to Modify:**

- Already partially addressed in Phase 2
- This is completion/verification

**Steps:**

1. **Verification (2 hours)**
   - Test all discount scenarios
   - Verify calculations
   - Check reports include discount breakdown

2. **Testing (2 hours)**
   - Item discount only
   - Invoice discount only
   - Combined discounts
   - Custom overrides

---

**Phase 3 Total: 15 hours**

---

## 🟢 PHASE 4: REMAINING FEATURES & POLISH (Week 3-4)

**Effort:** 10-12 hours | **Risk:** LOW

### Sprint 4.1: Inventory & Audit (Est. 7 hours)

#### Issue #20: Audit Information Tracking

**Priority:** MEDIUM  
**Files to Modify:**

- All models
- Add audit fields and middleware

**Steps:**

1. **Add Audit Fields (2 hours)**

   ```javascript
   // In all model definitions
   created_by: {
     type: DataTypes.INTEGER,
     references: { model: 'users', key: 'id' }
   },
   updated_by: {
     type: DataTypes.INTEGER,
     references: { model: 'users', key: 'id' }
   },
   created_at: {
     type: DataTypes.DATE,
     defaultValue: DataTypes.NOW
   },
   updated_at: {
     type: DataTypes.DATE,
     defaultValue: DataTypes.NOW
   }
   ```

2. **Create Audit Middleware (2 hours)**

   ```javascript
   // middleware/auditMiddleware.js
   app.use((req, res, next) => {
     res.locals.userId = req.user?.id;
     res.locals.timestamp = new Date();
     next();
   });

   // Before saving in controller
   record.created_by = res.locals.userId;
   record.created_at = res.locals.timestamp;
   ```

3. **Testing (1 hour)**
   - Verify audit fields populated
   - Check history tracking

---

#### Issue #A2: Create Recipe - Material Stock Zero

**Priority:** MEDIUM  
**Files to Modify:**

- `src/components/recipes/RecipeForm.vue`

**Steps:**

1. **Add Stock Check (1.5 hours)**

   ```vue
   <script setup>
   const addMaterial = async () => {
     const material = await fetchMaterialDetails(selectedMaterial.value);

     if (material.current_stock === 0) {
       showWarning(
         'Material out of stock',
         'This material has no stock. Using last known cost or average cost.'
       );
       newMaterial.estimated_cost = material.average_cost || 0;
     } else {
       newMaterial.estimated_cost = material.unit_cost * selectedQty.value;
     }
   };
   </script>
   ```

2. **Testing (0.5 hours)**
   - Add material with 0 stock
   - Verify cost calculated correctly

---

#### Issue #A3: Invoice Returns to Wastage Tracking

**Priority:** MEDIUM  
**Files to Modify:**

- `hasal-pos-backend/controllers/salesController.js`

**Steps:**

1. **Auto-create Wastage Records (2 hours)**

   ```javascript
   // In invoice creation controller
   for (const item of invoiceData.items) {
     if (item.is_return) {
       await WastageRecord.create(
         {
           sku_id: item.sku_id,
           quantity: Math.abs(item.quantity),
           reason: item.return_reason,
           invoice_id: invoice.id,
           outlet_id: invoice.outlet_id,
           type: 'return',
           created_at: new Date(),
         },
         { transaction }
       );
     }
   }
   ```

2. **Testing (1 hour)**
   - Create invoice with returns
   - Verify wastage records created
   - Check in wastage report

---

### Sprint 4.2: Additional Features (Est. 5 hours)

#### Issue #A1: Production Return Discount Display

**Priority:** HIGH  
**Files to Modify:**

- Production return display logic

**Steps:**

1. **Fix Discount Calculation (2 hours)**
   - Apply discount before showing return total
   - Verify calculation

2. **Testing (1.5 hours)**
   - Create production with discount
   - Verify return total correct

---

#### Issue #23: Profit Analysis Prices

**Priority:** MEDIUM  
**Files to Modify:**

- Reports components

**Steps:**

1. **Verify Calculations (1.5 hours)**
   - Check price sources
   - Verify formulas
   - Test with data

---

#### Issue #A4: Sales Invoice Edit Feature

**Priority:** MEDIUM  
**Files to Modify:**

- `src/views/sales/InvoiceEdit.vue`

**Steps:**

1. **Uncomment & Test (2 hours)**
   - Uncomment edit functionality
   - Test all scenarios
   - Verify stock reversals work

---

#### Issue #27: Cash Register Daily Update

**Priority:** MEDIUM  
**Status:** Consider for future release
**Effort:** 4+ hours (defer to next sprint if time-constrained)

---

**Phase 4 Total: 12 hours**

---

## 📊 Implementation Timeline

```
PHASE 1 (Week 1): 16 hours - CRITICAL SECURITY
├─ Sprint 1.1: JWT Token (6h)
├─ Sprint 1.2: CORS & Error Handling (4h)
└─ Testing: 2h

PHASE 2 (Week 1-2): 20 hours - HIGH PRIORITY
├─ Sprint 2.1: Invoice/Sales (12h)
├─ Sprint 2.2: Production (8h)
└─ Testing: 2h

PHASE 3 (Week 2-3): 15 hours - UI & MEDIUM
├─ Sprint 3.1: UI Consistency (10h)
├─ Sprint 3.2: Error & Features (5h)
└─ Testing: 2h

PHASE 4 (Week 3-4): 12 hours - REMAINING
├─ Sprint 4.1: Inventory & Audit (7h)
├─ Sprint 4.2: Features (5h)
└─ Testing: 2h

TOTAL: ~63 hours
```

---

## 🧪 Testing Strategy

### Unit Testing

```bash
# Backend
npm test -- --testPathPattern=controllers
npm test -- --testPathPattern=models

# Frontend
npm run test:unit
```

### Integration Testing

```bash
# Run provided test suite
cd hasal-pos-backend
node tests/phase2-fraud-prevention.test.js
```

### Manual Testing Checklist

**Phase 1 Testing:**

- [ ] JWT token in HTTP-only cookie
- [ ] Old tokens invalidated
- [ ] Database password works
- [ ] CORS rejects disallowed origins
- [ ] Error messages consistent

**Phase 2 Testing:**

- [ ] Invoice with multiple discounts
- [ ] Duplicate items deduplicated
- [ ] Submit button validation works
- [ ] Delete confirmation single dialog
- [ ] Stock reverses on delete
- [ ] Production stock properly tracked

**Phase 3 Testing:**

- [ ] Breadcrumbs on all pages
- [ ] SKUs created with product
- [ ] All buttons styled consistently
- [ ] Toast messages styled

**Phase 4 Testing:**

- [ ] Audit fields populated
- [ ] Wastage records auto-created
- [ ] Profit calculations correct

---

## ✅ Definition of Done

For each issue:

- [ ] Code changes implemented
- [ ] Code reviewed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Staging verification complete
- [ ] Ready for production

---

## 🚀 Rollout Plan

### Pre-Production Verification

1. Run full test suite
2. Load testing for performance
3. Security audit
4. UAT with stakeholders

### Production Deployment

1. **Backup critical data**
2. **Deploy during low-traffic window**
3. **Monitor logs for errors**
4. **Have rollback plan ready**
5. **Notify users of changes**

### Post-Deployment Monitoring

- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify user feedback
- [ ] Monitor security logs

---

## 📝 Notes

### Dependencies & Order

- Must complete Phase 1 before Phase 2 (security first)
- Phase 2 items independent (can run in parallel)
- Phase 3 depends on Phase 2 completion
- Phase 4 is optional polish

### Resource Allocation

- **Week 1:** Focus on Phase 1 + start Phase 2
- **Week 2:** Complete Phase 2 + start Phase 3
- **Week 3:** Complete Phase 3 + Phase 4
- **Week 4:** Testing, UAT, Deployment

### Risk Mitigation

- Use transactions for all multi-step operations
- Implement comprehensive logging
- Have rollback procedures ready
- Test edge cases thoroughly
- Use feature flags for risky changes

---

**Plan Status:** READY FOR IMPLEMENTATION  
**Last Updated:** May 3, 2026  
**Next Review:** After Phase 1 completion
