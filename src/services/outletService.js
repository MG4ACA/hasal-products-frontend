import api from './api';

const OUTLET_BASE_URL = '/outlets';

export const outletService = {
  // Get all outlets with pagination and filters
  async getAll(params = {}) {
    const response = await api.get(OUTLET_BASE_URL, { params });
    return response.data;
  },

  // Get outlet by ID
  async getById(id) {
    const response = await api.get(`${OUTLET_BASE_URL}/${id}`);
    return response.data;
  },

  // Create outlet
  async create(outletData) {
    const response = await api.post(OUTLET_BASE_URL, outletData);
    return response.data;
  },

  // Update outlet
  async update(id, outletData) {
    const response = await api.put(`${OUTLET_BASE_URL}/${id}`, outletData);
    return response.data;
  },

  // Delete outlet
  async delete(id) {
    const response = await api.delete(`${OUTLET_BASE_URL}/${id}`);
    return response.data;
  },

  // Get outlet balance
  async getBalance(id) {
    const response = await api.get(`${OUTLET_BASE_URL}/${id}/balance`);
    return response.data;
  },

  // Get outlet invoices
  async getInvoices(id, params = {}) {
    const response = await api.get(`${OUTLET_BASE_URL}/${id}/invoices`, { params });
    return response.data;
  },

  // Get outlet payments
  async getPayments(id, params = {}) {
    const response = await api.get(`${OUTLET_BASE_URL}/${id}/payments`, { params });
    return response.data;
  },
};
