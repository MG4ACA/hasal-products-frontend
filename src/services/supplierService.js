import api from './api';

export const supplierService = {
  // Get all suppliers with pagination and filters
  getAllSuppliers(params = {}) {
    return api.get('/suppliers', { params });
  },

  // Get supplier by ID
  getSupplierById(id) {
    return api.get(`/suppliers/${id}`);
  },

  // Get supplier balance
  getSupplierBalance(id) {
    return api.get(`/suppliers/${id}/balance`);
  },

  // Create new supplier
  createSupplier(data) {
    return api.post('/suppliers', data);
  },

  // Update supplier
  updateSupplier(id, data) {
    return api.put(`/suppliers/${id}`, data);
  },

  // Delete supplier (soft delete)
  deleteSupplier(id) {
    return api.delete(`/suppliers/${id}`);
  },
};
