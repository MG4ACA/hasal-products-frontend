<template>
  <div class="batch-list">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-3">
      <div>
        <h3 class="m-0">Material Batches</h3>
        <p class="text-sm text-gray-600 mt-1">Batch inventory for {{ materialName }}</p>
      </div>
      <Button icon="pi pi-times" rounded text severity="secondary" @click="$emit('close')" />
    </div>

    <!-- Filter Section -->
    <div class="mb-3">
      <div class="flex gap-2">
        <Dropdown
          v-model="batchTypeFilter"
          :options="batchTypeOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter by Batch Type"
          class="w-full md:w-15rem"
          @change="fetchBatches"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-content-center align-items-center"
      style="min-height: 300px"
    >
      <ProgressSpinner />
    </div>

    <!-- Batch Data Table -->
    <div v-else>
      <!-- Summary Cards -->
      <div class="grid mb-4">
        <div class="col-12 md:col-4">
          <div class="surface-card shadow-2 p-3 border-round">
            <div class="flex align-items-center">
              <div class="flex-shrink-0">
                <i class="pi pi-box text-blue-500" style="font-size: 2rem" />
              </div>
              <div class="ml-3">
                <div class="text-500 text-sm mb-1">Total Batches</div>
                <div class="text-900 text-xl font-medium">
                  {{ pagination.totalRecords }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card shadow-2 p-3 border-round">
            <div class="flex align-items-center">
              <div class="flex-shrink-0">
                <i class="pi pi-database text-green-500" style="font-size: 2rem" />
              </div>
              <div class="ml-3">
                <div class="text-500 text-sm mb-1">Total Stock</div>
                <div class="text-900 text-xl font-medium">
                  {{ formatNumber(totalCurrentQuantity) }} {{ unit }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-card shadow-2 p-3 border-round">
            <div class="flex align-items-center">
              <div class="flex-shrink-0">
                <i class="pi pi-calendar text-orange-500" style="font-size: 2rem" />
              </div>
              <div class="ml-3">
                <div class="text-500 text-sm mb-1">Active Batches</div>
                <div class="text-900 text-xl font-medium">
                  {{ activeBatchCount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        :value="batches"
        :rows="pagination.rowsPerPage"
        :total-records="pagination.totalRecords"
        :loading="loading"
        striped-rows
        responsive-layout="scroll"
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="flex flex-column align-items-center justify-content-center p-4">
            <i class="pi pi-inbox text-gray-400" style="font-size: 3rem" />
            <p class="text-gray-600 mt-3">No batches found for this material</p>
          </div>
        </template>

        <Column field="batch_number" header="Batch Number" :sortable="true">
          <template #body="{ data }">
            <span class="font-mono font-semibold text-primary">{{ data.batch_number }}</span>
          </template>
        </Column>

        <Column field="batch_type" header="Type" :sortable="true">
          <template #body="{ data }">
            <Tag
              :value="data.batch_type === 'return' ? 'Return' : 'Receipt'"
              :severity="data.batch_type === 'return' ? 'warning' : 'success'"
            />
          </template>
        </Column>

        <Column field="Supplier.name" header="Supplier" :sortable="true">
          <template #body="{ data }">
            <span>{{ data.Supplier?.name || 'N/A' }}</span>
          </template>
        </Column>

        <Column field="received_date" header="Received Date" :sortable="true">
          <template #body="{ data }">
            {{ formatDate(data.received_date) }}
          </template>
        </Column>

        <Column field="expiry_date" header="Expiry Date" :sortable="true">
          <template #body="{ data }">
            <div>
              <span>{{ formatDate(data.expiry_date) }}</span>
              <span
                v-if="isExpiringSoon(data.expiry_date)"
                v-tooltip.top="'Expiring within 30 days'"
                class="ml-2 pi pi-exclamation-triangle text-orange-500"
              />
              <span
                v-if="isExpired(data.expiry_date)"
                v-tooltip.top="'Expired'"
                class="ml-2 pi pi-times-circle text-red-500"
              />
            </div>
          </template>
        </Column>

        <Column field="initial_quantity" header="Initial Qty" :sortable="true">
          <template #body="{ data }">
            <span :class="{ 'negative-qty': data.initial_quantity < 0 }">
              {{ formatNumber(data.initial_quantity) }}
            </span>
          </template>
        </Column>

        <Column field="current_quantity" header="Current Qty" :sortable="true">
          <template #body="{ data }">
            <span
              :class="{
                'text-red-500 font-semibold': data.current_quantity <= 0,
                'negative-qty': data.current_quantity < 0,
              }"
            >
              {{ formatNumber(data.current_quantity) }}
            </span>
          </template>
        </Column>

        <Column v-if="hasReturns" field="return_reason" header="Return Reason">
          <template #body="{ data }">
            <span v-if="data.batch_type === 'return' && data.return_reason">
              {{ formatReturnReason(data.return_reason) }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </Column>

        <Column v-if="hasReturns" field="return_disposition" header="Disposition">
          <template #body="{ data }">
            <Tag
              v-if="data.batch_type === 'return' && data.return_disposition"
              :value="data.return_disposition === 'stock' ? 'Return to Stock' : 'Dispose'"
              :severity="data.return_disposition === 'stock' ? 'info' : 'danger'"
            />
            <span v-else class="text-gray-400">-</span>
          </template>
        </Column>

        <Column field="unit_cost" header="Unit Cost (LKR)" :sortable="true">
          <template #body="{ data }">
            {{ formatCurrency(data.unit_cost) }}
          </template>
        </Column>

        <Column header="Status">
          <template #body="{ data }">
            <span
              :class="{
                'inline-block px-2 py-1 text-xs font-semibold rounded': true,
                'bg-green-100 text-green-800':
                  data.current_quantity > 0 && !isExpired(data.expiry_date),
                'bg-orange-100 text-orange-800':
                  isExpiringSoon(data.expiry_date) && data.current_quantity > 0,
                'bg-red-100 text-red-800':
                  isExpired(data.expiry_date) || data.current_quantity <= 0,
              }"
            >
              {{
                data.current_quantity <= 0
                  ? 'Depleted'
                  : isExpired(data.expiry_date)
                    ? 'Expired'
                    : isExpiringSoon(data.expiry_date)
                      ? 'Expiring Soon'
                      : 'Active'
              }}
            </span>
          </template>
        </Column>
      </DataTable>

      <!-- Pagination -->
      <Paginator
        v-if="pagination.totalRecords > pagination.rowsPerPage"
        :rows="pagination.rowsPerPage"
        :total-records="pagination.totalRecords"
        :rows-per-page-options="[10, 25, 50]"
        class="mt-3"
        @page="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { useRawMaterialStore } from '@/stores/rawMaterial';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  materialId: {
    type: Number,
    required: true,
  },
  materialName: {
    type: String,
    default: '',
  },
  unit: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const rawMaterialStore = useRawMaterialStore();
const loading = ref(false);
const batches = ref([]);
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  totalRecords: 0,
});
const batchTypeFilter = ref('');

