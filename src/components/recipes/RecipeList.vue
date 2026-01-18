<template>
  <div class="recipe-list">
    <!-- Data Table -->
    <DataTable
      :value="recipeStore.recipes"
      :loading="recipeStore.loading"
      striped-rows
      responsive-layout="scroll"
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc" />
          <p>No recipes found</p>
        </div>
      </template>

      <Column field="name" header="Recipe Name" :sortable="true">
        <template #body="{ data }">
          <div>
            <strong>{{ data.name }}</strong>
            <Tag v-if="data.version > 1" :value="`v${data.version}`" severity="info" class="ml-2" />
          </div>
        </template>
      </Column>

      <Column header="Product">
        <template #body="{ data }">
          {{ data.product?.name || 'N/A' }}
        </template>
      </Column>

      <Column header="SKU">
        <template #body="{ data }">
          {{ data.productSku?.variant || 'N/A' }}
        </template>
      </Column>

      <Column field="batch_size" header="Batch Size">
        <template #body="{ data }"> {{ formatNumber(data.batch_size) }} {{ data.unit }} </template>
      </Column>

      <Column header="Items">
        <template #body="{ data }">
          <Tag :value="data.items?.length || 0" severity="info" />
        </template>
      </Column>

      <Column field="status" header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="data.status === 'active' ? 'success' : 'danger'" />
        </template>
      </Column>

      <Column header="Actions" style="width: 200px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              v-tooltip.top="'View Details'"
              icon="pi pi-eye"
              severity="info"
              size="small"
              outlined
              @click="$emit('view', data.id)"
            />
            <Button
              v-tooltip.top="'Edit (New Version)'"
              icon="pi pi-pencil"
              severity="warning"
              size="small"
              outlined
              @click="$emit('edit', data.id)"
            />
            <Button
              v-tooltip.top="'Version History'"
              icon="pi pi-history"
              severity="secondary"
              size="small"
              outlined
              @click="viewVersions(data.id)"
            />
            <Button
              v-tooltip.top="'Delete'"
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              @click="$emit('delete', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Version History Dialog -->
    <Dialog
      v-model:visible="versionDialog"
      :style="{ width: '800px' }"
      header="Version History"
      :modal="true"
    >
      <DataTable
        :value="versionHistory"
        :loading="loadingVersions"
        striped-rows
        class="p-datatable-sm"
      >
        <Column field="version" header="Version">
          <template #body="{ data }">
            <Tag :value="`v${data.version}`" severity="info" />
          </template>
        </Column>
        <Column field="name" header="Name" />
        <Column field="batch_size" header="Batch Size">
          <template #body="{ data }">
            {{ formatNumber(data.batch_size) }} {{ data.unit }}
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="data.status === 'active' ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column field="created_at" header="Created">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <Button
              label="View"
              icon="pi pi-eye"
              size="small"
              outlined
              @click="$emit('view', data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useRecipeStore } from '@/stores/recipe';
import { formatDate, formatNumber } from '@/utils/formatters';
import { ref } from 'vue';

const recipeStore = useRecipeStore();
const toast = useToastNotification();

defineEmits(['view', 'edit', 'delete']);

const versionDialog = ref(false);
const versionHistory = ref([]);
const loadingVersions = ref(false);

const viewVersions = async id => {
  loadingVersions.value = true;
  versionDialog.value = true;
  try {
    versionHistory.value = await recipeStore.fetchVersionHistory(id);
  } catch (error) {
    toast.error('Failed to load version history');
  } finally {
    loadingVersions.value = false;
  }
};
</script>
