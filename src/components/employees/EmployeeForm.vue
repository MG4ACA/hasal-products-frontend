<script setup>
import { useRouteStore } from '@/stores/route';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const routeStore = useRouteStore();
const formData = ref({ ...props.modelValue });
const routes = ref([]);

watch(
  () => props.modelValue,
  newVal => {
    formData.value = { ...newVal };
  },
  { deep: true }
);

watch(
  formData,
  newVal => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const typeOptions = [
  { label: 'Sales Rep', value: 'sales_ref' },
  { label: 'Driver', value: 'driver' },
  { label: 'Warehouse', value: 'warehouse' },
  { label: 'Other', value: 'other' },
];

const handleSubmit = () => {
  emit('submit', formData.value);
};

const handleCancel = () => {
  emit('cancel');
};

const loadRoutes = async () => {
  try {
    await routeStore.fetchRoutes({ limit: 100, status: 'active' });
    routes.value = routeStore.activeRoutes.map(r => ({
      label: r.name,
      value: r.id,
    }));
  } catch (error) {
    console.error('Failed to load routes:', error);
  }
};

onMounted(() => {
  loadRoutes();
});
</script>

<template>
  <div class="employee-form">
    <div class="form-card">
      <div class="p-fluid">
        <!-- Code Field -->
        <div class="field">
          <label for="code">Employee Code</label>
          <InputText
            id="code"
            v-model="formData.code"
            placeholder="Auto-generated (e.g., EMP-0001)"
            :disabled="true"
          />
          <small class="form-help">Code is auto-generated</small>
        </div>

        <!-- Name Field -->
        <div class="field">
          <label for="name">Employee Name <span class="required">*</span></label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="Enter employee name"
            :disabled="loading"
            required
          />
        </div>

        <!-- Type Field -->
        <div class="field">
          <label for="type">Employee Type <span class="required">*</span></label>
          <Dropdown
            id="type"
            v-model="formData.type"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select Employee Type"
            :disabled="loading"
          />
          <small class="form-help">
            Note: Employees do not have user accounts. User accounts are managed separately.
          </small>
        </div>

        <div class="field-group">
          <!-- Phone -->
          <div class="field">
            <label for="phone">Phone</label>
            <InputText
              id="phone"
              v-model="formData.phone"
              placeholder="Enter phone number"
              :disabled="loading"
            />
          </div>

          <!-- Email -->
          <div class="field">
            <label for="email">Email</label>
            <InputText
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter email address"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Assigned Route -->
        <div class="field">
          <label for="assigned_route_id">Assigned Route</label>
          <Dropdown
            id="assigned_route_id"
            v-model="formData.assigned_route_id"
            :options="routes"
            option-label="label"
            option-value="value"
            placeholder="Select Route (Optional)"
            :disabled="loading"
            :show-clear="true"
          />
          <small class="form-help"> Assign a route for sales reps and drivers </small>
        </div>

        <!-- Status -->
        <div class="field">
          <label for="status">Status <span class="required">*</span></label>
          <Dropdown
            id="status"
            v-model="formData.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Select Status"
            :disabled="loading"
          />
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-secondary"
            :disabled="loading"
            @click="handleCancel"
          />
          <Button
            label="Save Employee"
            icon="pi pi-check"
            :loading="loading"
            :disabled="!formData.name || !formData.type || !formData.status"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-form {
  padding: 0;
}

.form-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.required {
  color: #ef4444;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .form-card {
    padding: 1.5rem;
  }

  .field-group {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
