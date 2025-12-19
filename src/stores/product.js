import productService from '@/services/productService';
import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    currentProduct: null,
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
    },
  }),

  getters: {
    activeProducts: state => state.products.filter(p => p.status === 'active'),
    inactiveProducts: state => state.products.filter(p => p.status === 'inactive'),
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.filters.search,
          status: this.filters.status,
        };

        const response = await productService.getAll(params);

        this.products = response.data.data;
        this.pagination = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch products';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.getById(id);
        this.currentProduct = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch product';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createProduct(productData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.create(productData);
        await this.fetchProducts();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create product';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, productData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.update(id, productData);
        await this.fetchProducts();
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update product';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id) {
      this.loading = true;
      this.error = null;

      try {
        await productService.delete(id);
        await this.fetchProducts();
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete product';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addSku(productId, skuData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.addSku(productId, skuData);
        await this.fetchProductById(productId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add SKU';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSku(productId, skuId, skuData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.updateSku(productId, skuId, skuData);
        await this.fetchProductById(productId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update SKU';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteSku(productId, skuId) {
      this.loading = true;
      this.error = null;

      try {
        await productService.deleteSku(productId, skuId);
        await this.fetchProductById(productId);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete SKU';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getProductStock(productId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.getStock(productId);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch stock';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchProducts();
    },

    setLimit(limit) {
      this.pagination.limit = limit;
      this.pagination.page = 1;
      this.fetchProducts();
    },

    setSearch(search) {
      this.filters.search = search;
      this.pagination.page = 1;
      this.fetchProducts();
    },

    setStatusFilter(status) {
      this.filters.status = status;
      this.pagination.page = 1;
      this.fetchProducts();
    },

    clearFilters() {
      this.filters = {
        search: '',
        status: '',
      };
      this.pagination.page = 1;
      this.fetchProducts();
    },

    clearError() {
      this.error = null;
    },
  },
});
