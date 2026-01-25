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
      <!-- Receive Form -->
      <div class="receive-form">
        <!-- PO Summary & Received Date - Optimized Grid -->
        <div class="po-summary-grid">
          <div class="summary-card">
            <span class="label">PO Number:</span>
            <span class="value po-number">{{ purchaseOrder?.po_number }}</span>
          </div>
          <div class="summary-card">
            <span class="label">Supplier:</span>
            <span class="value">{{ purchaseOrder?.supplier?.name }}</span>
          </div>
          <div class="summary-card flex-column">
            <span class="label">Order Date:</span>
            <span class="value">{{ formatDate(purchaseOrder?.order_date) }}</span>
          </div>
          <div class="summary-card flex-column form-field-inline">
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
        </div>
      </div>

      <TabView v-model:active-index="activeTab" class="receive-tabs">
        <!-- Receive Items Tab -->
        <TabPanel header="Receive Items">
          <div class="items-section">
            <h4>Items to Receive</h4>
            <div class="items-table">
              <DataTable
                :value="formData.received_items"
                responsive-layout="scroll"
                :row-class="item => ({ 'fully-received-row': item.isFullyReceived })"
              >
                <Column header="Receive?" style="width: 8%">
                  <template #body="{ data }">
                    <Checkbox
                      v-model="data.receive"
                      :binary="true"
                      :disabled="data.isFullyReceived"
                      class="receive-checkbox"
                    />
                  </template>
                </Column>
                <Column field="material_name" header="Material" style="width: 20%">
                  <template #body="{ data }">
                    <div class="material-cell">
                      <span class="material-name">{{ data.material_name }}</span>
                      <span class="material-code">{{ data.material_code }}</span>
                    </div>
                  </template>
                </Column>
                <Column field="ordered_quantity" header="Ordered Qty" style="width: 18%">
                  <template #body="{ data }">
                    <span class="ordered-qty"
                      >{{ formatNumber(data.ordered_quantity) }} {{ data.unit }}</span
                    >
                  </template>
                </Column>
                <Column field="quantity_received" header="Received Qty" style="width: 16%">
                  <template #body="{ data }">
                    <div class="quantity-input-group" :class="{ disabled: !data.receive }">
                      <InputNumber
                        v-model="data.quantity_received"
                        :min="0.01"
                        :max="data.quantity_to_receive"
                        :min-fraction-digits="2"
                        :max-fraction-digits="2"
                        :suffix="' ' + data.unit"
                        :class="{ 'p-invalid': data.error }"
                        class="quantity-input"
                        :disabled="!data.receive"
                        @input="validateItem(data)"
                      />
                      <small v-if="data.already_received > 0" class="quantity-hint">
                        {{ formatNumber(data.already_received) }} already received
                      </small>
                    </div>
                  </template>
                </Column>
                <Column field="expiry_date" header="Expiry Date" style="width: 27%">
                  <template #body="{ data }">
                    <Calendar
                      v-model="data.expiry_date"
                      date-format="yy-mm-dd"
                      show-icon
                      :min-date="new Date()"
                      placeholder="Select expiry date"
                      :class="{ 'p-invalid': data.error }"
                      :disabled="!data.receive"
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
                  <label>Source Batch <span class="required">*</span></label>
                  <Dropdown
                    v-model="currentReturn.source_batch_id"
                    :options="availableSourceBatches"
                    option-label="label"
                    option-value="value"
                    placeholder="Select batch to return from"
                    :disabled="!currentReturn.raw_material_id"
                  />
                  <small v-if="!currentReturn.raw_material_id" class="p-hint">
                    Select a material first to see available batches
                  </small>
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

        <!-- Payment Tab (Optional) -->
        <TabPanel header="Payment (Optional)">
          <div class="payment-section">
            <div class="payment-info">
              <i class="pi pi-info-circle" style="color: #3b82f6; margin-right: 8px" />
              <p>
                Optionally record a payment when receiving goods. You can also record payments later
                in the Supplier details page.
              </p>
            </div>

            <!-- Balance Display -->
            <div class="balance-display">
              <div class="balance-item">
                <span class="balance-label">PO Total Amount:</span>
                <span class="balance-value">{{ formatCurrency(purchaseOrder?.total_amount) }}</span>
              </div>
              <div class="balance-item">
                <span class="balance-label">Remaining Balance to Pay:</span>
                <span class="balance-value primary">{{ formatCurrency(remainingBalance) }}</span>
              </div>
              <div v-if="formData.payment.amount" class="balance-item highlight">
                <span class="balance-label">After Payment:</span>
                <span class="balance-value">{{ formatCurrency(balanceAfterPayment) }}</span>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label
                  >Payment Amount (Rs.)
                  <span v-if="paymentOverflow" class="warning-text">⚠ Overpayment</span></label
                >
                <InputNumber
                  v-model="formData.payment.amount"
                  :use-grouping="false"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  placeholder="0.00"
                  :class="{ 'p-invalid': paymentOverflow }"
                />

                <small v-if="paymentOverflow" class="p-error"
                  >Payment cannot exceed remaining balance ({{
                    formatCurrency(remainingBalance)
                  }})</small
                >
              </div>

              <div class="form-field">
                <label>Payment Method</label>
                <Dropdown
                  v-model="formData.payment.payment_method"
                  :options="paymentMethods"
                  option-label="label"
                  option-value="value"
                  placeholder="Select method"
                  :disabled="!formData.payment.amount"
                />
              </div>

              <div v-if="formData.payment.payment_method === 'check'" class="form-field">
                <label>Check Number</label>
                <InputText
                  v-model="formData.payment.check_number"
                  placeholder="Enter check number"
                  :disabled="!formData.payment.amount"
                />
              </div>

              <div v-if="formData.payment.payment_method === 'check'" class="form-field">
                <label>Check Date</label>
                <Calendar
                  v-model="formData.payment.check_date"
                  date-format="yy-mm-dd"
                  show-icon
                  placeholder="Select check date"
                  :disabled="!formData.payment.amount"
                />
              </div>

              <div class="form-field">
                <label>Reference/Notes</label>
                <InputText
                  v-model="formData.payment.reference"
                  placeholder="Enter reference or notes (optional)"
                  :disabled="!formData.payment.amount"
                />
              </div>
            </div>
            <small class="p-hint"
              >Leave blank to skip payment. Amount can be partial or full PO amount.</small
            >

            <div v-if="formData.payment.amount" class="payment-summary">
              <div class="summary-item">
                <span class="label">Payment Amount:</span>
                <span class="value">{{ formatCurrency(formData.payment.amount) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Payment Method:</span>
                <span class="value">{{
                  paymentMethods.find(m => m.value === formData.payment.payment_method)?.label
                }}</span>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>

      <!-- Summary -->
      <div class="receive-summary">
        <div class="summary-item">
          <span class="summary-label">Total Items to Receive:</span>
          <span class="summary-value"
            >{{ itemsToReceiveCount }} / {{ formData.received_items.length }}</span
          >
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
          :disabled="paymentOverflow"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePurchaseOrderStore } from '@/stores/purchaseOrder';
import { useSupplierStore } from '@/stores/supplier';
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
const supplierStore = useSupplierStore();
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
  payment: {
    amount: null,
    payment_method: 'cash',
    check_number: '',
    check_date: null,
    reference: '',
    notes: '',
  },
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
  source_batch_id: null,
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

const paymentMethods = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' },
  { label: 'Credit', value: 'credit' },
];

