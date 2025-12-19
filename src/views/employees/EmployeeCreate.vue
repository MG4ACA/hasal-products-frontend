<script setup>
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useEmployeeStore } from '@/stores/employee';
import Breadcrumb from 'primevue/breadcrumb';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const employeeStore = useEmployeeStore();
const { showSuccess, showError } = useToastNotification();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Employees', to: '/employees' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const formData = ref({
  name: '',
  type: '',
  phone: '',
  email: '',
  assigned_route_id: null,
  status: 'active',
});

const handleSubmit = async data => {
  try {
    await employeeStore.createEmployee(data);
    showSuccess('Employee created successfully');
    router.push('/employees');
  } catch (error) {
    console.error('Failed to create employee:', error);
    showError(error.response?.data?.message || 'Failed to create employee');
  }
};

const handleCancel = () => {
  router.push('/employees');
};
</script>

<template>
  <div class="employee-create">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Employee</h1>
          <p>Add a new employee to the system</p>
        </div>
      </div>
    </div>

    <EmployeeForm
      v-model="formData"
      :loading="employeeStore.loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.employee-create {
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

@media (max-width: 768px) {
  .employee-create {
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
