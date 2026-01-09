<template>
  <div class="pending-checks">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div>
        <h1>Pending Checks</h1>
        <p>Manage and clear pending check payments</p>
      </div>
      <Button
        icon="pi pi-refresh"
        rounded
        severity="primary"
        @click="fetchChecks"
        v-tooltip="'Refresh'"
      />
    </div>

    <div class="filters-section">
      <div class="field-checkbox">
        <Checkbox v-model="overdueOnly" input-id="overdue" binary @change="fetchChecks" />
        <label for="overdue">Show Overdue Only (>30 days)</label>
      </div>
    </div>

    <div class="table-container">
      <DataTable
        :value="paymentStore.pendingChecks"
        :loading="paymentStore.loading"
        striped-rows
        show-gridlines
      >
        <Column field="id" header="ID" style="width: 80px" />
        <Column header="Outlet">
          <template #body="{ data }">
            {{ data.outlet?.name || 'N/A' }}
          </template>
        </Column>
        <Column field="check_number" header="Check Number" />
        <Column field="check_date" header="Check Date" />
        <Column field="amount" header="Amount">
          <template #body="{ data }"> Rs. {{ parseFloat(data.amount).toFixed(2) }} </template>
        </Column>
        <Column header="Days Pending">
          <template #body="{ data }">
            <Tag :severity="data.is_overdue ? 'danger' : 'warning'">
              {{ data.days_pending }} days
            </Tag>
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag v-if="data.is_overdue" severity="danger"> OVERDUE </Tag>
            <Tag v-else severity="warning"> PENDING </Tag>
          </template>
        </Column>
        <Column header="Allocated To">
          <template #body="{ data }">
            <div v-if="data.allocations && data.allocations.length">
              <div v-for="alloc in data.allocations" :key="alloc.id">
                {{ alloc.invoice?.invoice_number }}
              </div>
            </div>
          </template>
        </Column>
        <Column header="Actions" style="width: 150px">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                size="small"
                severity="info"
                text
                @click="viewPayment(data.id)"
              />
              <Button
                v-tooltip.top="'Clear Check'"
                icon="pi pi-check"
                size="small"
                severity="success"
                text
                @click="clearCheck(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Clear Check Dialog -->
    <Dialog v-model:visible="showClearDialog" header="Clear Check" :style="{ width: '500px' }">
      <div v-if="selectedCheck" class="p-fluid">
        <div class="field">
          <label><strong>Check Number:</strong> {{ selectedCheck.check_number }}</label>
        </div>
        <div class="field">
          <label><strong>Check Date:</strong> {{ selectedCheck.check_date }}</label>
        </div>
        <div class="field">
          <label
            ><strong>Amount:</strong> Rs. {{ parseFloat(selectedCheck.amount).toFixed(2) }}</label
          >
        </div>
        <div class="field">
          <label><strong>Days Pending:</strong> {{ selectedCheck.days_pending }} days</label>
        </div>
        <div class="field">
          <label>Clearance Date <span class="required">*</span></label>
          <Calendar
            v-model="clearanceDate"
            date-format="yy-mm-dd"
            show-icon
            :max-date="new Date()"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showClearDialog = false" />
        <Button label="Clear Check" severity="success" @click="submitClearCheck" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { usePaymentStore } from '@/stores/payment';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const paymentStore = usePaymentStore();
const toast = useToast();

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
const breadcrumbItems = [{ label: 'Payments', to: '/payments' }, { label: 'Pending Checks' }];

const overdueOnly = ref(false);
const showClearDialog = ref(false);
const selectedCheck = ref(null);
const clearanceDate = ref(new Date());

const fetchChecks = async () => {
  try {
    await paymentStore.fetchPendingChecks(overdueOnly.value);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch pending checks',
      life: 3000,
    });
  }
};

const viewPayment = id => {
  router.push(`/payments/${id}`);
};

const clearCheck = check => {
  selectedCheck.value = check;
  clearanceDate.value = new Date();
  showClearDialog.value = true;
};

const submitClearCheck = async () => {
  try {
    await paymentStore.updatePayment(selectedCheck.value.id, {
      clearance_date: new Date(clearanceDate.value).toISOString().split('T')[0],
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Check cleared successfully',
      life: 3000,
    });

    showClearDialog.value = false;
    fetchChecks();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to clear check',
      life: 3000,
    });
  }
};

onMounted(() => {
  fetchChecks();
});
</script>

<style scoped>
.pending-checks {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
}

.page-header p {
  margin: 0;
  color: #666;
}

.filters-section {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.required {
  color: red;
}
</style>
