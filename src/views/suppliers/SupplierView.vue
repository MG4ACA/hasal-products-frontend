<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useSupplierStore } from '@/stores/supplier';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const supplierStore = useSupplierStore();
const { showSuccess, showError } = useToastNotification();

const supplierId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Suppliers', to: '/suppliers' },
  { label: 'View' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load supplier data
onMounted(async () => {
  try {
    isLoading.value = true;
    await supplierStore.fetchSupplierById(supplierId.value);

    if (!supplierStore.currentSupplier) {
      notFound.value = true;
      showError('Supplier not found');
    } else {
      // Update breadcrumb with supplier name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Suppliers', to: '/suppliers' },
        { label: supplierStore.currentSupplier.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load supplier:', error);
    notFound.value = true;
    showError('Failed to load supplier details');
  } finally {
    isLoading.value = false;
  }
});

// Handle edit button
const handleEdit = () => {
  router.push(`/suppliers/${supplierId.value}/edit`);
};

// Handle back button
const handleBack = () => {
  router.push('/suppliers');
};
</script>

<template>
  <div class="supplier-view">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading supplier details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Supplier Not Found</h2>
      <p>The supplier you're looking for doesn't exist or has been deleted.</p>
      <Button label="Back to Suppliers" icon="pi pi-arrow-left" @click="handleBack" />
    </div>

    <!-- Supplier Details -->
    <template v-else>
      <!-- Page Header with Actions -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>{{ supplierStore.currentSupplier?.name }}</h1>
            <p>Supplier Details & Information</p>
            <div class="supplier-code">
              <span class="code-label">Code:</span>
              <span class="code-value">{{ supplierStore.currentSupplier?.code }}</span>
              <span class="status-badge" :class="supplierStore.currentSupplier?.status">
                {{ supplierStore.currentSupplier?.status }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <Button label="Edit" icon="pi pi-pencil" severity="primary" @click="handleEdit" />
            <Button label="Back" icon="pi pi-arrow-left" severity="secondary" @click="handleBack" />
          </div>
        </div>
      </div>

      <!-- Supplier Information Cards -->
      <div class="info-grid">
        <!-- Contact Information -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-phone" />
            <h3>Contact Information</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Contact Person:</span>
              <span class="value">{{ supplierStore.currentSupplier?.contact_person || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">{{ supplierStore.currentSupplier?.phone || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ supplierStore.currentSupplier?.email || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Address:</span>
              <span class="value">{{ supplierStore.currentSupplier?.address || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Terms -->
        <div class="info-card">
          <div class="card-header">
            <i class="pi pi-credit-card" />
            <h3>Payment Terms</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">Payment Terms:</span>
              <span class="value payment-terms">{{
                supplierStore.currentSupplier?.payment_terms
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">Current Balance:</span>
              <span
                class="value balance"
                :class="{ negative: (supplierStore.currentSupplier?.balance || 0) < 0 }"
              >
                Rs.
                {{
                  (supplierStore.currentSupplier?.balance || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Purchase Orders Section -->
      <div class="purchase-orders-section">
        <div class="section-header">
          <h2>Recent Purchase Orders</h2>
          <span class="order-count"
            >{{ supplierStore.currentSupplier?.purchaseOrders?.length || 0 }} orders</span
          >
        </div>

        <div v-if="supplierStore.currentSupplier?.purchaseOrders?.length" class="table-container">
          <DataTable
            :value="supplierStore.currentSupplier.purchaseOrders"
            :paginator="true"
            :rows="5"
            responsive-layout="scroll"
            style-class="p-datatable-striped"
          >
            <Column field="id" header="PO ID" style="width: 10%">
              <template #body="{ data }">
                <span class="po-id">#{{ data.id }}</span>
              </template>
            </Column>
            <Column field="po_number" header="PO Number" style="width: 15%" />
            <Column field="order_date" header="Date" style="width: 15%">
              <template #body="{ data }">
                {{ new Date(data.order_date).toLocaleDateString() }}
              </template>
            </Column>
            <Column field="status" header="Status" style="width: 15%">
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="
                    {
                      draft: 'secondary',
                      approved: 'info',
                      received: 'success',
                      cancelled: 'danger',
                    }[data.status]
                  "
                />
              </template>
            </Column>
            <Column field="total_amount" header="Amount" style="width: 15%">
              <template #body="{ data }">
                Rs.
                {{
                  data.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'
                }}
              </template>
            </Column>
            <Column header="Action" style="width: 15%">
              <template #body="{ data }">
                <router-link :to="`/purchase-orders/${data.id}/view`" class="action-link">
                  <i class="pi pi-eye" /> View
                </router-link>
              </template>
            </Column>
          </DataTable>
        </div>

        <div v-else class="no-data-message">
          <i class="pi pi-inbox" />
          <p>No purchase orders found for this supplier</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.supplier-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
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

.supplier-code {
  display: flex;
  gap: 0.75rem;
  align-items: center;
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

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #7f1d1d;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
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
  padding: 1.5rem;
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
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-row .value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.payment-terms {
  text-transform: capitalize;
  background: #eff6ff;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  color: #1e40af;
}

.balance {
  color: #059669;
  font-size: 1rem;
}

.balance.negative {
  color: #dc2626;
}

/* Purchase Orders Section */
.purchase-orders-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.order-count {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.table-container {
  margin-top: 1rem;
}

.po-id {
  font-weight: 600;
  color: #3b82f6;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.action-link:hover {
  color: #1e40af;
  text-decoration: underline;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.no-data-message i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.no-data-message p {
  margin: 0;
  font-size: 0.875rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container p {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Not Found State */
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.not-found-container i {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.not-found-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.not-found-container p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .supplier-view {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-count {
    align-self: flex-start;
  }
}
</style>
