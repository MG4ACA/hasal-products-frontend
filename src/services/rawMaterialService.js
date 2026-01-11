import { handleApiError } from '@/utils/errorHandler';
import api from './api';

export const rawMaterialService = {
  // Get all raw materials with pagination and filters
  async getAllRawMaterials(params = {}) {
    try {
      const response = await api.get('/raw-materials', { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get raw material by ID
  async getRawMaterialById(id) {
    try {
      const response = await api.get(`/raw-materials/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get raw material batches
  async getRawMaterialBatches(id, params = {}) {
    try {
      const response = await api.get(`/raw-materials/${id}/batches`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get raw material stock
  async getRawMaterialStock(id) {
    try {
      const response = await api.get(`/raw-materials/${id}/stock`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new raw material
  async createRawMaterial(data) {
    try {
      const response = await api.post('/raw-materials', data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update raw material
  async updateRawMaterial(id, data) {
    try {
      const response = await api.put(`/raw-materials/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete raw material (soft delete)
  async deleteRawMaterial(id) {
    try {
      const response = await api.delete(`/raw-materials/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
