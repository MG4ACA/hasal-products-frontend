<template>
  <div class="payments-page">
    <div class="page-header">
      <h1>Payment Collection</h1>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="fetchPayments"
        />
        <Button
          label="Pending Checks"
          icon="pi pi-clock"
          severity="warning"
          @click="router.push('/payments/pending-checks')"
        />
        <Button label="Record Payment" icon="pi pi-plus" @click="router.push('/payments/create')" />
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-grid">
        <div class="filter-item">
          <label>Outlet</label>
          <Dropdown
            v-model="filters.outlet_id"
            :options="outletOptions"
            option-label="name"
            option-value="id"
            placeholder="All Outlets"
            show-clear
            @change="fetchPayments"
          />
        </div>

        <div class="filter-item">
          <label>Payment Method</label>
          <Dropdown
            v-model="filters.payment_method"
            :options="paymentMethodOptions"
            placeholder="All Methods"
            show-clear
            @change="fetchPayments"
          />
        </div>

        <div class="filter-item">
          <label>Check Status</label>
          <Dropdown
            v-model="filters.check_status"
            :options="checkStatusOptions"
            placeholder="All Checks"
            show-clear
            @change="fetchPayments"
          />
        </div>

        <div class="filter-item">
          <label>Start Date</label>
          <Calendar
            v-model="filters.start_date"
            date-format="yy-mm-dd"
            show-icon
            placeholder="Select start date"
            @date-select="fetchPayments"
          />
        </div>

        <div class="filter-item">
          <label>End Date</label>
          <Calendar
            v-model="filters.end_date"
            date-format="yy-mm-dd"
            show-icon
            placeholder="Select end date"
            @date-select="fetchPayments"
          />
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="table-container">
      <DataTable
        :value="paymentStore.payments"
        :loading="paymentStore.loading"
        striped-rows
        show-gridlines
        responsive-layout="scroll"
      >
        <Column field="id" header="ID" style="width: 80px" />
        <Column field="payment_date" header="Date" style="width: 120px" />
        <Column header="Outlet">
          <template #body="{ data }">
            {{ data.outlet?.name || 'N/A' }}
          </template>
        </Column>
        <Column field="amount" header="Amount">
          <template #body="{ data }"> Rs. {{ parseFloat(data.amount).toFixed(2) }} </template>
        </Column>
        <Column field="payment_method" header="Method">
          <template #body="{ data }">
            <Tag :severity="getPaymentMethodSeverity(data.payment_method)">
              {{ data.payment_method.toUpperCase() }}
            </Tag>
          </template>
        </Column>
        <Column header="Check Info" style="width: 200px">
          <template #body="{ data }">
            <div v-if="data.payment_method === 'check'">
              <div><strong>No:</strong> {{ data.check_number }}</div>
              <div><strong>Date:</strong> {{ data.check_date }}</div>
              <div v-if="data.clearance_date">
                <Tag severity="success"> Cleared: {{ data.clearance_date }} </Tag>
              </div>
              <div v-else>
                <Tag severity="warning"> Pending </Tag>
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </Column>
        <Column header="Allocated To">
          <template #body="{ data }"> {{ data.allocations?.length || 0 }} invoice(s) </template>
        </Column>
        <Column header="Actions" style="width: 150px">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                size="small"
                severity="info"
                text
                @click="viewPayment(data.id)"
              />
              <Button
                v-if="data.payment_method === 'check' && !data.clearance_date"
                icon="pi pi-check"
                size="small"
                severity="success"
                text
                @click="clearCheck(data)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <Paginator
        v-model:first="paginatorFirst"
        :rows="filters.limit"
        :total-records="paymentStore.pagination.total"
        @page="onPageChange"
      />
    </div>

    <!-- Dialogs -->
    <ConfirmDialog />
    <Dialog v-model:visible="showClearDialog" header="Clear Check" :style="{ width: '500px' }">
      <div class="p-fluid">
        <div class="field">
          <label>Clearance Date</label>
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
import { useOutletStore } from '@/stores/outlet';
import { usePaymentStore } from '@/stores/payment';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const paymentStore = usePaymentStore();
const outletStore = useOutletStore();
const confirm = useConfirm();
const toast = useToast();

// Filters
const filters = ref({
  outlet_id: null,
  payment_method: null,
  check_status: null,
  start_date: null,
  end_date: null,
  page: 1,
  limit: 10,
});

const paginatorFirst = ref(0);

// Options
const outletOptions = computed(() => outletStore.outlets);

const paymentMethodOptions = ref(['cash', 'bank_transfer', 'check']);

const checkStatusOptions = ref(['pending', 'cleared', 'overdue']);

// Clear check dialog
const showClearDialog = ref(false);
const clearanceDate = ref(new Date());
const selectedPayment = ref(null);

// Methods
const fetchPayments = async () => {
  const params = {
    ...filters.value,
    outlet_id: filters.value.outlet_id || undefined,
    payment_method: filters.value.payment_method || undefined,
    check_status: filters.value.check_status || undefined,
    start_date: filters.value.start_date
      ? new Date(filters.value.start_date).toISOString().split('T')[0]
      : undefined,
    end_date: filters.value.end_date
      ? new Date(filters.value.end_date).toISOString().split('T')[0]
      : undefined,
  };

  try {
    await paymentStore.fetchPayments(params);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to fetch payments',
      life: 3000,
    });
  }
};

const onPageChange = event => {
  filters.value.page = event.page + 1;
  paginatorFirst.value = event.first;
  fetchPayments();
};

const viewPayment = id => {
  router.push(`/payments/${id}`);
};

const clearCheck = payment => {
  selectedPayment.value = payment;
  clearanceDate.value = new Date();
  showClearDialog.value = true;
};

const submitClearCheck = async () => {
  try {
    await paymentStore.updatePayment(selectedPayment.value.id, {
      clearance_date: new Date(clearanceDate.value).toISOString().split('T')[0],
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Check cleared successfully',
      life: 3000,
    });

    showClearDialog.value = false;
    fetchPayments();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to clear check',
      life: 3000,
    });
  }
};

const confirmDelete = payment => {
  confirm.require({
    message:
      'Are you sure you want to delete this payment? This will restore the outlet balance and invoice payment statuses.',
    header: 'Delete Payment',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await paymentStore.deletePayment(payment.id);
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment deleted successfully',
          life: 3000,
        });
        fetchPayments();
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete payment',
          life: 3000,
        });
      }
    },
  });
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

onMounted(async () => {
  await outletStore.fetchOutlets();
  await fetchPayments();
});
</script>

<style scoped>
.payments-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.table-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
</style>
