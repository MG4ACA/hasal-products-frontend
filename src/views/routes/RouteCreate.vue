<script setup>
import RouteForm from '@/components/routes/RouteForm.vue';
import { useToastNotification } from '@/composables/useToastNotification';
import { useRouteStore } from '@/stores/route';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const routeStore = useRouteStore();
const { showSuccess, showError } = useToastNotification();

const breadcrumbItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Routes', to: '/routes' },
  { label: 'Create' },
];

const breadcrumbHome = { icon: 'pi pi-home', to: '/' };

const formData = ref({
  name: '',
  description: '',
  status: 'active',
});

const handleSubmit = async data => {
  try {
    await routeStore.createRoute(data);
    showSuccess('Route created successfully');
    router.push('/routes');
  } catch (error) {
    console.error('Failed to create route:', error);
    showError(error.response?.data?.message || 'Failed to create route');
  }
};

const handleCancel = () => {
  router.push('/routes');
};
</script>

<template>
  <div class="route-create">
    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="mb-4" />

    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Create Route</h1>
          <p>Add a new delivery route to the system</p>
        </div>
      </div>
    </div>

    <RouteForm
      v-model="formData"
      :loading="routeStore.loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.route-create {
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

@media (max-width: 768px) {
  .route-create {
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
