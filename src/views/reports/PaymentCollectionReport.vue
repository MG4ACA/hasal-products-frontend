<template>
  <div class="payment-collection-report">
    <div class="page-header">
      <div>
        <h1>Payment Collection Report</h1>
        <p class="subtitle">Track collection rates and outstanding balances</p>
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
            <label>Outlet</label>
            <Dropdown
              v-model="filters.outlet_id"
              :options="outlets"
              option-label="outlet_name"
              option-value="outlet_id"
              placeholder="All Outlets"
              show-clear
            />
          </div>
          <div class="field">
            <label>Payment Method</label>
            <Dropdown
              v-model="filters.payment_method"
              :options="paymentMethods"
              placeholder="All Methods"
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
              <i class="pi pi-file" />
              <span>Total Invoiced</span>
            </div>
            <div class="summary-value">
              {{ formatCurrency(reportData.summary.total_invoiced) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-money-bill" />
              <span>Total Collected</span>
            </div>
            <div class="summary-value success">
              {{ formatCurrency(reportData.summary.total_collected) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-exclamation-circle" />
              <span>Outstanding Balance</span>
            </div>
            <div class="summary-value warning">
              {{ formatCurrency(reportData.summary.outstanding_balance) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-chart-line" />
              <span>Collection Rate</span>
            </div>
            <div class="summary-value" :class="getCollectionRateSeverity">
              {{ reportData.summary.collection_rate }}%
            </div>
          </template>
        </Card>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <Card>
          <template #header>
            <h3>Collection Rate by Outlet</h3>
          </template>
          <template #content>
            <Chart type="bar" :data="collectionRateChartData" :options="chartOptions" />
          </template>
        </Card>

        <Card>
          <template #header>
            <h3>Payment Methods</h3>
          </template>
          <template #content>
            <Chart type="pie" :data="paymentMethodChartData" :options="pieChartOptions" />
          </template>
        </Card>
      </div>

      <!-- Tabs for different views -->
      <TabView class="report-tabs">
        <!-- By Outlet Tab -->
        <TabPanel header="By Outlet">
          <DataTable
            :value="reportData.by_outlet"
            :paginator="true"
            :rows="10"
            sort-field="collection_rate"
            :sort-order="-1"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="outlet_name" header="Outlet" sortable />
            <Column field="invoiced" header="Invoiced" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.invoiced) }}
              </template>
            </Column>
            <Column field="collected" header="Collected" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.collected) }}
              </template>
            </Column>
            <Column field="outstanding" header="Outstanding" sortable>
              <template #body="{ data }">
                <span :class="data.outstanding > 0 ? 'text-warning' : ''">
                  {{ formatCurrency(data.outstanding) }}
                </span>
              </template>
            </Column>
            <Column field="collection_rate" header="Collection Rate" sortable>
              <template #body="{ data }">
                <Tag
                  :value="`${data.collection_rate}%`"
                  :severity="getPercentageSeverity(data.collection_rate)"
                />
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- By Payment Method Tab -->
        <TabPanel header="By Payment Method">
          <DataTable
            :value="reportData.by_method"
            :paginator="true"
            :rows="10"
            sort-field="total_amount"
            :sort-order="-1"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="payment_method" header="Payment Method" sortable>
              <template #body="{ data }">
                <div class="method-cell">
                  <i :class="getPaymentMethodIcon(data.payment_method)" />
                  <span>{{ formatPaymentMethod(data.payment_method) }}</span>
                </div>
              </template>
            </Column>
            <Column field="count" header="Count" sortable />
            <Column field="total_amount" header="Total Amount" sortable>
              <template #body="{ data }">
                <strong>{{ formatCurrency(data.total_amount) }}</strong>
              </template>
            </Column>
            <Column header="Percentage">
              <template #body="{ data }">
                {{
                  calculatePercentage(
                    data.total_amount,
                    reportData.summary.total_collected
                  ).toFixed(2)
                }}%
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>

    <!-- Empty State -->
    <Card v-else class="empty-state">
      <template #content>
        <i class="pi pi-money-bill" style="font-size: 3rem; color: var(--surface-400)" />
        <p>Select filters and click "Generate Report" to view payment collection analysis</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { outletService } from '@/services/outletService';