const availableMaterials = computed(() => {
  const items = purchaseOrder.value?.items;
  if (!purchaseOrder.value || !items) {
    return [];
  }

  return items.map(item => ({
    label: `${item.material?.name} (${item.material?.material_code})`,
    value: item.material_id,
    material_code: item.material?.material_code || 'N/A',
    material_name: item.material?.name || 'Unknown',
    unit: item.material?.unit || 'kg',
    unit_cost: parseFloat(item.unit_cost || 0),
  }));
});

const availableSourceBatches = computed(() => {
  // Get batches from the PO's received items (receipt batches only)
  const items = purchaseOrder.value?.items;
  if (!currentReturn.raw_material_id || !purchaseOrder.value || !items) {
    return [];
  }

  // Find all received items for this material from the PO
  const poItem = items.find(item => item.material_id === currentReturn.raw_material_id);

  if (!poItem || !poItem.material?.RawMaterialBatches) {
    return [];
  }

  // Filter for receipt batches only (not return batches)
  return poItem.material.RawMaterialBatches.filter(batch => batch.batch_type === 'receipt').map(
    batch => ({
      label: `${batch.batch_number} (${batch.quantity} ${poItem.material?.unit || 'kg'})`,
      value: batch.id,
    })
  );
});

const canAddReturn = computed(() => {
  return (
    currentReturn.raw_material_id &&
    currentReturn.source_batch_id &&
    currentReturn.quantity_returned > 0 &&
    currentReturn.return_reason &&
    currentReturn.disposition
  );
});

