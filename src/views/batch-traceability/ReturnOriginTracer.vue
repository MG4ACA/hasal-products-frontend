<template>
  <div class="return-origin-tracer-page">
    <PageHeader
      title="Return Origin Tracer"
      subtitle="Trace a returned batch back to its source receipt"
    />

    <div class="content-wrapper">
      <!-- Return Batch Selection Section -->
      <Card class="search-section">
        <template #header>
          <div class="card-header">
            <i class="pi pi-search" />
            <span>Select Return Batch</span>
          </div>
        </template>
        <div class="search-form">
          <div class="form-group">
            <label for="return_batch_id">Enter Return Batch ID or Number</label>
            <InputGroup>
              <InputNumber
                id="return_batch_id"
                v-model="returnBatchId"
                placeholder="Enter batch ID..."
                :use-grouping="false"
                @keyup.enter="loadReturnOrigin"
              />
              <Button icon="pi pi-arrow-right" label="Trace" @click="loadReturnOrigin" />
            </InputGroup>
            <small v-if="idHint" class="p-hint">{{ idHint }}</small>
          </div>
        </div>
      </Card>

      <!-- Origin Trace Display -->
      <div v-if="originData" class="origin-section">
        <!-- Return Batch Card -->
        <Card class="batch-card return-batch-card">
          <template #header>
            <div class="card-header">
              <Tag value="Return" severity="warning" />
              <span>Returned Batch</span>
            </div>
          </template>
          <div class="batch-details">
            <div class="batch-header">
              <div class="batch-number">
                {{ originData.return_batch.batch_number }}
              </div>
              <div class="batch-status">
                <Tag
                  :value="
                    originData.return_batch.return_disposition === 'stock'
                      ? 'Returned to Stock'
                      : 'Disposed'
                  "
                  :severity="
                    originData.return_batch.return_disposition === 'stock' ? 'info' : 'danger'
                  "
                />
              </div>
            </div>

            <div class="details-grid">
              <div class="detail">
                <span class="label">Material:</span>
                <span class="value">
                  {{ originData.return_batch.material_name }} ({{
                    originData.return_batch.material_code
                  }})
                </span>
              </div>
              <div class="detail">
                <span class="label">Quantity Returned:</span>
                <span class="value negative">
                  -{{ formatNumber(Math.abs(originData.return_batch.quantity)) }}
                  {{ originData.return_batch.unit }}
                </span>
              </div>
              <div class="detail">
                <span class="label">Return Reason:</span>
                <span class="value">
                  <Tag
                    :value="getReasonLabel(originData.return_batch.return_reason)"
                    severity="warning"
                  />
                </span>
              </div>
              <div class="detail">
                <span class="label">Returned Date:</span>
                <span class="value">{{ formatDate(originData.return_batch.created_at) }}</span>
              </div>
              <div class="detail">
                <span class="label">Unit Cost:</span>
                <span class="value">{{ formatCurrency(originData.return_batch.unit_cost) }}</span>
              </div>
              <div class="detail">
                <span class="label">Return Value:</span>
                <span class="value negative">
                  -{{
                    formatCurrency(
                      Math.abs(originData.return_batch.quantity) * originData.return_batch.unit_cost
                    )
                  }}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Arrow Connector -->
        <div class="arrow-connector">
          <i class="pi pi-arrow-down" />
          <span>From</span>
        </div>

        <!-- Source Receipt Batch Card -->
        <Card class="batch-card source-batch-card">
          <template #header>
            <div class="card-header">
              <Tag value="Receipt" severity="success" />
              <span>Source Receipt Batch</span>
            </div>
          </template>
          <div class="batch-details">
            <div class="batch-header">
              <div class="batch-number">
                {{ originData.source_batch.batch_number }}
              </div>
              <div class="batch-status">
                <Tag value="Source" severity="info" />
              </div>
            </div>

            <div class="details-grid">
              <div class="detail">
                <span class="label">Material:</span>
                <span class="value">
                  {{ originData.source_batch.material_name }} ({{
                    originData.source_batch.material_code
                  }})
                </span>
              </div>
              <div class="detail">
                <span class="label">Quantity Received:</span>
                <span class="value positive">
                  +{{ formatNumber(originData.source_batch.quantity) }}
                  {{ originData.source_batch.unit }}
                </span>
              </div>
              <div class="detail">
                <span class="label">Received Date:</span>
                <span class="value">{{ formatDate(originData.source_batch.purchase_date) }}</span>
              </div>
              <div class="detail">
                <span class="label">Expiry Date:</span>
                <span class="value">{{ formatDate(originData.source_batch.expiry_date) }}</span>
              </div>
              <div class="detail">
                <span class="label">Unit Cost:</span>
                <span class="value">{{ formatCurrency(originData.source_batch.unit_cost) }}</span>
              </div>
              <div class="detail">
                <span class="label">Receipt Value:</span>
                <span class="value positive">
                  +{{
                    formatCurrency(
                      originData.source_batch.quantity * originData.source_batch.unit_cost
                    )
                  }}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <!-- Summary Card -->
        <Card class="summary-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-chart-bar" />
              <span>Return Summary</span>
            </div>
          </template>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Return Rate</div>
              <div class="summary-value">{{ getReturnRate() }}%</div>
              <ProgressBar :value="getReturnRate()" :show-value="false" />
            </div>
            <div class="summary-item">
              <div class="summary-label">Accepted Qty</div>
              <div class="summary-value positive">
                {{
                  formatNumber(
                    originData.source_batch.quantity - Math.abs(originData.return_batch.quantity)
                  )
                }}
                {{ originData.source_batch.unit }}
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Disposition Impact</div>
              <div class="summary-value" :class="dispositionClass">
                {{
                  originData.return_batch.return_disposition === 'stock'
                    ? 'Returned to Stock'
                    : 'Disposed'
                }}
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Net Cost Impact</div>
              <div class="summary-value warning">
                -{{
                  formatCurrency(
                    Math.abs(originData.return_batch.quantity) * originData.return_batch.unit_cost
                  )
                }}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Loading and Error States -->
      <div v-if="loading" class="loading-state">
        <ProgressSpinner />
        <p>Loading return origin data...</p>
      </div>

      <div v-if="error" class="error-state">
        <Message severity="error" :text="error" @close="error = null" />
      </div>

      <!-- Empty State -->
      <div v-if="!originData && !loading && !error" class="empty-state-card">
        <Card>
          <div class="empty-state">
            <i class="pi pi-inbox" style="font-size: 3rem; color: #cbd5e0" />
            <p style="margin-top: 16px; color: #718096">
              Enter a return batch ID to trace its origin
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
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatters';
import { ref } from 'vue';

