/**
 * Report Formatters - Common formatting utilities for reports
 */

/**
 * Format currency value
 * @param {number} value - Number to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value, currency = 'Rs.') => {
  if (value === null || value === undefined) return `${currency} 0.00`;
  const num = parseFloat(value);
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency} ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format number with commas
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0.00%';
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00%';
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return d.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format date and time
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = date => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date range for display
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = startDate ? formatDate(startDate) : 'Start';
  const end = endDate ? formatDate(endDate) : 'Now';
  return `${start} - ${end}`;
};

/**
 * Get severity tag for percentage thresholds
 * @param {number} percentage - Percentage value
 * @param {Object} thresholds - Threshold values
 * @returns {string} Severity level
 */
export const getPercentageSeverity = (percentage, thresholds = {}) => {
  const { excellent = 90, good = 70, warning = 50 } = thresholds;

  const num = parseFloat(percentage);

  if (num >= excellent) return 'success';
  if (num >= good) return 'info';
  if (num >= warning) return 'warning';
  return 'danger';
};

/**
 * Get severity tag for aging days
 * @param {number} days - Number of days
 * @returns {string} Severity level
 */
export const getAgingSeverity = days => {
  if (days <= 30) return 'success';
  if (days <= 60) return 'warning';
  return 'danger';
};

/**
 * Format status text
 * @param {string} status - Status string
 * @returns {string} Formatted status
 */
export const formatStatus = status => {
  if (!status) return '';
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get severity for balance status
 * @param {string} status - Status string (good, warning, critical)
 * @returns {string} Severity level
 */
export const getBalanceSeverity = status => {
  const severityMap = {
    good: 'success',
    warning: 'warning',
    critical: 'danger',
    excellent: 'success',
    moderate: 'info',
  };
  return severityMap[status?.toLowerCase()] || 'secondary';
};

/**
 * Calculate percentage
 * @param {number} value - Part value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total, decimals = 2) => {
  if (!total || total === 0) return 0;
  const percentage = (parseFloat(value) / parseFloat(total)) * 100;
  return parseFloat(percentage.toFixed(decimals));
};

/**
 * Format large numbers with K, M suffixes
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
export const formatLargeNumber = value => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

/**
 * Get chart color by index
 * @param {number} index - Color index
 * @returns {string} Hex color
 */
export const getChartColor = index => {
  const colors = [
    '#667eea',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#30cfd0',
    '#a8edea',
    '#ff9a9e',
    '#ffecd2',
    '#a1c4fd',
  ];
  return colors[index % colors.length];
};

/**
 * Format aging bucket label
 * @param {string} bucket - Bucket identifier (0-30, 31-60, etc.)
 * @returns {string} Formatted label
 */
export const formatAgingBucket = bucket => {
  const labels = {
    current: 'Current',
    '0-30': '0-30 Days',
    '31-60': '31-60 Days',
    '61-90': '61-90 Days',
    '90+': 'Over 90 Days',
    days_30: '0-30 Days',
    days_60: '31-60 Days',
    days_90: '61-90 Days',
    days_over_90: 'Over 90 Days',
  };
  return labels[bucket] || bucket;
};

/**
 * Calculate collection rate
 * @param {number} collected - Amount collected
 * @param {number} invoiced - Amount invoiced
 * @returns {number} Collection rate percentage
 */
export const calculateCollectionRate = (collected, invoiced) => {
  if (!invoiced || invoiced === 0) return 0;
  return calculatePercentage(collected, invoiced);
};

/**
 * Format payment method
 * @param {string} method - Payment method
 * @returns {string} Formatted method
 */
export const formatPaymentMethod = method => {
  const methods = {
    cash: 'Cash',
    check: 'Check',
    cheque: 'Cheque',
    credit: 'Credit',
    bank_transfer: 'Bank Transfer',
  };
  return methods[method?.toLowerCase()] || formatStatus(method);
};

/**
 * Get payment method icon
 * @param {string} method - Payment method
 * @returns {string} PrimeIcons class
 */
export const getPaymentMethodIcon = method => {
  const icons = {
    cash: 'pi-money-bill',
    check: 'pi-credit-card',
    cheque: 'pi-credit-card',
    credit: 'pi-wallet',
    bank_transfer: 'pi-building',
  };
  return icons[method?.toLowerCase()] || 'pi-circle';
};

export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatDateRange,
  getPercentageSeverity,
  getAgingSeverity,
  formatStatus,
  getBalanceSeverity,
  calculatePercentage,
  formatLargeNumber,
  getChartColor,
  formatAgingBucket,
  calculateCollectionRate,
  formatPaymentMethod,
  getPaymentMethodIcon,
};
