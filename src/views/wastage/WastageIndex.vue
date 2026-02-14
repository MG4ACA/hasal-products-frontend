<template>
  <div class="wastage-index">
    <div class="page-header">
      <div class="header-left">
        <h1>Wastage Tracking</h1>
        <p class="text-muted">Track inventory wastage from expiry, damage, and other causes</p>
      </div>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="wastageStore.fetchWastageRecords()"
        />
        <Button label="Record Wastage" icon="pi pi-plus" @click="showRecordDialog = true" />
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters">
        <div class="search-box">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters.search"
              placeholder="Search item name or reason..."
              class="search-input"
              @input="debounceSearch"
            />
          </IconField>
        </div>

        <Dropdown
          v-model="filters.wastage_type"
          :options="wastageTypes"
          option-label="label"
          option-value="value"
          placeholder="All Types"
          class="filter-dropdown"
          @change="applyFilters"
        />

        <Dropdown
          v-model="filters.item_type"
          :options="itemTypes"
          option-label="label"
          option-value="value"
          placeholder="All Items"
          class="filter-dropdown"
          @change="applyFilters"
        />

        <Calendar
          v-model="filters.start_date"
          date-format="yy-mm-dd"
          placeholder="Start Date"
          show-icon
          class="filter-calendar"
          @date-select="applyFilters"
        />

        <Calendar
          v-model="filters.end_date"
          date-format="yy-mm-dd"
          placeholder="End Date"
          show-icon
          class="filter-calendar"
          @date-select="applyFilters"
        />

        <Avatar
          v-badge.info="activeFilterCount"
          :icon="hasActiveFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
          class="p-overlay-badge"
          @click="hasActiveFilters && clearFilters()"
        />
      </div>
    </div>

    <!-- Wastage Records Table -->
    <Card class="data-table-card">
      <template #content>
        <DataTable
          :value="wastageStore.wastageRecords"
          :loading="wastageStore.loading"
          striped-rows
          responsive-layout="scroll"
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="empty-state">
              <i class="pi pi-inbox" style="font-size: 3rem; color: #cbd5e1" />
              <p>No wastage records found</p>
            </div>
          </template>

          <Column field="wastage_date" header="Date" sortable style="min-width: 120px">
            <template #body="{ data }">
              {{ formatDate(data.wastage_date) }}
            </template>
          </Column>

          <Column field="wastage_type" header="Type" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag
                :value="formatWastageType(data.wastage_type)"
                :severity="getWastageTypeSeverity(data.wastage_type)"
              />
            </template>
          </Column>

          <Column field="item_type" header="Item Type" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag :value="data.item_type === 'raw_material' ? 'Raw Material' : 'Finished Goods'" />
            </template>
          </Column>

          <Column field="item_name" header="Item" sortable style="min-width: 200px" />

          <Column field="quantity" header="Quantity" sortable style="min-width: 120px">
            <template #body="{ data }">
              {{ formatNumber(data.quantity) }} {{ data.unit }}
            </template>
          </Column>

          <Column field="total_cost" header="Cost (LKR)" sortable style="min-width: 120px">
            <template #body="{ data }">
              <span class="cost-value">{{ formatCurrency(data.total_cost) }}</span>
            </template>
          </Column>

          <Column field="reason" header="Reason" style="min-width: 200px" />

          <Column header="Actions" style="min-width: 120px">
            <template #body="{ data }">
              <Button
                v-tooltip.top="'View Details'"
                icon="pi pi-eye"
                class="p-button-sm p-button-text"
                @click="viewRecord(data)"
              />
              <Button
                v-tooltip.top="'Edit'"
                icon="pi pi-pencil"
                class="p-button-sm p-button-text"
                @click="editRecord(data)"
              />
              <Button
                v-tooltip.top="'Delete'"
                icon="pi pi-trash"
                class="p-button-sm p-button-text p-button-danger"
                @click="confirmDelete(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Pagination -->
    <Card class="pagination-card">
      <template #content>
        <div v-if="pagination.total > 0" class="pagination-container">
          <Paginator
            :rows="pagination.limit"
            :total-records="pagination.total"
            :first="(wastageStore.pagination.page - 1) * pagination.limit"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            current-page-report-template="Showing {first} to {last} of {totalRecords} records"
            @page="onPageChange"
          />
        </div>
      </template>
    </Card>

    <!-- Record Wastage Dialog -->
    <Dialog
      v-model:visible="showRecordDialog"
      :header="editMode ? 'Edit Wastage Record' : 'Record Wastage'"
      :modal="true"
      :closable="true"
      :style="{ width: '700px' }"
    >
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>Wastage Type <span class="required">*</span></label>
            <Dropdown
              v-model="formData.wastage_type"
              :options="wastageTypes"
              option-label="label"
              option-value="value"
              placeholder="Select Wastage Type"
              :class="{ 'p-invalid': errors.wastage_type }"
              :disabled="editMode"
            />
            <small class="p-error">{{ errors.wastage_type }}</small>
          </div>

          <div class="form-group">
            <label>Item Type <span class="required">*</span></label>
            <Dropdown
              v-model="formData.item_type"
              :options="itemTypes"
              option-label="label"
              option-value="value"
              placeholder="Select Item Type"
              :class="{ 'p-invalid': errors.item_type }"
              :disabled="editMode"
              @change="onItemTypeChange"
            />
            <small class="p-error">{{ errors.item_type }}</small>
          </div>

          <div class="form-group">
            <label>Item <span class="required">*</span></label>
            <AutoComplete
              v-model="selectedItem"
              :suggestions="filteredItems"
              field="name"
              option-label="name"
              placeholder="Search and select item"
              :class="{ 'p-invalid': errors.item_id }"
              :disabled="editMode || !formData.item_type"
              @complete="onSearchItems"
              @change="onItemSelect"
            />
            <small class="p-error">{{ errors.item_id }}</small>
          </div>

          <div class="form-group">
            <label>Quantity <span class="required">*</span></label>
            <InputNumber
              v-model="formData.quantity"
              :min="0"
              :max-fraction-digits="2"
              placeholder="Enter quantity"
              :class="{ 'p-invalid': errors.quantity }"
              :disabled="editMode"
            />
            <small class="p-error">{{ errors.quantity }}</small>
          </div>

          <div class="form-group">
            <label>Unit <span class="required">*</span></label>
            <InputText
              v-model="formData.unit"
              placeholder="kg, L, pcs, etc."
              :class="{ 'p-invalid': errors.unit }"
              :disabled="editMode"
            />
            <small class="p-error">{{ errors.unit }}</small>
          </div>

          <div class="form-group">
            <label>Unit Cost (LKR)</label>
            <InputNumber
              v-model="formData.unit_cost"
              mode="currency"
              currency="LKR"
              :min-fraction-digits="2"
              placeholder="Auto-calculated if left empty"
              :disabled="editMode"
            />
            <small class="text-muted">Leave empty to auto-calculate from inventory</small>
          </div>

          <div class="form-group full-width">
            <label>Wastage Date <span class="required">*</span></label>
            <Calendar
              v-model="formData.wastage_date"
              date-format="yy-mm-dd"
              show-icon
              :class="{ 'p-invalid': errors.wastage_date }"
            />
            <small class="p-error">{{ errors.wastage_date }}</small>
          </div>

          <div class="form-group full-width">
            <label>Reason <span class="required">*</span></label>
            <InputText
              v-model="formData.reason"
              placeholder="Brief reason for wastage"
              :class="{ 'p-invalid': errors.reason }"
            />
            <small class="p-error">{{ errors.reason }}</small>
          </div>

          <div class="form-group full-width">
            <label>Location</label>
            <InputText
              v-model="formData.location"
              placeholder="Warehouse, Production floor, etc."
            />
          </div>

          <div class="form-group full-width">
            <label>Detailed Notes</label>
            <Textarea
              v-model="formData.detailed_notes"
              rows="3"
              placeholder="Additional details..."
            />
          </div>
        </div>

        <div class="dialog-footer">
          <Button label="Cancel" outlined @click="closeDialog" />
          <Button
            :label="editMode ? 'Update' : 'Record Wastage'"
            type="submit"
            :loading="wastageStore.loading"
          />
        </div>
      </form>
    </Dialog>

    <!-- View Dialog -->
    <Dialog
      v-model:visible="showViewDialog"
      header="Wastage Record Details"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedRecord" class="record-details">
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">{{ formatDate(selectedRecord.wastage_date) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Type:</span>
          <Tag
            :value="formatWastageType(selectedRecord.wastage_type)"
            :severity="getWastageTypeSeverity(selectedRecord.wastage_type)"
          />
        </div>
        <div class="detail-row">
          <span class="label">Item Type:</span>
          <span class="value">{{
            selectedRecord.item_type === 'raw_material' ? 'Raw Material' : 'Finished Goods'
          }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Item:</span>
          <span class="value">{{ selectedRecord.item_name }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Quantity:</span>
          <span class="value"
            >{{ formatNumber(selectedRecord.quantity) }} {{ selectedRecord.unit }}</span
          >
        </div>
        <div class="detail-row">
          <span class="label">Unit Cost:</span>
          <span class="value">{{ formatCurrency(selectedRecord.unit_cost) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Cost:</span>
          <span class="value cost-highlight">{{ formatCurrency(selectedRecord.total_cost) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Reason:</span>
          <span class="value">{{ selectedRecord.reason }}</span>
        </div>
        <div v-if="selectedRecord.location" class="detail-row">
          <span class="label">Location:</span>
          <span class="value">{{ selectedRecord.location }}</span>
        </div>
        <div v-if="selectedRecord.detailed_notes" class="detail-row full-width">
          <span class="label">Notes:</span>
          <span class="value">{{ selectedRecord.detailed_notes }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Recorded By:</span>
          <span class="value">{{
            selectedRecord.recordedBy?.full_name || selectedRecord.recordedBy?.username
          }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Recorded On:</span>
          <span class="value">{{ formatDateTime(selectedRecord.created_at) }}</span>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { useProductStore } from '@/stores/product';
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { useWastageStore } from '@/stores/wastage';
import AutoComplete from 'primevue/autocomplete';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';

const wastageStore = useWastageStore();
const rawMaterialStore = useRawMaterialStore();
const productStore = useProductStore();
const confirm = useConfirm();
const toast = useToast();

// Data
const showRecordDialog = ref(false);
const showViewDialog = ref(false);
const editMode = ref(false);
const selectedRecord = ref(null);
const selectedItem = ref(null);
const filteredItems = ref([]);

const wastageTypes = [
  { label: 'Expiry', value: 'expiry' },
  { label: 'Damage', value: 'damage' },
  { label: 'Production Waste', value: 'production' },
  { label: 'Quality Reject', value: 'quality_reject' },
  { label: 'Spillage', value: 'spillage' },
  { label: 'Theft', value: 'theft' },
  { label: 'Other', value: 'other' },
];

const itemTypes = [
  { label: 'Raw Material', value: 'raw_material' },
  { label: 'Finished Goods', value: 'finished_goods' },
];

const filters = reactive({
  wastage_type: null,
  item_type: null,
  start_date: null,
  end_date: null,
  search: '',
});

const formData = reactive({
  wastage_type: null,
  item_type: null,
  item_id: null,
  quantity: null,
  unit: '',
  unit_cost: null,
  reason: '',
  detailed_notes: '',
  wastage_date: new Date(),
  location: '',
});

const errors = reactive({});

// Computed
const pagination = computed(() => wastageStore.pagination);

const hasActiveFilters = computed(() => {
  return (
    filters.wastage_type !== null ||
    filters.item_type !== null ||
    filters.start_date !== null ||
    filters.end_date !== null ||
    filters.search !== ''
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.wastage_type !== null) count++;
  if (filters.item_type !== null) count++;
  if (filters.start_date !== null) count++;
  if (filters.end_date !== null) count++;
  if (filters.search !== '') count++;
  return count;
});

const availableItems = computed(() => {
  if (formData.item_type === 'raw_material') {
    return rawMaterialStore.rawMaterials.map(item => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
    }));
  } else if (formData.item_type === 'finished_goods') {
    return productStore.products.flatMap(product =>
      product.skus.map(sku => ({
        id: sku.id,
        name: `${product.name} - ${sku.size}${sku.unit}`,
        unit: sku.unit,
      }))
    );
  }
  return [];
});

// Methods
const applyFilters = () => {
  wastageStore.setFilters({
    wastage_type: filters.wastage_type,
    item_type: filters.item_type,
    start_date: filters.start_date ? formatDateForAPI(filters.start_date) : null,
    end_date: filters.end_date ? formatDateForAPI(filters.end_date) : null,
    search: filters.search,
  });
  wastageStore.fetchWastageRecords();
};

let searchTimeout;
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const clearFilters = () => {
  filters.wastage_type = null;
  filters.item_type = null;
  filters.start_date = null;
  filters.end_date = null;
  filters.search = '';
  wastageStore.clearFilters();
  wastageStore.fetchWastageRecords();
};

const onPageChange = event => {
  wastageStore.setPage(event.page + 1);
  wastageStore.fetchWastageRecords();
};

const onSearchItems = event => {
  const query = event.query.toLowerCase();
  if (!query) {
    filteredItems.value = availableItems.value;
  } else {
    filteredItems.value = availableItems.value.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }
};

const onItemSelect = event => {
  if (event.value && typeof event.value === 'object') {
    selectedItem.value = event.value;
    formData.item_id = event.value.id;
    formData.unit = event.value.unit;
  } else {
    // Handle clear
    selectedItem.value = null;
    formData.item_id = null;
    formData.unit = '';
  }
};

const onItemTypeChange = () => {
  formData.item_id = null;
  formData.unit = '';
  formData.unit_cost = null;
  selectedItem.value = null;
  filteredItems.value = [];

  // Load items based on type
  if (formData.item_type === 'raw_material') {
    rawMaterialStore.fetchRawMaterials();
  } else if (formData.item_type === 'finished_goods') {
    productStore.fetchProducts();
  }
};

const viewRecord = record => {
  selectedRecord.value = record;
  showViewDialog.value = true;
};

const editRecord = record => {
  editMode.value = true;
  selectedRecord.value = record;
  Object.assign(formData, {
    wastage_type: record.wastage_type,
    item_type: record.item_type,
    item_id: record.item_id,
    quantity: parseFloat(record.quantity),
    unit: record.unit,
    unit_cost: parseFloat(record.unit_cost),
    reason: record.reason,
    detailed_notes: record.detailed_notes,
    wastage_date: new Date(record.wastage_date),
    location: record.location,
  });

  // Set selectedItem for autocomplete
  const item = availableItems.value.find(i => i.id === record.item_id);
  if (item) {
    selectedItem.value = item;
  }

  showRecordDialog.value = true;
};

const confirmDelete = record => {
  confirm.require({
    message: 'Delete this wastage record? This action cannot be undone.',
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await wastageStore.deleteWastageRecord(record.id);
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Wastage record deleted',
          life: 3000,
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete record',
          life: 3000,
        });
      }
    },
  });
};

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);

  if (!formData.wastage_type) errors.wastage_type = 'Wastage type is required';
  if (!formData.item_type) errors.item_type = 'Item type is required';
  if (!formData.item_id) errors.item_id = 'Item is required';
  if (!formData.quantity || formData.quantity <= 0)
    errors.quantity = 'Quantity must be greater than 0';
  if (!formData.unit) errors.unit = 'Unit is required';
  if (!formData.wastage_date) errors.wastage_date = 'Date is required';
  if (!formData.reason) errors.reason = 'Reason is required';

  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const submitData = {
      ...formData,
      wastage_date: formatDateForAPI(formData.wastage_date),
    };

    if (editMode.value) {
      // Only update allowed fields
      await wastageStore.updateWastageRecord(selectedRecord.value.id, {
        reason: submitData.reason,
        detailed_notes: submitData.detailed_notes,
        location: submitData.location,
      });
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Wastage record updated',
        life: 3000,
      });
    } else {
      await wastageStore.createWastageRecord(submitData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Wastage recorded successfully',
        life: 3000,
      });
    }

    closeDialog();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Operation failed',
      life: 3000,
    });
  }
};

