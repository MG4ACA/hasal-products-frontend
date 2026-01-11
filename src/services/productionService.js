import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const PRODUCTION_BASE_URL = '/production-runs';

export const productionService = {
  // Get all production runs with pagination and filters
  async getAll(params = {}) {
    try {
      const response = await api.get(PRODUCTION_BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get production run by ID
  async getById(id) {
    try {
      const response = await api.get(`${PRODUCTION_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create production run
  async create(productionData) {
    try {
      const response = await api.post(PRODUCTION_BASE_URL, productionData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update production run
  async update(id, productionData) {
    try {
      const response = await api.put(`${PRODUCTION_BASE_URL}/${id}`, productionData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete production run
  async delete(id) {
    try {
      const response = await api.delete(`${PRODUCTION_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Complete production run
  async complete(id, completionData) {
    try {
      const response = await api.post(`${PRODUCTION_BASE_URL}/${id}/complete`, completionData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check material availability
  async checkMaterials(id) {
    try {
      const response = await api.get(`${PRODUCTION_BASE_URL}/${id}/check-materials`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default productionService;
