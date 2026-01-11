<template>
  <div class="receive-po-dialog">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <p>Loading purchase order details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e53e3e" />
      <p style="color: #e53e3e; margin-top: 12px">
        {{ error }}
      </p>
    </div>

    <!-- Receive Form -->
    <div v-else class="receive-content">
      <!-- PO Summary -->
      <div class="po-summary">
        <div class="summary-row">
          <span class="label">PO Number:</span>
          <span class="value po-number">{{ purchaseOrder?.po_number }}</span>
        </div>
        <div class="summary-row">
          <span class="label">Supplier:</span>
          <span class="value">{{ purchaseOrder?.Supplier?.name }}</span>
        </div>
        <div class="summary-row">
          <span class="label">Order Date:</span>
          <span class="value">{{ formatDate(purchaseOrder?.order_date) }}</span>
        </div>
      </div>

      <!-- Received Date -->
      <div class="form-field">
        <label for="received_date">Received Date <span class="required">*</span></label>
        <Calendar
          id="received_date"
          v-model="formData.received_date"
          date-format="yy-mm-dd"
          show-icon
          :max-date="new Date()"
          placeholder="Select received date"
          :class="{ 'p-invalid': errors.received_date }"
        />
        <small v-if="errors.received_date" class="p-error">{{ errors.received_date }}</small>
      </div>

      <TabView v-model:active-index="activeTab" class="receive-tabs">
        <!-- Receive Items Tab -->
        <TabPanel header="Receive Items">
          <div class="items-section">
            <h4>Items to Receive</h4>
            <div class="items-table">
              <DataTable :value="formData.received_items" responsive-layout="scroll">
                <Column field="material_name" header="Material">
                  <template #body="{ data }">
                    <div class="material-cell">
                      <span class="material-name">{{ data.material_name }}</span>
                      <span class="material-code">{{ data.material_code }}</span>
                    </div>
                  </template>
                </Column>
                <Column field="ordered_quantity" header="Ordered Qty">
                  <template #body="{ data }">
                    <span class="ordered-qty"
                      >{{ formatNumber(data.ordered_quantity) }} {{ data.unit }}</span
                    >
                  </template>
                </Column>
                <Column field="quantity_received" header="Received Qty">
                  <template #body="{ data }">
                    <InputNumber
                      v-model="data.quantity_received"
                      :min="0.01"
                      :max="data.ordered_quantity * 1.1"
                      :min-fraction-digits="2"
                      :max-fraction-digits="2"
                      :suffix="' ' + data.unit"
                      :class="{ 'p-invalid': data.error }"
                      class="quantity-input"
                      @input="validateItem(data)"
                    />
                  </template>
                </Column>
                <Column field="expiry_date" header="Expiry Date">
                  <template #body="{ data }">
                    <Calendar
                      v-model="data.expiry_date"
                      date-format="yy-mm-dd"
                      show-icon
                      :min-date="new Date()"
                      placeholder="Select expiry date"
                      :class="{ 'p-invalid': data.error }"
                      @date-select="validateItem(data)"
                    />
                    <small v-if="data.expiryWarning" class="expiry-warning">
                      <i class="pi pi-exclamation-triangle" /> Expiry date is in the past or very
                      soon
                    </small>
                  </template>
                </Column>
              </DataTable>
            </div>
            <small v-if="errors.items" class="p-error">{{ errors.items }}</small>
          </div>
        </TabPanel>

        <!-- Return Items Tab -->
        <TabPanel header="Return Items">
          <div class="returns-section">
            <!-- Add Return Item Form -->
            <div class="add-return-form">
              <h4>Add Return Item</h4>
              <div class="form-grid">
                <div class="form-field">
                  <label>Material <span class="required">*</span></label>
                  <Dropdown
                    v-model="currentReturn.raw_material_id"
                    :options="availableMaterials"
                    option-label="label"
                    option-value="value"
                    placeholder="Select material"
                    @change="onReturnMaterialSelect"
                  />
                </div>
                <div class="form-field">
                  <label>Quantity Returned <span class="required">*</span></label>
                  <InputNumber
                    v-model="currentReturn.quantity_returned"
                    :min="0.01"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                    :suffix="currentReturn.unit ? ' ' + currentReturn.unit : ''"
                    placeholder="Enter quantity"
                  />
                </div>
                <div class="form-field">
                  <label>Return Reason <span class="required">*</span></label>
                  <Dropdown
                    v-model="currentReturn.return_reason"
                    :options="returnReasons"
                    option-label="label"
                    option-value="value"
                    placeholder="Select reason"
                  />
                </div>
                <div class="form-field">
                  <label>Disposition <span class="required">*</span></label>
                  <Dropdown
                    v-model="currentReturn.disposition"
                    :options="dispositionOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Select disposition"
                  />
                </div>
                <div class="form-field">
                  <label>Expiry Date</label>
                  <Calendar
                    v-model="currentReturn.expiry_date"
                    date-format="yy-mm-dd"
                    show-icon
                    placeholder="Select expiry date (optional)"
                  />
                </div>
                <div class="form-field add-btn-field">
                  <Button
                    label="Add Return"
                    icon="pi pi-plus"
                    class="p-button-outlined"
                    :disabled="!canAddReturn"
                    @click="addReturnItem"
                  />
                </div>
              </div>
            </div>

            <!-- Return Items List -->
            <div class="return-items-list">
              <h4>Return Items</h4>
              <DataTable
                v-if="formData.return_items.length > 0"
                :value="formData.return_items"
                responsive-layout="scroll"
              >
                <Column field="material_name" header="Material">
                  <template #body="{ data }">
                    <div class="material-cell">
                      <span class="material-name">{{ data.material_name }}</span>
                      <span class="material-code">{{ data.material_code }}</span>
                    </div>
                  </template>
                </Column>
                <Column field="quantity_returned" header="Quantity">
                  <template #body="{ data }">
                    <span class="return-qty"
                      >{{ formatNumber(data.quantity_returned) }} {{ data.unit }}</span
                    >
                  </template>
                </Column>
                <Column field="return_reason" header="Reason">
                  <template #body="{ data }">
                    <Tag :value="getReasonLabel(data.return_reason)" severity="warning" />
                  </template>
                </Column>
                <Column field="disposition" header="Disposition">
                  <template #body="{ data }">
                    <Tag
                      :value="data.disposition === 'stock' ? 'Return to Stock' : 'Dispose'"
                      :severity="data.disposition === 'stock' ? 'info' : 'danger'"
                    />
                  </template>
                </Column>
                <Column header="Actions">
                  <template #body="{ index }">
                    <Button
                      icon="pi pi-trash"
                      class="p-button-text p-button-danger p-button-sm"
                      @click="removeReturnItem(index)"
                    />
                  </template>
                </Column>
              </DataTable>
              <div v-else class="empty-state">
                <i class="pi pi-inbox" style="font-size: 2rem; color: #cbd5e0" />
                <p style="margin-top: 12px; color: #718096">No return items added</p>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>

      <!-- Summary -->
      <div class="receive-summary">
        <div class="summary-item">
          <span class="summary-label">Total Items to Receive:</span>
          <span class="summary-value">{{ formData.received_items.length }}</span>
        </div>
        <div v-if="formData.return_items.length > 0" class="summary-item">
          <span class="summary-label">Total Returns:</span>
          <span class="summary-value">{{ formData.return_items.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Amount:</span>
          <span class="summary-value amount">{{
            formatCurrency(purchaseOrder?.total_amount)
          }}</span>
        </div>
        <div v-if="formData.return_items.length > 0" class="summary-item">
          <span class="summary-label">Return Amount:</span>
          <span class="summary-value amount warning"
            >-{{ formatCurrency(calculateReturnAmount()) }}</span
          >
        </div>
        <div v-if="formData.return_items.length > 0" class="summary-item">
          <span class="summary-label">Net Amount:</span>
          <span class="summary-value amount bold">{{
            formatCurrency((purchaseOrder?.total_amount || 0) - calculateReturnAmount())
          }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          :disabled="submitting"
          @click="$emit('cancel')"
        />
        <Button
          label="Receive Purchase Order"
          icon="pi pi-check"
          class="p-button-success"
          :loading="submitting"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePurchaseOrderStore } from '@/stores/purchaseOrder';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { computed, onMounted, reactive, ref } from 'vue';

const props = defineProps({
  purchaseOrderId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['cancel', 'success']);

const purchaseOrderStore = usePurchaseOrderStore();
const loading = ref(false);
const submitting = ref(false);
const error = ref(null);
const errors = ref({});
const activeTab = ref(0);

const purchaseOrder = computed(() => purchaseOrderStore.currentPurchaseOrder);

const formData = ref({
  received_date: new Date(),
  received_items: [],
  return_items: [],
});

const currentReturn = reactive({
  raw_material_id: null,
  material_code: '',
  material_name: '',
  quantity_returned: 0,
  unit: '',
  unit_cost: 0,
  return_reason: null,
  disposition: null,
  expiry_date: null,
});

const returnReasons = [
  { label: 'Damaged', value: 'damaged' },
  { label: 'Expired', value: 'expired' },
  { label: 'Excess', value: 'excess' },
  { label: 'Quality Issue', value: 'quality_issue' },
  { label: 'Wrong Item', value: 'wrong_item' },
  { label: 'Other', value: 'other' },
];

const dispositionOptions = [
  { label: 'Return to Stock', value: 'stock' },
  { label: 'Dispose', value: 'dispose' },
];

const availableMaterials = computed(() => {
  if (!purchaseOrder.value || !purchaseOrder.value.PoItems) {
    return [];
  }

  return purchaseOrder.value.PoItems.map(item => ({
    label: `${item.RawMaterial?.name} (${item.RawMaterial?.material_code})`,
    value: item.raw_material_id,
    material_code: item.RawMaterial?.material_code || 'N/A',
    material_name: item.RawMaterial?.name || 'Unknown',
    unit: item.RawMaterial?.unit || 'kg',
    unit_cost: parseFloat(item.unit_cost || 0),
  }));
});

const canAddReturn = computed(() => {
  return (
    currentReturn.raw_material_id &&
    currentReturn.quantity_returned > 0 &&
    currentReturn.return_reason &&
    currentReturn.disposition
  );
});

const initializeForm = () => {
  if (!purchaseOrder.value || !purchaseOrder.value.PoItems) {
    error.value = 'Purchase order data not found';
    return;
  }

  formData.value.received_items = purchaseOrder.value.PoItems.map(item => ({
    raw_material_id: item.raw_material_id,
    material_name: item.RawMaterial?.name || 'Unknown',
    material_code: item.RawMaterial?.material_code || 'N/A',
    unit: item.RawMaterial?.unit || 'kg',
    ordered_quantity: parseFloat(item.quantity),
    quantity_received: parseFloat(item.quantity), // Default to ordered quantity
    expiry_date: null,
    error: false,
    expiryWarning: false,
  }));

  formData.value.return_items = [];
};

const onReturnMaterialSelect = () => {
  const selected = availableMaterials.value.find(m => m.value === currentReturn.raw_material_id);
  if (selected) {
    currentReturn.material_code = selected.material_code;
    currentReturn.material_name = selected.material_name;
    currentReturn.unit = selected.unit;
    currentReturn.unit_cost = selected.unit_cost;
  }
};

const addReturnItem = () => {
  if (!canAddReturn.value) return;

  formData.value.return_items.push({
    raw_material_id: currentReturn.raw_material_id,
    material_code: currentReturn.material_code,
    material_name: currentReturn.material_name,
    quantity_returned: currentReturn.quantity_returned,
    unit: currentReturn.unit,
    unit_cost: currentReturn.unit_cost,
    return_reason: currentReturn.return_reason,
    disposition: currentReturn.disposition,
    expiry_date: currentReturn.expiry_date ? formatDateForAPI(currentReturn.expiry_date) : null,
  });

  // Reset form
  currentReturn.raw_material_id = null;
  currentReturn.material_code = '';
  currentReturn.material_name = '';
  currentReturn.quantity_returned = 0;
  currentReturn.unit = '';
  currentReturn.unit_cost = 0;
  currentReturn.return_reason = null;
  currentReturn.disposition = null;
  currentReturn.expiry_date = null;
};

const removeReturnItem = index => {
  formData.value.return_items.splice(index, 1);
};

const getReasonLabel = value => {
  const reason = returnReasons.find(r => r.value === value);
  return reason ? reason.label : value;
};

const calculateReturnAmount = () => {
  return formData.value.return_items.reduce((total, item) => {
    return total + item.quantity_returned * item.unit_cost;
  }, 0);
};

const validateItem = item => {
  item.error = false;
  item.expiryWarning = false;

  if (!item.quantity_received || item.quantity_received <= 0) {
    item.error = true;
  }

  if (item.expiry_date) {
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      item.expiryWarning = true;
    } else if (daysUntilExpiry < 30) {
      item.expiryWarning = true;
    }
  }
};

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!formData.value.received_date) {
    errors.value.received_date = 'Received date is required';
    isValid = false;
  }

  let hasInvalidItems = false;
  formData.value.received_items.forEach(item => {
    if (!item.quantity_received || item.quantity_received <= 0) {
      item.error = true;
      hasInvalidItems = true;
    }
    if (!item.expiry_date) {
      item.error = true;
      hasInvalidItems = true;
    }
  });

  if (hasInvalidItems) {
    errors.value.items = 'All items must have a valid received quantity and expiry date';
    isValid = false;
    activeTab.value = 0; // Switch to Receive Items tab to show errors
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    submitting.value = true;

    const receivedDate = formatDateForAPI(formData.value.received_date);
    const receivedItems = formData.value.received_items.map(item => ({
      raw_material_id: item.raw_material_id,
      quantity_received: item.quantity_received,
      expiry_date: formatDateForAPI(item.expiry_date),
    }));

    const payload = {
      received_date: receivedDate,
      received_items: receivedItems,
    };

    // Add return items if any
    if (formData.value.return_items.length > 0) {
      payload.return_items = formData.value.return_items.map(item => ({
        raw_material_id: item.raw_material_id,
        quantity_returned: item.quantity_returned,
        return_reason: item.return_reason,
        disposition: item.disposition,
        expiry_date: item.expiry_date,
      }));
    }

    await purchaseOrderStore.receivePurchaseOrder(props.purchaseOrderId, payload);

    emit('success');
  } catch (err) {
    error.value = err.message || 'Failed to receive purchase order';
  } finally {
    submitting.value = false;
  }
};

