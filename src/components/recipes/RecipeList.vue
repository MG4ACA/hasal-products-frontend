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
          {{ data.productSku?.size || 'N/A' }}
        </template>
      </Column>

      <Column field="expected_yield" header="Expected Yield">
        <template #body="{ data }">
          {{ formatNumber(data.expected_yield) }} {{ data.yield_unit }}
        </template>
      </Column>

      <Column header="Items">
        <template #body="{ data }">
          <Tag :value="data.items?.length || 0" severity="info" />
        </template>
      </Column>

      <Column header="Status">
        <template #body="{ data }">
          <Tag
            :value="data.is_active ? 'active' : 'inactive'"
            :severity="data.is_active ? 'success' : 'danger'"
          />
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
              class="p-button-rounded p-button-text"
              @click="$emit('view', data.id)"
            />
            <Button
              v-tooltip.top="'Edit (New Version)'"
              icon="pi pi-pencil"
              severity="warning"
              class="p-button-rounded p-button-text"
              size="small"
              @click="$emit('edit', data.id)"
            />
            <Button
              v-tooltip.top="'Version History'"
              icon="pi pi-history"
              class="p-button-rounded p-button-text"
              severity="secondary"
              size="small"
              @click="viewVersions(data.id)"
            />
            <Button
              v-tooltip.top="'Duplicate Recipe'"
              icon="pi pi-copy"
              class="p-button-rounded p-button-text"
              size="small"
              @click="$emit('duplicate', data)"
            />
            <Button
              v-tooltip.top="'Delete'"
              icon="pi pi-trash"
              class="p-button-rounded p-button-text"
              severity="danger"
              size="small"
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
        <Column field="expected_yield" header="Expected Yield">
          <template #body="{ data }">
            {{ formatNumber(data.expected_yield) }} {{ data.yield_unit }}
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.is_active ? 'active' : 'inactive'"
              :severity="data.is_active ? 'success' : 'danger'"
            />
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

defineEmits(['view', 'edit', 'delete', 'duplicate']);

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
