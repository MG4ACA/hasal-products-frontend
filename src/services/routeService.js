import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const ROUTE_BASE_URL = '/routes';

export const routeService = {
  // Get all routes with pagination and filters
  async getAll(params = {}) {
    try {
      const response = await api.get(ROUTE_BASE_URL, { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get route by ID
  async getById(id) {
    try {
      const response = await api.get(`${ROUTE_BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create route
  async create(routeData) {
    try {
      const response = await api.post(ROUTE_BASE_URL, routeData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update route
  async update(id, routeData) {
    try {
      const response = await api.put(`${ROUTE_BASE_URL}/${id}`, routeData);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete route
  async delete(id) {
    try {
      const response = await api.delete(`${ROUTE_BASE_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get route outlets
  async getOutlets(id) {
    try {
      const response = await api.get(`${ROUTE_BASE_URL}/${id}/outlets`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get route employees
  async getEmployees(id) {
    try {
      const response = await api.get(`${ROUTE_BASE_URL}/${id}/employees`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
