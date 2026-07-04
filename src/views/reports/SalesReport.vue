<template>
  <div class="sales-report">
    <div class="page-header">
      <div>
        <h1>Sales Report</h1>
        <p class="subtitle">Comprehensive sales analysis and trends</p>
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
            <DatePicker v-model="filters.date_from" date-format="yy-mm-dd" show-icon />
          </div>
          <div class="field">
            <label>Date To</label>
            <DatePicker v-model="filters.date_to" date-format="yy-mm-dd" show-icon />
          </div>
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
          <div class="field">
            <label>Route</label>
            <Dropdown
              v-model="filters.route_id"
              :options="routes"
              option-label="name"
              option-value="id"
              placeholder="All Routes"
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
              <i class="pi pi-shopping-cart" />
              <span>Total Invoices</span>
            </div>
            <div class="summary-value">
              {{ reportData.summary.total_invoices }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-dollar" />
              <span>Total Sales</span>
            </div>
            <div class="summary-value">
              {{ formatCurrency(reportData.summary.total_sales) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-tag" />
              <span>Total Discount</span>
            </div>
            <div class="summary-value warning">
              {{ formatCurrency(reportData.summary.total_discount) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-wallet" />
              <span>Net Sales</span>
            </div>
            <div class="summary-value success">
              {{ formatCurrency(reportData.summary.net_sales) }}
            </div>
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
            sort-field="net_sales"
            :sort-order="-1"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="outlet_name" header="Outlet" sortable />
            <Column field="address" header="Area" sortable />
            <Column field="invoices" header="Invoices" sortable />
            <Column field="total_sales" header="Total Sales" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.total_sales) }}
              </template>
            </Column>
            <Column field="total_discount" header="Discount" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.total_discount) }}
              </template>
            </Column>
            <Column field="net_sales" header="Net Sales" sortable>
              <template #body="{ data }">
                <strong>{{ formatCurrency(data.net_sales) }}</strong>
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- By Product Tab -->
        <TabPanel header="By Product">
          <DataTable
            :value="reportData.by_product"
            :paginator="true"
            :rows="10"
            sort-field="total_sales"
            :sort-order="-1"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="sku_id" header="SKU Code" sortable />
            <Column field="sku_name" header="Product Name" sortable />
            <Column field="size" header="Size" sortable />
            <Column field="quantity_sold" header="Qty Sold" sortable />
            <Column field="price" header="Unit Price" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.unit_price) }}
              </template>
            </Column>
            <Column field="total_sales" header="Total Sales" sortable>
              <template #body="{ data }">
                <strong>{{ formatCurrency(data.total_sales) }}</strong>
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- By Route Tab -->
        <TabPanel v-if="reportData.by_route.length > 0" header="By Route">
          <DataTable
            :value="reportData.by_route"
            :paginator="true"
            :rows="10"
            sort-field="net_sales"
            :sort-order="-1"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="route_name" header="Route" sortable />
            <Column field="invoices" header="Invoices" sortable />
            <Column field="total_sales" header="Total Sales" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.total_sales) }}
              </template>
            </Column>
            <Column field="net_sales" header="Net Sales" sortable>
              <template #body="{ data }">
                <strong>{{ formatCurrency(data.net_sales) }}</strong>
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- Daily Sales Tab -->
        <TabPanel header="Daily Sales">
          <Chart type="line" :data="dailySalesChartData" :options="chartOptions" class="mb-4" />
          <DataTable
            :value="reportData.daily_sales"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="date" header="Date" sortable>
              <template #body="{ data }">
                {{ formatDate(data.date) }}
              </template>
            </Column>
            <Column field="invoices" header="Invoices" sortable />
            <Column field="total_sales" header="Total Sales" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.total_sales) }}
              </template>
            </Column>
            <Column field="net_sales" header="Net Sales" sortable>
              <template #body="{ data }">
                <strong>{{ formatCurrency(data.net_sales) }}</strong>
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>

    <!-- Empty State -->
    <Card v-else class="empty-state">
      <template #content>
        <i class="pi pi-chart-bar" style="font-size: 3rem; color: var(--surface-400)" />
        <p>Select filters and click "Generate Report" to view sales analysis</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { outletService } from '@/services/outletService';
import reportService from '@/services/reportService';
import { routeService } from '@/services/routeService';
import { createCSVHeader } from '@/utils/exportHelpers';
import { formatCurrency, formatDate } from '@/utils/reportFormatters';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();

// Data
const loading = ref(false);
const reportData = ref(null);
const outlets = ref([]);
const routes = ref([]);

// Filters
const filters = ref({
  date_from: null,
  date_to: null,
  outlet_id: null,
  route_id: null,
});

// Helper function to format date to string without timezone conversion
const formatDateString = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Load Report
const loadReport = async () => {
  try {
    loading.value = true;
    const params = {};

    if (filters.value.date_from) {
      params.date_from = formatDateString(filters.value.date_from);
    }
    if (filters.value.date_to) {
      params.date_to = formatDateString(filters.value.date_to);
    }
    if (filters.value.outlet_id) {
      params.outlet_id = filters.value.outlet_id;
    }
    if (filters.value.route_id) {
      params.route_id = filters.value.route_id;
    }

    reportData.value = await reportService.getSalesReport(params);
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

// Load reference data
const loadReferenceData = async () => {
  try {
    const [outletsData, routesData] = await Promise.all([
      outletService.getAll(),
      routeService.getAll(),
    ]);
    // Extract arrays from paginated responses
    outlets.value = outletsData.outlets || outletsData;
    routes.value = routesData.routes || routesData;
  } catch (error) {
    console.error('Failed to load reference data:', error);
  }
};

// Daily Sales Chart
const dailySalesChartData = computed(() => {
  if (!reportData.value?.daily_sales) return null;

  return {
    labels: reportData.value.daily_sales.map(d => formatDate(d.date)),
    datasets: [
      {
        label: 'Net Sales',
        data: reportData.value.daily_sales.map(d => d.net_sales),
        fill: false,
        borderColor: '#667eea',
        tension: 0.4,
      },
    ],
  };
});

const chartOptions = {
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
    },
  },
};

// Export CSV
const handleExportCSV = () => {
  if (!reportData.value) return;

  const csvData = [];

  // Add summary
  csvData.push(
    createCSVHeader('Sales Report', {
      date_from: filters.value.date_from ? formatDateString(filters.value.date_from) : '',
      date_to: filters.value.date_to ? formatDateString(filters.value.date_to) : '',
    })
  );

  // By Outlet
  csvData.push('\nSales by Outlet\n');
  reportData.value.by_outlet.forEach(item => {
    csvData.push(
      `${item.outlet_name},${item.area || ''},${item.invoices},${item.total_sales},${item.total_discount},${item.net_sales}`
    );
  });

  // By Product
  csvData.push('\n\nSales by Product\n');
  reportData.value.by_product.forEach(item => {
    csvData.push(
      `${item.sku_id},${item.sku_name},${item.size},${item.quantity_sold},${item.unit_price},${item.total_sales}`
    );
  });

  const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export PDF
const handleExportPDF = () => {
  window.print();
};

onMounted(() => {
  // Set default date range to current month
  const now = new Date();
  filters.value.date_from = new Date(now.getFullYear(), now.getMonth(), 1);
  filters.value.date_to = now;

  loadReferenceData();
});
</script>

<style scoped>
.sales-report {
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
