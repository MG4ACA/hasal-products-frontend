<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductionStore } from '@/stores/production';
import { formatDate, formatNumber } from '@/utils/formatters';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const productionStore = useProductionStore();
const { showError } = useToastNotification();

const runId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Production', to: '/production-runs' },
  { label: 'View' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load production run data
onMounted(async () => {
  try {
    isLoading.value = true;
    await productionStore.fetchProductionRunById(runId.value);

    if (!productionStore.currentProductionRun) {
      notFound.value = true;
      showError('Production run not found');
    } else {
      // Update breadcrumb with production run number
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Production', to: '/production-runs' },
        { label: productionStore.currentProductionRun.run_number },
      ];
    }
  } catch (error) {
    console.error('Failed to load production run:', error);
    notFound.value = true;
    showError('Failed to load production run details');
  } finally {
    isLoading.value = false;
  }
});

// Handle edit button
const handleEdit = () => {
  router.push(`/production-runs/${runId.value}/edit`);
};

// Handle back button
const handleBack = () => {
  router.push('/production-runs');
};

// Get status severity for styling
const getStatusSeverity = status => {
  const severityMap = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return severityMap[status] || 'info';
};

const totalMaterialCost = computed(() => {
  const run = productionStore.currentProductionRun;
  if (!run?.materials) return 0;
  return run.materials.reduce((sum, material) => {
    return sum + parseFloat(material.cost || 0);
  }, 0);
});

const efficiency = computed(() => {
  const run = productionStore.currentProductionRun;
  if (!run || !run.quantity || run.quantity === 0) return 0;
  const totalOutput = parseFloat(run.actual_output || 0) + parseFloat(run.waste_quantity || 0);
  return ((parseFloat(run.actual_output || 0) / parseFloat(run.quantity)) * 100).toFixed(2);
});
</script>

