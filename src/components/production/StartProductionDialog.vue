<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :draggable="false"
    header="Start Production"
    style="width: 500px"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="productionRun">
      <div class="mb-3">
        <h4>{{ productionRun.recipe?.name }}</h4>
        <p class="text-sm text-500">Batch: {{ productionRun.batch_number }}</p>
      </div>

      <Divider />

      <div class="grid">
        <div class="col-12">
          <div class="field">
            <label class="text-500 text-sm">Product</label>
            <div class="text-lg font-bold">
              {{ productionRun.recipe?.product?.name }}
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label class="text-500 text-sm">Expected Quantity</label>
            <div class="text-lg font-bold text-primary">
              {{ formatNumber(productionRun.expected_quantity) }}
              {{ productionRun.recipe?.yield_unit }}
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="field">
            <label class="text-500 text-sm">Production Date</label>
            <div class="text-lg">
              {{ formatDate(productionRun.production_date) }}
            </div>
          </div>
        </div>
      </div>

      <Divider />

      <div class="mt-3 p-3 surface-100 border-round">
        <p class="text-sm text-500 mb-2">
          <i class="pi pi-info-circle mr-1" />
          <strong>Starting production will:</strong>
        </p>
        <ul class="text-sm text-500 ml-3">
          <li>Check material availability for required quantities</li>
          <li>Deduct raw materials using FIFO (First In, First Out) method</li>
          <li>Reserve materials for this production run</li>
          <li>Update status to "In Progress"</li>
        </ul>
      </div>

      <InlineMessage v-if="error" severity="error" class="mt-3 w-full">
        {{ error }}
      </InlineMessage>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="$emit('update:visible', false)" />
      <Button
        label="Start Production"
        icon="pi pi-play"
        severity="success"
        :loading="loading"
        @click="handleStart"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import productionService from '@/services/productionService';
import { formatDate, formatNumber } from '@/utils/formatters';
import InlineMessage from 'primevue/inlinemessage';
import { ref } from 'vue';

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

const emit = defineEmits(['update:visible', 'started']);

const { showSuccess, showError } = useToastNotification();
const loading = ref(false);
const error = ref(null);

const handleStart = async () => {
  if (!props.productionRun) return;

  loading.value = true;
  error.value = null;

  try {
    await productionService.start(props.productionRun.id);
    showSuccess('Production started successfully');
    emit('started');
    emit('update:visible', false);
  } catch (err) {
    error.value = err.message || 'Failed to start production';
    showError(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.field {
  margin-bottom: 0.5rem;
}

ul {
  padding-left: 1rem;
  margin: 0;
}

li {
  margin-bottom: 0.25rem;
}
</style>
