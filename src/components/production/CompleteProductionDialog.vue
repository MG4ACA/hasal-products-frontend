<template>
  <Dialog
    v-model:visible="dialogVisible"
    :style="{ width: '800px' }"
    header="Complete Production Run"
    :modal="true"
    :closable="!loading"
  >
    <div v-if="productionRun" class="grid">
      <!-- Production Run Info -->
      <div class="col-12">
        <Card class="surface-100 mb-3">
          <template #content>
            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="text-sm text-500">Batch Number</div>
                <div class="font-semibold">
                  {{ productionRun.batch_number }}
                </div>
              </div>
              <div class="col-12 md:col-6">
                <div class="text-sm text-500">Recipe</div>
                <div class="font-semibold">
                  {{ productionRun.recipe?.name }} (v{{ productionRun.recipe?.version }})
                </div>
              </div>
              <div class="col-12 md:col-6">
                <div class="text-sm text-500">Target SKU</div>
                <div class="font-semibold">
                  {{ productionRun.recipe?.product?.name || productionRun.recipe?.productSku?.product?.name }}
                  <span v-if="productionRun.recipe?.productSku">
                    -
                    {{
                      productionRun.recipe.productSku.is_loose
                        ? 'Loose'
                        : productionRun.recipe.productSku.size
                    }}
                    {{ productionRun.recipe.productSku.unit }}
                  </span>
                  <span v-else class="text-500 font-normal"> (no default SKU)</span>
                </div>
              </div>
              <div class="col-12 md:col-6">
                <div class="text-sm text-500">Expected Output</div>
                <div class="font-semibold text-primary text-lg">
                  {{ formatNumber(productionRun.expected_quantity || productionRun.quantity) }}
                  {{ productionRun.recipe?.yield_unit }}
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Output Allocations -->
      <div class="col-12">
        <div class="flex justify-content-between align-items-center mb-2">
          <label class="font-semibold">
            Output Allocations <span class="text-red-500">*</span>
          </label>
          <Button
            label="Add Output Row"
            icon="pi pi-plus"
            size="small"
            text
            :disabled="loading || !productSkus.length"
            @click="addOutput"
          />
        </div>
        <DataTable :value="outputs" class="p-datatable-sm">
          <Column header="SKU" style="min-width: 220px">
            <template #body="{ index }">
              <Select
                v-model="outputs[index].sku_id"
                :options="productSkus"
                option-label="label"
                option-value="id"
                placeholder="Select SKU"
                class="w-full"
                :disabled="loading"
              />
            </template>
          </Column>
          <Column header="Quantity" style="width: 200px">
            <template #body="{ index }">
              <InputNumber
                v-model="outputs[index].quantity"
                mode="decimal"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
                :min="0"
                class="w-full"
                :disabled="loading"
              />
            </template>
          </Column>
          <Column style="width: 60px">
            <template #body="{ index }">
              <Button
                icon="pi pi-trash"
                text
                severity="danger"
                size="small"
                :disabled="loading || outputs.length <= 1"
                @click="removeOutput(index)"
              />
            </template>
          </Column>
          <template #empty>
            <div class="text-center text-500 py-3">
              No output rows. Click "Add Output Row" to add one.
            </div>
          </template>
        </DataTable>
        <small class="text-500 block mt-1">
          Total allocated: <strong>{{ totalOutputQuantity.toFixed(2) }}</strong>
          {{ productionRun.recipe?.yield_unit }}
        </small>
      </div>

      <!-- Waste (auto-calculated, read-only) -->
      <div class="col-12 md:col-6">
        <label class="block mb-2">
          Waste / Loss <span class="text-500">(auto-calculated)</span>
        </label>
        <InputNumber
          :model-value="autoWaste"
          class="w-full"
          mode="decimal"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          disabled
        />
        <small class="text-500">= Expected Output − Total Allocated</small>
      </div>

      <!-- Waste Reason -->
      <div class="col-12 md:col-6">
        <label for="waste_reason" class="block mb-2">
          Waste Reason <span class="text-500">(if waste > 0)</span>
        </label>
        <Dropdown
          id="waste_reason"
          v-model="formData.waste_reason"
          :options="wasteReasonOptions"
          placeholder="Select reason"
          class="w-full"
          :disabled="loading || autoWaste <= 0"
          show-clear
        />
      </div>

      <!-- Production Date -->
      <div class="col-12 md:col-6">
        <label for="production_date" class="block mb-2">Production Date</label>
        <Calendar
          id="production_date"
          v-model="formData.production_date"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
          :disabled="loading"
        />
      </div>

      <!-- Notes -->
      <div class="col-12 md:col-6">
        <label for="notes" class="block mb-2">Notes</label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          rows="2"
          class="w-full"
          placeholder="Additional notes..."
          :disabled="loading"
        />
      </div>

      <!-- Yield Efficiency Indicator -->
      <div v-if="totalOutputQuantity > 0" class="col-12">
        <Card :class="yieldEfficiencyClass">
          <template #content>
            <div class="grid">
              <div class="col-3">
                <div class="text-sm text-500">Yield Efficiency</div>
                <div class="text-2xl font-bold">{{ yieldEfficiency.toFixed(2) }}%</div>
              </div>
              <div class="col-3">
                <div class="text-sm text-500">Total Output</div>
                <div class="text-lg font-semibold">
                  {{ totalOutput.toFixed(2) }} {{ productionRun.recipe?.yield_unit }}
                </div>
              </div>
              <div class="col-3">
                <div class="text-sm text-500">Variance</div>
                <div
                  class="text-lg font-semibold"
                  :class="varianceAmount >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ varianceAmount >= 0 ? '+' : '' }}{{ varianceAmount.toFixed(2) }}
                  {{ productionRun.recipe?.yield_unit }}
                </div>
              </div>
              <div class="col-3">
                <div class="text-sm text-500">Waste %</div>
                <div
                  class="text-lg font-semibold"
                  :class="wastePercentage > 0 ? 'text-orange-600' : ''"
                >
                  {{ wastePercentage.toFixed(2) }}%
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Info Message -->
      <div class="col-12">
        <Message severity="info" :closable="false">
          <div>
            <strong>Note:</strong> Completing this production will:
            <ul class="mt-2 ml-4">
              <li>Generate a unique finished goods batch number</li>
              <li>Calculate actual production cost using FIFO</li>
              <li>Update SKU average cost (weighted average)</li>
              <li>Track waste cost separately for reporting</li>
              <li>Calculate yield efficiency metrics</li>
            </ul>
          </div>
        </Message>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text :disabled="loading" @click="handleCancel" />
      <Button
        label="Complete Production"
        icon="pi pi-check"
        :loading="loading"
        :disabled="totalOutputQuantity <= 0 || !outputs.every(o => o.sku_id && o.quantity > 0)"
        @click="handleComplete"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import productionService from '@/services/productionService';
