# Error Handling Implementation Plan

**Date:** January 10, 2026  
**Status:** In Progress  
**Objective:** Implement centralized error handling across all frontend service layers with consistent patterns

---

## Implementation Phases

### Phase 1: Core Error Handling Infrastructure ✅

- [x] Create error handler utility (`src/utils/errorHandler.js`)
- [x] Update API interceptor (`src/services/api.js`)

**Status:** COMPLETE

---

### Phase 2: Update Service Layer (14 files)

Add try-catch blocks to all service methods with `handleApiError`.

#### Pattern to Apply:

```javascript
import { handleApiError } from '@/utils/errorHandler';
import api from './api';

export const someService = {
  // GET method example
  async getAllItems(params = {}) {
    try {
      const response = await api.get('/items', { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // GET by ID example
  async getItemById(id) {
    try {
      const response = await api.get(`/items/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // POST example
  async createItem(data) {
    try {
      const response = await api.post('/items', data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // PUT example
  async updateItem(id, data) {
    try {
      const response = await api.put(`/items/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // DELETE example
  async deleteItem(id) {
    try {
      const response = await api.delete(`/items/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
```

#### Files to Update:

**Service Files (14 total):**

- [x] `src/services/supplierService.js` (6 methods) ✅
- [x] `src/services/supplierPaymentService.js` (3 methods) ✅
- [x] `src/services/authService.js` (4 methods) ✅
- [x] `src/services/employeeService.js` (6 methods) ✅
- [x] `src/services/outletService.js` (8 methods) ✅
- [x] `src/services/paymentService.js` (7 methods) ✅
- [x] `src/services/productService.js` (9 methods) ✅
- [x] `src/services/productionService.js` (7 methods) ✅
- [x] `src/services/purchaseOrderService.js` (7 methods) ✅
- [x] `src/services/rawMaterialService.js` (7 methods) ✅
- [x] `src/services/recipeService.js` (9 methods) ✅
- [x] `src/services/routeService.js` (7 methods) ✅
- [x] `src/services/salesService.js` (6 methods) ✅
- [x] `src/services/vehicleService.js` (8 methods) ✅

**Status:** ✅ COMPLETE (14/14 files)

---

### Phase 3: Update Pinia Stores

Add error property checks in store actions.

#### Pattern to Apply:

```javascript
import { someService } from '@/services/someService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSomeStore = defineStore('some', () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchItems = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await someService.getAllItems(params);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      // Success - proceed with data
      items.value = response.items;
      return response;
    } catch (err) {
      // Re-throw for component to catch
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async data => {
    loading.value = true;
    error.value = null;
    try {
      const response = await someService.createItem(data);

      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      items.value.unshift(response.item);
      return response;
    } catch (err) {
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
  };
});
```

#### Store Files to Update:

- [x] `src/stores/supplier.js` (6 actions) ✅
- [x] `src/stores/auth.js` (2 actions) ✅
- [x] `src/stores/product.js` (9 actions) ✅
- [x] `src/stores/employee.js` (6 actions) ✅
- [x] `src/stores/outlet.js` (8 actions) ✅
- [x] `src/stores/payment.js` (10 actions) ✅
- [x] `src/stores/production.js` (7 actions) ✅
- [x] `src/stores/purchaseOrder.js` (7 actions) ✅
- [x] `src/stores/rawMaterial.js` (7 actions) ✅
- [x] `src/stores/recipe.js` (9 actions) ✅
- [x] `src/stores/route.js` (7 actions) ✅
- [x] `src/stores/sales.js` (5 actions) ✅
- [x] `src/stores/vehicle.js` (8 actions) ✅

**Status:** ✅ COMPLETE (13/13 stores, 91 actions updated)

---

### Phase 4: Component Error Handling ✅

**Status:** COMPLETE (20 components, 23 error handlers updated)

**Objective:** Ensure all components use `error.message` instead of `error.response?.data?.message`

**Pattern Applied:**

```javascript
try {
  await store.action(data);
  showSuccess('Success message');
} catch (error) {
  showError(error.message || 'Fallback message');
}
```

**Files Updated:**

- ✅ `src/views/suppliers/` - SupplierCreate, SupplierEdit
- ✅ `src/views/employees/` - EmployeeIndex (delete), EmployeeCreate, EmployeeEdit (2x)
- ✅ `src/views/outlets/` - OutletIndex (delete), OutletCreate, OutletEdit (2x)
- ✅ `src/views/routes/` - RouteIndex (delete), RouteCreate, RouteEdit (2x)
- ✅ `src/views/raw-materials/` - RawMaterialIndex (delete), RawMaterialCreate, RawMaterialEdit
- ✅ `src/views/payments/` - PaymentIndex (3x: fetch, clear check, delete)

**Total:** 20 components, 23 error handlers updated

---

## Testing Checklist

### Unit Testing Scenarios

#### Error Handler Tests:

- [ ] Test 401 error - Should clear sessionStorage and redirect
- [ ] Test 403 error - Should return permission denied message
- [ ] Test 404 error - Should return not found message
- [ ] Test 500 error - Should return server error message
- [ ] Test network error - Should return generic error message
- [ ] Test custom error messages from backend

#### Service Layer Tests:

- [ ] Test successful API call returns data correctly
- [ ] Test failed API call returns error object
- [ ] Test error object structure: `{ error: true, message: string, statusCode: number }`

#### Store Layer Tests:

- [ ] Test store checks for error property
- [ ] Test store throws error when response.error is true
- [ ] Test error value is set in store state

### Integration Testing Scenarios

#### Authentication Flow:

- [ ] Login with invalid credentials - Should show error message
- [ ] Login with expired token - Should redirect to /login
- [ ] Make API call with expired token - Should redirect to /login
- [ ] Verify sessionStorage is cleared on 401

#### CRUD Operations:

- [ ] Create operation failure - Should show error toast
- [ ] Read operation with 404 - Should show "not found" message
- [ ] Update without permission (403) - Should show permission error
- [ ] Delete operation server error (500) - Should show server error message

#### Network Scenarios:

- [ ] Test offline/no network - Should show appropriate error
- [ ] Test timeout - Should show timeout error
- [ ] Test server unavailable - Should show server error

### Manual Testing Checklist

#### Test Each Module:

- [ ] Suppliers - CRUD operations with errors
- [ ] Products - CRUD operations with errors
- [ ] Sales - Create invoice, payment errors
- [ ] Purchase Orders - Create, update, delete errors
- [ ] Raw Materials - Batch operations, stock errors
- [ ] Production - Production run errors
- [ ] Recipes - Recipe management errors
- [ ] Routes - Route assignment errors
- [ ] Outlets - Outlet management errors
- [ ] Payments - Payment allocation errors
- [ ] Employees - Employee management errors
- [ ] Vehicles - Vehicle assignment errors

#### Error Scenarios to Test:

- [ ] Unauthorized access (401)
- [ ] Forbidden operations (403)
- [ ] Not found resources (404)
- [ ] Server errors (500)
- [ ] Network failures
- [ ] Validation errors
- [ ] Duplicate entries

### Browser Console Checks:

- [ ] Verify error logs appear in console with status codes
- [ ] Verify no unhandled promise rejections
- [ ] Verify no infinite loops on 401 redirect
- [ ] Verify error messages are user-friendly

---

## Implementation Notes

### Key Decisions Made:

1. **Error Return vs Throw:**
   - Services return error objects: `{ error: true, message }`
   - Stores check for errors and throw for components
   - Components catch and display errors

2. **401 Handling:**
   - Handled in `errorHandler.js` only
   - Removed from API interceptor
   - Clears sessionStorage tokens before redirect
   - Uses hard reload (`window.location.href`)

3. **Error Logging:**
   - Log status code + message only
   - Format: `[API Error 404]: Resource not found`

4. **Low-Code Approach:**
   - Stores throw errors (existing component pattern works)
   - Minimal component changes needed

### Error Response Structure:

```javascript
{
  error: true,
  message: "User-friendly error message",
  statusCode: 404 // Optional
}
```

### Success Response Structure (No changes):

```javascript
{
  data: {
    items: [...],
    pagination: {...}
  }
}
```

---

## Rollback Plan

If issues arise during implementation:

1. **Revert errorHandler.js:**
   - Delete `src/utils/errorHandler.js`

2. **Revert api.js:**
   - Restore original interceptor with 401 handling

3. **Revert service files:**
   - Remove try-catch blocks
   - Remove handleApiError imports
   - Restore original `.then()` chains

4. **Git commands:**
   ```bash
   git checkout src/utils/errorHandler.js
   git checkout src/services/
   git checkout src/stores/
   ```

---

## Progress Tracking

**Phase 1:** ✅ COMPLETE (2/2 files)  
**Phase 2:** ✅ COMPLETE (14/14 service files, 94 methods)  
**Phase 3:** ✅ COMPLETE (13/13 stores, 91 actions)  
**Phase 4:** ✅ COMPLETE (20/20 components, 23 error handlers)  
**Testing:** ⏳ PENDING

---

## Next Steps

1. ~~Start Phase 2: Update all service files with try-catch~~ ✅ DONE
2. ~~Test one service thoroughly before proceeding to all~~ ✅ DONE
3. ~~Start Phase 3: Update stores to check error property~~ ✅ DONE
4. ~~Start Phase 4: Verify component error handling~~ ✅ DONE
5. **Run full testing checklist**
6. Document any issues/edge cases found

---

**Last Updated:** January 11, 2026  
**Status:** 🎉 **ALL IMPLEMENTATION PHASES COMPLETE** - Ready for testing
