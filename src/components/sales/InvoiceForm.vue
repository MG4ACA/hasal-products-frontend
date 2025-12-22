<script setup>
import { useEmployeeStore } from '@/stores/employee';
import { useOutletStore } from '@/stores/outlet';
import { useProductStore } from '@/stores/product';
import { useRouteStore } from '@/stores/route';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Textarea from 'primevue/textarea';
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

// Form data
const formData = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

// Options
const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Credit', value: 'credit' },
  { label: 'Check', value: 'check' },
];

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

// Computed
const productOptions = computed(() => productStore.products || []);
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

const selectedOutlet = computed(() => {
  if (!formData.value.outlet_id) return null;
  return outletStore.outlets.find(o => o.id === formData.value.outlet_id);
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
  return subtotal.value - totalDiscount.value - returnsTotal.value;
});

const isFormValid = computed(() => {
  return (
    formData.value.outlet_id &&
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

// Watch SKU selection to set price
watch(selectedSku, newSku => {
  if (newSku) {
    const sku = skuOptions.value.find(s => s.id === newSku);
    if (sku) {
      itemPrice.value = sku.price;
      // Apply outlet default discount if available
      if (selectedOutlet.value && selectedOutlet.value.default_discount) {
        itemDiscount.value = selectedOutlet.value.default_discount;
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

watch(returnSku, newSku => {
  if (newSku) {
    const sku = returnSkuOptions.value.find(s => s.id === newSku);
    if (sku) {
      itemPrice.value = sku.price;
    }
  }
});

// Methods
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

const addReturnItem = () => {
  if (!returnSku.value || returnQuantity.value <= 0) {
    return;
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
  });

  // Reset
  returnProduct.value = null;
  returnSku.value = null;
  returnQuantity.value = 1;
  returnReason.value = 'damaged';
  returnToStock.value = false;
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
  if (isFormValid.value) {
    emit('submit', formData.value);
  }
};

// Load data on mount
onMounted(async () => {
  await Promise.all([
    outletStore.fetchOutlets({ status: 'active' }),
    employeeStore.fetchEmployees({ type: 'sales_ref', status: 'active' }),
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
            <Dropdown
              id="outlet"
              v-model="formData.outlet_id"
              :options="outletStore.outlets"
              option-label="name"
              option-value="id"
              placeholder="Select Outlet"
              :filter="true"
              class="w-full"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value">
                  {{ outletStore.outlets.find(o => o.id === slotProps.value)?.name }}
                  ({{ outletStore.outlets.find(o => o.id === slotProps.value)?.code }})
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div>
                  <div class="font-semibold">
                    {{ slotProps.option.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ slotProps.option.code }} - {{ slotProps.option.address }}
                  </div>
                </div>
              </template>
            </Dropdown>
          </div>

          <div class="field">
            <label for="sales_ref">Sales Reference</label>
            <Dropdown
              id="sales_ref"
              v-model="formData.sales_ref_id"
              :options="employeeStore.employees"
              option-label="first_name"
              option-value="id"
              placeholder="Select Sales Rep"
              :filter="true"
              class="w-full"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value">
                  {{ employeeStore.employees.find(e => e.id === slotProps.value)?.first_name }}
                  {{ employeeStore.employees.find(e => e.id === slotProps.value)?.last_name }}
                </div>
                <span v-else>{{ slotProps.placeholder }}</span>
              </template>
              <template #option="slotProps">
                <div>
                  {{ slotProps.option.first_name }} {{ slotProps.option.last_name }}
                  <span class="text-sm text-gray-500">({{ slotProps.option.employee_code }})</span>
                </div>
              </template>
            </Dropdown>
          </div>

          <div class="field">
            <label for="route">Route</label>
            <Dropdown
              id="route"
              v-model="formData.route_id"
              :options="routeStore.routes"
              option-label="name"
              option-value="id"
              placeholder="Select Route"
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
          <div class="add-item-form">
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

              <div class="field flex-1">
                <label for="sku">SKU</label>
                <Dropdown
                  id="sku"
                  v-model="selectedSku"
                  :options="skuOptions"
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
                <small v-if="stockError" class="p-error">{{ stockError }}</small>
              </div>

              <div class="field" style="width: 120px">
                <label for="quantity">Quantity</label>
                <InputNumber
                  id="quantity"
                  v-model="itemQuantity"
                  :min="1"
                  :class="{ 'p-invalid': stockError }"
                  class="w-full"
                />
              </div>

              <div class="field" style="width: 140px">
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

              <div class="field" style="width: 120px">
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

              <div class="field" style="width: 100px">
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
      </TabPanel>

      <!-- Returns Tab -->
      <TabPanel header="Returns">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-3">Add Return Item</h3>
          <div class="add-item-form">
            <div class="form-row">
              <div class="field flex-1">
                <label for="return_product">Product</label>
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
                <label for="return_sku">SKU</label>
                <Dropdown
                  id="return_sku"
                  v-model="returnSku"
                  :options="returnSkuOptions"
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

              <div class="field" style="width: 120px">
                <label for="return_quantity">Quantity</label>
                <InputNumber
                  id="return_quantity"
                  v-model="returnQuantity"
                  :min="1"
                  class="w-full"
                />
              </div>

              <div class="field flex-1">
                <label for="return_reason">Reason</label>
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

              <div class="field" style="width: 100px">
                <label>&nbsp;</label>
                <Button
                  icon="pi pi-plus"
                  label="Add"
                  :disabled="!returnSku || returnQuantity <= 0"
                  class="w-full"
                  @click="addReturnItem"
                />
              </div>
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
          <div class="totals-grid">
            <div class="total-row">
              <span class="total-label">Subtotal (Sales):</span>
              <span class="total-value">{{ formatCurrency(subtotal) }}</span>
            </div>

            <div class="total-row">
              <span class="total-label">Total Discount:</span>
              <span class="total-value text-red-500">-{{ formatCurrency(totalDiscount) }}</span>
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
      <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="$emit('cancel')" />
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
  </div>
</template>

<style scoped>
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
