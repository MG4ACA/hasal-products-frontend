<script setup>
import AssignmentHistory from '@/components/vehicles/AssignmentHistory.vue';
import VehicleAssignment from '@/components/vehicles/VehicleAssignment.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useVehicleStore } from '@/stores/vehicle';
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const vehicleStore = useVehicleStore();
const { showError } = useToastNotification();

const loading = ref(false);
const vehicle = ref(null);
const showAssignmentDialog = ref(false);
const historyRef = ref(null);

const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Vehicles', to: '/vehicles' },
  { label: 'Assignment History' },
]);

const home = ref({ icon: 'pi pi-home', to: '/dashboard' });

const loadVehicle = async () => {
  try {
    loading.value = true;
    const vehicleId = parseInt(route.params.id);
    await vehicleStore.fetchVehicleById(vehicleId);
    vehicle.value = vehicleStore.currentVehicle;

    if (!vehicle.value) {
      showError('Vehicle not found');
      router.push('/vehicles');
    }
  } catch (error) {
    showError('Failed to load vehicle details');
    router.push('/vehicles');
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push('/vehicles');
};

const handleAssignRoute = () => {
  showAssignmentDialog.value = true;
};

const handleAssignmentChange = () => {
  loadVehicle();
  if (historyRef.value) {
    historyRef.value.refresh();
  }
};

onMounted(() => {
  loadVehicle();
});
</script>

<template>
  <div class="vehicle-history">
    <VehicleAssignment
      v-model:visible="showAssignmentDialog"
      :vehicle-id="vehicle?.id"
      @assigned="handleAssignmentChange"
      @unassigned="handleAssignmentChange"
    />

    <Breadcrumb :home="home" :model="breadcrumbItems" class="mb-4" />

    <div
      v-if="loading"
      class="flex justify-content-center align-items-center"
      style="min-height: 400px"
    >
      <i class="pi pi-spin pi-spinner" style="font-size: 3rem" />
    </div>

    <div v-else-if="vehicle">
      <!-- Vehicle Info Card -->
      <Card class="mb-4">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-car text-primary" style="font-size: 2rem" />
              <div>
                <div class="text-2xl font-bold">
                  {{ vehicle.vehicle_number }}
                </div>
                <div class="text-sm text-600 font-normal">
                  {{ vehicle.vehicle_type }}
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                label="Manage Assignment"
                icon="pi pi-sitemap"
                severity="info"
                @click="handleAssignRoute"
              />
              <Button label="Back" icon="pi pi-arrow-left" outlined @click="handleBack" />
            </div>
          </div>
        </template>
        <template #content>
          <div class="grid">
            <div class="col-12 md:col-3">
              <div class="text-600 text-sm mb-1">Registration Number</div>
              <div class="text-900 font-semibold">
                {{ vehicle.registration_number || 'N/A' }}
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="text-600 text-sm mb-1">Vehicle Type</div>
              <div class="text-900 font-semibold">
                {{ vehicle.vehicle_type || 'N/A' }}
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="text-600 text-sm mb-1">Capacity</div>
              <div class="text-900 font-semibold">
                {{ vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A' }}
              </div>
            </div>
            <div class="col-12 md:col-3">
              <div class="text-600 text-sm mb-1">Status</div>
              <div>
                <Tag
                  :value="vehicle.status"
                  :severity="vehicle.status === 'active' ? 'success' : 'danger'"
                />
              </div>
            </div>
          </div>

          <div v-if="vehicle.current_route_id" class="mt-4 p-3 surface-100 border-round">
            <div class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-map-marker text-primary" />
              <span class="font-semibold text-900">Currently Assigned To:</span>
            </div>
            <div class="ml-4">
              <div class="text-900 font-semibold">
                {{ vehicle.Route?.route_name || 'Unknown Route' }}
              </div>
              <div class="text-600 text-sm">
                {{ vehicle.Route?.route_code || '' }}
              </div>
            </div>
          </div>

          <div v-else class="mt-4 p-3 surface-100 border-round text-center">
            <i class="pi pi-info-circle text-600 mb-2" style="font-size: 2rem" />
            <p class="text-600 m-0">This vehicle is not currently assigned to any route</p>
          </div>
        </template>
      </Card>

      <!-- Assignment History Card -->
      <Card>
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-history text-primary" />
            <span>Route Assignment History</span>
          </div>
        </template>
        <template #content>
          <AssignmentHistory ref="historyRef" :vehicle-id="vehicle.id" />
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.vehicle-history {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .vehicle-history {
    padding: 1rem;
  }
}
</style>
