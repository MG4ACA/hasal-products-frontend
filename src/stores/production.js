import productionService from '@/services/productionService';
import { defineStore } from 'pinia';

export const useProductionStore = defineStore('production', {
  state: () => ({
    productionRuns: [],
    currentProductionRun: null,
    materialCheck: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      status: '',
      product_id: '',
      date_from: '',
      date_to: '',
    },
  }),

  getters: {
    plannedRuns: state => state.productionRuns.filter(r => r.status === 'planned'),
    inProgressRuns: state => state.productionRuns.filter(r => r.status === 'in_progress'),
    completedRuns: state => state.productionRuns.filter(r => r.status === 'completed'),
  },

  actions: {
    async fetchProductionRuns() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          status: this.filters.status,
          product_id: this.filters.product_id,
          date_from: this.filters.date_from,
          date_to: this.filters.date_to,
        };

        const response = await productionService.getAll(params);

        this.productionRuns = response.data.data;
        this.pagination = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch production runs';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductionRunById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productionService.getById(id);
        this.currentProductionRun = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch production run';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProductionRun(productionData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productionService.create(productionData);
        await this.fetchProductionRuns();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create production run';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProductionRun(id, productionData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productionService.update(id, productionData);
        await this.fetchProductionRuns();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update production run';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProductionRun(id) {
      this.loading = true;
      this.error = null;

      try {
        await productionService.delete(id);
        await this.fetchProductionRuns();
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete production run';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async completeProductionRun(id, completionData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productionService.complete(id, completionData);
        await this.fetchProductionRuns();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to complete production run';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async checkMaterialAvailability(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productionService.checkMaterials(id);
        this.materialCheck = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to check materials';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchProductionRuns();
    },

    setLimit(limit) {
      this.pagination.limit = limit;
      this.pagination.page = 1;
      this.fetchProductionRuns();
    },

    setStatusFilter(status) {
      this.filters.status = status;
      this.pagination.page = 1;
      this.fetchProductionRuns();
    },

    setProductFilter(productId) {
      this.filters.product_id = productId;
      this.pagination.page = 1;
      this.fetchProductionRuns();
    },

    setDateRange(dateFrom, dateTo) {
      this.filters.date_from = dateFrom;
      this.filters.date_to = dateTo;
      this.pagination.page = 1;
      this.fetchProductionRuns();
    },

    clearFilters() {
      this.filters = {
        status: '',
        product_id: '',
        date_from: '',
        date_to: '',
      };
      this.pagination.page = 1;
      this.fetchProductionRuns();
    },

    clearError() {
      this.error = null;
    },
  },
});
