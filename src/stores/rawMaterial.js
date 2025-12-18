import { rawMaterialService } from '@/services/rawMaterialService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useRawMaterialStore = defineStore('rawMaterial', () => {
  // State
  const rawMaterials = ref([]);
  const currentRawMaterial = ref(null);
  const batches = ref([]);
  const currentStock = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Computed
  const activeRawMaterials = computed(() =>
    rawMaterials.value.filter(rm => rm.status === 'active')
  );
  const inactiveRawMaterials = computed(() =>
    rawMaterials.value.filter(rm => rm.status === 'inactive')
  );
  const lowStockMaterials = computed(() =>
    rawMaterials.value.filter(rm => {
      // This would need stock data - simplified for now
      return rm.status === 'active';
    })
  );

  // Actions
  const fetchRawMaterials = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await rawMaterialService.getAllRawMaterials(params);
      rawMaterials.value = response.data.raw_materials;
      pagination.value = response.data.pagination;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch raw materials';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRawMaterialById = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await rawMaterialService.getRawMaterialById(id);
      currentRawMaterial.value = response.data.raw_material;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch raw material';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRawMaterialBatches = async (id, params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await rawMaterialService.getRawMaterialBatches(id, params);
      batches.value = response.data.batches;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch batches';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRawMaterialStock = async id => {
    try {
      const response = await rawMaterialService.getRawMaterialStock(id);
      currentStock.value = response.data.stock;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch stock';
      throw err;
    }
  };

  const createRawMaterial = async data => {
    loading.value = true;
    error.value = null;
    try {
      const response = await rawMaterialService.createRawMaterial(data);
      rawMaterials.value.unshift(response.data.raw_material);
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create raw material';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRawMaterial = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await rawMaterialService.updateRawMaterial(id, data);
      const index = rawMaterials.value.findIndex(rm => rm.id === id);
      if (index !== -1) {
        rawMaterials.value[index] = response.data.raw_material;
      }
      if (currentRawMaterial.value?.id === id) {
        currentRawMaterial.value = response.data.raw_material;
      }
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update raw material';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRawMaterial = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await rawMaterialService.deleteRawMaterial(id);
      rawMaterials.value = rawMaterials.value.filter(rm => rm.id !== id);
      if (currentRawMaterial.value?.id === id) {
        currentRawMaterial.value = null;
      }
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete raw material';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const resetCurrentRawMaterial = () => {
    currentRawMaterial.value = null;
    currentStock.value = null;
    batches.value = [];
  };

  return {
    rawMaterials,
    currentRawMaterial,
    batches,
    currentStock,
    loading,
    error,
    pagination,
    activeRawMaterials,
    inactiveRawMaterials,
    lowStockMaterials,
    fetchRawMaterials,
    fetchRawMaterialById,
    fetchRawMaterialBatches,
    fetchRawMaterialStock,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    clearError,
    resetCurrentRawMaterial,
  };
});