const returnBatchId = ref(null);
const originData = ref(null);
const loading = ref(false);
const error = ref(null);
const idHint = ref('');

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

const loadReturnOrigin = async () => {
  if (!returnBatchId.value) {
    error.value = 'Please enter a return batch ID';
    return;
  }

  loading.value = true;
  error.value = null;
  idHint.value = '';

  try {
    originData.value = await purchaseOrderService.getReturnOrigin(returnBatchId.value);
  } catch (err) {
    error.value = err.message || 'Failed to load return origin data';
    originData.value = null;
  } finally {
    loading.value = false;
  }
};

const getReturnRate = () => {
  if (!originData.value) return 0;
  const sourceQty = parseFloat(originData.value.source_batch.quantity || 0);
  const returnQty = Math.abs(parseFloat(originData.value.return_batch.quantity || 0));
  if (sourceQty === 0) return 0;
  return Math.round((returnQty / sourceQty) * 100);
};

const dispositionClass = () => {
  if (!originData.value) return '';
  return originData.value.return_batch.return_disposition === 'stock' ? 'info' : 'danger';
};
</script>

<style scoped>
.return-origin-tracer-page {
  padding: 20px;
}

.content-wrapper {
  max-width: 1000px;
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

.origin-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.batch-card {
  margin-bottom: 0;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.batch-number {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 1.2rem;
  color: #2d3748;
}

.batch-status {
  display: flex;
  gap: 8px;
}

.batch-details {
  padding: 12px 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
}

.detail .label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.detail .value {
  color: #2d3748;
  font-size: 1rem;
  font-weight: 500;
}

.value.positive {
  color: #10b981;
  font-weight: 700;
}

.value.negative {
  color: #ef4444;
  font-weight: 700;
}

.arrow-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  color: #718096;
}

.arrow-connector i {
  font-size: 1.5rem;
}

.return-batch-card {
  border-left: 4px solid #f59e0b;
}

.source-batch-card {
  border-left: 4px solid #10b981;
}

.summary-card {
  border-left: 4px solid #2563eb;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.summary-value {
  font-weight: 700;
  font-size: 1.2rem;
  color: #2d3748;
}

.summary-value.positive {
  color: #10b981;
}

.summary-value.warning {
  color: #ef4444;
}

.summary-value.info {
  color: #2563eb;
}

.summary-value.danger {
  color: #ef4444;
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

:deep(.p-inputnumber) {
  flex: 1;
}
</style>
