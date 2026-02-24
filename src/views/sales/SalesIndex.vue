<script setup>
import InvoiceList from '@/components/sales/InvoiceList.vue';
import { useEmployeeStore } from '@/stores/employee';
import { useOutletStore } from '@/stores/outlet';
import { useRouteStore } from '@/stores/route';
import { useSalesStore } from '@/stores/sales';
import { printReceipt } from '@/utils/printReceipt';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const salesStore = useSalesStore();
const outletStore = useOutletStore();
const employeeStore = useEmployeeStore();
const routeStore = useRouteStore();
const confirm = useConfirm();
const toast = useToast();

// Filters
const filters = ref({
  search: '',
  outlet_id: null,
  sales_ref_id: null,
  route_id: null,
  payment_status: null,
  payment_method: null,
  start_date: null,
  end_date: null,
  page: 1,
  limit: 10,
});

// Print invoice

// Options
const paymentStatusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
];

const paymentMethodOptions = [
  { label: 'All Methods', value: null },
  { label: 'Cash', value: 'cash' },
  { label: 'Credit', value: 'credit' },
  { label: 'Check', value: 'check' },
];

// Computed
const outletOptions = computed(() => [{ name: 'All Outlets', id: null }, ...outletStore.outlets]);

const salesRefOptions = computed(() => [
  { name: 'All Sales Reps', id: null },
  ...employeeStore.employees.filter(e => e.type === 'sales_ref' && e.status === 'active'),
]);

const routeOptions = computed(() => [{ name: 'All Routes', id: null }, ...routeStore.routes]);

const isFiltersActive = computed(() => {
  return (
    filters.value.search !== '' ||
    filters.value.outlet_id !== null ||
    filters.value.sales_ref_id !== null ||
    filters.value.route_id !== null ||
    filters.value.payment_status !== null ||
    filters.value.payment_method !== null ||
    filters.value.start_date !== null ||
    filters.value.end_date !== null
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.search !== '') count++;
  if (filters.value.outlet_id !== null) count++;
  if (filters.value.sales_ref_id !== null) count++;
  if (filters.value.route_id !== null) count++;
  if (filters.value.payment_status !== null) count++;
  if (filters.value.payment_method !== null) count++;
  if (filters.value.start_date !== null) count++;
  if (filters.value.end_date !== null) count++;
  return count;
});

// Methods
const fetchInvoices = async () => {
  const params = {
    ...filters.value,
    search: filters.value.search || undefined,
    outlet_id: filters.value.outlet_id || undefined,
    sales_ref_id: filters.value.sales_ref_id || undefined,
    route_id: filters.value.route_id || undefined,
    payment_status: filters.value.payment_status || undefined,
    payment_method: filters.value.payment_method || undefined,
    start_date: filters.value.start_date ? formatDate(filters.value.start_date) : undefined,
    end_date: filters.value.end_date ? formatDate(filters.value.end_date) : undefined,
  };

  await salesStore.fetchInvoices(params);
};

const formatDate = date => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const handleSearch = () => {
  filters.value.page = 1;
  fetchInvoices();
};

const clearFilters = () => {
  filters.value = {
    search: '',
    outlet_id: null,
    sales_ref_id: null,
    route_id: null,
    payment_status: null,
    payment_method: null,
    start_date: null,
    end_date: null,
    page: 1,
    limit: 10,
  };
  fetchInvoices();
};

const handlePageChange = event => {
  filters.value.page = event.page + 1;
  filters.value.limit = event.rows;
  fetchInvoices();
};

const handleView = id => {
  router.push(`/sales/${id}/view`);
};

const handleEdit = id => {
  router.push(`/sales/${id}/edit`);
};

