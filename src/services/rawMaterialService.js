import api from './api';

export const rawMaterialService = {
  // Get all raw materials with pagination and filters
  getAllRawMaterials(params = {}) {
    return api.get('/raw-materials', { params });
  },

  // Get raw material by ID
  getRawMaterialById(id) {
    return api.get(`/raw-materials/${id}`);
  },

  // Get raw material batches
  getRawMaterialBatches(id, params = {}) {
    return api.get(`/raw-materials/${id}/batches`, { params });
  },

  // Get raw material stock
  getRawMaterialStock(id) {
    return api.get(`/raw-materials/${id}/stock`);
  },

  // Create new raw material
  createRawMaterial(data) {
    return api.post('/raw-materials', data);
  },

  // Update raw material
  updateRawMaterial(id, data) {
    return api.put(`/raw-materials/${id}`, data);
  },

  // Delete raw material (soft delete)
  deleteRawMaterial(id) {
    return api.delete(`/raw-materials/${id}`);
  },
};
