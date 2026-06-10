<template>
  <div class="purchase-order-form">
    <!-- Steps Indicator -->
    <Steps :model="steps" :readonly="true" :active-index="activeStep" class="steps-nav" />

    <Card class="form-card">
      <template #content>
        <!-- Step 1: PO Details -->
        <div v-show="activeStep === 0" class="form-step">
          <h3 class="step-title">Purchase Order Details</h3>

          <div class="form-grid">
            <div class="form-field">
              <label for="supplier">Supplier <span class="required">*</span></label>
              <Dropdown
                id="supplier"
                v-model="formData.supplier_id"
                :options="supplierOptions"
                option-label="name"
                option-value="id"
                placeholder="Select a supplier"
                filter
                :class="{ 'p-invalid': errors.supplier_id }"
                :disabled="isEdit"
              />
              <small v-if="errors.supplier_id" class="p-error">{{ errors.supplier_id }}</small>
            </div>

            <div class="form-field">
              <label for="orderDate">Order Date <span class="required">*</span></label>
              <Calendar
                id="orderDate"
                v-model="formData.order_date"
                date-format="yy-mm-dd"
                show-icon
                :max-date="new Date()"
                :class="{ 'p-invalid': errors.order_date }"
              />
              <small v-if="errors.order_date" class="p-error">{{ errors.order_date }}</small>
            </div>

            <div class="form-field">
              <label for="expectedDate">Expected Delivery Date</label>
              <Calendar
                id="expectedDate"
                v-model="formData.expected_date"
                date-format="yy-mm-dd"
                show-icon
                :min-date="formData.order_date || new Date()"
              />
            </div>

            <div class="form-field full-width">
              <label for="notes">Notes</label>
              <Textarea
                id="notes"
                v-model="formData.notes"
                rows="3"
                placeholder="Enter any additional notes..."
              />
            </div>
          </div>
        </div>

        <!-- Step 2: Add Items -->
        <div v-show="activeStep === 1" class="form-step">
          <h3 class="step-title">Add Items</h3>

          <!-- Item Input Form -->
          <div class="item-input-section">
            <div class="item-input-grid">
              <div class="form-field">
                <label for="material">Raw Material <span class="required">*</span></label>
                <Dropdown
                  id="material"
                  v-model="currentItem.raw_material_id"
                  :options="rawMaterialOptions"
                  option-label="name"
                  option-value="id"
                  placeholder="Select raw material"
                  filter
                  @change="onMaterialSelect"
                />
              </div>

              <div class="form-field">
                <label for="quantity">Quantity <span class="required">*</span></label>
                <InputNumber
                  id="quantity"
                  v-model="currentItem.quantity"
                  :min="0.01"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  :suffix="currentItem.unit ? ' ' + currentItem.unit : ''"
                  placeholder="0.00"
                />
              </div>

              <div class="form-field">
                <!-- Last purchase price hint -->
                <small v-if="lastPriceInfo" class="last-price-hint">
                  Last purchase: <strong>{{ formatCurrency(lastPriceInfo.last_unit_cost) }}</strong>
                </small>
                <label for="unitCost">Unit Cost (LKR) <span class="required">*</span></label>
                <InputNumber
                  id="unitCost"
                  v-model="currentItem.unit_cost"
                  mode="currency"
                  currency="LKR"
                  locale="en-LK"
                  :min="0.01"
                  :min-fraction-digits="2"
                  placeholder="0.00"
                />
              </div>

              <div class="form-field">
                <label>Total Cost</label>
                <div class="total-cost-display">
                  {{ formatCurrency(currentItem.quantity * currentItem.unit_cost || 0) }}
                </div>
              </div>

              <div class="form-field add-button-field">
                <Button
                  label="Add Item"
                  icon="pi pi-plus"
                  class="p-button-success"
                  :disabled="!canAddItem"
                  @click="addItem"
                />
              </div>
            </div>
          </div>

          <Divider />

          <!-- Items Table -->
          <div class="items-table-section">
            <h4>Items List</h4>
            <DataTable
              v-if="formData.items.length > 0"
              :value="formData.items"
              responsive-layout="scroll"
              class="p-datatable-sm"
            >
              <Column field="material_name" header="Material" style="min-width: 200px">
                <template #body="{ data }">
                  <div class="material-cell">
                    <div class="material-name">
                      {{ data.material_name }}
                    </div>
                    <div class="material-code">
                      {{ data.material_code }}
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="quantity" header="Quantity" style="min-width: 120px">
                <template #body="{ data }">
                  {{ formatNumber(data.quantity) }} {{ data.unit }}
                </template>
              </Column>

              <Column field="unit_cost" header="Unit Cost" style="min-width: 120px">
                <template #body="{ data }">
                  {{ formatCurrency(data.unit_cost) }}
                </template>
              </Column>

              <Column field="total_cost" header="Total Cost" style="min-width: 120px">
                <template #body="{ data }">
                  <span class="total-cost">{{ formatCurrency(data.total_cost) }}</span>
                </template>
              </Column>

              <Column header="Actions" style="min-width: 80px">
                <template #body="{ index }">
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-danger p-button-sm"
                    @click="removeItem(index)"
                  />
                </template>
              </Column>
            </DataTable>

            <div v-else class="empty-items">
              <i class="pi pi-inbox" />
              <p>No items added yet. Add items using the form above.</p>
            </div>

            <small v-if="errors.items" class="p-error">{{ errors.items }}</small>
          </div>
        </div>

        <!-- Step 3: Review -->
        <div v-show="activeStep === 2" class="form-step">
          <h3 class="step-title">Review Purchase Order</h3>

          <div class="review-section">
            <!-- PO Details -->
            <div class="review-block">
              <h4>Purchase Order Details</h4>
              <div class="review-grid">
                <div class="review-item">
                  <span class="review-label">Supplier:</span>
                  <span class="review-value">{{ getSupplierName(formData.supplier_id) }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Order Date:</span>
                  <span class="review-value">{{ formatDate(formData.order_date) }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Expected Delivery:</span>
                  <span class="review-value">
                    {{
                      formData.expected_date ? formatDate(formData.expected_date) : 'Not specified'
                    }}
                  </span>
                </div>
                <div v-if="formData.notes" class="review-item full-width">
                  <span class="review-label">Notes:</span>
                  <span class="review-value">{{ formData.notes }}</span>
                </div>
              </div>
            </div>

            <Divider />

            <!-- Items Summary -->
            <div class="review-block">
              <h4>Items ({{ formData.items.length }})</h4>
              <DataTable
                :value="formData.items"
                responsive-layout="scroll"
                class="p-datatable-sm review-table"
              >
                <Column field="material_name" header="Material" style="min-width: 200px" />
                <Column field="quantity" header="Quantity" style="min-width: 120px">
                  <template #body="{ data }">
                    {{ formatNumber(data.quantity) }} {{ data.unit }}
                  </template>
                </Column>
                <Column field="unit_cost" header="Unit Cost" style="min-width: 120px">
                  <template #body="{ data }">
                    {{ formatCurrency(data.unit_cost) }}
                  </template>
                </Column>
                <Column field="total_cost" header="Total Cost" style="min-width: 120px">
                  <template #body="{ data }">
                    <span class="total-cost">{{ formatCurrency(data.total_cost) }}</span>
                  </template>
                </Column>
              </DataTable>
            </div>

            <Divider />

            <!-- Total Summary -->
            <div class="total-summary">
              <div class="total-row">
                <span class="total-label">Total Amount:</span>
                <span class="total-value">{{ formatCurrency(totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="form-actions">
          <Button
            v-if="activeStep > 0"
            label="Back"
            icon="pi pi-arrow-left"
            class="p-button-text"
            :disabled="loading"
            @click="prevStep"
          />
          <div class="spacer" />
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text p-button-secondary"
            :disabled="loading"
            @click="$emit('cancel')"
          />
          <Button
            v-if="activeStep < 2"
            label="Next"
            icon="pi pi-arrow-right"
            class="p-button-success"
            icon-pos="right"
            @click="nextStep"
          />
          <Button
            v-else
            :label="isEdit ? 'Update Purchase Order' : 'Create Purchase Order'"
            icon="pi pi-check"
            class="p-button-success"
            :loading="loading"
            @click="handleSubmit"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { useSupplierStore } from '@/stores/supplier';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'cancel']);

const supplierStore = useSupplierStore();
const rawMaterialStore = useRawMaterialStore();
const toast = useToast();
const activeStep = ref(0);
const errors = ref({});

const steps = [{ label: 'PO Details' }, { label: 'Add Items' }, { label: 'Review' }];

const formData = reactive({
  supplier_id: null,
  order_date: new Date(),
  expected_date: new Date(),
  notes: '',
  items: [],
});

const currentItem = reactive({
  raw_material_id: null,
  material_code: '',
  material_name: '',
  quantity: 0,
  unit: '',
  unit_cost: 0,
});

// Tracks last-price info for the currently selected material
const lastPriceInfo = ref(null);

const supplierOptions = computed(() => supplierStore.suppliers);
const rawMaterialOptions = computed(() => rawMaterialStore.rawMaterials);

const canAddItem = computed(() => {
  return currentItem.raw_material_id && currentItem.quantity > 0 && currentItem.unit_cost > 0;
});

const totalAmount = computed(() => {
  return formData.items.reduce((sum, item) => sum + item.total_cost, 0);
});



const onMaterialSelect = () => {
  if (!rawMaterialOptions.value || !Array.isArray(rawMaterialOptions.value)) {
    return;
  }
  const material = rawMaterialOptions.value.find(m => m.id === currentItem.raw_material_id);
  if (material) {
    currentItem.material_code = material.code || material.material_code;
    currentItem.material_name = material.name;
    currentItem.unit = material.unit;

    // Pre-fill unit cost with last purchase price if available
    if (material.last_unit_cost != null && material.last_unit_cost > 0) {
      currentItem.unit_cost = material.last_unit_cost;
      lastPriceInfo.value = {
        last_unit_cost: material.last_unit_cost,
        last_purchase_date: material.last_purchase_date,
        average_cost: material.average_cost,
      };
    } else {
      currentItem.unit_cost = 0;
      lastPriceInfo.value = null;
    }
  }
};

const addItem = () => {
  if (!canAddItem.value) return;

  // Check if material already exists
  const existingIndex = formData.items.findIndex(
    item => item.raw_material_id === currentItem.raw_material_id
  );

  if (existingIndex >= 0) {
    // Material already exists - increase quantity
    const existingItem = formData.items[existingIndex];
    existingItem.quantity += currentItem.quantity;
    existingItem.total_cost = existingItem.quantity * existingItem.unit_cost;

    // Show toast notification
    toast.add({
      severity: 'info',
      summary: 'Quantity Updated',
      detail: `${existingItem.material_name} quantity increased to ${existingItem.quantity} ${existingItem.unit}`,
      life: 2000,
    });
  } else {
    // Add new item
    const newItem = {
      raw_material_id: currentItem.raw_material_id,
      material_code: currentItem.material_code,
      material_name: currentItem.material_name,
      quantity: currentItem.quantity,
      unit: currentItem.unit,
      unit_cost: currentItem.unit_cost,
      total_cost: currentItem.quantity * currentItem.unit_cost,
    };
    formData.items.push(newItem);
  }

  // Reset current item
  currentItem.raw_material_id = null;
  currentItem.material_code = '';
  currentItem.material_name = '';
  currentItem.quantity = 0;
  currentItem.unit = '';
  currentItem.unit_cost = 0;
  lastPriceInfo.value = null;
};

const removeItem = index => {
  formData.items.splice(index, 1);
};

const getSupplierName = supplierId => {
  if (!supplierOptions.value || !Array.isArray(supplierOptions.value)) {
    return 'Unknown';
  }
  const supplier = supplierOptions.value.find(s => s.id === supplierId);
  return supplier ? supplier.name : 'Unknown';
};

const validateStep = step => {
  errors.value = {};
  let isValid = true;

  if (step === 0) {
    if (!formData.supplier_id) {
      errors.value.supplier_id = 'Supplier is required';
      isValid = false;
    }
    if (!formData.order_date) {
      errors.value.order_date = 'Order date is required';
      isValid = false;
    }
  }

  if (step === 1) {
    if (formData.items.length === 0) {
      errors.value.items = 'At least one item is required';
      isValid = false;
    }
  }

  return isValid;
};

const nextStep = () => {
  if (validateStep(activeStep.value)) {
    activeStep.value++;
  }
};

const prevStep = () => {
  activeStep.value--;
};

const handleSubmit = () => {
  if (!validateStep(1)) return;

  const submitData = {
    supplier_id: formData.supplier_id,
    order_date: formatDateForAPI(formData.order_date),
    expected_date: formData.expected_date ? formatDateForAPI(formData.expected_date) : null,
    notes: formData.notes,
    items: formData.items.map(item => ({
      raw_material_id: item.raw_material_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    })),
  };

  emit('submit', submitData);
};

const formatDateForAPI = date => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initializeForm = () => {
  if (props.initialData) {
    formData.supplier_id = props.initialData.supplier_id;
    formData.order_date = new Date(props.initialData.order_date);
    formData.expected_date = props.initialData.expected_date
      ? new Date(props.initialData.expected_date)
      : null;
    formData.notes = props.initialData.notes || '';

    if (props.initialData.items) {
      formData.items = props.initialData.items.map(item => ({
        raw_material_id: item.material_id,
        material_code: item.material?.material_code || '',
        material_name: item.material?.name || '',
        quantity: parseFloat(item.quantity),
        unit: item.material?.unit || '',
        unit_cost: parseFloat(item.unit_cost),
        total_cost: parseFloat(item.quantity) * parseFloat(item.unit_cost),
      }));
    }
  }
};

onMounted(async () => {
  await Promise.all([
    supplierStore.fetchSuppliers({ page: 1, limit: 1000 }),
    rawMaterialStore.fetchRawMaterials({ page: 1, limit: 1000 }),
  ]);
  initializeForm();
});
</script>

<style scoped>
.purchase-order-form {
  max-width: 1000px;
  margin: 0 auto;
}

.steps-nav {
  margin-bottom: 24px;
}

.form-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-step {
  min-height: 400px;
}

.step-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.required {
  color: #e53e3e;
}

.item-input-section {
  background: #f7fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.item-input-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
}

.add-button-field {
  padding-top: 22px;
}

.total-cost-display {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #2563eb;
}

.items-table-section h4 {
  margin: 0 0 12px 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.material-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.material-name {
  font-weight: 600;
  color: #2d3748;
}

.material-code {
  font-size: 0.8rem;
  color: #718096;
  font-family: 'Courier New', monospace;
}

.total-cost {
  font-weight: 700;
  color: #2563eb;
  font-family: 'Courier New', monospace;
}

.empty-items {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.empty-items i {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 12px;
}

.review-section {
  background: #f7fafc;
  padding: 20px;
  border-radius: 8px;
}

.review-block h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.review-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-item.full-width {
  grid-column: 1 / -1;
}

.review-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.review-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 600;
}

.review-table {
  background: white;
  border-radius: 6px;
}

.total-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
  font-family: 'Courier New', monospace;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.spacer {
  flex: 1;
}

:deep(.p-steps .p-steps-item.p-highlight .p-steps-number) {
  background: #2563eb;
}

:deep(.p-inputnumber-input),
:deep(.p-calendar),
:deep(.p-dropdown) {
  width: 100%;
}

/* ── Last purchase price hint ── */
.last-price-hint {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 0.82rem;
}

.last-price-hint strong {
  color: #1e40af;
}
</style>
