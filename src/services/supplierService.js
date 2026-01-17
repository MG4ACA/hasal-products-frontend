import { handleApiError } from '@/utils/errorHandler';
import api from './api';

export const supplierService = {
  // Get all suppliers with pagination and filters
  async getAllSuppliers(params = {}) {
    try {
      const response = await api.get('/suppliers', { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get supplier by ID
  async getSupplierById(id) {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get supplier balance
  async getSupplierBalance(id) {
    try {
      const response = await api.get(`/suppliers/${id}/balance`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new supplier
  async createSupplier(data) {
    try {
      const response = await api.post('/suppliers', data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update supplier
  async updateSupplier(id, data) {
    try {
      const response = await api.put(`/suppliers/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete supplier (soft delete)
  async deleteSupplier(id) {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get purchase orders for supplier
  async getSupplierPurchaseOrders(id, status = 'pending,partial,received') {
    try {
      const response = await api.get(`/suppliers/${id}/purchase-orders`, {
        params: { status },
      });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
