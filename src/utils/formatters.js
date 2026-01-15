/**
 * Format currency to LKR
 */
export const formatCurrency = amount => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount);
};

/**
 * Format date to readable format
 */
export const formatDate = date => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch (err) {
    return '-';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = date => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (err) {
    return '-';
  }
};

/**
 * Format number with decimals
 */
export const formatNumber = (number, decimals = 2) => {
  return parseFloat(number).toFixed(decimals);
};
