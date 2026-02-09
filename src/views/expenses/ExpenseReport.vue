<template>
  <div class="expense-report">
    <Breadcrumb :home="home" :model="breadcrumbItems" class="mb-4" />

    <Card class="mb-4">
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Monthly Expense Report</span>
          <Button icon="pi pi-refresh" rounded outlined :loading="loading" @click="loadReport" />
        </div>
      </template>

      <template #content>
        <!-- Date Filters -->
        <div class="grid mb-4">
          <div class="col-12 md:col-4">
            <label for="date_from" class="block mb-2 font-semibold">From Date</label>
            <Calendar
              id="date_from"
              v-model="filters.date_from"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-4">
            <label for="date_to" class="block mb-2 font-semibold">To Date</label>
            <Calendar
              id="date_to"
              v-model="filters.date_to"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-4 flex align-items-end">
            <Button label="Apply Filter" icon="pi pi-filter" class="w-full" @click="loadReport" />
          </div>
        </div>

        <!-- Summary Cards -->
        <div v-if="summary" class="grid mb-4">
          <div class="col-12 md:col-4">
            <Card class="summary-card">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Expenses</div>
                <div class="text-2xl font-bold text-primary">
                  Rs. {{ formatCurrency(summary.summary.total_expenses) }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card class="summary-card">
              <template #content>
                <div class="text-500 text-sm mb-2">Vehicle Expenses</div>
                <div class="text-2xl font-bold text-orange-500">
                  Rs. {{ formatCurrency(summary.summary.vehicle_expenses) }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card class="summary-card">
              <template #content>
                <div class="text-500 text-sm mb-2">Other Expenses</div>
                <div class="text-2xl font-bold text-green-500">
                  Rs. {{ formatCurrency(summary.summary.non_vehicle_expenses) }}
                </div>
              </template>
            </Card>
          </div>
        </div>

        <!-- Expenses by Category -->
        <div v-if="summary" class="grid">
          <div class="col-12 md:col-6">
            <Card>
              <template #title> Expenses by Category </template>
              <template #content>
                <DataTable
                  :value="summary.by_category"
                  striped-rows
                  :rows="10"
                  paginator
                  class="p-datatable-sm"
                >
                  <Column field="category" header="Category">
                    <template #body="{ data }">
                      <Tag :severity="getCategorySeverity(data.category)">
                        {{ formatCategory(data.category) }}
                      </Tag>
                    </template>
                  </Column>
                  <Column field="count" header="Count" style="width: 100px">
                    <template #body="{ data }">
                      <span class="font-semibold">{{ data.count }}</span>
                    </template>
                  </Column>
                  <Column field="total_amount" header="Total Amount" style="width: 150px">
                    <template #body="{ data }">
                      <span class="font-semibold">Rs. {{ formatCurrency(data.total_amount) }}</span>
                    </template>
                  </Column>
                  <Column header="%" style="width: 100px">
                    <template #body="{ data }">
                      <span>{{ calculatePercentage(data.total_amount) }}%</span>
                    </template>
                  </Column>
                </DataTable>
              </template>
            </Card>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useExpenseStore } from '@/stores/expense';
import { onMounted, ref } from 'vue';

const expenseStore = useExpenseStore();
const { showError } = useToastNotification();

const home = ref({ icon: 'pi pi-home', to: '/dashboard' });
const breadcrumbItems = ref([{ label: 'Expenses', to: '/expenses' }, { label: 'Monthly Report' }]);

const loading = ref(false);
const summary = ref(null);

// Set default to current month
const now = new Date();
const filters = ref({
  date_from: new Date(now.getFullYear(), now.getMonth(), 1),
  date_to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
});

const loadReport = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.value.date_from) {
      params.date_from = filters.value.date_from.toISOString().split('T')[0];
    }
    if (filters.value.date_to) {
      params.date_to = filters.value.date_to.toISOString().split('T')[0];
    }

    summary.value = await expenseStore.fetchMonthlySummary(params);
  } catch (error) {
    showError('Failed to load expense report');
  } finally {
    loading.value = false;
  }
};

const formatCurrency = value => {
  return parseFloat(value || 0).toLocaleString('en-US', {
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

const calculatePercentage = amount => {
  if (!summary.value) return '0.00';
  const total = parseFloat(summary.value.summary.total_expenses);
  if (total === 0) return '0.00';
  return ((parseFloat(amount) / total) * 100).toFixed(2);
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
  loadReport();
});
</script>

<style scoped>
.expense-report {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.summary-card {
  background: #f8fafc;
  box-shadow: none;
  border: 1px solid #e2e8f0;
}
</style>
