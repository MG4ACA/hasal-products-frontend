import { outletService } from '@/services/outletService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useOutletStore = defineStore('outlet', () => {
  // State
  const outlets = ref([]);
  const currentOutlet = ref(null);
  const outletBalance = ref(null);
  const outletInvoices = ref([]);
  const outletPayments = ref([]);
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
    route_id: '',
  });

  // Getters
  const activeOutlets = computed(() => outlets.value.filter(o => o.status === 'active'));
  const inactiveOutlets = computed(() => outlets.value.filter(o => o.status === 'inactive'));
  const cashOutlets = computed(() => outlets.value.filter(o => o.payment_terms === 'cash'));
  const creditOutlets = computed(() => outlets.value.filter(o => o.payment_terms === 'credit'));

  // Actions
  const fetchOutlets = async () => {
    try {
      loading.value = true;
      error.value = null;

      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search,
        status: filters.value.status,
        route_id: filters.value.route_id,
      };

      const response = await outletService.getAll(params);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      outlets.value = response.outlets;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.message || 'Failed to fetch outlets';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOutletById = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await outletService.getById(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      currentOutlet.value = response;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch outlet';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createOutlet = async outletData => {
    try {
      loading.value = true;
      error.value = null;
      const response = await outletService.create(outletData);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      await fetchOutlets();
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to create outlet';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateOutlet = async (id, outletData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await outletService.update(id, outletData);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      await fetchOutlets();
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to update outlet';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOutlet = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await outletService.delete(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      await fetchOutlets();
    } catch (err) {
      error.value = err.message || 'Failed to delete outlet';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOutletBalance = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await outletService.getBalance(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      outletBalance.value = response;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch outlet balance';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOutletInvoices = async (id, params = {}) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await outletService.getInvoices(id, params);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      outletInvoices.value = response.invoices;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch outlet invoices';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOutletPayments = async (id, params = {}) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await outletService.getPayments(id, params);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      outletPayments.value = response.payments;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch outlet payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = page => {
    pagination.value.page = page;
    fetchOutlets();
  };

  const setLimit = limit => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchOutlets();
  };

  const setFilters = newFilters => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1;
    fetchOutlets();
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      route_id: '',
    };
    pagination.value.page = 1;
    fetchOutlets();
  };

  const clearCurrentOutlet = () => {
    currentOutlet.value = null;
    outletBalance.value = null;
    outletInvoices.value = [];
    outletPayments.value = [];
  };

  return {
    // State
    outlets,
    currentOutlet,
    outletBalance,
    outletInvoices,
    outletPayments,
    loading,
    error,
    pagination,
    filters,
    // Getters
    activeOutlets,
    inactiveOutlets,
    cashOutlets,
    creditOutlets,
    // Actions
    fetchOutlets,
    fetchOutletById,
    createOutlet,
    updateOutlet,
    deleteOutlet,
    fetchOutletBalance,
    fetchOutletInvoices,
    fetchOutletPayments,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    clearCurrentOutlet,
  };
});
