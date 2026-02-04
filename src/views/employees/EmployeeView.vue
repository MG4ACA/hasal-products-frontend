<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useEmployeeStore } from '@/stores/employee';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();
const { showError } = useToastNotification();

const employeeId = ref(route.params.id);
const loading = ref(false);
const currentEmployee = ref(null);

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Employees', to: '/employees' },
  { label: 'View' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const getStatusSeverity = status => {
  return status === 'active' ? 'success' : 'danger';
};

const getTypeSeverity = type => {
  const severityMap = {
    sales_ref: 'info',
    driver: 'warning',
    warehouse: 'success',
    other: 'secondary',
  };
  return severityMap[type] || 'info';
};

const getTypeLabel = type => {
  const typeMap = {
    sales_ref: 'Sales Rep',
    driver: 'Driver',
    warehouse: 'Warehouse',
    other: 'Other',
  };
  return typeMap[type] || type;
};

const loadEmployee = async () => {
  loading.value = true;
  try {
    const data = await employeeStore.fetchEmployeeById(employeeId.value);
    currentEmployee.value = data;
  } catch (error) {
    showError(error.message || 'Failed to load employee');
    router.push('/employees');
  } finally {
    loading.value = false;
  }
};

const handleEdit = () => {
  router.push(`/employees/${employeeId.value}/edit`);
};

const handleBack = () => {
  router.push('/employees');
};

onMounted(() => {
  loadEmployee();
});
</script>

<template>
  <div class="employee-view">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 v-if="currentEmployee">
            {{ currentEmployee.name }}
          </h1>
          <p v-if="currentEmployee" class="employee-code">Code: {{ currentEmployee.code }}</p>
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

    <div v-else-if="currentEmployee" class="employee-details">
      <!-- Employee Information Card -->
      <Card class="mb-4">
        <template #title> Employee Information </template>
        <template #content>
          <div class="details-grid">
            <div class="detail-item">
              <label>Employee Code:</label>
              <span class="font-semibold">{{ currentEmployee.code }}</span>
            </div>
            <div class="detail-item">
              <label>Employee Name:</label>
              <span>{{ currentEmployee.name }}</span>
            </div>
            <div class="detail-item">
              <label>Employee Type:</label>
              <Tag
                :value="getTypeLabel(currentEmployee.type)"
                :severity="getTypeSeverity(currentEmployee.type)"
                style="text-transform: capitalize"
              />
            </div>
            <div class="detail-item">
              <label>Phone:</label>
              <span>{{ currentEmployee.phone || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ currentEmployee.email || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <Tag
                :value="currentEmployee.status"
                :severity="getStatusSeverity(currentEmployee.status)"
                style="text-transform: capitalize"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Route Assignment Card -->
      <Card v-if="currentEmployee.assignedRoute" class="mb-4">
        <template #title> Assigned Territory </template>
        <template #content>
          <div class="details-grid">
            <div class="detail-item">
              <label>Territory Code:</label>
              <span class="font-semibold">{{ currentEmployee.assignedRoute.code }}</span>
            </div>
            <div class="detail-item">
              <label>Territory Name:</label>
              <span>{{ currentEmployee.assignedRoute.name }}</span>
            </div>
            <div class="detail-item">
              <label>Territory Status:</label>
              <Tag
                :value="currentEmployee.assignedRoute.status"
                :severity="getStatusSeverity(currentEmployee.assignedRoute.status)"
                style="text-transform: capitalize"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- No Route Assignment Message -->
      <Card v-else class="mb-4">
        <template #title> Territory Assignment </template>
        <template #content>
          <p class="text-color-secondary">No territory assigned to this employee.</p>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.employee-view {
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

.employee-code {
  margin: 0.25rem 0 0 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.employee-details {
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
