<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { formatDate, formatNumber } from '@/utils/formatters';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const { showSuccess, showError } = useToastNotification();

const productId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);
const showStockDialog = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'View' },
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

// Handle edit button
const handleEdit = () => {
  router.push(`/products/${productId.value}/edit`);
};

// Handle back button
const handleBack = () => {
  router.push('/products');
};

// Check if SKU needs reorder
const needsReorder = sku => {
  return parseFloat(sku.current_stock || 0) <= parseFloat(sku.reorder_level || 0);
};

// Count low stock items
const lowStockCount = computed(() => {
  const product = productStore.currentProduct;
  if (!product?.skus) return 0;
  return product.skus.filter(needsReorder).length;
});
</script>

<template>
  <div class="product-view">
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
      <Button label="Back to Products" icon="pi pi-arrow-left" @click="handleBack" />
    </div>

    <!-- Product Details -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>{{ productStore.currentProduct?.name }}</h1>
            <p>
              <Tag
                :value="productStore.currentProduct?.status"
                :severity="productStore.currentProduct?.status === 'active' ? 'success' : 'danger'"
              />
            </p>
          </div>
          <div class="action-buttons">
            <Button label="Edit" icon="pi pi-pencil" severity="warning" @click="handleEdit" />
            <Button label="Back" icon="pi pi-arrow-left" outlined @click="handleBack" />
          </div>
        </div>
      </div>

      <!-- Product Information -->
      <Card class="mt-4">
        <template #title>
          <h3>Product Information</h3>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="info-field">
                <label class="label">Product Code</label>
                <p class="value">
                  {{ productStore.currentProduct?.code }}
                </p>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-field">
                <label class="label">Product Name</label>
                <p class="value">
                  {{ productStore.currentProduct?.name }}
                </p>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-field">
                <label class="label">Category</label>
                <p class="value">
                  {{ productStore.currentProduct?.category || 'N/A' }}
                </p>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-field">
                <label class="label">Status</label>
                <p class="value">
                  <Tag
                    :value="productStore.currentProduct?.status"
                    :severity="
                      productStore.currentProduct?.status === 'active' ? 'success' : 'danger'
                    "
                  />
                </p>
              </div>
            </div>

            <div class="col-12">
              <div class="info-field">
                <label class="label">Description</label>
                <p class="value">
                  {{ productStore.currentProduct?.description || 'No description' }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- SKUs Section -->
      <Card v-if="productStore.currentProduct?.skus?.length > 0" class="mt-4">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <h3>Product SKUs</h3>
            <span class="badge">{{ productStore.currentProduct?.skus?.length }} SKUs</span>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="productStore.currentProduct?.skus || []"
            striped-rows
            responsive-layout="scroll"
            class="p-datatable-sm"
          >
            <template #empty>
              <div class="empty-state">
                <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc" />
                <p>No SKUs found for this product</p>
              </div>
            </template>

            <Column field="sku_code" header="SKU Code">
              <template #body="{ data }">
                <strong>{{ data.sku_code }}</strong>
              </template>
            </Column>

            <Column field="size" header="Size" />

            <Column field="unit" header="Unit" />

            <Column field="barcode" header="Barcode">
              <template #body="{ data }">
                {{ data.barcode || 'N/A' }}
              </template>
            </Column>

            <Column field="price" header="Price">
              <template #body="{ data }"> Rs. {{ formatNumber(data.price) }} </template>
            </Column>

            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="data.status === 'active' ? 'success' : 'danger'"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- No SKUs Message -->
      <Card v-else class="mt-4">
        <template #content>
          <div class="text-center p-4">
            <i class="pi pi-inbox" style="font-size: 2rem; color: #999" />
            <p class="mt-3">No SKUs found for this product</p>
          </div>
        </template>
      </Card>

      <!-- Audit Information -->
      <Card class="mt-4">
        <template #title>
          <h3>Audit Information</h3>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="info-field">
                <label class="label">Created At</label>
                <p class="value">
                  {{ formatDate(productStore.currentProduct?.created_at) }}
                </p>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="info-field">
                <label class="label">Last Updated</label>
                <p class="value">
                  {{ formatDate(productStore.currentProduct?.updated_at) }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </template>
  </div>
</template>

<style scoped>
.product-view {
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
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.header-text p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.info-field {
  margin-bottom: 1rem;
}

.info-field .label {
  display: block;
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.info-field .value {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
