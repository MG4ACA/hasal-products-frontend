<template>
  <div class="product-list">
    <!-- Data Table -->
    <DataTable
      :value="productStore.products"
      :loading="productStore.loading"
      striped-rows
      responsive-layout="scroll"
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc" />
          <p>No products found</p>
        </div>
      </template>

      <Column field="code" header="Product Code" :sortable="true">
        <template #body="{ data }">
          <strong>{{ data.code }}</strong>
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
          <Tag :value="data.status" :severity="data.status === 'active' ? 'success' : 'danger'" />
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
              class="p-button-rounded p-button-text"
              @click="$emit('view', data.id)"
            />
            <Button
              v-tooltip.top="'Edit'"
              icon="pi pi-pencil"
              size="small"
              class="p-button-rounded p-button-text"
              @click="$emit('edit', data.id)"
            />
            <Button
              v-tooltip.top="'Delete'"
              icon="pi pi-trash"
              severity="danger"
              class="p-button-rounded p-button-text"
              size="small"
              @click="$emit('delete', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

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
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import { ref } from 'vue';

const productStore = useProductStore();
const toast = useToastNotification();

const emit = defineEmits(['view', 'edit', 'delete']);

const deleteDialog = ref(false);
const productToDelete = ref(null);

const calculateTotalStock = skus => {
  if (!skus || skus.length === 0) return '0';
  const total = skus.reduce((sum, sku) => sum + parseFloat(sku.current_stock || 0), 0);
  return total.toFixed(2);
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
