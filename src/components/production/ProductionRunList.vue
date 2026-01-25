<template>
  <div class="production-runs">
    <!-- Production Runs Table -->
    <DataTable
      :value="productionRuns"
      :loading="loading"
      striped-rows
      responsive-layout="scroll"
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc" />
          <p>No production runs found</p>
        </div>
      </template>

      <Column field="run_number" header="Run Number">
        <template #body="{ data }">
          <span class="font-bold">{{ data.run_number }}</span>
        </template>
      </Column>

      <Column header="Recipe">
        <template #body="{ data }">
          {{ data.recipe?.name || 'N/A' }}
          <Tag
            v-if="data.recipe?.version > 1"
            :value="`v${data.recipe.version}`"
            severity="info"
            class="ml-1"
          />
        </template>
      </Column>

      <Column header="Product">
        <template #body="{ data }">
          {{ data.recipe?.productSku?.product?.name || 'N/A' }}
        </template>
      </Column>

      <Column field="expected_quantity" header="Expected Quantity">
        <template #body="{ data }">
          {{ formatNumber(data.expected_quantity) }} {{ data.recipe?.yield_unit || data.unit }}
        </template>
      </Column>

      <Column field="production_date" header="Production Date">
        <template #body="{ data }">
          {{ formatDate(data.production_date) }}
        </template>
      </Column>

      <Column field="status" header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
        </template>
      </Column>

      <Column header="Actions">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              v-tooltip.top="'View'"
              icon="pi pi-eye"
              size="small"
              class="p-button-rounded p-button-text"
              @click="$emit('view', data.id)"
            />
            <Button
              v-if="data.status === 'planned'"
              v-tooltip.top="'Edit'"
              icon="pi pi-pencil"
              severity="warning"
              size="small"
              class="p-button-rounded p-button-text"
              @click="$emit('edit', data.id)"
            />
            <Button
              v-if="data.status === 'planned'"
              v-tooltip.top="'Start Production'"
              icon="pi pi-play"
              size="small"
              class="p-button-rounded p-button-text"
              @click="startRun(data)"
            />
            <Button
              v-if="data.status === 'in_progress'"
              v-tooltip.top="'Complete'"
              icon="pi pi-check"
              size="small"
              class="p-button-rounded p-button-text"
              @click="completeRun(data)"
            />
            <Button
              v-if="data.status === 'planned'"
              v-tooltip.top="'Delete'"
              icon="pi pi-trash"
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text"
              @click="$emit('delete', data)"
            />
            <Button
              v-if="data.status === 'in_progress'"
              v-tooltip.top="'Cancel'"
              icon="pi pi-times"
              severity="danger"
              size="small"
              class="p-button-rounded p-button-text"
              @click="$emit('cancel', data)"
            />
            <Button
              v-if="data.status === 'planned' || data.status === 'in_progress'"
              v-tooltip.top="'Check Materials'"
              icon="pi pi-box"
              severity="help"
              size="small"
              outlined
              class="p-button-rounded p-button-text"
              @click="checkMaterials(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      header="Confirm Delete"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span
          >Are you sure you want to delete production run <b>{{ selectedRun?.run_number }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" severity="danger" @click="handleDelete" />
      </template>
    </Dialog>

    <!-- Material Check Dialog -->
    <Dialog
      v-model:visible="materialDialog"
      :style="{ width: '700px' }"
      header="Material Availability Check"
      :modal="true"
    >
      <div v-if="materialCheck">
        <div class="mb-3">
          <h4>Production Run: {{ selectedRun?.run_number }}</h4>
          <p>Recipe: {{ selectedRun?.Recipe?.name }}</p>
          <p>Quantity: {{ formatNumber(selectedRun?.quantity) }} {{ selectedRun?.unit }}</p>
        </div>

        <Divider />

        <DataTable :value="materialCheck.materials" class="p-datatable-sm">
          <Column field="name" header="Raw Material" />
          <Column field="required" header="Required">
            <template #body="{ data }">
              {{ formatNumber(data.required) }} {{ data.unit }}
            </template>
          </Column>
          <Column field="available" header="Available">
            <template #body="{ data }">
              {{ formatNumber(data.available) }} {{ data.unit }}
            </template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.available >= data.required ? 'Sufficient' : 'Insufficient'"
                :severity="data.available >= data.required ? 'success' : 'danger'"
              />
            </template>
          </Column>
        </DataTable>

        <div class="mt-3 p-3 surface-100 border-round">
          <div
            class="text-lg font-bold"
            :class="materialCheck.canProduce ? 'text-green-600' : 'text-red-600'"
          >
            {{
              materialCheck.canProduce ? '✓ All materials available' : '✗ Insufficient materials'
            }}
          </div>
          <div v-if="!materialCheck.canProduce" class="text-sm text-500 mt-1">
            Please ensure all materials are available before starting production.
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Close" icon="pi pi-times" @click="materialDialog = false" />
      </template>
    </Dialog>

    <!-- Start Production Dialog -->
    <StartProductionDialog
      v-model:visible="startDialog"
      :production-run="selectedRun"
      @started="handleProductionStarted"
    />

    <!-- Complete Production Dialog -->
    <CompleteProductionDialog
      v-model:visible="completeDialog"
      :production-run="selectedRun"
      @completed="handleProductionCompleted"
    />
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { formatDate, formatNumber } from '@/utils/formatters';
import { ref } from 'vue';
import CompleteProductionDialog from './CompleteProductionDialog.vue';
import StartProductionDialog from './StartProductionDialog.vue';

const props = defineProps({
  productionRuns: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view', 'edit', 'delete', 'refresh']);

const { showSuccess } = useToastNotification();

const deleteDialog = ref(false);
const materialDialog = ref(false);
const startDialog = ref(false);
const completeDialog = ref(false);
const selectedRun = ref(null);
const materialCheck = ref(null);

const getStatusSeverity = status => {
  const severityMap = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return severityMap[status] || 'info';
};

const checkMaterials = async run => {
  selectedRun.value = run;
  materialDialog.value = true;
};

const startRun = run => {
  selectedRun.value = run;
  startDialog.value = true;
};

const completeRun = run => {
  selectedRun.value = run;
  completeDialog.value = true;
};

const handleProductionStarted = () => {
  startDialog.value = false;
  selectedRun.value = null;
  emit('refresh');
};

const handleProductionCompleted = () => {
  completeDialog.value = false;
  selectedRun.value = null;
  showSuccess('Production run completed successfully');
  emit('refresh');
};
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
}

.font-bold {
  font-weight: 600;
}
</style>
