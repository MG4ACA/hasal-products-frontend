<template>
  <ProductForm :product-id="productId" />
</template>

<script setup>
import ProductForm from '@/components/products/ProductForm.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const productId = computed(() => route.params.id);
</script>
