<template>
  <div class="recipe-edit-page">
    <RecipeForm :recipe-id="route.params.id" />
  </div>
</template>

<script setup>
import RecipeForm from '@/components/recipes/RecipeForm.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>
