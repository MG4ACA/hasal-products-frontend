<template>
  <div class="check-status-report">
    <div class="page-header">
      <div>
        <h1>Check Status Report</h1>
        <p class="subtitle">Track check payments and aging analysis</p>
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
            <label>Status</label>
            <Dropdown
              v-model="filters.status"
              :options="statusOptions"
              placeholder="All Statuses"
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
              <i class="pi pi-clock" />
              <span>Pending Checks</span>
            </div>
            <div class="summary-value warning">
              {{ reportData.summary.pending_checks }}
            </div>
            <div class="summary-footer">
              {{ formatCurrency(reportData.summary.pending_amount) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-check-circle" />
              <span>Cleared Checks</span>
            </div>
            <div class="summary-value success">
              {{ reportData.summary.cleared_checks }}
            </div>
            <div class="summary-footer">
              {{ formatCurrency(reportData.summary.cleared_amount) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-times-circle" />
              <span>Bounced Checks</span>
            </div>
            <div class="summary-value danger">
              {{ reportData.summary.bounced_checks }}
            </div>
            <div class="summary-footer">
              {{ formatCurrency(reportData.summary.bounced_amount) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-exclamation-triangle" />
              <span>Overdue Checks</span>
            </div>
            <div class="summary-value danger">
              {{ reportData.summary.overdue_checks }}
            </div>
            <div class="summary-footer">
              {{ formatCurrency(reportData.summary.overdue_amount) }}
            </div>
          </template>
        </Card>
      </div>

      <!-- Status Distribution Chart -->
      <Card class="chart-card">
        <template #header>
          <h3>Check Status Distribution</h3>
        </template>
        <template #content>
          <Chart type="doughnut" :data="statusChartData" :options="chartOptions" />
        </template>
      </Card>

      <!-- Checks Table -->
      <TabView class="report-tabs">
        <TabPanel header="All Checks">
          <DataTable
            :value="reportData.checks"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="check_number" header="Check Number" sortable />
            <Column field="check_date" header="Check Date" sortable>
              <template #body="{ data }">
                {{ formatDate(data.check_date) }}
              </template>
            </Column>
            <Column field="outlet.outlet_name" header="Outlet" sortable />
            <Column field="amount" header="Amount" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.amount) }}
              </template>
            </Column>
            <Column field="status" header="Status" sortable>
              <template #body="{ data }">
                <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
              </template>
            </Column>
            <Column field="days_pending" header="Days Pending" sortable>
              <template #body="{ data }">
                <Tag
                  v-if="data.status === 'pending'"
                  :value="`${data.days_pending} days`"
                  :severity="getAgingSeverity(data.days_pending)"
                />
                <span v-else>-</span>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel header="Overdue Checks">
          <DataTable
            :value="overdueChecks"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="check_number" header="Check Number" sortable />
            <Column field="check_date" header="Check Date" sortable>
              <template #body="{ data }">
                {{ formatDate(data.check_date) }}
              </template>
            </Column>
            <Column field="outlet.outlet_name" header="Outlet" sortable />
            <Column field="amount" header="Amount" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.amount) }}
              </template>
            </Column>
            <Column field="days_pending" header="Days Pending" sortable>
              <template #body="{ data }">
                <Tag :value="`${data.days_pending} days`" severity="danger" />
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
        <p>Select filters and click "Generate Report" to view check status analysis</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import reportService from '@/services/reportService';
import { createCSVHeader } from '@/utils/exportHelpers';
import { formatCurrency, formatDate, getAgingSeverity } from '@/utils/reportFormatters';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const loading = ref(false);
const reportData = ref(null);

const statusOptions = ['pending', 'cleared', 'bounced'];

const filters = ref({
  date_from: null,
  date_to: null,
  status: null,
});

const overdueChecks = computed(() => {
  if (!reportData.value) return [];
  return reportData.value.checks.filter(
    check => check.status === 'pending' && check.days_pending > 30
  );
});

const statusChartData = computed(() => {
  if (!reportData.value) return {};
  return {
    labels: ['Pending', 'Cleared', 'Bounced'],
    datasets: [
      {
        data: [
          reportData.value.summary.pending_checks,
          reportData.value.summary.cleared_checks,
          reportData.value.summary.bounced_checks,
        ],
        backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
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
    if (filters.value.status) params.status = filters.value.status;
    reportData.value = await reportService.getCheckStatusReport(params);
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

const getStatusSeverity = status => {
  const severityMap = {
    pending: 'warning',
    cleared: 'success',
    bounced: 'danger',
  };
  return severityMap[status] || 'info';
};

const handleExportCSV = () => {
  if (!reportData.value) return;
  const csvData = [
    createCSVHeader('Check Status Report', {
      date_from: filters.value.date_from?.toISOString().split('T')[0],
      date_to: filters.value.date_to?.toISOString().split('T')[0],
    }),
  ];
  const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `check_status_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const handleExportPDF = () => {
  window.print();
};

onMounted(() => {
  // Set default date range to current month
  const now = new Date();
  filters.value.date_from = new Date(now.getFullYear(), now.getMonth(), 1);
  filters.value.date_to = now;

  // Load initial data if needed
});
</script>

<style scoped>
.check-status-report {
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
.summary-footer {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}
.chart-card {
  margin-bottom: 2rem;
}
.chart-card :deep(.p-card-content) {
  height: 300px;
}
.report-tabs {
  margin-top: 2rem;
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
