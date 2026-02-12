<script setup>
import salesService from '@/services/salesService';
import { useAuthStore } from '@/stores/auth';
import { useEmployeeStore } from '@/stores/employee';
import { useOutletStore } from '@/stores/outlet';
import { useProductStore } from '@/stores/product';
import { useRouteStore } from '@/stores/route';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const outletStore = useOutletStore();
const employeeStore = useEmployeeStore();
const routeStore = useRouteStore();
const productStore = useProductStore();
const authStore = useAuthStore();
const toast = useToast();

// Form data
const formData = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

// Options
const paymentMethodOptions = [
  { label: 'Credit', value: 'credit' },
  { label: 'Cash', value: 'cash' },
  { label: 'Check', value: 'check' },
];

const outletOptions = ref([]);
const filteredOutletOptions = ref([]);
const selectedOutlet = ref(null);

const returnReasonOptions = [
  { label: 'Damaged', value: 'damaged' },
  { label: 'Expired', value: 'expired' },
  { label: 'Excess', value: 'excess' },
  { label: 'Quality Issue', value: 'quality_issue' },
  { label: 'Other', value: 'other' },
];

// Sales items management
const selectedProduct = ref(null);
const selectedSku = ref(null);
const itemQuantity = ref(1);
const itemPrice = ref(0);
const itemDiscount = ref(0);
const stockError = ref('');

// Return items management
const returnProduct = ref(null);
const returnSku = ref(null);
const returnQuantity = ref(1);
const returnReason = ref('damaged');
const returnToStock = ref(false);

// Phase 2: Return validation
const showPurchaseHistoryDialog = ref(false);
const purchaseHistory = ref(null);
const loadingPurchaseHistory = ref(false);
const originalInvoiceId = ref(null); // Stores numeric ID for backend
const originalInvoiceNumber = ref(null); // Stores invoice number for display
const originalInvoiceDate = ref(null); // Stores invoice date for policy calculation
const daysSincePurchase = ref(null); // Stores days since purchase

// Legacy Returns support (for pre-system purchases)
const returnPolicyOverrideReason = ref(''); // Used only for legacy return explanation
const isLegacyReturn = ref(false);
const showAdminPasswordDialog = ref(false);
const adminPassword = ref('');
const adminAuthData = ref(null); // Stores {adminId, adminName, adminUsername} after verification
const verifyingPassword = ref(false);

// Phase 2: Return policy constants
const RETURN_POLICY = {
  damaged: { days: 7, description: 'Damaged goods - 7 days' },
  expired: { days: 30, description: 'Expired products - 30 days' },
  excess: { days: 3, description: 'Excess quantity - 3 days' },
  quality_issue: { days: 7, description: 'Quality issues - 7 days' },
  other: { days: 3, description: 'Other reasons - 3 days' },
};

// Phase 1: Credit limit warning
const creditWarning = ref(null);
const showCreditWarningBanner = ref(false);
const showCreditLimitModal = ref(false);
const creditOverrideReason = ref('');
const CREDIT_WARNING_THRESHOLD = 0.8; // 80%

// Invoice-level discount
const invoiceDiscountPercent = ref(0);
const MAX_INVOICE_DISCOUNT = 40; // Maximum 40% warning threshold

// Computed
const productOptions = computed(() => productStore.products || []);
const employeeOptions = computed(() => {
  // Filter for sales_ref type employees that are active
  return employeeStore.employees.filter(e => e.type === 'sales_ref' && e.status === 'active');
});

const skuOptions = computed(() => {
  if (!selectedProduct.value) return [];
  const product = productStore.products.find(p => p.id === selectedProduct.value);
  return product?.skus || [];
});

const returnSkuOptions = computed(() => {
  if (!returnProduct.value) return [];
  const product = productStore.products.find(p => p.id === returnProduct.value);
  return product?.skus || [];
});

const subtotal = computed(() => {
  return (formData.value.items || []).reduce((sum, item) => {
    if (item.is_return) return sum;
    return sum + item.quantity * item.unit_price;
  }, 0);
});

const totalDiscount = computed(() => {
  return (formData.value.items || []).reduce((sum, item) => {
    if (item.is_return) return sum;
    const itemSubtotal = item.quantity * item.unit_price;
    return sum + (itemSubtotal * item.discount_percent) / 100;
  }, 0);
});

const returnsTotal = computed(() => {
  return (formData.value.items || []).reduce((sum, item) => {
    if (!item.is_return) return sum;
    return sum + Math.abs(item.quantity) * item.unit_price;
  }, 0);
});

const grandTotal = computed(() => {
  const netAfterItemDiscounts = subtotal.value - totalDiscount.value;
  const netAmount = netAfterItemDiscounts - returnsTotal.value;
  const invoiceDiscount =
    netAmount > 0 ? (netAmount * (invoiceDiscountPercent.value || 0)) / 100 : 0;
  return netAfterItemDiscounts - invoiceDiscount;
});

const invoiceDiscountAmount = computed(() => {
  const netAfterItemDiscounts = subtotal.value - totalDiscount.value;
  const netAmount = netAfterItemDiscounts - returnsTotal.value;
  return netAmount > 0 ? (netAmount * (invoiceDiscountPercent.value || 0)) / 100 : 0;
});

const invoiceDiscountWarning = computed(() => {
  return (invoiceDiscountPercent.value || 0) > MAX_INVOICE_DISCOUNT;
});

const isFormValid = computed(() => {
  return (
    formData.value.outlet_id &&
    formData.value.sales_ref_id &&
    formData.value.invoice_date &&
    formData.value.payment_method &&
    formData.value.items &&
    formData.value.items.length > 0 &&
    !hasInsufficientStock.value
  );
});

// Check if any sales item has insufficient stock
const hasInsufficientStock = computed(() => {
  const salesItems = (formData.value.items || []).filter(item => !item.is_return);
  return salesItems.some(item => {
    const product = productStore.products.find(
      p => p.skus && p.skus.some(s => s.id === item.sku_id)
    );
    if (!product) return false;
    const sku = product.skus.find(s => s.id === item.sku_id);
    return sku && sku.current_stock < item.quantity;
  });
});

// Validate stock availability for current selection
const validateStock = () => {
  stockError.value = '';

  if (!selectedSku.value || !itemQuantity.value) {
    return true;
  }

  const sku = skuOptions.value.find(s => s.id === selectedSku.value);
  if (!sku) {
    return true;
  }

  if (sku.current_stock < itemQuantity.value) {
    stockError.value = `Insufficient stock. Only ${sku.current_stock} units available.`;
    return false;
  }

  return true;
};

