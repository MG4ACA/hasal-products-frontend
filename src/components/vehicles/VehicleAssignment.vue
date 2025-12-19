<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useRouteStore } from '@/stores/routeStore';
import { useVehicleStore } from '@/stores/vehicleStore';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  vehicleId: {
    type: Number,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['update:visible', 'assigned', 'unassigned']);

const vehicleStore = useVehicleStore();
const routeStore = useRouteStore();
const { showSuccess, showError } = useToastNotification();

const loading = ref(false);
const selectedRoute = ref(null);
const vehicle = ref(null);

const isAssigned = computed(() => {
  return vehicle.value?.current_route_id !== null;
});

const currentRoute = computed(() => {
  if (!vehicle.value?.current_route_id || !routeStore.routes) return null;
  return routeStore.routes.find(r => r.id === vehicle.value.current_route_id);
});

const availableRoutes = computed(() => {
  if (!routeStore.routes) return [];
  return routeStore.routes.filter(r => r.status === 'active');
});

watch(
  () => props.visible,
  newVal => {
    if (newVal && props.vehicleId) {
      loadVehicle();
      loadRoutes();
    }
  }
);

const loadVehicle = async () => {
  try {
    loading.value = true;
    await vehicleStore.fetchVehicleById(props.vehicleId);
    vehicle.value = vehicleStore.currentVehicle;
  } catch (error) {
    showError('Failed to load vehicle details');
  } finally {
    loading.value = false;
  }
};

const loadRoutes = async () => {
  try {
    await routeStore.fetchRoutes({ status: 'active' });
  } catch (error) {
    console.error('Failed to load routes:', error);
  }
};

const handleAssign = async () => {
  if (!selectedRoute.value) {
    showError('Please select a route');
    return;
  }

  try {
    loading.value = true;
    await vehicleStore.assignVehicle(props.vehicleId, {
      route_id: selectedRoute.value.id,
    });
    showSuccess('Vehicle assigned to route successfully');
    emit('assigned');
    emit('update:visible', false);
  } catch (error) {
    showError(error.response?.data?.message || 'Failed to assign vehicle');
  } finally {
    loading.value = false;
  }
};

const handleUnassign = async () => {
  try {
    loading.value = true;
    await vehicleStore.unassignVehicle(props.vehicleId);
    showSuccess('Vehicle unassigned from route successfully');
    emit('unassigned');
    emit('update:visible', false);
  } catch (error) {
    showError(error.response?.data?.message || 'Failed to unassign vehicle');
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  selectedRoute.value = null;
  emit('update:visible', false);
};

onMounted(() => {
  if (props.visible && props.vehicleId) {
    loadVehicle();
    loadRoutes();
  }
});
</script>

<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :draggable="false"
    :style="{ width: '500px' }"
    header="Vehicle Route Assignment"
    @update:visible="closeDialog"
  >
    <div
      v-if="loading"
      class="flex justify-content-center align-items-center"
      style="min-height: 200px"
    >
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <div v-else-if="vehicle" class="p-fluid">
      <!-- Vehicle Info -->
      <div class="mb-4 p-3 surface-100 border-round">
        <h4 class="mt-0 mb-2">
          {{ vehicle.vehicle_number }}
        </h4>
        <div class="text-600">
          <div><strong>Type:</strong> {{ vehicle.vehicle_type }}</div>
          <div>
            <strong>Status:</strong>
            <Tag
              :value="vehicle.status"
              :severity="vehicle.status === 'active' ? 'success' : 'danger'"
            />
          </div>
        </div>
      </div>

      <!-- Current Assignment -->
      <div v-if="isAssigned" class="mb-4">
        <h5 class="mb-2">Current Assignment</h5>
        <div class="p-3 surface-card border-round border-1 border-300">
          <div class="flex justify-content-between align-items-center">
            <div>
              <div class="font-semibold text-900">
                {{ currentRoute?.route_name || 'N/A' }}
              </div>
              <div class="text-600 text-sm">
                {{ currentRoute?.route_code || '' }}
              </div>
            </div>
            <Tag value="Assigned" severity="success" />
          </div>
        </div>
      </div>

      <div v-else class="mb-4">
        <div class="p-3 surface-card border-round border-1 border-300 text-center">
          <i class="pi pi-info-circle text-600 mb-2" style="font-size: 2rem" />
          <p class="text-600 m-0">This vehicle is not currently assigned to any route</p>
        </div>
      </div>

      <!-- Assign New Route -->
      <div v-if="!isAssigned" class="mb-3">
        <label for="route" class="block mb-2 font-semibold">Assign to Route</label>
        <Dropdown
          id="route"
          v-model="selectedRoute"
          :options="availableRoutes"
          option-label="route_name"
          placeholder="Select a route"
          :filter="true"
          class="w-full"
        >
          <template #option="slotProps">
            <div>
              <div class="font-semibold">
                {{ slotProps.option.route_name }}
              </div>
              <div class="text-sm text-600">
                {{ slotProps.option.route_code }}
              </div>
            </div>
          </template>
        </Dropdown>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
        <Button
          v-if="!isAssigned"
          label="Assign"
          icon="pi pi-check"
          :loading="loading"
          :disabled="!selectedRoute"
          severity="success"
          @click="handleAssign"
        />
        <Button
          v-else
          label="Unassign"
          icon="pi pi-times"
          :loading="loading"
          severity="danger"
          @click="handleUnassign"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.p-fluid .p-dropdown {
  width: 100%;
}
</style>
