<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';

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

const formData = ref({ ...props.modelValue });

watch(
  () => props.modelValue,
  newVal => {
    formData.value = { ...newVal };
  },
  { deep: true }
);

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const handleSubmit = () => {
  emit('submit', formData.value);
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="route-form">
    <div class="form-card">
      <div class="p-fluid">
        <!-- Code Field (Read-only for edit mode) -->
        <div class="field">
          <label for="code">Route Code</label>
          <InputText
            id="code"
            v-model="formData.code"
            placeholder="Auto-generated (e.g., RT-0001)"
            :disabled="true"
          />
          <small class="form-help">Code is auto-generated</small>
        </div>

        <!-- Name Field -->
        <div class="field">
          <label for="name">Route Name <span class="required">*</span></label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="Enter route name"
            :disabled="loading"
            required
          />
        </div>

        <!-- Description Field -->
        <div class="field">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            class="p-inputtext p-component"
            placeholder="Enter route description"
            :disabled="loading"
          />
        </div>

        <!-- Status Field -->
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
            label="Save Route"
            icon="pi pi-check"
            :loading="loading"
            :disabled="!formData.name || !formData.status"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-form {
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

textarea.p-inputtext {
  resize: vertical;
  min-height: 100px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
