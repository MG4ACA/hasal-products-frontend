import expenseService from '@/services/expenseService';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useExpenseStore = defineStore('expense', () => {
  // State
  const expenses = ref([]);
  const currentExpense = ref(null);
  const categories = ref([]);
  const monthlySummary = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Getters
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getPagination = computed(() => pagination.value);
  const getExpenses = computed(() => expenses.value);
  const getCurrentExpense = computed(() => currentExpense.value);
  const getCategories = computed(() => categories.value);
  const getMonthlySummary = computed(() => monthlySummary.value);

  // Actions
  const fetchExpenses = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await expenseService.getAllExpenses(params);
      expenses.value = response.data.expenses;
      pagination.value = response.data.pagination;
    } catch (err) {
      error.value = err.message || 'Failed to fetch expenses';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchExpenseById = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await expenseService.getExpenseById(id);
      currentExpense.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch expense';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createExpense = async expenseData => {
    loading.value = true;
    error.value = null;
    try {
      const response = await expenseService.createExpense(expenseData);
      expenses.value.unshift(response.data);
      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to create expense';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateExpense = async (id, expenseData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await expenseService.updateExpense(id, expenseData);
      const index = expenses.value.findIndex(e => e.id === id);
      if (index !== -1) {
        expenses.value[index] = response.data;
      }
      if (currentExpense.value?.id === id) {
        currentExpense.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to update expense';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteExpense = async id => {
    loading.value = true;
    error.value = null;
    try {
      await expenseService.deleteExpense(id);
      expenses.value = expenses.value.filter(e => e.id !== id);
      if (currentExpense.value?.id === id) {
        currentExpense.value = null;
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete expense';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await expenseService.getCategories();
      categories.value = response.data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch categories';
      throw err;
    }
  };

  const fetchMonthlySummary = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await expenseService.getMonthlySummary(params);
      monthlySummary.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message || 'Failed to fetch monthly summary';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearCurrentExpense = () => {
    currentExpense.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    expenses,
    currentExpense,
    categories,
    monthlySummary,
    loading,
    error,
    pagination,
    // Getters
    isLoading,
    getError,
    getPagination,
    getExpenses,
    getCurrentExpense,
    getCategories,
    getMonthlySummary,
    // Actions
    fetchExpenses,
    fetchExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchCategories,
    fetchMonthlySummary,
    clearCurrentExpense,
    clearError,
  };
});
