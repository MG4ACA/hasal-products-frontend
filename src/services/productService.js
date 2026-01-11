import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const PRODUCT_BASE_URL = '/products';

export const productService = {
  // Get all products with pagination and filters
  async getAll(params = {}) {
    try {
      const response = await api.get(PRODUCT_BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get product by ID
  async getById(id) {
    try {
      const response = await api.get(`${PRODUCT_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create product
  async create(productData) {
    try {
      const response = await api.post(PRODUCT_BASE_URL, productData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update product
  async update(id, productData) {
    try {
      const response = await api.put(`${PRODUCT_BASE_URL}/${id}`, productData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete product
  async delete(id) {
    try {
      const response = await api.delete(`${PRODUCT_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add SKU to product
  async addSku(productId, skuData) {
    try {
      const response = await api.post(`${PRODUCT_BASE_URL}/${productId}/skus`, skuData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update SKU
  async updateSku(productId, skuId, skuData) {
    try {
      const response = await api.put(`${PRODUCT_BASE_URL}/${productId}/skus/${skuId}`, skuData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete SKU
  async deleteSku(productId, skuId) {
    try {
      const response = await api.delete(`${PRODUCT_BASE_URL}/${productId}/skus/${skuId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get product stock
  async getStock(productId) {
    try {
      const response = await api.get(`${PRODUCT_BASE_URL}/${productId}/stock`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default productService;
