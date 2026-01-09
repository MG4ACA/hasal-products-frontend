<template>
  <div class="recipes-page">
    <div class="page-header">
      <div>
        <h1>Recipes</h1>
        <p>Manage recipes and formulations</p>
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
          label="Create Recipe"
          icon="pi pi-plus"
          @click="() => router.push('/recipes/create')"
        />
      </div>
    </div>
    <RecipeList />
  </div>
</template>

<script setup>
import RecipeList from '@/components/recipes/RecipeList.vue';
import { useRecipeStore } from '@/stores/recipe';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipeStore = useRecipeStore();

const handleRefresh = async () => {
  await recipeStore.fetchRecipes();
};
</script>
