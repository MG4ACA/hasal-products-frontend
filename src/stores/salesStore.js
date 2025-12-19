import salesService from '@/services/salesService';
import { defineStore } from 'pinia';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    invoices: [],
    currentInvoice: null,
    totalInvoices: 0,
    loading: false,
    error: null,
  }),

  getters: {
    getInvoiceById: state => id => {
      return state.invoices.find(invoice => invoice.id === id);
    },

    paidInvoices: state => {
      return state.invoices.filter(invoice => invoice.payment_status === 'paid');
    },

    unpaidInvoices: state => {
      return state.invoices.filter(invoice => invoice.payment_status === 'unpaid');
    },

    partialInvoices: state => {
      return state.invoices.filter(invoice => invoice.payment_status === 'partial');
    },
  },

  actions: {
    async fetchInvoices(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const data = await salesService.getAllInvoices(params);
        this.invoices = data.data.invoices;
        this.totalInvoices = data.data.total;
        return data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch invoices';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchInvoiceById(id) {
      this.loading = true;
      this.error = null;
      try {
        const data = await salesService.getInvoiceById(id);
        this.currentInvoice = data.data;
        return data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createInvoice(invoiceData) {
      this.loading = true;
      this.error = null;
      try {
        const data = await salesService.createInvoice(invoiceData);
        this.invoices.unshift(data.data);
        this.totalInvoices += 1;
        return data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateInvoice(id, invoiceData) {
      this.loading = true;
      this.error = null;
      try {
        const data = await salesService.updateInvoice(id, invoiceData);
        const index = this.invoices.findIndex(invoice => invoice.id === id);
        if (index !== -1) {
          this.invoices[index] = data.data;
        }
        if (this.currentInvoice?.id === id) {
          this.currentInvoice = data.data;
        }
        return data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteInvoice(id) {
      this.loading = true;
      this.error = null;
      try {
        await salesService.deleteInvoice(id);
        this.invoices = this.invoices.filter(invoice => invoice.id !== id);
        this.totalInvoices -= 1;
        if (this.currentInvoice?.id === id) {
          this.currentInvoice = null;
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete invoice';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentInvoice() {
      this.currentInvoice = null;
    },
  },
});
