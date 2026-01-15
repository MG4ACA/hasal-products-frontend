<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useRouteStore } from '@/stores/route';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const routeStore = useRouteStore();
const { showError } = useToastNotification();

const routeId = ref(route.params.id);
const loading = ref(false);
const currentRoute = ref(null);

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Routes', to: '/routes' },
  { label: 'View' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const getStatusSeverity = status => {
  return status === 'active' ? 'success' : 'danger';
};

const loadRoute = async () => {
  loading.value = true;
  try {
    const data = await routeStore.fetchRouteById(routeId.value);
    currentRoute.value = data;
  } catch (error) {
    showError(error.message || 'Failed to load route');
    router.push('/routes');
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => {
  router.push(`/routes/${routeId.value}/edit`);
};

const handleBack = () => {
  router.push('/routes');
};

onMounted(() => {
  loadRoute();
});
</script>

<template>
  <div class="route-view">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 v-if="currentRoute">
            {{ currentRoute.name }}
          </h1>
          <p v-if="currentRoute" class="route-code">Code: {{ currentRoute.code }}</p>
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

    <div v-else-if="currentRoute" class="route-details">
      <!-- Route Information Card -->
      <Card class="mb-4">
        <template #title> Route Information </template>
        <template #content>
          <div class="details-grid">
            <div class="detail-item">
              <label>Route Code:</label>
              <span class="font-semibold">{{ currentRoute.code }}</span>
            </div>
            <div class="detail-item">
              <label>Route Name:</label>
              <span>{{ currentRoute.name }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <Tag
                :value="currentRoute.status"
                :severity="getStatusSeverity(currentRoute.status)"
                style="text-transform: capitalize"
              />
            </div>
            <div class="detail-item full-width">
              <label>Description:</label>
              <span>{{ currentRoute.description || '-' }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Outlets Card -->
      <Card v-if="currentRoute.outlets && currentRoute.outlets.length > 0" class="mb-4">
        <template #title> Assigned Outlets ({{ currentRoute.outlets.length }}) </template>
        <template #content>
          <DataTable :value="currentRoute.outlets" responsive-layout="scroll">
            <Column field="code" header="Code">
              <template #body="{ data }">
                <span class="font-semibold">{{ data.code }}</span>
              </template>
            </Column>
            <Column field="name" header="Outlet Name" />
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="getStatusSeverity(data.status)"
                  style="text-transform: capitalize"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Employees Card -->
      <Card v-if="currentRoute.employees && currentRoute.employees.length > 0">
        <template #title> Assigned Employees ({{ currentRoute.employees.length }}) </template>
        <template #content>
          <DataTable :value="currentRoute.employees" responsive-layout="scroll">
            <Column field="code" header="Code">
              <template #body="{ data }">
                <span class="font-semibold">{{ data.code }}</span>
              </template>
            </Column>
            <Column field="name" header="Name" />
            <Column field="type" header="Type">
              <template #body="{ data }">
                <Tag
                  :value="data.type"
                  :severity="
                    data.type === 'sales_rep'
                      ? 'info'
                      : data.type === 'driver'
                        ? 'warning'
                        : 'success'
                  "
                  style="text-transform: capitalize"
                />
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="getStatusSeverity(data.status)"
                  style="text-transform: capitalize"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.route-view {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex: 1;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.route-code {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
}

.route-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-item span {
  color: #1f2937;
  word-break: break-word;
}

.font-semibold {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .route-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
