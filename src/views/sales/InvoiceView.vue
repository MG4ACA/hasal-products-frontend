<script setup>
import { useSalesStore } from '@/stores/sales';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const salesStore = useSalesStore();
const toast = useToast();
const confirm = useConfirm();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Sales', to: '/sales' },
  { label: 'Invoice Details' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const invoice = computed(() => salesStore.currentInvoice);

const salesItems = computed(() => {
  if (!invoice.value?.items) return [];
  return invoice.value.items.filter(item => !item.is_return);
});

const returnItems = computed(() => {
  if (!invoice.value?.items) return [];
  return invoice.value.items.filter(item => item.is_return);
});

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount || 0);
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

const getPaymentStatusSeverity = status => {
  const severityMap = {
    paid: 'success',
    unpaid: 'danger',
    partial: 'warning',
  };
  return severityMap[status] || 'info';
};

const getPaymentMethodTag = method => {
  const tagMap = {
    cash: 'success',
    credit: 'warning',
    check: 'info',
  };
  return tagMap[method] || 'info';
};

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
    }
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

const handleEdit = () => {
  router.push(`/sales/${route.params.id}/edit`);
};

const handleDelete = () => {
  confirm.require({
    message: `Are you sure you want to delete invoice ${invoice.value?.invoice_number}?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await salesStore.deleteInvoice(route.params.id);
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invoice deleted successfully',
          life: 3000,
        });
        router.push('/sales');
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to delete invoice',
          life: 3000,
        });
      }
    },
  });
};

const handleBack = () => {
  router.push('/sales');
};

onMounted(() => {
  loadInvoice();
});
</script>

<template>
  <div class="invoice-view">
    <ConfirmDialog />

    <Breadcrumb
      :home="breadcrumbHome"
      :model="breadcrumbItems"
      class="mb-4"
    />

    <div
      v-if="salesStore.loading"
      class="loading-state"
    >
      <i
        class="pi pi-spin pi-spinner"
        style="font-size: 2rem"
      />
      <p>Loading invoice...</p>
    </div>

    <div
      v-else-if="invoice"
      class="invoice-details"
    >
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Invoice {{ invoice.invoice_number }}
          </h1>
          <p class="page-subtitle">
            View invoice details and items
          </p>
        </div>
        <div class="header-actions">
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            severity="secondary"
            @click="handleBack"
          />
          <Button
            label="Edit"
            icon="pi pi-pencil"
            severity="success"
            @click="handleEdit"
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            @click="handleDelete"
          />
        </div>
      </div>

      <!-- Invoice Header -->
      <div class="info-card">
        <h2 class="section-title">
          Invoice Information
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Invoice Number</label>
            <div class="value font-semibold">
              {{ invoice.invoice_number }}
            </div>
          </div>

          <div class="info-item">
            <label>Invoice Date</label>
            <div class="value">
              {{ formatDate(invoice.invoice_date) }}
            </div>
          </div>

          <div class="info-item">
            <label>Outlet</label>
            <div class="value">
              {{ invoice.outlet?.name }} ({{ invoice.outlet?.code }})
            </div>
          </div>

          <div class="info-item">
            <label>Sales Reference</label>
            <div class="value">
              <Tag
                v-if="invoice.sales_ref"
                severity="info"
              >
                {{ invoice.sales_ref?.first_name }} {{ invoice.sales_ref?.last_name }}
              </Tag>
              <span v-else>-</span>
            </div>
          </div>

          <div class="info-item">
            <label>Route</label>
            <div class="value">
              <Tag
                v-if="invoice.route"
                severity="info"
              >
                {{ invoice.route?.name }}
              </Tag>
              <span v-else>-</span>
            </div>
          </div>

          <div class="info-item">
            <label>Payment Method</label>
            <div class="value">
              <Tag :severity="getPaymentMethodTag(invoice.payment_method)">
                {{ invoice.payment_method?.toUpperCase() }}
              </Tag>
            </div>
          </div>

          <div class="info-item">
            <label>Payment Status</label>
            <div class="value">
              <Tag :severity="getPaymentStatusSeverity(invoice.payment_status)">
                {{ invoice.payment_status?.toUpperCase() }}
              </Tag>
            </div>
          </div>

          <div class="info-item">
            <label>Created By</label>
            <div class="value">
              {{ invoice.creator?.username || '-' }}
            </div>
          </div>
        </div>

        <!-- Check Details (if applicable) -->
        <div
          v-if="invoice.payment_method === 'check'"
          class="check-details"
        >
          <h3 class="subsection-title">
            Check Details
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Check Number</label>
              <div class="value">
                {{ invoice.check_number || '-' }}
              </div>
            </div>

            <div class="info-item">
              <label>Check Date</label>
              <div class="value">
                {{ formatDate(invoice.check_date) }}
              </div>
            </div>

            <div class="info-item">
              <label>Clearance Date</label>
              <div class="value">
                {{ formatDate(invoice.check_clearance_date) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div
          v-if="invoice.notes"
          class="notes-section"
        >
          <h3 class="subsection-title">
            Notes
          </h3>
          <p class="notes-text">
            {{ invoice.notes }}
          </p>
        </div>
      </div>

      <!-- Sales Items -->
      <div class="info-card">
        <h2 class="section-title">
          Sales Items
        </h2>
        <DataTable :value="salesItems">
          <template #empty>
            <div class="text-center p-4 text-gray-500">
              No sales items
            </div>
          </template>

          <Column
            field="product_sku.product.name"
            header="Product"
            style="min-width: 200px"
          >
            <template #body="slotProps">
              <div>
                <div class="font-semibold">
                  {{ slotProps.data.product_sku?.product?.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ slotProps.data.product_sku?.size }}{{ slotProps.data.product_sku?.unit }}
                </div>
              </div>
            </template>
          </Column>

          <Column
            field="quantity"
            header="Quantity"
            style="width: 100px"
          />

          <Column
            field="unit_price"
            header="Unit Price"
            style="width: 140px"
          >
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.unit_price) }}
            </template>
          </Column>

          <Column
            field="discount_percent"
            header="Discount"
            style="width: 100px"
          >
            <template #body="slotProps">
              {{ slotProps.data.discount_percent }}%
            </template>
          </Column>

          <Column
            header="Subtotal"
            style="width: 140px"
          >
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.quantity * slotProps.data.unit_price) }}
            </template>
          </Column>

          <Column
            header="Discount Amt"
            style="width: 140px"
          >
            <template #body="slotProps">
              {{
                formatCurrency(
                  (slotProps.data.quantity *
                    slotProps.data.unit_price *
                    slotProps.data.discount_percent) /
                    100
                )
              }}
            </template>
          </Column>

          <Column
            header="Total"
            style="width: 140px"
          >
            <template #body="slotProps">
              <div class="font-semibold">
                {{
                  formatCurrency(
                    slotProps.data.quantity * slotProps.data.unit_price -
                      (slotProps.data.quantity *
                        slotProps.data.unit_price *
                        slotProps.data.discount_percent) /
                      100
                  )
                }}
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Return Items -->
      <div
        v-if="returnItems.length > 0"
        class="info-card"
      >
        <h2 class="section-title">
          Return Items
        </h2>
        <DataTable :value="returnItems">
          <Column
            field="product_sku.product.name"
            header="Product"
            style="min-width: 200px"
          >
            <template #body="slotProps">
              <div>
                <div class="font-semibold">
                  {{ slotProps.data.product_sku?.product?.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ slotProps.data.product_sku?.size }}{{ slotProps.data.product_sku?.unit }}
                </div>
              </div>
            </template>
          </Column>

          <Column
            field="quantity"
            header="Quantity"
            style="width: 100px"
          >
            <template #body="slotProps">
              {{ Math.abs(slotProps.data.quantity) }}
            </template>
          </Column>

          <Column
            field="unit_price"
            header="Unit Price"
            style="width: 140px"
          >
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.unit_price) }}
            </template>
          </Column>

          <Column
            field="return_reason"
            header="Reason"
            style="width: 150px"
          >
            <template #body="slotProps">
              <Tag severity="warning">
                {{ slotProps.data.return_reason?.replace('_', ' ').toUpperCase() }}
              </Tag>
            </template>
          </Column>

          <Column
            field="return_to_stock"
            header="To Stock"
            style="width: 100px"
          >
            <template #body="slotProps">
              <i
                v-if="slotProps.data.return_to_stock"
                class="pi pi-check text-green-500"
              />
              <i
                v-else
                class="pi pi-times text-red-500"
              />
            </template>
          </Column>

          <Column
            header="Total"
            style="width: 140px"
          >
            <template #body="slotProps">
              <div class="font-semibold text-red-500">
                -{{ formatCurrency(Math.abs(slotProps.data.quantity) * slotProps.data.unit_price) }}
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Totals -->
      <div class="totals-card">
        <h2 class="section-title">
          Invoice Totals
        </h2>
        <div class="totals-grid">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">{{ formatCurrency(invoice.subtotal) }}</span>
          </div>

          <div class="total-row">
            <span class="total-label">Total Discount:</span>
            <span class="total-value text-red-500">-{{ formatCurrency(invoice.total_discount_amount) }}</span>
          </div>

          <div class="total-row grand-total">
            <span class="total-label">Grand Total:</span>
            <span class="total-value">{{ formatCurrency(invoice.total_amount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invoice-view {
  padding: 1.5rem;
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

.invoice-details {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 1.5rem 0 0.75rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-item .value {
  font-size: 1rem;
  color: #111827;
}

.notes-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.notes-text {
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.totals-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.totals-grid {
  max-width: 400px;
  margin-left: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  background: #f9fafb;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.total-row:last-child {
  border-bottom: none;
}

.total-row.grand-total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #374151;
  font-size: 1.25rem;
  font-weight: 700;
}

.total-label {
  font-weight: 500;
  color: #6b7280;
}

.total-value {
  font-weight: 600;
  color: #111827;
}

.grand-total .total-label,
.grand-total .total-value {
  color: #111827;
}
</style>
