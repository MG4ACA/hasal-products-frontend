<template>
  <div class="product-view">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Product Details</span>
          <div class="flex gap-2">
            <Button label="Edit" icon="pi pi-pencil" severity="warning" @click="editProduct" />
            <Button label="Back" icon="pi pi-arrow-left" outlined @click="goBack" />
          </div>
        </div>
      </template>

      <template #content>
        <div v-if="loading" class="text-center">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
        </div>

        <div v-else-if="product">
          <!-- Product Information -->
          <div class="grid">
            <div class="col-12">
              <h3>Product Information</h3>
              <Divider />
            </div>

            <div class="col-12 md:col-6">
              <label class="font-bold">Product Code:</label>
              <p>{{ product.product_code }}</p>
            </div>

            <div class="col-12 md:col-6">
              <label class="font-bold">Product Name:</label>
              <p>{{ product.name }}</p>
            </div>

            <div class="col-12 md:col-6">
              <label class="font-bold">Category:</label>
              <p>{{ product.category || 'N/A' }}</p>
            </div>

            <div class="col-12 md:col-6">
              <label class="font-bold">Status:</label>
              <p>
                <Tag
                  :value="product.status"
                  :severity="product.status === 'active' ? 'success' : 'danger'"
                />
              </p>
            </div>

            <div class="col-12">
              <label class="font-bold">Description:</label>
              <p>{{ product.description || 'No description' }}</p>
            </div>
          </div>

          <!-- SKUs Section -->
          <div class="mt-4">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3>Product SKUs</h3>
              <Button label="View Stock" icon="pi pi-chart-bar" outlined @click="viewStock" />
            </div>
            <Divider />

            <DataTable :value="product.skus || []" striped-rows class="p-datatable-sm">
              <template #empty>
                <div class="text-center p-4">No SKUs found</div>
              </template>

              <Column field="sku_code" header="SKU Code">
                <template #body="{ data }">
                  <strong>{{ data.sku_code }}</strong>
                </template>
              </Column>

              <Column field="variant" header="Variant" />

              <Column field="barcode" header="Barcode">
                <template #body="{ data }">
                  {{ data.barcode || 'N/A' }}
                </template>
              </Column>

              <Column field="price" header="Price">
                <template #body="{ data }"> Rs. {{ formatNumber(data.price) }} </template>
              </Column>

              <Column field="current_stock" header="Current Stock">
                <template #body="{ data }">
                  <span :class="{ 'text-red-500': needsReorder(data) }">
                    {{ formatNumber(data.current_stock) }}
                  </span>
                </template>
              </Column>

              <Column field="reorder_level" header="Reorder Level">
                <template #body="{ data }">
                  {{ formatNumber(data.reorder_level) }}
                </template>
              </Column>

              <Column field="status" header="Status">
                <template #body="{ data }">
                  <Tag
                    :value="data.status"
                    :severity="data.status === 'active' ? 'success' : 'danger'"
                  />
                </template>
              </Column>

              <Column header="Alert">
                <template #body="{ data }">
                  <Tag
                    v-if="needsReorder(data)"
                    value="Low Stock"
                    severity="danger"
                    icon="pi pi-exclamation-triangle"
                  />
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Timestamps -->
          <div class="grid mt-4">
            <div class="col-12">
              <Divider />
            </div>
            <div class="col-12 md:col-6">
              <label class="font-bold">Created At:</label>
              <p>{{ formatDate(product.created_at) }}</p>
            </div>
            <div class="col-12 md:col-6">
              <label class="font-bold">Last Updated:</label>
              <p>{{ formatDate(product.updated_at) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center p-4">
          <p>Product not found</p>
        </div>
      </template>
    </Card>

    <!-- Stock Dialog -->
    <Dialog
      v-model:visible="showStockDialog"
      :style="{ width: '800px' }"
      header="Stock Summary"
      :modal="true"
    >
      <div v-if="stockData">
        <div class="grid mb-3">
          <div class="col-12 md:col-4">
            <Card>
              <template #content>
                <div class="text-center">
                  <div class="text-500 mb-2">Total Stock</div>
                  <div class="text-2xl font-bold text-primary">
                    {{ formatNumber(stockData.total_stock) }}
                  </div>
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card>
              <template #content>
                <div class="text-center">
                  <div class="text-500 mb-2">Total SKUs</div>
                  <div class="text-2xl font-bold">
                    {{ stockData.skus?.length || 0 }}
                  </div>
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card>
              <template #content>
                <div class="text-center">
                  <div class="text-500 mb-2">Low Stock Items</div>
                  <div class="text-2xl font-bold text-red-500">
                    {{ lowStockCount }}
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>

        <DataTable :value="stockData.skus" striped-rows class="p-datatable-sm">
          <Column field="sku_code" header="SKU Code" />
          <Column field="variant" header="Variant" />
          <Column field="current_stock" header="Current Stock">
            <template #body="{ data }">
              <span :class="{ 'text-red-500': data.needs_reorder }">
                {{ formatNumber(data.current_stock) }}
              </span>
            </template>
          </Column>
          <Column field="reorder_level" header="Reorder Level">
            <template #body="{ data }">
              {{ formatNumber(data.reorder_level) }}
            </template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              <Tag v-if="data.needs_reorder" value="Reorder" severity="danger" />
              <Tag v-else value="OK" severity="success" />
            </template>
          </Column>
        </DataTable>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { formatDate, formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const toast = useToastNotification();

const loading = ref(false);
const product = ref(null);
const showStockDialog = ref(false);
const stockData = ref(null);

const productId = computed(() => route.params.id);

const lowStockCount = computed(() => {
  if (!stockData.value?.skus) return 0;
  return stockData.value.skus.filter(sku => sku.needs_reorder).length;
});

onMounted(async () => {
  await loadProduct();
});

const loadProduct = async () => {
  loading.value = true;
  try {
    product.value = await productStore.fetchProductById(productId.value);
  } catch (error) {
    toast.error('Failed to load product');
  } finally {
    loading.value = false;
  }
};

const needsReorder = sku => {
  return parseFloat(sku.current_stock || 0) <= parseFloat(sku.reorder_level || 0);
};

const editProduct = () => {
  router.push(`/products/${productId.value}/edit`);
};

const goBack = () => {
  router.push('/products');
};

const viewStock = async () => {
  try {
    stockData.value = await productStore.getProductStock(productId.value);
    showStockDialog.value = true;
  } catch (error) {
    toast.error('Failed to load stock data');
  }
};
</script>

<style scoped>
.font-bold {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
}
</style>
