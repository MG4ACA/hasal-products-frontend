import { computed } from 'vue';

/**
 * Composable for managing filter clearing functionality
 * @param {Object} filters - Reactive filters object
 * @returns {Object} - Object containing filter state and methods
 */
export function useFilterClear(filters) {
  /**
   * Count active filters
   */
  const activeFilterCount = computed(() => {
    let count = 0;
    for (const key in filters) {
      const value = filters[key];
      // Skip pagination fields
      if (key === 'page' || key === 'limit' || key === 'offset') continue;
      // Count non-empty filters
      if (value !== null && value !== '' && value !== undefined) {
        count++;
      }
    }
    return count;
  });

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return activeFilterCount.value > 0;
  });

  /**
   * Clear all filters and call optional callback
   * @param {Object} initialFilters - Initial filter state to reset to
   * @param {Object} options - Options object
   * @param {Function} options.onClear - Callback function to call after clearing
   */
  const clearAllFilters = (initialFilters, options = {}) => {
    // Reset all filter fields to initial values
    for (const key in initialFilters) {
      filters[key] = initialFilters[key];
    }

    // Call the callback if provided
    if (options.onClear && typeof options.onClear === 'function') {
      options.onClear();
    }
  };

  return {
    activeFilterCount,
    hasActiveFilters,
    clearAllFilters,
  };
}
