import api from './api';

const wastageService = {
  // Get all wastage records with pagination and filters
  async getAllWastageRecords(params = {}) {
    const response = await api.get('/wastage', { params });
    return response.data;
  },

  // Get single wastage record by ID
  async getWastageRecordById(id) {
    const response = await api.get(`/wastage/${id}`);
    return response.data;
  },

  // Create new wastage record
  async createWastageRecord(data) {
    const response = await api.post('/wastage', data);
    return response.data;
  },

  // Update wastage record
  async updateWastageRecord(id, data) {
    const response = await api.put(`/wastage/${id}`, data);
    return response.data;
  },

  // Delete wastage record
  async deleteWastageRecord(id) {
    const response = await api.delete(`/wastage/${id}`);
    return response.data;
  },

  // Get monthly wastage summary
  async getMonthlyWastageSummary(year, month) {
    const response = await api.get('/wastage/reports/monthly-summary', {
      params: { year, month },
    });
    return response.data;
  },

  // Get wastage trend
  async getWastageTrend(months = 6) {
    const response = await api.get('/wastage/reports/trend', {
      params: { months },
    });
    return response.data;
  },
};

export default wastageService;
