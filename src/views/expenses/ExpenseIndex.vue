<template>
  <div class="expense-index">
    <!-- <Breadcrumb
      :home="home"
      :model="breadcrumbItems"
      class="mb-4"
    /> -->

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Expense Management</h1>
        <p class="text-muted">Track and manage business expenses</p>
      </div>
      <div class="header-actions">
        <Button
          v-tooltip="'Refresh'"
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="loadExpenses"
        />
        <Button label="Add Expense" icon="pi pi-plus" @click="navigateToCreate" />
      </div>
    </div>

    <!-- Filters Card -->
    <div class="filters-card">
      <div class="filters">
        <div class="search-box">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters.search"
              placeholder="Search in description..."
              class="search-input"
              @input="applyFilters"
            />
          </IconField>
        </div>

        <Dropdown
          v-model="filters.category"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          placeholder="All Categories"
          class="filter-dropdown"
          @change="applyFilters"
        />

        <Calendar
          v-model="filters.date_from"
          date-format="yy-mm-dd"
          placeholder="Date From"
          show-icon
          class="filter-calendar"
          @date-select="applyFilters"
        />

        <Calendar
          v-model="filters.date_to"
          date-format="yy-mm-dd"
          placeholder="Date To"
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

    <!-- Expenses DataTable -->
    <Card class="list-card">
      <template #content>
        <DataTable :value="expenseStore.expenses" :loading="expenseStore.loading" striped-rows>
          <Column field="expense_date" header="Date" sortable style="width: 110px">
            <template #body="{ data }">
              {{ formatDate(data.expense_date) }}
            </template>
          </Column>

          <Column field="category" header="Category" sortable style="width: 130px">
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

          <Column field="vehicle" header="Vehicle" style="width: 150px">
            <template #body="{ data }">
              <span v-if="data.vehicle">{{ data.vehicle.code }} - {{ data.vehicle.name }}</span>
              <span v-else class="text-500">-</span>
            </template>
          </Column>

          <Column field="route" header="Route" style="width: 150px">
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
                  class="p-button-rounded p-button-text p-button-info"
                  @click="editExpense(data.id)"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  class="p-button-rounded p-button-text p-button-info"
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Pagination -->
    <Card class="pagination-card">
      <template #content>
        <div v-if="expenseStore.pagination.total > 0" class="pagination-container">
          <Paginator
            :rows="filters.limit"
            :total-records="expenseStore.pagination.total"
            :first="(filters.page - 1) * filters.limit"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            current-page-report-template="Showing {first} to {last} of {totalRecords} expenses"
            @page="onPageChange"
          />
        </div>
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
import { computed, onMounted, ref } from 'vue';
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

const hasActiveFilters = computed(() => {
  return (
    filters.value.search !== '' ||
    filters.value.category !== null ||
    filters.value.date_from !== null ||
    filters.value.date_to !== null
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.search !== '') count++;
  if (filters.value.category !== null) count++;
  if (filters.value.date_from !== null) count++;
  if (filters.value.date_to !== null) count++;
  return count;
});

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
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
}

.filter-dropdown {
  min-width: 200px;
}

.filter-calendar {
  min-width: 180px;
}

.list-card {
  margin-bottom: 1.5rem;
}

.pagination-card {
  margin-bottom: 0;
}

.pagination-container {
  margin: 0;
}

@media (max-width: 768px) {
  .expense-index {
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
