import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const paymentService = {
  // Get all payments with filters
  async getAllPayments(params = {}) {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get payment by ID
  async getPaymentById(id) {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new payment
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update payment (add clearance date)
  async updatePayment(id, updateData) {
    try {
      const response = await api.put(`/payments/${id}`, updateData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete payment
  async deletePayment(id) {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get outstanding invoices for outlet
  async getOutstandingInvoices(outletId) {
    try {
      const response = await api.get(`/outlets/${outletId}/outstanding-invoices`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get pending checks
  async getPendingChecks(overdueOnly = false) {
    try {
      const response = await api.get('/payments/pending-checks', {
        params: { overdue_only: overdueOnly },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default paymentService;
