import { supplierService } from '@/services/supplierService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSupplierStore = defineStore('supplier', () => {
  // State
  const suppliers = ref([]);
  const currentSupplier = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Computed
  const activeSuppliers = computed(() => suppliers.value.filter(s => s.status === 'active'));
  const inactiveSuppliers = computed(() => suppliers.value.filter(s => s.status === 'inactive'));

  // Actions
  const fetchSuppliers = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierService.getAllSuppliers(params);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      suppliers.value = response.suppliers;
      pagination.value = response.pagination;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch suppliers';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSupplierById = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierService.getSupplierById(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      currentSupplier.value = response.supplier;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSupplierBalance = async id => {
    try {
      const response = await supplierService.getSupplierBalance(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      return response.balance;
    } catch (err) {
      error.value = err.message || 'Failed to fetch supplier balance';
      throw err;
    }
  };

  const createSupplier = async data => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierService.createSupplier(data);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      suppliers.value.unshift(response.supplier);
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to create supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSupplier = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierService.updateSupplier(id, data);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      const index = suppliers.value.findIndex(s => s.id === id);
      if (index !== -1) {
        suppliers.value[index] = response.supplier;
      }
      if (currentSupplier.value?.id === id) {
        currentSupplier.value = response.supplier;
      }
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to update supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSupplier = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierService.deleteSupplier(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      suppliers.value = suppliers.value.filter(s => s.id !== id);
      if (currentSupplier.value?.id === id) {
        currentSupplier.value = null;
      }
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to delete supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const resetCurrentSupplier = () => {
    currentSupplier.value = null;
  };

  return {
    suppliers,
    currentSupplier,
    loading,
    error,
    pagination,
    activeSuppliers,
    inactiveSuppliers,
    fetchSuppliers,
    fetchSupplierById,
    getSupplierBalance,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    clearError,
    resetCurrentSupplier,
  };
});
