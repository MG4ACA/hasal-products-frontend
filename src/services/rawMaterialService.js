import api from './api';

export const rawMaterialService = {
  // Get all raw materials with pagination and filters
  getAllRawMaterials(params = {}) {
    return api.get('/raw-materials', { params }).then(res => res.data);
  },

  // Get raw material by ID
  getRawMaterialById(id) {
    return api.get(`/raw-materials/${id}`).then(res => res.data);
  },

  // Get raw material batches
  getRawMaterialBatches(id, params = {}) {
    return api.get(`/raw-materials/${id}/batches`, { params }).then(res => res.data);
  },

  // Get raw material stock
  getRawMaterialStock(id) {
    return api.get(`/raw-materials/${id}/stock`).then(res => res.data);
  },

  // Create new raw material
  createRawMaterial(data) {
    return api.post('/raw-materials', data).then(res => res.data);
  },

  // Update raw material
  updateRawMaterial(id, data) {
    return api.put(`/raw-materials/${id}`, data).then(res => res.data);
  },

  // Delete raw material (soft delete)
  deleteRawMaterial(id) {
    return api.delete(`/raw-materials/${id}`).then(res => res.data);
  },
};
