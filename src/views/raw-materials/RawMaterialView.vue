<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const rawMaterialStore = useRawMaterialStore();
const { showSuccess, showError } = useToastNotification();

const rawMaterialId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);
const showBatchDialog = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Raw Materials', to: '/raw-materials' },
  { label: 'View' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load raw material data
onMounted(async () => {
  try {
    isLoading.value = true;
    await rawMaterialStore.fetchRawMaterialById(rawMaterialId.value);

    if (!rawMaterialStore.currentRawMaterial) {
      notFound.value = true;
      showError('Raw material not found');
    } else {
      // Update breadcrumb with raw material name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Raw Materials', to: '/raw-materials' },
        { label: rawMaterialStore.currentRawMaterial.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load raw material:', error);
    notFound.value = true;
    showError('Failed to load raw material details');
  } finally {
    isLoading.value = false;
  }
});

// Handle edit button
const handleEdit = () => {
  router.push(`/raw-materials/${rawMaterialId.value}/edit`);
};

// Handle back button
const handleBack = () => {
  router.push('/raw-materials');
};

// Format category
const formatCategory = category => {
  const categoryMap = {
    spice: 'Spice',
    packaging: 'Packaging',
    other: 'Other',
  };
  return categoryMap[category] || category;
};

// Check if stock is low
const isLowStock = () => {
  const material = rawMaterialStore.currentRawMaterial;
  if (!material.current_stock || !material.reorder_level) return false;
  return parseFloat(material.current_stock) <= parseFloat(material.reorder_level);
};
</script>

<template>
  <div class="raw-material-view">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading raw material details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Raw Material Not Found</h2>
      <p>The raw material you're looking for doesn't exist or has been deleted.</p>
      <Button label="Back to Raw Materials" icon="pi pi-arrow-left" @click="handleBack" />
    </div>

    <!-- Raw Material Details -->
    <template v-else>
      <!-- Page Header with Actions -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>{{ rawMaterialStore.currentRawMaterial?.name }}</h1>
            <p>Raw Material Details & Inventory</p>
            <div class="material-code">
              <span class="code-label">Code:</span>
              <span class="code-value">{{ rawMaterialStore.currentRawMaterial?.code }}</span>
              <span class="category-badge">
                {{ formatCategory(rawMaterialStore.currentRawMaterial?.category) }}
              </span>
              <span
                v-if="isLowStock()"
                v-tooltip="'Stock below reorder level'"
                class="low-stock-badge"
              >
                <i class="pi pi-exclamation-triangle" />
                Low Stock
              </span>
            </div>
          </div>
          <div class="header-actions">
            <Button label="Edit" icon="pi pi-pencil" severity="primary" @click="handleEdit" />
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="handleBack" />
          </div>
        </div>
      </div>

      <!-- Material Information Cards -->
      <div class="info-grid">
        <!-- Basic Information -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-info-circle" />
            <h3>Basic Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Material Code:</span>
              <span class="value">{{ rawMaterialStore.currentRawMaterial?.code }}</span>
            </div>
            <div class="info-row">
              <span class="label">Category:</span>
              <span class="value">{{
                formatCategory(rawMaterialStore.currentRawMaterial?.category)
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">Unit:</span>
              <span class="value">{{ rawMaterialStore.currentRawMaterial?.unit }}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value status" :class="rawMaterialStore.currentRawMaterial?.status">
                {{
                  rawMaterialStore.currentRawMaterial?.status === 'active' ? 'Active' : 'Inactive'
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Inventory Information -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-box" />
            <h3>Inventory Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Current Stock:</span>
              <span class="value stock" :class="{ 'low-stock': isLowStock() }">
                {{ rawMaterialStore.currentRawMaterial?.current_stock || '0' }}
                {{ rawMaterialStore.currentRawMaterial?.unit }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Reorder Level:</span>
              <span class="value">
                {{ rawMaterialStore.currentRawMaterial?.reorder_level || '-' }}
                {{ rawMaterialStore.currentRawMaterial?.unit }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Average Cost:</span>
              <span class="value currency">
                Rs.
                {{
                  (rawMaterialStore.currentRawMaterial?.average_cost || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div v-if="rawMaterialStore.currentRawMaterial?.description" class="description-section">
        <div class="section-header">
          <h2>Description</h2>
        </div>
        <div class="description-content">
          {{ rawMaterialStore.currentRawMaterial?.description }}
        </div>
      </div>

      <!-- Batches Section -->
      <div class="batches-section">
        <div class="section-header">
          <h2>Recent Batches</h2>
          <span class="batch-count">
            {{ rawMaterialStore.currentRawMaterial?.RawMaterialBatches?.length || 0 }} batches
          </span>
        </div>

        <div
          v-if="rawMaterialStore.currentRawMaterial?.RawMaterialBatches?.length"
          class="table-container"
        >
          <DataTable
            :value="rawMaterialStore.currentRawMaterial.RawMaterialBatches"
            :paginator="true"
            :rows="5"
            responsive-layout="scroll"
            style-class="p-datatable-striped"
          >
            <Column field="batch_number" header="Batch Number" style="width: 12%" />
            <Column field="supplier.name" header="Supplier" style="width: 15%">
              <template #body="{ data }">
                <div v-if="data.supplier" class="supplier-info">
                  <span class="supplier-name">{{ data.supplier.name }}</span>
                  <span class="supplier-code">{{ data.supplier.code }}</span>
                </div>
                <span v-else>-</span>
              </template>
            </Column>
            <Column field="received_date" header="Received Date" style="width: 12%">
              <template #body="{ data }">
                {{ new Date(data.purchase_date).toLocaleDateString() }}
              </template>
            </Column>
            <Column field="expiry_date" header="Expiry Date" style="width: 12%">
              <template #body="{ data }">
                <span
                  v-if="data.expiry_date"
                  :class="{
                    'expiry-soon':
                      new Date(data.expiry_date) <
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                      new Date(data.expiry_date) > new Date(),
                    'expiry-expired': new Date(data.expiry_date) < new Date(),
                  }"
                >
                  {{ new Date(data.expiry_date).toLocaleDateString() }}
                </span>
                <span v-else>-</span>
              </template>
            </Column>
            <Column field="quantity" header="Quantity" style="width: 12%">
              <template #body="{ data }">
                {{ data.quantity }} {{ rawMaterialStore.currentRawMaterial?.unit }}
              </template>
            </Column>
            <Column field="unit_cost" header="Unit Cost" style="width: 12%">
              <template #body="{ data }">
                Rs.
                {{ (data.unit_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </template>
            </Column>
            <Column field="batch_type" header="Type" style="width: 10%">
              <template #body="{ data }">
                <Tag
                  :value="data.batch_type"
                  :severity="data.batch_type === 'receipt' ? 'success' : 'warning'"
                />
              </template>
            </Column>
          </DataTable>
        </div>

        <div v-else class="no-data-message">
          <i class="pi pi-inbox" />
          <p>No batches found for this material</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.raw-material-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-container,
.not-found-container {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container i,
.not-found-container i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.not-found-container i {
  color: #ef4444;
}

.not-found-container h2 {
  color: #1f2937;
  margin: 1rem 0;
}

.not-found-container p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.material-code {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.code-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.code-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.low-stock-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.low-stock-badge i {
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.card-header i {
  font-size: 1.25rem;
  color: #3b82f6;
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

.info-row .label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-row .value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.info-row .value.status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.info-row .value.status.active {
  background: #d1fae5;
  color: #065f46;
}

.info-row .value.status.inactive {
  background: #f3f4f6;
  color: #4b5563;
}

.info-row .value.stock.low-stock {
  color: #dc2626;
  font-weight: 700;
}

.info-row .value.currency {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #059669;
}

.description-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.batch-count {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.description-content {
  padding: 1rem;
  color: #4b5563;
  line-height: 1.6;
  white-space: pre-wrap;
}

.batches-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container {
  padding: 1rem;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  text-align: center;
}

.no-data-message i {
  font-size: 2.5rem;
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.expiry-soon {
  color: #f59e0b;
  font-weight: 600;
}

.expiry-expired {
  color: #ef4444;
  font-weight: 600;
}

.supplier-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.supplier-name {
  font-weight: 500;
  color: #1f2937;
}

.supplier-code {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .material-code {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
