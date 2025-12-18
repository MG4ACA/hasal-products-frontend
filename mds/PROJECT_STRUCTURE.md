# Project Structure & Development Guide

**Project:** Hasal Products POS System  
**Version:** 1.1  
**Last Updated:** December 18, 2025

---

## 📦 Repository Structure

### Separate Repositories

```
hasal-pos-frontend/          # Vue 3 Frontend Application
hasal-pos-backend/           # Express.js Backend API
```

---

## 🎨 Frontend Repository Structure (`hasal-pos-frontend`)

```
hasal-pos-frontend/
├── public/
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── styles/
│   │   │   ├── main.css           # Global styles
│   │   │   └── primevue-theme.css # PrimeVue customizations
│   │   └── fonts/
│   ├── components/
│   │   ├── common/                # Reusable components
│   │   │   ├── AppButton.vue
│   │   │   ├── AppCard.vue
│   │   │   ├── AppDataTable.vue
│   │   │   ├── AppDialog.vue
│   │   │   ├── AppInput.vue
│   │   │   ├── PageHeader.vue
│   │   │   └── ConfirmDialog.vue
│   │   ├── layout/                # Layout components
│   │   │   ├── AppLayout.vue
│   │   │   ├── Sidebar.vue
│   │   │   ├── Topbar.vue
│   │   │   └── Footer.vue
│   │   └── [module]/              # Module-specific components
│   │       ├── SupplierList.vue
│   │       ├── SupplierForm.vue
│   │       └── SupplierCard.vue
│   ├── views/                     # Page components (routes)
│   │   ├── auth/
│   │   │   └── Login.vue
│   │   ├── dashboard/
│   │   │   └── Dashboard.vue
│   │   ├── suppliers/
│   │   │   ├── SupplierIndex.vue
│   │   │   ├── SupplierCreate.vue
│   │   │   └── SupplierEdit.vue
│   │   ├── raw-materials/
│   │   ├── products/
│   │   ├── recipes/
│   │   ├── production/
│   │   ├── routes/
│   │   ├── outlets/
│   │   ├── employees/
│   │   ├── vehicles/
│   │   ├── sales/
│   │   ├── payments/
│   │   └── reports/
│   ├── stores/                    # Pinia stores
│   │   ├── auth.js
│   │   ├── supplier.js
│   │   ├── rawMaterial.js
│   │   ├── product.js
│   │   ├── recipe.js
│   │   ├── production.js
│   │   ├── route.js
│   │   ├── outlet.js
│   │   ├── employee.js
│   │   ├── vehicle.js
│   │   ├── sales.js
│   │   ├── payment.js
│   │   └── report.js
│   ├── router/
│   │   └── index.js               # Vue Router configuration
│   ├── services/                  # API service layer
│   │   ├── api.js                 # Axios instance configuration
│   │   ├── authService.js
│   │   ├── supplierService.js
│   │   ├── rawMaterialService.js
│   │   ├── productService.js
│   │   ├── recipeService.js
│   │   ├── productionService.js
│   │   ├── routeService.js
│   │   ├── outletService.js
│   │   ├── employeeService.js
│   │   ├── vehicleService.js
│   │   ├── salesService.js
│   │   ├── paymentService.js
│   │   └── reportService.js
│   ├── utils/                     # Utility functions
│   │   ├── validators.js          # Form validation helpers
│   │   ├── formatters.js          # Data formatting (currency, dates)
│   │   ├── constants.js           # App-wide constants
│   │   ├── helpers.js             # General helper functions
│   │   └── permissions.js         # Role-based access helpers
│   ├── composables/               # Vue composables (reusable logic)
│   │   ├── useAuth.js
│   │   ├── useToast.js
│   │   ├── usePagination.js
│   │   ├── useConfirm.js
│   │   └── useExport.js
│   ├── App.vue                    # Root component
│   └── main.js                    # Entry point
├── .env.development               # Development environment variables
├── .env.production                # Production environment variables
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── .gitignore
├── package.json
├── vite.config.js                 # Vite configuration
└── README.md
```

