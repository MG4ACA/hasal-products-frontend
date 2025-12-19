import api from './api';

const VEHICLE_BASE_URL = '/vehicles';

export const vehicleService = {
  // Get all vehicles with pagination and filters
  async getAll(params = {}) {
    const response = await api.get(VEHICLE_BASE_URL, { params });
    return response.data;
  },

  // Get vehicle by ID
  async getById(id) {
    const response = await api.get(`${VEHICLE_BASE_URL}/${id}`);
    return response.data;
  },

  // Create vehicle
  async create(vehicleData) {
    const response = await api.post(VEHICLE_BASE_URL, vehicleData);
    return response.data;
  },

  // Update vehicle
  async update(id, vehicleData) {
    const response = await api.put(`${VEHICLE_BASE_URL}/${id}`, vehicleData);
    return response.data;
  },

  // Delete vehicle
  async delete(id) {
    const response = await api.delete(`${VEHICLE_BASE_URL}/${id}`);
    return response.data;
  },

  // Assign vehicle to route
  async assignToRoute(id, assignmentData) {
    const response = await api.post(`${VEHICLE_BASE_URL}/${id}/assign`, assignmentData);
    return response.data;
  },

  // Unassign vehicle from route
  async unassignFromRoute(id, unassignmentData = {}) {
    const response = await api.post(`${VEHICLE_BASE_URL}/${id}/unassign`, unassignmentData);
    return response.data;
  },

  // Get vehicle assignment history
  async getAssignmentHistory(id, params = {}) {
    const response = await api.get(`${VEHICLE_BASE_URL}/${id}/history`, { params });
    return response.data;
  },
};