<template>
  <div class="production-view">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading production run details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Production Run Not Found</h2>
      <p>The production run you're looking for doesn't exist or has been deleted.</p>
      <Button label="Back to Production" icon="pi pi-arrow-left" @click="handleBack" />
    </div>

    <!-- Production Run Details -->
    <template v-else>
      <!-- Page Header with Actions -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Production Run {{ productionStore.currentProductionRun?.run_number }}</h1>
            <p>Production Run Details & Output Tracking</p>
            <div class="production-meta">
              <span class="recipe-name">
                Recipe:
                <strong>{{ productionStore.currentProductionRun?.recipe?.name || 'N/A' }}</strong>
              </span>
              <span class="status-badge">
                <Tag
                  :value="productionStore.currentProductionRun?.status"
                  :severity="getStatusSeverity(productionStore.currentProductionRun?.status)"
                />
              </span>
            </div>
          </div>
          <div class="header-actions">
            <Button
              v-if="productionStore.currentProductionRun?.status === 'planned'"
              label="Edit"
              icon="pi pi-pencil"
              severity="primary"
              @click="handleEdit"
            />
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="handleBack" />
          </div>
        </div>
      </div>

      <!-- Production Information Cards -->
      <div class="info-grid">
        <!-- Production Information -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-list" />
            <h3>Production Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Production Date:</span>
              <span class="value">{{
                formatDate(productionStore.currentProductionRun?.production_date)
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">Recipe:</span>
              <span class="value">
                {{ productionStore.currentProductionRun?.recipe?.name }}
                <Tag
                  v-if="productionStore.currentProductionRun?.recipe?.version > 1"
                  :value="`v${productionStore.currentProductionRun?.recipe?.version}`"
                  severity="info"
                  style="margin-left: 0.5rem; font-size: 0.75rem"
                />
              </span>
            </div>
            <div class="info-row">
              <span class="label">Quantity Planned:</span>
              <span class="value"
                >{{ formatNumber(productionStore.currentProductionRun?.expected_quantity) }}
                {{ productionStore.currentProductionRun?.recipe.yield_unit }}</span
              >
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">
                <Tag
                  :value="productionStore.currentProductionRun?.status"
                  :severity="getStatusSeverity(productionStore.currentProductionRun?.status)"
                />
              </span>
            </div>
            <div v-if="productionStore.currentProductionRun?.batch_number" class="info-row">
              <span class="label">Batch Number:</span>
              <span class="value font-bold text-primary">{{
                productionStore.currentProductionRun?.batch_number
              }}</span>
            </div>
          </div>
        </div>

        <!-- Cost Information -->
        <div v-if="productionStore.currentProductionRun?.status === 'completed'" class="info-card">
          <div class="card-header">
            <i class="pi pi-money-bill" />
            <h3>Cost Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Material Cost:</span>
              <span class="value font-semibold">Rs. {{ formatNumber(totalMaterialCost) }}</span>
            </div>
            <div
              v-if="productionStore.currentProductionRun?.outputs?.[0]?.unit_cost"
              class="info-row"
            >
              <span class="label">Unit Cost (Finished Goods):</span>
              <span class="value font-semibold"
                >Rs.
                {{ formatNumber(productionStore.currentProductionRun.outputs[0].unit_cost) }}</span
              >
            </div>
            <div
              v-if="productionStore.currentProductionRun?.outputs?.[0]?.total_cost"
              class="info-row"
            >
              <span class="label">Total Cost (Finished Goods):</span>
              <span class="value font-bold text-green-600"
                >Rs.
                {{ formatNumber(productionStore.currentProductionRun.outputs[0].total_cost) }}</span
              >
            </div>
            <div
              v-if="
                productionStore.currentProductionRun?.outputs?.[0]?.waste_cost &&
                parseFloat(productionStore.currentProductionRun.outputs[0].waste_cost) > 0
              "
              class="info-row"
            >
              <span class="label">Waste Cost:</span>
              <span class="value font-bold text-red-600"
                >Rs.
                {{ formatNumber(productionStore.currentProductionRun.outputs[0].waste_cost) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Yield Tracking -->
        <div v-if="productionStore.currentProductionRun?.status === 'completed'" class="info-card">
          <div class="card-header">
            <i class="pi pi-chart-bar" />
            <h3>Yield Tracking</h3>
          </div>
          <div class="card-content">
            <div v-if="productionStore.currentProductionRun?.expected_quantity" class="info-row">
              <span class="label">Expected Quantity:</span>
              <span class="value"
                >{{ formatNumber(productionStore.currentProductionRun.expected_quantity) }}
                {{ productionStore.currentProductionRun.unit }}</span
              >
            </div>
            <div v-if="productionStore.currentProductionRun?.actual_quantity" class="info-row">
              <span class="label">Actual Quantity:</span>
              <span class="value font-semibold"
                >{{ formatNumber(productionStore.currentProductionRun.actual_quantity) }}
                {{ productionStore.currentProductionRun.unit }}</span
              >
            </div>
            <div v-if="productionStore.currentProductionRun?.waste_quantity" class="info-row">
              <span class="label">Waste Quantity:</span>
              <span
                :class="
                  parseFloat(productionStore.currentProductionRun.waste_quantity) > 0
                    ? 'value text-orange-600 font-semibold'
                    : 'value'
                "
                >{{ formatNumber(productionStore.currentProductionRun.waste_quantity) }}
                {{ productionStore.currentProductionRun.unit }}</span
              >
            </div>
            <div v-if="productionStore.currentProductionRun?.yield_efficiency" class="info-row">
              <span class="label">Yield Efficiency:</span>
              <span class="value">
                <Tag
                  :value="
                    parseFloat(productionStore.currentProductionRun.yield_efficiency).toFixed(2) +
                    '%'
                  "
                  :severity="
                    parseFloat(productionStore.currentProductionRun.yield_efficiency) >= 95
                      ? 'success'
                      : parseFloat(productionStore.currentProductionRun.yield_efficiency) >= 85
                        ? 'info'
                        : parseFloat(productionStore.currentProductionRun.yield_efficiency) >= 75
                          ? 'warning'
                          : 'danger'
                  "
                />
              </span>
            </div>
            <div v-if="productionStore.currentProductionRun?.waste_reason" class="info-row">
              <span class="label">Waste Reason:</span>
              <span class="value">{{ productionStore.currentProductionRun.waste_reason }}</span>
            </div>
          </div>
        </div>

        <!-- Finished Goods Batch -->
        <div
          v-if="productionStore.currentProductionRun?.outputs?.[0]?.batch_number"
          class="info-card"
        >
          <div class="card-header">
            <i class="pi pi-tag" />
            <h3>Finished Goods</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Finished Goods Batch:</span>
              <span class="value font-bold text-primary">{{
                productionStore.currentProductionRun.outputs[0].batch_number
              }}</span>
            </div>
            <div
              v-if="productionStore.currentProductionRun.outputs[0].production_date"
              class="info-row"
            >
              <span class="label">Production Date:</span>
              <span class="value">{{
                formatDate(productionStore.currentProductionRun.outputs[0].production_date)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Output Information -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-chart-bar" />
            <h3>Output Details</h3>
          </div>
          <div class="card-content">
            <div class="output-item">
              <div class="output-label">Actual Output</div>
              <div class="output-value primary">
                {{ formatNumber(productionStore.currentProductionRun?.actual_output || 0) }}
                {{ productionStore.currentProductionRun?.unit }}
              </div>
            </div>
            <div
              class="output-item"
              :class="{ 'has-waste': productionStore.currentProductionRun?.waste_quantity > 0 }"
            >
              <div class="output-label">Waste Quantity</div>
              <div
                class="output-value"
                :style="{
                  color:
                    productionStore.currentProductionRun?.waste_quantity > 0
                      ? '#dc2626'
                      : '#16a34a',
                }"
              >
                {{ formatNumber(productionStore.currentProductionRun?.waste_quantity || 0) }}
                {{ productionStore.currentProductionRun?.unit }}
              </div>
            </div>
            <div class="output-item">
              <div class="output-label">Efficiency</div>
              <div class="output-value">{{ efficiency }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Materials Used -->
      <Card
        v-if="productionStore.currentProductionRun?.materials?.length > 0"
        class="materials-card"
      >
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-box" />
            <span>Materials Used</span>
          </div>
        </template>
        <template #content>
          <DataTable
            :value="productionStore.currentProductionRun?.materials || []"
            striped-rows
            responsive-layout="scroll"
            class="p-datatable-sm"
          >
            <template #empty>
              <div class="text-center p-4">
                <i class="pi pi-inbox mb-2" style="font-size: 2rem" />
                <p>No materials used in this production run</p>
              </div>
            </template>

            <Column header="Raw Material" style="min-width: 200px">
              <template #body="{ data }">
                <div class="material-cell">
                  <div class="font-semibold">
                    {{ data.batch?.material?.code }}
                  </div>
                  <div class="text-sm text-600">
                    {{ data.batch?.material?.name }}
                  </div>
                </div>
              </template>
            </Column>

            <Column header="Quantity Used" style="min-width: 120px">
              <template #body="{ data }">
                {{ formatNumber(data.quantity_used) }} {{ data.unit }}
              </template>
            </Column>

            <Column header="Unit Cost" style="min-width: 120px">
              <template #body="{ data }"> Rs. {{ formatNumber(data.average_cost || 0) }} </template>
            </Column>

            <Column header="Total Cost" style="min-width: 120px">
              <template #body="{ data }"> Rs. {{ formatNumber(data.cost || 0) }} </template>
            </Column>
          </DataTable>

          <!-- Cost Summary -->
          <div class="cost-summary">
            <div class="summary-item">
              <span class="summary-label">Total Material Cost</span>
              <span class="summary-value primary">Rs. {{ formatNumber(totalMaterialCost) }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Completion Information -->
      <Card
        v-if="productionStore.currentProductionRun?.status === 'completed'"
        class="completion-card"
      >
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-check-circle" />
            <span>Completion Details</span>
          </div>
        </template>
        <template #content>
          <div class="completion-info">
            <div class="info-item">
              <span class="label">Completed At:</span>
              <span class="value">{{
                formatDate(productionStore.currentProductionRun?.completed_at)
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">Completed By:</span>
              <span class="value">{{
                productionStore.currentProductionRun?.completed_by_name || 'N/A'
              }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Notes -->
      <Card v-if="productionStore.currentProductionRun?.notes" class="notes-card">
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-file-edit" />
            <span>Notes</span>
          </div>
        </template>
        <template #content>
          <p>{{ productionStore.currentProductionRun?.notes }}</p>
        </template>
      </Card>

      <!-- Timestamps -->
      <div class="timestamps">
        <div class="timestamp-item">
          <span class="label">Created:</span>
          <span class="value">{{
            formatDate(productionStore.currentProductionRun?.created_at)
          }}</span>
        </div>
        <div class="timestamp-item">
          <span class="label">Updated:</span>
          <span class="value">{{
            formatDate(productionStore.currentProductionRun?.updated_at)
          }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.production-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.production-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.recipe-name {
  color: #6b7280;
  font-size: 0.875rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.card-header i {
  color: #667eea;
  font-size: 1.25rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.card-content {
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.value {
  color: #1f2937;
  font-weight: 500;
}

.output-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.output-item:last-child {
  border-bottom: none;
}

.output-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.output-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.output-value.primary {
  color: #667eea;
}

.materials-card,
.completion-card,
.notes-card {
  margin-bottom: 1.5rem;
}

.material-cell {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
}

.material-cell .text-600 {
  color: #6b7280;
}

.cost-summary {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  margin: 1rem -1rem -1rem -1rem;
  border-radius: 0 0 8px 8px;
}

.summary-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.summary-label {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.summary-value.primary {
  color: #667eea;
}

.completion-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item .label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-item .value {
  font-size: 1rem;
  color: #1f2937;
}

.timestamps {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.timestamp-item {
  display: flex;
  gap: 0.5rem;
}

.timestamp-item .label {
  color: #6b7280;
  font-weight: 500;
}

.timestamp-item .value {
  color: #1f2937;
}

.loading-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  text-align: center;
}

.not-found-container i {
  font-size: 3rem;
  color: #ef4444;
}

.not-found-container h2 {
  color: #1f2937;
  margin: 0;
}

.not-found-container p {
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .production-view {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions button {
    width: 100%;
  }

  .timestamps,
  .cost-summary {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
