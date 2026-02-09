<template>
  <div class="wastage-report">
    <div class="page-header">
      <div>
        <h1>Wastage Report</h1>
        <p class="subtitle">Monthly wastage cost analysis for P&L reporting</p>
      </div>
    </div>

    <!-- Month Selector -->
    <Card class="selector-card">
      <template #content>
        <div class="month-selector">
          <div class="selector-group">
            <label>Year</label>
            <Dropdown v-model="selectedYear" :options="years" @change="loadReport" />
          </div>
          <div class="selector-group">
            <label>Month</label>
            <Dropdown
              v-model="selectedMonth"
              :options="months"
              option-label="name"
              option-value="value"
              @change="loadReport"
            />
          </div>
          <Button
            label="Load Report"
            icon="pi pi-refresh"
            :loading="wastageStore.loading"
            @click="loadReport"
          />
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div v-if="wastageStore.loading" class="loading-state">
      <ProgressSpinner />
      <p>Loading report...</p>
    </div>

    <!-- Report Content -->
    <div v-else-if="wastageStore.monthlySummary">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <Card class="summary-card highlight">
          <template #content>
            <div class="card-content">
              <i class="pi pi-exclamation-triangle card-icon" />
              <div>
                <div class="card-value">
                  {{ formatCurrency(wastageStore.monthlySummary.summary.total_wastage_cost) }}
                </div>
                <div class="card-label">Total Wastage Cost</div>
              </div>
            </div>
          </template>
        </Card>

        <Card class="summary-card">
          <template #content>
            <div class="card-content">
              <i class="pi pi-list card-icon" />
              <div>
                <div class="card-value">
                  {{ wastageStore.monthlySummary.summary.total_records }}
                </div>
                <div class="card-label">Total Records</div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Wastage by Type -->
      <Card class="report-section">
        <template #title>
          <h3><i class="pi pi-chart-pie" /> Wastage by Type</h3>
        </template>
        <template #content>
          <DataTable
            :value="wastageStore.monthlySummary.wastage_by_type"
            responsive-layout="scroll"
            class="p-datatable-sm"
          >
            <Column field="wastage_type" header="Type">
              <template #body="{ data }">
                <Tag
                  :value="formatWastageType(data.wastage_type)"
                  :severity="getWastageTypeSeverity(data.wastage_type)"
                />
              </template>
            </Column>
            <Column field="count" header="Records" sortable />
            <Column field="total_quantity" header="Total Quantity" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.total_quantity) }}
              </template>
            </Column>
            <Column field="total_cost" header="Total Cost (LKR)" sortable>
              <template #body="{ data }">
                <span class="cost-value">{{ formatCurrency(data.total_cost) }}</span>
              </template>
            </Column>
            <Column header="% of Total">
              <template #body="{ data }">
                <span class="percentage">{{ calculatePercentage(data.total_cost) }}%</span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Wastage by Item Type -->
      <Card class="report-section">
        <template #title>
          <h3><i class="pi pi-box" /> Wastage by Item Type</h3>
        </template>
        <template #content>
          <DataTable
            :value="wastageStore.monthlySummary.wastage_by_item_type"
            responsive-layout="scroll"
            class="p-datatable-sm"
          >
            <Column field="item_type" header="Item Type">
              <template #body="{ data }">
                <Tag
                  :value="data.item_type === 'raw_material' ? 'Raw Material' : 'Finished Goods'"
                />
              </template>
            </Column>
            <Column field="count" header="Records" sortable />
            <Column field="total_quantity" header="Total Quantity" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.total_quantity) }}
              </template>
            </Column>
            <Column field="total_cost" header="Total Cost (LKR)" sortable>
              <template #body="{ data }">
                <span class="cost-value">{{ formatCurrency(data.total_cost) }}</span>
              </template>
            </Column>
            <Column header="% of Total">
              <template #body="{ data }">
                <span class="percentage">{{ calculatePercentage(data.total_cost) }}%</span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Top Wasted Items -->
      <Card class="report-section">
        <template #title>
          <h3><i class="pi pi-sort-amount-down" /> Top 10 Wasted Items</h3>
        </template>
        <template #content>
          <DataTable
            :value="wastageStore.monthlySummary.top_wasted_items"
            responsive-layout="scroll"
            class="p-datatable-sm"
          >
            <Column field="item_name" header="Item" style="min-width: 200px" />
            <Column field="item_type" header="Type">
              <template #body="{ data }">
                <Tag
                  :value="data.item_type === 'raw_material' ? 'Raw Material' : 'Finished Goods'"
                  size="small"
                />
              </template>
            </Column>
            <Column field="count" header="Times Wasted" sortable />
            <Column field="total_quantity" header="Total Quantity" sortable>
              <template #body="{ data }">
                {{ formatNumber(data.total_quantity) }}
              </template>
            </Column>
            <Column field="total_cost" header="Total Cost (LKR)" sortable>
              <template #body="{ data }">
                <span class="cost-value">{{ formatCurrency(data.total_cost) }}</span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Action Buttons -->
      <div class="report-actions">
        <Button label="Print Report" icon="pi pi-print" outlined @click="printReport" />
        <Button label="Export to CSV" icon="pi pi-download" outlined @click="exportReport" />
      </div>
    </div>

    <!-- No Data State -->
    <Card v-else class="no-data">
      <template #content>
        <div class="empty-state">
          <i class="pi pi-inbox" style="font-size: 3rem; color: #cbd5e1" />
          <p>No wastage data for selected period</p>
          <Button label="Select Another Month" outlined @click="() => {}" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useWastageStore } from '@/stores/wastage';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const wastageStore = useWastageStore();
