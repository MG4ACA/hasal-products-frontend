import productService from '@/services/productService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([]);
  const currentProduct = ref(null);
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
  });

  // Getters
  const activeProducts = computed(() => products.value.filter(p => p.status === 'active'));
  const inactiveProducts = computed(() => products.value.filter(p => p.status === 'inactive'));

  // Actions
  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search,
        status: filters.value.status,
      };

      const response = await productService.getAll(params);

      products.value = response.data;
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      };
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch products';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductById = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productService.getById(id);
      currentProduct.value = response;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async productData => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productService.create(productData);
      await fetchProducts();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (id, productData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productService.update(id, productData);
      await fetchProducts();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async id => {
    loading.value = true;
    error.value = null;

    try {
      await productService.delete(id);
      await fetchProducts();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete product';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addSku = async (productId, skuData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productService.addSku(productId, skuData);
      await fetchProductById(productId);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add SKU';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSku = async (productId, skuId, skuData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productService.updateSku(productId, skuId, skuData);
      await fetchProductById(productId);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update SKU';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSku = async (productId, skuId) => {
    loading.value = true;
    error.value = null;

    try {
      await productService.deleteSku(productId, skuId);
      await fetchProductById(productId);
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete SKU';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getProductStock = async productId => {
    loading.value = true;
    error.value = null;

    try {
      const response = await productService.getStock(productId);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch stock';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = page => {
    pagination.value.page = page;
    fetchProducts();
  };

  const setLimit = limit => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchProducts();
  };

  const setSearch = search => {
    filters.value.search = search;
    pagination.value.page = 1;
    fetchProducts();
  };

  const setStatusFilter = status => {
    filters.value.status = status;
    pagination.value.page = 1;
    fetchProducts();
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
    };
    pagination.value.page = 1;
    fetchProducts();
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    products,
    currentProduct,
    loading,
    error,
    pagination,
    filters,
    // Getters
    activeProducts,
    inactiveProducts,
    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addSku,
    updateSku,
    deleteSku,
    getProductStock,
    setPage,
    setLimit,
    setSearch,
    setStatusFilter,
    clearFilters,
    clearError,
  };
});