// Phase 1: Check credit limit helper (defined before watchers that use it)
const checkCreditLimit = () => {
  if (
    !formData.value.outlet_id ||
    formData.value.payment_method !== 'credit' ||
    !selectedOutlet.value
  ) {
    creditWarning.value = null;
    showCreditWarningBanner.value = false;
    return;
  }

  const outlet = selectedOutlet.value?.outlet;
  if (!outlet) {
    creditWarning.value = null;
    showCreditWarningBanner.value = false;
    return;
  }

  const currentBalance = parseFloat(outlet.balance || 0);
  const creditLimit = parseFloat(outlet.credit_limit || 0);
  const invoiceAmount = grandTotal.value;
  const potentialBalance = currentBalance + invoiceAmount;
  const utilizationPercent = creditLimit > 0 ? (potentialBalance / creditLimit) * 100 : 0;

  if (potentialBalance >= creditLimit * CREDIT_WARNING_THRESHOLD) {
    creditWarning.value = {
      message: `Approaching/Exceeding credit limit (${utilizationPercent.toFixed(1)}%)`,
      currentBalance: currentBalance.toFixed(2),
      creditLimit: creditLimit.toFixed(2),
      invoiceAmount: invoiceAmount.toFixed(2),
      potentialBalance: potentialBalance.toFixed(2),
      utilizationPercent: utilizationPercent.toFixed(1),
      isExceeded: potentialBalance > creditLimit,
    };
    showCreditWarningBanner.value = true;
  } else {
    creditWarning.value = null;
    showCreditWarningBanner.value = false;
  }
};

// Watch SKU selection to set price
watch(selectedSku, newSku => {
  if (newSku) {
    const sku = skuOptions.value.find(s => s.id === newSku);
    if (sku) {
      itemPrice.value = parseFloat(sku.price) || 0;
      // Apply outlet default discount if available
      const outlet = selectedOutlet.value?.outlet;
      if (outlet && outlet.default_discount) {
        itemDiscount.value = parseFloat(outlet.default_discount) || 0;
      }
      // Validate stock when SKU changes
      validateStock();
    }
  }
});

// Watch quantity changes to validate stock
watch(itemQuantity, () => {
  validateStock();
});

// Phase 1: Watch outlet selection to check credit limit
watch(
  () => formData.value.outlet_id,
  newOutletId => {
    if (newOutletId && formData.value.payment_method === 'credit') {
      checkCreditLimit();
    }
  },
  { immediate: true }
);

// Phase 1: Watch payment method changes
watch(
  () => formData.value.payment_method,
  newMethod => {
    if (newMethod === 'credit' && formData.value.outlet_id) {
      checkCreditLimit();
    } else {
      creditWarning.value = null;
      showCreditWarningBanner.value = false;
    }
  }
);

// Phase 1: Watch grand total changes
watch(grandTotal, () => {
  if (formData.value.payment_method === 'credit' && formData.value.outlet_id) {
    checkCreditLimit();
  }
});

watch(returnSku, newSku => {
  if (newSku) {
    const sku = returnSkuOptions.value.find(s => s.id === newSku);
    if (sku) {
      itemPrice.value = parseFloat(sku.price) || 0;
    }
  }
});

// Methods
const onSearchOutlets = event => {
  const query = event.query.toLowerCase();
  if (!query) {
    filteredOutletOptions.value = outletOptions.value;
  } else {
    filteredOutletOptions.value = outletOptions.value.filter(outlet =>
      outlet.label.toLowerCase().includes(query)
    );
  }
};

const onOutletSelect = event => {
  if (event.value) {
    selectedOutlet.value = event.value;
    formData.value.outlet_id = event.value.value;
    onOutletChange();
  }
};

const onOutletChange = () => {
  const outlet = selectedOutlet.value?.outlet;
  if (outlet) {
    // Auto-populate Route
    if (outlet.route_id) {
      formData.value.route_id = outlet.route_id;

      // Auto-populate Sales Reference based on Route
      const route = routeStore.routes.find(r => r.id === outlet.route_id);
      if (route && route.sales_ref_id) {
        formData.value.sales_ref_id = route.sales_ref_id;
      } else if (!route) {
        // Show warning if outlet has no route assigned
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail:
            'Selected outlet has no territory assigned. Please assign a territory to this outlet.',
          life: 5000,
        });
      }
    } else {
      // Show warning if outlet has no route
      toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail:
          'Selected outlet has no territory assigned. Please assign a territory to this outlet.',
        life: 5000,
      });
    }
  }
};

const addSalesItem = () => {
  if (!selectedSku.value || itemQuantity.value <= 0 || itemPrice.value <= 0) {
    return;
  }

  // Validate stock before adding
  if (!validateStock()) {
    return;
  }

  const sku = skuOptions.value.find(s => s.id === selectedSku.value);
  const product = productStore.products.find(p => p.id === selectedProduct.value);

  if (!formData.value.items) {
    formData.value.items = [];
  }

  formData.value.items.push({
    sku_id: selectedSku.value,
    product_name: product.name,
    sku_label: `${sku.size}${sku.unit}`,
    quantity: itemQuantity.value,
    unit_price: itemPrice.value,
    discount_percent: itemDiscount.value,
    is_return: false,
  });

  // Reset
  selectedProduct.value = null;
  selectedSku.value = null;
  itemQuantity.value = 1;
  itemPrice.value = 0;
  itemDiscount.value = 0;
  stockError.value = '';
};

