import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const expenseService = {
  // Get all expenses with filters
  async getAllExpenses(params = {}) {
    try {
      const response = await api.get('/expenses', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get expense by ID
  async getExpenseById(id) {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create new expense
  async createExpense(expenseData) {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update expense
  async updateExpense(id, expenseData) {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete expense
  async deleteExpense(id) {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get expense categories
  async getCategories() {
    try {
      const response = await api.get('/expenses/categories');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get monthly summary report
  async getMonthlySummary(params = {}) {
    try {
      const response = await api.get('/expenses/reports/monthly-summary', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default expenseService;
