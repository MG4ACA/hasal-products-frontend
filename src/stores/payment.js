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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      payments.value = response.payments;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.message || 'Error fetching payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPaymentById = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getPaymentById(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      currentPayment.value = response;
      return currentPayment.value;
    } catch (err) {
      error.value = err.message || 'Error fetching payment';
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

      // Check for error response
      if (newPayment.error) {
        error.value = newPayment.message;
        throw new Error(newPayment.message);
      }

      payments.value.unshift(newPayment);
      return newPayment;
    } catch (err) {
      error.value = err.message || 'Error creating payment';
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

      // Check for error response
      if (updatedPayment.error) {
        error.value = updatedPayment.message;
        throw new Error(updatedPayment.message);
      }

      const index = payments.value.findIndex(p => p.id === id);
      if (index !== -1) {
        payments.value[index] = updatedPayment;
      }
      if (currentPayment.value?.id === id) {
        currentPayment.value = updatedPayment;
      }
      return updatedPayment;
    } catch (err) {
      error.value = err.message || 'Error updating payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePayment = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.deletePayment(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      payments.value = payments.value.filter(p => p.id !== id);
    } catch (err) {
      error.value = err.message || 'Error deleting payment';
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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      outstandingInvoices.value = response.invoices;
      return response;
    } catch (err) {
      error.value = err.message || 'Error fetching outstanding invoices';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPendingChecks = async (overdueOnly = false) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getPendingChecks(overdueOnly);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      pendingChecks.value = response;
    } catch (err) {
      error.value = err.message || 'Error fetching pending checks';
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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      supplierPayments.value = response.payments;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.message || 'Error fetching supplier payments';
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

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      supplierPayments.value = response.payments;
      pagination.value = response.pagination;
    } catch (err) {
      error.value = err.message || 'Error fetching supplier payments';
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

      // Check for error response
      if (newPayment.error) {
        error.value = newPayment.message;
        throw new Error(newPayment.message);
      }

      supplierPayments.value.unshift(newPayment);
      return newPayment;
    } catch (err) {
      error.value = err.message || 'Error creating supplier payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSupplierPayment = async (supplierId, paymentId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierPaymentService.deleteSupplierPayment(supplierId, paymentId);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      supplierPayments.value = supplierPayments.value.filter(p => p.id !== paymentId);
      return response;
    } catch (err) {
      error.value = err.message || 'Error deleting supplier payment';
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
    deleteSupplierPayment,
    resetState,
  };
});
