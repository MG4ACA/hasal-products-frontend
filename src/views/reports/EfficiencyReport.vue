<template>
  <div class="efficiency-report">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Production Efficiency Report</span>
          <Button
            icon="pi pi-refresh"
            rounded
            outlined
            :loading="loading"
            @click="loadEfficiencyReport"
          />
        </div>
      </template>

      <template #content>
        <!-- Filters -->
        <div class="grid mb-4">
          <div class="col-12 md:col-3">
            <label for="date_from" class="block mb-2">From Date</label>
            <Calendar
              id="date_from"
              v-model="filters.date_from"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-3">
            <label for="date_to" class="block mb-2">To Date</label>
            <Calendar
              id="date_to"
              v-model="filters.date_to"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-4">
            <label for="recipe" class="block mb-2">Filter by Recipe (Optional)</label>
            <Dropdown
              id="recipe"
              v-model="filters.recipe_id"
              :options="recipeOptions"
              option-label="label"
              option-value="value"
              placeholder="All Recipes"
              class="w-full"
              show-clear
            />
          </div>
          <div class="col-12 md:col-2 flex align-items-end">
            <Button
              label="Apply"
              icon="pi pi-filter"
              class="w-full"
              @click="loadEfficiencyReport"
            />
          </div>
        </div>

        <!-- Summary Cards -->
        <div v-if="efficiencyData.summary" class="grid mb-4">
          <div class="col-12 md:col-3">
            <Card class="surface-card border-1 surface-border">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Production Runs</div>
                <div class="text-3xl font-bold text-primary">
                  {{ efficiencyData.summary.total_runs }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-3">
            <Card class="surface-card border-1 surface-border">
              <template #content>
                <div class="text-500 text-sm mb-2">Average Efficiency</div>
                <div
                  class="text-3xl font-bold"
                  :class="getEfficiencyColor(efficiencyData.summary.average_efficiency)"
                >
                  {{ parseFloat(efficiencyData.summary.average_efficiency).toFixed(2) }}%
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-3">
            <Card class="surface-card border-1 surface-border">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Expected</div>
                <div class="text-2xl font-semibold">
                  {{ parseFloat(efficiencyData.summary.total_expected).toFixed(2) }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-3">
            <Card class="surface-card border-1 surface-border">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Actual</div>
                <div class="text-2xl font-semibold text-green-600">
                  {{ parseFloat(efficiencyData.summary.total_actual).toFixed(2) }}
                </div>
              </template>
            </Card>
          </div>
        </div>

        <!-- Efficiency Details Table -->
        <DataTable
          :value="efficiencyData.details"
          :loading="loading"
          striped-rows
          paginator
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          sort-field="production_date"
          :sort-order="-1"
        >
          <template #header>
            <div class="text-xl font-bold">Production Run Efficiency</div>
          </template>

          <template #empty>
            <div class="text-center p-4 text-500">No production runs found for selected period</div>
          </template>

          <Column field="production_date" header="Date" sortable>
            <template #body="{ data }">
              {{ formatDate(data.production_date) }}
            </template>
          </Column>

          <Column field="batch_number" header="Batch Number" sortable />

          <Column field="recipe_name" header="Recipe" sortable>
            <template #body="{ data }">
              {{ data.recipe_name }}
            </template>
          </Column>

          <Column field="expected_quantity" header="Expected" sortable>
            <template #body="{ data }">
              {{ parseFloat(data.expected_quantity).toFixed(2) }}
            </template>
          </Column>

          <Column field="actual_quantity" header="Actual" sortable>
            <template #body="{ data }">
              <span class="font-semibold">{{ parseFloat(data.actual_quantity).toFixed(2) }}</span>
            </template>
          </Column>

          <Column field="waste_quantity" header="Waste" sortable>
            <template #body="{ data }">
              <span
                :class="
                  parseFloat(data.waste_quantity) > 0 ? 'text-orange-600 font-semibold' : 'text-500'
                "
              >
                {{ parseFloat(data.waste_quantity).toFixed(2) }}
              </span>
            </template>
          </Column>

          <Column field="variance" header="Variance" sortable>
            <template #body="{ data }">
              <span :class="parseFloat(data.variance) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ parseFloat(data.variance) >= 0 ? '+' : '' }}{{ data.variance }}
              </span>
            </template>
          </Column>

          <Column field="yield_efficiency" header="Efficiency" sortable>
            <template #body="{ data }">
              <Tag
                :value="parseFloat(data.yield_efficiency).toFixed(2) + '%'"
                :severity="getEfficiencySeverity(parseFloat(data.yield_efficiency))"
              />
            </template>
          </Column>

          <Column field="waste_reason" header="Waste Reason">
            <template #body="{ data }">
              <span :class="data.waste_reason ? '' : 'text-500 italic'">
                {{ data.waste_reason || 'N/A' }}
              </span>
            </template>
          </Column>
        </DataTable>

        <!-- Chart -->
        <div v-if="efficiencyData.details && efficiencyData.details.length > 0" class="mt-4">
          <Card>
            <template #title> Efficiency Trend </template>
            <template #content>
              <Chart type="line" :data="chartData" :options="chartOptions" />
            </template>
          </Card>
        </div>

        <!-- Export Button -->
        <div class="flex justify-content-end mt-3">
          <Button
            label="Export to CSV"
            icon="pi pi-download"
            outlined
            :disabled="!efficiencyData.details || efficiencyData.details.length === 0"
            @click="exportToCSV"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import productionService from '@/services/productionService';
import { useRecipeStore } from '@/stores/recipe';
import { computed, onMounted, ref } from 'vue';

const toast = useToastNotification();
const recipeStore = useRecipeStore();
const loading = ref(false);
const recipeOptions = ref([]);
const efficiencyData = ref({
  summary: null,
  details: [],
});

const filters = ref({
  date_from: null,
  date_to: new Date(),
  recipe_id: null,
});

const chartData = computed(() => {
  if (!efficiencyData.value.details || efficiencyData.value.details.length === 0) {
    return { labels: [], datasets: [] };
  }

  const sortedData = [...efficiencyData.value.details].sort(
    (a, b) => new Date(a.production_date) - new Date(b.production_date)
  );

  return {
    labels: sortedData.map(d => formatDate(d.production_date)),
    datasets: [
      {
        label: 'Yield Efficiency (%)',
        data: sortedData.map(d => parseFloat(d.yield_efficiency)),
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.4,
      },
      {
        label: 'Target (100%)',
        data: sortedData.map(() => 100),
        fill: false,
        borderColor: '#66BB6A',
        borderDash: [5, 5],
        tension: 0,
      },
    ],
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Efficiency (%)',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Production Date',
      },
    },
  },
});

