<template>
  <div class="production-report">
    <div class="page-header">
      <div>
        <h1>Production Efficiency Report</h1>
        <p class="subtitle">Analyze production performance and waste costs</p>
      </div>
      <div class="header-actions">
        <Button
          label="Export CSV"
          icon="pi pi-download"
          class="p-button-outlined"
          :disabled="!reportData"
          @click="handleExportCSV"
        />
        <Button
          label="Print PDF"
          icon="pi pi-print"
          class="p-button-outlined"
          :disabled="!reportData"
          @click="handleExportPDF"
        />
      </div>
    </div>

    <!-- Filters -->
    <Card class="filter-card">
      <template #content>
        <div class="filter-grid">
          <div class="field">
            <label>Date From</label>
            <Calendar v-model="filters.date_from" date-format="yy-mm-dd" show-icon />
          </div>
          <div class="field">
            <label>Date To</label>
            <Calendar v-model="filters.date_to" date-format="yy-mm-dd" show-icon />
          </div>
          <div class="field">
            <label>Product</label>
            <Dropdown
              v-model="filters.product_id"
              :options="products"
              option-label="product_name"
              option-value="product_id"
              placeholder="All Products"
              show-clear
            />
          </div>
          <div class="field align-end">
            <Button label="Generate Report" icon="pi pi-search" @click="loadReport" />
          </div>
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Generating report...</p>
    </div>

    <!-- Report Content -->
    <div v-else-if="reportData" class="report-content">
      <!-- Summary Cards -->
      <div class="summary-grid">
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-cog" />
              <span>Production Runs</span>
            </div>
            <div class="summary-value">
              {{ reportData.summary.total_runs }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-box" />
              <span>Total Produced</span>
            </div>
            <div class="summary-value">
              {{ formatNumber(reportData.summary.total_quantity_produced) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-chart-line" />
              <span>Efficiency Rate</span>
            </div>
            <div
              class="summary-value"
              :class="getEfficiencyClass(reportData.summary.average_efficiency)"
            >
              {{ formatPercentage(reportData.summary.average_efficiency) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-trash" />
              <span>Waste Cost</span>
            </div>
            <div class="summary-value danger">
              {{ formatCurrency(reportData.summary.total_waste_cost) }}
            </div>
          </template>
        </Card>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        <Card class="chart-card">
          <template #header>
            <h3>Production Efficiency Trend</h3>
          </template>
          <template #content>
            <Chart type="line" :data="efficiencyChartData" :options="lineChartOptions" />
          </template>
        </Card>
        <Card class="chart-card">
          <template #header>
            <h3>Waste Cost Breakdown</h3>
          </template>
          <template #content>
            <Chart type="bar" :data="wasteChartData" :options="barChartOptions" />
          </template>
        </Card>
      </div>

      <!-- Production Details Table -->
      <Card>
        <template #header>
          <h3>Production Run Details</h3>
        </template>
        <template #content>
          <DataTable
            :value="reportData.production_runs"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="production_date" header="Date" sortable>
              <template #body="{ data }">
                {{ formatDate(data.production_date) }}
              </template>
            </Column>
            <Column field="product.product_name" header="Product" sortable />
            <Column field="batch.batch_number" header="Batch" sortable />
            <Column field="produced_quantity" header="Produced" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.produced_quantity) }}
              </template>
            </Column>
            <Column field="expected_quantity" header="Expected" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.expected_quantity) }}
              </template>
            </Column>
            <Column field="efficiency" header="Efficiency" sortable>
              <template #body="{ data }">
                <Tag
                  :value="formatPercentage(data.efficiency)"
                  :severity="
                    getPercentageSeverity(data.efficiency, { excellent: 95, good: 85, warning: 75 })
                  "
                />
              </template>
            </Column>
            <Column field="production_cost" header="Cost" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.production_cost) }}
              </template>
            </Column>
            <Column field="waste_cost" header="Waste Cost" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.waste_cost) }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else class="empty-state">
      <template #content>
        <i class="pi pi-cog" style="font-size: 3rem; color: var(--surface-400)" />
        <p>Select filters and click "Generate Report" to view production analysis</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { productService } from '@/services/productService';
import reportService from '@/services/reportService';
import { createCSVHeader } from '@/utils/exportHelpers';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  getPercentageSeverity,
} from '@/utils/reportFormatters';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const loading = ref(false);
const reportData = ref(null);
const products = ref([]);

const filters = ref({
  date_from: null,
  date_to: null,
  product_id: null,
});

const efficiencyChartData = computed(() => {
  if (!reportData.value || !reportData.value.production_runs) return {};
  const labels = reportData.value.production_runs.map(run => formatDate(run.production_date));
  const data = reportData.value.production_runs.map(run => run.efficiency);
  return {
    labels,
    datasets: [
      {
        label: 'Efficiency %',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };
});

const wasteChartData = computed(() => {
  if (!reportData.value || !reportData.value.production_runs) return {};
  const labels = reportData.value.production_runs.slice(0, 10).map(run => run.product.product_name);
  const data = reportData.value.production_runs.slice(0, 10).map(run => run.waste_cost);
  return {
    labels,
    datasets: [
      {
        label: 'Waste Cost',
        data,
        backgroundColor: '#ef4444',
      },
    ],
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const loadReport = async () => {
  try {
    loading.value = true;
    const params = {};
    if (filters.value.date_from)
      params.date_from = filters.value.date_from.toISOString().split('T')[0];
    if (filters.value.date_to) params.date_to = filters.value.date_to.toISOString().split('T')[0];
    if (filters.value.product_id) params.product_id = filters.value.product_id;
    reportData.value = await reportService.getProductionReport(params);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Report generated successfully',
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to generate report',
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};

const loadProducts = async () => {
  try {
    const response = await productService.getAll();
    products.value = response;
  } catch (error) {
    console.error('Failed to load products:', error);
  }
};

const getEfficiencyClass = efficiency => {
  if (efficiency >= 95) return 'success';
  if (efficiency >= 85) return '';
  if (efficiency >= 75) return 'warning';
  return 'danger';
};

const handleExportCSV = () => {
  if (!reportData.value) return;
  const csvData = [
    createCSVHeader('Production Efficiency Report', {
      date_from: filters.value.date_from?.toISOString().split('T')[0],
      date_to: filters.value.date_to?.toISOString().split('T')[0],
    }),
  ];
  const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `production_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const handleExportPDF = () => {
  window.print();
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.production-report {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin: 0;
}
.header-actions {
  display: flex;
  gap: 0.75rem;
}
.filter-card {
  margin-bottom: 2rem;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field.align-end {
  justify-content: flex-end;
}
.field label {
  font-weight: 600;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.summary-card :deep(.p-card-content) {
  padding: 1.5rem;
}
.summary-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-color-secondary);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}
.summary-header i {
  font-size: 1.5rem;
}
.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}
.summary-value.success {
  color: #22c55e;
}
.summary-value.warning {
  color: #f59e0b;
}
.summary-value.danger {
  color: #ef4444;
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.chart-card :deep(.p-card-content) {
  height: 300px;
}
.report-table {
  margin-top: 1rem;
}
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}
.empty-state :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
@media print {
  .page-header .header-actions,
  .filter-card {
    display: none !important;
  }
}
</style>
