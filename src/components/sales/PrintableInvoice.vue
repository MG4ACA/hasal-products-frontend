<script setup>
import { computed } from 'vue';

const props = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
});

const salesItems = computed(() => {
  if (!props.invoice?.items) return [];
  return props.invoice.items.filter(item => !item.is_return);
});

const returnItems = computed(() => {
  if (!props.invoice?.items) return [];
  return props.invoice.items.filter(item => item.is_return);
});

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatDate = date => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

// Calculate statistics
const totalItems = computed(() => salesItems.value.length);
const totalQuantity = computed(() => {
  return salesItems.value.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
});

const returnsTotal = computed(() => {
  return returnItems.value.reduce((sum, item) => {
    return sum + Math.abs(item.quantity) * item.unit_price;
  }, 0);
});

// Outstanding balance
const outstandingBalance = computed(() => {
  return parseFloat(props.invoice.outlet?.balance || 0);
});
</script>

<template>
  <div class="printable-invoice">
    <!-- Company Header -->
    <div class="invoice-header">
      <div class="logo-section">
        <!-- Placeholder for logo - add logo to public/logo.png -->
        <img
          src="/favicon.ico"
          alt="HASAL PRODUCT"
          class="company-logo"
          @error="
            e => {
              e.target.style.display = 'none';
            }
          "
        />
      </div>
      <div class="company-info">
        <h1 class="company-name">HASAL PRODUCT</h1>
        <p class="company-address">Thelikada, Ginmallagaha, Galle</p>
        <p class="company-contact">Tel: 077765994</p>
        <p class="company-reg">Reg No: 1/9/180/2017-08-02/04</p>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-info">
      <div class="invoice-number">
        <strong>INVOICE</strong>
        <div class="invoice-no">No. {{ invoice.invoice_number }}</div>
      </div>
      <div class="invoice-date">
        {{ formatDate(invoice.invoice_date) }}
      </div>
    </div>

    <!-- Outlet Information -->
    <div class="outlet-info">
      <strong>{{ invoice.outlet?.name }}</strong>
      <span v-if="invoice.outlet?.address">, {{ invoice.outlet.address }}</span>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th class="text-left">Description</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-center">Disc %</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <!-- Sales Items -->
        <tr v-for="(item, index) in salesItems" :key="'sale-' + index">
          <td>
            {{ item.sku?.product?.name }}
            <span class="item-size">{{ item.sku?.size }}{{ item.sku?.unit }}</span>
          </td>
          <td class="text-center">
            {{ item.quantity }}
          </td>
          <td class="text-right">
            {{ formatCurrency(item.unit_price) }}
          </td>
          <td class="text-center">{{ item.discount_percent }}%</td>
          <td class="text-right">
            {{
              formatCurrency(
                item.quantity * item.unit_price -
                  (item.quantity * item.unit_price * item.discount_percent) / 100
              )
            }}
          </td>
        </tr>

        <!-- Returns Section -->
        <tr v-if="returnItems.length > 0" class="returns-header">
          <td colspan="5">
            <strong>RETURNS:</strong>
          </td>
        </tr>
        <tr v-for="(item, index) in returnItems" :key="'return-' + index" class="return-item">
          <td>
            {{ item.sku?.product?.name }}
            <span class="item-size">{{ item.sku?.size }}{{ item.sku?.unit }}</span>
          </td>
          <td class="text-center">
            {{ Math.abs(item.quantity) }}
          </td>
          <td class="text-right">
            {{ formatCurrency(item.unit_price) }}
          </td>
          <td class="text-center">-</td>
          <td class="text-right return-amount">
            -{{ formatCurrency(Math.abs(item.quantity) * item.unit_price) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-section">
      <div class="totals-row">
        <span class="totals-label">B/F</span>
        <span class="totals-value">Rs.{{ formatCurrency(invoice.subtotal) }}</span>
      </div>
      <div v-if="invoice.discount_amount > 0" class="totals-row">
        <span class="totals-label">Item Discount</span>
        <span class="totals-value">-Rs.{{ formatCurrency(invoice.discount_amount) }}</span>
      </div>
      <div v-if="invoice.discount_percent > 0" class="totals-row">
        <span class="totals-label">Invoice Discount ({{ invoice.discount_percent }}%)</span>
        <span class="totals-value"
          >-Rs.{{ formatCurrency(invoice.invoice_discount_amount || 0) }}</span
        >
      </div>
      <div v-if="returnItems.length > 0" class="totals-row">
        <span class="totals-label">Returns</span>
        <span class="totals-value">-Rs.{{ formatCurrency(returnsTotal) }}</span>
      </div>
      <div class="totals-row grand-total">
        <span class="totals-label"><strong>TOTAL</strong></span>
        <span class="totals-value"
          ><strong>Rs.{{ formatCurrency(invoice.total_amount) }}</strong></span
        >
      </div>
    </div>

    <!-- Statistics -->
    <div class="statistics">
      <div class="stat-item">
        <span class="stat-label">No. of Items:</span>
        <span class="stat-value">{{ totalItems }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">No. of Qty:</span>
        <span class="stat-value">{{ Math.round(totalQuantity) }}</span>
      </div>
    </div>

    <!-- Payment Information -->
    <div class="payment-info">
      <div class="payment-row">
        <span class="payment-label">Payment Method:</span>
        <span class="payment-value">{{ invoice.payment_method?.toUpperCase() }}</span>
      </div>
      <div v-if="outstandingBalance > 0" class="payment-row">
        <span class="payment-label">Outstanding Balance:</span>
        <span class="payment-value">Rs.{{ formatCurrency(outstandingBalance) }}</span>
      </div>
      <div v-if="invoice.sales_ref" class="payment-row">
        <span class="payment-label">Sales Reference:</span>
        <span class="payment-value">{{ invoice.sales_ref.name }}</span>
      </div>
    </div>

    <!-- Footer Terms -->
    <div class="footer-terms">
      <p>Some items are non-returnable. Exchange possible within 7 days bills must be produced</p>
    </div>

    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line" />
        <p class="signature-label">Customer Signature</p>
      </div>
      <div class="signature-box">
        <div class="signature-line" />
        <p class="signature-label">Sales Officer Signature</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.printable-invoice {
  background: white;
  padding: 20mm;
  max-width: 210mm;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.4;
  color: #000;
}

/* Company Header */
.invoice-header {
  text-align: center;
  border-bottom: 2px solid #000;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.logo-section {
  margin-bottom: 10px;
}

.company-logo {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}

.company-info {
  margin-top: 10px;
}

.company-name {
  font-size: 20pt;
  font-weight: bold;
  margin: 0 0 5px 0;
  letter-spacing: 1px;
}

.company-address,
.company-contact,
.company-reg {
  margin: 2px 0;
  font-size: 10pt;
}

/* Invoice Details */
.invoice-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.invoice-number {
  font-size: 12pt;
}

.invoice-no {
  font-size: 11pt;
  margin-top: 2px;
}

.invoice-date {
  font-size: 11pt;
}

/* Outlet Info */
.outlet-info {
  margin-bottom: 15px;
  padding: 8px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  font-size: 10pt;
}

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  font-size: 10pt;
}

.items-table thead {
  background: #f0f0f0;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

.items-table th,
.items-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #ddd;
}

.items-table th {
  font-weight: bold;
  font-size: 10pt;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.item-size {
  font-size: 9pt;
  color: #666;
  margin-left: 5px;
}

/* Returns */
.returns-header td {
  background: #f9f9f9;
  border-top: 2px solid #000;
  border-bottom: 1px solid #000;
  font-weight: bold;
  padding: 8px;
}

.return-item {
  background: #fffbf0;
}

.return-amount {
  color: #d32f2f;
  font-weight: bold;
}

/* Totals */
.totals-section {
  margin-left: auto;
  width: 300px;
  border: 1px solid #000;
  padding: 10px;
  margin-bottom: 15px;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 10pt;
}

.totals-row.grand-total {
  border-top: 2px solid #000;
  margin-top: 8px;
  padding-top: 8px;
  font-size: 12pt;
}

.totals-label {
  font-weight: 500;
}

.totals-value {
  text-align: right;
}

/* Statistics */
.statistics {
  display: flex;
  gap: 30px;
  margin-bottom: 15px;
  font-size: 10pt;
  padding: 8px;
  background: #f9f9f9;
  border: 1px solid #ddd;
}

.stat-item {
  display: flex;
  gap: 10px;
}

.stat-label {
  font-weight: bold;
}

/* Payment Info */
.payment-info {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  background: #fafafa;
  font-size: 10pt;
}

.payment-row {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}

.payment-label {
  font-weight: bold;
  min-width: 150px;
}

/* Footer Terms */
.footer-terms {
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 9pt;
  font-style: italic;
}

.footer-terms p {
  margin: 0;
}

/* Signature Section */
.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.signature-box {
  width: 45%;
}

.signature-line {
  border-bottom: 1px solid #000;
  margin-bottom: 5px;
  height: 40px;
}

.signature-label {
  text-align: center;
  font-size: 10pt;
  margin: 0;
}

/* Print Styles */
@media print {
  .printable-invoice {
    padding: 10mm;
    max-width: 100%;
  }

  @page {
    size: A4 portrait;
    margin: 10mm;
  }

  /* Ensure proper page breaks */
  .items-table {
    page-break-inside: avoid;
  }

  .signature-section {
    page-break-inside: avoid;
  }

  /* Hide any elements that shouldn't print */
  button,
  .no-print {
    display: none !important;
  }
}
</style>
