import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import purchaseOrderService from '../services/purchaseOrderService';

export const usePurchaseOrderStore = defineStore('purchaseOrder', () => {
  // State
  const purchaseOrders = ref([]);
  const currentPurchaseOrder = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const filters = ref({
    search: '',
    status: '',
    supplier_id: '',
    start_date: '',
    end_date: '',
  });

  // Getters
  const getPurchaseOrders = computed(() => purchaseOrders.value);
  const getCurrentPurchaseOrder = computed(() => currentPurchaseOrder.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getPagination = computed(() => pagination.value);
  const getFilters = computed(() => filters.value);

  const getCurrentPoItems = computed(() => {
    return currentPurchaseOrder.value?.PoItems || [];
  });

  const getCurrentPoTotal = computed(() => {
    if (!currentPurchaseOrder.value?.PoItems) return 0;
    return currentPurchaseOrder.value.PoItems.reduce((sum, item) => {
      return sum + parseFloat(item.total_cost || 0);
    }, 0);
  });

  const getPurchaseOrdersByStatus = computed(() => status => {
    return purchaseOrders.value.filter(po => po.status === status);
  });

  // Actions
  const fetchPurchaseOrders = async (params = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const queryParams = {
        page: params.page || pagination.value.page,
        limit: params.limit || pagination.value.limit,
        search: params.search !== undefined ? params.search : filters.value.search,
        status: params.status !== undefined ? params.status : filters.value.status,
        supplier_id:
          params.supplier_id !== undefined ? params.supplier_id : filters.value.supplier_id,
        start_date: params.start_date !== undefined ? params.start_date : filters.value.start_date,
        end_date: params.end_date !== undefined ? params.end_date : filters.value.end_date,
      };

      const response = await purchaseOrderService.getAllPurchaseOrders(queryParams);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.data.success) {
        purchaseOrders.value = response.data.data.data;
        pagination.value = {
          page: response.data.data.page,
          limit: response.data.data.limit,
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
        };

        // Update filters
        filters.value = {
          search: queryParams.search,
          status: queryParams.status,
          supplier_id: queryParams.supplier_id,
          start_date: queryParams.start_date,
          end_date: queryParams.end_date,
        };
      }

      return response.data.data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch purchase orders';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPurchaseOrderById = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await purchaseOrderService.getPurchaseOrderById(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.data.success) {
        currentPurchaseOrder.value = response.data.data;
      }

      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch purchase order';
      currentPurchaseOrder.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPurchaseOrder = async data => {
    loading.value = true;
    error.value = null;

    try {
      const response = await purchaseOrderService.createPurchaseOrder(data);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.data.success) {
        // Add to list if we're on page 1
        if (pagination.value.page === 1) {
          purchaseOrders.value.unshift(response.data.data);
        }
        pagination.value.total += 1;
      }

      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to create purchase order';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePurchaseOrder = async (id, data) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await purchaseOrderService.updatePurchaseOrder(id, data);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.data.success) {
        // Update in list
        const index = purchaseOrders.value.findIndex(po => po.id === id);
        if (index !== -1) {
          purchaseOrders.value[index] = response.data.data;
        }

        // Update current if it's the same PO
        if (currentPurchaseOrder.value?.id === id) {
          currentPurchaseOrder.value = response.data.data;
        }
      }

      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to update purchase order';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePurchaseOrder = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await purchaseOrderService.deletePurchaseOrder(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.data.success) {
        // Remove from list
        purchaseOrders.value = purchaseOrders.value.filter(po => po.id !== id);
        pagination.value.total -= 1;

        // Clear current if it's the deleted PO
        if (currentPurchaseOrder.value?.id === id) {
          currentPurchaseOrder.value = null;
        }
      }

      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to delete purchase order';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const receivePurchaseOrder = async (id, data) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await purchaseOrderService.receivePurchaseOrder(id, data);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.data.success) {
        // Update in list
        const index = purchaseOrders.value.findIndex(po => po.id === id);
        if (index !== -1) {
          purchaseOrders.value[index] = response.data.data;
        }

        // Update current PO
        if (currentPurchaseOrder.value?.id === id) {
          currentPurchaseOrder.value = response.data.data;
        }
      }

      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to receive purchase order';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePurchaseOrderStatus = async (id, status) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await purchaseOrderService.updatePurchaseOrderStatus(id, status);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      if (response.data.success) {
        // Update in list
        const index = purchaseOrders.value.findIndex(po => po.id === id);
        if (index !== -1) {
          purchaseOrders.value[index] = response.data.data;
        }

        // Update current if it's the same PO
        if (currentPurchaseOrder.value?.id === id) {
          currentPurchaseOrder.value = response.data.data;
        }
      }

      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to update purchase order status';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setFilters = newFilters => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const resetFilters = () => {
    filters.value = {
      search: '',
      status: '',
      supplier_id: '',
      start_date: '',
      end_date: '',
    };
  };

  const clearCurrentPurchaseOrder = () => {
    currentPurchaseOrder.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    purchaseOrders,
    currentPurchaseOrder,
    loading,
    error,
    pagination,
    filters,
    // Getters
    getPurchaseOrders,
    getCurrentPurchaseOrder,
    isLoading,
    getError,
    getPagination,
    getFilters,
    getCurrentPoItems,
    getCurrentPoTotal,
    getPurchaseOrdersByStatus,
    // Actions
    fetchPurchaseOrders,
    fetchPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    receivePurchaseOrder,
    updatePurchaseOrderStatus,
    setFilters,
    resetFilters,
    clearCurrentPurchaseOrder,
    clearError,
  };
});
