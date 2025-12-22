import salesService from '@/services/salesService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSalesStore = defineStore('sales', () => {
  // State
  const invoices = ref([]);
  const currentInvoice = ref(null);
  const totalInvoices = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getInvoiceById = computed(() => id => {
    return invoices.value.find(invoice => invoice.id === id);
  });

  const paidInvoices = computed(() => {
    return invoices.value.filter(invoice => invoice.payment_status === 'paid');
  });

  const unpaidInvoices = computed(() => {
    return invoices.value.filter(invoice => invoice.payment_status === 'unpaid');
  });

  const partialInvoices = computed(() => {
    return invoices.value.filter(invoice => invoice.payment_status === 'partial');
  });

  // Actions
  const fetchInvoices = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await salesService.getAllInvoices(params);
      invoices.value = data.invoices;
      totalInvoices.value = data.total;
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch invoices';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchInvoiceById = async id => {
    loading.value = true;
    error.value = null;
    try {
      const data = await salesService.getInvoiceById(id);
      currentInvoice.value = data;
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch invoice';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createInvoice = async invoiceData => {
    loading.value = true;
    error.value = null;
    try {
      const data = await salesService.createInvoice(invoiceData);
      invoices.value.unshift(data);
      totalInvoices.value += 1;
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create invoice';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateInvoice = async (id, invoiceData) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await salesService.updateInvoice(id, invoiceData);
      const index = invoices.value.findIndex(invoice => invoice.id === id);
      if (index !== -1) {
        invoices.value[index] = data;
      }
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = data;
      }
      return data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update invoice';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvoice = async id => {
    loading.value = true;
    error.value = null;
    try {
      await salesService.deleteInvoice(id);
      invoices.value = invoices.value.filter(invoice => invoice.id !== id);
      totalInvoices.value -= 1;
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = null;
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete invoice';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentInvoice = () => {
    currentInvoice.value = null;
  };

  return {
    // State
    invoices,
    currentInvoice,
    totalInvoices,
    loading,
    error,
    // Getters
    getInvoiceById,
    paidInvoices,
    unpaidInvoices,
    partialInvoices,
    // Actions
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    clearError,
    clearCurrentInvoice,
  };
});