import productService from '@/services/productService';
import { formatNumber } from '@/utils/formatters';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  productionRun: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:visible', 'completed']);

const { showSuccess, showError } = useToastNotification();
const loading = ref(false);
const productSkus = ref([]);
const outputs = ref([{ sku_id: null, quantity: 0 }]);

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
});

const wasteReasonOptions = [
  'Spillage',
  'Contamination',
  'Quality defect',
  'Equipment malfunction',
  'Overproduction',
  'Expired materials',
  'Other',
];

const formData = ref({
  waste_reason: '',
  production_date: new Date(),
  notes: '',
});

const totalOutputQuantity = computed(() =>
  outputs.value.reduce((sum, o) => sum + parseFloat(o.quantity || 0), 0)
);

const autoWaste = computed(() => {
  const expected = parseFloat(
    props.productionRun?.expected_quantity || props.productionRun?.quantity || 0
  );
  return Math.max(0, expected - totalOutputQuantity.value);
});

const totalOutput = computed(() => totalOutputQuantity.value + autoWaste.value);

const yieldEfficiency = computed(() => {
  const expected = parseFloat(
    props.productionRun?.expected_quantity || props.productionRun?.quantity || 0
  );
  if (expected === 0) return 0;
  return (totalOutputQuantity.value / expected) * 100;
});

