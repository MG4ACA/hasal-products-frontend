<template>
  <div class="batch-genealogy-page">
    <PageHeader title="Batch Genealogy Tracer" subtitle="Trace all returns from a receipt batch" />

    <div class="content-wrapper">
      <!-- Batch Selection Section -->
      <Card class="search-section">
        <template #header>
          <div class="card-header">
            <i class="pi pi-search" />
            <span>Select Receipt Batch</span>
          </div>
        </template>
        <div class="search-form">
          <div class="form-group">
            <label for="batch_search">Search Batch by Number or Material</label>
            <InputGroup>
              <InputText
                id="batch_search"
                v-model="searchQuery"
                placeholder="Enter batch number or material code..."
                @keyup.enter="performSearch"
              />
              <Button icon="pi pi-search" label="Search" @click="performSearch" />
            </InputGroup>
          </div>

          <div v-if="searchResults.length > 0" class="search-results">
            <h4>Search Results</h4>
            <DataTable :value="searchResults" responsive-layout="scroll" striped-rows>
              <Column field="batch_number" header="Batch Number" />
              <Column field="material_code" header="Material">
                <template #body="{ data }">
                  <div class="material-info">
                    <div class="material-name">
                      {{ data.material_name }}
                    </div>
                    <div class="material-code">
                      {{ data.material_code }}
                    </div>
                  </div>
                </template>
              </Column>
              <Column field="quantity" header="Quantity">
                <template #body="{ data }">
                  {{ formatNumber(data.quantity) }} {{ data.unit }}
                </template>
              </Column>
              <Column field="created_at" header="Date">
                <template #body="{ data }">
                  {{ formatDate(data.created_at) }}
                </template>
              </Column>
              <Column header="Action">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-arrow-right"
                    class="p-button-rounded p-button-outlined p-button-sm"
                    @click="selectBatch(data)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </Card>

      <!-- Genealogy Display Section -->
      <div v-if="selectedBatch" class="genealogy-section">
        <Card class="batch-details-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-layers" />
              <span>Receipt Batch Details</span>
            </div>
          </template>
          <div class="batch-details">
            <div class="detail-item">
              <span class="label">Batch Number:</span>
              <span class="value batch-number">{{ selectedBatch.batch_number }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Material:</span>
              <span class="value"
                >{{ selectedBatch.material_name }} ({{ selectedBatch.material_code }})</span
              >
            </div>
            <div class="detail-item">
              <span class="label">Quantity:</span>
              <span class="value"
                >{{ formatNumber(selectedBatch.quantity) }} {{ selectedBatch.unit }}</span
              >
            </div>
            <div class="detail-item">
              <span class="label">Purchase Date:</span>
              <span class="value">{{ formatDate(selectedBatch.purchase_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Expiry Date:</span>
              <span class="value">{{ formatDate(selectedBatch.expiry_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Unit Cost:</span>
              <span class="value">{{ formatCurrency(selectedBatch.unit_cost) }}</span>
            </div>
          </div>
        </Card>

        <!-- Genealogy Tree -->
        <Card class="genealogy-tree-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-sitemap" />
              <span>Return Genealogy</span>
            </div>
          </template>

          <div v-if="genealogyData?.return_batches?.length === 0" class="empty-state">
            <i class="pi pi-inbox" style="font-size: 2rem; color: #cbd5e0" />
            <p>No returns found for this batch</p>
          </div>

          <div v-else class="genealogy-tree">
            <!-- Receipt Batch (Root) -->
            <div class="tree-node receipt-node">
              <div class="node-content">
                <Tag value="Receipt" severity="success" />
                <span class="node-label">{{ selectedBatch.batch_number }}</span>
                <span class="node-qty">+{{ formatNumber(selectedBatch.quantity) }} kg</span>
              </div>
            </div>

            <!-- Returns (Children) -->
            <div v-if="genealogyData?.return_batches" class="tree-children">
              <div
                v-for="(returnBatch, index) in genealogyData.return_batches"
                :key="index"
                class="tree-node return-node"
              >
                <div class="tree-connector" />
                <div class="node-content">
                  <Tag value="Return" severity="warning" />
                  <span class="node-label">{{ returnBatch.batch_number }}</span>
                  <span class="node-qty"
                    >-{{ formatNumber(Math.abs(returnBatch.quantity)) }} kg</span
                  >
                </div>
                <div class="node-details">
                  <div class="detail">
                    <span class="detail-label">Reason:</span>
                    <span class="detail-value">{{
                      getReasonLabel(returnBatch.return_reason)
                    }}</span>
                  </div>
                  <div class="detail">
                    <span class="detail-label">Disposition:</span>
                    <Tag
                      :value="
                        returnBatch.return_disposition === 'stock' ? 'Return to Stock' : 'Dispose'
                      "
                      :severity="returnBatch.return_disposition === 'stock' ? 'info' : 'danger'"
                    />
                  </div>
                  <div class="detail">
                    <span class="detail-label">Returned Date:</span>
                    <span class="detail-value">{{ formatDate(returnBatch.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Stats -->
          <div v-if="genealogyData?.return_batches?.length > 0" class="genealogy-summary">
            <div class="summary-stat">
              <span class="stat-label">Total Returns:</span>
              <span class="stat-value">{{ genealogyData.return_batches.length }}</span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Total Returned Qty:</span>
              <span class="stat-value">
                {{ formatNumber(calculateTotalReturned()) }} {{ selectedBatch.unit }}
              </span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Stock Disposition:</span>
              <span class="stat-value">
                {{ formatNumber(calculateStockDisposition()) }} {{ selectedBatch.unit }}
              </span>
            </div>
            <div class="summary-stat">
              <span class="stat-label">Disposal:</span>
              <span class="stat-value">
                {{ formatNumber(calculateDisposal()) }} {{ selectedBatch.unit }}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Loading and Error States -->
      <div v-if="loading" class="loading-state">
        <ProgressSpinner />
        <p>Loading genealogy data...</p>
      </div>

      <div v-if="error" class="error-state">
        <Message severity="error" :text="error" @close="error = null" />
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHeader from '@/components/common/PageHeader.vue';
import purchaseOrderService from '@/services/purchaseOrderService';
import { usePurchaseOrderStore } from '@/stores/purchaseOrder';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { onMounted, ref } from 'vue';

const purchaseOrderStore = usePurchaseOrderStore();
const searchQuery = ref('');
const searchResults = ref([]);
const selectedBatch = ref(null);
const genealogyData = ref(null);
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
    // Fetch all purchase orders and filter batches
    const response = await purchaseOrderService.getAllPurchaseOrders({
      limit: 1000,
    });

    // This is a simplified search - in production, consider backend search endpoint
    searchResults.value = []; // Placeholder - backend should provide batch search
    error.value = 'Batch search endpoint not yet implemented. Please use batch ID directly.';
  } catch (err) {
    error.value = err.message || 'Failed to search batches';
  } finally {
    loading.value = false;
  }
};

const selectBatch = async batch => {
  selectedBatch.value = batch;
  loading.value = true;
  error.value = null;

  try {
    genealogyData.value = await purchaseOrderService.getBatchGenealogy(batch.id);
  } catch (err) {
    error.value = err.message || 'Failed to load genealogy data';
    genealogyData.value = null;
  } finally {
    loading.value = false;
  }
};

const calculateTotalReturned = () => {
  if (!genealogyData.value?.return_batches) return 0;
  return genealogyData.value.return_batches.reduce(
    (sum, batch) => sum + Math.abs(parseFloat(batch.quantity || 0)),
    0
  );
};

const calculateStockDisposition = () => {
  if (!genealogyData.value?.return_batches) return 0;
  return genealogyData.value.return_batches
    .filter(batch => batch.return_disposition === 'stock')
    .reduce((sum, batch) => sum + Math.abs(parseFloat(batch.quantity || 0)), 0);
};

const calculateDisposal = () => {
  if (!genealogyData.value?.return_batches) return 0;
  return genealogyData.value.return_batches
    .filter(batch => batch.return_disposition === 'dispose')
    .reduce((sum, batch) => sum + Math.abs(parseFloat(batch.quantity || 0)), 0);
};

onMounted(() => {
  // Initialize if needed
});
</script>

<style scoped>
.batch-genealogy-page {
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

.material-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.material-name {
  font-weight: 600;
  color: #2d3748;
}

.material-code {
  font-size: 0.85rem;
  color: #718096;
  font-family: 'Courier New', monospace;
}

.genealogy-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.batch-details-card,
.genealogy-tree-card {
  margin-bottom: 0;
}

.batch-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
}

.detail-item .label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.detail-item .value {
  color: #2d3748;
  font-size: 1rem;
}

.batch-number {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #2563eb;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #718096;
}

.genealogy-tree {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #f7fafc;
  border-radius: 8px;
}

.tree-node {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.receipt-node {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.node-label {
  font-weight: 600;
  color: #2d3748;
  font-family: 'Courier New', monospace;
}

.node-qty {
  font-weight: 700;
  color: #10b981;
}

.tree-children {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #cbd5e0;
}

.return-node {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
  position: relative;
}

.tree-connector {
  position: absolute;
  left: -24px;
  top: -16px;
  width: 24px;
  height: 32px;
  border: 2px solid #cbd5e0;
  border-top: none;
  border-right: none;
  border-bottom-left-radius: 8px;
}

.node-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
}

.detail-label {
  font-weight: 600;
  color: #4a5568;
}

.detail-value {
  color: #2d3748;
}

.genealogy-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
}

.summary-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #2563eb;
}

.stat-label {
  font-weight: 600;
  color: #4a5568;
}

.stat-value {
  font-weight: 700;
  color: #2563eb;
  font-size: 1.1rem;
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

:deep(.p-inputgroup) {
  width: 100%;
}

:deep(.p-inputtext) {
  flex: 1;
}
</style>
