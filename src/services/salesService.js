import api from './api';

const salesService = {
  // Get all invoices with filters
  async getAllInvoices(params = {}) {
    const response = await api.get('/sales-invoices', { params });
    return response.data;
  },

  // Get invoice by ID
  async getInvoiceById(id) {
    const response = await api.get(`/sales-invoices/${id}`);
    return response.data;
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    const response = await api.post('/sales-invoices', invoiceData);
    return response.data;
  },

  // Update invoice
  async updateInvoice(id, invoiceData) {
    const response = await api.put(`/sales-invoices/${id}`, invoiceData);
    return response.data;
  },

  // Delete invoice
  async deleteInvoice(id) {
    const response = await api.delete(`/sales-invoices/${id}`);
    return response.data;
  },

  // Get invoice PDF (future)
  async getInvoicePDF(id) {
    const response = await api.get(`/sales-invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default salesService;
