<script setup>
import RecipeForm from '@/components/recipes/RecipeForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRecipeStore } from '@/stores/recipe';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const { showSuccess, showError } = useToastNotification();

const recipeId = ref(route.params.id);
const isLoading = ref(true);
const notFound = ref(false);

// Breadcrumb items
const breadcrumbItems = ref([
  { label: 'Dashboard', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Edit' },
]);

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

// Load recipe data
onMounted(async () => {
  try {
    isLoading.value = true;
    await recipeStore.fetchRecipeById(recipeId.value);

    if (!recipeStore.currentRecipe) {
      notFound.value = true;
      showError('Recipe not found');
    } else {
      // Update breadcrumb with recipe name
      breadcrumbItems.value = [
        { label: 'Dashboard', to: '/' },
        { label: 'Recipes', to: '/recipes' },
        { label: recipeStore.currentRecipe.name },
      ];
    }
  } catch (error) {
    console.error('Failed to load recipe:', error);
    notFound.value = true;
    showError('Failed to load recipe details');
  } finally {
    isLoading.value = false;
  }
});

// Handle form submission
const handleSubmit = async formData => {
  try {
    await recipeStore.updateRecipe(recipeId.value, formData);
    showSuccess('Recipe updated successfully');
    router.push('/recipes');
  } catch (error) {
    console.error('Failed to update recipe:', error);
    showError(error.message || 'Failed to update recipe');
  }
};

// Handle cancel
const handleCancel = () => {
  router.push('/recipes');
};
</script>

<template>
  <div class="recipe-edit">
    <!-- Breadcrumb -->
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>Loading recipe details...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="not-found-container">
      <i class="pi pi-exclamation-triangle" />
      <h2>Recipe Not Found</h2>
      <p>The recipe you're looking for doesn't exist or has been deleted.</p>
      <Button label="Back to Recipes" icon="pi pi-arrow-left" @click="router.push('/recipes')" />
    </div>

    <!-- Edit Form -->
    <template v-else>
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Edit Recipe</h1>
            <p>Update recipe information</p>
            <div class="recipe-code">
              <span class="code-label">Recipe:</span>
              <span class="code-value">{{ recipeStore.currentRecipe?.name }}</span>
              <span v-if="recipeStore.currentRecipe?.version" class="version-badge">
                v{{ recipeStore.currentRecipe?.version }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <RecipeForm
        :recipe-id="recipeId"
        :loading="recipeStore.loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
  </div>
</template>

<style scoped>
.recipe-edit {
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

.recipe-code {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.code-label {
  color: #6b7280;
  font-weight: 500;
}

.code-value {
  color: #1f2937;
  font-weight: 600;
  font-family: monospace;
}

.version-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  color: #667eea;
}

.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  text-align: center;
}

.not-found-container i {
  font-size: 3rem;
  color: #ef4444;
}

.not-found-container h2 {
  color: #1f2937;
  margin: 0;
}

.not-found-container p {
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .recipe-edit {
    padding: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .recipe-code {
    flex-wrap: wrap;
  }
}
</style>
