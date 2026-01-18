<script setup>
import ProductForm from '@/components/products/ProductForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import ProgressSpinner from 'primevue/progressspinner';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const { showSuccess, showError } = useToastNotification();

const productId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Edit' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load product data
onMounted(async () => {
  try {
    isLoading.value = true;
    await productStore.fetchProductById(productId.value);

    if (!productStore.currentProduct) {
      notFound.value = true;
      showError('Product not found');
    } else {
      // Update breadcrumb with product name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Products', to: '/products' },
        { label: productStore.currentProduct.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load product:', error);
    notFound.value = true;
    showError('Failed to load product details');
  } finally {
    isLoading.value = false;
  }
});

// Handle form submission
const handleSubmit = async formData => {
  try {
    await productStore.updateProduct(productId.value, formData);
    showSuccess('Product updated successfully');
    router.push('/products');
  } catch (error) {
    console.error('Failed to update product:', error);
    showError(error.message || 'Failed to update product');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/products');
};
</script>

<template>
  <div class="product-edit">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading product details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Product Not Found</h2>
      <p>The product you're looking for doesn't exist or has been deleted.</p>
      <Button label="Back to Products" icon="pi pi-arrow-left" @click="router.push('/products')" />
    </div>

    <!-- Edit Form -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Edit Product</h1>
            <p>Update product information</p>
            <div class="product-info">
              <div class="info-item">
                <span class="info-label">Product Code:</span>
                <span class="code-value">{{ productStore.currentProduct?.code }}</span>
              </div>
              <div v-if="productStore.currentProduct?.skus" class="info-item">
                <span class="info-label">SKUs:</span>
                <span class="sku-count">{{ productStore.currentProduct.skus.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Form -->
      <ProductForm
        :product-id="productId"
        :loading="productStore.loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
  </div>
</template>

<style scoped>
.product-edit {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container i {
  margin-bottom: 1rem;
}

.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.not-found-container i {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.not-found-container h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.not-found-container p {
  color: #666;
  margin-bottom: 1.5rem;
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
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
}

.product-info {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.code-value {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.sku-count {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
