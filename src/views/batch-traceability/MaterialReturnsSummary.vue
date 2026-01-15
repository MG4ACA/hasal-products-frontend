<template>
  <div class="material-returns-summary-page">
    <PageHeader
      title="Material Returns Summary"
      subtitle="View comprehensive returns and inventory impact by material"
    />

    <div class="content-wrapper">
      <!-- Material Selection Section -->
      <Card class="search-section">
        <template #header>
          <div class="card-header">
            <i class="pi pi-search" />
            <span>Select Material</span>
          </div>
        </template>
        <div class="search-form">
          <div class="form-group">
            <label for="material_search">Search Material by Code or Name</label>
            <InputGroup>
              <InputText
                id="material_search"
                v-model="searchQuery"
                placeholder="Enter material code or name..."
                @keyup.enter="performSearch"
              />
              <Button icon="pi pi-search" label="Search" @click="performSearch" />
            </InputGroup>
          </div>

          <div v-if="searchResults.length > 0" class="search-results">
            <h4>Available Materials</h4>
            <DataTable :value="searchResults" responsive-layout="scroll" striped-rows>
              <Column field="material_code" header="Code" />
              <Column field="material_name" header="Name" />
              <Column field="unit" header="Unit" />
              <Column field="current_stock" header="Current Stock">
                <template #body="{ data }">
                  {{ formatNumber(data.current_stock) }} {{ data.unit }}
                </template>
              </Column>
              <Column header="Action">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-arrow-right"
                    class="p-button-rounded p-button-outlined p-button-sm"
                    @click="selectMaterial(data)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </Card>

      <!-- Summary Display Section -->
      <div v-if="summaryData" class="summary-section">
        <!-- Material Header Card -->
        <Card class="material-header-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-box" />
              <span>Material Information</span>
            </div>
          </template>
          <div class="material-info">
            <div class="info-item">
              <span class="label">Material Code:</span>
              <span class="value code">{{ summaryData.material.material_code }}</span>
            </div>
            <div class="info-item">
              <span class="label">Material Name:</span>
              <span class="value">{{ summaryData.material.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">Unit:</span>
              <span class="value">{{ summaryData.material.unit }}</span>
            </div>
            <div class="info-item">
              <span class="label">Current Stock:</span>
              <span class="value"
                >{{ formatNumber(summaryData.material.current_stock) }}
                {{ summaryData.material.unit }}</span
              >
            </div>
          </div>
        </Card>

        <!-- Statistics Cards -->
        <div class="stats-grid">
          <Card class="stat-card">
            <template #header>
              <div class="stat-header success">
                <i class="pi pi-arrow-down" />
                <span>Total Received</span>
              </div>
            </template>
            <div class="stat-content">
              <div class="stat-value">
                {{ formatNumber(summaryData.total_received) }}
              </div>
              <div class="stat-unit">
                {{ summaryData.material.unit }}
              </div>
              <div class="stat-detail">{{ summaryData.receipt_count }} receipts</div>
            </div>
          </Card>

          <Card class="stat-card">
            <template #header>
              <div class="stat-header warning">
                <i class="pi pi-arrow-up" />
                <span>Total Returned</span>
              </div>
            </template>
            <div class="stat-content">
              <div class="stat-value negative">
                {{ formatNumber(summaryData.total_returned) }}
              </div>
              <div class="stat-unit">
                {{ summaryData.material.unit }}
              </div>
              <div class="stat-detail">{{ summaryData.return_count }} returns</div>
            </div>
          </Card>

          <Card class="stat-card">
            <template #header>
              <div class="stat-header info">
                <i class="pi pi-check-circle" />
                <span>Returned to Stock</span>
              </div>
            </template>
            <div class="stat-content">
              <div class="stat-value">
                {{ formatNumber(summaryData.returned_to_stock) }}
              </div>
              <div class="stat-unit">
                {{ summaryData.material.unit }}
              </div>
              <div class="stat-detail">Re-entered inventory</div>
            </div>
          </Card>

          <Card class="stat-card">
            <template #header>
              <div class="stat-header danger">
                <i class="pi pi-trash" />
                <span>Disposed</span>
              </div>
            </template>
            <div class="stat-content">
              <div class="stat-value">
                {{ formatNumber(summaryData.disposed) }}
              </div>
              <div class="stat-unit">
                {{ summaryData.material.unit }}
              </div>
              <div class="stat-detail">Removed from inventory</div>
            </div>
          </Card>
        </div>

        <!-- Key Metrics -->
        <Card class="metrics-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-chart-bar" />
              <span>Key Metrics</span>
            </div>
          </template>
          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-label">Return Rate</div>
              <div class="metric-value">{{ getReturnRate() }}%</div>
              <ProgressBar :value="getReturnRate()" :show-value="false" class="metric-bar" />
              <small>% of total received</small>
            </div>

            <div class="metric">
              <div class="metric-label">Stock Disposition %</div>
              <div class="metric-value">{{ getStockDispositionRate() }}%</div>
              <ProgressBar
                :value="getStockDispositionRate()"
                :show-value="false"
                class="metric-bar"
              />
              <small>% of returns</small>
            </div>

            <div class="metric">
              <div class="metric-label">Disposal Rate</div>
              <div class="metric-value">{{ getDisposalRate() }}%</div>
              <ProgressBar :value="getDisposalRate()" :show-value="false" class="metric-bar" />
              <small>% of returns</small>
            </div>

            <div class="metric">
              <div class="metric-label">Total Cost Impact</div>
              <div class="metric-value warning">
                {{ formatCurrency(summaryData.total_return_value) }}
              </div>
              <small>Return value</small>
            </div>
          </div>
        </Card>

        <!-- Return Reasons Breakdown -->
        <Card class="reasons-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-list" />
              <span>Return Reasons Breakdown</span>
            </div>
          </template>
          <DataTable :value="summaryData.return_reasons" responsive-layout="scroll" striped-rows>
            <Column field="reason" header="Reason">
              <template #body="{ data }">
                <Tag :value="getReasonLabel(data.reason)" severity="warning" />
              </template>
            </Column>
            <Column field="count" header="Count">
              <template #body="{ data }">
                {{ data.count }}
              </template>
            </Column>
            <Column field="quantity" header="Total Qty">
              <template #body="{ data }">
                {{ formatNumber(data.quantity) }} {{ summaryData.material.unit }}
              </template>
            </Column>
            <Column field="percentage" header="% of Returns">
              <template #body="{ data }"> {{ data.percentage }}% </template>
            </Column>
          </DataTable>
        </Card>

        <!-- Disposition Breakdown -->
        <Card class="disposition-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-sitemap" />
              <span>Disposition Breakdown</span>
            </div>
          </template>
          <div class="disposition-grid">
            <div class="disposition-item stock">
              <div class="disposition-header">
                <Tag value="Return to Stock" severity="info" />
                <span class="disposition-count">{{ summaryData.stock_count }} items</span>
              </div>
              <div class="disposition-qty">
                {{ formatNumber(summaryData.returned_to_stock) }} {{ summaryData.material.unit }}
              </div>
              <div class="disposition-percent">{{ getStockDispositionRate() }}% of returns</div>
            </div>

            <div class="disposition-item dispose">
              <div class="disposition-header">
                <Tag value="Dispose" severity="danger" />
                <span class="disposition-count">{{ summaryData.dispose_count }} items</span>
              </div>
              <div class="disposition-qty">
                {{ formatNumber(summaryData.disposed) }} {{ summaryData.material.unit }}
              </div>
              <div class="disposition-percent">{{ getDisposalRate() }}% of returns</div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Loading and Error States -->
      <div v-if="loading" class="loading-state">
        <ProgressSpinner />
        <p>Loading material returns summary...</p>
      </div>

      <div v-if="error" class="error-state">
        <Message severity="error" :text="error" @close="error = null" />
      </div>

      <!-- Empty State -->
      <div v-if="!summaryData && !loading && !error" class="empty-state-card">
        <Card>
          <div class="empty-state">
            <i class="pi pi-inbox" style="font-size: 3rem; color: #cbd5e0" />
            <p style="margin-top: 16px; color: #718096">
              Search and select a material to view its returns summary
            </p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHeader from '@/components/common/PageHeader.vue';
import purchaseOrderService from '@/services/purchaseOrderService';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ref } from 'vue';

const searchQuery = ref('');
const searchResults = ref([]);
const summaryData = ref(null);
const loading = ref(false);
const error = ref(null);

const returnReasons = {
  damaged: 'Damaged',
  expired: 'Expired',
  excess: 'Excess',
  quality_issue: 'Quality Issue',
  wrong_item: 'Wrong Item',
  other: 'Other',
};

const getReasonLabel = reason => {
  return returnReasons[reason] || reason;
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    error.value = 'Please enter a search term';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // This would be implemented with a backend search endpoint
    searchResults.value = [];
    error.value = 'Material search endpoint not yet implemented.';
  } catch (err) {
    error.value = err.message || 'Failed to search materials';
  } finally {
    loading.value = false;
  }
};

