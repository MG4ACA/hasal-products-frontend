import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

// Lazy load views
const Login = () => import('@/views/auth/Login.vue');
const Dashboard = () => import('@/views/dashboard/Dashboard.vue');
const NotFound = () => import('@/views/NotFound.vue');

// Supplier views
const SupplierIndex = () => import('@/views/suppliers/SupplierIndex.vue');
const SupplierCreate = () => import('@/views/suppliers/SupplierCreate.vue');
const SupplierEdit = () => import('@/views/suppliers/SupplierEdit.vue');
const SupplierView = () => import('@/views/suppliers/SupplierView.vue');

// Raw Material views
const RawMaterialIndex = () => import('@/views/raw-materials/RawMaterialIndex.vue');
const RawMaterialCreate = () => import('@/views/raw-materials/RawMaterialCreate.vue');
const RawMaterialEdit = () => import('@/views/raw-materials/RawMaterialEdit.vue');
const RawMaterialView = () => import('@/views/raw-materials/RawMaterialView.vue');

// Purchase Order views
const PurchaseOrderIndex = () => import('@/views/purchase-orders/PurchaseOrderIndex.vue');
const PurchaseOrderCreate = () => import('@/views/purchase-orders/PurchaseOrderCreate.vue');
const PurchaseOrderEdit = () => import('@/views/purchase-orders/PurchaseOrderEdit.vue');
const PurchaseOrderView = () => import('@/views/purchase-orders/PurchaseOrderView.vue');

// Batch Traceability views (NEW)
const BatchGenealogy = () => import('@/views/batch-traceability/BatchGenealogy.vue');
const ReturnOriginTracer = () => import('@/views/batch-traceability/ReturnOriginTracer.vue');
const MaterialReturnsSummary = () =>
  import('@/views/batch-traceability/MaterialReturnsSummary.vue');

// Product views
const ProductIndex = () => import('@/views/products/ProductIndex.vue');
const ProductCreate = () => import('@/views/products/ProductCreate.vue');
const ProductEdit = () => import('@/views/products/ProductEdit.vue');
const ProductView = () => import('@/views/products/ProductView.vue');

// Recipe views
const RecipeIndex = () => import('@/views/recipes/RecipeIndex.vue');
const RecipeCreate = () => import('@/views/recipes/RecipeCreate.vue');
const RecipeEdit = () => import('@/views/recipes/RecipeEdit.vue');
const RecipeView = () => import('@/views/recipes/RecipeView.vue');

// Production views
const ProductionIndex = () => import('@/views/production/ProductionIndex.vue');
const ProductionCreate = () => import('@/views/production/ProductionCreate.vue');
const ProductionEdit = () => import('@/views/production/ProductionEdit.vue');
const ProductionView = () => import('@/views/production/ProductionView.vue');

// Route views
const RouteIndex = () => import('@/views/routes/RouteIndex.vue');
const RouteCreate = () => import('@/views/routes/RouteCreate.vue');
const RouteEdit = () => import('@/views/routes/RouteEdit.vue');
const RouteView = () => import('@/views/routes/RouteView.vue');

// Outlet views
const OutletIndex = () => import('@/views/outlets/OutletIndex.vue');
const OutletCreate = () => import('@/views/outlets/OutletCreate.vue');
const OutletEdit = () => import('@/views/outlets/OutletEdit.vue');
const OutletView = () => import('@/views/outlets/OutletView.vue');

// Employee views
const EmployeeIndex = () => import('@/views/employees/EmployeeIndex.vue');
const EmployeeCreate = () => import('@/views/employees/EmployeeCreate.vue');
const EmployeeEdit = () => import('@/views/employees/EmployeeEdit.vue');
const EmployeeView = () => import('@/views/employees/EmployeeView.vue');

// Vehicle views
const VehicleIndex = () => import('@/views/vehicles/VehicleIndex.vue');
const VehicleCreate = () => import('@/views/vehicles/VehicleCreate.vue');
const VehicleEdit = () => import('@/views/vehicles/VehicleEdit.vue');
const VehicleHistory = () => import('@/views/vehicles/VehicleHistory.vue');

// Sales Invoice views
const SalesIndex = () => import('@/views/sales/SalesIndex.vue');
const InvoiceCreate = () => import('@/views/sales/InvoiceCreate.vue');
const InvoiceEdit = () => import('@/views/sales/InvoiceEdit.vue');
const InvoiceView = () => import('@/views/sales/InvoiceView.vue');

// Payment views
const PaymentIndex = () => import('@/views/payments/PaymentIndex.vue');
const PaymentCreate = () => import('@/views/payments/PaymentCreate.vue');
const PaymentDetails = () => import('@/views/payments/PaymentDetails.vue');
const PendingChecks = () => import('@/views/payments/PendingChecks.vue');

