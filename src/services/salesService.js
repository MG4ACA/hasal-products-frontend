import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const salesService = {
  // Get all invoices with filters
  async getAllInvoices(params = {}) {
    try {
      const response = await api.get('/sales-invoices', { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      const response = await api.get(`/sales-invoices/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      const response = await api.post('/sales-invoices', invoiceData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update invoice
  async updateInvoice(id, invoiceData) {
    try {
      const response = await api.put(`/sales-invoices/${id}`, invoiceData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete invoice
  async deleteInvoice(id) {
    try {
      const response = await api.delete(`/sales-invoices/${id}`);
      return response.data.data;
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
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get sale profit for specific invoice
  async getSaleProfit(id) {
    try {
      const response = await api.get(`/sales/invoices/${id}/profit`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get profit summary (daily/monthly)
  async getProfitSummary(params = {}) {
    try {
      const response = await api.get('/sales/profit-summary', { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Phase 2: Get purchase history for return validation
  async getPurchaseHistory(outletId, skuId) {
    try {
      const response = await api.get('/sales-invoices/purchase-history', {
        params: { outlet_id: outletId, sku_id: skuId },
      });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default salesService;
