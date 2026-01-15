<script setup>
import AssignmentHistory from '@/components/vehicles/AssignmentHistory.vue';
import VehicleAssignment from '@/components/vehicles/VehicleAssignment.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useVehicleStore } from '@/stores/vehicle';
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
          <div class="flex justify-content-between align-items-center w-full">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-car text-primary" style="font-size: 2rem" />
              <div>
                <div class="text-xl font-bold">{{ vehicle.code }} - {{ vehicle.name }}</div>
                <div class="text-sm text-600">
                  Registration: {{ vehicle.registration_number || 'N/A' }}
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                label="Assign"
                icon="pi pi-sitemap"
                severity="info"
                size="small"
                @click="handleAssignRoute"
              />
              <Button
                label="Back"
                icon="pi pi-arrow-left"
                severity="secondary"
                size="small"
                outlined
                @click="handleBack"
              />
            </div>
          </div>
        </template>
        <template #content>
          <div class="flex align-items-center justify-content-between gap-3">
            <div class="flex align-items-center gap-3">
              <span class="text-600 text-sm">Status:</span>
              <Tag
                :value="vehicle.status"
                :severity="vehicle.status === 'active' ? 'success' : 'danger'"
              />
            </div>
            <div v-if="vehicle.currentAssignment" class="flex align-items-center gap-2">
              <i class="pi pi-map-marker text-primary" style="font-size: 0.9rem" />
              <span class="text-sm">
                <strong>Assigned to:</strong>
                {{ vehicle.currentAssignment?.route?.name || 'Unknown' }}
                ({{ vehicle.currentAssignment?.route?.code || '' }})
              </span>
            </div>
            <div v-else class="text-sm text-orange-600">
              <i class="pi pi-exclamation-circle mr-2" />
              <strong>Not assigned to any route</strong>
            </div>
          </div>
        </template>
      </Card>

      <!-- Assignment History Card -->
      <Card>
        <template #title>
          <div class="flex align-items-center justify-content-between">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-history text-primary" />
              <span>Route Assignment History</span>
            </div>
            <Button
              v-tooltip="'Refresh'"
              icon="pi pi-refresh"
              rounded
              severity="primary"
              @click="() => historyRef?.refresh()"
            />
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
