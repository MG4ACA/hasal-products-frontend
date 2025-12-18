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
      suppliers.value = response.data.suppliers;
      pagination.value = response.data.pagination;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch suppliers';
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
      currentSupplier.value = response.data.supplier;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch supplier';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSupplierBalance = async id => {
    try {
      const response = await supplierService.getSupplierBalance(id);
      return response.data.balance;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch supplier balance';
      throw err;
    }
  };

  const createSupplier = async data => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierService.createSupplier(data);
      suppliers.value.unshift(response.data.supplier);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create supplier';
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
      const index = suppliers.value.findIndex(s => s.id === id);
      if (index !== -1) {
        suppliers.value[index] = response.data.supplier;
      }
      if (currentSupplier.value?.id === id) {
        currentSupplier.value = response.data.supplier;
      }
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update supplier';
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
      suppliers.value = suppliers.value.filter(s => s.id !== id);
      if (currentSupplier.value?.id === id) {
        currentSupplier.value = null;
      }
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete supplier';
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
