import recipeService from '@/services/recipeService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useRecipeStore = defineStore('recipe', () => {
  // State
  const recipes = ref([]);
  const currentRecipe = ref(null);
  const versionHistory = ref([]);
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
    product_id: '',
  });

  // Getters
  const activeRecipes = computed(() => recipes.value.filter(r => r.status === 'active'));
  const inactiveRecipes = computed(() => recipes.value.filter(r => r.status === 'inactive'));

  // Actions
  const fetchRecipes = async () => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search,
        status: filters.value.status,
        product_id: filters.value.product_id,
      };

      const response = await recipeService.getAll(params);

      recipes.value = response.data;
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      };
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch recipes';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRecipeById = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await recipeService.getById(id);
      currentRecipe.value = response;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch recipe';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRecipe = async recipeData => {
    loading.value = true;
    error.value = null;

    try {
      const response = await recipeService.create(recipeData);
      await fetchRecipes();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create recipe';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRecipe = async (id, recipeData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await recipeService.update(id, recipeData);
      await fetchRecipes();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update recipe';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRecipe = async id => {
    loading.value = true;
    error.value = null;

    try {
      await recipeService.delete(id);
      await fetchRecipes();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete recipe';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVersionHistory = async id => {
    loading.value = true;
    error.value = null;

    try {
      const response = await recipeService.getVersions(id);
      versionHistory.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch version history';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addItem = async (recipeId, itemData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await recipeService.addItem(recipeId, itemData);
      await fetchRecipeById(recipeId);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (recipeId, itemId, itemData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await recipeService.updateItem(recipeId, itemId, itemData);
      await fetchRecipeById(recipeId);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (recipeId, itemId) => {
    loading.value = true;
    error.value = null;

    try {
      await recipeService.deleteItem(recipeId, itemId);
      await fetchRecipeById(recipeId);
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = page => {
    pagination.value.page = page;
    fetchRecipes();
  };

  const setLimit = limit => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchRecipes();
  };

  const setSearch = search => {
    filters.value.search = search;
    pagination.value.page = 1;
    fetchRecipes();
  };

  const setStatusFilter = status => {
    filters.value.status = status;
    pagination.value.page = 1;
    fetchRecipes();
  };

  const setProductFilter = productId => {
    filters.value.product_id = productId;
    pagination.value.page = 1;
    fetchRecipes();
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      product_id: '',
    };
    pagination.value.page = 1;
    fetchRecipes();
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    recipes,
    currentRecipe,
    versionHistory,
    loading,
    error,
    pagination,
    filters,
    // Getters
    activeRecipes,
    inactiveRecipes,
    // Actions
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    fetchVersionHistory,
    addItem,
    updateItem,
    deleteItem,
    setPage,
    setLimit,
    setSearch,
    setStatusFilter,
    setProductFilter,
    clearFilters,
    clearError,
  };
});
