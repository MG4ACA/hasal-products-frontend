<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { supplierService } from '@/services/supplierService';
import { usePaymentStore } from '@/stores/payment';
import { useSupplierStore } from '@/stores/supplier';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const supplierStore = useSupplierStore();
const paymentStore = usePaymentStore();
const { showSuccess, showError } = useToastNotification();

const supplierId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);

// Payment form refs
const showPaymentDialog = ref(false);
const paymentForm = ref({
  supplier_id: null,
  payment_date: new Date().toISOString().split('T')[0],
  amount: null,
  payment_method: 'cash',
  purchase_order_id: null,
  check_number: '',
  check_date: '',
  reference: '',
  notes: '',
});
const isSubmitting = ref(false);
const supplierPOs = ref([]);
const loadingPOs = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'View' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Payment method options
const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' },
  { label: 'Credit', value: 'credit' },
];

// Load supplier data
onMounted(async () => {
  try {
    isLoading.value = true;
    await supplierStore.fetchSupplierById(supplierId.value);
    await paymentStore.fetchSupplierPaymentsBySupplierId(supplierId.value);

    if (!supplierStore.currentSupplier) {
      notFound.value = true;
      showError('Supplier not found');
    } else {
      // Update breadcrumb with supplier name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Suppliers', to: '/suppliers' },
        { label: supplierStore.currentSupplier.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load supplier:', error);
    notFound.value = true;
    showError('Failed to load supplier details');
  } finally {
    isLoading.value = false;
  }
});

// Handle edit button
const handleEdit = () => {
  router.push(`/suppliers/${supplierId.value}/edit`);
};

// Handle back button
const handleBack = () => {
  router.push('/suppliers');
};

// Open payment dialog
const openPaymentDialog = async () => {
  paymentForm.value = {
    supplier_id: parseInt(supplierId.value),
    payment_date: new Date().toISOString().split('T')[0],
    amount: null,
    payment_method: 'cash',
    purchase_order_id: null,
    check_number: '',
    check_date: '',
    reference: '',
    notes: '',
  };
  showPaymentDialog.value = true;

  // Fetch POs for this supplier
  await fetchSupplierPOs();
};

// Fetch purchase orders for supplier
const fetchSupplierPOs = async () => {
  loadingPOs.value = true;
  try {
    // Use already-loaded POs from supplier data which now includes balance
    const purchaseOrders = supplierStore.currentSupplier?.purchaseOrders || [];

    supplierPOs.value = purchaseOrders.map(po => ({
      // label: `PO #${po.po_number} - Total: Rs. ${parseFloat(po.total_amount).toLocaleString()} | Balance: Rs. ${parseFloat(po.balance || 0).toLocaleString()}`,
      label: `PO #${po.po_number}  |  Balance: Rs. ${parseFloat(po.balance || 0).toLocaleString()}`,
      value: po.id,
      poNumber: po.po_number,
      totalAmount: po.total_amount,
      balance: po.balance || 0,
      status: po.status,
    }));
  } catch (error) {
    console.error('Error fetching POs:', error);
    supplierPOs.value = [];
  } finally {
    loadingPOs.value = false;
  }
};

// Check if check fields are required
const isCheckPayment = computed(() => paymentForm.value.payment_method === 'check');

// Submit payment
const submitPayment = async () => {
  // Validation
  if (!paymentForm.value.amount || paymentForm.value.amount <= 0) {
    showError('Please enter a valid amount');
    return;
  }

  if (isCheckPayment.value) {
    if (!paymentForm.value.check_number || !paymentForm.value.check_date) {
      showError('Check number and date are required for check payments');
      return;
    }
  }

  try {
    isSubmitting.value = true;

    // Prepare payment data with proper types
    const paymentData = {
      ...paymentForm.value,
      amount: parseFloat(paymentForm.value.amount),
      supplier_id: parseInt(paymentForm.value.supplier_id),
    };

    await paymentStore.createSupplierPayment(supplierId.value, paymentData);
    showSuccess('Payment recorded successfully');
    showPaymentDialog.value = false;

    // Refresh payment history
    await paymentStore.fetchSupplierPaymentsBySupplierId(supplierId.value);
    // Refresh supplier data to get updated balance
    await supplierStore.fetchSupplierById(supplierId.value);
  } catch (error) {
    showError(error.message || 'Failed to record payment');
  } finally {
    isSubmitting.value = false;
  }
};

// Delete payment
const deletePayment = async paymentId => {
  if (!confirm('Are you sure you want to delete this payment?')) return;

  try {
    await paymentStore.deleteSupplierPayment(supplierId.value, paymentId);
    showSuccess('Payment deleted successfully');

    // Refresh payment history
    await paymentStore.fetchSupplierPaymentsBySupplierId(supplierId.value);
    // Refresh supplier data to get updated balance
    await supplierStore.fetchSupplierById(supplierId.value);
  } catch (error) {
    showError(error.message || 'Failed to delete payment');
  }
};

// Get payment method label
const getPaymentMethodLabel = method => {
  const methods = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    check: 'Check',
    credit: 'Credit',
  };
  return methods[method] || method;
};

// Get payment status label
const getPaymentStatusLabel = status => {
  const labels = {
    pending: 'Pending',
    cleared: 'Cleared',
    cancelled: 'Cancelled',
    bounced: 'Bounced',
  };
  return labels[status] || status;
};

// Get payment status severity for Tag component
const getPaymentStatusSeverity = status => {
  const severities = {
    pending: 'warning',
    cleared: 'success',
    cancelled: 'danger',
    bounced: 'danger',
  };
  return severities[status] || 'info';
};

// Clear Payment functionality
const showClearDialog = ref(false);
const selectedPayment = ref(null);
const clearanceDate = ref(new Date());
const clearingPayment = ref(false);

const openClearPaymentDialog = payment => {
  selectedPayment.value = payment;
  // Set default clearance date to today, but not before payment date or check date
  const minDate = getClearanceMinDate();
  clearanceDate.value = new Date() >= minDate ? new Date() : minDate;
  showClearDialog.value = true;
};

const closeClearDialog = () => {
  showClearDialog.value = false;
  selectedPayment.value = null;
  clearanceDate.value = new Date();
};

const getClearanceMinDate = () => {
  if (!selectedPayment.value) return new Date();

  // Clearance date must be >= payment_date and >= check_date (if check)
  const paymentDate = new Date(selectedPayment.value.payment_date);
  const checkDate = selectedPayment.value.check_date
    ? new Date(selectedPayment.value.check_date)
    : paymentDate;

  return paymentDate > checkDate ? paymentDate : checkDate;
};

const clearPayment = async () => {
  if (!clearanceDate.value) {
    showError('Please select a clearance date');
    return;
  }

  try {
    clearingPayment.value = true;

    // Format date as YYYY-MM-DD
    const formattedDate = clearanceDate.value.toISOString().split('T')[0];

    await supplierService.clearSupplierPayment(
      supplierId.value,
      selectedPayment.value.id,
      formattedDate
    );

    showSuccess('Payment cleared successfully');
    closeClearDialog();

    // Refresh data
    await paymentStore.fetchSupplierPaymentsBySupplierId(supplierId.value);
    await supplierStore.fetchSupplierById(supplierId.value);
  } catch (error) {
    showError(error.message || 'Failed to clear payment');
  } finally {
    clearingPayment.value = false;
  }
};
</script>

<template>
  <div class="supplier-view">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading supplier details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Supplier Not Found</h2>
      <p>The supplier you're looking for doesn't exist or has been deleted.</p>
      <Button label="Back to Suppliers" icon="pi pi-arrow-left" @click="handleBack" />
    </div>

    <!-- Supplier Details -->
    <template v-else>
      <!-- Page Header with Actions -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>{{ supplierStore.currentSupplier?.name }}</h1>
            <p>Supplier Details & Information</p>
            <div class="supplier-code">
              <span class="code-label">Code:</span>
              <span class="code-value">{{ supplierStore.currentSupplier?.code }}</span>
              <span class="status-badge" :class="supplierStore.currentSupplier?.status">
                {{ supplierStore.currentSupplier?.status }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <Button label="Edit" icon="pi pi-pencil" severity="primary" @click="handleEdit" />
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="handleBack" />
          </div>
        </div>
      </div>

      <!-- Supplier Information Cards -->
      <div class="info-grid">
        <!-- Contact Information -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-phone" />
            <h3>Contact Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Contact Person:</span>
              <span class="value">{{ supplierStore.currentSupplier?.contact_person || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">{{ supplierStore.currentSupplier?.phone || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ supplierStore.currentSupplier?.email || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Address:</span>
              <span class="value">{{ supplierStore.currentSupplier?.address || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Terms -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-credit-card" />
            <h3>Payment Terms</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Payment Terms:</span>
              <span class="value payment-terms">{{
                supplierStore.currentSupplier?.payment_terms
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">Current Balance:</span>
              <span
                class="value balance"
                :class="{ negative: (supplierStore.currentSupplier?.balance || 0) < 0 }"
              >
                Rs.
                {{
                  (supplierStore.currentSupplier?.balance || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Purchase Orders Section -->
      <div class="purchase-orders-section">
        <div class="section-header">
          <h2>Recent Purchase Orders</h2>
          <span class="order-count"
            >{{ supplierStore.currentSupplier?.purchaseOrders?.length || 0 }} orders</span
          >
        </div>

        <div v-if="supplierStore.currentSupplier?.purchaseOrders?.length" class="table-container">
          <DataTable
            :value="supplierStore.currentSupplier.purchaseOrders"
            :paginator="true"
            :rows="5"
            responsive-layout="scroll"
            style-class="p-datatable-striped"
          >
            <Column field="id" header="PO ID" style="width: 10%">
              <template #body="{ data }">
                <span class="po-id">#{{ data.id }}</span>
              </template>
            </Column>
            <Column field="po_number" header="PO Number" style="width: 15%" />
            <Column field="order_date" header="Date" style="width: 15%">
              <template #body="{ data }">
                {{ new Date(data.order_date).toLocaleDateString() }}
              </template>
            </Column>
            <Column field="status" header="Status" style="width: 15%">
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="
                    {
                      draft: 'secondary',
                      approved: 'info',
                      received: 'success',
                      cancelled: 'danger',
                    }[data.status]
                  "
                />
              </template>
            </Column>
            <Column field="total_amount" header="Amount" style="width: 15%">
              <template #body="{ data }">
                Rs.
                {{
                  data.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'
                }}
              </template>
            </Column>
            <Column header="Action" style="width: 15%">
              <template #body="{ data }">
                <router-link :to="`/purchase-orders/${data.id}/view`" class="action-link">
                  <i class="pi pi-eye" /> View
                </router-link>
              </template>
            </Column>
          </DataTable>
        </div>

        <div v-else class="no-data-message">
          <i class="pi pi-inbox" />
          <p>No purchase orders found for this supplier</p>
        </div>
      </div>

      <!-- Payment History Section -->
      <div class="payment-history-section">
        <div class="section-header">
          <h2>Payment History</h2>
          <Button
            label="Record Payment"
            icon="pi pi-plus"
            severity="success"
            :disabled="parseFloat(supplierStore.currentSupplier?.balance || 0) === 0"
            @click="openPaymentDialog"
          />
        </div>

        <div v-if="paymentStore.supplierPayments?.length" class="table-container">
          <DataTable
            :value="paymentStore.supplierPayments"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            style-class="p-datatable-striped"
          >
            <Column field="payment_date" header="Date" style="width: 12%">
              <template #body="{ data }">
                {{ new Date(data.payment_date).toLocaleDateString() }}
              </template>
            </Column>
            <Column field="payment_method" header="Method" style="width: 12%">
              <template #body="{ data }">
                <Tag :value="getPaymentMethodLabel(data.payment_method)" />
              </template>
            </Column>
            <Column field="amount" header="Amount" style="width: 12%">
              <template #body="{ data }">
                Rs. {{ data.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </template>
            </Column>
            <Column field="check_number" header="Check #" style="width: 10%">
              <template #body="{ data }">
                {{ data.check_number || '-' }}
              </template>
            </Column>
            <Column field="payment_status" header="Status" style="width: 12%">
              <template #body="{ data }">
                <Tag
                  :value="getPaymentStatusLabel(data.payment_status)"
                  :severity="getPaymentStatusSeverity(data.payment_status)"
                />
              </template>
            </Column>
            <Column field="reference" header="Reference" style="width: 20%">
              <template #body="{ data }">
                {{ data.reference || data.notes || '-' }}
              </template>
            </Column>
            <Column header="Action" style="width: 15%">
              <template #body="{ data }">
                <div style="display: flex; gap: 0.5rem">
                  <Button
                    v-if="data.payment_status === 'pending'"
                    v-tooltip="'Clear Payment'"
                    icon="pi pi-check"
                    severity="success"
                    rounded
                    text
                    @click="openClearPaymentDialog(data)"
                  />
                  <Button
                    v-tooltip="'Delete Payment'"
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    text
                    @click="deletePayment(data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <div v-else class="no-data-message">
          <i class="pi pi-inbox" />
          <p>No payments recorded yet</p>
        </div>
      </div>
    </template>

    <!-- Clear Payment Dialog -->
    <Dialog
      v-model:visible="showClearDialog"
      header="Clear Payment"
      :modal="true"
      :closable="true"
      style="width: 90%; max-width: 400px"
    >
      <div class="p-fluid">
        <div class="form-group">
          <label>Payment Details</label>
          <div style="padding: 1rem; background: #f9fafb; border-radius: 6px; margin-bottom: 1rem">
            <p style="margin: 0.25rem 0">
              <strong>Method:</strong> {{ getPaymentMethodLabel(selectedPayment?.payment_method) }}
            </p>
            <p style="margin: 0.25rem 0">
              <strong>Amount:</strong> Rs.
              {{ selectedPayment?.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </p>
            <p style="margin: 0.25rem 0">
              <strong>Payment Date:</strong>
              {{ selectedPayment?.payment_date }}
            </p>
            <p v-if="selectedPayment?.check_date" style="margin: 0.25rem 0">
              <strong>Check Date:</strong> {{ selectedPayment?.check_date }}
            </p>
          </div>
        </div>
        <div class="form-group">
          <label>Clearance Date *</label>
          <Calendar
            v-model="clearanceDate"
            date-format="yy-mm-dd"
            show-icon
            :min-date="getClearanceMinDate()"
            placeholder="Select clearance date"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" text @click="closeClearDialog" />
        <Button
          label="Clear Payment"
          severity="success"
          :loading="clearingPayment"
          @click="clearPayment"
        />
      </template>
    </Dialog>

    <!-- Payment Dialog -->
    <Dialog
      v-model:visible="showPaymentDialog"
      header="Record Supplier Payment"
      :modal="true"
      :closable="true"
      style="width: 90%; max-width: 500px"
    >
      <form class="payment-form" @submit.prevent="submitPayment">
        <div class="form-group">
          <label>Payment Date *</label>
          <Calendar
            v-model="paymentForm.payment_date"
            date-format="yy-mm-dd"
            show-icon
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label>Purchase Order (Optional)</label>
          <Dropdown
            v-model="paymentForm.purchase_order_id"
            :options="supplierPOs"
            option-label="label"
            option-value="value"
            placeholder="Select PO or leave blank for general payment"
            :loading="loadingPOs"
            show-clear
            :disabled="isSubmitting"
          />
          <small class="text-muted">Link this payment to a specific purchase order</small>
        </div>

        <div class="form-group">
          <label>Payment Method *</label>
          <Dropdown
            v-model="paymentForm.payment_method"
            :options="paymentMethodOptions"
            option-label="label"
            option-value="value"
            placeholder="Select method"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label>Amount (Rs.) *</label>
          <InputNumber
            v-model="paymentForm.amount"
            :use-grouping="false"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            placeholder="0.00"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Check-specific fields -->
        <template v-if="isCheckPayment">
          <div class="form-group">
            <label>Check Number *</label>
            <InputText
              v-model="paymentForm.check_number"
              placeholder="Enter check number"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label>Check Date *</label>
            <Calendar
              v-model="paymentForm.check_date"
              date-format="yy-mm-dd"
              show-icon
              :disabled="isSubmitting"
            />
          </div>
        </template>

        <div class="form-group">
          <label>Reference</label>
          <InputText
            v-model="paymentForm.reference"
            placeholder="Reference or invoice number"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label>Notes</label>
          <Textarea
            v-model="paymentForm.notes"
            placeholder="Additional notes"
            rows="3"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-actions">
          <Button
            label="Cancel"
            severity="secondary"
            :disabled="isSubmitting"
            @click="showPaymentDialog = false"
          />
          <Button label="Record Payment" icon="pi pi-check" type="submit" :loading="isSubmitting" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<style scoped>
.supplier-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.supplier-code {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.code-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.code-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #7f1d1d;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.card-header i {
  font-size: 1.25rem;
  color: #3b82f6;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.card-content {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-row .value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.payment-terms {
  text-transform: capitalize;
  background: #eff6ff;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  color: #1e40af;
}

.balance {
  color: #059669;
  font-size: 1rem;
}

.balance.negative {
  color: #dc2626;
}

/* Purchase Orders Section */
.purchase-orders-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.order-count {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.table-container {
  margin-top: 1rem;
}

.po-id {
  font-weight: 600;
  color: #3b82f6;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.action-link:hover {
  color: #1e40af;
  text-decoration: underline;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.no-data-message i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.no-data-message p {
  margin: 0;
  font-size: 0.875rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container p {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Not Found State */
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.not-found-container i {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.not-found-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.not-found-container p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

/* Payment History Section */
.payment-history-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Payment Form */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group small.text-muted {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.form-group :deep(.p-calendar),
.form-group :deep(.p-dropdown),
.form-group :deep(.p-inputtext),
.form-group :deep(.p-inputnumber),
.form-group :deep(.p-inputtextarea) {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

/* Loading and empty states */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #6b7280;
}

.not-found-container {
  background: white;
  padding: 3rem;
  border-radius: 8px;
  text-align: center;
}

.not-found-container i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-data-message i {
  font-size: 2rem;
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .supplier-view {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-count {
    align-self: flex-start;
  }
}
</style>
