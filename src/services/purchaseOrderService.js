import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const purchaseOrderService = {
  /**
   * Get all purchase orders with pagination and filters
   * @param {Object} params - Query parameters (page, limit, search, status, supplier_id, start_date, end_date)
   * @returns {Promise}
   */
  async getAllPurchaseOrders(params = {}) {
    try {
      const response = await api.get('/purchase-orders', { params });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get purchase order by ID with items
   * @param {number} id - Purchase order ID
   * @returns {Promise}
   */
  async getPurchaseOrderById(id) {
    try {
      const response = await api.get(`/purchase-orders/${id}`);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create new purchase order
   * @param {Object} data - PO data
   * @param {number} data.supplier_id - Supplier ID
   * @param {string} data.order_date - Order date (YYYY-MM-DD)
   * @param {string} data.expected_delivery_date - Expected delivery date (YYYY-MM-DD)
   * @param {string} data.notes - Notes
   * @param {Array} data.items - PO items
   * @returns {Promise}
   */
  async createPurchaseOrder(data) {
    try {
      const response = await api.post('/purchase-orders', data);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update purchase order
   * @param {number} id - Purchase order ID
   * @param {Object} data - Updated PO data
   * @returns {Promise}
   */
  async updatePurchaseOrder(id, data) {
    try {
      const response = await api.put(`/purchase-orders/${id}`, data);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete purchase order
   * @param {number} id - Purchase order ID
   * @returns {Promise}
   */
  async deletePurchaseOrder(id) {
    try {
      const response = await api.delete(`/purchase-orders/${id}`);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Receive purchase order
   * @param {number} id - Purchase order ID
   * @param {Object} data - Receive data
   * @param {string} data.received_date - Received date (YYYY-MM-DD)
   * @param {Array} data.received_items - Received items with quantities and expiry dates
   * @returns {Promise}
   */
  async receivePurchaseOrder(id, data) {
    try {
      const response = await api.post(`/purchase-orders/${id}/receive`, data);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update purchase order status
   * @param {number} id - Purchase order ID
   * @param {string} status - New status (pending, approved, received, cancelled)
   * @returns {Promise}
   */
  async updatePurchaseOrderStatus(id, status) {
    try {
      const response = await api.put(`/purchase-orders/${id}/status`, { status });
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get batch genealogy - traces all returns from a receipt batch
   * @param {number} batchId - Batch ID (receipt batch)
   * @returns {Promise} - Object with receipt batch and array of return batches
   */
  async getBatchGenealogy(batchId) {
    try {
      const response = await api.get(`/batches/${batchId}/genealogy`);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get return origin - traces a return batch back to its source receipt batch
   * @param {number} returnBatchId - Return batch ID
   * @returns {Promise} - Object with return batch and source receipt batch
   */
  async getReturnOrigin(returnBatchId) {
    try {
      const response = await api.get(`/batches/${returnBatchId}/origin`);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get material returns summary - aggregates all receipts and returns for a material
   * @param {number} materialId - Raw material ID
   * @returns {Promise} - Object with material info and summary of stock, returns, disposal
   */
  async getMaterialReturnsSummary(materialId) {
    try {
      const response = await api.get(`/batches/materials/${materialId}/returns-summary`);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default purchaseOrderService;
