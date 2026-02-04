<script setup>
import RouteForm from '@/components/routes/RouteForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRouteStore } from '@/stores/route';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const routeStore = useRouteStore();
const { showSuccess, showError } = useToastNotification();

const routeId = ref(route.params.id);
const loading = ref(false);

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Territories', to: '/routes' },
  { label: 'Edit' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const formData = ref({
  code: '',
  name: '',
  description: '',
  status: 'active',
});

const loadRoute = async () => {
  loading.value = true;
  try {
    const data = await routeStore.fetchRouteById(routeId.value);
    formData.value = {
      code: data.code,
      name: data.name,
      description: data.description || '',
      status: data.status,
    };
  } catch (error) {
    showError(error.message || 'Failed to load route');
    router.push('/routes');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async data => {
  try {
    await routeStore.updateRoute(routeId.value, data);
    showSuccess('Route updated successfully');
    router.push('/routes');
  } catch (error) {
    console.error('Failed to update route:', error);
    showError(error.message || 'Failed to update route');
  }
};

const handleCancel = () => {
  router.push('/routes');
};

onMounted(() => {
  loadRoute();
});
</script>

<template>
  <div class="route-edit">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Edit Territory</h1>
          <p>Update territory information</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
    </div>

    <RouteForm
      v-else
      v-model="formData"
      :loading="routeStore.loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.route-edit {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .route-edit {
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