const handleDelete = invoice => {
  confirm.require({
    message: `Are you sure you want to delete invoice ${invoice.invoice_number}?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await salesStore.deleteInvoice(invoice.id);
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invoice deleted successfully',
          life: 3000,
        });
        fetchInvoices();
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete invoice',
          life: 3000,
        });
      }
    },
  });
};

const handleCreate = () => {
  router.push('/sales/create');
};

const handlePrint = async id => {
  try {
    await salesStore.fetchInvoiceById(id);
    printReceipt(salesStore.currentInvoice);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load invoice for printing',
      life: 3000,
    });
  }
};

const handlePrintTestData = () => {
  window.open(
    '/test-receipt-50items.html',
    'test_receipt',
    'width=520,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes'
  );
};

// Load data
onMounted(async () => {
  await Promise.all([
    fetchInvoices(),
    outletStore.fetchOutlets({ status: 'active' }),
    employeeStore.fetchEmployees({ type: 'sales_ref', status: 'active' }),
    routeStore.fetchRoutes({ status: 'active' }),
  ]);
});
</script>

<template>
  <div class="sales-index">
    <ConfirmDialog />

    <div class="page-header">
      <div>
        <h1 class="page-title">Sales Invoices</h1>
        <p class="page-subtitle">Manage sales invoices and returns</p>
      </div>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="fetchInvoices"
        />
        <Button
          label="Print Test Data"
          icon="pi pi-print"
          severity="warning"
          @click="handlePrintTestData"
        />
        <Button label="Create Invoice" icon="pi pi-plus" @click="handleCreate" />
      </div>
    </div>

    <div class="filters-card">
      <div class="filters-grid">
        <!-- Row 1 -->
        <div class="field">
          <label for="search">Search Invoice</label>
          <InputText
            id="search"
            v-model="filters.search"
            placeholder="Invoice number..."
            class="w-full"
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="field">
          <label for="outlet">Outlet</label>
          <Dropdown
            id="outlet"
            v-model="filters.outlet_id"
            :options="outletOptions"
            option-label="name"
            option-value="id"
            placeholder="Select Outlet"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="sales_ref">Sales Rep</label>
          <Dropdown
            id="sales_ref"
            v-model="filters.sales_ref_id"
            :options="salesRefOptions"
            option-label="name"
            option-value="id"
            placeholder="Select Rep"
            class="w-full"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value">
                {{ salesRefOptions.find(e => e.id === slotProps.value)?.name }}
              </div>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
            <template #option="slotProps">
              {{ slotProps.option.name }}
              <span v-if="slotProps.option.code" class="text-sm text-gray-500"
                >({{ slotProps.option.code }})</span
              >
            </template>
          </Dropdown>
        </div>

        <div class="field">
          <label for="route">Route</label>
          <Dropdown
            id="route"
            v-model="filters.route_id"
            :options="routeOptions"
            option-label="name"
            option-value="id"
            placeholder="Select Route"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="payment_status">Status</label>
          <Dropdown
            id="payment_status"
            v-model="filters.payment_status"
            :options="paymentStatusOptions"
            option-label="label"
            option-value="value"
            placeholder="Select Status"
            class="w-full"
          />
        </div>

        <!-- Row 2 -->
        <div class="field">
          <label for="payment_method">Method</label>
          <Dropdown
            id="payment_method"
            v-model="filters.payment_method"
            :options="paymentMethodOptions"
            option-label="label"
            option-value="value"
            placeholder="Select Method"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="start_date">Start Date</label>
          <Calendar
            id="start_date"
            v-model="filters.start_date"
            date-format="yy-mm-dd"
            :show-icon="true"
            placeholder="From date"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="end_date">End Date</label>
          <Calendar
            id="end_date"
            v-model="filters.end_date"
            date-format="yy-mm-dd"
            :show-icon="true"
            placeholder="To date"
            class="w-full"
          />
        </div>

        <div class="filters-actions field">
          <Button label="Apply" icon="pi pi-search" @click="handleSearch" />
          <Avatar
            v-badge.info="activeFilterCount"
            :icon="isFiltersActive ? 'pi pi-filter-slash' : 'pi pi-filter'"
            class="p-overlay-badge"
            @click="isFiltersActive && clearFilters()"
          />
        </div>
      </div>
    </div>

    <div class="content-card">
      <InvoiceList
        :invoices="salesStore.invoices"
        :loading="salesStore.loading"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @print="handlePrint"
      />

      <Paginator
        v-if="salesStore.totalInvoices > 0"
        :rows="filters.limit"
        :total-records="salesStore.totalInvoices"
        :rows-per-page-options="[10, 25, 50]"
        class="mt-4"
        @page="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.sales-index {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filters-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: row;
}

.content-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
