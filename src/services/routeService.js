import api from './api';

const ROUTE_BASE_URL = '/routes';

export const routeService = {
  // Get all routes with pagination and filters
  async getAll(params = {}) {
    const response = await api.get(ROUTE_BASE_URL, { params });
    return response.data;
  },

  // Get route by ID
  async getById(id) {
    const response = await api.get(`${ROUTE_BASE_URL}/${id}`);
    return response.data;
  },

  // Create route
  async create(routeData) {
    const response = await api.post(ROUTE_BASE_URL, routeData);
    return response.data;
  },

  // Update route
  async update(id, routeData) {
    const response = await api.put(`${ROUTE_BASE_URL}/${id}`, routeData);
    return response.data;
  },

  // Delete route
  async delete(id) {
    const response = await api.delete(`${ROUTE_BASE_URL}/${id}`);
    return response.data;
  },

  // Get route outlets
  async getOutlets(id) {
    const response = await api.get(`${ROUTE_BASE_URL}/${id}/outlets`);
    return response.data;
  },

  // Get route employees
  async getEmployees(id) {
    const response = await api.get(`${ROUTE_BASE_URL}/${id}/employees`);
    return response.data;
  },
};