const selectMaterial = async material => {
  loading.value = true;
  error.value = null;

  try {
    summaryData.value = await purchaseOrderService.getMaterialReturnsSummary(material.id);
  } catch (err) {
    error.value = err.message || 'Failed to load material summary';
    summaryData.value = null;
  } finally {
    loading.value = false;
  }
};

const getReturnRate = () => {
  if (!summaryData.value || !summaryData.value.total_received) return 0;
  return Math.round((summaryData.value.total_returned / summaryData.value.total_received) * 100);
};

const getStockDispositionRate = () => {
  if (!summaryData.value || !summaryData.value.total_returned) return 0;
  return Math.round((summaryData.value.returned_to_stock / summaryData.value.total_returned) * 100);
};

const getDisposalRate = () => {
  if (!summaryData.value || !summaryData.value.total_returned) return 0;
  return Math.round((summaryData.value.disposed / summaryData.value.total_returned) * 100);
};
</script>

<style scoped>
.material-returns-summary-page {
  padding: 20px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #2d3748;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
}

.search-results {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.material-header-card {
  border-left: 4px solid #2563eb;
}

.material-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
}

.info-item .label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.info-item .value {
  color: #2d3748;
  font-size: 1rem;
  font-weight: 500;
}

.value.code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #2563eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  border-left: 4px solid #999;
  position: relative;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: white;
  padding: 12px 16px;
  border-radius: 4px 4px 0 0;
}