---

## 🔧 Backend Repository Structure (`hasal-pos-backend`)

```
hasal-pos-backend/
├── src/
│   ├── config/
│   │   ├── database.js            # Sequelize configuration
│   │   └── config.js              # App configuration
│   ├── models/                    # Sequelize models
│   │   ├── index.js               # Model associations
│   │   ├── User.js
│   │   ├── Supplier.js
│   │   ├── RawMaterial.js
│   │   ├── RawMaterialBatch.js
│   │   ├── Product.js
│   │   ├── ProductSku.js
│   │   ├── Recipe.js
│   │   ├── RecipeItem.js
│   │   ├── ProductionRun.js
│   │   ├── ProductionMaterial.js
│   │   ├── ProductionOutput.js
│   │   ├── PurchaseOrder.js
│   │   ├── PurchaseOrderItem.js
│   │   ├── Route.js
│   │   ├── Outlet.js
│   │   ├── Employee.js
│   │   ├── Vehicle.js
│   │   ├── RouteVehicleHistory.js
│   │   ├── SalesInvoice.js
│   │   ├── InvoiceItem.js
│   │   ├── Payment.js
│   │   ├── SupplierPayment.js
│   │   └── StockAdjustment.js
│   ├── controllers/               # Request handlers
│   │   ├── authController.js
│   │   ├── supplierController.js
│   │   ├── rawMaterialController.js
│   │   ├── productController.js
│   │   ├── recipeController.js
│   │   ├── productionController.js
│   │   ├── routeController.js
│   │   ├── outletController.js
│   │   ├── employeeController.js
│   │   ├── vehicleController.js
│   │   ├── salesController.js
│   │   ├── paymentController.js
│   │   └── reportController.js
│   ├── routes/                    # Express routes
│   │   ├── index.js               # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── rawMaterialRoutes.js
│   │   ├── productRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── productionRoutes.js
│   │   ├── routeRoutes.js
│   │   ├── outletRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── salesRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── reportRoutes.js
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication middleware
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── validate.js            # Request validation middleware
│   │   └── roleCheck.js           # Role-based access control
│   ├── utils/
│   │   ├── response.js            # Standardized API responses
│   │   ├── validators.js          # Validation schemas (Joi/Yup)
│   │   ├── batchNumberGenerator.js # Auto batch number generation
│   │   ├── invoiceNumberGenerator.js
│   │   └── helpers.js
│   ├── seeders/                   # Database seeders
│   │   ├── 001-users.js
│   │   ├── 002-suppliers.js
│   │   ├── 003-raw-materials.js
│   │   ├── 004-products.js
│   │   ├── 005-routes.js
│   │   └── 006-outlets.js
│   ├── migrations/                # Sequelize migrations
│   │   └── [timestamp]-create-[table].js
│   └── app.js                     # Express app configuration
├── .env.development               # Development environment variables
├── .env.production                # Production environment variables
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .sequelizerc                   # Sequelize CLI configuration
├── package.json
├── server.js                      # Entry point
└── README.md
```

---

## 🎨 UI Design System

### PrimeVue Theme Colors

```javascript
// Primary Color Palette (Customize in primevue-theme.css)
const colors = {
  // Primary (Blue-Gray)
  primary: {
    50: '#f0f4f8',
    100: '#d9e2ec',
    200: '#bcccdc',
    300: '#9fb3c8',
    400: '#829ab1',
    500: '#627d98', // Main primary
    600: '#486581',
    700: '#334e68',
    800: '#243b53',
    900: '#102a43',
  },

  // Secondary (Orange)
  secondary: {
    50: '#fff8f1',
    100: '#feecdc',
    200: '#fcd9bd',
    300: '#fdba8c',
    400: '#ff8a4c',
    500: '#E67E22', // Main secondary
    600: '#e07628',
    700: '#bc5215',
    800: '#973105',
    900: '#771d1d',
  },

  // Success (Green)
  success: '#27AE60',
  successLight: '#6FCF97',

  // Warning (Yellow)
  warning: '#F39C12',
  warningLight: '#F8B739',

  // Danger (Red)
  danger: '#E74C3C',
  dangerLight: '#EB5757',

  // Info (Cyan)
  info: '#3498DB',
  infoLight: '#56CCF2',

  // Neutral
  white: '#FFFFFF',
  background: '#ECF0F1',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#BDC3C7',
};
```

