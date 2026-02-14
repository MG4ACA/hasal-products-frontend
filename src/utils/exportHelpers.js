/**
 * Export Helpers - Utilities for exporting reports to CSV and PDF
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Column definitions [{key, header}]
 * @returns {string} CSV string
 */
export const arrayToCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => col.header || col.key);
  const headerRow = headers.join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return columns
      .map(col => {
        let value = row[col.key];

        // Handle nested objects
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          value = keys.reduce((obj, key) => obj?.[key], row);
        }

        // Format value
        if (value === null || value === undefined) {
          return '';
        }

        // Escape quotes and wrap in quotes if contains comma or quote
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }

        return strValue;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename without extension
 */
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {Array} columns - Column definitions
 * @param {string} filename - Filename without extension
 */
export const exportToCSV = (data, columns, filename) => {
  const csvContent = arrayToCSV(data, columns);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `${filename}_${timestamp}`);
};

/**
 * Generate PDF using browser print functionality
 * This creates a print-friendly view of the report
 * @param {string} title - Report title
 * @param {Object} options - Print options
 */
export const exportToPDF = (title, options = {}) => {
  const { beforePrint = () => {}, afterPrint = () => {} } = options;

  // Add print class to body for styling
  document.body.classList.add('printing');

  // Execute before print callback
  beforePrint();

  // Set document title for PDF filename
  const originalTitle = document.title;
  document.title = title;

  // Trigger print dialog
  window.print();

  // Restore after print
  setTimeout(() => {
    document.body.classList.remove('printing');
    document.title = originalTitle;
    afterPrint();
  }, 100);
};

/**
 * Format currency for export
 * @param {number} value - Number value
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency
 */
export const formatCurrencyForExport = (value, currency = 'Rs.') => {
  if (value === null || value === undefined) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return `${currency} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date for export
 * @param {Date|string} date - Date value
 * @returns {string} Formatted date
 */
export const formatDateForExport = date => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format percentage for export
 * @param {number} value - Percentage value
 * @returns {string} Formatted percentage
 */
export const formatPercentageForExport = value => {
  if (value === null || value === undefined) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return `${num.toFixed(2)}%`;
};

/**
 * Create a summary section for CSV export
 * @param {Object} summary - Summary data
 * @param {string} title - Section title
 * @returns {string} CSV formatted summary
 */
export const createCSVSummary = (summary, title = 'Summary') => {
  const lines = [`${title}\n`];

  Object.entries(summary).forEach(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    lines.push(`${label},${value}`);
  });

  lines.push('\n');
  return lines.join('\n');
};

/**
 * Add report header to CSV
 * @param {string} reportName - Name of the report
 * @param {Object} filters - Applied filters
 * @returns {string} CSV formatted header
 */
export const createCSVHeader = (reportName, filters = {}) => {
  const lines = [reportName];

  if (filters.date_from || filters.date_to) {
    const dateRange = `Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'Now'}`;
    lines.push(dateRange);
  }

  if (filters.outlet_name) {
    lines.push(`Outlet: ${filters.outlet_name}`);
  }

  if (filters.supplier_name) {
    lines.push(`Supplier: ${filters.supplier_name}`);
  }

  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('\n');

  return lines.join('\n');
};

/**
 * Prepare table data for print view
 * @param {HTMLElement} tableElement - Table element to prepare
 */
export const prepareTableForPrint = tableElement => {
  if (!tableElement) return;

  // Remove action buttons and controls
  const actionsColumns = tableElement.querySelectorAll(
    '.p-column-header-content, .p-datatable-tbody td'
  );
  actionsColumns.forEach(col => {
    if (col.textContent.includes('Actions') || col.querySelector('.p-button')) {
      col.style.display = 'none';
    }
  });
};

export default {
  arrayToCSV,
  downloadCSV,
  exportToCSV,
  exportToPDF,
  formatCurrencyForExport,
  formatDateForExport,
  formatPercentageForExport,
  createCSVSummary,
  createCSVHeader,
  prepareTableForPrint,
};
