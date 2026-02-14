<template>
  <div class="outlet-balance-report">
    <div class="page-header">
      <div>
        <h1>Outlet Balance & Aging Report</h1>
        <p class="subtitle">Monitor credit balances and aging analysis</p>
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
            <label>Outlet</label>
            <Dropdown
              v-model="filters.outlet_id"
              :options="outlets"
              option-label="name"
              option-value="id"
              placeholder="All Outlets"
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
              <i class="pi pi-building" />
              <span>Total Outlets</span>
            </div>
            <div class="summary-value">
              {{ reportData.summary.total_outlets }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-dollar" />
              <span>Total Outstanding</span>
            </div>
            <div class="summary-value warning">
              {{ formatCurrency(reportData.summary.total_outstanding) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-wallet" />
              <span>Total Credit Limit</span>
            </div>
            <div class="summary-value">
              {{ formatCurrency(reportData.summary.total_credit_limit) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-exclamation-circle" />
              <span>Over Limit</span>
            </div>
            <div class="summary-value danger">
              {{ reportData.summary.outlets_over_limit }}
            </div>
          </template>
        </Card>
      </div>

      <!-- Outlet Details Table -->
      <Card>
        <template #header>
          <h3>Outlet Details</h3>
        </template>
        <template #content>
          <DataTable
            :value="reportData.outlets"
            :paginator="true"
            :rows="10"
            sort-field="current_balance"
            :sort-order="-1"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="outlet_name" header="Outlet" sortable />
            <Column field="area" header="Area" sortable />
            <Column field="current_balance" header="Current Balance" sortable>
              <template #body="{ data }">
                <Tag
                  :value="formatCurrency(data.current_balance)"
                  :severity="data.current_balance > data.credit_limit ? 'danger' : 'info'"
                />
              </template>
            </Column>
            <Column field="credit_limit" header="Credit Limit" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.credit_limit) }}
              </template>
            </Column>
            <Column field="available_credit" header="Available Credit" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.available_credit) }}
              </template>
            </Column>
            <Column field="credit_utilization" header="Utilization" sortable>
              <template #body="{ data }">
                <Tag
                  :value="`${data.credit_utilization}%`"
                  :severity="
                    getPercentageSeverity(data.credit_utilization, {
                      excellent: 100,
                      good: 80,
                      warning: 60,
                    })
                  "
                />
              </template>
            </Column>
            <Column field="outstanding_invoices" header="Outstanding Invoices" sortable />
            <Column header="Aging">
              <template #body="{ data }">
                <Button
                  label="View"
                  icon="pi pi-eye"
                  class="p-button-sm p-button-text"
                  @click="viewAging(data)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else class="empty-state">
      <template #content>
        <i class="pi pi-building" style="font-size: 3rem; color: var(--surface-400)" />
        <p>Click "Generate Report" to view outlet balance and aging analysis</p>
      </template>
    </Card>

    <!-- Aging Dialog -->
    <Dialog
      v-model:visible="agingDialogVisible"
      :header="`Aging Analysis - ${selectedOutlet?.outlet_name}`"
      :modal="true"
      :style="{ width: '50vw' }"
    >
      <div v-if="selectedOutlet" class="aging-details">
        <div class="aging-row">
          <span class="aging-label">Current:</span>
          <span class="aging-value">{{ formatCurrency(selectedOutlet.aging.current) }}</span>
        </div>
        <div class="aging-row">
          <span class="aging-label">0-30 Days:</span>
          <span class="aging-value">{{ formatCurrency(selectedOutlet.aging.days_30) }}</span>
        </div>
        <div class="aging-row">
          <span class="aging-label">31-60 Days:</span>
          <span class="aging-value warning">{{
            formatCurrency(selectedOutlet.aging.days_60)
          }}</span>
        </div>
        <div class="aging-row">
          <span class="aging-label">Over 90 Days:</span>
          <span class="aging-value danger">{{
            formatCurrency(selectedOutlet.aging.days_over_90)
          }}</span>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { outletService } from '@/services/outletService';
import reportService from '@/services/reportService';
import { createCSVHeader } from '@/utils/exportHelpers';
import { formatCurrency, getPercentageSeverity } from '@/utils/reportFormatters';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const loading = ref(false);
const reportData = ref(null);
const outlets = ref([]);
const agingDialogVisible = ref(false);
const selectedOutlet = ref(null);

const filters = ref({
  outlet_id: null,
});

const loadReport = async () => {
  try {
    loading.value = true;
    const params = {};
    if (filters.value.outlet_id) params.outlet_id = filters.value.outlet_id;
    reportData.value = await reportService.getOutletBalanceReport(params);
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

const loadOutlets = async () => {
  try {
    const outletsData = await outletService.getAll();
    // Extract array from paginated response
    outlets.value = outletsData.outlets || outletsData;
  } catch (error) {
    console.error('Failed to load outlets:', error);
  }
};

const viewAging = outlet => {
  selectedOutlet.value = outlet;
  agingDialogVisible.value = true;
};

const handleExportCSV = () => {
  if (!reportData.value) return;
  const csvData = [createCSVHeader('Outlet Balance & Aging Report', {})];
  const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `outlet_balance_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const handleExportPDF = () => {
  window.print();
};

onMounted(() => {
  loadOutlets();
});
</script>

<style scoped>
.outlet-balance-report {
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
.summary-value.warning {
  color: #f59e0b;
}
.summary-value.danger {
  color: #ef4444;
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
.aging-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.aging-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-border);
}
.aging-label {
  font-weight: 600;
}
.aging-value {
  font-weight: 600;
}
.aging-value.warning {
  color: #f59e0b;
}
.aging-value.danger {
  color: #ef4444;
}
@media print {
  .page-header .header-actions,
  .filter-card {
    display: none !important;
  }
}
</style>
