<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { computed, ref, watch } from 'vue';

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

// Territory length validation
const territoryLengthError = computed(() => {
  if (
    formData.value.territory_length === null ||
    formData.value.territory_length === undefined ||
    formData.value.territory_length === ''
  ) {
    return null; // No error if field is empty (optional field)
  }

  const value = parseFloat(formData.value.territory_length);

  if (isNaN(value)) {
    return 'Please enter a valid number';
  }

  if (value < 0) {
    return 'Territory length cannot be less than 0 km';
  }

  if (value > 150) {
    return 'Territory length cannot exceed 150 km';
  }

  return null;
});

const isFormValid = computed(() => {
  return formData.value.name && formData.value.status && !territoryLengthError.value;
});

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
        <div class="field-container">
          <!-- Code Field (Read-only for edit mode) -->
          <div class="field">
            <label for="code">Territory Code</label>
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
            <label for="name">Territory Name <span class="required">*</span></label>
            <InputText
              id="name"
              v-model="formData.name"
              placeholder="Enter territory name"
              :disabled="loading"
              required
            />
          </div>
        </div>
        <div class="field-container">
          <!-- Territory Length Field -->
          <div class="field">
            <label for="territory_length">Territory Length <span class="unit">(km)</span></label>
            <input
              id="territory_length"
              v-model="formData.territory_length"
              type="number"
              placeholder="0.00"
              step="0.1"
              min="0"
              max="150"
              :disabled="loading"
              class="p-inputtext p-component"
              :class="{ 'ng-invalid ng-touched': territoryLengthError }"
            />
            <small class="form-help"
              >Enter the length of this territory in kilometers (0-150 km)</small
            >
            <small v-if="territoryLengthError" class="error-message">
              {{ territoryLengthError }}
            </small>
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
        </div>
        <!-- Description Field -->
        <div class="field">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="4"
            class="p-inputtext p-component"
            placeholder="Enter territory description"
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
            label="Save Territory"
            icon="pi pi-check"
            :loading="loading"
            :disabled="!isFormValid"
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
  width: 100%;
}

.field-container {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
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

.unit {
  color: #6b7280;
  font-weight: 400;
  font-size: 0.875rem;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.error-message {
  display: block;
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
}

.ng-invalid.ng-touched {
  border-color: #ef4444 !important;
  box-shadow: inset 0 0 0 1px #ef4444;
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
