import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const EMPLOYEE_BASE_URL = '/employees';

export const employeeService = {
  // Get all employees with pagination and filters
  async getAll(params = {}) {
    try {
      const response = await api.get(EMPLOYEE_BASE_URL, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get employee by ID
  async getById(id) {
    try {
      const response = await api.get(`${EMPLOYEE_BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create employee
  async create(employeeData) {
    try {
      const response = await api.post(EMPLOYEE_BASE_URL, employeeData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update employee
  async update(id, employeeData) {
    try {
      const response = await api.put(`${EMPLOYEE_BASE_URL}/${id}`, employeeData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete employee (soft delete)
  async delete(id) {
    try {
      const response = await api.delete(`${EMPLOYEE_BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get employee performance (for sales_ref only)
  async getPerformance(id, params = {}) {
    try {
      const response = await api.get(`${EMPLOYEE_BASE_URL}/${id}/performance`, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
