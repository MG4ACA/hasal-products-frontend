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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      rawMaterials.value = response.raw_materials;
      pagination.value = response.pagination;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch raw materials';
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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      currentRawMaterial.value = response.raw_material;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch raw material';
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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      batches.value = response.batches;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch batches';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRawMaterialStock = async id => {
    try {
      const response = await rawMaterialService.getRawMaterialStock(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      currentStock.value = response.stock;
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to fetch stock';
      throw err;
    }
  };

  const createRawMaterial = async data => {
    loading.value = true;
    error.value = null;
    try {
      const response = await rawMaterialService.createRawMaterial(data);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      rawMaterials.value.unshift(response.raw_material);
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to create raw material';
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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      const index = rawMaterials.value.findIndex(rm => rm.id === id);
      if (index !== -1) {
        rawMaterials.value[index] = response.raw_material;
      }
      if (currentRawMaterial.value?.id === id) {
        currentRawMaterial.value = response.raw_material;
      }
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to update raw material';
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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      rawMaterials.value = rawMaterials.value.filter(rm => rm.id !== id);
      if (currentRawMaterial.value?.id === id) {
        currentRawMaterial.value = null;
      }
      return response;
    } catch (err) {
      error.value = err.message || 'Failed to delete raw material';
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
