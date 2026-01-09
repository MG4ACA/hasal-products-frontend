<template>
  <div class="production-runs-page">
    <div class="page-header">
      <div>
        <h1>Production Runs</h1>
        <p>Manage production and manufacturing</p>
      </div>
      <div class="header-actions">
        <Button
          icon="pi pi-refresh"
          rounded
          severity="primary"
          @click="handleRefresh"
          v-tooltip="'Refresh'"
        />
        <Button
          label="Create Production"
          icon="pi pi-plus"
          @click="() => router.push('/production-runs/create')"
        />
      </div>
    </div>
    <ProductionRunList />
  </div>
</template>

<script setup>
import ProductionRunList from '@/components/production/ProductionRunList.vue';
import { useProductionStore } from '@/stores/production';
import { useRouter } from 'vue-router';

const router = useRouter();
const productionStore = useProductionStore();

const handleRefresh = async () => {
  await productionStore.fetchProductionRuns();
};
</script>
