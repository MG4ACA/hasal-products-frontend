import api from './api';

const paymentService = {
  // Get all payments with filters
  getAllPayments(params = {}) {
    return api.get('/payments', { params }).then(res => res.data);
  },

  // Get payment by ID
  getPaymentById(id) {
    return api.get(`/payments/${id}`).then(res => res.data);
  },

  // Create new payment
  createPayment(paymentData) {
    return api.post('/payments', paymentData).then(res => res.data);
  },

  // Update payment (add clearance date)
  updatePayment(id, updateData) {
    return api.put(`/payments/${id}`, updateData).then(res => res.data);
  },

  // Delete payment
  deletePayment(id) {
    return api.delete(`/payments/${id}`).then(res => res.data);
  },

  // Get outstanding invoices for outlet
  getOutstandingInvoices(outletId) {
    return api.get(`/outlets/${outletId}/outstanding-invoices`).then(res => res.data);
  },

  // Get pending checks
  getPendingChecks(overdueOnly = false) {
    return api
      .get('/payments/pending-checks', {
        params: { overdue_only: overdueOnly },
      })
      .then(res => res.data);
  },
};

export default paymentService;
