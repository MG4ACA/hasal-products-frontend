<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useOutletStore } from '@/stores/outlet';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const outletStore = useOutletStore();
const { showError } = useToastNotification();

const outletId = ref(route.params.id);
const loading = ref(false);
const currentOutlet = ref(null);

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Outlets', to: '/outlets' },
  { label: 'View' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const getStatusSeverity = status => {
  return status === 'active' ? 'success' : 'danger';
};

const getPaymentTermsSeverity = term => {
  const severityMap = {
    cash: 'success',
    credit: 'info',
    cheque: 'warning',
    bank_transfer: 'primary',
    card: 'success',
    mixed: 'warning',
  };
  return severityMap[term] || 'info';
};

const loadOutlet = async () => {
  loading.value = true;
  try {
    const data = await outletStore.fetchOutletById(outletId.value);
    currentOutlet.value = data;
  } catch (error) {
    showError(error.message || 'Failed to load outlet');
    router.push('/outlets');
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => {
  router.push(`/outlets/${outletId.value}/edit`);
};

const handleBack = () => {
  router.push('/outlets');
};

const formatCurrency = value => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
  }).format(value || 0);
};

onMounted(() => {
  loadOutlet();
});
</script>

<template>
  <div class="outlet-view">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 v-if="currentOutlet">
            {{ currentOutlet.name }}
          </h1>
          <p v-if="currentOutlet" class="outlet-code">Code: {{ currentOutlet.code }}</p>
        </div>
      </div>
      <div class="header-actions">
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          class="p-button-secondary"
          @click="handleBack"
        />
        <Button label="Edit" icon="pi pi-pencil" @click="handleEdit" />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <div v-else-if="currentOutlet" class="outlet-details">
      <!-- Outlet Information Card -->
      <Card class="mb-4">
        <template #title> Outlet Information </template>
        <template #content>
          <div class="details-grid">
            <div class="detail-item">
              <label>Outlet Code:</label>
              <span class="font-semibold">{{ currentOutlet.code }}</span>
            </div>
            <div class="detail-item">
              <label>Outlet Name:</label>
              <span>{{ currentOutlet.name }}</span>
            </div>
            <div class="detail-item">
              <label>Owner Name:</label>
              <span>{{ currentOutlet.owner_name || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Phone:</label>
              <span>{{ currentOutlet.phone || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ currentOutlet.email || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <Tag
                :value="currentOutlet.status"
                :severity="getStatusSeverity(currentOutlet.status)"
                style="text-transform: capitalize"
              />
            </div>
            <div class="detail-item">
              <label>Payment Terms:</label>
              <Tag
                :value="currentOutlet.payment_terms"
                :severity="getPaymentTermsSeverity(currentOutlet.payment_terms)"
                style="text-transform: capitalize"
              />
            </div>
            <div class="detail-item">
              <label>Default Discount:</label>
              <span>{{ currentOutlet.default_discount || '0' }}%</span>
            </div>
            <div class="detail-item">
              <label>Credit Limit:</label>
              <span class="font-semibold">{{ formatCurrency(currentOutlet.credit_limit) }}</span>
            </div>
            <div class="detail-item">
              <label>Current Balance:</label>
              <span class="font-semibold">{{ formatCurrency(currentOutlet.current_balance) }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Address:</label>
              <span>{{ currentOutlet.address || '-' }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Route Assignment Card -->
      <Card v-if="currentOutlet.route" class="mb-4">
        <template #title> Assigned Route </template>
        <template #content>
          <div class="details-grid">
            <div class="detail-item">
              <label>Route Code:</label>
              <span class="font-semibold">{{ currentOutlet.route.code }}</span>
            </div>
            <div class="detail-item">
              <label>Route Name:</label>
              <span>{{ currentOutlet.route.name }}</span>
            </div>
            <div class="detail-item">
              <label>Route Status:</label>
              <Tag
                :value="currentOutlet.route.status"
                :severity="getStatusSeverity(currentOutlet.route.status)"
                style="text-transform: capitalize"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.outlet-view {
  padding: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-content {
  flex: 1;
}

.header-text h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.5rem;
}

.outlet-code {
  margin: 0.25rem 0 0 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.outlet-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-color-secondary);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: var(--text-color);
  font-size: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
</style>
