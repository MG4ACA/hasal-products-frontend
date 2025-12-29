<script setup>
import VehicleForm from '@/components/vehicles/VehicleForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useVehicleStore } from '@/stores/vehicle';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const vehicleStore = useVehicleStore();
const { showSuccess, showError } = useToastNotification();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Vehicles', to: '/vehicles' },
  { label: 'Edit' },
];

const formData = ref({
  code: '',
  name: '',
  registration_number: '',
  status: 'active',
});

const loading = ref(false);

const fetchVehicleData = async () => {
  loading.value = true;
  try {
    const vehicle = await vehicleStore.fetchVehicleById(route.params.id);
    formData.value = {
      code: vehicle.code,
      name: vehicle.name,
      registration_number: vehicle.registration_number || '',
      status: vehicle.status,
    };
  } catch (error) {
    showError('Failed to load vehicle data');
    router.push('/vehicles');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async data => {
  try {
    await vehicleStore.updateVehicle(route.params.id, data);
    showSuccess('Vehicle updated successfully');
    router.push('/vehicles');
  } catch (error) {
    showError(error.message || 'Failed to update vehicle');
  }
};

const handleCancel = () => {
  router.push('/vehicles');
};

onMounted(() => {
  fetchVehicleData();
});
</script>

<template>
  <div class="vehicle-edit">
    <Breadcrumb :model="breadcrumbItems" class="breadcrumb" />

    <div class="page-header">
      <h1>Edit Vehicle</h1>
      <p class="text-muted">Update vehicle information</p>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spinner pi-spin" style="font-size: 2rem" />
      <p>Loading vehicle data...</p>
    </div>

    <div v-else class="content-card">
      <VehicleForm v-model="formData" @submit="handleSubmit" @cancel="handleCancel" />
    </div>
  </div>
</template>

<style scoped>
.vehicle-edit {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.text-muted {
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state i {
  color: #3b82f6;
  margin-bottom: 1rem;
}

.loading-state p {
  color: #6b7280;
  margin: 0;
}

.content-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .vehicle-edit {
    padding: 1rem;
  }

  .content-card {
    padding: 1.5rem;
  }
}
</style>
