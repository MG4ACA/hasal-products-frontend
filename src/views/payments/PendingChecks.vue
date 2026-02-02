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

    <!-- Phase 2: Admin-only notice -->
    <div v-if="!isAdmin" class="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
      <i class="pi pi-info-circle text-amber-600 mr-2" />
      <strong>Note:</strong> Only administrators can bounce checks. You can clear checks when they
      are successfully deposited.
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
        <Column header="Actions" style="width: 200px">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-eye"
                size="small"
                severity="info"
                text
                @click="viewPayment(data.id)"
                v-tooltip.top="'View Details'"
              />
              <Button
                v-tooltip.top="'Clear Check'"
                icon="pi pi-check"
                size="small"
                severity="success"
                text
                @click="clearCheck(data)"
              />
              <Button
                v-if="isAdmin"
                v-tooltip.top="'Bounce Check (Admin Only)'"
                icon="pi pi-times"
                size="small"
                severity="danger"
                text
                @click="bounceCheck(data)"
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

    <!-- Phase 2: Bounce Check Dialog -->
    <Dialog
      v-model:visible="showBounceDialog"
      header="Bounce Check"
      :style="{ width: '600px' }"
      modal
    >
      <div v-if="selectedCheck" class="p-fluid">
        <div class="mb-3 p-3 bg-red-50 border border-red-200 rounded">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <strong>Check Number:</strong>
              <div class="text-lg">{{ selectedCheck.check_number }}</div>
            </div>
            <div>
              <strong>Check Date:</strong>
              <div class="text-lg">{{ selectedCheck.check_date }}</div>
            </div>
            <div>
              <strong>Amount:</strong>
              <div class="text-lg font-semibold">
                Rs. {{ parseFloat(selectedCheck.amount).toFixed(2) }}
              </div>
            </div>
            <div>
              <strong>Days Pending:</strong>
              <div class="text-lg">{{ selectedCheck.days_pending }} days</div>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="bounce_reason">Bounce Reason <span class="required">*</span></label>
          <Textarea
            id="bounce_reason"
            v-model="bounceReason"
            rows="3"
            placeholder="e.g., Insufficient funds, Account closed, Signature mismatch..."
            class="w-full"
          />
          <small v-if="!bounceReason.trim()" class="p-error">Bounce reason is required</small>
        </div>

        <div class="field">
          <label for="bounce_fee">Bounce Fee (Rs.)</label>
          <InputNumber
            id="bounce_fee"
            v-model="bounceFee"
            mode="currency"
            currency="LKR"
            locale="en-US"
            class="w-full"
          />
          <small class="text-gray-600">Optional: Additional fee charged for bounced check</small>
        </div>

        <div class="field">
          <label for="bounce_date">Bounce Date <span class="required">*</span></label>
          <Calendar
            id="bounce_date"
            v-model="bounceDate"
            date-format="yy-mm-dd"
            show-icon
            :max-date="new Date()"
            class="w-full"
          />
        </div>

        <div class="mt-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
          <div class="flex items-start">
            <i class="pi pi-exclamation-triangle text-amber-600 mr-2 mt-1" />
            <div class="text-sm">
              <strong>Warning:</strong> Bouncing this check will:
              <ul class="mt-2 ml-4 space-y-1">
                <li>Reverse all payment allocations to invoices</li>
                <li>
                  Restore outlet balance (Rs. {{ parseFloat(selectedCheck.amount).toFixed(2) }}
                  <span v-if="bounceFee">+ Rs. {{ bounceFee.toFixed(2) }} fee</span>)
                </li>
                <li>Mark check as bounced (cannot be cleared)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showBounceDialog = false" />
        <Button
          label="Bounce Check"
          severity="danger"
          icon="pi pi-times-circle"
          :disabled="!bounceReason.trim()"
          @click="submitBounceCheck"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { usePaymentStore } from '@/stores/payment';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();
const toast = useToast();

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
const breadcrumbItems = [{ label: 'Payments', to: '/payments' }, { label: 'Pending Checks' }];

const overdueOnly = ref(false);
const showClearDialog = ref(false);
const selectedCheck = ref(null);
const clearanceDate = ref(new Date());

// Phase 2: Bounce check state
const showBounceDialog = ref(false);
const bounceReason = ref('');
const bounceFee = ref(0);
const bounceDate = ref(new Date());

// Phase 2: Check if user is admin
const isAdmin = computed(() => authStore.user?.role === 'admin');

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
    await paymentStore.clearCheck(selectedCheck.value.id, {
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

// Phase 2: Bounce check functionality
const bounceCheck = check => {
  if (!isAdmin.value) {
    toast.add({
      severity: 'warn',
      summary: 'Unauthorized',
      detail: 'Only administrators can bounce checks',
      life: 3000,
    });
    return;
  }

  selectedCheck.value = check;
  bounceReason.value = '';
  bounceFee.value = 0;
  bounceDate.value = new Date();
  showBounceDialog.value = true;
};

const submitBounceCheck = async () => {
  if (!bounceReason.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please provide a bounce reason',
      life: 3000,
    });
    return;
  }

  try {
    await paymentStore.bounceCheck(selectedCheck.value.id, {
      bounce_reason: bounceReason.value,
      bounce_fee: bounceFee.value || 0,
      bounce_date: new Date(bounceDate.value).toISOString().split('T')[0],
    });

    toast.add({
      severity: 'success',
      summary: 'Check Bounced',
      detail: 'Check has been marked as bounced and allocations reversed',
      life: 3000,
    });

    showBounceDialog.value = false;
    fetchChecks();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to bounce check',
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
