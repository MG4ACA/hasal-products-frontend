import recipeService from '@/services/recipeService';
import { defineStore } from 'pinia';

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [],
    currentRecipe: null,
    versionHistory: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      search: '',
      status: '',
      product_id: '',
    },
  }),

  getters: {
    activeRecipes: state => state.recipes.filter(r => r.status === 'active'),
    inactiveRecipes: state => state.recipes.filter(r => r.status === 'inactive'),
  },

  actions: {
    async fetchRecipes() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.filters.search,
          status: this.filters.status,
          product_id: this.filters.product_id,
        };

        const response = await recipeService.getAll(params);

        this.recipes = response.data.data;
        this.pagination = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch recipes';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRecipeById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.getById(id);
        this.currentRecipe = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch recipe';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createRecipe(recipeData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.create(recipeData);
        await this.fetchRecipes();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create recipe';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateRecipe(id, recipeData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.update(id, recipeData);
        await this.fetchRecipes();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update recipe';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteRecipe(id) {
      this.loading = true;
      this.error = null;

      try {
        await recipeService.delete(id);
        await this.fetchRecipes();
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete recipe';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchVersionHistory(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.getVersions(id);
        this.versionHistory = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch version history';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addItem(recipeId, itemData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.addItem(recipeId, itemData);
        await this.fetchRecipeById(recipeId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add item';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateItem(recipeId, itemId, itemData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.updateItem(recipeId, itemId, itemData);
        await this.fetchRecipeById(recipeId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update item';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteItem(recipeId, itemId) {
      this.loading = true;
      this.error = null;

      try {
        await recipeService.deleteItem(recipeId, itemId);
        await this.fetchRecipeById(recipeId);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete item';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchRecipes();
    },

    setLimit(limit) {
      this.pagination.limit = limit;
      this.pagination.page = 1;
      this.fetchRecipes();
    },

    setSearch(search) {
      this.filters.search = search;
      this.pagination.page = 1;
      this.fetchRecipes();
    },

    setStatusFilter(status) {
      this.filters.status = status;
      this.pagination.page = 1;
      this.fetchRecipes();
    },

    setProductFilter(productId) {
      this.filters.product_id = productId;
      this.pagination.page = 1;
      this.fetchRecipes();
    },

    clearFilters() {
      this.filters = {
        search: '',
        status: '',
        product_id: '',
      };
      this.pagination.page = 1;
      this.fetchRecipes();
    },

    clearError() {
      this.error = null;
    },
  },
});