const addReturnItem = async () => {
  if (!returnSku.value || returnQuantity.value <= 0) {
    return;
  }

  // Legacy Returns: Check if user checked legacy return checkbox
  if (isLegacyReturn.value) {
    // Legacy return validation

    // 1. Require admin authorization (should already be set by watcher)
    if (!adminAuthData.value) {
      toast.add({
        severity: 'warn',
        summary: 'Authorization Required',
        detail: 'Please authorize with admin password first',
        life: 3000,
      });
      showAdminPasswordDialog.value = true;
      return;
    }

    // 2. Require reason explanation
    if (!returnPolicyOverrideReason.value.trim()) {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Legacy return requires an explanation',
        life: 3000,
      });
      return;
    }

    // All checks passed - add legacy return item
    const sku = returnSkuOptions.value.find(s => s.id === returnSku.value);
    const product = productStore.products.find(p => p.id === returnProduct.value);

    if (!formData.value.items) {
      formData.value.items = [];
    }

    formData.value.items.push({
      sku_id: returnSku.value,
      product_name: product.name,
      sku_label: `${sku.size}${sku.unit}`,
      quantity: returnQuantity.value,
      unit_price: sku.price,
      discount_percent: 0,
      is_return: true,
      return_reason: returnReason.value,
      return_to_stock: returnToStock.value,
      // Legacy return fields
      original_invoice_id: null, // Will be set to LEGACY-SYSTEM-SETUP by backend
      return_policy_override: true,
      return_policy_override_reason: returnPolicyOverrideReason.value,
      admin_id: adminAuthData.value.adminId, // Admin who authorized
      is_legacy: true, // Mark for UI display
    });

    toast.add({
      severity: 'success',
      summary: 'Legacy Return Added',
      detail: `Authorized by ${adminAuthData.value.adminName}`,
      life: 3000,
    });

    // Reset item fields but keep authorization for multiple items
    returnProduct.value = null;
    returnSku.value = null;
    returnQuantity.value = 1;
    returnReason.value = 'damaged';
    returnToStock.value = false;
    returnPolicyOverrideReason.value = '';
    // Note: Keep isLegacyReturn and adminAuthData to allow multiple legacy items

    return;
  }

  // REGULAR RETURN VALIDATION (existing logic)
  // Phase 2: Validate original invoice is selected
  if (!originalInvoiceId.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please select an original invoice for this return',
      life: 3000,
    });
    return;
  }

  // Phase 2: Show warning if return policy is exceeded (but allow the return)
  if (policyStatus.value && !policyStatus.value.isWithinPolicy) {
    toast.add({
      severity: 'warn',
      summary: 'Return Policy Warning',
      detail: `This return is outside the policy window (${policyStatus.value.daysSincePurchase} days, policy limit: ${policyStatus.value.policyLimit} days). Proceeding with return.`,
      life: 5000,
    });
  }

  const sku = returnSkuOptions.value.find(s => s.id === returnSku.value);
  const product = productStore.products.find(p => p.id === returnProduct.value);

  if (!formData.value.items) {
    formData.value.items = [];
  }

  formData.value.items.push({
    sku_id: returnSku.value,
    product_name: product.name,
    sku_label: `${sku.size}${sku.unit}`,
    quantity: returnQuantity.value,
    unit_price: sku.price,
    discount_percent: 0,
    is_return: true,
    return_reason: returnReason.value,
    return_to_stock: returnToStock.value,
    // Phase 2: Add return validation fields
    original_invoice_id: originalInvoiceId.value,
  });

  // Reset
  returnProduct.value = null;
  returnSku.value = null;
  returnQuantity.value = 1;
  returnReason.value = 'damaged';
  returnToStock.value = false;
  originalInvoiceId.value = null;
  originalInvoiceNumber.value = null;
  originalInvoiceDate.value = null;
  daysSincePurchase.value = null;
  purchaseHistory.value = null;
};

const removeItem = index => {
  formData.value.items.splice(index, 1);
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount || 0);
};

const handleSubmit = () => {
  if (!isFormValid.value) {
    return;
  }

  // Phase 1: Check credit limit before submit
  if (creditWarning.value && creditWarning.value.isExceeded) {
    // Show modal for admin override
    showCreditLimitModal.value = true;
    return;
  }

  // Clear legacy return authorization on submit
  adminAuthData.value = null;

  // Include invoice discount in form data
  formData.value.invoice_discount_percent = invoiceDiscountPercent.value || 0;

  emit('submit', formData.value);
};

// Phase 1: Handle admin override
const handleAdminOverride = () => {
  if (!creditOverrideReason.value.trim()) {
    return; // Modal will show validation
  }

  // Add override reason to form data
  formData.value.credit_limit_override_reason = creditOverrideReason.value;
  formData.value.invoice_discount_percent = invoiceDiscountPercent.value || 0;

  // Close modal and submit
  showCreditLimitModal.value = false;
  emit('submit', formData.value);
};

const cancelOverride = () => {
  showCreditLimitModal.value = false;
  creditOverrideReason.value = '';
};

const cancelForm = () => {
  // Clear legacy return authorization on cancel
  adminAuthData.value = null;
  isLegacyReturn.value = false;
  emit('cancel');
};

// Phase 2: Fetch purchase history for return validation
const fetchPurchaseHistory = async () => {
  if (!formData.value.outlet_id || !returnSku.value) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please select outlet and SKU first',
      life: 3000,
    });
    return;
  }

  loadingPurchaseHistory.value = true;
  try {
    const data = await salesService.getPurchaseHistory(formData.value.outlet_id, returnSku.value);
    purchaseHistory.value = data;
    showPurchaseHistoryDialog.value = true;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to fetch purchase history',
      life: 3000,
    });
  } finally {
    loadingPurchaseHistory.value = false;
  }
};

// Phase 2: Select original invoice from purchase history
const selectOriginalInvoice = invoice => {
  originalInvoiceId.value = invoice.invoice_id;
  originalInvoiceNumber.value = invoice.invoice_number;
  originalInvoiceDate.value = invoice.invoice_date;
  daysSincePurchase.value = invoice.days_since_purchase;
  showPurchaseHistoryDialog.value = false;

  // Check if return is within policy limits
  const policyDays = RETURN_POLICY[returnReason.value]?.days || 3;
  if (invoice.days_since_purchase > policyDays && authStore.user?.role !== 'admin') {
    toast.add({
      severity: 'warn',
      summary: 'Policy Warning',
      detail: `Return exceeds ${RETURN_POLICY[returnReason.value]?.description || 'policy limit'}. Admin override may be required.`,
      life: 5000,
    });
  }
};

// Phase 2: Computed - Get policy info for current return reason
const currentReturnPolicy = computed(() => {
  return RETURN_POLICY[returnReason.value] || RETURN_POLICY.other;
});

