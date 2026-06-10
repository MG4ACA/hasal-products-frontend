import salesService from '@/services/salesService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const DRAFT_STORAGE_KEY = 'hasal_invoice_draft';

// Helper: load draft from localStorage
const loadDraftFromStorage = () => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Restore Date objects
    if (parsed.invoice_date) parsed.invoice_date = new Date(parsed.invoice_date);
    if (parsed.check_date) parsed.check_date = new Date(parsed.check_date);
    return parsed;
  } catch {
    return null;
  }
};

export const useSalesStore = defineStore('sales', () => {
  // State
  const invoices = ref([]);
  const currentInvoice = ref(null);
  const totalInvoices = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Draft invoice state (persisted in localStorage)
  const draftInvoice = ref(loadDraftFromStorage());

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

      // Check for error response
      if (data.error) {
        error.value = data.message;
        throw new Error(data.message);
      }

      invoices.value = data.invoices;
      totalInvoices.value = data.total;
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch invoices';
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

      // Check for error response
      if (data.error) {
        error.value = data.message;
        throw new Error(data.message);
      }

      currentInvoice.value = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch invoice';
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

      // Check for error response
      if (data.error) {
        error.value = data.message;
        throw new Error(data.message);
      }

      invoices.value.unshift(data);
      totalInvoices.value += 1;
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to create invoice';
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

      // Check for error response
      if (data.error) {
        error.value = data.message;
        throw new Error(data.message);
      }

      const index = invoices.value.findIndex(invoice => invoice.id === id);
      if (index !== -1) {
        invoices.value[index] = data;
      }
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = data;
      }
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to update invoice';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvoice = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await salesService.deleteInvoice(id);

      // Check for error response
      if (response.error) {
        error.value = response.message;
        throw new Error(response.message);
      }

      invoices.value = invoices.value.filter(invoice => invoice.id !== id);
      totalInvoices.value -= 1;
      if (currentInvoice.value?.id === id) {
        currentInvoice.value = null;
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete invoice';
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

  // Save invoice draft to localStorage
  const saveDraft = (data) => {
    try {
      draftInvoice.value = data;
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  };

  // Clear invoice draft from localStorage
  const clearDraft = () => {
    draftInvoice.value = null;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  return {
    // State
    invoices,
    currentInvoice,
    totalInvoices,
    loading,
    error,
    draftInvoice,
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
    saveDraft,
    clearDraft,
  };
});
