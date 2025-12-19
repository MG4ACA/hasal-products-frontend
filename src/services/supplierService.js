import api from './api';

export const supplierService = {
  // Get all suppliers with pagination and filters
  getAllSuppliers(params = {}) {
    return api.get('/suppliers', { params }).then(res => res.data);
  },

  // Get supplier by ID
  getSupplierById(id) {
    return api.get(`/suppliers/${id}`).then(res => res.data);
  },

  // Get supplier balance
  getSupplierBalance(id) {
    return api.get(`/suppliers/${id}/balance`).then(res => res.data);
  },

  // Create new supplier
  createSupplier(data) {
    return api.post('/suppliers', data).then(res => res.data);
  },

  // Update supplier
  updateSupplier(id, data) {
    return api.put(`/suppliers/${id}`, data).then(res => res.data);
  },

  // Delete supplier (soft delete)
  deleteSupplier(id) {
    return api.delete(`/suppliers/${id}`).then(res => res.data);
  },
};