const varianceAmount = computed(() => {
  const expected = parseFloat(
    props.productionRun?.expected_quantity || props.productionRun?.quantity || 0
  );
  return totalOutputQuantity.value - expected;
});

const wastePercentage = computed(() => {
  const total = totalOutput.value;
  if (total === 0) return 0;
  return (autoWaste.value / total) * 100;
});

const yieldEfficiencyClass = computed(() => {
  const eff = yieldEfficiency.value;
  if (eff >= 95) return 'border-1 border-green-500';
  if (eff >= 85) return 'border-1 border-blue-500';
  if (eff >= 75) return 'border-1 border-orange-500';
  return 'border-1 border-red-500';
});

const getYieldEfficiencyClass = () => {
  const eff = yieldEfficiency.value;
  if (eff >= 95) return 'surface-green-100';
  if (eff >= 85) return 'surface-blue-100';
  if (eff >= 75) return 'surface-orange-100';
  return 'surface-red-100';
};

const getYieldEfficiencyLabel = () => {
  const eff = yieldEfficiency.value;
  if (eff >= 95) return 'Excellent';
  if (eff >= 85) return 'Good';
  if (eff >= 75) return 'Fair';
  return 'Poor';
};

const getVarianceClass = () => {
  const variance = varianceAmount.value;
  if (variance > 0) return 'text-green-600';
  if (variance < 0) return 'text-red-600';
  return 'text-500';
};

const fetchSkus = async productId => {
  try {
    const product = await productService.getById(productId);
    if (product && product.skus) {
      productSkus.value = product.skus
        .filter(s => s.status === 'active')
        .map(s => ({
          id: s.id,
          label: s.is_loose ? `Loose / Bulk (${s.unit})` : `${s.size} ${s.unit}`,
        }));
    }
  } catch {
    productSkus.value = [];
  }
};

const initOutputs = run => {
  if (run?.recipe?.product_sku_id) {
    outputs.value = [
      {
        sku_id: run.recipe.product_sku_id,
        quantity: parseFloat(run.expected_quantity || run.quantity || 0),
      },
    ];
  } else {
    outputs.value = [{ sku_id: null, quantity: 0 }];
  }
};

watch(
  () => props.productionRun,
  newVal => {
    if (newVal) {
      formData.value = {
        waste_reason: '',
        production_date: newVal.production_date ? new Date(newVal.production_date) : new Date(),
        notes: '',
      };
      initOutputs(newVal);
      
      if (newVal.recipe?.productSku?.product?.id) {
        fetchSkus(newVal.recipe.productSku.product.id);
      } else if (newVal.recipe?.product?.id) {
        // Fallback just in case some other controller includes product directly
        fetchSkus(newVal.recipe.product.id);
      }
    }
  },
  { immediate: true }
);

const addOutput = () => {
  outputs.value.push({ sku_id: null, quantity: 0 });
};

const removeOutput = index => {
  outputs.value.splice(index, 1);
};

const handleComplete = async () => {
  if (totalOutputQuantity.value <= 0) {
    showError('Please enter actual output quantity in at least one output row');
    return;
  }

  const invalidRow = outputs.value.find(o => !o.sku_id || !(o.quantity > 0));
  if (invalidRow) {
    showError('All output rows must have a SKU selected and quantity > 0');
    return;
  }

  if (autoWaste.value > 0 && !formData.value.waste_reason) {
    showError('Please provide a waste reason — there is unaccounted output');
    return;
  }

  loading.value = true;
  try {
    const completionData = {
      quantity_produced: totalOutputQuantity.value,
      waste_quantity: autoWaste.value,
      waste_reason: formData.value.waste_reason || '',
      production_date: formData.value.production_date.toISOString().split('T')[0],
      notes: formData.value.notes || '',
      outputs: outputs.value.map(o => ({ sku_id: o.sku_id, quantity: o.quantity })),
    };

    await productionService.complete(props.productionRun.id, completionData);
    showSuccess('Production run completed successfully');
    emit('update:visible', false);
    emit('completed');
  } catch (error) {
    showError(error.response?.data?.message || 'Failed to complete production run');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.surface-100 {
  background-color: var(--surface-100);
}
</style>
