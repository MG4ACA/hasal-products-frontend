<script setup>
import RecipeForm from '@/components/recipes/RecipeForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRecipeStore } from '@/stores/recipe';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipeStore = useRecipeStore();
const { showSuccess, showError } = useToastNotification();

// Breadcrumb items
const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Handle form submission
const handleSubmit = async formData => {
  try {
    await recipeStore.createRecipe(formData);
    showSuccess('Recipe created successfully');
    router.push('/recipes');
  } catch (error) {
    console.error('Failed to create recipe:', error);
    showError(error.message || 'Failed to create recipe');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/recipes');
};
</script>

<template>
  <div class="recipe-create">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Recipe</h1>
          <p>Add a new recipe to the system</p>
        </div>
      </div>
    </div>

    <!-- Recipe Form -->
    <RecipeForm :loading="recipeStore.loading" @submit="handleSubmit" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
.recipe-create {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .recipe-create {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }
}
</style>
