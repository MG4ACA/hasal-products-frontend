<template>
  <div class="dashboard-container">
    <!-- Token Expiry Warning -->
    <div v-if="authStore.showExpiryWarning" class="expiry-warning">
      <div class="warning-content">
        <i class="pi pi-exclamation-triangle warning-icon" />
        <div class="warning-text">
          <p class="warning-title">Session Expiring Soon</p>
          <p class="warning-message">
            Your session will expire in {{ formatTimeRemaining(authStore.timeRemaining) }}
          </p>
        </div>
        <div class="warning-actions">
          <Button label="Logout Now" severity="danger" size="small" @click="handleLogout" />
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1>Welcome, {{ authStore.user?.full_name || authStore.user?.username }}!</h1>
        <p>
          Role: <strong>{{ authStore.userRole }}</strong>
        </p>
      </div>
      <div class="header-actions">
        <SelectButton
          v-model="selectedPeriod"
          :options="periodOptions"
          option-label="label"
          option-value="value"
          @change="refreshDashboard"
        />
        <Button
          v-tooltip.bottom="'Refresh Dashboard'"
          icon="pi pi-refresh"
          :loading="loading"
          severity="secondary"
          @click="refreshDashboard"
        />
      </div>
    </div>

    <!-- KPI Widgets Grid -->
    <div class="widgets-grid">
      <!-- Today's Sales -->
      <div class="widget sales-widget cursor-pointer" @click="$router.push('/sales')">
        <div class="widget-icon">
          <i class="pi pi-shopping-cart" />
        </div>
        <div class="widget-content">
          <h3>{{ periodLabel }} Sales</h3>
          <p class="value">
            {{ formatCurrency(stats.totalSales) }}
          </p>
          <p class="sub-text">{{ stats.invoiceCount }} invoices</p>
        </div>
      </div>

      <!-- Outstanding Receivables -->
      <div class="widget receivables-widget cursor-pointer" @click="$router.push('/sales')">
        <div class="widget-icon">
          <i class="pi pi-wallet" />
        </div>
        <div class="widget-content">
          <h3>Outstanding Receivables</h3>
          <p class="value">
            {{ formatCurrency(stats.outstandingReceivables) }}
          </p>
          <p class="sub-text">{{ stats.outstandingCount }} pending invoices</p>
        </div>
      </div>

      <!-- Payments Collected -->
      <div class="widget payments-widget cursor-pointer" @click="$router.push('/payments')">
        <div class="widget-icon">
          <i class="pi pi-money-bill" />
        </div>
        <div class="widget-content">
          <h3>{{ periodLabel }} Collections</h3>
          <p class="value">
            {{ formatCurrency(stats.paymentsCollected) }}
          </p>
          <p class="sub-text">{{ stats.paymentCount }} payments</p>
        </div>
      </div>

      <!-- Low Stock Items -->
      <div
        class="widget stock-widget cursor-pointer"
        :class="{ alert: stats.lowStockItems > 0 }"
        @click="$router.push('/products')"
      >
        <div class="widget-icon">
          <i class="pi pi-exclamation-triangle" />
        </div>
        <div class="widget-content">
          <h3>Low Stock Items</h3>
          <p class="value">
            {{ stats.lowStockItems }}
          </p>
          <p class="sub-text">products below threshold</p>
        </div>
      </div>

      <!-- Pending Purchase Orders -->
      <div class="widget po-widget cursor-pointer" @click="$router.push('/purchase-orders')">
        <div class="widget-icon">
          <i class="pi pi-file-edit" />
        </div>
        <div class="widget-content">
          <h3>Pending POs</h3>
          <p class="value">
            {{ stats.pendingPurchaseOrders }}
          </p>
          <p class="sub-text">awaiting delivery</p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Sales Trend Chart -->
      <div class="chart-card sales-trend-card">
        <div class="chart-header">
          <h3>Sales Trend</h3>
          <SelectButton
            v-model="trendDays"
            :options="trendOptions"
            option-label="label"
            option-value="value"
            size="small"
            @change="fetchSalesTrend"
          />
        </div>
        <div class="chart-container">
          <canvas ref="salesTrendChart" />
        </div>
      </div>

      <!-- Payment Breakdown Chart -->
      <div class="chart-card payment-chart-card">
        <div class="chart-header">
          <h3>Payment Methods</h3>
        </div>
        <div class="chart-container doughnut-container">
          <canvas ref="paymentChart" />
        </div>
        <div v-if="paymentBreakdown.length" class="payment-legend">
          <div v-for="item in paymentBreakdown" :key="item.method" class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: getPaymentColor(item.method) }" />
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.percentage }}%</span>
          </div>
        </div>
      </div>

      <!-- Top Products Chart -->
      <div class="chart-card top-products-card">
        <div class="chart-header">
          <h3>Top Selling Products</h3>
        </div>
        <div class="chart-container">
          <canvas ref="topProductsChart" />
        </div>
      </div>

      <!-- Territory Performance Chart -->
      <div class="chart-card route-chart-card">
        <div class="chart-header">
          <h3>Sales by Territory</h3>
        </div>
        <div class="chart-container">
          <canvas ref="routeChart" />
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="action-buttons">
        <Button
          label="New Sale"
          icon="pi pi-plus"
          severity="primary"
          @click="$router.push('/sales/create')"
        />
        <Button
          label="Add Payment"
          icon="pi pi-dollar"
          severity="success"
          @click="$router.push('/payments/create')"
        />
        <Button
          label="View Invoices"
          icon="pi pi-list"
          severity="info"
          @click="$router.push('/sales')"
        />
        <Button
          label="Production"
          icon="pi pi-cog"
          severity="warning"
          @click="$router.push('/production')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { dashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/stores/auth';
