<template>
  <div class="payment-create">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <h1>Record Payment</h1>
      <p>Record payment from outlet and allocate to outstanding invoices</p>
    </div>

    <div class="form-container">
      <div class="p-fluid">
        <!-- Outlet Selection -->
        <div class="field">
          <label>Select Outlet <span class="required">*</span></label>
          <AutoComplete
            v-model="selectedOutlet"
            :suggestions="filteredOutletOptions"
            field="label"
            option-label="label"
            placeholder="Search and select outlet"
            class="w-full"
            @complete="onSearchOutlets"
            @item-select="onOutletSelect"
          >
            <template #option="slotProps">
              <div>
                <div class="font-semibold">
                  {{ slotProps.option.outlet.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ slotProps.option.outlet.code }} - {{ slotProps.option.outlet.address }}
                </div>
              </div>
            </template>
          </AutoComplete>
        </div>

        <!-- Payment Details -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label>Payment Date <span class="required">*</span></label>
              <Calendar
                v-model="paymentData.payment_date"
                date-format="yy-mm-dd"
                show-icon
                :max-date="new Date()"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label>Payment Method <span class="required">*</span></label>
              <Dropdown
                v-model="paymentData.payment_method"
                :options="paymentMethodOptions"
                placeholder="Select method"
              />
            </div>
          </div>
        </div>

        <!-- Check Details (if payment method is check) -->
        <div v-if="paymentData.payment_method === 'check'" class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label>Check Number <span class="required">*</span></label>
              <InputText v-model="paymentData.check_number" placeholder="Enter check number" />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label>Check Date <span class="required">*</span></label>
              <Calendar v-model="paymentData.check_date" date-format="yy-mm-dd" show-icon />
            </div>
          </div>
        </div>

        <!-- Reference & Notes -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label>Reference</label>
              <InputText v-model="paymentData.reference" placeholder="Payment reference" />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label>Total Payment Amount <span class="required">*</span></label>
              <InputNumber
                v-model="totalPaymentAmount"
                mode="currency"
                currency="LKR"
                locale="en-LK"
                :max="totalOutstanding || undefined"
                :disabled="!paymentData.outlet_id"
              />
            </div>
          </div>
        </div>

        <div class="field">
          <label>Notes</label>
          <Textarea v-model="paymentData.notes" rows="3" placeholder="Additional notes" />
        </div>

        <!-- Outstanding Invoices -->
        <div v-if="paymentData.outlet_id" class="invoices-section">
          <h3>Allocate Payment to Invoices</h3>
          <Message v-if="outstandingInvoices.length === 0" severity="info">
            No outstanding invoices for this outlet
          </Message>

          <DataTable
            v-else
            v-model:selection="selectedInvoices"
            :value="outstandingInvoices"
            data-key="id"
            show-gridlines
          >
            <Column selection-mode="multiple" header-style="width: 3rem" />
            <Column field="invoice_number" header="Invoice #" />
            <Column field="invoice_date" header="Date" />
            <Column header="Total Amount">
              <template #body="{ data }">
                Rs. {{ parseFloat(data.total_amount).toFixed(2) }}
              </template>
            </Column>
            <Column header="Paid Amount">
              <template #body="{ data }">
                Rs. {{ parseFloat(data.paid_amount || 0).toFixed(2) }}
              </template>
            </Column>
            <Column header="Outstanding">
              <template #body="{ data }">
                <strong>Rs. {{ parseFloat(data.outstanding_amount).toFixed(2) }}</strong>
              </template>
            </Column>
            <Column header="Allocate Amount">
              <template #body="{ data }">
                <InputNumber
                  v-model="allocations[data.id]"
                  mode="currency"
                  currency="LKR"
                  locale="en-LK"
                  :max="parseFloat(data.outstanding_amount)"
                  :min="0"
                  @input="calculateTotalAllocation"
                />
              </template>
            </Column>
          </DataTable>

          <div class="allocation-summary">
            <div class="summary-item">
              <span>Total Outstanding:</span>
              <strong>Rs. {{ totalOutstanding.toFixed(2) }}</strong>
            </div>
            <div class="summary-item">
              <span>Total Allocated:</span>
              <strong :class="{ 'text-danger': totalAllocated > totalPaymentAmount }">
                Rs. {{ totalAllocated.toFixed(2) }}
              </strong>
            </div>
            <div class="summary-item">
              <span>Payment Amount:</span>
              <strong>Rs. {{ totalPaymentAmount.toFixed(2) }}</strong>
            </div>
            <div v-if="totalPaymentAmount > totalAllocated" class="summary-item">
              <span>Unallocated:</span>
              <strong class="text-warning"
                >Rs. {{ (totalPaymentAmount - totalAllocated).toFixed(2) }}</strong
              >
            </div>
            <div v-if="totalPaymentAmount > totalOutstanding" class="validation-message">
              <Message severity="error">
                Payment amount exceeds total outstanding (Rs. {{ totalOutstanding.toFixed(2) }})
              </Message>
            </div>
            <div v-if="totalAllocated > totalPaymentAmount" class="validation-message">
              <Message severity="error"> Allocated amount exceeds payment amount </Message>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <Button label="Cancel" severity="secondary" @click="handleCancel" />
          <Button
            label="Record Payment"
            :loading="paymentStore.loading"
            :disabled="!isFormValid"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOutletStore } from '@/stores/outlet';
