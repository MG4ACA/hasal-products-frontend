import api from './api';

const RECIPE_BASE_URL = '/recipes';

export const recipeService = {
  // Get all recipes with pagination and filters
  async getAll(params = {}) {
    const response = await api.get(RECIPE_BASE_URL, { params });
    return response.data;
  },

  // Get recipe by ID
  async getById(id) {
    const response = await api.get(`${RECIPE_BASE_URL}/${id}`);
    return response.data;
  },

  // Create recipe
  async create(recipeData) {
    const response = await api.post(RECIPE_BASE_URL, recipeData);
    return response.data;
  },

  // Update recipe (creates new version)
  async update(id, recipeData) {
    const response = await api.put(`${RECIPE_BASE_URL}/${id}`, recipeData);
    return response.data;
  },

  // Delete recipe
  async delete(id) {
    const response = await api.delete(`${RECIPE_BASE_URL}/${id}`);
    return response.data;
  },

  // Get version history
  async getVersions(id) {
    const response = await api.get(`${RECIPE_BASE_URL}/${id}/versions`);
    return response.data;
  },

  // Add item to recipe
  async addItem(recipeId, itemData) {
    const response = await api.post(`${RECIPE_BASE_URL}/${recipeId}/items`, itemData);
    return response.data;
  },

  // Update recipe item
  async updateItem(recipeId, itemId, itemData) {
    const response = await api.put(`${RECIPE_BASE_URL}/${recipeId}/items/${itemId}`, itemData);
    return response.data;
  },

  // Delete recipe item
  async deleteItem(recipeId, itemId) {
    const response = await api.delete(`${RECIPE_BASE_URL}/${recipeId}/items/${itemId}`);
    return response.data;
  },
};

export default recipeService;
