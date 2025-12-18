import { ref } from 'vue';

/**
 * Composable for pagination logic
 */
export const usePagination = (initialPageSize = 10) => {
  const currentPage = ref(1);
  const pageSize = ref(initialPageSize);
  const totalRecords = ref(0);

  const totalPages = () => Math.ceil(totalRecords.value / pageSize.value);

  const offset = () => (currentPage.value - 1) * pageSize.value;

  const resetPagination = () => {
    currentPage.value = 1;
  };

  const nextPage = () => {
    if (currentPage.value < totalPages()) {
      currentPage.value++;
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  return {
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    offset,
    resetPagination,
    nextPage,
    prevPage,
  };
};