// Report views
const ProfitAnalysis = () => import('@/views/reports/ProfitAnalysis.vue');
const WasteCostReport = () => import('@/views/reports/WasteCostReport.vue');
const EfficiencyReport = () => import('@/views/reports/EfficiencyReport.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/suppliers',
    name: 'Suppliers',
    component: SupplierIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/suppliers/create',
    name: 'SupplierCreate',
    component: SupplierCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/suppliers/:id/edit',
    name: 'SupplierEdit',
    component: SupplierEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/suppliers/:id',
    name: 'SupplierView',
    component: SupplierView,
    meta: { requiresAuth: true },
  },
  {
    path: '/raw-materials',
    name: 'RawMaterials',
    component: RawMaterialIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/raw-materials/create',
    name: 'RawMaterialCreate',
    component: RawMaterialCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/raw-materials/:id/edit',
    name: 'RawMaterialEdit',
    component: RawMaterialEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/raw-materials/:id',
    name: 'RawMaterialView',
    component: RawMaterialView,
    meta: { requiresAuth: true },
  },
  {
    path: '/purchase-orders',
    name: 'PurchaseOrders',
    component: PurchaseOrderIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/purchase-orders/create',
    name: 'PurchaseOrderCreate',
    component: PurchaseOrderCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/purchase-orders/:id/edit',
    name: 'PurchaseOrderEdit',
    component: PurchaseOrderEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/purchase-orders/:id/view',
    name: 'PurchaseOrderView',
    component: PurchaseOrderView,
    meta: { requiresAuth: true },
  },
  // Batch Traceability routes (NEW)
  {
    path: '/batch-traceability/genealogy',
    name: 'BatchGenealogy',
    component: BatchGenealogy,
    meta: { requiresAuth: true },
  },
  {
    path: '/batch-traceability/return-origin',
    name: 'ReturnOriginTracer',
    component: ReturnOriginTracer,
    meta: { requiresAuth: true },
  },
  {
    path: '/batch-traceability/material-summary',
    name: 'MaterialReturnsSummary',
    component: MaterialReturnsSummary,
    meta: { requiresAuth: true },
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: ProductCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/products/:id/edit',
    name: 'ProductEdit',
    component: ProductEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/products/:id/view',
    name: 'ProductView',
    component: ProductView,
    meta: { requiresAuth: true },
  },
  {
    path: '/recipes',
    name: 'Recipes',
    component: RecipeIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/recipes/create',
    name: 'RecipeCreate',
    component: RecipeCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/recipes/:id/edit',
    name: 'RecipeEdit',
    component: RecipeEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/recipes/:id/view',
    name: 'RecipeView',
    component: RecipeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/production-runs',
    name: 'ProductionRuns',
    component: ProductionIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/production-runs/create',
    name: 'ProductionCreate',
    component: ProductionCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/production-runs/:id/edit',
    name: 'ProductionEdit',
    component: ProductionEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/production-runs/:id/view',
    name: 'ProductionView',
    component: ProductionView,
    meta: { requiresAuth: true },
  },
  {
    path: '/routes',
    name: 'Routes',
    component: RouteIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/routes/create',
    name: 'TerritoryCreate',
    component: RouteCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/routes/:id',
    name: 'RouteView',
    component: RouteView,
    meta: { requiresAuth: true },
  },
  {
    path: '/routes/:id/edit',
    name: 'RouteEdit',
    component: RouteEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/outlets',
    name: 'Outlets',
    component: OutletIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/outlets/create',
    name: 'OutletCreate',
    component: OutletCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/outlets/:id',
    name: 'OutletView',
    component: OutletView,
    meta: { requiresAuth: true },
  },
  {
    path: '/outlets/:id/edit',
    name: 'OutletEdit',
    component: OutletEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/employees',
    name: 'Employees',
    component: EmployeeIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/employees/create',
    name: 'EmployeeCreate',
    component: EmployeeCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/employees/:id',
    name: 'EmployeeView',
    component: EmployeeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/employees/:id/edit',
    name: 'EmployeeEdit',
    component: EmployeeEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    component: VehicleIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/vehicles/create',
    name: 'VehicleCreate',
    component: VehicleCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/vehicles/:id/edit',
    name: 'VehicleEdit',
    component: VehicleEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/vehicles/:id/history',
    name: 'VehicleHistory',
    component: VehicleHistory,
    meta: { requiresAuth: true },
  },
  {
    path: '/sales',
    name: 'Sales',
    component: SalesIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/sales/create',
    name: 'InvoiceCreate',
    component: InvoiceCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/sales/:id/edit',
    name: 'InvoiceEdit',
    component: InvoiceEdit,
    meta: { requiresAuth: true },
  },
  {
    path: '/sales/:id/view',
    name: 'InvoiceView',
    component: InvoiceView,
    meta: { requiresAuth: true },
  },
  {
    path: '/payments',
    name: 'Payments',
    component: PaymentIndex,
    meta: { requiresAuth: true },
  },
  {
    path: '/payments/create',
    name: 'PaymentCreate',
    component: PaymentCreate,
    meta: { requiresAuth: true },
  },
  {
    path: '/payments/pending-checks',
    name: 'PendingChecks',
    component: PendingChecks,
    meta: { requiresAuth: true },
  },
  {
    path: '/payments/:id',
    name: 'PaymentDetails',
    component: PaymentDetails,
    meta: { requiresAuth: true },
  },
  {
    path: '/reports/profit-analysis',
    name: 'ProfitAnalysis',
    component: ProfitAnalysis,
    meta: { requiresAuth: true },
  },
  {
    path: '/reports/waste-cost',
    name: 'WasteCostReport',
    component: WasteCostReport,
    meta: { requiresAuth: true },
  },
  {
    path: '/reports/efficiency',
    name: 'EfficiencyReport',
    component: EfficiencyReport,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Track if auth has been initialized
let authInitialized = false;

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth on first navigation
  if (!authInitialized) {
    authInitialized = true;
    await authStore.initializeAuth();
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