### Component Styling Standards

```vue
<!-- Standard Card Component -->
<template>
  <div class="app-card">
    <div class="app-card-header">
      <h3 class="app-card-title">{{ title }}</h3>
      <div class="app-card-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="app-card-body">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.app-card {
  background: var(--surface-card);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.app-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}
</style>
```

### Typography

```css
/* Font Families */
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  sans-serif;

/* Font Sizes */
--font-size-xs: 0.75rem; /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
--font-size-3xl: 1.875rem; /* 30px */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing Scale (PrimeFlex)

```
p-0  : 0
p-1  : 0.25rem  (4px)
p-2  : 0.5rem   (8px)
p-3  : 1rem     (16px)
p-4  : 1.5rem   (24px)
p-5  : 2rem     (32px)
p-6  : 3rem     (48px)
p-7  : 4rem     (64px)
p-8  : 5rem     (80px)

m-0 to m-8 : Same as padding
gap-0 to gap-8 : Same as padding
```

---

## 📝 Coding Standards

### Vue 3 Component Pattern (Composition API with `<script setup>`)

```vue
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useSupplierStore } from '@/stores/supplier';
import SupplierList from '@/components/suppliers/SupplierList.vue';

// Props
const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
  mode: {
    type: String,
    default: 'view',
    validator: (value) => ['view', 'edit'].includes(value),
  },
});

// Emits
const emit = defineEmits(['update', 'delete']);

// Composables
const router = useRouter();
const toast = useToast();
const supplierStore = useSupplierStore();

// Reactive state
const loading = ref(false);
const formData = ref({
  name: '',
  email: '',
  phone: '',
});

// Computed properties
const isValid = computed(() => {
  return formData.value.name && formData.value.email;
});

// Methods
const handleSubmit = async () => {
  try {
    loading.value = true;
    await supplierStore.updateSupplier(props.id, formData.value);
    toast.success('Supplier updated successfully');
    emit('update', formData.value);
  } catch (error) {
    toast.error(error.message || 'Failed to update supplier');
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await loadSupplier();
});