import { usePaymentStore } from '@/stores/payment';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const paymentStore = usePaymentStore();
const outletStore = useOutletStore();
const toast = useToast();

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
const breadcrumbItems = [{ label: 'Payments', to: '/payments' }, { label: 'Record Payment' }];

const paymentData = ref({
  outlet_id: null,
  payment_date: new Date(),
  payment_method: 'cash',
  check_number: null,
  check_date: null,
  reference: '',
  notes: '',
});

const paymentMethodOptions = ref(['cash', 'bank_transfer', 'check']);
const outstandingInvoices = ref([]);
const selectedInvoices = ref([]);
const allocations = ref({});
const totalPaymentAmount = ref(0);

// Outlet autocomplete
const selectedOutlet = ref(null);
const outletOptions = ref([]);
const filteredOutletOptions = ref([]);

const totalOutstanding = computed(() => {
  return outstandingInvoices.value.reduce(
    (sum, inv) => sum + parseFloat(inv.outstanding_amount || 0),
    0
  );
});

const totalAllocated = computed(() => {
  return Object.values(allocations.value).reduce((sum, amount) => sum + (amount || 0), 0);
});

const isFormValid = computed(() => {
  if (
    !paymentData.value.outlet_id ||
    !paymentData.value.payment_date ||
    !paymentData.value.payment_method
  ) {
    return false;
  }

  if (
    paymentData.value.payment_method === 'check' &&
    (!paymentData.value.check_number || !paymentData.value.check_date)
  ) {
    return false;
  }

  if (totalPaymentAmount.value <= 0) {
    return false;
  }

  if (totalPaymentAmount.value > totalOutstanding.value + 0.01) {
    return false;
  }

  if (totalAllocated.value > totalPaymentAmount.value + 0.01) {
    return false;
  }

  return Object.keys(allocations.value).some(id => allocations.value[id] > 0);
});

const onSearchOutlets = event => {
  const query = event.query.toLowerCase();
  if (!query) {
    filteredOutletOptions.value = outletOptions.value;
  } else {
    filteredOutletOptions.value = outletOptions.value.filter(outlet =>
      outlet.label.toLowerCase().includes(query)
    );
  }
};

const onOutletSelect = event => {
  if (event.value) {
    selectedOutlet.value = event.value;
    paymentData.value.outlet_id = event.value.value;
    loadOutstandingInvoices();
  }
};

const loadOutstandingInvoices = async () => {
  if (!paymentData.value.outlet_id) return;

  try {
    const response = await paymentStore.fetchOutstandingInvoices(paymentData.value.outlet_id);
    outstandingInvoices.value = response.invoices;
    allocations.value = {};
    selectedInvoices.value = [];
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load outstanding invoices',
      life: 3000,
    });
  }
};

const calculateTotalAllocation = () => {
  // Trigger reactivity
  totalAllocated.value;
};

const handleSubmit = async () => {
  const allocationArray = Object.entries(allocations.value)
    .filter(([_, amount]) => amount > 0)
    .map(([invoice_id, allocated_amount]) => ({
      invoice_id: parseInt(invoice_id),
      allocated_amount: parseFloat(allocated_amount),
    }));

  const submitData = {
    outlet_id: paymentData.value.outlet_id,
    payment_date: new Date(paymentData.value.payment_date).toISOString().split('T')[0],
    amount: totalPaymentAmount.value,
    payment_method: paymentData.value.payment_method,
    check_number: paymentData.value.check_number,
    check_date: paymentData.value.check_date
      ? new Date(paymentData.value.check_date).toISOString().split('T')[0]
      : null,
    reference: paymentData.value.reference,
    notes: paymentData.value.notes,
    allocations: allocationArray,
  };

  try {
    await paymentStore.createPayment(submitData);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Payment recorded successfully',
      life: 3000,
    });
    router.push('/payments');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to record payment',
      life: 3000,
    });
  }
};

const handleCancel = () => {
  router.push('/payments');
};

watch(selectedInvoices, newSelection => {
  // Auto-allocate when invoices are selected
  newSelection.forEach(invoice => {
    if (!allocations.value[invoice.id]) {
      allocations.value[invoice.id] = parseFloat(invoice.outstanding_amount);
    }
  });
});

onMounted(async () => {
  // Load all outlets for autocomplete
  const allOutlets = await outletStore.fetchAllOutlets();
  outletOptions.value = allOutlets.map(o => ({
    label: `${o.name} (${o.code})`,
    value: o.id,
    outlet: o,
  }));
  filteredOutletOptions.value = outletOptions.value;
});
</script>

<style scoped>
.payment-create {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.required {
  color: red;
}

.invoices-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.invoices-section h3 {
  margin-bottom: 1rem;
}

.allocation-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.text-danger {
  color: #dc3545;
}

.text-warning {
  color: #fd7e14;
}

.validation-message {
  margin-top: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}
</style>