import { Chart, registerables } from 'chart.js';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Register Chart.js components
Chart.register(...registerables);

const router = useRouter();
const authStore = useAuthStore();
const { showWarning, showInfo, showError } = useToastNotification();

// Refs
const loading = ref(false);
const selectedPeriod = ref('today');
const trendDays = ref(7);

// Chart refs
const salesTrendChart = ref(null);
const paymentChart = ref(null);
const topProductsChart = ref(null);
const routeChart = ref(null);

// Chart instances
let salesTrendChartInstance = null;
let paymentChartInstance = null;
let topProductsChartInstance = null;
let routeChartInstance = null;

// Data
const stats = ref({
  totalSales: 0,
  invoiceCount: 0,
  outstandingReceivables: 0,
  outstandingCount: 0,
  paymentsCollected: 0,
  paymentCount: 0,
  lowStockItems: 0,
  pendingPurchaseOrders: 0,
});

const salesTrend = ref([]);
const paymentBreakdown = ref([]);
const topProducts = ref([]);
const routeSales = ref([]);

// Options
const periodOptions = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

const trendOptions = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
];

// Computed
const periodLabel = computed(() => {
  const labels = { today: "Today's", week: "This Week's", month: "This Month's" };
  return labels[selectedPeriod.value] || "Today's";
});

// Watch for token expiry warnings
watch(
  () => authStore.showExpiryWarning,
  newVal => {
    if (newVal) {
      showWarning(
        `Your session will expire in ${formatTimeRemaining(authStore.timeRemaining)}. Please save your work.`,
        'Session Expiring Soon'
      );
    }
  }
);

// Methods
const formatTimeRemaining = milliseconds => {
  if (!milliseconds) return 'loading...';
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

const formatCurrency = value => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

const handleLogout = () => {
  showInfo('You have been logged out successfully.', 'Logout');
  authStore.logout();
  router.push('/login');
};

const getPaymentColor = method => {
  const colors = {
    cash: '#22c55e',
    credit: '#3b82f6',
    check: '#f59e0b',
  };
  return colors[method] || '#6b7280';
};

// API Calls
const fetchStatistics = async () => {
  try {
    const response = await dashboardService.getStatistics(selectedPeriod.value);
    if (response.data.success) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
  }
};

const fetchSalesTrend = async () => {
  try {
    const response = await dashboardService.getSalesTrend(trendDays.value);
    if (response.data.success) {
      salesTrend.value = response.data.data.trend;
      renderSalesTrendChart();
    }
  } catch (error) {
    console.error('Failed to fetch sales trend:', error);
  }
};

const fetchPaymentBreakdown = async () => {
  try {
    const response = await dashboardService.getPaymentBreakdown(selectedPeriod.value);
    if (response.data.success) {
      paymentBreakdown.value = response.data.data.breakdown;
      renderPaymentChart();
    }
  } catch (error) {
    console.error('Failed to fetch payment breakdown:', error);
  }
};

const fetchTopProducts = async () => {
  try {
    const response = await dashboardService.getTopProducts(selectedPeriod.value, 5);
    if (response.data.success) {
      topProducts.value = response.data.data.products;
      renderTopProductsChart();
    }
  } catch (error) {
    console.error('Failed to fetch top products:', error);
  }
};

const fetchRouteSales = async () => {
  try {
    const response = await dashboardService.getRouteSales(selectedPeriod.value);
    if (response.data.success) {
      routeSales.value = response.data.data.routes;
      renderRouteChart();
    }
  } catch (error) {
    console.error('Failed to fetch route sales:', error);
  }
};

const refreshDashboard = async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchStatistics(),
      fetchSalesTrend(),
      fetchPaymentBreakdown(),
      fetchTopProducts(),
      fetchRouteSales(),
    ]);
  } catch (error) {
    showError('Failed to refresh dashboard data', 'Error');
  } finally {
    loading.value = false;
  }
};

