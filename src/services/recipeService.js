import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const RECIPE_BASE_URL = '/recipes';

export const recipeService = {
  // Get all recipes with pagination and filters
  async getAll(params = {}) {
    try {
      const response = await api.get(RECIPE_BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get recipe by ID
  async getById(id) {
    try {
      const response = await api.get(`${RECIPE_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create recipe
  async create(recipeData) {
    try {
      const response = await api.post(RECIPE_BASE_URL, recipeData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update recipe (creates new version)
  async update(id, recipeData) {
    try {
      const response = await api.put(`${RECIPE_BASE_URL}/${id}`, recipeData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete recipe
  async delete(id) {
    try {
      const response = await api.delete(`${RECIPE_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get version history
  async getVersions(id) {
    try {
      const response = await api.get(`${RECIPE_BASE_URL}/${id}/versions`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add item to recipe
  async addItem(recipeId, itemData) {
    try {
      const response = await api.post(`${RECIPE_BASE_URL}/${recipeId}/items`, itemData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update recipe item
  async updateItem(recipeId, itemId, itemData) {
    try {
      const response = await api.put(`${RECIPE_BASE_URL}/${recipeId}/items/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete recipe item
  async deleteItem(recipeId, itemId) {
    try {
      const response = await api.delete(`${RECIPE_BASE_URL}/${recipeId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default recipeService;
