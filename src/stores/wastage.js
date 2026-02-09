import wastageService from '@/services/wastageService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useWastageStore = defineStore('wastage', () => {
  // State
  const wastageRecords = ref([]);
  const currentWastageRecord = ref(null);
  const monthlySummary = ref(null);
  const wastageTrend = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const filters = ref({
    wastage_type: null,
    item_type: null,
    start_date: null,
    end_date: null,
    search: '',
  });

  // Getters
  const totalWastageCost = computed(() => {
    return wastageRecords.value.reduce((sum, record) => {
      return sum + parseFloat(record.total_cost || 0);
    }, 0);
  });

  // Actions
  const fetchWastageRecords = async (params = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value,
        ...params,
      };

      const response = await wastageService.getAllWastageRecords(queryParams);

      if (response.success) {
        wastageRecords.value = response.data.data;
        pagination.value = response.data.pagination;
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch wastage records';
      console.error('Error fetching wastage records:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchWastageRecordById = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await wastageService.getWastageRecordById(id);

      if (response.success) {
        currentWastageRecord.value = response.data;
      }

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch wastage record';
      console.error('Error fetching wastage record:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createWastageRecord = async data => {
    loading.value = true;
    error.value = null;

    try {
      const response = await wastageService.createWastageRecord(data);

      if (response.success) {
        // Refresh the list
        await fetchWastageRecords();
      }

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create wastage record';
      console.error('Error creating wastage record:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateWastageRecord = async (id, data) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await wastageService.updateWastageRecord(id, data);

      if (response.success) {
        // Update current record
        currentWastageRecord.value = response.data;
        // Refresh the list
        await fetchWastageRecords();
      }

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update wastage record';
      console.error('Error updating wastage record:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteWastageRecord = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await wastageService.deleteWastageRecord(id);

      if (response.success) {
        // Remove from list
        wastageRecords.value = wastageRecords.value.filter(record => record.id !== id);
        pagination.value.total -= 1;
      }

      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete wastage record';
      console.error('Error deleting wastage record:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMonthlySummary = async (year, month) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await wastageService.getMonthlyWastageSummary(year, month);

      if (response.success) {
        monthlySummary.value = response.data;
      }

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch monthly summary';
      console.error('Error fetching monthly summary:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchWastageTrend = async (months = 6) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await wastageService.getWastageTrend(months);

      if (response.success) {
        wastageTrend.value = response.data;
      }

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch wastage trend';
      console.error('Error fetching wastage trend:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setFilters = newFilters => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1; // Reset to first page when filters change
  };

  const setPage = page => {
    pagination.value.page = page;
  };

  const clearFilters = () => {
    filters.value = {
      wastage_type: null,
      item_type: null,
      start_date: null,
      end_date: null,
      search: '',
    };
    pagination.value.page = 1;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    wastageRecords,
    currentWastageRecord,
    monthlySummary,
    wastageTrend,
    loading,
    error,
    pagination,
    filters,

    // Getters
    totalWastageCost,

    // Actions
    fetchWastageRecords,
    fetchWastageRecordById,
    createWastageRecord,
    updateWastageRecord,
    deleteWastageRecord,
    fetchMonthlySummary,
    fetchWastageTrend,
    setFilters,
    setPage,
    clearFilters,
    clearError,
  };
});
