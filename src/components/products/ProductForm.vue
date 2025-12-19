<template>
  <div class="product-form">
    <Card>
      <template #title>
        {{ isEditMode ? 'Edit Product' : 'Create Product' }}
      </template>

      <template #content>
        <form @submit.prevent="handleSubmit">
          <div class="grid">
            <!-- Product Code (Read-only in edit mode) -->
            <div class="col-12 md:col-6">
              <label for="product_code" class="block mb-2">Product Code</label>
              <InputText
                id="product_code"
                v-model="formData.product_code"
                class="w-full"
                disabled
                placeholder="Auto-generated"
              />
            </div>

            <!-- Product Name -->
            <div class="col-12 md:col-6">
              <label for="name" class="block mb-2">
                Product Name <span class="text-red-500">*</span>
              </label>
              <InputText
                id="name"
                v-model="formData.name"
                class="w-full"
                :class="{ 'p-invalid': errors.name }"
                placeholder="Enter product name"
                required
              />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>

            <!-- Category -->
            <div class="col-12 md:col-6">
              <label for="category" class="block mb-2">Category</label>
              <InputText
                id="category"
                v-model="formData.category"
                class="w-full"
                placeholder="e.g., Spices, Condiments"
              />
            </div>

            <!-- Status -->
            <div class="col-12 md:col-6">
              <label for="status" class="block mb-2">Status</label>
              <Dropdown
                id="status"
                v-model="formData.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>

            <!-- Description -->
            <div class="col-12">
              <label for="description" class="block mb-2">Description</label>
              <Textarea
                id="description"
                v-model="formData.description"
                rows="4"
                class="w-full"
                placeholder="Enter product description"
              />
            </div>
          </div>

          <!-- SKU Management (Only in Edit Mode) -->
          <div v-if="isEditMode && productData" class="mt-4">
            <Divider />
            <div class="flex justify-content-between align-items-center mb-3">
              <h3>Product SKUs</h3>
              <Button
                label="Add SKU"
                icon="pi pi-plus"
                size="small"
                @click="showSkuDialog = true"
              />
            </div>

            <DataTable :value="productData.skus || []" striped-rows class="p-datatable-sm">
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
              <Column field="current_stock" header="Stock">
                <template #body="{ data }">
                  {{ formatNumber(data.current_stock) }}
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
              <Column header="Actions">
                <template #body="{ data }">
                  <div class="flex gap-2">
                    <Button icon="pi pi-pencil" size="small" outlined @click="editSku(data)" />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      size="small"
                      outlined
                      @click="confirmDeleteSku(data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Form Actions -->
          <div class="flex gap-2 mt-4">
            <Button
              type="submit"
              :label="isEditMode ? 'Update Product' : 'Create Product'"
              icon="pi pi-check"
              :loading="loading"
            />
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="handleCancel"
            />
          </div>
        </form>
      </template>
    </Card>

    <!-- SKU Dialog -->
    <Dialog
      v-model:visible="showSkuDialog"
      :style="{ width: '500px' }"
      :header="skuToEdit ? 'Edit SKU' : 'Add SKU'"
      :modal="true"
    >
      <div class="grid">
        <div class="col-12 md:col-6">
          <label for="size" class="block mb-2"> Size <span class="text-red-500">*</span> </label>
          <InputText
            id="size"
            v-model="skuFormData.size"
            class="w-full"
            placeholder="e.g., 100, 500, 1"
            required
          />
        </div>

        <div class="col-12 md:col-6">
          <label for="unit" class="block mb-2"> Unit <span class="text-red-500">*</span> </label>
          <InputText
            id="unit"
            v-model="skuFormData.unit"
            class="w-full"
            placeholder="e.g., g, kg, ml, l"
            required
          />
        </div>

        <div class="col-12">
          <label for="barcode" class="block mb-2">Barcode</label>
          <InputText
            id="barcode"
            v-model="skuFormData.barcode"
            class="w-full"
            placeholder="Enter barcode"
          />
        </div>

        <div class="col-12 md:col-6">
          <label for="price" class="block mb-2"> Price <span class="text-red-500">*</span> </label>
          <InputNumber
            id="price"
            v-model="skuFormData.price"
            class="w-full"
            mode="decimal"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            prefix="Rs. "
            required
          />
        </div>

        <div class="col-12 md:col-6">
          <label for="reorder_level" class="block mb-2">Reorder Level</label>
          <InputNumber
            id="reorder_level"
            v-model="skuFormData.reorder_level"
            class="w-full"
            mode="decimal"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
          />
        </div>

        <div class="col-12">
          <label for="sku_status" class="block mb-2">Status</label>
          <Dropdown
            id="sku_status"
            v-model="skuFormData.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="closeSkuDialog" />
        <Button
          :label="skuToEdit ? 'Update' : 'Add'"
          icon="pi pi-check"
          :loading="loading"
          @click="saveSku"
        />
      </template>
    </Dialog>

    <!-- Delete SKU Dialog -->
    <Dialog
      v-model:visible="deleteSkuDialog"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="skuToDelete">
          Are you sure you want to delete SKU <b>{{ skuToDelete.size }}{{ skuToDelete.unit }}</b
          >?
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="deleteSkuDialog = false" />
        <Button label="Delete" icon="pi pi-check" severity="danger" @click="deleteSku" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductStore } from '@/stores/product';
import { formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  productId: {
    type: [String, Number],
    default: null,
  },
});

const router = useRouter();
const productStore = useProductStore();
const toast = useToastNotification();

const loading = ref(false);
const errors = ref({});
const productData = ref(null);
const showSkuDialog = ref(false);
const skuToEdit = ref(null);
const deleteSkuDialog = ref(false);
const skuToDelete = ref(null);

const formData = ref({
  product_code: '',
  name: '',
  description: '',
  category: '',
  status: 'active',
});

const skuFormData = ref({
  size: '',
  unit: '',
  barcode: '',
  price: 0,
  status: 'active',
});

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const isEditMode = computed(() => !!props.productId);

watch(
  () => props.productId,
  async newId => {
    if (newId) {
      await loadProduct(newId);
    }
  },
  { immediate: true }
);

const loadProduct = async id => {
  loading.value = true;
  try {
    productData.value = await productStore.fetchProductById(id);
    formData.value = {
      product_code: productData.value.product_code,
      name: productData.value.name,
      description: productData.value.description,
      category: productData.value.category,
      status: productData.value.status,
    };
  } catch (error) {
    toast.error('Failed to load product');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  errors.value = {};

  if (!formData.value.name) {
    errors.value.name = 'Product name is required';
    return;
  }

  loading.value = true;

  try {
    if (isEditMode.value) {
      await productStore.updateProduct(props.productId, formData.value);
      toast.success('Product updated successfully');
    } else {
      await productStore.createProduct(formData.value);
      toast.success('Product created successfully');
    }
    router.push('/products');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to save product');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/products');
};

const editSku = sku => {
  skuToEdit.value = sku;
  skuFormData.value = {
    size: sku.size,
    unit: sku.unit,
    barcode: sku.barcode,
    price: sku.price,
    status: sku.status,
  };
  showSkuDialog.value = true;
};

const closeSkuDialog = () => {
  showSkuDialog.value = false;
  skuToEdit.value = null;
  skuFormData.value = {
    size: '',
    unit: '',
    barcode: '',
    price: 0,
    status: 'active',
  };
};

const saveSku = async () => {
  loading.value = true;
  try {
    if (skuToEdit.value) {
      await productStore.updateSku(props.productId, skuToEdit.value.id, skuFormData.value);
      toast.success('SKU updated successfully');
    } else {
      await productStore.addSku(props.productId, skuFormData.value);
      toast.success('SKU added successfully');
    }
    closeSkuDialog();
    await loadProduct(props.productId);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to save SKU');
  } finally {
    loading.value = false;
  }
};

const confirmDeleteSku = sku => {
  skuToDelete.value = sku;
  deleteSkuDialog.value = true;
};

const deleteSku = async () => {
  loading.value = true;
  try {
    await productStore.deleteSku(props.productId, skuToDelete.value.id);
    toast.success('SKU deleted successfully');
    deleteSkuDialog.value = false;
    skuToDelete.value = null;
    await loadProduct(props.productId);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete SKU');
  } finally {
    loading.value = false;
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
