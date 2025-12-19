import { employeeService } from '@/services/employeeService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useEmployeeStore = defineStore('employee', () => {
  // State
  const employees = ref([]);
  const currentEmployee = ref(null);
  const employeePerformance = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const filters = ref({
    search: '',
    status: '',
    type: '',
    route_id: '',
  });

  // Getters
  const activeEmployees = computed(() => employees.value.filter(e => e.status === 'active'));
  const inactiveEmployees = computed(() => employees.value.filter(e => e.status === 'inactive'));
  const salesRefs = computed(() => employees.value.filter(e => e.type === 'sales_ref'));
  const drivers = computed(() => employees.value.filter(e => e.type === 'driver'));
  const warehouseStaff = computed(() => employees.value.filter(e => e.type === 'warehouse'));

  // Actions
  const fetchEmployees = async () => {
    try {
      loading.value = true;
      error.value = null;

      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search,
        status: filters.value.status,
        type: filters.value.type,
        route_id: filters.value.route_id,
      };

      const response = await employeeService.getAll(params);
      employees.value = response.data.employees;
      pagination.value = response.data.pagination;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch employees';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchEmployeeById = async id => {
    try {
      loading.value = true;
      error.value = null;
      const response = await employeeService.getById(id);
      currentEmployee.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch employee';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createEmployee = async employeeData => {
    try {
      loading.value = true;
      error.value = null;
      const response = await employeeService.create(employeeData);
      await fetchEmployees();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create employee';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await employeeService.update(id, employeeData);
      await fetchEmployees();
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update employee';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteEmployee = async id => {
    try {
      loading.value = true;
      error.value = null;
      await employeeService.delete(id);
      await fetchEmployees();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete employee';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchEmployeePerformance = async (id, params = {}) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await employeeService.getPerformance(id, params);
      employeePerformance.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch employee performance';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setPage = page => {
    pagination.value.page = page;
    fetchEmployees();
  };

  const setLimit = limit => {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchEmployees();
  };

  const setFilters = newFilters => {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1;
    fetchEmployees();
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      type: '',
      route_id: '',
    };
    pagination.value.page = 1;
    fetchEmployees();
  };

  const clearCurrentEmployee = () => {
    currentEmployee.value = null;
    employeePerformance.value = null;
  };

  return {
    // State
    employees,
    currentEmployee,
    employeePerformance,
    loading,
    error,
    pagination,
    filters,
    // Getters
    activeEmployees,
    inactiveEmployees,
    salesRefs,
    drivers,
    warehouseStaff,
    // Actions
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployeePerformance,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    clearCurrentEmployee,
  };
});