import reportService from '@/services/reportService';
import { createCSVHeader } from '@/utils/exportHelpers';
import {
  calculatePercentage,
  formatCurrency,
  formatPaymentMethod,
  getPaymentMethodIcon,
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
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();

// Data
const loading = ref(false);
const reportData = ref(null);
const outlets = ref([]);

const paymentMethods = ['cash', 'check', 'credit', 'bank_transfer'];

// Filters
const filters = ref({
  date_from: null,
  date_to: null,
  outlet_id: null,
  payment_method: null,
});

// Load Report
const loadReport = async () => {
  try {
    loading.value = true;
    const params = {};

    if (filters.value.date_from) {
      params.date_from = filters.value.date_from.toISOString().split('T')[0];
    }
    if (filters.value.date_to) {
      params.date_to = filters.value.date_to.toISOString().split('T')[0];
    }
    if (filters.value.outlet_id) {
      params.outlet_id = filters.value.outlet_id;
    }
    if (filters.value.payment_method) {
      params.payment_method = filters.value.payment_method;
    }

    reportData.value = await reportService.getPaymentCollectionReport(params);
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

// Load outlets
const loadOutlets = async () => {
  try {
    outlets.value = await outletService.getAllOutlets();
  } catch (error) {
    console.error('Failed to load outlets:', error);
  }
};

// Collection Rate Severity
const getCollectionRateSeverity = computed(() => {
  if (!reportData.value) return '';
  const rate = parseFloat(reportData.value.summary.collection_rate);
  if (rate >= 90) return 'success';
  if (rate >= 70) return 'info';
  if (rate >= 50) return 'warning';
  return 'danger';
});

// Collection Rate Chart
const collectionRateChartData = computed(() => {
  if (!reportData.value?.by_outlet) return null;

  const top10 = reportData.value.by_outlet.slice(0, 10);

  return {
    labels: top10.map(d => d.outlet_name),
    datasets: [
      {
        label: 'Collection Rate (%)',
        data: top10.map(d => parseFloat(d.collection_rate)),
        backgroundColor: '#667eea',
      },
    ],
  };
});

// Payment Method Chart
const paymentMethodChartData = computed(() => {
  if (!reportData.value?.by_method) return null;

  return {
    labels: reportData.value.by_method.map(m => formatPaymentMethod(m.payment_method)),
    datasets: [
      {
        data: reportData.value.by_method.map(m => m.total_amount),
        backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
};

// Export CSV
const handleExportCSV = () => {
  if (!reportData.value) return;

  const csvData = [];
  csvData.push(
    createCSVHeader('Payment Collection Report', {
      date_from: filters.value.date_from?.toISOString().split('T')[0],
      date_to: filters.value.date_to?.toISOString().split('T')[0],
    })
  );

  csvData.push('\nCollection Summary\n');
  csvData.push(
    `Total Invoiced,${reportData.value.summary.total_invoiced}\nTotal Collected,${reportData.value.summary.total_collected}\nOutstanding,${reportData.value.summary.outstanding_balance}\nCollection Rate,${reportData.value.summary.collection_rate}%`
  );

  const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payment_collection_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export PDF
const handleExportPDF = () => {
  window.print();
};

onMounted(() => {
  loadOutlets();
});
</script>

<style scoped>
.payment-collection-report {
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
  color: var(--text-color);
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
  color: var(--text-color);
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

.summary-value.info {
  color: #3b82f6;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.charts-grid h3 {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 1rem;
  margin: 0;
  border-bottom: 1px solid var(--surface-border);
}

.charts-grid :deep(.p-card-content) {
  min-height: 300px;
}

.report-tabs {
  margin-top: 2rem;
}

.report-table {
  margin-top: 1rem;
}

.method-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.method-cell i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.text-warning {
  color: #f59e0b;
  font-weight: 600;
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