const toast = useToast();

// Data
const currentDate = new Date();
const selectedYear = ref(currentDate.getFullYear());
const selectedMonth = ref(currentDate.getMonth() + 1);

const years = ref([]);
const months = [
  { name: 'January', value: 1 },
  { name: 'February', value: 2 },
  { name: 'March', value: 3 },
  { name: 'April', value: 4 },
  { name: 'May', value: 5 },
  { name: 'June', value: 6 },
  { name: 'July', value: 7 },
  { name: 'August', value: 8 },
  { name: 'September', value: 9 },
  { name: 'October', value: 10 },
  { name: 'November', value: 11 },
  { name: 'December', value: 12 },
];

// Methods
const loadReport = async () => {
  try {
    await wastageStore.fetchMonthlySummary(selectedYear.value, selectedMonth.value);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load report',
      life: 3000,
    });
  }
};

const calculatePercentage = cost => {
  const total = parseFloat(wastageStore.monthlySummary?.summary.total_wastage_cost || 0);
  if (total === 0) return '0.00';
  return ((parseFloat(cost) / total) * 100).toFixed(2);
};

const formatNumber = num => {
  return parseFloat(num || 0).toFixed(2);
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const formatWastageType = type => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getWastageTypeSeverity = type => {
  const severityMap = {
    expiry: 'warning',
    damage: 'danger',
    production: 'info',
    quality_reject: 'warning',
    spillage: 'info',
    theft: 'danger',
    other: 'secondary',
  };
  return severityMap[type] || 'secondary';
};

const printReport = () => {
  window.print();
};

const exportReport = () => {
  // Simple CSV export
  if (!wastageStore.monthlySummary) return;

  let csv = 'Wastage Report\n\n';
  csv += `Period: ${months.find(m => m.value === selectedMonth.value)?.name} ${selectedYear.value}\n\n`;
  csv += `Total Wastage Cost:,${wastageStore.monthlySummary.summary.total_wastage_cost}\n`;
  csv += `Total Records:,${wastageStore.monthlySummary.summary.total_records}\n\n`;

  csv += 'Wastage by Type\n';
  csv += 'Type,Count,Total Quantity,Total Cost\n';
  wastageStore.monthlySummary.wastage_by_type.forEach(item => {
    csv += `${item.wastage_type},${item.count},${item.total_quantity},${item.total_cost}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wastage_report_${selectedYear.value}_${selectedMonth.value}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Report exported successfully',
    life: 3000,
  });
};

// Lifecycle
onMounted(() => {
  // Generate years (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 3; i++) {
    years.value.push(currentYear - i);
  }

  // Load current month report
  loadReport();
});
</script>

<style scoped>
.wastage-report {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: #1e293b;
}

.subtitle {
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.selector-card {
  margin-bottom: 1.5rem;
}

.month-selector {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.selector-group {
  flex: 1;
  max-width: 200px;
}

.selector-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
  font-size: 0.875rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #64748b;
}

.loading-state p {
  margin-top: 1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-card.highlight {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.summary-card.highlight .card-icon {
  color: rgba(255, 255, 255, 0.9);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
  font-size: 2.5rem;
  color: #3b82f6;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.card-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.report-section {
  margin-bottom: 1.5rem;
}

.report-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.cost-value {
  font-weight: 600;
  color: #dc2626;
}

.percentage {
  font-weight: 600;
  color: #64748b;
}

.report-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #94a3b8;
}

.empty-state p {
  margin: 1rem 0 1.5rem 0;
  font-size: 1.1rem;
}

@media print {
  .selector-card,
  .report-actions,
  .page-header .subtitle {
    display: none;
  }

  .wastage-report {
    padding: 0;
  }

  .summary-card.highlight {
    background: white;
    color: black;
    border: 2px solid #dc2626;
  }
}
</style>
