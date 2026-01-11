import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const OUTLET_BASE_URL = '/outlets';

export const outletService = {
  // Get all outlets with pagination and filters
  async getAll(params = {}) {
    try {
      const response = await api.get(OUTLET_BASE_URL, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get outlet by ID
  async getById(id) {
    try {
      const response = await api.get(`${OUTLET_BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create outlet
  async create(outletData) {
    try {
      const response = await api.post(OUTLET_BASE_URL, outletData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update outlet
  async update(id, outletData) {
    try {
      const response = await api.put(`${OUTLET_BASE_URL}/${id}`, outletData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete outlet
  async delete(id) {
    try {
      const response = await api.delete(`${OUTLET_BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get outlet balance
  async getBalance(id) {
    try {
      const response = await api.get(`${OUTLET_BASE_URL}/${id}/balance`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get outlet invoices
  async getInvoices(id, params = {}) {
    try {
      const response = await api.get(`${OUTLET_BASE_URL}/${id}/invoices`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get outlet payments
  async getPayments(id, params = {}) {
    try {
      const response = await api.get(`${OUTLET_BASE_URL}/${id}/payments`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
