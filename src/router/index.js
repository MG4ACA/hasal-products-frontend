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

// Raw Material views
const RawMaterialIndex = () => import('@/views/raw-materials/RawMaterialIndex.vue');
const RawMaterialCreate = () => import('@/views/raw-materials/RawMaterialCreate.vue');
const RawMaterialEdit = () => import('@/views/raw-materials/RawMaterialEdit.vue');

// Purchase Order views
const PurchaseOrderIndex = () => import('@/views/purchase-orders/PurchaseOrderIndex.vue');
const PurchaseOrderCreate = () => import('@/views/purchase-orders/PurchaseOrderCreate.vue');
const PurchaseOrderEdit = () => import('@/views/purchase-orders/PurchaseOrderEdit.vue');
const PurchaseOrderView = () => import('@/views/purchase-orders/PurchaseOrderView.vue');

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

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

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
