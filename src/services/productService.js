import api from './api';

const PRODUCT_BASE_URL = '/products';

export const productService = {
  // Get all products with pagination and filters
  async getAll(params = {}) {
    const response = await api.get(PRODUCT_BASE_URL, { params });
    return response.data;
  },

  // Get product by ID
  async getById(id) {
    const response = await api.get(`${PRODUCT_BASE_URL}/${id}`);
    return response.data;
  },

  // Create product
  async create(productData) {
    const response = await api.post(PRODUCT_BASE_URL, productData);
    return response.data;
  },

  // Update product
  async update(id, productData) {
    const response = await api.put(`${PRODUCT_BASE_URL}/${id}`, productData);
    return response.data;
  },

  // Delete product
  async delete(id) {
    const response = await api.delete(`${PRODUCT_BASE_URL}/${id}`);
    return response.data;
  },

  // Add SKU to product
  async addSku(productId, skuData) {
    const response = await api.post(`${PRODUCT_BASE_URL}/${productId}/skus`, skuData);
    return response.data;
  },

  // Update SKU
  async updateSku(productId, skuId, skuData) {
    const response = await api.put(`${PRODUCT_BASE_URL}/${productId}/skus/${skuId}`, skuData);
    return response.data;
  },

  // Delete SKU
  async deleteSku(productId, skuId) {
    const response = await api.delete(`${PRODUCT_BASE_URL}/${productId}/skus/${skuId}`);
    return response.data;
  },

  // Get product stock
  async getStock(productId) {
    const response = await api.get(`${PRODUCT_BASE_URL}/${productId}/stock`);
    return response.data;
  },
};

export default productService;