// Legacy Returns: Function to verify admin password
const verifyAdminPassword = async () => {
  if (!adminPassword.value.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please enter admin password',
      life: 3000,
    });
    return false;
  }

  verifyingPassword.value = true;

  try {
    const response = await fetch('/api/auth/verify-admin-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        password: adminPassword.value,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.add({
        severity: 'error',
        summary: 'Authorization Failed',
        detail: result.error || 'Invalid admin password',
        life: 3000,
      });
      return false;
    }

    // Store admin authorization data
    adminAuthData.value = {
      adminId: result.data.adminId,
      adminName: result.data.adminName,
      adminUsername: result.data.adminUsername,
    };

    toast.add({
      severity: 'success',
      summary: 'Authorized',
      detail: `Admin ${result.data.adminName} authorized this legacy return`,
      life: 3000,
    });

    showAdminPasswordDialog.value = false;
    adminPassword.value = '';
    return true;
  } catch (error) {
    console.error('Password verification error:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to verify admin password',
      life: 3000,
    });
    return false;
  } finally {
    verifyingPassword.value = false;
  }
};

// Phase 2: Computed - Policy status based on selected invoice and return reason
const policyStatus = computed(() => {
  if (!originalInvoiceId.value || daysSincePurchase.value === null) {
    return null; // No invoice selected yet
  }

  const policyLimit = currentReturnPolicy.value.days;
  const isWithinPolicy = daysSincePurchase.value <= policyLimit;

  return {
    isWithinPolicy,
    daysSincePurchase: daysSincePurchase.value,
    policyLimit,
    severity: isWithinPolicy ? 'success' : 'danger',
    icon: isWithinPolicy ? 'pi-check-circle' : 'pi-exclamation-triangle',
    label: isWithinPolicy ? 'Within Policy' : 'Policy Exceeded',
    message: isWithinPolicy
      ? `${daysSincePurchase.value} days ago (within ${policyLimit}-day limit)`
      : `${daysSincePurchase.value} days ago (exceeds ${policyLimit}-day limit)`,
  };
});

// Legacy Returns: Watch checkbox to trigger password dialog or clear authorization
watch(isLegacyReturn, newValue => {
  if (newValue) {
    // Checkbox enabled - show password dialog if not already authorized
    if (!adminAuthData.value) {
      showAdminPasswordDialog.value = true;
    }
  } else {
    // Checkbox disabled - clear authorization
    adminAuthData.value = null;
    returnPolicyOverrideReason.value = '';
  }
});

// Load data on mount
onMounted(async () => {
  // Load all outlets for dropdown
  const allOutlets = await outletStore.fetchAllOutlets();
  outletOptions.value = allOutlets.map(o => ({
    label: `${o.name} (${o.code})`,
    value: o.id,
    outlet: o,
  }));
  filteredOutletOptions.value = outletOptions.value;

  // Initialize selected outlet if already set
  if (formData.value.outlet_id) {
    const outlet = outletOptions.value.find(o => o.value === formData.value.outlet_id);
    if (outlet) {
      selectedOutlet.value = outlet;
    }
  }

  await Promise.all([
    (async () => {
      employeeStore.setFilters({ type: 'sales_ref', status: 'active' });
      await employeeStore.fetchEmployees();
    })(),
    routeStore.fetchRoutes({ status: 'active' }),
    productStore.fetchProducts({ status: 'active' }),
  ]);
});
</script>

