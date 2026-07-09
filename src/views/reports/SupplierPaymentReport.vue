<template>
  <div class="supplier-payment-report">
    <div class="page-header">
      <div>
        <h1>Supplier Payment Report</h1>
        <p class="subtitle">Track supplier payables and payment history</p>
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
            <label>Supplier</label>
            <Select
              v-model="filters.supplier_id"
              :options="suppliers"
              option-label="name"
              option-value="id"
              placeholder="All Suppliers"
              show-clear
              filter
              resetFilterOnHide
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
              <i class="pi pi-shopping-bag" />
              <span>Total Purchased</span>
            </div>
            <div class="summary-value">
              {{ formatCurrency(reportData.summary.total_purchased) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-check-circle" />
              <span>Total Paid</span>
            </div>
            <div class="summary-value success">
              {{ formatCurrency(reportData.summary.total_paid) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-exclamation-triangle" />
              <span>Outstanding Payables</span>
            </div>
            <div class="summary-value warning">
              {{ formatCurrency(reportData.summary.outstanding_payables) }}
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="summary-header">
              <i class="pi pi-file" />
              <span>Payment Count</span>
            </div>
            <div class="summary-value">
              {{ reportData.summary.payment_count }}
            </div>
          </template>
        </Card>
      </div>

      <!-- Tabs -->
      <TabView class="report-tabs">
        <!-- By Supplier Tab -->
        <TabPanel header="By Supplier">
          <DataTable
            :value="reportData.by_supplier"
            :paginator="true"
            :rows="10"
            sort-field="outstanding"
            :sort-order="-1"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="supplier_name" header="Supplier" sortable />
            <Column field="purchased" header="Purchased" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.purchased) }}
              </template>
            </Column>
            <Column field="paid" header="Paid" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.paid) }}
              </template>
            </Column>
            <Column field="outstanding" header="Outstanding" sortable>
              <template #body="{ data }">
                <Tag
                  :value="formatCurrency(data.outstanding)"
                  :severity="data.outstanding > 0 ? 'warning' : 'success'"
                />
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- Recent Payments Tab -->
        <TabPanel header="Recent Payments">
          <DataTable
            :value="reportData.recent_payments"
            :paginator="true"
            :rows="10"
            responsive-layout="scroll"
            class="report-table"
          >
            <Column field="payment_date" header="Payment Date" sortable>
              <template #body="{ data }">
                {{ formatDate(data.payment_date) }}
              </template>
            </Column>
            <Column field="supplier.supplier_name" header="Supplier" sortable />
            <Column field="purchase_order.po_number" header="PO Number" sortable />
            <Column field="amount" header="Amount" sortable>
              <template #body="{ data }">
                {{ formatCurrency(data.amount) }}
              </template>
            </Column>
            <Column field="payment_method" header="Payment Method" sortable>
              <template #body="{ data }">
                {{ formatPaymentMethod(data.payment_method) }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </div>

    <!-- Empty State -->
    <Card v-else class="empty-state">
      <template #content>
        <i class="pi pi-users" style="font-size: 3rem; color: var(--surface-400)" />
        <p>Select filters and click "Generate Report" to view supplier payment analysis</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import reportService from '@/services/reportService';
import { supplierService } from '@/services/supplierService';
import { createCSVHeader } from '@/utils/exportHelpers';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/utils/reportFormatters';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();

const loading = ref(false);
const reportData = ref(null);
const suppliers = ref([]);

const filters = ref({
  date_from: null,
  date_to: null,
  supplier_id: null,
});

const loadReport = async () => {
  try {
    loading.value = true;
    const params = {};
    if (filters.value.date_from)
      params.date_from = filters.value.date_from.toISOString().split('T')[0];
    if (filters.value.date_to) params.date_to = filters.value.date_to.toISOString().split('T')[0];
    if (filters.value.supplier_id) params.supplier_id = filters.value.supplier_id;

    reportData.value = await reportService.getSupplierPaymentReport(params);
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

const loadSuppliers = async () => {
  try {
    const suppliersData = await supplierService.getAllSuppliers({ page: 1, limit: 9999, status: 'active' });
    // Extract array from paginated response
    suppliers.value = suppliersData.suppliers || suppliersData;
  } catch (error) {
    console.error('Failed to load suppliers:', error);
  }
};

const handleExportCSV = () => {
  if (!reportData.value) return;
  const csvData = [
    createCSVHeader('Supplier Payment Report', {
      date_from: filters.value.date_from?.toISOString().split('T')[0],
      date_to: filters.value.date_to?.toISOString().split('T')[0],
    }),
  ];
  const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `supplier_payment_report_${new Date().toISOString().split('T')[0]}.csv`;
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

  loadSuppliers();
});
</script>

<style scoped>
.supplier-payment-report {
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