const formatDate = date => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getEfficiencyColor = efficiency => {
  const eff = parseFloat(efficiency);
  if (eff >= 95) return 'text-green-600';
  if (eff >= 85) return 'text-blue-600';
  if (eff >= 75) return 'text-orange-600';
  return 'text-red-600';
};

const getEfficiencySeverity = efficiency => {
  const eff = parseFloat(efficiency);
  if (eff >= 95) return 'success';
  if (eff >= 85) return 'info';
  if (eff >= 75) return 'warning';
  return 'danger';
};

const loadEfficiencyReport = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.value.date_from) {
      params.date_from = filters.value.date_from.toISOString().split('T')[0];
    }
    if (filters.value.date_to) {
      params.date_to = filters.value.date_to.toISOString().split('T')[0];
    }
    if (filters.value.recipe_id) {
      params.recipe_id = filters.value.recipe_id;
    }

    efficiencyData.value = await productionService.getEfficiencyReport(params);
  } catch (error) {
    toast.showError('Failed to load efficiency report');
  } finally {
    loading.value = false;
  }
};

const loadRecipes = async () => {
  await recipeStore.fetchRecipes({ status: 'active' });
  recipeOptions.value = recipeStore.recipes.map(r => ({
    label: `${r.name} (v${r.version})`,
    value: r.id,
  }));
};

const exportToCSV = () => {
  const csvContent = [
    [
      'Date',
      'Batch',
      'Recipe',
      'Expected',
      'Actual',
      'Waste',
      'Variance',
      'Efficiency %',
      'Waste Reason',
    ].join(','),
    ...efficiencyData.value.details.map(row =>
      [
        formatDate(row.production_date),
        row.batch_number,
        `"${row.recipe_name}"`,
        parseFloat(row.expected_quantity).toFixed(2),
        parseFloat(row.actual_quantity).toFixed(2),
        parseFloat(row.waste_quantity).toFixed(2),
        row.variance,
        parseFloat(row.yield_efficiency).toFixed(2),
        `"${row.waste_reason || 'N/A'}"`,
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `efficiency-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  toast.success('Report exported successfully');
};

onMounted(async () => {
  // Set default date range to current month
  const now = new Date();
  filters.value.date_from = new Date(now.getFullYear(), now.getMonth(), 1);
  filters.value.date_to = now;

  await loadRecipes();
  await loadEfficiencyReport();
});
</script>

<style scoped>
.efficiency-report {
  padding: 1rem;
}
</style>
