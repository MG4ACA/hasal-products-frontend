<script setup>
import InvoiceForm from '@/components/sales/InvoiceForm.vue';
import { useSalesStore } from '@/stores/sales';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const salesStore = useSalesStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Sales', to: '/sales' },
  { label: 'Create Invoice' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const defaultInvoice = () => ({
  outlet_id: null,
  sales_ref_id: null,
  route_id: null,
  invoice_date: new Date(),
  payment_method: 'credit',
  payment_status: null,
  check_number: null,
  check_date: null,
  check_clearance_date: null,
  notes: '',
  items: [],
});

const invoiceData = ref(defaultInvoice());
const draftRestored = ref(false);
// Prevents the leave-guard from firing when we navigate programmatically after confirm
const bypassGuard = ref(false);

// On mount: only restore draft when navigated here via ?resume=true (from the Sales list page)
onMounted(() => {
  if (route.query.resume === 'true') {
    const draft = salesStore.draftInvoice;
    if (draft && (draft.outlet_id || (draft.items && draft.items.length > 0))) {
      invoiceData.value = draft;
      draftRestored.value = true;
    }
  }
});

// Auto-save draft on every change (debounced slightly)
let draftTimer = null;
watch(
  invoiceData,
  newVal => {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      // Only save if there is something meaningful
      if (newVal.outlet_id || (newVal.items && newVal.items.length > 0)) {
        salesStore.saveDraft(JSON.parse(JSON.stringify(newVal)));
      }
    }, 500);
  },
  { deep: true }
);

// Navigate-away confirmation — only fires when there is meaningful data to lose
onBeforeRouteLeave(to => {
  if (bypassGuard.value) return true;
  const hasMeaningfulData =
    invoiceData.value.outlet_id ||
    (invoiceData.value.items && invoiceData.value.items.length > 0);
  if (hasMeaningfulData) {
    confirm.require({
      message: 'Your draft is automatically saved. You can resume it from the Sales Invoice list whenever you\'re ready.',
      header: 'Leave Invoice Page?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Stay',
      acceptLabel: 'Leave',
      rejectClass: 'p-button-success',
      acceptClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        bypassGuard.value = true;
        router.push(to.fullPath);
      },
    });
    return false;
  }
  return true;
});

const handleSubmit = async data => {
  try {
    // Format the invoice data for API
    const formattedData = {
      outlet_id: data.outlet_id,
      sales_ref_id: data.sales_ref_id,
      route_id: data.route_id,
      invoice_date: formatDate(data.invoice_date),
      payment_method: data.payment_method,
      check_number: data.check_number,
      check_date: data.check_date ? formatDate(data.check_date) : null,
      check_clearance_date: data.check_clearance_date
        ? formatDate(data.check_clearance_date)
        : null,
      notes: data.notes,
      // Phase 1: Include credit limit override reason if provided
      credit_limit_override_reason: data.credit_limit_override_reason || null,
      // Invoice-level discount
      invoice_discount_percent: data.invoice_discount_percent || 0,
      items: data.items.map(item => ({
        sku_id: item.sku_id,
        quantity: item.is_return ? -Math.abs(item.quantity) : item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        is_return: item.is_return || false,
        return_reason: item.return_reason || null,
        return_to_stock: item.return_to_stock || false,
        // Phase 2: Include return validation fields
        original_invoice_id: item.original_invoice_id || null,
        return_policy_override: item.return_policy_override || false,
        return_policy_override_reason: item.return_policy_override_reason || null,
        // Legacy Returns: Include admin_id for authorization tracking
        admin_id: item.admin_id || null,
      })),
    };

    await salesStore.createInvoice(formattedData);

    // Clear draft on successful submit
    salesStore.clearDraft();
    draftRestored.value = false;
    bypassGuard.value = true; // No need to show leave dialog after successful submit

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Invoice created successfully',
      life: 3000,
    });

    router.push('/sales');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to create invoice',
      life: 3000,
    });
  }
};

const handleCancel = () => {
  // Explicit cancel — clear draft and navigate without triggering the leave guard
  bypassGuard.value = true;
  salesStore.clearDraft();
  draftRestored.value = false;
  router.push('/sales');
};

const formatDate = date => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div class="invoice-create">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div>
        <h1 class="page-title">Create Sales Invoice</h1>
        <p class="page-subtitle">Create a new sales invoice with items and returns</p>
      </div>
    </div>

    <!-- Subtle resume notice (only shown when user navigated with ?resume=true) -->
    <div v-if="draftRestored" class="draft-resume-notice mb-3">
      <i class="pi pi-history mr-2" />
      <span>Draft restored — continuing from where you left off.</span>
    </div>

    <InvoiceForm v-model="invoiceData" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
.invoice-create {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
}

.draft-resume-notice {
  display: flex;
  align-items: center;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  color: #166534;
  font-size: 0.875rem;
}
</style>
