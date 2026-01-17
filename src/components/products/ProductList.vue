<template>
  <div class="product-list">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Products</span>
          <Button
            label="Create Product"
            class="p-button-success"
            icon="pi pi-plus"
            severity="success"
            @click="navigateToCreate"
          />
        </div>
      </template>

      <template #content>
        <!-- Filters -->
        <div class="grid mb-3">
          <div class="col-12 md:col-6">
            <InputText
              v-model="filters.search"
              placeholder="Search by code, name..."
              class="w-full"
              @input="handleSearch"
            />
          </div>
          <div class="col-12 md:col-3">
            <Dropdown
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by Status"
              class="w-full"
              @change="handleStatusFilter"
            />
          </div>
          <div class="col-12 md:col-3">
            <Avatar
              v-badge.info="activeFilterCount"
              :icon="hasActiveFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
              class="p-overlay-badge"
              @click="hasActiveFilters && clearFilters()"
            />
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :value="productStore.products"
          :loading="productStore.loading"
          striped-rows
          responsive-layout="scroll"
          :paginator="true"
          :rows="productStore.pagination.limit"
          :total-records="productStore.pagination.total"
          :lazy="true"
          class="p-datatable-sm"
          @page="onPage"
        >
          <Column field="product_code" header="Product Code" :sortable="true">
            <template #body="{ data }">
              <strong>{{ data.product_code }}</strong>
            </template>
          </Column>

          <Column field="name" header="Product Name" :sortable="true" />

          <Column field="category" header="Category" :sortable="true">
            <template #body="{ data }">
              <span>{{ data.category || 'N/A' }}</span>
            </template>
          </Column>

          <Column header="SKUs">
            <template #body="{ data }">
              <Tag :value="data.skus?.length || 0" severity="info" />
            </template>
          </Column>

          <Column header="Total Stock">
            <template #body="{ data }">
              {{ calculateTotalStock(data.skus) }}
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

          <Column header="Actions" style="width: 200px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  v-tooltip.top="'View Details'"
                  icon="pi pi-eye"
                  severity="info"
                  size="small"
                  outlined
                  @click="viewProduct(data.id)"
                />
                <Button
                  v-tooltip.top="'Edit'"
                  icon="pi pi-pencil"
                  severity="warning"
                  size="small"
                  outlined
                  @click="editProduct(data.id)"
                />
                <Button
                  v-tooltip.top="'Delete'"
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  outlined
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="productToDelete">
          Are you sure you want to delete <b>{{ productToDelete.name }}</b
          >?
          <br />
          <small class="text-red-500">This cannot be undone.</small>
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Delete" icon="pi pi-check" severity="danger" @click="deleteProduct" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useFilterClear } from '@/composables/useFilterClear';
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const productStore = useProductStore();
const toast = useToastNotification();

const filters = reactive({
  search: '',
  status: '',
  page: 1,
  limit: 10,
});

const initialFilters = {
  search: '',
  status: '',
  page: 1,
  limit: 10,
};

const { activeFilterCount, hasActiveFilters, clearAllFilters } = useFilterClear(filters);

const deleteDialog = ref(false);
const productToDelete = ref(null);

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

onMounted(() => {
  productStore.fetchProducts();
});

const handleSearch = () => {
  filters.search = filters.search;
  productStore.setSearch(filters.search);
};

const handleStatusFilter = () => {
  productStore.setStatusFilter(filters.status);
};

const clearFilters = () => {
  clearAllFilters(initialFilters, {
    onClear: () => {
      productStore.clearFilters();
    },
  });
};

const onPage = event => {
  productStore.setPage(event.page + 1);
};

const calculateTotalStock = skus => {
  if (!skus || skus.length === 0) return '0';
  const total = skus.reduce((sum, sku) => sum + parseFloat(sku.current_stock || 0), 0);
  return total.toFixed(2);
};

const navigateToCreate = () => {
  router.push('/products/create');
};

const viewProduct = id => {
  router.push(`/products/${id}/view`);
};

const editProduct = id => {
  router.push(`/products/${id}/edit`);
};

const confirmDelete = product => {
  productToDelete.value = product;
  deleteDialog.value = true;
};

const deleteProduct = async () => {
  try {
    await productStore.deleteProduct(productToDelete.value.id);
    toast.success('Product deleted successfully');
    deleteDialog.value = false;
    productToDelete.value = null;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete product');
  }
};
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
