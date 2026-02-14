<template>
  <div class="inventory-report">
    <div class="page-header">
      <div>
        <h1>Inventory Valuation Report</h1>
        <p class="subtitle">Track raw materials and finished goods inventory</p>
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
            <label>Inventory Type</label>
            <Dropdown
              v-model="filters.type"
              :options="inventoryTypes"
              placeholder="All Types"
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
              <i class="pi pi-box" />
              <span>Raw Materials Value</span>
            </div>
            <div class="summary-value">
              {{ formatCurrency(reportData.summary.raw_materials_value) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-shopping-cart" />
              <span>Finished Goods Value</span>
            </div>
            <div class="summary-value">
              {{ formatCurrency(reportData.summary.finished_goods_value) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-dollar" />
              <span>Total Inventory Value</span>
            </div>
            <div class="summary-value">
              {{ formatCurrency(reportData.summary.total_inventory_value) }}
            </div>
          </template>
        </Card>
        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-exclamation-triangle" />
              <span>Low Stock Items</span>
            </div>
            <div class="summary-value warning">
              {{ reportData.summary.low_stock_items }}
            </div>
          </template>
        </Card>
      </div>

      <!-- Valuation Chart -->
      <Card class="chart-card">
        <template #header>
          <h3>Inventory Valuation Breakdown</h3>
        </template>
        <template #content>
          <Chart type="pie" :data="valuationChartData" :options="chartOptions" />
        </template>
      </Card>

      <!-- Inventory Tabs -->
      <TabView class="report-tabs">
        <TabPanel header="Raw Materials">
          <DataTable
            :value="reportData.raw_materials"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="material_name" header="Material" sortable />
            <Column field="current_stock" header="Stock" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.current_stock) }} {{ data.unit }}
              </template>
            </Column>
            <Column field="unit_price" header="Unit Price" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.unit_price) }}
              </template>
            </Column>
            <Column field="total_value" header="Total Value" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.total_value) }}
              </template>
            </Column>
            <Column field="reorder_level" header="Reorder Level" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.reorder_level) }} {{ data.unit }}
              </template>
            </Column>
            <Column header="Status">
              <template #body="{ data }">
                <Tag
                  v-if="data.current_stock <= data.reorder_level"
                  value="Low Stock"
                  severity="warning"
                />
                <Tag v-else value="Normal" severity="success" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel header="Finished Goods">
          <DataTable
            :value="reportData.finished_goods"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="product_name" header="Product" sortable />
            <Column field="sku_code" header="SKU" sortable />
            <Column field="current_stock" header="Stock" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.current_stock) }} {{ data.unit }}
              </template>
            </Column>
            <Column field="unit_price" header="Unit Price" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.unit_price) }}
              </template>
            </Column>
            <Column field="total_value" header="Total Value" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.total_value) }}
              </template>
            </Column>
            <Column field="reorder_level" header="Reorder Level" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.reorder_level) }} {{ data.unit }}
              </template>
            </Column>
            <Column header="Status">
              <template #body="{ data }">
                <Tag
                  v-if="data.current_stock <= data.reorder_level"
                  value="Low Stock"
                  severity="warning"
                />
                <Tag v-else value="Normal" severity="success" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>

    <!-- Empty State -->
    <Card v-else class="empty-state">
      <template #content>
        <i class="pi pi-inbox" style="font-size: 3rem; color: var(--surface-400)" />
        <p>Click "Generate Report" to view inventory valuation</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import reportService from '@/services/reportService';
import { createCSVHeader } from '@/utils/exportHelpers';
import { formatCurrency, formatNumber } from '@/utils/reportFormatters';
import Button from 'primevue/button';
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
import { computed, ref } from 'vue';

const toast = useToast();
const loading = ref(false);
const reportData = ref(null);

const inventoryTypes = ['raw_materials', 'finished_goods'];

const filters = ref({
  type: null,
});

const valuationChartData = computed(() => {
  if (!reportData.value) return {};
  return {
    labels: ['Raw Materials', 'Finished Goods'],
    datasets: [
      {
        data: [
          reportData.value.summary.raw_materials_value,
          reportData.value.summary.finished_goods_value,
        ],
        backgroundColor: ['#3b82f6', '#8b5cf6'],
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
    if (filters.value.type) params.type = filters.value.type;
    reportData.value = await reportService.getInventoryReport(params);
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

const handleExportCSV = () => {
  if (!reportData.value) return;
  const csvData = [createCSVHeader('Inventory Valuation Report', {})];
  const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const handleExportPDF = () => {
  window.print();
};
</script>

<style scoped>
.inventory-report {
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
