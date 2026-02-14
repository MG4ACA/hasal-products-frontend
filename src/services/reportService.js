import api from './api';

const REPORTS_BASE_URL = '/reports';

const handleApiError = error => {
  console.error('Report Service Error:', error);
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw error;
};

const reportService = {
  // Sales Report
  async getSalesReport(params = {}) {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/sales`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Payment Collection Report
  async getPaymentCollectionReport(params = {}) {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/payments`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Supplier Payment Report
  async getSupplierPaymentReport(params = {}) {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/supplier-payments`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Outlet Balance & Aging Report
  async getOutletBalanceReport(params = {}) {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/outlet-balance`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check Status Report
  async getCheckStatusReport(params = {}) {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/check-status`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Inventory Valuation Report
  async getInventoryReport(params = {}) {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/inventory`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Production Report
  async getProductionReport(params = {}) {
    try {
      const response = await api.get(`${REPORTS_BASE_URL}/production`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default reportService;
