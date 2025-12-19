<script setup>
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useEmployeeStore } from '@/stores/employee';
import Breadcrumb from 'primevue/breadcrumb';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();
const { showSuccess, showError } = useToastNotification();

const employeeId = ref(route.params.id);
const loading = ref(false);

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Employees', to: '/employees' },
  { label: 'Edit' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const formData = ref({
  code: '',
  name: '',
  type: '',
  phone: '',
  email: '',
  assigned_route_id: null,
  status: 'active',
});

const loadEmployee = async () => {
  loading.value = true;
  try {
    const data = await employeeStore.fetchEmployeeById(employeeId.value);
    formData.value = {
      code: data.code,
      name: data.name,
      type: data.type,
      phone: data.phone || '',
      email: data.email || '',
      assigned_route_id: data.assigned_route_id,
      status: data.status,
    };
  } catch (error) {
    showError(error.response?.data?.message || 'Failed to load employee');
    router.push('/employees');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async data => {
  try {
    await employeeStore.updateEmployee(employeeId.value, data);
    showSuccess('Employee updated successfully');
    router.push('/employees');
  } catch (error) {
    console.error('Failed to update employee:', error);
    showError(error.response?.data?.message || 'Failed to update employee');
  }
};

const handleCancel = () => {
  router.push('/employees');
};

onMounted(() => {
  loadEmployee();
});
</script>

<template>
  <div class="employee-edit">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Edit Employee</h1>
          <p>Update employee information</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <EmployeeForm
      v-else
      v-model="formData"
      :loading="employeeStore.loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.employee-edit {
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
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .employee-edit {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }
}
</style>