const formatDateForAPI = date => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

onMounted(() => {
  if (purchaseOrder.value) {
    initializeForm();
  }
});
</script>

<style scoped>
.receive-po-dialog {
  min-height: 400px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-state p {
  margin-top: 16px;
  color: #718096;
}

.po-summary {
  background: #f7fafc;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row .label {
  font-weight: 600;
  color: #4a5568;
}

.summary-row .value {
  color: #2d3748;
}

.po-number {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #2563eb;
}

.receive-form {
  margin-bottom: 20px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 6px;
}

.required {
  color: #e53e3e;
}

.receive-tabs {
  margin: 20px 0;
}

.items-section h4,
.returns-section h4,
.return-items-list h4,
.add-return-form h4 {
  margin: 0 0 12px 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.items-table {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
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

.ordered-qty,
.return-qty {
  font-weight: 600;
  color: #4a5568;
}

.quantity-input {
  width: 100%;
}

.expiry-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f59e0b;
  font-size: 0.8rem;
  margin-top: 4px;
}

/* Returns Section Styles */
.returns-section {
  padding: 10px 0;
}

.add-return-form {
  background: #f7fafc;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.add-btn-field {
  display: flex;
  align-items: flex-end;
}

.return-items-list {
  margin-top: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
}

.receive-summary {
  background: #f7fafc;
  padding: 16px;
  border-radius: 6px;
  margin-top: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.summary-label {
  font-weight: 600;
  color: #4a5568;
}

.summary-value {
  color: #2d3748;
  font-weight: 600;
}

.summary-value.amount {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  color: #2563eb;
}

.summary-value.amount.warning {
  color: #f59e0b;
}

.summary-value.amount.bold {
  font-size: 1.2rem;
  font-weight: 700;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

:deep(.p-inputnumber-input) {
  width: 100%;
}

:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-dropdown) {
  width: 100%;
}
</style>
