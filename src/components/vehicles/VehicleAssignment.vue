<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useRouteStore } from '@/stores/route';
import { useVehicleStore } from '@/stores/vehicle';
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
  return (
    vehicle.value?.currentAssignment !== null && vehicle.value?.currentAssignment !== undefined
  );
});

const currentRoute = computed(() => {
  if (!vehicle.value?.currentAssignment) return null;
  return vehicle.value.currentAssignment.route;
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
      <div class="mb-4">
        <div class="flex align-items-center gap-3 mb-3">
          <i class="pi pi-car text-primary" style="font-size: 1.5rem" />
          <div>
            <div class="text-xl font-bold text-900">
              {{ vehicle.name }}
            </div>
            <div class="text-sm text-600">
              {{ vehicle.code }}
            </div>
          </div>
        </div>
        <div class="flex justify-content-between">
          <div class="">
            <div class="text-600 text-sm mb-1">Registration Number</div>
            <div class="text-900 font-semibold">
              {{ vehicle.registration_number || 'N/A' }}
            </div>
          </div>
          <div class="">
            <div class="text-600 text-sm mb-1">Status</div>
            <div>
              <Tag
                :value="vehicle.status"
                :severity="vehicle.status === 'active' ? 'success' : 'danger'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Current Assignment -->
      <div v-if="isAssigned" class="mb-4">
        <div class="text-600 text-sm mb-2 font-semibold">Current Assignment</div>
        <div class="p-3 bg-blue-50 border-round border-1 border-blue-200">
          <div class="flex align-items-center justify-content-between">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-map-marker text-primary" />
              <div>
                <div class="font-semibold text-900">
                  {{ currentRoute?.name || 'N/A' }}
                </div>
                <div class="text-600 text-sm">
                  {{ currentRoute?.code || '' }}
                </div>
              </div>
            </div>
            <Tag value="Active" severity="success" />
          </div>
        </div>
      </div>

      <div v-else class="mb-4">
        <div class="p-3 bg-orange-50 border-round border-1 border-orange-200 text-center">
          <i class="pi pi-exclamation-circle text-orange-600 mb-2" style="font-size: 2rem" />
          <p class="text-orange-700 m-0 font-semibold">Not Currently Assigned</p>
          <p class="text-orange-600 text-sm mt-1 m-0">Assign a route to this vehicle</p>
        </div>
      </div>

      <!-- Assign New Route -->
      <div v-if="!isAssigned" class="mb-3">
        <label for="route" class="block mb-2 text-600 text-sm font-semibold">
          <i class="pi pi-sitemap mr-2" />
          Select Route to Assign
        </label>
        <Dropdown
          id="route"
          v-model="selectedRoute"
          :options="availableRoutes"
          option-label="name"
          placeholder="Choose a route..."
          :filter="true"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="flex align-items-center justify-content-between">
              <div class="mr-4">
                <div class="font-semibold text-900">
                  {{ slotProps.option.name }}
                </div>
                <div class="text-sm text-600">
                  {{ slotProps.option.code }}
                </div>
              </div>
              <Tag
                v-if="slotProps.option.status === 'active'"
                value="Active"
                severity="success"
                style="font-size: 0.75rem"
              />
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
