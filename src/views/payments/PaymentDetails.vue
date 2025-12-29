<template>
  <div class="payment-details">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div v-if="paymentStore.loading" class="loading">
      <ProgressSpinner />
    </div>

    <div v-else-if="payment" class="details-container">
      <div class="page-header">
        <h1>Payment Details #{{ payment.id }}</h1>
        <div class="header-actions">
          <Button
            label="Back to Payments"
            icon="pi pi-arrow-left"
            @click="router.push('/payments')"
          />
        </div>
      </div>

      <!-- Payment Information -->
      <Card class="mb-3">
        <template #title> Payment Information </template>
        <template #content>
          <div class="details-grid">
            <div class="detail-item">
              <label>Payment ID</label>
              <p>{{ payment.id }}</p>
            </div>
            <div class="detail-item">
              <label>Payment Date</label>
              <p>{{ payment.payment_date }}</p>
            </div>
            <div class="detail-item">
              <label>Amount</label>
              <p>
                <strong>Rs. {{ parseFloat(payment.amount).toFixed(2) }}</strong>
              </p>
            </div>
            <div class="detail-item">
              <label>Payment Method</label>
              <Tag :severity="getPaymentMethodSeverity(payment.payment_method)">
                {{ payment.payment_method.toUpperCase() }}
              </Tag>
            </div>
            <div class="detail-item">
              <label>Outlet</label>
              <p>{{ payment.outlet?.name || 'N/A' }}</p>
            </div>
            <div class="detail-item">
              <label>Current Outlet Balance</label>
              <p>Rs. {{ parseFloat(payment.outlet?.balance || 0).toFixed(2) }}</p>
            </div>
            <div v-if="payment.reference" class="detail-item">
              <label>Reference</label>
              <p>{{ payment.reference }}</p>
            </div>
            <div class="detail-item">
              <label>Created By</label>
              <p>{{ payment.creator?.name || payment.creator?.username }}</p>
            </div>
          </div>

          <!-- Check Details -->
          <div v-if="payment.payment_method === 'check'" class="check-details">
            <h4>Check Details</h4>
            <div class="details-grid">
              <div class="detail-item">
                <label>Check Number</label>
                <p>{{ payment.check_number }}</p>
              </div>
              <div class="detail-item">
                <label>Check Date</label>
                <p>{{ payment.check_date }}</p>
              </div>
              <div class="detail-item">
                <label>Clearance Date</label>
                <p v-if="payment.clearance_date">
                  <Tag severity="success"> Cleared: {{ payment.clearance_date }} </Tag>
                </p>
                <p v-else>
                  <Tag severity="warning"> Pending </Tag>
                </p>
              </div>
            </div>

            <Button
              v-if="!payment.clearance_date"
              label="Clear Check"
              icon="pi pi-check"
              severity="success"
              class="mt-3"
              @click="showClearDialog = true"
            />
          </div>

          <!-- Notes -->
          <div v-if="payment.notes" class="notes-section">
            <h4>Notes</h4>
            <p>{{ payment.notes }}</p>
          </div>
        </template>
      </Card>

      <!-- Payment Allocations -->
      <Card>
        <template #title> Payment Allocations </template>
        <template #content>
          <DataTable :value="payment.allocations" show-gridlines>
            <Column field="invoice.invoice_number" header="Invoice #" />
            <Column field="invoice.invoice_date" header="Invoice Date" />
            <Column header="Invoice Total">
              <template #body="{ data }">
                Rs. {{ parseFloat(data.invoice.total_amount).toFixed(2) }}
              </template>
            </Column>
            <Column header="Invoice Paid">
              <template #body="{ data }">
                Rs. {{ parseFloat(data.invoice.paid_amount || 0).toFixed(2) }}
              </template>
            </Column>
            <Column header="Allocated Amount">
              <template #body="{ data }">
                <strong>Rs. {{ parseFloat(data.allocated_amount).toFixed(2) }}</strong>
              </template>
            </Column>
            <Column field="invoice.payment_status" header="Status">
              <template #body="{ data }">
                <Tag :severity="getPaymentStatusSeverity(data.invoice.payment_status)">
                  {{ data.invoice.payment_status.toUpperCase() }}
                </Tag>
              </template>
            </Column>
            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  label="View Invoice"
                  size="small"
                  text
                  @click="viewInvoice(data.invoice.id)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Clear Check Dialog -->
    <Dialog v-model:visible="showClearDialog" header="Clear Check" :style="{ width: '500px' }">
      <div class="p-fluid">
        <div class="field">
          <label>Clearance Date <span class="required">*</span></label>
          <Calendar
            v-model="clearanceDate"
            date-format="yy-mm-dd"
            show-icon
            :max-date="new Date()"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showClearDialog = false" />
        <Button label="Clear Check" severity="success" @click="submitClearCheck" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { usePaymentStore } from '@/stores/payment';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const paymentStore = usePaymentStore();
const toast = useToast();

const payment = ref(null);
const showClearDialog = ref(false);
const clearanceDate = ref(new Date());

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
const breadcrumbItems = ref([{ label: 'Payments', to: '/payments' }, { label: 'Payment Details' }]);

const fetchPayment = async () => {
  try {
    payment.value = await paymentStore.fetchPaymentById(route.params.id);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch payment details',
      life: 3000,
    });
    router.push('/payments');
  }
};

const submitClearCheck = async () => {
  try {
    await paymentStore.updatePayment(payment.value.id, {
      clearance_date: new Date(clearanceDate.value).toISOString().split('T')[0],
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Check cleared successfully',
      life: 3000,
    });

    showClearDialog.value = false;
    await fetchPayment();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to clear check',
      life: 3000,
    });
  }
};

const viewInvoice = invoiceId => {
  router.push(`/sales/${invoiceId}`);
};

const getPaymentMethodSeverity = method => {
  switch (method) {
    case 'cash':
      return 'success';
    case 'bank_transfer':
      return 'info';
    case 'check':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getPaymentStatusSeverity = status => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'unpaid':
      return 'danger';
    case 'partial':
      return 'warning';
    default:
      return 'secondary';
  }
};

onMounted(() => {
  fetchPayment();
});
</script>

<style scoped>
.payment-details {
  padding: 1.5rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item label {
  display: block;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-item p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.check-details,
.notes-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.check-details h4,
.notes-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.required {
  color: red;
}
</style>