const loadSupplier = async () => {
  try {
    loading.value = true;
    const supplier = await supplierStore.fetchSupplier(props.id);
    formData.value = { ...supplier };
  } catch (error) {
    toast.error('Failed to load supplier');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="supplier-edit">
    <PageHeader title="Edit Supplier" />

    <div class="p-fluid">
      <InputText v-model="formData.name" placeholder="Supplier Name" :disabled="loading" />

      <Button
        label="Save"
        icon="pi pi-check"
        :loading="loading"
        :disabled="!isValid"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
.supplier-edit {
  padding: 1.5rem;
}
</style>
```

### Pinia Store Pattern

```javascript
// stores/supplier.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import supplierService from '@/services/supplierService';

export const useSupplierStore = defineStore('supplier', () => {
  // State
  const suppliers = ref([]);
  const currentSupplier = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const activeSuppliers = computed(() => suppliers.value.filter((s) => s.status === 'active'));

  const totalBalance = computed(() => suppliers.value.reduce((sum, s) => sum + s.balance, 0));

  // Actions
  const fetchSuppliers = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await supplierService.getAll(params);
      suppliers.value = response.data;
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSupplier = async (id) => {
    try {
      loading.value = true;
      const response = await supplierService.getById(id);
      currentSupplier.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSupplier = async (data) => {
    try {
      loading.value = true;
      const response = await supplierService.create(data);
      suppliers.value.push(response.data);
      return response.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSupplier = async (id, data) => {
    try {
      loading.value = true;
      const response = await supplierService.update(id, data);
      const index = suppliers.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        suppliers.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSupplier = async (id) => {
    try {
      loading.value = true;
      await supplierService.delete(id);
      suppliers.value = suppliers.value.filter((s) => s.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    suppliers,
    currentSupplier,
    loading,
    error,
    // Getters
    activeSuppliers,
    totalBalance,
    // Actions
    fetchSuppliers,
    fetchSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
});
```

### API Service Pattern

```javascript
// services/api.js - Axios Instance
import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data, // Return only data
  (error) => {
    if (error.response) {
      // Handle 401 - Unauthorized
      if (error.response.status === 401) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
        router.push('/login');
      }
      // Return error message from backend
      return Promise.reject({
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      });
    }
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      status: 0,
    });
  }
);

export default api;
```

```javascript
// services/supplierService.js - Resource Service
import api from './api';

const BASE_URL = '/suppliers';

export default {
  // GET /api/suppliers?page=1&limit=10&search=abc&status=active
  getAll(params = {}) {
    return api.get(BASE_URL, { params });
  },

  // GET /api/suppliers/:id
  getById(id) {
    return api.get(`${BASE_URL}/${id}`);
  },

  // POST /api/suppliers
  create(data) {
    return api.post(BASE_URL, data);
  },

  // PUT /api/suppliers/:id
  update(id, data) {
    return api.put(`${BASE_URL}/${id}`, data);
  },

  // DELETE /api/suppliers/:id
  delete(id) {
    return api.delete(`${BASE_URL}/${id}`);
  },

  // GET /api/suppliers/:id/balance
  getBalance(id) {
    return api.get(`${BASE_URL}/${id}/balance`);
  },

  // POST /api/suppliers/:id/payments
  recordPayment(id, paymentData) {
    return api.post(`${BASE_URL}/${id}/payments`, paymentData);
  },
};
```

### Backend Controller Pattern

```javascript
// controllers/supplierController.js
const { Supplier, SupplierPayment } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

exports.getAllSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return successResponse(
      res,
      {
        suppliers: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
      'Suppliers retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return errorResponse(res, 'Failed to fetch suppliers', 500);
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return errorResponse(res, 'Supplier not found', 404);
    }

    return successResponse(res, supplier, 'Supplier retrieved successfully');
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return errorResponse(res, 'Failed to fetch supplier', 500);
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplierData = req.body;

    // Generate supplier code
    const lastSupplier = await Supplier.findOne({
      order: [['id', 'DESC']],
    });

    const nextNumber = lastSupplier ? parseInt(lastSupplier.code.replace('SUP', '')) + 1 : 1;
    supplierData.code = `SUP${String(nextNumber).padStart(3, '0')}`;

    const supplier = await Supplier.create(supplierData);

    return successResponse(res, supplier, 'Supplier created successfully', 201);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return errorResponse(res, error.message || 'Failed to create supplier', 500);
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return errorResponse(res, 'Supplier not found', 404);
    }

    await supplier.update(updateData);

    return successResponse(res, supplier, 'Supplier updated successfully');
  } catch (error) {
    console.error('Error updating supplier:', error);
    return errorResponse(res, 'Failed to update supplier', 500);
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return errorResponse(res, 'Supplier not found', 404);
    }

    // Soft delete - just update status
    await supplier.update({ status: 'inactive' });

    return successResponse(res, null, 'Supplier deleted successfully');
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return errorResponse(res, 'Failed to delete supplier', 500);
  }
};
```

### Response Utility Pattern

```javascript
// utils/response.js
exports.successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
```

---

## 🔐 Authentication Pattern

### Frontend - Auth Store

```javascript
// stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('user') || 'null'));
  const token = ref(sessionStorage.getItem('auth_token') || null);
  const tokenExpiry = ref(sessionStorage.getItem('token_expiry') || null);

  const isAuthenticated = computed(() => {
    if (!token.value || !tokenExpiry.value) return false;
    return new Date().getTime() < parseInt(tokenExpiry.value);
  });

  const isAdmin = computed(() => user.value?.role === 'admin');
  const isCashier = computed(() => user.value?.role === 'cashier');

  const login = async (credentials) => {
    const response = await authService.login(credentials);

    user.value = response.data.user;
    token.value = response.data.token;

    // Set token expiry (24 hours from now)
    const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    tokenExpiry.value = expiryTime.toString();

    sessionStorage.setItem('user', JSON.stringify(user.value));
    sessionStorage.setItem('auth_token', token.value);
    sessionStorage.setItem('token_expiry', tokenExpiry.value);

    return response;
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    tokenExpiry.value = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('token_expiry');
  };

  const checkTokenExpiry = () => {
    if (tokenExpiry.value && new Date().getTime() >= parseInt(tokenExpiry.value)) {
      logout();
      return false;
    }
    return true;
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isCashier,
    login,
    logout,
    checkTokenExpiry,
  };
});
```

### Backend - Auth Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user || user.status !== 'active') {
      return errorResponse(res, 'Invalid or inactive user', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden - insufficient permissions', 403);
    }

    next();
  };
};
```

---

## 🛠️ Utility Functions

### Frontend Utils

```javascript
// utils/formatters.js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date, format = 'short') => {
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat('en-LK', options[format]).format(new Date(date));
};

export const formatNumber = (number, decimals = 2) => {
  return Number(number).toFixed(decimals);
};

// utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^0[0-9]{9}$/; // Sri Lankan phone format
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// utils/constants.js
export const USER_ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
};

export const EMPLOYEE_TYPES = {
  SALES_REF: 'sales_ref',
  DRIVER: 'driver',
  WAREHOUSE: 'warehouse',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT: 'credit',
  CHECK: 'check',
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
};

export const RETURN_REASONS = {
  DAMAGED: 'damaged',
  EXPIRED: 'expired',
  EXCESS: 'excess',
  QUALITY_ISSUE: 'quality_issue',
  OTHER: 'other',
};

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};
```

### Backend Utils

```javascript
// utils/batchNumberGenerator.js
const { RawMaterialBatch } = require('../models');

exports.generateBatchNumber = async (materialCode) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  const prefix = `RM-${materialCode}-${dateStr}`;

  const lastBatch = await RawMaterialBatch.findOne({
    where: {
      batch_number: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [['batch_number', 'DESC']],
  });

  let sequence = 1;
  if (lastBatch) {
    const lastSeq = parseInt(lastBatch.batch_number.split('-').pop());
    sequence = lastSeq + 1;
  }

  return `${prefix}-${String(sequence).padStart(3, '0')}`;
};

// utils/invoiceNumberGenerator.js
const { SalesInvoice } = require('../models');

exports.generateInvoiceNumber = async () => {
  const lastInvoice = await SalesInvoice.findOne({
    order: [['id', 'DESC']],
  });

  const nextNumber = lastInvoice ? parseInt(lastInvoice.invoice_number.replace('INV-', '')) + 1 : 1;

  return `INV-${String(nextNumber).padStart(5, '0')}`;
};
```

---

## 📋 Environment Variables

### Frontend (.env.development)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Hasal Products POS
VITE_TOKEN_EXPIRY_HOURS=24
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.hasalproducts.com/api
VITE_APP_NAME=Hasal Products POS
VITE_TOKEN_EXPIRY_HOURS=24
```

### Backend (.env.development)

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hasal_pos_dev
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Backend (.env.production)

```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hasal_pos
DB_USER=hasal_user
DB_PASSWORD=secure_production_password

# JWT
JWT_SECRET=very_secure_random_jwt_secret_key
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=https://hasalproducts.com
```

---

## 🎯 Component Naming Conventions

### File Naming

- **Components:** PascalCase (e.g., `SupplierList.vue`, `AppButton.vue`)
- **Views:** PascalCase with descriptive names (e.g., `SupplierIndex.vue`, `SupplierCreate.vue`)
- **Stores:** camelCase (e.g., `supplier.js`, `rawMaterial.js`)
- **Services:** camelCase + Service (e.g., `supplierService.js`)
- **Utils:** camelCase (e.g., `validators.js`, `formatters.js`)
- **Composables:** camelCase with `use` prefix (e.g., `useAuth.js`, `usePagination.js`)

### Component Prefix Patterns

- **App** prefix for global reusable components (`AppButton`, `AppCard`)
- **Page** prefix for layout page wrappers (`PageHeader`, `PageLayout`)
- Module name prefix for module-specific components (`SupplierList`, `ProductForm`)

---

## 📦 ESLint & Prettier Configuration

### .eslintrc.js (Frontend & Backend)

```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended', // Frontend only
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
```

### .prettierrc (Frontend & Backend)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 🗂️ Git Best Practices

### Branch Naming

- `main` - Production-ready code
- `develop` - Development branch
- `feature/[module-name]` - New features (e.g., `feature/supplier-management`)
- `bugfix/[issue-description]` - Bug fixes
- `hotfix/[critical-fix]` - Production hotfixes

### Commit Message Format (Recommended)

```
feat: Add supplier management module
fix: Resolve invoice calculation bug
refactor: Update auth middleware
docs: Update API documentation
style: Format code with prettier
test: Add unit tests for supplier service
chore: Update dependencies
```

---

## 📚 Key Composables

### usePagination.js

```javascript
import { ref, computed } from 'vue';

export function usePagination(initialPage = 1, initialLimit = 10) {
  const page = ref(initialPage);
  const limit = ref(initialLimit);
  const total = ref(0);

  const totalPages = computed(() => Math.ceil(total.value / limit.value));

  const onPageChange = (event) => {
    page.value = event.page + 1;
    limit.value = event.rows;
  };

  const resetPagination = () => {
    page.value = 1;
  };

  return {
    page,
    limit,
    total,
    totalPages,
    onPageChange,
    resetPagination,
  };
}
```

### useToast.js

```javascript
import { useToast as usePrimeToast } from 'primevue/usetoast';

export function useToast() {
  const toast = usePrimeToast();

  const success = (message, summary = 'Success') => {
    toast.add({
      severity: 'success',
      summary,
      detail: message,
      life: 3000,
    });
  };

  const error = (message, summary = 'Error') => {
    toast.add({
      severity: 'error',
      summary,
      detail: message,
      life: 5000,
    });
  };

  const warn = (message, summary = 'Warning') => {
    toast.add({
      severity: 'warn',
      summary,
      detail: message,
      life: 4000,
    });
  };

  const info = (message, summary = 'Info') => {
    toast.add({
      severity: 'info',
      summary,
      detail: message,
      life: 3000,
    });
  };

  return {
    success,
    error,
    warn,
    info,
  };
}
```

---

## 🚀 Quick Reference Commands

### Frontend Development

```bash
npm create vite@latest hasal-pos-frontend -- --template vue
cd hasal-pos-frontend
npm install
npm install pinia vue-router
npm install primevue primeicons primeflex
npm install axios
npm install -D eslint prettier eslint-config-prettier
npm run dev
```

### Backend Development

```bash
mkdir hasal-pos-backend
cd hasal-pos-backend
npm init -y
npm install express sequelize mysql2 dotenv cors bcryptjs jsonwebtoken
npm install -D nodemon eslint prettier eslint-config-prettier
npm install -D sequelize-cli
npx sequelize-cli init
```

---

**Last Updated:** December 18, 2025  
**Version:** 1.0  
**Maintained By:** Development Team
