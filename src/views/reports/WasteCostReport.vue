<template>
  <div class="waste-cost-report">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Waste Cost Report</span>
          <Button
            icon="pi pi-refresh"
            rounded
            outlined
            :loading="loading"
            @click="loadWasteReport"
          />
        </div>
      </template>

      <template #content>
        <!-- Filters -->
        <div class="grid mb-4">
          <div class="col-12 md:col-4">
            <label for="date_from" class="block mb-2">From Date</label>
            <Calendar
              id="date_from"
              v-model="filters.date_from"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-4">
            <label for="date_to" class="block mb-2">To Date</label>
            <Calendar
              id="date_to"
              v-model="filters.date_to"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
            />
          </div>
          <div class="col-12 md:col-4 flex align-items-end">
            <Button
              label="Apply Filter"
              icon="pi pi-filter"
              class="w-full"
              @click="loadWasteReport"
            />
          </div>
        </div>

        <!-- Summary Cards -->
        <div v-if="wasteData.summary" class="grid mb-4">
          <div class="col-12 md:col-4">
            <Card class="surface-card border-1 surface-border">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Waste Cost</div>
                <div class="text-3xl font-bold text-red-500">
                  Rs. {{ formatCurrency(wasteData.summary.total_waste_cost) }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card class="surface-card border-1 surface-border">
              <template #content>
                <div class="text-500 text-sm mb-2">Total Incidents</div>
                <div class="text-3xl font-bold text-orange-500">
                  {{ wasteData.summary.total_incidents }}
                </div>
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4">
            <Card class="surface-card border-1 surface-border">
              <template #content>
                <div class="text-500 text-sm mb-2">Period</div>
                <div class="text-lg font-semibold">
                  {{ formatDate(wasteData.summary.period?.from) }} to
                  {{ formatDate(wasteData.summary.period?.to) }}
                </div>
              </template>
            </Card>
          </div>
        </div>

        <!-- Waste Details Table -->
        <DataTable
          :value="wasteData.details"
          :loading="loading"
          striped-rows
          paginator
          :rows="10"
          :rows-per-page-options="[10, 25, 50]"
          sort-field="date"
          :sort-order="-1"
        >
          <template #header>
            <div class="text-xl font-bold">Waste Incidents</div>
          </template>

          <template #empty>
            <div class="text-center p-4 text-500">No waste incidents found for selected period</div>
          </template>

          <Column field="date" header="Date" sortable>
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>

          <Column field="batch_number" header="Batch Number" sortable />

          <Column field="product" header="Product" sortable />

          <Column field="waste_quantity" header="Waste Quantity" sortable>
            <template #body="{ data }">
              <span class="font-semibold text-orange-600">
                {{ data.waste_quantity.toFixed(2) }}
              </span>
            </template>
          </Column>

          <Column field="waste_cost" header="Waste Cost" sortable>
            <template #body="{ data }">
              <Tag :value="'Rs. ' + formatCurrency(data.waste_cost)" severity="danger" />
            </template>
          </Column>

          <Column field="waste_reason" header="Reason" sortable>
            <template #body="{ data }">
              <span :class="data.waste_reason === 'Not specified' ? 'text-500 italic' : ''">
                {{ data.waste_reason }}
              </span>
            </template>
          </Column>
        </DataTable>

        <!-- Export Button -->
        <div class="flex justify-content-end mt-3">
          <Button
            label="Export to CSV"
            icon="pi pi-download"
            outlined
            :disabled="!wasteData.details || wasteData.details.length === 0"
            @click="exportToCSV"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import productionService from '@/services/productionService';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';

const toast = useToastNotification();
const loading = ref(false);
const wasteData = ref({
  summary: null,
  details: [],
});

const filters = ref({
  date_from: null,
  date_to: new Date(),
});

const formatCurrency = value => {
  return parseFloat(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = date => {
  if (!date || date === 'All time' || date === 'Now') return date;
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const loadWasteReport = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.value.date_from) {
      params.date_from = filters.value.date_from.toISOString().split('T')[0];
    }
    if (filters.value.date_to) {
      params.date_to = filters.value.date_to.toISOString().split('T')[0];
    }

    wasteData.value = await productionService.getWasteCostReport(params);
  } catch (error) {
    toast.error('Failed to load waste cost report');
  } finally {
    loading.value = false;
  }
};

const exportToCSV = () => {
  const csvContent = [
    ['Date', 'Batch Number', 'Product', 'Waste Quantity', 'Waste Cost', 'Reason'].join(','),
    ...wasteData.value.details.map(row =>
      [
        formatDate(row.date),
        row.batch_number,
        `"${row.product}"`,
        row.waste_quantity.toFixed(2),
        row.waste_cost.toFixed(2),
        `"${row.waste_reason}"`,
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `waste-cost-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  toast.success('Report exported successfully');
};

onMounted(() => {
  // Set default date range to current month
  const now = new Date();
  filters.value.date_from = new Date(now.getFullYear(), now.getMonth(), 1);
  filters.value.date_to = now;

  loadWasteReport();
});
</script>

<style scoped>
.waste-cost-report {
  padding: 1rem;
}
</style>
