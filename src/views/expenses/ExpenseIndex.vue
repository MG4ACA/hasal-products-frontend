<template>
  <div class="expense-index">
    <Breadcrumb :home="home" :model="breadcrumbItems" class="mb-4" />

    <!-- Header -->
    <div class="page-header">
      <h1>Expense Management</h1>
      <Button label="Add Expense" icon="pi pi-plus" @click="navigateToCreate" />
    </div>

    <!-- Filters Card -->
    <Card class="filter-card mb-4">
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-3">
            <label for="category" class="block mb-2">Category</label>
            <Dropdown
              id="category"
              v-model="filters.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="All Categories"
              show-clear
              class="w-full"
              @change="applyFilters"
            />
          </div>
          <div class="col-12 md:col-3">
            <label for="date_from" class="block mb-2">Date From</label>
            <Calendar
              id="date_from"
              v-model="filters.date_from"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
              @date-select="applyFilters"
            />
          </div>
          <div class="col-12 md:col-3">
            <label for="date_to" class="block mb-2">Date To</label>
            <Calendar
              id="date_to"
              v-model="filters.date_to"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
              @date-select="applyFilters"
            />
          </div>
        </div>
        <div class="grid mt-3">
          <div class="col-12 md:col-6">
            <InputText
              v-model="filters.search"
              placeholder="Search in description..."
              class="w-full"
              @input="applyFilters"
            />
          </div>
          <div class="col-12 md:col-6 flex justify-content-end">
            <Button
              label="Clear Filters"
              icon="pi pi-filter-slash"
              severity="secondary"
              outlined
              @click="clearFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Expenses DataTable -->
    <Card>
      <template #content>
        <DataTable
          :value="expenseStore.expenses"
          :loading="expenseStore.loading"
          striped-rows
          paginator
          :rows="filters.limit"
          :total-records="expenseStore.pagination.total"
          lazy
          @page="onPageChange"
        >
          <Column field="expense_date" header="Date" sortable style="width: 120px">
            <template #body="{ data }">
              {{ formatDate(data.expense_date) }}
            </template>
          </Column>

          <Column field="category" header="Category" sortable style="width: 150px">
            <template #body="{ data }">
              <Tag :severity="getCategorySeverity(data.category)">
                {{ formatCategory(data.category) }}
              </Tag>
            </template>
          </Column>

          <Column field="amount" header="Amount" sortable style="width: 120px">
            <template #body="{ data }">
              <span class="font-semibold">Rs. {{ formatNumber(data.amount) }}</span>
            </template>
          </Column>

          <Column field="vehicle" header="Vehicle" style="width: 120px">
            <template #body="{ data }">
              <span v-if="data.vehicle">{{ data.vehicle.code }} - {{ data.vehicle.name }}</span>
              <span v-else class="text-500">-</span>
            </template>
          </Column>

          <Column field="route" header="Route" style="width: 120px">
            <template #body="{ data }">
              <span v-if="data.route">{{ data.route.name }}</span>
              <span v-else class="text-500">-</span>
            </template>
          </Column>

          <Column field="description" header="Description">
            <template #body="{ data }">
              <span class="text-sm">{{ data.description || '-' }}</span>
            </template>
          </Column>

          <Column header="Actions" style="width: 120px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  severity="info"
                  outlined
                  @click="editExpense(data.id)"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  outlined
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Confirm Delete"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-4xl text-orange-500" />
        <span>
          Are you sure you want to delete this expense of
          <strong>Rs. {{ selectedExpense?.amount }}</strong> on
          <strong>{{ formatDate(selectedExpense?.expense_date) }}</strong
          >?
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" outlined @click="showDeleteDialog = false" />
        <Button
          label="Delete"
          severity="danger"
          :loading="expenseStore.loading"
          @click="handleDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useExpenseStore } from '@/stores/expense';
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const expenseStore = useExpenseStore();
const { showSuccess, showError } = useToastNotification();

const home = ref({ icon: 'pi pi-home', to: '/dashboard' });
const breadcrumbItems = ref([{ label: 'Expenses' }]);

const filters = ref({
  page: 1,
  limit: 10,
  category: null,
  date_from: null,
  date_to: null,
  search: '',
});

const categoryOptions = ref([
  { value: 'vehicle_fuel', label: 'Vehicle Fuel' },
  { value: 'vehicle_repair', label: 'Vehicle Repair' },
  { value: 'utility_bills', label: 'Utility Bills' },
  { value: 'store_maintenance', label: 'Store Maintenance' },
  { value: 'equipment_repair', label: 'Equipment Repair' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'rent', label: 'Rent' },
  { value: 'other', label: 'Other' },
]);

const showDeleteDialog = ref(false);
const selectedExpense = ref(null);

const loadExpenses = async () => {
  try {
    const params = {
      page: filters.value.page,
      limit: filters.value.limit,
    };

    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.date_from) {
      params.date_from = filters.value.date_from.toISOString().split('T')[0];
    }
    if (filters.value.date_to) {
      params.date_to = filters.value.date_to.toISOString().split('T')[0];
    }
    if (filters.value.search) params.search = filters.value.search;

    await expenseStore.fetchExpenses(params);
  } catch (error) {
    showError('Failed to load expenses');
  }
};

const applyFilters = () => {
  filters.value.page = 1;
  loadExpenses();
};

const clearFilters = () => {
  filters.value = {
    page: 1,
    limit: 10,
    category: null,
    date_from: null,
    date_to: null,
    search: '',
  };
  loadExpenses();
};

const onPageChange = event => {
  filters.value.page = event.page + 1;
  filters.value.limit = event.rows;
  loadExpenses();
};

const navigateToCreate = () => {
  router.push('/expenses/create');
};

const editExpense = id => {
  router.push(`/expenses/edit/${id}`);
};

const confirmDelete = expense => {
  selectedExpense.value = expense;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    await expenseStore.deleteExpense(selectedExpense.value.id);
    showSuccess('Expense deleted successfully');
    showDeleteDialog.value = false;
    loadExpenses();
  } catch (error) {
    showError('Failed to delete expense');
  }
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

const formatNumber = value => {
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCategory = category => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getCategorySeverity = category => {
  const severityMap = {
    vehicle_fuel: 'info',
    vehicle_repair: 'warning',
    utility_bills: 'success',
    store_maintenance: 'warning',
    equipment_repair: 'danger',
    salaries: 'contrast',
    rent: 'secondary',
    other: 'secondary',
  };
  return severityMap[category] || 'secondary';
};

onMounted(() => {
  loadExpenses();
});
</script>

<style scoped>
.expense-index {
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
  color: #1e293b;
}

.filter-card {
  background: #f8fafc;
}
</style>
