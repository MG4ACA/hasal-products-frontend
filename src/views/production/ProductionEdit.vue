<template>
  <div class="production-edit-page">
    <ProductionRunForm :run-id="route.params.id" />
  </div>
</template>

<script setup>
import ProductionRunForm from '@/components/production/ProductionRunForm.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>
