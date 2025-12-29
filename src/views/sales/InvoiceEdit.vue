<script setup>
import InvoiceForm from '@/components/sales/InvoiceForm.vue';
import { useSalesStore } from '@/stores/sales';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const salesStore = useSalesStore();
const toast = useToast();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Sales', to: '/sales' },
  { label: 'Edit Invoice' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const invoiceData = ref({
  outlet_id: null,
  sales_ref_id: null,
  route_id: null,
  invoice_date: new Date(),
  payment_method: 'cash',
  payment_status: null,
  check_number: null,
  check_date: null,
  check_clearance_date: null,
  notes: '',
  items: [],
});

const loadInvoice = async () => {
  try {
    const id = route.params.id;
    await salesStore.fetchInvoiceById(id);

    if (!salesStore.currentInvoice) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invoice not found',
        life: 3000,
      });
      router.push('/sales');
      return;
    }

    // Map invoice to form data
    const invoice = salesStore.currentInvoice;
    invoiceData.value = {
      outlet_id: invoice.outlet_id,
      sales_ref_id: invoice.sales_ref_id,
      route_id: invoice.route_id,
      invoice_date: new Date(invoice.invoice_date),
      payment_method: invoice.payment_method,
      payment_status: invoice.payment_status,
      check_number: invoice.check_number,
      check_date: invoice.check_date ? new Date(invoice.check_date) : null,
      check_clearance_date: invoice.check_clearance_date
        ? new Date(invoice.check_clearance_date)
        : null,
      notes: invoice.notes || '',
      items: (invoice.items || []).map(item => ({
        sku_id: item.sku_id,
        product_name: item.product_sku?.product?.name || 'Unknown Product',
        sku_label: `${item.product_sku?.size}${item.product_sku?.unit}`,
        quantity: item.is_return ? -item.quantity : item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        is_return: item.is_return,
        return_reason: item.return_reason,
        return_to_stock: item.return_to_stock,
      })),
    };
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to load invoice',
      life: 3000,
    });
    router.push('/sales');
  }
};

const handleSubmit = async data => {
  try {
    const id = route.params.id;

    // Note: updateInvoice only allows updating notes and payment_status
    const updateData = {
      notes: data.notes,
      payment_status: data.payment_status,
    };

    await salesStore.updateInvoice(id, updateData);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Invoice updated successfully',
      life: 3000,
    });

    router.push('/sales');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to update invoice',
      life: 3000,
    });
  }
};

const handleCancel = () => {
  router.push('/sales');
};

onMounted(() => {
  loadInvoice();
});
</script>

<template>
  <div class="invoice-edit">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Sales Invoice</h1>
        <p class="page-subtitle">Update invoice notes and payment status</p>
      </div>
    </div>

    <div v-if="salesStore.loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <p>Loading invoice...</p>
    </div>

    <InvoiceForm
      v-else-if="salesStore.currentInvoice"
      v-model="invoiceData"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.invoice-edit {
  padding: 1.5rem;
}

.page-header {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state p {
  margin-top: 1rem;
  color: #6b7280;
}
</style>
