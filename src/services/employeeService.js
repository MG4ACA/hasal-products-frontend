import api from './api';

const EMPLOYEE_BASE_URL = '/employees';

export const employeeService = {
  // Get all employees with pagination and filters
  async getAll(params = {}) {
    const response = await api.get(EMPLOYEE_BASE_URL, { params });
    return response.data;
  },

  // Get employee by ID
  async getById(id) {
    const response = await api.get(`${EMPLOYEE_BASE_URL}/${id}`);
    return response.data;
  },

  // Create employee
  async create(employeeData) {
    const response = await api.post(EMPLOYEE_BASE_URL, employeeData);
    return response.data;
  },

  // Update employee
  async update(id, employeeData) {
    const response = await api.put(`${EMPLOYEE_BASE_URL}/${id}`, employeeData);
    return response.data;
  },

  // Delete employee (soft delete)
  async delete(id) {
    const response = await api.delete(`${EMPLOYEE_BASE_URL}/${id}`);
    return response.data;
  },

  // Get employee performance (for sales_ref only)
  async getPerformance(id, params = {}) {
    const response = await api.get(`${EMPLOYEE_BASE_URL}/${id}/performance`, { params });
    return response.data;
  },
};
