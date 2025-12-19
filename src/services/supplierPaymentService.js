import api from './api';

const supplierPaymentService = {
  // Get all supplier payments with filters
  getAllSupplierPayments(params = {}) {
    return api.get('/suppliers/payments', { params }).then(res => res.data);
  },

  // Get payments for specific supplier
  getSupplierPayments(supplierId, params = {}) {
    return api.get(`/suppliers/${supplierId}/payments`, { params }).then(res => res.data);
  },

  // Create supplier payment
  createSupplierPayment(supplierId, paymentData) {
    return api.post(`/suppliers/${supplierId}/payments`, paymentData).then(res => res.data);
  },
};

export default supplierPaymentService;
