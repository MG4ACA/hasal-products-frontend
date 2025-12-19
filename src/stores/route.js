import { routeService } from '@/services/routeService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useRouteStore = defineStore('route', () => {
  // State
  const routes = ref([]);
  const currentRoute = ref(null);
  const routeOutlets = ref([]);
  const routeEmployees = ref([]);
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
  const activeRoutes = computed(() => routes.value.filter(r => r.status === 'active'));
  const inactiveRoutes = computed(() => routes.value.filter(r => r.status === 'inactive'));

  // Actions
  const fetchRoutes = async () => {
    try {
      loading.value = true;
      error.value = null;

      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search,
        status: filters.value.status,
      };

      const response = await routeService.getAll(params);
      routes.value = response.data.routes;
      pagination.value = response.data.pagination;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch routes';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRouteById = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await routeService.getById(id);
      currentRoute.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch route';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRoute = async routeData => {
    try {
      loading.value = true;
      error.value = null;
      const response = await routeService.create(routeData);
      await fetchRoutes();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create route';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRoute = async (id, routeData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await routeService.update(id, routeData);
      await fetchRoutes();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update route';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRoute = async id => {
    try {
      loading.value = true;
      error.value = null;
      await routeService.delete(id);
      await fetchRoutes();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete route';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRouteOutlets = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await routeService.getOutlets(id);
      routeOutlets.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch route outlets';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRouteEmployees = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await routeService.getEmployees(id);
      routeEmployees.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch route employees';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = page => {
    pagination.value.page = page;
    fetchRoutes();
  };

  const setLimit = limit => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchRoutes();
  };

  const setFilters = newFilters => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1;
    fetchRoutes();
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
    };
    pagination.value.page = 1;
    fetchRoutes();
  };

  const clearCurrentRoute = () => {
    currentRoute.value = null;
    routeOutlets.value = [];
    routeEmployees.value = [];
  };

  return {
    // State
    routes,
    currentRoute,
    routeOutlets,
    routeEmployees,
    loading,
    error,
    pagination,
    filters,
    // Getters
    activeRoutes,
    inactiveRoutes,
    // Actions
    fetchRoutes,
    fetchRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    fetchRouteOutlets,
    fetchRouteEmployees,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    clearCurrentRoute,
  };
});
