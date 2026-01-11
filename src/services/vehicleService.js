import { handleApiError } from '@/utils/errorHandler';
import api from './api';

const VEHICLE_BASE_URL = '/vehicles';

export const vehicleService = {
  // Get all vehicles with pagination and filters
  async getAll(params = {}) {
    try {
      const response = await api.get(VEHICLE_BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get vehicle by ID
  async getById(id) {
    try {
      const response = await api.get(`${VEHICLE_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create vehicle
  async create(vehicleData) {
    try {
      const response = await api.post(VEHICLE_BASE_URL, vehicleData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update vehicle
  async update(id, vehicleData) {
    try {
      const response = await api.put(`${VEHICLE_BASE_URL}/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete vehicle
  async delete(id) {
    try {
      const response = await api.delete(`${VEHICLE_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Assign vehicle to route
  async assignToRoute(id, assignmentData) {
    try {
      const response = await api.post(`${VEHICLE_BASE_URL}/${id}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Unassign vehicle from route
  async unassignFromRoute(id, unassignmentData = {}) {
    try {
      const response = await api.post(`${VEHICLE_BASE_URL}/${id}/unassign`, unassignmentData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get vehicle assignment history
  async getAssignmentHistory(id, params = {}) {
    try {
      const response = await api.get(`${VEHICLE_BASE_URL}/${id}/history`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
