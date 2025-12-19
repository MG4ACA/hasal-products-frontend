import api from './api';

const purchaseOrderService = {
  /**
   * Get all purchase orders with pagination and filters
   * @param {Object} params - Query parameters (page, limit, search, status, supplier_id, start_date, end_date)
   * @returns {Promise}
   */
  getAllPurchaseOrders(params = {}) {
    return api.get('/purchase-orders', { params });
  },

  /**
   * Get purchase order by ID with items
   * @param {number} id - Purchase order ID
   * @returns {Promise}
   */
  getPurchaseOrderById(id) {
    return api.get(`/purchase-orders/${id}`);
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
  createPurchaseOrder(data) {
    return api.post('/purchase-orders', data);
  },

  /**
   * Update purchase order
   * @param {number} id - Purchase order ID
   * @param {Object} data - Updated PO data
   * @returns {Promise}
   */
  updatePurchaseOrder(id, data) {
    return api.put(`/purchase-orders/${id}`, data);
  },

  /**
   * Delete purchase order
   * @param {number} id - Purchase order ID
   * @returns {Promise}
   */
  deletePurchaseOrder(id) {
    return api.delete(`/purchase-orders/${id}`);
  },

  /**
   * Receive purchase order
   * @param {number} id - Purchase order ID
   * @param {Object} data - Receive data
   * @param {string} data.received_date - Received date (YYYY-MM-DD)
   * @param {Array} data.received_items - Received items with quantities and expiry dates
   * @returns {Promise}
   */
  receivePurchaseOrder(id, data) {
    return api.post(`/purchase-orders/${id}/receive`, data);
  },

  /**
   * Update purchase order status
   * @param {number} id - Purchase order ID
   * @param {string} status - New status (pending, approved, received, cancelled)
   * @returns {Promise}
   */
  updatePurchaseOrderStatus(id, status) {
    return api.put(`/purchase-orders/${id}/status`, { status });
  },
};

export default purchaseOrderService;
