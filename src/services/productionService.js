import api from './api';

const PRODUCTION_BASE_URL = '/production-runs';

export const productionService = {
  // Get all production runs with pagination and filters
  async getAll(params = {}) {
    const response = await api.get(PRODUCTION_BASE_URL, { params });
    return response.data;
  },

  // Get production run by ID
  async getById(id) {
    const response = await api.get(`${PRODUCTION_BASE_URL}/${id}`);
    return response.data;
  },

  // Create production run
  async create(productionData) {
    const response = await api.post(PRODUCTION_BASE_URL, productionData);
    return response.data;
  },

  // Update production run
  async update(id, productionData) {
    const response = await api.put(`${PRODUCTION_BASE_URL}/${id}`, productionData);
    return response.data;
  },

  // Delete production run
  async delete(id) {
    const response = await api.delete(`${PRODUCTION_BASE_URL}/${id}`);
    return response.data;
  },

  // Complete production run
  async complete(id, completionData) {
    const response = await api.post(`${PRODUCTION_BASE_URL}/${id}/complete`, completionData);
    return response.data;
  },

  // Check material availability
  async checkMaterials(id) {
    const response = await api.get(`${PRODUCTION_BASE_URL}/${id}/check-materials`);
    return response.data;
  },
};

export default productionService;
