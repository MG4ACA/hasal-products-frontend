<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const formData = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

watch(
  () => props.modelValue,
  () => {
    formData.value = props.modelValue;
  }
);

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const isFormValid = computed(() => {
  return formData.value.name && formData.value.status;
});

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', formData.value);
  }
};
</script>

<template>
  <div class="vehicle-form">
    <div class="form-grid">
      <div class="form-group">
        <label for="code">Vehicle Code</label>
        <InputText id="code" v-model="formData.code" disabled />
        <small>Auto-generated code</small>
      </div>

      <div class="form-group">
        <label for="name"> Vehicle Name <span class="required">*</span> </label>
        <InputText id="name" v-model="formData.name" placeholder="Enter vehicle name" required />
      </div>

      <div class="form-group">
        <label for="registration">Registration Number</label>
        <InputText
          id="registration"
          v-model="formData.registration_number"
          placeholder="e.g., ABC-1234"
        />
      </div>

      <div class="form-group">
        <label for="status"> Status <span class="required">*</span> </label>
        <Dropdown
          id="status"
          v-model="formData.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="Select status"
          required
        />
      </div>
    </div>

    <div class="help-text">
      <i class="pi pi-info-circle" />
      <span
        >Note: Vehicle assignment to territories is managed separately through the assignment
        feature.</span
      >
    </div>

    <div class="form-actions">
      <Button label="Cancel" severity="secondary" @click="emit('cancel')" />
      <Button label="Save Vehicle" :disabled="!isFormValid" @click="handleSubmit" />
    </div>
  </div>
</template>

<style scoped>
.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(2, 1fr);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.help-text {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  color: #0c4a6e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-text i {
  color: #0284c7;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
