<template>
  <div class="production-view">
    <Card v-if="productionRun">
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <div>Production Run Details</div>
          <div class="flex gap-2">
            <Button
              v-if="productionRun.status === 'planned'"
              label="Edit"
              icon="pi pi-pencil"
              severity="warning"
              @click="editRun"
            />
            <Button
              label="Back"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              @click="goBack"
            />
          </div>
        </div>
      </template>

      <template #content>
        <!-- Production Run Information -->
        <div class="mb-4">
          <h3>Production Information</h3>
          <Divider />
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Run Number</label>
                <div class="text-lg font-bold">
                  {{ productionRun.run_number }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Status</label>
                <div>
                  <Tag
                    :value="productionRun.status"
                    :severity="getStatusSeverity(productionRun.status)"
                  />
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

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Quantity</label>
                <div class="text-lg">
                  {{ formatNumber(productionRun.quantity) }} {{ productionRun.unit }}
                </div>
              </div>
            </div>

            <div class="col-12">
              <div class="field">
                <label class="text-500 text-sm">Notes</label>
                <div class="text-lg">
                  {{ productionRun.notes || 'No notes' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recipe Information -->
        <div class="mb-4">
          <h3>Recipe Information</h3>
          <Divider />
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Recipe Name</label>
                <div class="text-lg font-bold">
                  {{ productionRun.Recipe?.name }}
                  <Tag
                    v-if="productionRun.Recipe?.version > 1"
                    :value="`v${productionRun.Recipe.version}`"
                    severity="info"
                    class="ml-1"
                  />
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Product</label>
                <div class="text-lg">
                  {{ productionRun.Recipe?.Product?.name }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">SKU</label>
                <div class="text-lg">
                  {{ productionRun.Recipe?.ProductSku?.variant }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Batch Size</label>
                <div class="text-lg">
                  {{ formatNumber(productionRun.Recipe?.batch_size) }}
                  {{ productionRun.Recipe?.unit }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Materials Used -->
        <div class="mb-4">
          <h3>Materials Used (FIFO)</h3>
          <Divider />

          <DataTable :value="productionRun.materials" striped-rows class="p-datatable-sm">
            <template #empty>
              <div class="text-center p-4">No materials recorded yet</div>
            </template>

            <Column field="raw_material_name" header="Raw Material" />
            <Column field="quantity_used" header="Quantity Used">
              <template #body="{ data }">
                {{ formatNumber(data.quantity_used) }} {{ data.unit }}
              </template>
            </Column>
            <Column field="batch_number" header="Batch Number" />
            <Column field="cost" header="Cost">
              <template #body="{ data }"> Rs. {{ formatNumber(data.cost) }} </template>
            </Column>
          </DataTable>

          <div v-if="productionRun.materials?.length > 0" class="mt-3 p-3 surface-100 border-round">
            <div class="text-500 text-sm mb-1">Total Material Cost</div>
            <div class="text-xl font-bold text-primary">Rs. {{ totalMaterialCost.toFixed(2) }}</div>
          </div>
        </div>

        <!-- Production Output -->
        <div v-if="productionRun.status === 'completed'" class="mb-4">
          <h3>Production Output</h3>
          <Divider />

          <DataTable :value="productionRun.outputs" striped-rows class="p-datatable-sm">
            <template #empty>
              <div class="text-center p-4">No output recorded</div>
            </template>

            <Column field="batch_number" header="Batch Number" />
            <Column field="quantity" header="Quantity">
              <template #body="{ data }">
                {{ formatNumber(data.quantity) }} {{ data.unit }}
              </template>
            </Column>
            <Column field="production_date" header="Production Date">
              <template #body="{ data }">
                {{ formatDate(data.production_date) }}
              </template>
            </Column>
            <Column field="expiry_date" header="Expiry Date">
              <template #body="{ data }">
                {{ formatDate(data.expiry_date) }}
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Completion Details -->
        <div v-if="productionRun.status === 'completed'" class="mb-4">
          <h3>Completion Details</h3>
          <Divider />
          <div class="grid">
            <div class="col-12 md:col-4">
              <div class="field">
                <label class="text-500 text-sm">Expected Output</label>
                <div class="text-lg">
                  {{ formatNumber(productionRun.quantity) }} {{ productionRun.unit }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-4">
              <div class="field">
                <label class="text-500 text-sm">Actual Output</label>
                <div class="text-lg font-bold text-primary">
                  {{ formatNumber(productionRun.actual_output) }} {{ productionRun.unit }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-4">
              <div class="field">
                <label class="text-500 text-sm">Waste Quantity</label>
                <div
                  class="text-lg"
                  :class="productionRun.waste_quantity > 0 ? 'text-red-600' : ''"
                >
                  {{ formatNumber(productionRun.waste_quantity || 0) }} {{ productionRun.unit }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Completed At</label>
                <div class="text-lg">
                  {{ formatDate(productionRun.completed_at) }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Completed By</label>
                <div class="text-lg">
                  {{ productionRun.completed_by_name || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div>
          <h3>Timestamps</h3>
          <Divider />
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Created At</label>
                <div class="text-lg">
                  {{ formatDate(productionRun.created_at) }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="field">
                <label class="text-500 text-sm">Last Updated</label>
                <div class="text-lg">
                  {{ formatDate(productionRun.updated_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div v-else class="text-center p-5">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <p>Loading production run details...</p>
    </div>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useProductionStore } from '@/stores/production';
import { formatDate, formatNumber } from '@/utils/formatters';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const productionStore = useProductionStore();
const toast = useToastNotification();

const productionRun = ref(null);

const totalMaterialCost = computed(() => {
  if (!productionRun.value?.materials) return 0;
  return productionRun.value.materials.reduce((sum, material) => {
    return sum + parseFloat(material.cost || 0);
  }, 0);
});

const getStatusSeverity = status => {
  const severityMap = {
    planned: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };
  return severityMap[status] || 'info';
};

onMounted(async () => {
  await loadProductionRun();
});

const loadProductionRun = async () => {
  try {
    productionRun.value = await productionStore.fetchProductionRunById(route.params.id);
  } catch (error) {
    toast.error('Failed to load production run details');
    router.push('/production-runs');
  }
};

const editRun = () => {
  router.push(`/production-runs/${route.params.id}/edit`);
};

const goBack = () => {
  router.push('/production-runs');
};
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.font-bold {
  font-weight: 600;
}
</style>