// Chart Rendering
const renderSalesTrendChart = () => {
  if (salesTrendChartInstance) {
    salesTrendChartInstance.destroy();
  }

  const ctx = salesTrendChart.value?.getContext('2d');
  if (!ctx) return;

  salesTrendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: salesTrend.value.map(d => d.label),
      datasets: [
        {
          label: 'Sales (LKR)',
          data: salesTrend.value.map(d => d.total),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: context => `LKR ${context.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `LKR ${value.toLocaleString()}`,
          },
        },
      },
    },
  });
};

const renderPaymentChart = () => {
  if (paymentChartInstance) {
    paymentChartInstance.destroy();
  }

  const ctx = paymentChart.value?.getContext('2d');
  if (!ctx || !paymentBreakdown.value.length) return;

  paymentChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: paymentBreakdown.value.map(p => p.label),
      datasets: [
        {
          data: paymentBreakdown.value.map(p => p.total),
          backgroundColor: paymentBreakdown.value.map(p => getPaymentColor(p.method)),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: context =>
              `LKR ${context.parsed.toLocaleString()} (${paymentBreakdown.value[context.dataIndex]?.percentage}%)`,
          },
        },
      },
      cutout: '65%',
    },
  });
};

const renderTopProductsChart = () => {
  if (topProductsChartInstance) {
    topProductsChartInstance.destroy();
  }

  const ctx = topProductsChart.value?.getContext('2d');
  if (!ctx || !topProducts.value.length) return;

  topProductsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topProducts.value.map(p =>
        p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name
      ),
      datasets: [
        {
          label: 'Revenue (LKR)',
          data: topProducts.value.map(p => p.revenue),
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: context => `LKR ${context.parsed.x.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: value => `LKR ${value.toLocaleString()}`,
          },
        },
      },
    },
  });
};

const renderRouteChart = () => {
  if (routeChartInstance) {
    routeChartInstance.destroy();
  }

  const ctx = routeChart.value?.getContext('2d');
  if (!ctx || !routeSales.value.length) return;

  routeChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: routeSales.value.map(r => r.name),
      datasets: [
        {
          label: 'Sales (LKR)',
          data: routeSales.value.map(r => r.total),
          backgroundColor: '#22c55e',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: context =>
              `LKR ${context.parsed.y.toLocaleString()} (${routeSales.value[context.dataIndex]?.count} invoices)`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `LKR ${value.toLocaleString()}`,
          },
        },
      },
    },
  });
};

// Cleanup
const destroyCharts = () => {
  if (salesTrendChartInstance) salesTrendChartInstance.destroy();
  if (paymentChartInstance) paymentChartInstance.destroy();
  if (topProductsChartInstance) topProductsChartInstance.destroy();
  if (routeChartInstance) routeChartInstance.destroy();
};

// Lifecycle
onMounted(() => {
  refreshDashboard();
});

onUnmounted(() => {
  destroyCharts();
});
</script>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-section h1 {
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.welcome-section p {
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Expiry Warning */
.expiry-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  border: 1px solid #ffc107;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.warning-icon {
  font-size: 1.5rem;
  color: #d97706;
}

.warning-text {
  flex: 1;
}

.warning-title {
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.25rem 0;
}

.warning-message {
  color: #a16207;
  margin: 0;
  font-size: 0.9rem;
}

/* Widgets Grid */
.widgets-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 1400px) {
  .widgets-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .widgets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .widgets-grid {
    grid-template-columns: 1fr;
  }
}

.widget {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.widget-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.widget-icon i {
  font-size: 1.25rem;
  color: white;
}

.sales-widget .widget-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.receivables-widget .widget-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.payments-widget .widget-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stock-widget .widget-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stock-widget.alert .widget-icon {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.po-widget .widget-icon {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.po-widget .widget-icon i {
  color: #c2410c;
}

.widget-content {
  flex: 1;
  min-width: 0;
}

.widget-content h3 {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.widget-content .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget-content .sub-text {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.chart-container {
  height: 250px;
  position: relative;
}

.doughnut-container {
  height: 180px;
}

/* Payment Legend */
.payment-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-label {
  color: #64748b;
  font-size: 0.85rem;
}

.legend-value {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.85rem;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-buttons .p-button {
  flex: 1;
  min-width: 150px;
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .p-button {
    width: 100%;
  }
}
</style>
