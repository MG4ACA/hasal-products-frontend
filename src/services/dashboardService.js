import api from './api';

export const dashboardService = {
  /**
   * Get dashboard statistics
   * @param {string} period - 'today', 'week', or 'month'
   */
  getStatistics(period = 'today') {
    return api.get('/dashboard/statistics', { params: { period } });
  },

  /**
   * Get sales trend data
   * @param {number} days - Number of days (7 or 30)
   */
  getSalesTrend(days = 7) {
    return api.get('/dashboard/sales-trend', { params: { days } });
  },

  /**
   * Get payment method breakdown
   * @param {string} period - 'today', 'week', or 'month'
   */
  getPaymentBreakdown(period = 'month') {
    return api.get('/dashboard/payment-breakdown', { params: { period } });
  },

  /**
   * Get top selling products
   * @param {string} period - 'today', 'week', or 'month'
   * @param {number} limit - Number of products to return
   */
  getTopProducts(period = 'month', limit = 5) {
    return api.get('/dashboard/top-products', { params: { period, limit } });
  },

  /**
   * Get route-wise sales performance
   * @param {string} period - 'today', 'week', or 'month'
   */
  getRouteSales(period = 'month') {
    return api.get('/dashboard/route-sales', { params: { period } });
  },
};
