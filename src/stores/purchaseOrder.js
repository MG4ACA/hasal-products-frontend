import { defineStore } from 'pinia';
import purchaseOrderService from '../services/purchaseOrderService';

export const usePurchaseOrderStore = defineStore('purchaseOrder', {
  state: () => ({
    purchaseOrders: [],
    currentPurchaseOrder: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      search: '',
      status: '',
      supplier_id: '',
      start_date: '',
      end_date: '',
    },
  }),

  getters: {
    /**
     * Get purchase orders list
     */
    getPurchaseOrders: state => state.purchaseOrders,

    /**
     * Get current purchase order
     */
    getCurrentPurchaseOrder: state => state.currentPurchaseOrder,

    /**
     * Check if loading
     */
    isLoading: state => state.loading,

    /**
     * Get error message
     */
    getError: state => state.error,

    /**
     * Get pagination info
     */
    getPagination: state => state.pagination,

    /**
     * Get active filters
     */
    getFilters: state => state.filters,

    /**
     * Get PO items for current purchase order
     */
    getCurrentPoItems: state => {
      return state.currentPurchaseOrder?.PoItems || [];
    },

    /**
     * Calculate total amount for current PO
     */
    getCurrentPoTotal: state => {
      if (!state.currentPurchaseOrder?.PoItems) return 0;
      return state.currentPurchaseOrder.PoItems.reduce((sum, item) => {
        return sum + parseFloat(item.total_cost || 0);
      }, 0);
    },

    /**
     * Get purchase orders by status
     */
    getPurchaseOrdersByStatus: state => status => {
      return state.purchaseOrders.filter(po => po.status === status);
    },
  },

  actions: {
    /**
     * Fetch all purchase orders with filters
     */
    async fetchPurchaseOrders(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = {
          page: params.page || this.pagination.page,
          limit: params.limit || this.pagination.limit,
          search: params.search !== undefined ? params.search : this.filters.search,
          status: params.status !== undefined ? params.status : this.filters.status,
          supplier_id:
            params.supplier_id !== undefined ? params.supplier_id : this.filters.supplier_id,
          start_date: params.start_date !== undefined ? params.start_date : this.filters.start_date,
          end_date: params.end_date !== undefined ? params.end_date : this.filters.end_date,
        };

        const response = await purchaseOrderService.getAllPurchaseOrders(queryParams);

        if (response.data.success) {
          this.purchaseOrders = response.data.data.data;
          this.pagination = {
            page: response.data.data.page,
            limit: response.data.data.limit,
            total: response.data.data.total,
            totalPages: response.data.data.totalPages,
          };

          // Update filters
          this.filters = {
            search: queryParams.search,
            status: queryParams.status,
            supplier_id: queryParams.supplier_id,
            start_date: queryParams.start_date,
            end_date: queryParams.end_date,
          };
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch purchase orders';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetch purchase order by ID
     */
    async fetchPurchaseOrderById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await purchaseOrderService.getPurchaseOrderById(id);

        if (response.data.success) {
          this.currentPurchaseOrder = response.data.data;
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch purchase order';
        this.currentPurchaseOrder = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create new purchase order
     */
    async createPurchaseOrder(data) {
      this.loading = true;
      this.error = null;

      try {
        const response = await purchaseOrderService.createPurchaseOrder(data);

        if (response.data.success) {
          // Add to list if we're on page 1
          if (this.pagination.page === 1) {
            this.purchaseOrders.unshift(response.data.data);
          }
          this.pagination.total += 1;
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create purchase order';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update purchase order
     */
    async updatePurchaseOrder(id, data) {
      this.loading = true;
      this.error = null;

      try {
        const response = await purchaseOrderService.updatePurchaseOrder(id, data);

        if (response.data.success) {
          // Update in list
          const index = this.purchaseOrders.findIndex(po => po.id === id);
          if (index !== -1) {
            this.purchaseOrders[index] = response.data.data;
          }

          // Update current if it's the same PO
          if (this.currentPurchaseOrder?.id === id) {
            this.currentPurchaseOrder = response.data.data;
          }
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update purchase order';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete purchase order
     */
    async deletePurchaseOrder(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await purchaseOrderService.deletePurchaseOrder(id);

        if (response.data.success) {
          // Remove from list
          this.purchaseOrders = this.purchaseOrders.filter(po => po.id !== id);
          this.pagination.total -= 1;

          // Clear current if it's the deleted PO
          if (this.currentPurchaseOrder?.id === id) {
            this.currentPurchaseOrder = null;
          }
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete purchase order';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Receive purchase order
     */
    async receivePurchaseOrder(id, data) {
      this.loading = true;
      this.error = null;

      try {
        const response = await purchaseOrderService.receivePurchaseOrder(id, data);

        if (response.data.success) {
          // Update in list
          const index = this.purchaseOrders.findIndex(po => po.id === id);
          if (index !== -1) {
            this.purchaseOrders[index] = response.data.data;
          }

          // Update current PO
          if (this.currentPurchaseOrder?.id === id) {
            this.currentPurchaseOrder = response.data.data;
          }
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to receive purchase order';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update purchase order status
     */
    async updatePurchaseOrderStatus(id, status) {
      this.loading = true;
      this.error = null;

      try {
        const response = await purchaseOrderService.updatePurchaseOrderStatus(id, status);

        if (response.data.success) {
          // Update in list
          const index = this.purchaseOrders.findIndex(po => po.id === id);
          if (index !== -1) {
            this.purchaseOrders[index] = response.data.data;
          }

          // Update current if it's the same PO
          if (this.currentPurchaseOrder?.id === id) {
            this.currentPurchaseOrder = response.data.data;
          }
        }

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update purchase order status';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Set filters
     */
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    /**
     * Reset filters
     */
    resetFilters() {
      this.filters = {
        search: '',
        status: '',
        supplier_id: '',
        start_date: '',
        end_date: '',
      };
    },

    /**
     * Clear current purchase order
     */
    clearCurrentPurchaseOrder() {
      this.currentPurchaseOrder = null;
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null;
    },
  },
});
