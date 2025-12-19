<script setup>
import VehicleForm from '@/components/vehicles/VehicleForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useVehicleStore } from '@/stores/vehicleStore';
import Breadcrumb from 'primevue/breadcrumb';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const vehicleStore = useVehicleStore();
const { showSuccess, showError } = useToastNotification();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Vehicles', to: '/vehicles' },
  { label: 'Create' },
];

const formData = ref({
  code: '',
  name: '',
  registration_number: '',
  status: 'active',
});

const handleSubmit = async data => {
  try {
    await vehicleStore.createVehicle(data);
    showSuccess('Vehicle created successfully');
    router.push('/vehicles');
  } catch (error) {
    showError(error.message || 'Failed to create vehicle');
  }
};

const handleCancel = () => {
  router.push('/vehicles');
};
</script>

<template>
  <div class="vehicle-create">
    <Breadcrumb :model="breadcrumbItems" class="breadcrumb" />

    <div class="page-header">
      <h1>Create Vehicle</h1>
      <p class="text-muted">Add a new vehicle to the fleet</p>
    </div>

    <div class="content-card">
      <VehicleForm v-model="formData" @submit="handleSubmit" @cancel="handleCancel" />
    </div>
  </div>
</template>

<style scoped>
.vehicle-create {
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

.content-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .vehicle-create {
    padding: 1rem;
  }

  .content-card {
    padding: 1.5rem;
  }
}
</style>
