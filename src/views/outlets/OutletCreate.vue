<script setup>
import OutletForm from '@/components/outlets/OutletForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useOutletStore } from '@/stores/outlet';
import Breadcrumb from 'primevue/breadcrumb';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const outletStore = useOutletStore();
const { showSuccess, showError } = useToastNotification();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Outlets', to: '/outlets' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const formData = ref({
  name: '',
  owner_name: '',
  phone: '',
  email: '',
  address: '',
  route_id: null,
  default_discount: 20.0,
  credit_limit: 0,
  payment_terms: 'cash',
  status: 'active',
});

const handleSubmit = async data => {
  try {
    await outletStore.createOutlet(data);
    showSuccess('Outlet created successfully');
    router.push('/outlets');
  } catch (error) {
    console.error('Failed to create outlet:', error);
    showError(error.response?.data?.message || 'Failed to create outlet');
  }
};

const handleCancel = () => {
  router.push('/outlets');
};
</script>

<template>
  <div class="outlet-create">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Outlet</h1>
          <p>Add a new customer outlet to the system</p>
        </div>
      </div>
    </div>

    <OutletForm
      v-model="formData"
      :loading="outletStore.loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.outlet-create {
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
  .outlet-create {
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