<template>
  <div class="invoice-form">
    <TabView>
      <!-- Invoice Details Tab -->
      <TabPanel header="Invoice Details">
        <div class="form-grid">
          <div class="field">
            <label for="outlet">Outlet *</label>
            <AutoComplete
              id="outlet"
              v-model="selectedOutlet"
              :suggestions="filteredOutletOptions"
              field="label"
              option-label="label"
              placeholder="Search and select outlet"
              class="w-full"
              @complete="onSearchOutlets"
              @item-select="onOutletSelect"
            >
              <template #option="slotProps">
                <div>
                  <div class="font-semibold">
                    {{ slotProps.option.outlet.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ slotProps.option.outlet.code }} - {{ slotProps.option.outlet.address }}
                  </div>
                </div>
              </template>
            </AutoComplete>
          </div>

          <div class="field">
            <label for="sales_ref">Sales Reference <span class="required">*</span></label>
            <Dropdown
              id="sales_ref"
              v-model="formData.sales_ref_id"
              :options="employeeOptions"
              option-label="name"
              option-value="id"
              placeholder="Select Sales Rep"
              :filter="true"
              class="w-full"
              required
            >
              <template #value="slotProps">
                <div v-if="slotProps.value">
                  {{ employeeOptions.find(e => e.id === slotProps.value)?.name }}
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div>
                  {{ slotProps.option.name }}
                  <span class="text-sm text-gray-500">({{ slotProps.option.code }})</span>
                </div>
              </template>
            </Dropdown>
          </div>

          <div class="field">
            <label for="route">Territory</label>
            <Dropdown
              id="route"
              v-model="formData.route_id"
              :options="routeStore.routes"
              option-label="name"
              option-value="id"
              placeholder="Select Territory"
              :filter="true"
              class="w-full"
            >
              <template #option="slotProps">
                <div>
                  <div class="font-semibold">
                    {{ slotProps.option.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ slotProps.option.code }} - {{ slotProps.option.area }}
                  </div>
                </div>
              </template>
            </Dropdown>
          </div>

          <div class="field">
            <label for="invoice_date">Invoice Date *</label>
            <Calendar
              id="invoice_date"
              v-model="formData.invoice_date"
              date-format="yy-mm-dd"
              :show-icon="true"
              class="w-full"
            />
          </div>

          <div class="field">
            <label for="payment_method">Payment Method *</label>
            <Dropdown
              id="payment_method"
              v-model="formData.payment_method"
              :options="paymentMethodOptions"
              option-label="label"
              option-value="value"
              placeholder="Select Payment Method"
              class="w-full"
            />
          </div>

          <!-- Check Details (conditional) -->
          <template v-if="formData.payment_method === 'check'">
            <div class="field">
              <label for="check_number">Check Number</label>
              <InputText
                id="check_number"
                v-model="formData.check_number"
                placeholder="Enter check number"
                class="w-full"
              />
            </div>

            <div class="field">
              <label for="check_date">Check Date</label>
              <Calendar
                id="check_date"
                v-model="formData.check_date"
                date-format="yy-mm-dd"
                :show-icon="true"
                class="w-full"
              />
            </div>

            <div class="field">
              <label for="check_clearance_date">Check Clearance Date</label>
              <Calendar
                id="check_clearance_date"
                v-model="formData.check_clearance_date"
                date-format="yy-mm-dd"
                :show-icon="true"
                class="w-full"
              />
            </div>
          </template>
        </div>
      </TabPanel>

      <!-- Sales Items Tab -->
      <TabPanel header="Sales Items">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-3">Add Item</h3>
          <div class="add-item-form surface-ground-card">
            <small v-if="stockError" class="p-error">{{ stockError }}</small>
            <div class="form-row">
              <div class="field flex-1">
                <label for="product">Product</label>
                <Dropdown
                  id="product"
                  v-model="selectedProduct"
                  :options="productOptions"
                  option-label="name"
                  option-value="id"
                  placeholder="Select Product"
                  :filter="true"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="sku">SKU</label>
                <Dropdown
                  id="sku"
                  v-model="selectedSku"
                  :options="skuOptions"
                  option-value="id"
                  :disabled="!selectedProduct"
                  placeholder="Select SKU"
                  :class="{ 'p-invalid': stockError }"
                  class="w-full"
                >
                  <template #value="slotProps">
                    <div v-if="slotProps.value">
                      {{ skuOptions.find(s => s.id === slotProps.value)?.size
                      }}{{ skuOptions.find(s => s.id === slotProps.value)?.unit }}
                    </div>
                    <span v-else>{{ slotProps.placeholder }}</span>
                  </template>
                  <template #option="slotProps">
                    <div>
                      <div>{{ slotProps.option.size }}{{ slotProps.option.unit }}</div>
                      <div
                        class="text-sm"
                        :class="
                          slotProps.option.current_stock > 0 ? 'text-gray-500' : 'text-red-500'
                        "
                      >
                        Stock: {{ slotProps.option.current_stock || 0 }} | Price:
                        {{ formatCurrency(slotProps.option.price) }}
                      </div>
                    </div>
                  </template>
                </Dropdown>
              </div>

              <div class="field">
                <label for="quantity">Quantity</label>
                <InputNumber
                  id="quantity"
                  v-model="itemQuantity"
                  :min="1"
                  :class="{ 'p-invalid': stockError }"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="price">Unit Price</label>
                <InputNumber
                  id="price"
                  v-model="itemPrice"
                  mode="currency"
                  currency="LKR"
                  :min-fraction-digits="2"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="discount">Discount %</label>
                <InputNumber
                  id="discount"
                  v-model="itemDiscount"
                  :min="0"
                  :max="100"
                  suffix="%"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label>&nbsp;</label>
                <Button
                  icon="pi pi-plus"
                  label="Add"
                  :disabled="!selectedSku || itemQuantity <= 0 || !!stockError"
                  class="w-full"
                  @click="addSalesItem"
                />
              </div>
            </div>
          </div>
        </div>

        <DataTable :value="(formData.items || []).filter(item => !item.is_return)" class="mb-4">
          <template #empty>
            <div class="text-center p-4 text-gray-500">
              <i class="pi pi-inbox" style="font-size: 2rem" />
              <p>No items added yet</p>
            </div>
          </template>

          <Column field="product_name" header="Product" style="min-width: 200px">
            <template #body="slotProps">
              <div>
                <div class="font-semibold">
                  {{ slotProps.data.product_name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ slotProps.data.sku_label }}
                </div>
              </div>
            </template>
          </Column>

          <Column field="quantity" header="Quantity" style="width: 100px" />

          <Column field="unit_price" header="Unit Price" style="width: 140px">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.unit_price) }}
            </template>
          </Column>

          <Column field="discount_percent" header="Discount" style="width: 100px">
            <template #body="slotProps"> {{ slotProps.data.discount_percent }}% </template>
          </Column>

          <Column header="Subtotal" style="width: 140px">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.quantity * slotProps.data.unit_price) }}
            </template>
          </Column>

          <Column header="Discount Amt" style="width: 140px">
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

          <Column header="Total" style="width: 140px">
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

          <Column header="Actions" style="width: 100px">
            <template #body="slotProps">
              <Button
                v-tooltip.top="'Remove'"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                @click="removeItem(formData.items.indexOf(slotProps.data))"
              />
            </template>
          </Column>
        </DataTable>

        <!-- Phase 1: Credit Limit Warning Banner -->
        <div v-if="showCreditWarningBanner && creditWarning" class="field col-span-2">
          <div
            :class="[
              'px-4 py-3  rounded border-l-4',
              creditWarning.isExceeded
                ? 'bg-red-100 border-red-600'
                : 'bg-yellow-100 border-yellow-600',
            ]"
          >
            <div class="flex items-start">
              <div class="flex-1">
                <h4
                  :class="[
                    'font-semibold mb-2 font',
                    creditWarning.isExceeded ? 'text-red-700' : 'text-yellow-700',
                  ]"
                >
                  {{
                    creditWarning.isExceeded
                      ? '⛔ Credit Limit Exceeded'
                      : '⚠️ Credit Limit Warning'
                  }}
                </h4>
                <div class="flex justify-content-between">
                  <div>
                    <strong>Current Balance:</strong> Rs. {{ creditWarning.currentBalance }}
                  </div>
                  <div><strong>Credit Limit:</strong> Rs. {{ creditWarning.creditLimit }}</div>
                  <div><strong>This Invoice:</strong> Rs. {{ creditWarning.invoiceAmount }}</div>
                  <div
                    :class="
                      creditWarning.isExceeded ? 'text-red-700 font-semibold' : 'text-yellow-700'
                    "
                  >
                    <strong>New Balance:</strong> Rs. {{ creditWarning.potentialBalance }} ({{
                      creditWarning.utilizationPercent
                    }}%)
                  </div>
                </div>
                <div v-if="creditWarning.isExceeded" class="mt-3 text-sm text-red-700 text-center">
                  <i class="pi pi-info-circle mr-1" />
                  Admin authorization required to proceed with this invoice.
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- Returns Tab -->
      <TabPanel header="Returns">
        <!-- Phase 2: Return Policy Info Banner -->
        <div
          class="mb-4 p-3 border-l-4 rounded"
          :class="{
            'bg-blue-50 border-blue-500': !policyStatus,
            'bg-green-50 border-green-500': policyStatus && policyStatus.isWithinPolicy,
            'bg-red-50 border-red-500': policyStatus && !policyStatus.isWithinPolicy,
          }"
        >
          <div class="flex items-center gap-2">
            <i
              class="text-lg"
              :class="{
                'pi pi-info-circle text-blue-600': !policyStatus,
                'pi pi-check-circle text-green-600': policyStatus && policyStatus.isWithinPolicy,
                'pi pi-exclamation-triangle text-red-600':
                  policyStatus && !policyStatus.isWithinPolicy,
              }"
            />
            <div class="flex-1">
              <strong>Return Policy:</strong>
              {{ currentReturnPolicy.description }}

              <!-- Policy Status Display -->
              <div v-if="policyStatus" class="mt-2">
                <Tag
                  :severity="policyStatus.severity"
                  :icon="`pi ${policyStatus.icon}`"
                  class="mr-2"
                >
                  {{ policyStatus.label }}
                </Tag>
                <span class="text-sm">
                  Invoice: <strong>{{ originalInvoiceNumber }}</strong> | Date:
                  <strong>{{ originalInvoiceDate }}</strong> |
                  {{ policyStatus.message }}
                </span>

                <!-- Warning for policy exceeded -->
                <div
                  v-if="!policyStatus.isWithinPolicy"
                  class="mt-2 text-sm font-semibold text-orange-700"
                >
                  <i class="pi pi-info-circle mr-1" />
                  <span>
                    Note: This return is outside the policy window. You may proceed with the return.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-3">Add Return Item</h3>

          <!-- Legacy Return Checkbox & Authorization Status -->
          <div class="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded">
            <div class="field-checkbox mb-2">
              <Checkbox v-model="isLegacyReturn" input-id="legacy_return" binary />
              <label for="legacy_return" class="ml-2">
                <strong>⚠️ Legacy Return</strong> - No purchase history available (requires admin
                authorization)
              </label>
            </div>

            <!-- Authorization Status - Prominent Display -->
            <div
              v-if="isLegacyReturn && adminAuthData"
              class="mt-3 p-2 bg-green-100 border border-green-400 rounded"
            >
              <div class="flex align-items-center text-green-800">
                <i class="pi pi-check-circle mr-2 text-lg" />
                <div>
                  <strong>✓ Authorized</strong> by {{ adminAuthData.adminName }} ({{
                    adminAuthData.adminUsername
                  }})
                  <div class="text-xs text-green-700 mt-1">
                    You can now add multiple legacy return items without re-entering password
                  </div>
                </div>
              </div>
            </div>

            <!-- Waiting for Authorization -->
            <div
              v-if="isLegacyReturn && !adminAuthData"
              class="mt-3 p-2 bg-orange-100 border border-orange-400 rounded"
            >
              <div class="flex align-items-center text-orange-800">
                <i class="pi pi-lock mr-2 text-lg" />
                <div>
                  <strong>Waiting for admin authorization...</strong>
                  <div class="text-xs text-orange-700 mt-1">
                    Enter admin password to enable legacy returns
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="add-item-form">
            <!-- Row 1: Product and SKU Selection -->
            <div class="form-row mb-3">
              <div class="field flex-1">
                <label for="return_product">Product *</label>
                <Dropdown
                  id="return_product"
                  v-model="returnProduct"
                  :options="productOptions"
                  option-label="name"
                  option-value="id"
                  placeholder="Select Product"
                  :filter="true"
                  class="w-full"
                />
              </div>

              <div class="field flex-1">
                <label for="return_sku">SKU *</label>
                <Dropdown
                  id="return_sku"
                  v-model="returnSku"
                  :options="returnSkuOptions"
                  option-value="id"
                  :disabled="!returnProduct"
                  placeholder="Select SKU"
                  class="w-full"
                >
                  <template #value="slotProps">
                    <div v-if="slotProps.value">
                      {{ returnSkuOptions.find(s => s.id === slotProps.value)?.size
                      }}{{ returnSkuOptions.find(s => s.id === slotProps.value)?.unit }}
                    </div>
                    <span v-else>{{ slotProps.placeholder }}</span>
                  </template>
                  <template #option="slotProps">
                    <div>{{ slotProps.option.size }}{{ slotProps.option.unit }}</div>
                  </template>
                </Dropdown>
              </div>
            </div>

            <!-- Phase 2: Purchase History & Original Invoice Selection (hidden for legacy returns) -->
            <div v-if="!isLegacyReturn" class="mb-3 p-3 bg-gray-50 border rounded">
              <div class="flex gap-3 align-items-center">
                <div>
                  <Button
                    icon="pi pi-history"
                    label="Purchase History"
                    severity="info"
                    outlined
                    :disabled="!formData.outlet_id || !returnSku"
                    :loading="loadingPurchaseHistory"
                    @click="fetchPurchaseHistory"
                  />
                  <div>
                    <small v-if="!formData.outlet_id || !returnSku" class="text-orange-600">
                      <i class="pi pi-info-circle mr-1" />Select outlet (in Invoice Details tab) and
                      SKU to enable Purchase History lookup
                    </small>
                    <small v-else class="text-gray-600">
                      Click "Purchase History" to find the original purchase invoice for this return
                    </small>
                  </div>
                </div>

                <div class="field flex-1 mb-0">
                  <label for="original_invoice" class="flex justify-content-between"
                    >Original Invoice Number *
                    <small v-if="originalInvoiceId" class="text-gray-600">
                      Invoice ID: {{ originalInvoiceId }}
                    </small></label
                  >
                  <InputText
                    id="original_invoice"
                    v-model="originalInvoiceNumber"
                    placeholder="Select from Purchase History"
                    class="w-full"
                    disabled
                  />
                </div>
              </div>
            </div>

            <!-- Legacy Return Warning Banner -->
            <div v-else class="mb-3 p-3 bg-amber-100 border border-amber-400 rounded">
              <div class="flex align-items-center text-amber-800">
                <i class="pi pi-exclamation-triangle mr-2 text-xl" />
                <div>
                  <strong>Legacy Return Mode:</strong> This return is for a purchase made before the
                  system was implemented. Admin authorization required.
                </div>
              </div>
            </div>

            <!-- Row 2: Quantity, Reason, Return to Stock -->
            <div class="form-row mb-3">
              <div class="field" style="width: 120px">
                <label for="return_quantity">Quantity *</label>
                <InputNumber
                  id="return_quantity"
                  v-model="returnQuantity"
                  :min="1"
                  class="w-full"
                />
              </div>

              <div class="field flex-1">
                <label for="return_reason">Reason *</label>
                <Dropdown
                  id="return_reason"
                  v-model="returnReason"
                  :options="returnReasonOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select Reason"
                  class="w-full"
                />
              </div>

              <div class="field" style="width: 150px">
                <label for="return_to_stock">Return to Stock</label>
                <div class="flex align-items-center h-full">
                  <input
                    id="return_to_stock"
                    v-model="returnToStock"
                    type="checkbox"
                    class="mr-2"
                  />
                  <label for="return_to_stock" class="mb-0">Add back to stock</label>
                </div>
              </div>
            </div>

            <!-- Legacy Return Explanation (required for all users) -->
            <div
              v-if="isLegacyReturn"
              class="mb-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded"
            >
              <div class="field mb-0">
                <label for="legacy_reason">Explanation <span class="text-red-500">*</span></label>
                <Textarea
                  id="legacy_reason"
                  v-model="returnPolicyOverrideReason"
                  rows="2"
                  placeholder="Explain why this return has no purchase history (e.g., 'Purchase made before system implementation')"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Add Button -->
            <div class="flex justify-content-end">
              <Button
                icon="pi pi-plus"
                label="Add Return Item"
                :disabled="!returnSku || returnQuantity <= 0"
                @click="addReturnItem"
              />
            </div>
          </div>
        </div>

        <DataTable :value="(formData.items || []).filter(item => item.is_return)" class="mb-4">
          <template #empty>
            <div class="text-center p-4 text-gray-500">
              <i class="pi pi-inbox" style="font-size: 2rem" />
              <p>No return items added</p>
            </div>
          </template>

          <Column field="product_name" header="Product" style="min-width: 200px">
            <template #body="slotProps">
              <div>
                <div class="font-semibold">
                  {{ slotProps.data.product_name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ slotProps.data.sku_label }}
                </div>
              </div>
            </template>
          </Column>

          <Column field="quantity" header="Quantity" style="width: 100px" />

          <Column field="unit_price" header="Unit Price" style="width: 140px">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.unit_price) }}
            </template>
          </Column>

          <Column field="return_reason" header="Reason" style="width: 150px">
            <template #body="slotProps">
              {{ returnReasonOptions.find(r => r.value === slotProps.data.return_reason)?.label }}
            </template>
          </Column>

          <Column field="return_to_stock" header="To Stock" style="width: 100px">
            <template #body="slotProps">
              <i v-if="slotProps.data.return_to_stock" class="pi pi-check text-green-500" />
              <i v-else class="pi pi-times text-red-500" />
            </template>
          </Column>

          <Column header="Total" style="width: 140px">
            <template #body="slotProps">
              <div class="font-semibold text-red-500">
                -{{ formatCurrency(slotProps.data.quantity * slotProps.data.unit_price) }}
              </div>
            </template>
          </Column>

          <Column header="Actions" style="width: 100px">
            <template #body="slotProps">
              <Button
                v-tooltip.top="'Remove'"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                @click="removeItem(formData.items.indexOf(slotProps.data))"
              />
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- Summary Tab -->
      <TabPanel header="Summary & Notes">
        <div class="summary-section">
          <!-- Invoice Discount Input -->
          <div class="mb-4 p-3 surface-ground border-round">
            <label for="invoice_discount" class="font-semibold block mb-2">
              Invoice Discount (%)
              <span class="text-sm font-normal text-gray-500 ml-2">
                Applied to net amount after item discounts and returns. Max recommended: 40%
              </span>
            </label>
            <div class="flex align-items-center gap-3">
              <InputNumber
                id="invoice_discount"
                v-model="invoiceDiscountPercent"
                :min="0"
                :max="100"
                :min-fraction-digits="0"
                :max-fraction-digits="2"
                suffix="%"
                class="w-12rem"
              />
              <span v-if="invoiceDiscountAmount > 0" class="text-sm">
                = {{ formatCurrency(invoiceDiscountAmount) }} discount
              </span>
            </div>
            <div
              v-if="invoiceDiscountWarning"
              class="mt-2 p-2 bg-orange-100 border-left-3 border-orange-500 border-round text-orange-800 text-sm"
            >
              <i class="pi pi-exclamation-triangle mr-1" />
              Warning: Discount exceeds {{ MAX_INVOICE_DISCOUNT }}% of the invoice total. Please
              verify this is intentional.
            </div>
          </div>

          <div class="totals-grid">
            <div class="total-row">
              <span class="total-label">Subtotal (Sales):</span>
              <span class="total-value">{{ formatCurrency(subtotal) }}</span>
            </div>

            <div class="total-row">
              <span class="total-label">Total Item Discount:</span>
              <span class="total-value text-red-500">-{{ formatCurrency(totalDiscount) }}</span>
            </div>

            <div v-if="invoiceDiscountAmount > 0" class="total-row">
              <span class="total-label">Invoice Discount ({{ invoiceDiscountPercent }}%):</span>
              <span class="total-value text-red-500"
                >-{{ formatCurrency(invoiceDiscountAmount) }}</span
              >
            </div>

            <div v-if="returnsTotal > 0" class="total-row">
              <span class="total-label">Returns Total:</span>
              <span class="total-value text-red-500">-{{ formatCurrency(returnsTotal) }}</span>
            </div>

            <div class="total-row grand-total">
              <span class="total-label">Grand Total:</span>
              <span class="total-value">{{ formatCurrency(grandTotal) }}</span>
            </div>
          </div>

          <div class="field mt-4">
            <label for="notes">Notes</label>
            <Textarea
              id="notes"
              v-model="formData.notes"
              rows="4"
              placeholder="Add any notes or comments..."
              class="w-full"
            />
          </div>
        </div>
      </TabPanel>
    </TabView>

    <div class="form-actions">
      <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="cancelForm" />
      <div class="flex flex-column align-items-end" style="flex: 1">
        <small v-if="hasInsufficientStock" class="p-error mb-2">
          Cannot submit: Some items have insufficient stock
        </small>
        <Button
          label="Submit Invoice"
          icon="pi pi-check"
          :disabled="!isFormValid"
          @click="handleSubmit"
        />
      </div>
    </div>

    <!-- Phase 1: Credit Limit Override Modal -->
    <Dialog
      v-model:visible="showCreditLimitModal"
      modal
      :closable="false"
      :style="{ width: '600px' }"
    >
      <template #header>
        <div class="flex items-center">
          <i class="pi pi-exclamation-triangle text-red-500 text-2xl mr-3" />
          <h3 class="text-xl font-semibold">Credit Limit Exceeded - Admin Override Required</h3>
        </div>
      </template>

      <div v-if="creditWarning" class="space-y-4">
        <div class="bg-red-50 border border-red-200 rounded p-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <strong>Current Balance:</strong>
              <div class="text-lg">Rs. {{ creditWarning.currentBalance }}</div>
            </div>
            <div>
              <strong>Credit Limit:</strong>
              <div class="text-lg">Rs. {{ creditWarning.creditLimit }}</div>
            </div>
            <div>
              <strong>This Invoice:</strong>
              <div class="text-lg">Rs. {{ creditWarning.invoiceAmount }}</div>
            </div>
            <div>
              <strong>New Balance:</strong>
              <div class="text-lg font-semibold text-red-700">
                Rs. {{ creditWarning.potentialBalance }}
                <span class="text-base">({{ creditWarning.utilizationPercent }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label for="override_reason" class="font-semibold">
            Admin Override Reason *
            <small class="text-gray-500 font-normal ml-2">
              (Required - Explain why exceeding credit limit is acceptable)
            </small>
          </label>
          <Textarea
            id="override_reason"
            v-model="creditOverrideReason"
            rows="4"
            placeholder="e.g., Customer has pending payment arriving tomorrow, One-time exception for VIP client, Large order with special approval, etc."
            class="w-full"
          />
          <small v-if="!creditOverrideReason.trim()" class="p-error">
            Override reason is required
          </small>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="cancelOverride" />
        <Button
          label="Authorize & Submit"
          icon="pi pi-check"
          severity="danger"
          :disabled="!creditOverrideReason.trim()"
          @click="handleAdminOverride"
        />
      </template>
    </Dialog>

    <!-- Phase 2: Purchase History Dialog -->
    <Dialog
      v-model:visible="showPurchaseHistoryDialog"
      modal
      header="Purchase History"
      :style="{ width: '900px' }"
    >
      <div v-if="purchaseHistory" class="space-y-3">
        <div class="bg-blue-50 border border-blue-200 rounded p-3">
          <div class="grid grid-cols-3 gap-3 text-sm">
            <div><strong>Product:</strong> {{ purchaseHistory.product?.name }}</div>
            <div><strong>Outlet ID:</strong> {{ purchaseHistory.outlet_id }}</div>
            <div><strong>SKU ID:</strong> {{ purchaseHistory.sku_id }}</div>
          </div>
        </div>

        <DataTable
          :value="purchaseHistory.purchases || []"
          selection-mode="single"
          @row-select="event => selectOriginalInvoice(event.data)"
        >
          <template #empty>
            <div class="text-center p-4 text-gray-500">
              <i class="pi pi-info-circle" style="font-size: 2rem" />
              <p>No purchase history found for this outlet and SKU</p>
            </div>
          </template>

          <Column field="invoice_number" header="Invoice #" style="width: 150px" />
          <Column field="invoice_date" header="Date" style="width: 120px" />
          <Column field="quantity" header="Purchased" style="width: 100px" />
          <Column field="already_returned" header="Returned" style="width: 100px">
            <template #body="{ data }">
              <Tag v-if="data.already_returned > 0" severity="warning">
                {{ data.already_returned }}
              </Tag>
              <span v-else class="text-gray-500">0</span>
            </template>
          </Column>
          <Column field="can_return" header="Can Return" style="width: 100px">
            <template #body="{ data }">
              <Tag :severity="data.can_return > 0 ? 'success' : 'danger'">
                {{ data.can_return }}
              </Tag>
            </template>
          </Column>
          <Column field="days_since_purchase" header="Days Ago" style="width: 100px">
            <template #body="{ data }">
              <Tag
                :severity="
                  data.days_since_purchase <= currentReturnPolicy.days ? 'success' : 'danger'
                "
              >
                {{ data.days_since_purchase }} days
              </Tag>
            </template>
          </Column>
          <Column field="unit_price" header="Price" style="width: 120px">
            <template #body="{ data }"> Rs. {{ parseFloat(data.unit_price).toFixed(2) }} </template>
          </Column>
          <Column header="Status" style="width: 140px">
            <template #body="{ data }">
              <Tag
                v-if="data.days_since_purchase > currentReturnPolicy.days"
                severity="danger"
                value="Out of Policy"
              />
              <Tag v-else-if="data.can_return <= 0" severity="warning" value="Fully Returned" />
              <Tag v-else severity="success" value="Eligible" />
            </template>
          </Column>
        </DataTable>

        <small class="text-gray-600">
          <i class="pi pi-info-circle" /> Click on a row to select as original invoice for this
          return
        </small>
      </div>

      <template #footer>
        <Button
          label="Close"
          icon="pi pi-times"
          severity="secondary"
          @click="showPurchaseHistoryDialog = false"
        />
      </template>
    </Dialog>

    <!-- Legacy Return: Admin Password Dialog -->
    <Dialog
      v-model:visible="showAdminPasswordDialog"
      modal
      header="Admin Authorization Required"
      :style="{ width: '500px' }"
      :closable="true"
    >
      <div class="space-y-3">
        <div class="bg-amber-50 border border-amber-300 rounded p-3">
          <p class="text-amber-800 mb-2">
            <i class="pi pi-exclamation-triangle mr-2" />
            <strong>Legacy Return Detected</strong>
          </p>
          <p class="text-sm text-amber-700">
            This return has no purchase history in the system. An admin must authorize this action
            by entering their password.
          </p>
        </div>

        <div class="field mb-0">
          <label for="admin_password">Admin Password <span class="text-red-500">*</span></label>
          <Password
            id="admin_password"
            v-model="adminPassword"
            placeholder="Enter admin password"
            :feedback="false"
            toggle-mask
            class="w-full"
            @keyup.enter="verifyAdminPassword"
          />
          <small class="text-gray-600"
            >Any admin can authorize this legacy return by entering their password</small
          >
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          @click="showAdminPasswordDialog = false"
        />
        <Button
          label="Authorize"
          icon="pi pi-check"
          severity="success"
          :loading="verifyingPassword"
          :disabled="!adminPassword.trim()"
          @click="verifyAdminPassword"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-inputnumber-input) {
  width: 120px;
}
.invoice-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.add-item-form {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.summary-section {
  padding: 1.5rem;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