.stat-header.success {
  background: #10b981;
}

.stat-header.warning {
  background: #f59e0b;
}

.stat-header.info {
  background: #2563eb;
}

.stat-header.danger {
  background: #ef4444;
}

.stat-content {
  padding: 20px 16px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-value.negative {
  color: #ef4444;
}

.stat-unit {
  color: #718096;
  font-size: 0.9rem;
  margin: 4px 0;
}

.stat-detail {
  color: #4a5568;
  font-size: 0.85rem;
  margin-top: 8px;
}

.metrics-card {
  border-left: 4px solid #2563eb;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 6px;
}

.metric-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.metric-value.warning {
  color: #f59e0b;
}

.metric-bar {
  margin: 8px 0;
}

.metric small {
  color: #718096;
  font-size: 0.85rem;
}

.reasons-card {
  border-left: 4px solid #10b981;
}

.disposition-card {
  border-left: 4px solid #f59e0b;
}

.disposition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.disposition-item {
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid #999;
}

.disposition-item.stock {
  background: #dbeafe;
  border-left-color: #2563eb;
}

.disposition-item.dispose {
  background: #fee2e2;
  border-left-color: #ef4444;
}

.disposition-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.disposition-count {
  color: #718096;
  font-size: 0.9rem;
}

.disposition-qty {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.disposition-percent {
  color: #4a5568;
  font-size: 0.9rem;
  margin-top: 4px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  text-align: center;
  color: #718096;
}

.error-state {
  margin-top: 24px;
}

.empty-state-card {
  margin-top: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

:deep(.p-inputgroup) {
  width: 100%;
}

:deep(.p-inputtext) {
  flex: 1;
}
</style>
