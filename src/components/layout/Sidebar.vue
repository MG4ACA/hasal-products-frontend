<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>Hasal POS</h2>
    </div>

    <nav class="sidebar-menu">
      <RouterLink to="/" class="menu-item">
        <i class="pi pi-home" />
        <span>Dashboard</span>
      </RouterLink>
      <RouterLink to="/suppliers" class="menu-item">
        <i class="pi pi-shopping-bag" />
        <span>Suppliers</span>
      </RouterLink>
      <RouterLink to="/raw-materials" class="menu-item">
        <i class="pi pi-box" />
        <span>Raw Materials</span>
      </RouterLink>
      <RouterLink to="/purchase-orders" class="menu-item">
        <i class="pi pi-file-edit" />
        <span>Purchase Orders</span>
      </RouterLink>
      <RouterLink to="/products" class="menu-item">
        <i class="pi pi-tags" />
        <span>Products</span>
      </RouterLink>
      <RouterLink to="/recipes" class="menu-item">
        <i class="pi pi-book" />
        <span>Recipes</span>
      </RouterLink>
      <RouterLink to="/production-runs" class="menu-item">
        <i class="pi pi-cog" />
        <span>Production</span>
      </RouterLink>
      <RouterLink to="/sales" class="menu-item">
        <i class="pi pi-shopping-cart" />
        <span>Sales</span>
      </RouterLink>
      <RouterLink to="/payments" class="menu-item">
        <i class="pi pi-money-bill" />
        <span>Payments</span>
      </RouterLink>
      <RouterLink to="/outlets" class="menu-item">
        <i class="pi pi-building" />
        <span>Outlets</span>
      </RouterLink>
      <RouterLink to="/routes" class="menu-item">
        <i class="pi pi-map" />
        <span>Routes</span>
      </RouterLink>
      <RouterLink to="/vehicles" class="menu-item">
        <i class="pi pi-car" />
        <span>Vehicles</span>
      </RouterLink>
      <RouterLink to="/employees" class="menu-item">
        <i class="pi pi-users" />
        <span>Employees</span>
      </RouterLink>

      <!-- Reports Section -->
      <div class="menu-divider"></div>
      <div class="menu-section-title">Reports</div>
      <RouterLink to="/reports/profit-analysis" class="menu-item">
        <i class="pi pi-chart-line" />
        <span>Profit Analysis</span>
      </RouterLink>
      <RouterLink to="/reports/waste-cost" class="menu-item">
        <i class="pi pi-exclamation-triangle" />
        <span>Waste Cost Report</span>
      </RouterLink>
      <RouterLink to="/reports/efficiency" class="menu-item">
        <i class="pi pi-chart-bar" />
        <span>Efficiency Report</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup></script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #627d98;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
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

.menu-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 1rem 1.5rem;
}

.menu-section-title {
  padding: 0.75rem 1.5rem 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
