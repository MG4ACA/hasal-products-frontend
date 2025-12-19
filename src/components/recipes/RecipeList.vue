<template>
  <div class="recipe-list">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Recipes</span>
          <Button
            label="Create Recipe"
            icon="pi pi-plus"
            severity="success"
            @click="navigateToCreate"
          />
        </div>
      </template>

      <template #content>
        <!-- Filters -->
        <div class="grid mb-3">
          <div class="col-12 md:col-4">
            <InputText
              v-model="searchQuery"
              placeholder="Search recipes..."
              class="w-full"
              @input="handleSearch"
            />
          </div>
          <div class="col-12 md:col-3">
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by Status"
              class="w-full"
              @change="handleStatusFilter"
            />
          </div>
          <div class="col-12 md:col-3">
            <Dropdown
              v-model="productFilter"
              :options="productOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by Product"
              class="w-full"
              :loading="loadingProducts"
              @change="handleProductFilter"
            />
          </div>
          <div class="col-12 md:col-2">
            <Button
              label="Clear"
              icon="pi pi-filter-slash"
              class="w-full"
              outlined
              @click="clearFilters"
            />
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :value="recipeStore.recipes"
          :loading="recipeStore.loading"
          striped-rows
          responsive-layout="scroll"
          :paginator="true"
          :rows="recipeStore.pagination.limit"
          :total-records="recipeStore.pagination.total"
          :lazy="true"
          class="p-datatable-sm"
          @page="onPage"
        >
          <Column field="name" header="Recipe Name" :sortable="true">
            <template #body="{ data }">
              <div>
                <strong>{{ data.name }}</strong>
                <Tag
                  v-if="data.version > 1"
                  :value="`v${data.version}`"
                  severity="info"
                  class="ml-2"
                />
              </div>
            </template>
          </Column>

          <Column header="Product">
            <template #body="{ data }">
              {{ data.product?.name || 'N/A' }}
            </template>
          </Column>

          <Column header="SKU">
            <template #body="{ data }">
              {{ data.productSku?.variant || 'N/A' }}
            </template>
          </Column>

          <Column field="batch_size" header="Batch Size">
            <template #body="{ data }">
              {{ formatNumber(data.batch_size) }} {{ data.unit }}
            </template>
          </Column>

          <Column header="Items">
            <template #body="{ data }">
              <Tag :value="data.items?.length || 0" severity="info" />
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
                  @click="viewRecipe(data.id)"
                />
                <Button
                  v-tooltip.top="'Edit (New Version)'"
                  icon="pi pi-pencil"
                  severity="warning"
                  size="small"
                  outlined
                  @click="editRecipe(data.id)"
                />
                <Button
                  v-tooltip.top="'Version History'"
                  icon="pi pi-history"
                  severity="secondary"
                  size="small"
                  outlined
                  @click="viewVersions(data.id)"
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
        <span v-if="recipeToDelete">
          Are you sure you want to delete <b>{{ recipeToDelete.name }}</b
          >?
          <br />
          <small class="text-red-500">This will delete all recipe items.</small>
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Delete" icon="pi pi-check" severity="danger" @click="deleteRecipe" />
      </template>
    </Dialog>

    <!-- Version History Dialog -->
    <Dialog
      v-model:visible="versionDialog"
      :style="{ width: '800px' }"
      header="Version History"
      :modal="true"
    >
      <DataTable
        :value="versionHistory"
        :loading="loadingVersions"
        striped-rows
        class="p-datatable-sm"
      >
        <Column field="version" header="Version">
          <template #body="{ data }">
            <Tag :value="`v${data.version}`" severity="info" />
          </template>
        </Column>
        <Column field="name" header="Name" />
        <Column field="batch_size" header="Batch Size">
          <template #body="{ data }">
            {{ formatNumber(data.batch_size) }} {{ data.unit }}
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="data.status === 'active' ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column field="created_at" header="Created">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <Button
              label="View"
              icon="pi pi-eye"
              size="small"
              outlined
              @click="viewRecipe(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { useRecipeStore } from '@/stores/recipe';
import { formatDate, formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipeStore = useRecipeStore();
const productStore = useProductStore();
const toast = useToastNotification();

const searchQuery = ref('');
const statusFilter = ref('');
const productFilter = ref('');
const deleteDialog = ref(false);
const recipeToDelete = ref(null);
const versionDialog = ref(false);
const versionHistory = ref([]);
const loadingVersions = ref(false);
const loadingProducts = ref(false);
const productOptions = ref([{ label: 'All Products', value: '' }]);

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

onMounted(async () => {
  recipeStore.fetchRecipes();
  await loadProducts();
});

const loadProducts = async () => {
  loadingProducts.value = true;
  try {
    await productStore.fetchProducts();
    productOptions.value = [
      { label: 'All Products', value: '' },
      ...productStore.products.map(p => ({
        label: `${p.product_code} - ${p.name}`,
        value: p.id,
      })),
    ];
  } catch (error) {
    console.error('Failed to load products');
  } finally {
    loadingProducts.value = false;
  }
};

const handleSearch = () => {
  recipeStore.setSearch(searchQuery.value);
};

const handleStatusFilter = () => {
  recipeStore.setStatusFilter(statusFilter.value);
};

const handleProductFilter = () => {
  recipeStore.setProductFilter(productFilter.value);
};

const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  productFilter.value = '';
  recipeStore.clearFilters();
};

const onPage = event => {
  recipeStore.setPage(event.page + 1);
};

const navigateToCreate = () => {
  router.push('/recipes/create');
};

const viewRecipe = id => {
  router.push(`/recipes/${id}/view`);
};

const editRecipe = id => {
  router.push(`/recipes/${id}/edit`);
};

const confirmDelete = recipe => {
  recipeToDelete.value = recipe;
  deleteDialog.value = true;
};

const deleteRecipe = async () => {
  try {
    await recipeStore.deleteRecipe(recipeToDelete.value.id);
    toast.success('Recipe deleted successfully');
    deleteDialog.value = false;
    recipeToDelete.value = null;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete recipe');
  }
};

const viewVersions = async id => {
  loadingVersions.value = true;
  versionDialog.value = true;
  try {
    versionHistory.value = await recipeStore.fetchVersionHistory(id);
  } catch (error) {
    toast.error('Failed to load version history');
  } finally {
    loadingVersions.value = false;
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