const itemsToReceiveCount = computed(() => {
  return formData.value.received_items.filter(item => item.receive).length;
});

// Calculate remaining balance for this specific PO
const remainingBalance = computed(() => {
  if (!purchaseOrder.value) return 0;

  // Balance = PO total amount (what still needs to be paid)
  return parseFloat(purchaseOrder.value.total_amount || 0);
});

// Calculate balance after proposed payment
const balanceAfterPayment = computed(() => {
  const payment = parseFloat(formData.value.payment.amount) || 0;
  return Math.max(0, remainingBalance.value - payment);
});

// Check if payment exceeds remaining balance
const paymentOverflow = computed(() => {
  const payment = parseFloat(formData.value.payment.amount) || 0;
  return payment > remainingBalance.value && payment > 0;
});

const initializeForm = () => {
  const items = purchaseOrder.value?.items;
  if (!purchaseOrder.value || !items || items.length === 0) {
    error.value = 'Purchase order has no items to receive';
    return;
  }

  // Calculate default expiry date (today + 365 days)
  const defaultExpiryDate = new Date();
  defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 365);

  formData.value.received_items = items.map(item => {
    const quantityToReceive = parseFloat(item.quantity) - parseFloat(item.received_quantity || 0);
    const isFullyReceived = quantityToReceive <= 0;

    return {
      raw_material_id: item.material_id,
      material_name: item.material?.name || 'Unknown',
      material_code: item.material?.material_code || 'N/A',
      unit: item.material?.unit || 'kg',
      ordered_quantity: parseFloat(item.quantity),
      already_received: parseFloat(item.received_quantity || 0), // Track what's already been received
      quantity_to_receive: quantityToReceive, // Remaining to receive
      quantity_received: isFullyReceived ? 0 : quantityToReceive, // Default to remaining, 0 if fully received
      expiry_date: defaultExpiryDate, // Auto-populate with today + 365 days
      error: false,
      expiryWarning: false,
      receive: !isFullyReceived, // Default: only include non-fully-received items
      isFullyReceived, // Track if fully received (for disabling checkbox)
    };
  });

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
    source_batch_id: currentReturn.source_batch_id,
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
  currentReturn.source_batch_id = null;
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

  // Validate quantity is received
  if (!item.quantity_received || item.quantity_received <= 0) {
    item.error = true;
  }

  // Validate quantity doesn't exceed remaining to receive
  if (item.quantity_received > item.quantity_to_receive) {
    item.error = true;
  }

  // Validate expiry date
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

  // Filter items that will actually be received (checkbox checked AND quantity > 0)
  const itemsToReceive = formData.value.received_items.filter(
    item => item.receive && parseFloat(item.quantity_received) > 0
  );

  // Require at least one item with quantity > 0
  if (itemsToReceive.length === 0) {
    errors.value.items = 'Please select and enter quantity for at least one item';
    isValid = false;
    activeTab.value = 0; // Switch to Receive Items tab
    return isValid;
  }

  let hasInvalidItems = false;
  let quantityErrors = [];

  // Validate only items that will be received
  itemsToReceive.forEach(item => {
    if (item.quantity_received > item.quantity_to_receive) {
      item.error = true;
      hasInvalidItems = true;
      quantityErrors.push(
        `Cannot receive ${formatNumber(item.quantity_received)}${item.unit} for ${item.material_name}. ` +
          `Already received ${formatNumber(item.already_received)}${item.unit} of ` +
          `${formatNumber(item.ordered_quantity)}${item.unit} ordered. ` +
          `Only ${formatNumber(item.quantity_to_receive)}${item.unit} remaining.`
      );
    }
    if (!item.expiry_date) {
      item.error = true;
      hasInvalidItems = true;
    }
  });

  if (hasInvalidItems) {
    if (quantityErrors.length > 0) {
      errors.value.items = quantityErrors.join(' | ');
    } else {
      errors.value.items = 'All received items must have an expiry date';
    }
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

    // Only include items that are checked AND have quantity > 0
    const receivedItems = formData.value.received_items
      .filter(item => item.receive && parseFloat(item.quantity_received) > 0)
      .map(item => ({
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
        source_batch_id: item.source_batch_id,
        expiry_date: item.expiry_date,
      }));
    }

    // Add payment if amount is provided
    if (formData.value.payment.amount) {
      payload.payment = {
        amount: parseFloat(formData.value.payment.amount),
        payment_method: formData.value.payment.payment_method,
        check_number: formData.value.payment.check_number || null,
        check_date: formData.value.payment.check_date
          ? formatDateForAPI(formData.value.payment.check_date)
          : null,
        reference: formData.value.payment.reference || null,
        notes: formData.value.payment.notes || null,
      };
    }

    await purchaseOrderStore.receivePurchaseOrder(props.purchaseOrderId, payload);

    // If payment was recorded, refresh supplier data so balance updates in SupplierView
    if (formData.value.payment.amount) {
      // Get supplier ID from the PO (could be supplier_id or supplier.id)
      const supplierId = purchaseOrder.value?.supplier_id || purchaseOrder.value?.supplier?.id;
      if (supplierId) {
        await supplierStore.fetchSupplierById(supplierId);
      }
    }

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

onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch the purchase order if not already loaded
    if (!purchaseOrder.value || purchaseOrder.value.id !== props.purchaseOrderId) {
      await purchaseOrderStore.fetchPurchaseOrderById(props.purchaseOrderId);
    }

    // Initialize form after PO is loaded
    if (purchaseOrder.value) {
      initializeForm();
    } else {
      error.value = 'Purchase order data not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load purchase order';
  } finally {
    loading.value = false;
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

.po-number {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #2563eb;
}

.receive-form {
  margin-bottom: 20px;
}

/* Optimized Grid Layout for PO Summary */
.po-summary-grid {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 12px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 6px;
}

.summary-card .label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.summary-card .value {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.95rem;
}

.summary-card .po-number {
  font-family: 'Courier New', monospace;
  color: #2563eb;
  font-size: 1rem;
}

.summary-card.form-field-inline {
  border-left-color: #10b981;
}

.summary-card.form-field-inline label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.summary-card.form-field-inline :deep(.p-calendar) {
  width: 100%;
  height: 32px;
}

.summary-card.form-field-inline :deep(.p-calendar .p-calendar-w) {
  width: 100%;
}

.summary-card.form-field-inline .p-error {
  display: block;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .po-summary-grid {
    grid-template-columns: 1fr;
  }
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
  margin: 20px 0 0 0;
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

.quantity-input-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quantity-hint {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
}

.expiry-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f59e0b;
  font-size: 0.8rem;
  margin-top: 4px;
}

/* Balance Display Styles */
.balance-display {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #0284c7;
}

.balance-item.highlight {
  background: #ecfdf5;
  border-left-color: #10b981;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.balance-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  font-family: 'Courier New', monospace;
}

.balance-value.primary {
  color: #0284c7;
  font-size: 1.4rem;
}

.warning-text {
  color: #ef4444;
  font-weight: 700;
  margin-left: 4px;
  font-size: 0.9rem;
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

.quantity-input-group.disabled {
  opacity: 0.6;
  pointer-events: none;
}

:deep(.fully-received-row) {
  opacity: 0.6;
  background-color: #f5f5f5;
}

:deep(.fully-received-row td) {
  color: #999;
}

.receive-checkbox {
  cursor: pointer;
}

/* Payment Section Styles */
.payment-section {
  padding: 10px 0;
}

.payment-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #eff6ff;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #3b82f6;
}

.payment-info p {
  margin: 0;
  color: #1e40af;
  font-size: 0.9rem;
}

.payment-summary {
  background: #f7fafc;
  padding: 16px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 4px solid #10b981;
}

.payment-summary .summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.payment-summary .summary-item .label {
  font-weight: 600;
  color: #4a5568;
}

.payment-summary .summary-item .value {
  font-weight: 600;
  color: #065f46;
  font-family: 'Courier New', monospace;
  font-size: 1.05rem;
}
</style>
