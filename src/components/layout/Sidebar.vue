<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>Hasal POS</h2>
    </div>

    <nav class="sidebar-menu">
      <!-- Dashboard -->
      <RouterLink to="/" class="menu-item">
        <i class="pi pi-home" />
        <span>Dashboard</span>
      </RouterLink>

      <!-- Sales & Distribution Section -->
      <div class="menu-section">
        <div class="menu-section-header" @click="toggleSection('salesDistribution')">
          <div class="section-title">
            <i class="pi pi-shopping-cart" />
            <span>Sales & Distribution</span>
          </div>
          <i :class="['pi', expanded.salesDistribution ? 'pi-chevron-up' : 'pi-chevron-down']" />
        </div>
        <div v-show="expanded.salesDistribution" class="menu-section-items">
          <RouterLink to="/sales" class="menu-item submenu-item">
            <i class="pi pi-shopping-cart" />
            <span>Sales</span>
          </RouterLink>
          <RouterLink to="/payments" class="menu-item submenu-item">
            <i class="pi pi-money-bill" />
            <span>Payments</span>
          </RouterLink>
          <RouterLink to="/outlets" class="menu-item submenu-item">
            <i class="pi pi-building" />
            <span>Outlets</span>
          </RouterLink>
          <RouterLink to="/routes" class="menu-item submenu-item">
            <i class="pi pi-map" />
            <span>Territories</span>
          </RouterLink>
          <RouterLink to="/vehicles" class="menu-item submenu-item">
            <i class="pi pi-car" />
            <span>Vehicles</span>
          </RouterLink>
        </div>
      </div>

      <!-- Supply Chain Section -->
      <div class="menu-section">
        <div class="menu-section-header" @click="toggleSection('supplyChain')">
          <div class="section-title">
            <i class="pi pi-shopping-bag" />
            <span>Supply Chain</span>
          </div>
          <i :class="['pi', expanded.supplyChain ? 'pi-chevron-up' : 'pi-chevron-down']" />
        </div>
        <div v-show="expanded.supplyChain" class="menu-section-items">
          <RouterLink to="/suppliers" class="menu-item submenu-item">
            <i class="pi pi-shopping-bag" />
            <span>Suppliers</span>
          </RouterLink>
          <RouterLink to="/raw-materials" class="menu-item submenu-item">
            <i class="pi pi-box" />
            <span>Raw Materials</span>
          </RouterLink>
          <RouterLink to="/purchase-orders" class="menu-item submenu-item">
            <i class="pi pi-file-edit" />
            <span>Purchase Orders</span>
          </RouterLink>
        </div>
      </div>

      <!-- Production Section -->
      <div class="menu-section">
        <div class="menu-section-header" @click="toggleSection('production')">
          <div class="section-title">
            <i class="pi pi-cog" />
            <span>Production</span>
          </div>
          <i :class="['pi', expanded.production ? 'pi-chevron-up' : 'pi-chevron-down']" />
        </div>
        <div v-show="expanded.production" class="menu-section-items">
          <RouterLink to="/products" class="menu-item submenu-item">
            <i class="pi pi-tags" />
            <span>Products</span>
          </RouterLink>
          <RouterLink to="/recipes" class="menu-item submenu-item">
            <i class="pi pi-book" />
            <span>Recipes</span>
          </RouterLink>
          <RouterLink to="/production-runs" class="menu-item submenu-item">
            <i class="pi pi-cog" />
            <span>Production Runs</span>
          </RouterLink>
        </div>
      </div>

      <!-- Administration Section -->
      <div class="menu-section">
        <div class="menu-section-header" @click="toggleSection('administration')">
          <div class="section-title">
            <i class="pi pi-users" />
            <span>Administration</span>
          </div>
          <i :class="['pi', expanded.administration ? 'pi-chevron-up' : 'pi-chevron-down']" />
        </div>
        <div v-show="expanded.administration" class="menu-section-items">
          <RouterLink to="/employees" class="menu-item submenu-item">
            <i class="pi pi-users" />
            <span>Employees</span>
          </RouterLink>
        </div>
      </div>

      <!-- Expenses Section -->
      <div class="menu-section">
        <div class="menu-section-header" @click="toggleSection('expenses')">
          <div class="section-title">
            <i class="pi pi-wallet" />
            <span>Expenses</span>
          </div>
          <i :class="['pi', expanded.expenses ? 'pi-chevron-up' : 'pi-chevron-down']" />
        </div>
        <div v-show="expanded.expenses" class="menu-section-items">
          <RouterLink to="/expenses" class="menu-item submenu-item">
            <i class="pi pi-list" />
            <span>All Expenses</span>
          </RouterLink>
          <RouterLink to="/expenses/create" class="menu-item submenu-item">
            <i class="pi pi-plus-circle" />
            <span>Add Expense</span>
          </RouterLink>
          <RouterLink to="/expenses/report" class="menu-item submenu-item">
            <i class="pi pi-chart-bar" />
            <span>Monthly Report</span>
          </RouterLink>
        </div>
      </div>

      <!-- Wastage Tracking Section -->
      <div class="menu-section">
        <div class="menu-section-header" @click="toggleSection('wastage')">
          <div class="section-title">
            <i class="pi pi-exclamation-triangle" />
            <span>Wastage Tracking</span>
          </div>
          <i :class="['pi', expanded.wastage ? 'pi-chevron-up' : 'pi-chevron-down']" />
        </div>
        <div v-show="expanded.wastage" class="menu-section-items">
          <RouterLink to="/wastage" class="menu-item submenu-item">
            <i class="pi pi-list" />
            <span>Wastage Records</span>
          </RouterLink>
          <RouterLink to="/wastage/report" class="menu-item submenu-item">
            <i class="pi pi-chart-bar" />
            <span>Monthly Report</span>
          </RouterLink>
        </div>
      </div>

      <!-- Reports Section -->
      <div class="menu-section">
        <div class="menu-section-header" @click="toggleSection('reports')">
          <div class="section-title">
            <i class="pi pi-chart-line" />
            <span>Reports</span>
          </div>
          <i :class="['pi', expanded.reports ? 'pi-chevron-up' : 'pi-chevron-down']" />
        </div>
        <div v-show="expanded.reports" class="menu-section-items">
          <RouterLink to="/reports/profit-analysis" class="menu-item submenu-item">
            <i class="pi pi-chart-line" />
            <span>Profit Analysis</span>
          </RouterLink>
          <RouterLink to="/reports/waste-cost" class="menu-item submenu-item">
            <i class="pi pi-exclamation-triangle" />
            <span>Waste Cost</span>
          </RouterLink>
          <RouterLink to="/reports/efficiency" class="menu-item submenu-item">
            <i class="pi pi-chart-bar" />
            <span>Efficiency</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const expanded = ref({
  supplyChain: false,
  production: false,
  salesDistribution: true, // Expanded by default
  administration: false,
  expenses: false,
  wastage: false,
  reports: false,
});

const toggleSection = section => {
  expanded.value[section] = !expanded.value[section];
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  min-width: 250px;
  background-color: #627d98;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.sidebar-menu {
  flex: 1;
  padding: 1rem 0;
  list-style: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: white;
}

.menu-item.router-link-active {
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  border-left: 3px solid #e67e22;
}

.menu-item i {
  font-size: 1.2rem;
}

/* Section Styles */
.menu-section {
  margin-bottom: 0.25rem;
}

.menu-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-weight: 500;
}

.menu-section-header:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title i {
  font-size: 1.1rem;
}

.menu-section-items {
  background-color: rgba(0, 0, 0, 0.05);
}

.submenu-item {
  padding-left: 3rem;
  font-size: 0.95rem;
}

.submenu-item i {
  font-size: 1rem;
}
</style>