const closeDialog = () => {
  showRecordDialog.value = false;
  editMode.value = false;
  selectedRecord.value = null;
  selectedItem.value = null;
  filteredItems.value = [];
  Object.keys(formData).forEach(key => {
    if (key === 'wastage_date') {
      formData[key] = new Date();
    } else if (typeof formData[key] === 'boolean') {
      formData[key] = false;
    } else if (typeof formData[key] === 'number') {
      formData[key] = null;
    } else {
      formData[key] = '';
    }
  });
  Object.keys(errors).forEach(key => delete errors[key]);
};

// Formatters
const formatDate = date => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = datetime => {
  if (!datetime) return '';
  return new Date(datetime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateForAPI = date => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatNumber = num => {
  return parseFloat(num || 0).toFixed(2);
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const formatWastageType = type => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getWastageTypeSeverity = type => {
  const severityMap = {
    expiry: 'warning',
    damage: 'danger',
    production: 'info',
    quality_reject: 'warning',
    spillage: 'info',
    theft: 'danger',
    other: 'secondary',
  };
  return severityMap[type] || 'secondary';
};

// Lifecycle
onMounted(async () => {
  await wastageStore.fetchWastageRecords();
  // Pre-load materials and products for dropdown
  rawMaterialStore.fetchRawMaterials();
  productStore.fetchProducts();
});
</script>

<style scoped>
.wastage-index {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.text-muted {
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filters-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
}

.filter-dropdown {
  min-width: 180px;
}

.filter-calendar {
  width: 160px;
}
.data-table-card {
  margin-bottom: 1.5rem;
}

.pagination-card {
  margin-bottom: 0;
}

.pagination-container {
  margin: 0;
}
.cost-value {
  font-weight: 600;
  color: #dc2626;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
}

.required {
  color: #dc2626;
}

.text-muted {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.record-details {
  padding: 1rem 0;
}

.detail-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-row .label {
  font-weight: 600;
  color: #64748b;
  min-width: 150px;
}

.detail-row .value {
  color: #1e293b;
}

.cost-highlight {
  font-weight: 700;
  font-size: 1.1rem;
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .wastage-index {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-header button {
    width: 100%;
  }

  .filters {
    flex-direction: column;
  }

  .filter-dropdown,
  .filter-calendar {
    width: 100%;
  }
}
</style>
