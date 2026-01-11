import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const supplierPaymentService = {
  // Get all supplier payments with filters
  async getAllSupplierPayments(params = {}) {
    try {
      const response = await api.get('/suppliers/payments', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get payments for specific supplier
  async getSupplierPayments(supplierId, params = {}) {
    try {
      const response = await api.get(`/suppliers/${supplierId}/payments`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create supplier payment
  async createSupplierPayment(supplierId, paymentData) {
    try {
      const response = await api.post(`/suppliers/${supplierId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default supplierPaymentService;
