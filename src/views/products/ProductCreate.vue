<script setup>
import ProductForm from '@/components/products/ProductForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { useRouter } from 'vue-router';

const router = useRouter();
const productStore = useProductStore();
const { showSuccess, showError } = useToastNotification();

// Breadcrumb items
const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Handle form submission
const handleSubmit = async formData => {
  try {
    await productStore.createProduct(formData);
    showSuccess('Product created successfully');
    router.push('/products');
  } catch (error) {
    console.error('Failed to create product:', error);
    showError(error.message || 'Failed to create product');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/products');
};
</script>

<template>
  <div class="product-create">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Product</h1>
          <p>Add a new product to the inventory</p>
        </div>
      </div>
    </div>

    <!-- Product Form -->
    <ProductForm :loading="productStore.loading" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
.product-create {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.header-text p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}
</style>
