<script setup>
import InvoiceForm from '@/components/sales/InvoiceForm.vue';
import { useSalesStore } from '@/stores/sales';
import Breadcrumb from 'primevue/breadcrumb';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const salesStore = useSalesStore();
const toast = useToast();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Sales', to: '/sales' },
  { label: 'Create Invoice' },
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
      items: data.items.map(item => ({
        sku_id: item.sku_id,
        quantity: item.is_return ? -Math.abs(item.quantity) : item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
        is_return: item.is_return || false,
        return_reason: item.return_reason || null,
        return_to_stock: item.return_to_stock || false,
      })),
    };

    await salesStore.createInvoice(formattedData);

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

    <InvoiceForm v-model="invoiceData" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
.invoice-create {
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
</style>
