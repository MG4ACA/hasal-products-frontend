<template>
  <div class="products-page">
    <div class="page-header">
      <div>
        <h1>Products</h1>
        <p>Manage products and SKUs</p>
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
          label="Add Product"
          icon="pi pi-plus"
          @click="() => router.push('/products/create')"
        />
      </div>
    </div>
    <ProductList />
  </div>
</template>

<script setup>
import ProductList from '@/components/products/ProductList.vue';
import { useProductStore } from '@/stores/product';
import { useRouter } from 'vue-router';

const router = useRouter();
const productStore = useProductStore();

const handleRefresh = async () => {
  await productStore.fetchProducts();
};
</script>