const batchTypeOptions = [
  { label: 'All Batches', value: '' },
  { label: 'Receipts Only', value: 'receipt' },
  { label: 'Returns Only', value: 'return' },
];

// Computed properties
const totalCurrentQuantity = computed(() => {
  return batches.value.reduce((sum, batch) => sum + parseFloat(batch.current_quantity || 0), 0);
});

const activeBatchCount = computed(() => {
  return batches.value.filter(batch => batch.current_quantity > 0 && !isExpired(batch.expiry_date))
    .length;
});

const hasReturns = computed(() => {
  return batches.value.some(batch => batch.batch_type === 'return');
});

// Methods
const fetchBatches = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
    };

    if (batchTypeFilter.value) {
      params.batch_type = batchTypeFilter.value;
    }

    const response = await rawMaterialStore.fetchRawMaterialBatches(props.materialId, params);

    if (response && response.data) {
      batches.value = response.data.data || [];
      pagination.value.totalRecords = response.data.total || 0;
    }
  } catch (error) {
    console.error('Error fetching batches:', error);
    batches.value = [];
  } finally {
    loading.value = false;
  }
};

const onPageChange = event => {
  pagination.value.page = event.page + 1;
  pagination.value.rowsPerPage = event.rows;
  fetchBatches();
};

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatNumber = value => {
  if (value === null || value === undefined) return '0.00';
  return parseFloat(value).toFixed(2);
};

const formatCurrency = value => {
  if (value === null || value === undefined) return '0.00';
  return parseFloat(value).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const isExpired = expiryDate => {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry < today;
};

const isExpiringSoon = expiryDate => {
  if (!expiryDate || isExpired(expiryDate)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  return expiry <= thirtyDaysFromNow;
};

const formatReturnReason = reason => {
  if (!reason) return '';
  return reason
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Lifecycle
onMounted(() => {
  fetchBatches();
});
</script>

<style scoped>
.batch-list {
  min-height: 400px;
}

.font-mono {
  font-family: 'Courier New', monospace;
}

.negative-qty {
  color: #e53e3e;
  font-weight: 600;
}
</style>
