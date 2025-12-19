import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import paymentService from '../services/paymentService';
import supplierPaymentService from '../services/supplierPaymentService';

export const usePaymentStore = defineStore('payment', () => {
  // State
  const payments = ref([]);
  const supplierPayments = ref([]);
  const currentPayment = ref(null);
  const outstandingInvoices = ref([]);
  const pendingChecks = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    total: 0,
    page: 1,
    pages: 1,
    limit: 50,
  });

  // Getters
  const hasPayments = computed(() => payments.value.length > 0);
  const hasPendingChecks = computed(() => pendingChecks.value.length > 0);
  const totalOutstanding = computed(() => {
    return outstandingInvoices.value.reduce(
      (sum, inv) => sum + parseFloat(inv.outstanding_amount || 0),
      0
    );
  });

  // Actions - Outlet Payments
  const fetchPayments = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getAllPayments(filters);
      payments.value = response.payments;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPaymentById = async id => {
    loading.value = true;
    error.value = null;
    try {
      currentPayment.value = await paymentService.getPaymentById(id);
      return currentPayment.value;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPayment = async paymentData => {
    loading.value = true;
    error.value = null;
    try {
      const newPayment = await paymentService.createPayment(paymentData);
      payments.value.unshift(newPayment);
      return newPayment;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error creating payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePayment = async (id, updateData) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedPayment = await paymentService.updatePayment(id, updateData);
      const index = payments.value.findIndex(p => p.id === id);
      if (index !== -1) {
        payments.value[index] = updatedPayment;
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = updatedPayment;
      }
      return updatedPayment;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error updating payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePayment = async id => {
    loading.value = true;
    error.value = null;
    try {
      await paymentService.deletePayment(id);
      payments.value = payments.value.filter(p => p.id !== id);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error deleting payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOutstandingInvoices = async outletId => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getOutstandingInvoices(outletId);
      outstandingInvoices.value = response.invoices;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching outstanding invoices';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPendingChecks = async (overdueOnly = false) => {
    loading.value = true;
    error.value = null;
    try {
      pendingChecks.value = await paymentService.getPendingChecks(overdueOnly);
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching pending checks';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions - Supplier Payments
  const fetchSupplierPayments = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierPaymentService.getAllSupplierPayments(filters);
      supplierPayments.value = response.payments;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching supplier payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSupplierPaymentsBySupplierId = async (supplierId, filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierPaymentService.getSupplierPayments(supplierId, filters);
      supplierPayments.value = response.payments;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error fetching supplier payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSupplierPayment = async (supplierId, paymentData) => {
    loading.value = true;
    error.value = null;
    try {
      const newPayment = await supplierPaymentService.createSupplierPayment(
        supplierId,
        paymentData
      );
      supplierPayments.value.unshift(newPayment);
      return newPayment;
    } catch (err) {
      error.value = err.response?.data?.message || 'Error creating supplier payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Reset
  const resetState = () => {
    payments.value = [];
    supplierPayments.value = [];
    currentPayment.value = null;
    outstandingInvoices.value = [];
    pendingChecks.value = [];
    loading.value = false;
    error.value = null;
    pagination.value = {
      total: 0,
      page: 1,
      pages: 1,
      limit: 50,
    };
  };

  return {
    // State
    payments,
    supplierPayments,
    currentPayment,
    outstandingInvoices,
    pendingChecks,
    loading,
    error,
    pagination,

    // Getters
    hasPayments,
    hasPendingChecks,
    totalOutstanding,

    // Actions
    fetchPayments,
    fetchPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    fetchOutstandingInvoices,
    fetchPendingChecks,
    fetchSupplierPayments,
    fetchSupplierPaymentsBySupplierId,
    createSupplierPayment,
    resetState,
  };
});
