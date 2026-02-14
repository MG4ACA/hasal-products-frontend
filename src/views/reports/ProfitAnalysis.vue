<template>
  <div class="profit-analysis">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Profit Analysis</span>
          <Button
            icon="pi pi-refresh"
            rounded
            outlined
            :loading="loading"
            @click="loadProfitData"
          />
        </div>
      </template>

      <template #content>
        <!-- Summary Cards -->
        <div v-if="profitData.length > 0" class="grid mb-4">
          <div class="col-12 md:col-4">
            <Card class="surface-100">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Inventory Value</div>
                <div class="text-2xl font-bold text-primary">
                  Rs. {{ formatCurrency(totalInventoryValue) }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card class="surface-100">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Potential Profit</div>
                <div class="text-2xl font-bold text-green-500">
                  Rs. {{ formatCurrency(totalPotentialProfit) }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card class="surface-100">
              <template #content>
                <div class="text-500 text-sm mb-2">Average Profit Margin</div>
                <div class="text-2xl font-bold">{{ averageProfitMargin.toFixed(2) }}%</div>
              </template>
            </Card>
          </div>
        </div>

        <!-- Product Profit Table -->
        <DataTable
          v-model:filters="filters"
          :value="profitData"
          :loading="loading"
          striped-rows
          paginator
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          filter-display="row"
          :global-filter-fields="['product_name', 'product_code']"
        >
          <template #header>
            <div class="flex justify-content-between align-items-center">
              <span class="text-xl font-bold">Product Profitability</span>
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Search products..." />
              </IconField>
            </div>
          </template>

          <template #empty>
            <div class="text-center p-4 text-500">No profit data available</div>
          </template>

          <Column field="product_code" header="Product Code" sortable />

          <Column field="product_name" header="Product Name" sortable />

          <Column header="SKUs">
            <template #body="{ data }">
              <Button
                :label="`${data.skus.length} SKUs`"
                text
                icon="pi pi-angle-down"
                :icon-pos="expandedRows[data.product_id] ? 'right' : 'right'"
                @click="toggleSkuDetails(data)"
              />
            </template>
          </Column>

          <Column field="total_inventory_value" header="Inventory Value" sortable>
            <template #body="{ data }">
              <span class="font-semibold"
                >Rs. {{ formatCurrency(data.total_inventory_value) }}</span
              >
            </template>
          </Column>

          <Column field="total_potential_profit" header="Potential Profit" sortable>
            <template #body="{ data }">
              <Tag
                :value="'Rs. ' + formatCurrency(data.total_potential_profit)"
                :severity="data.total_potential_profit > 0 ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <template #expansion="{ data }">
            <div class="p-3">
              <h5>SKU Breakdown - {{ data.product_name }}</h5>
              <DataTable :value="data.skus" class="p-datatable-sm">
                <Column field="size" header="Size" />
                <Column field="unit" header="Unit" />
                <Column header="Selling Price">
                  <template #body="{ data: sku }"> Rs. {{ sku.selling_price }} </template>
                </Column>
                <Column header="Avg Cost">
                  <template #body="{ data: sku }"> Rs. {{ sku.average_cost }} </template>
                </Column>
                <Column header="Profit/Unit">
                  <template #body="{ data: sku }">
                    <span
                      :class="
                        parseFloat(sku.profit_per_unit) >= 0 ? 'text-green-500' : 'text-red-500'
                      "
                    >
                      Rs. {{ sku.profit_per_unit }}
                    </span>
                  </template>
                </Column>
                <Column header="Margin">
                  <template #body="{ data: sku }">
                    <Tag
                      :value="sku.profit_margin + '%'"
                      :severity="
                        parseFloat(sku.profit_margin) >= 30
                          ? 'success'
                          : parseFloat(sku.profit_margin) >= 15
                            ? 'warning'
                            : 'danger'
                      "
                    />
                  </template>
                </Column>
                <Column field="current_stock" header="Stock" />
                <Column header="Total Value">
                  <template #body="{ data: sku }"> Rs. {{ sku.total_value }} </template>
                </Column>
                <Column header="Total Profit">
                  <template #body="{ data: sku }">
                    <span
                      :class="
                        parseFloat(sku.total_profit) >= 0
                          ? 'text-green-600 font-semibold'
                          : 'text-red-600'
                      "
                    >
                      Rs. {{ sku.total_profit }}
                    </span>
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { productService } from '@/services/productService';
import { FilterMatchMode } from 'primevue/api';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';

const toast = useToastNotification();
const loading = ref(false);
const profitData = ref([]);
const expandedRows = ref({});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const totalInventoryValue = computed(() => {
  return profitData.value.reduce((sum, p) => sum + parseFloat(p.total_inventory_value || 0), 0);
});

const totalPotentialProfit = computed(() => {
  return profitData.value.reduce((sum, p) => sum + parseFloat(p.total_potential_profit || 0), 0);
});

const averageProfitMargin = computed(() => {
  if (profitData.value.length === 0) return 0;
  const totalMargin = profitData.value.reduce((sum, p) => {
    const skuMargins = p.skus.reduce((s, sku) => s + parseFloat(sku.profit_margin || 0), 0);
    return sum + (p.skus.length > 0 ? skuMargins / p.skus.length : 0);
  }, 0);
  return totalMargin / profitData.value.length;
});

const formatCurrency = value => {
  return parseFloat(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const toggleSkuDetails = data => {
  expandedRows.value[data.product_id] = !expandedRows.value[data.product_id];
};

const loadProfitData = async () => {
  loading.value = true;
  try {
    profitData.value = await productService.getProfitSummary();
  } catch (error) {
    toast.showError('Failed to load profit analysis');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfitData();
});
</script>

<style scoped>
.profit-analysis {
  padding: 1rem;
}
</style>
