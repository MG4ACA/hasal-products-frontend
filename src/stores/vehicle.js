import { vehicleService } from '@/services/vehicleService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useVehicleStore = defineStore('vehicle', () => {
  // State
  const vehicles = ref([]);
  const currentVehicle = ref(null);
  const vehicleHistory = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const filters = ref({
    search: '',
    status: '',
  });

  // Getters
  const activeVehicles = computed(() => vehicles.value.filter(v => v.status === 'active'));
  const inactiveVehicles = computed(() => vehicles.value.filter(v => v.status === 'inactive'));
  const assignedVehicles = computed(() => vehicles.value.filter(v => v.currentAssignment));
  const unassignedVehicles = computed(() => vehicles.value.filter(v => !v.currentAssignment));

  // Actions
  const fetchVehicles = async () => {
    try {
      loading.value = true;
      error.value = null;

      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search,
        status: filters.value.status,
      };

      const response = await vehicleService.getAll(params);
      vehicles.value = response.data.vehicles;
      pagination.value = response.data.pagination;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch vehicles';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVehicleById = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await vehicleService.getById(id);
      currentVehicle.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch vehicle';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createVehicle = async vehicleData => {
    try {
      loading.value = true;
      error.value = null;
      const response = await vehicleService.create(vehicleData);
      await fetchVehicles();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create vehicle';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateVehicle = async (id, vehicleData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await vehicleService.update(id, vehicleData);
      await fetchVehicles();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update vehicle';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteVehicle = async id => {
    try {
      loading.value = true;
      error.value = null;
      await vehicleService.delete(id);
      await fetchVehicles();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete vehicle';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const assignVehicleToRoute = async (id, assignmentData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await vehicleService.assignToRoute(id, assignmentData);
      await fetchVehicles();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to assign vehicle to route';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const unassignVehicleFromRoute = async (id, unassignmentData = {}) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await vehicleService.unassignFromRoute(id, unassignmentData);
      await fetchVehicles();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to unassign vehicle from route';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVehicleAssignmentHistory = async (id, params = {}) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await vehicleService.getAssignmentHistory(id, params);
      vehicleHistory.value = response.data.history;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch vehicle assignment history';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = page => {
    pagination.value.page = page;
    fetchVehicles();
  };

  const setLimit = limit => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchVehicles();
  };

  const setFilters = newFilters => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1;
    fetchVehicles();
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
    };
    pagination.value.page = 1;
    fetchVehicles();
  };

  const clearCurrentVehicle = () => {
    currentVehicle.value = null;
    vehicleHistory.value = [];
  };

  return {
    // State
    vehicles,
    currentVehicle,
    vehicleHistory,
    loading,
    error,
    pagination,
    filters,
    // Getters
    activeVehicles,
    inactiveVehicles,
    assignedVehicles,
    unassignedVehicles,
    // Actions
    fetchVehicles,
    fetchVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    assignVehicleToRoute,
    unassignVehicleFromRoute,
    fetchVehicleAssignmentHistory,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    clearCurrentVehicle,
  };
});
