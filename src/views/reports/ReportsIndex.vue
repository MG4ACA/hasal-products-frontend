<template>
  <div class="reports-index">
    <div class="page-header">
      <div>
        <h1>Reports & Analytics</h1>
        <p class="subtitle">Comprehensive business intelligence and reporting</p>
      </div>
    </div>

    <!-- Sales Reports Section -->
    <div class="reports-section">
      <h2 class="section-title">
        <i class="pi pi-chart-line" />
        Sales Reports
      </h2>
      <div class="reports-grid">
        <Card class="report-card" @click="navigateTo('SalesReport')">
          <template #content>
            <div class="report-icon sales">
              <i class="pi pi-chart-bar" />
            </div>
            <h3>Sales Report</h3>
            <p class="report-description">
              Comprehensive sales analysis with breakdown by outlet, product, and route. Track sales
              trends and identify top performers.
            </p>
            <div class="report-features">
              <Tag severity="info" value="Date Range" />
              <Tag severity="info" value="By Outlet" />
              <Tag severity="info" value="By Product" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('PaymentCollectionReport')">
          <template #content>
            <div class="report-icon payment">
              <i class="pi pi-money-bill" />
            </div>
            <h3>Payment Collection Report</h3>
            <p class="report-description">
              Track payment collections vs invoices, collection rates, and outstanding balances.
              Analyze payment methods and outlet performance.
            </p>
            <div class="report-features">
              <Tag severity="info" value="Collection Rate" />
              <Tag severity="info" value="By Method" />
              <Tag severity="info" value="Overdue" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('/reports/profit-analysis')">
          <template #content>
            <div class="report-icon profit">
              <i class="pi pi-wallet" />
            </div>
            <h3>Profit Analysis</h3>
            <p class="report-description">
              Analyze product profitability, profit margins, and inventory value. Identify high and
              low margin products.
            </p>
            <div class="report-features">
              <Tag severity="success" value="Active" />
              <Tag severity="info" value="By SKU" />
              <Tag severity="info" value="Margins" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>
      </div>
    </div>

    <!-- Financial Reports Section -->
    <div class="reports-section">
      <h2 class="section-title">
        <i class="pi pi-dollar" />
        Financial Reports
      </h2>
      <div class="reports-grid">
        <Card class="report-card" @click="navigateTo('OutletBalanceReport')">
          <template #content>
            <div class="report-icon outlet">
              <i class="pi pi-building" />
            </div>
            <h3>Outlet Balance & Aging</h3>
            <p class="report-description">
              Monitor outlet credit balances, credit limit utilization, and aging analysis. Track
              overdue accounts and payment behavior.
            </p>
            <div class="report-features">
              <Tag severity="warning" value="Aging" />
              <Tag severity="info" value="Credit Limits" />
              <Tag severity="danger" value="Overdue" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('CheckStatusReport')">
          <template #content>
            <div class="report-icon check">
              <i class="pi pi-credit-card" />
            </div>
            <h3>Check Status Report</h3>
            <p class="report-description">
              Track pending, cleared, and overdue checks. Monitor check aging and identify
              problematic payment patterns.
            </p>
            <div class="report-features">
              <Tag severity="info" value="Pending" />
              <Tag severity="success" value="Cleared" />
              <Tag severity="danger" value="Overdue" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('SupplierPaymentReport')">
          <template #content>
            <div class="report-icon supplier">
              <i class="pi pi-users" />
            </div>
            <h3>Supplier Payment Report</h3>
            <p class="report-description">
              Monitor supplier payables, payment history, and outstanding balances. Track purchase
              order payments and payment terms.
            </p>
            <div class="report-features">
              <Tag severity="info" value="Payables" />
              <Tag severity="info" value="By Supplier" />
              <Tag severity="warning" value="Outstanding" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>
      </div>
    </div>

    <!-- Inventory & Production Reports Section -->
    <div class="reports-section">
      <h2 class="section-title">
        <i class="pi pi-box" />
        Inventory & Production Reports
      </h2>
      <div class="reports-grid">
        <Card class="report-card" @click="navigateTo('InventoryReport')">
          <template #content>
            <div class="report-icon inventory">
              <i class="pi pi-database" />
            </div>
            <h3>Inventory Valuation</h3>
            <p class="report-description">
              Complete inventory valuation report including raw materials and finished goods. Track
              stock levels and identify low stock items.
            </p>
            <div class="report-features">
              <Tag severity="info" value="Valuation" />
              <Tag severity="warning" value="Low Stock" />
              <Tag severity="info" value="By Category" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('ProductionReport')">
          <template #content>
            <div class="report-icon production">
              <i class="pi pi-cog" />
            </div>
            <h3>Production Report</h3>
            <p class="report-description">
              Comprehensive production analysis including efficiency, waste, and cost breakdown.
              Track production runs and recipe performance.
            </p>
            <div class="report-features">
              <Tag severity="success" value="Active" />
              <Tag severity="info" value="Efficiency" />
              <Tag severity="warning" value="Waste" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('/reports/waste-cost')">
          <template #content>
            <div class="report-icon waste">
              <i class="pi pi-exclamation-triangle" />
            </div>
            <h3>Waste Cost Report</h3>
            <p class="report-description">
              Detailed waste cost analysis for production runs. Track waste by product, reason, and
              date range for cost control.
            </p>
            <div class="report-features">
              <Tag severity="success" value="Active" />
              <Tag severity="danger" value="Waste Cost" />
              <Tag severity="info" value="By Product" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('/reports/efficiency')">
          <template #content>
            <div class="report-icon efficiency">
              <i class="pi pi-chart-line" />
            </div>
            <h3>Efficiency Report</h3>
            <p class="report-description">
              Production efficiency trends and yield analysis. Monitor recipe performance and
              identify optimization opportunities.
            </p>
            <div class="report-features">
              <Tag severity="success" value="Active" />
              <Tag severity="info" value="By Recipe" />
              <Tag severity="info" value="Trends" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>
      </div>
    </div>

    <!-- Other Reports Section -->
    <div class="reports-section">
      <h2 class="section-title">
        <i class="pi pi-file" />
        Other Reports
      </h2>
      <div class="reports-grid">
        <Card class="report-card" @click="navigateTo('/expenses/report')">
          <template #content>
            <div class="report-icon expense">
              <i class="pi pi-receipt" />
            </div>
            <h3>Expense Report</h3>
            <p class="report-description">
              Monthly expense tracking by category including vehicle, utilities, salaries, and
              maintenance costs.
            </p>
            <div class="report-features">
              <Tag severity="success" value="Active" />
              <Tag severity="info" value="By Category" />
              <Tag severity="info" value="Monthly" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>

        <Card class="report-card" @click="navigateTo('/wastage/report')">
          <template #content>
            <div class="report-icon wastage">
              <i class="pi pi-trash" />
            </div>
            <h3>Wastage Report</h3>
            <p class="report-description">
              Monthly wastage cost analysis for P&L reporting. Track wastage by type and monitor
              trends over time.
            </p>
            <div class="report-features">
              <Tag severity="success" value="Active" />
              <Tag severity="info" value="Monthly" />
              <Tag severity="info" value="By Type" />
            </div>
            <Button
              label="View Report"
              icon="pi pi-arrow-right"
              icon-pos="right"
              class="w-full mt-3"
            />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = routeNameOrPath => {
  if (routeNameOrPath.startsWith('/')) {
    router.push(routeNameOrPath);
  } else {
    router.push({ name: routeNameOrPath });
  }
};
</script>

<style scoped>
.reports-index {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.reports-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--surface-border);
}

.section-title i {
  font-size: 1.5rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.report-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.report-card :deep(.p-card-content) {
  padding: 1.5rem;
}

.report-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.75rem;
}

.report-icon.sales {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.report-icon.payment {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.report-icon.profit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.report-icon.outlet {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.report-icon.check {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.report-icon.supplier {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
  color: white;
}

.report-icon.inventory {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #333;
}

.report-icon.production {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: #333;
}

.report-icon.waste {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #333;
}

.report-icon.efficiency {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #333;
}

.report-icon.expense {
  background: linear-gradient(135deg, #ffd3a5 0%, #fd6585 100%);
  color: white;
}

.report-icon.wastage {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
  color: #333;
}

.report-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}

.report-description {
  font-size: 0.95rem;
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
  min-height: 4.8rem;
}

.report-features {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
