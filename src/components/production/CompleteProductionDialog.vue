<template>
  <Dialog
    v-model:visible="visible"
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
              <div class="col-6">
                <div class="text-sm text-500">Batch Number</div>
                <div class="font-semibold">
                  {{ productionRun.batch_number }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-sm text-500">Recipe</div>
                <div class="font-semibold">
                  {{ productionRun.recipe?.name }} (v{{ productionRun.recipe?.version }})
                </div>
              </div>
              <div class="col-6">
                <div class="text-sm text-500">Expected Output</div>
                <div class="font-semibold">
                  {{ productionRun.expected_quantity || productionRun.quantity }}
                  {{ productionRun.unit }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-sm text-500">Target SKU</div>
                <div class="font-semibold">
                  {{ productionRun.recipe?.product?.name }} -
                  {{ productionRun.recipe?.productSku?.size }}
                  {{ productionRun.recipe?.productSku?.unit }}
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Actual Output -->
      <div class="col-12 md:col-6">
        <label for="quantity_produced" class="block mb-2">
          Actual Output <span class="text-red-500">*</span>
        </label>
        <InputNumber
          id="quantity_produced"
          v-model="formData.quantity_produced"
          class="w-full"
          mode="decimal"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          :min="0"
          required
          :disabled="loading"
        />
      </div>

      <!-- Unit (Read-only) -->
      <div class="col-12 md:col-6">
        <label for="unit" class="block mb-2">Unit</label>
        <InputText id="unit" v-model="productionRun.unit" class="w-full" disabled />
      </div>

      <!-- Waste Quantity -->
      <div class="col-12 md:col-6">
        <label for="waste_quantity" class="block mb-2">
          Waste Quantity <span class="text-500">(optional)</span>
        </label>
        <InputNumber
          id="waste_quantity"
          v-model="formData.waste_quantity"
          class="w-full"
          mode="decimal"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          :min="0"
          :disabled="loading"
        />
        <small class="text-500">Enter quantity of wasted/lost output</small>
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
          :disabled="loading || !formData.waste_quantity || formData.waste_quantity === 0"
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
      <div v-if="formData.quantity_produced > 0" class="col-12">
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
                  {{ totalOutput.toFixed(2) }} {{ productionRun.unit }}
                </div>
              </div>
              <div class="col-3">
                <div class="text-sm text-500">Variance</div>
                <div
                  class="text-lg font-semibold"
                  :class="variance >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ variance >= 0 ? '+' : '' }}{{ variance.toFixed(2) }} {{ productionRun.unit }}
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
        :disabled="!formData.quantity_produced || formData.quantity_produced <= 0"
        @click="handleComplete"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import productionService from '@/services/productionService';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  productionRun: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'completed']);

const toast = useToastNotification();
const loading = ref(false);

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
  quantity_produced: 0,
  waste_quantity: 0,
  waste_reason: '',
  production_date: new Date(),
  notes: '',
});

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const totalOutput = computed(() => {
  return (
    parseFloat(formData.value.quantity_produced || 0) +
    parseFloat(formData.value.waste_quantity || 0)
  );
});

const yieldEfficiency = computed(() => {
  const expected = parseFloat(
    props.productionRun?.expected_quantity || props.productionRun?.quantity || 0
  );
  const actual = parseFloat(formData.value.quantity_produced || 0);
  if (expected === 0) return 0;
  return (actual / expected) * 100;
});

const variance = computed(() => {
  const expected = parseFloat(
    props.productionRun?.expected_quantity || props.productionRun?.quantity || 0
  );
  const actual = parseFloat(formData.value.quantity_produced || 0);
  return actual - expected;
});

const wastePercentage = computed(() => {
  const total = totalOutput.value;
  const waste = parseFloat(formData.value.waste_quantity || 0);
  if (total === 0) return 0;
  return (waste / total) * 100;
});

const yieldEfficiencyClass = computed(() => {
  const eff = yieldEfficiency.value;
  if (eff >= 95) return 'border-1 border-green-500';
  if (eff >= 85) return 'border-1 border-blue-500';
  if (eff >= 75) return 'border-1 border-orange-500';
  return 'border-1 border-red-500';
});

watch(
  () => props.productionRun,
  newVal => {
    if (newVal) {
      formData.value = {
        quantity_produced: parseFloat(newVal.quantity || 0),
        waste_quantity: 0,
        waste_reason: '',
        production_date: newVal.production_date ? new Date(newVal.production_date) : new Date(),
        notes: '',
      };
    }
  },
  { immediate: true }
);

const handleComplete = async () => {
  if (!formData.value.quantity_produced || formData.value.quantity_produced <= 0) {
    toast.error('Please enter actual output quantity');
    return;
  }

  if (formData.value.waste_quantity > 0 && !formData.value.waste_reason) {
    toast.error('Please provide waste reason when waste quantity > 0');
    return;
  }

  loading.value = true;
  try {
    const completionData = {
      quantity_produced: formData.value.quantity_produced,
      waste_quantity: formData.value.waste_quantity || 0,
      waste_reason: formData.value.waste_reason || '',
      production_date: formData.value.production_date.toISOString().split('T')[0],
      notes: formData.value.notes || '',
      outputs: [
        {
          sku_id: props.productionRun.recipe?.product_sku_id,
          quantity: formData.value.quantity_produced,
        },
      ],
    };

    await productionService.complete(props.productionRun.id, completionData);
    toast.success('Production run completed successfully');
    visible.value = false;
    emit('completed');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to complete production run');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};
</script>

<style scoped>
.surface-100 {
  background-color: var(--surface-100);
}
</style>
