<script setup>
import OutletForm from '@/components/outlets/OutletForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useOutletStore } from '@/stores/outlet';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const outletStore = useOutletStore();
const { showSuccess, showError } = useToastNotification();

const outletId = ref(route.params.id);
const loading = ref(false);

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Outlets', to: '/outlets' },
  { label: 'Edit' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const formData = ref({
  code: '',
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

const loadOutlet = async () => {
  loading.value = true;
  try {
    const data = await outletStore.fetchOutletById(outletId.value);
    formData.value = {
      code: data.code,
      name: data.name,
      owner_name: data.owner_name || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      route_id: data.route_id,
      default_discount: parseFloat(data.default_discount) || 20.0,
      credit_limit: parseFloat(data.credit_limit) || 0,
      payment_terms: data.payment_terms,
      status: data.status,
    };
  } catch (error) {
    showError(error.message || 'Failed to load outlet');
    router.push('/outlets');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async data => {
  try {
    await outletStore.updateOutlet(outletId.value, data);
    showSuccess('Outlet updated successfully');
    router.push('/outlets');
  } catch (error) {
    console.error('Failed to update outlet:', error);
    showError(error.message || 'Failed to update outlet');
  }
};

const handleCancel = () => {
  router.push('/outlets');
};

onMounted(() => {
  loadOutlet();
});
</script>

<template>
  <div class="outlet-edit">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Edit Outlet</h1>
          <p>Update outlet information</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <OutletForm
      v-else
      v-model="formData"
      :loading="outletStore.loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.outlet-edit {
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
  .outlet-edit {
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
