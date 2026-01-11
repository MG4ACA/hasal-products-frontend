import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const salesService = {
  // Get all invoices with filters
  async getAllInvoices(params = {}) {
    try {
      const response = await api.get('/sales-invoices', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      const response = await api.get(`/sales-invoices/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      const response = await api.post('/sales-invoices', invoiceData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update invoice
  async updateInvoice(id, invoiceData) {
    try {
      const response = await api.put(`/sales-invoices/${id}`, invoiceData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete invoice
  async deleteInvoice(id) {
    try {
      const response = await api.delete(`/sales-invoices/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get invoice PDF (future)
  async getInvoicePDF(id) {
    try {
      const response = await api.get(`/sales-invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default salesService;
