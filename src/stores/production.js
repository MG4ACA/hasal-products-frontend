import productionService from '@/services/productionService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useProductionStore = defineStore('production', () => {
  // State
  const productionRuns = ref([]);
  const currentProductionRun = ref(null);
  const materialCheck = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const filters = ref({
    status: '',
    product_id: '',
    date_from: '',
    date_to: '',
  });

  // Getters
  const plannedRuns = computed(() => productionRuns.value.filter(r => r.status === 'planned'));
  const inProgressRuns = computed(() =>
    productionRuns.value.filter(r => r.status === 'in_progress')
  );
  const completedRuns = computed(() => productionRuns.value.filter(r => r.status === 'completed'));

  // Actions
  const fetchProductionRuns = async () => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        status: filters.value.status,
        product_id: filters.value.product_id,
        date_from: filters.value.date_from,
        date_to: filters.value.date_to,
      };

      const response = await productionService.getAll(params);

      productionRuns.value = response.data;
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      };
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch production runs';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductionRunById = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productionService.getById(id);
      currentProductionRun.value = response;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch production run';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProductionRun = async productionData => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productionService.create(productionData);
      await fetchProductionRuns();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create production run';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProductionRun = async (id, productionData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productionService.update(id, productionData);
      await fetchProductionRuns();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update production run';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProductionRun = async id => {
    loading.value = true;
    error.value = null;

    try {
      await productionService.delete(id);
      await fetchProductionRuns();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete production run';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const completeProductionRun = async (id, completionData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productionService.complete(id, completionData);
      await fetchProductionRuns();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to complete production run';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const checkMaterialAvailability = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productionService.checkMaterials(id);
      materialCheck.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to check materials';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = page => {
    pagination.value.page = page;
    fetchProductionRuns();
  };

  const setLimit = limit => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchProductionRuns();
  };

  const setStatusFilter = status => {
    filters.value.status = status;
    pagination.value.page = 1;
    fetchProductionRuns();
  };

  const setProductFilter = productId => {
    filters.value.product_id = productId;
    pagination.value.page = 1;
    fetchProductionRuns();
  };

  const setDateRange = (dateFrom, dateTo) => {
    filters.value.date_from = dateFrom;
    filters.value.date_to = dateTo;
    pagination.value.page = 1;
    fetchProductionRuns();
  };

  const clearFilters = () => {
    filters.value = {
      status: '',
      product_id: '',
      date_from: '',
      date_to: '',
    };
    pagination.value.page = 1;
    fetchProductionRuns();
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    productionRuns,
    currentProductionRun,
    materialCheck,
    loading,
    error,
    pagination,
    filters,
    // Getters
    plannedRuns,
    inProgressRuns,
    completedRuns,
    // Actions
    fetchProductionRuns,
    fetchProductionRunById,
    createProductionRun,
    updateProductionRun,
    deleteProductionRun,
    completeProductionRun,
    checkMaterialAvailability,
    setPage,
    setLimit,
    setStatusFilter,
    setProductFilter,
    setDateRange,
    clearFilters,
    clearError,
  };
});
