<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { reactive, watch } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      category: 'spice',
      unit: 'kg',
      reorder_level: null,
      status: 'active',
    }),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'cancel']);

// Form data
const formData = reactive({
  name: '',
  description: '',
  category: 'spice',
  unit: 'kg',
  reorder_level: null,
  status: 'active',
});

// Validation errors
const errors = reactive({
  name: '',
  unit: '',
  reorder_level: '',
});

// Dropdown options
const categoryOptions = [
  { label: 'Spice', value: 'spice' },
  { label: 'Packaging', value: 'packaging' },
  { label: 'Other', value: 'other' },
];

const unitOptions = [
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Gram (g)', value: 'g' },
  { label: 'Piece', value: 'piece' },
  { label: 'Liter (L)', value: 'liter' },
  { label: 'Milliliter (ml)', value: 'ml' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

// Initialize form with initial data
watch(
  () => props.initialData,
  newData => {
    if (newData) {
      Object.assign(formData, newData);
      // Convert reorder_level to number for InputNumber component
      if (formData.reorder_level !== null && formData.reorder_level !== undefined) {
        formData.reorder_level = Number(formData.reorder_level);
      }
    }
  },
  { immediate: true }
);

// Validation functions
const validateForm = () => {
  let isValid = true;

  // Reset errors
  errors.name = '';
  errors.unit = '';
  errors.reorder_level = '';

  // Validate name (required)
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Raw material name is required';
    isValid = false;
  }

  // Validate unit (required)
  if (!formData.unit || formData.unit.trim() === '') {
    errors.unit = 'Unit is required';
    isValid = false;
  }

  // Validate reorder level (must be positive if provided)
  if (formData.reorder_level !== null && formData.reorder_level < 0) {
    errors.reorder_level = 'Reorder level must be a positive number';
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', { ...formData });
  }
};

// Handle cancel
const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="raw-material-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <!-- Raw Material Name (Required) -->
        <div class="form-field">
          <label for="name" class="required">Raw Material Name</label>
          <InputText
            id="name"
            v-model="formData.name"
            :class="{ 'p-invalid': errors.name }"
            placeholder="Enter raw material name"
            :disabled="loading"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <!-- Category -->
        <div class="form-field">
          <label for="category">Category</label>
          <Dropdown
            id="category"
            v-model="formData.category"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            placeholder="Select category"
            :disabled="loading"
          />
        </div>

        <!-- Unit (Required) -->
        <div class="form-field">
          <label for="unit" class="required">Unit</label>
          <Dropdown
            id="unit"
            v-model="formData.unit"
            :options="unitOptions"
            option-label="label"
            option-value="value"
            placeholder="Select unit"
            :class="{ 'p-invalid': errors.unit }"
            :disabled="loading"
          />
          <small v-if="errors.unit" class="p-error">{{ errors.unit }}</small>
        </div>

        <!-- Reorder Level -->
        <div class="form-field">
          <label for="reorder_level">Reorder Level</label>
          <InputNumber
            id="reorder_level"
            v-model="formData.reorder_level"
            :class="{ 'p-invalid': errors.reorder_level }"
            placeholder="Enter reorder level"
            :min="0"
            :min-fraction-digits="0"
            :max-fraction-digits="2"
            :disabled="loading"
          />
          <small v-if="errors.reorder_level" class="p-error">{{ errors.reorder_level }}</small>
          <small class="help-text">Minimum stock level before reordering</small>
        </div>

        <!-- Status (show only in edit mode) -->
        <div v-if="isEdit" class="form-field">
          <label for="status">Status</label>
          <Dropdown
            id="status"
            v-model="formData.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Select status"
            :disabled="loading"
          />
        </div>

        <!-- Description (Full Width) -->
        <div class="form-field full-width">
          <label for="description">Description</label>
          <Textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Enter description (optional)"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <Button
          type="button"
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          :disabled="loading"
          @click="handleCancel"
        />
        <Button
          type="submit"
          :label="isEdit ? 'Update Raw Material' : 'Create Raw Material'"
          icon="pi pi-check"
          :loading="loading"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.raw-material-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
}

.form-field label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-dropdown),
.form-field :deep(.p-inputtextarea),
.form-field :deep(.p-inputnumber) {
  width: 100%;
}

.form-field :deep(.p-inputtext.p-invalid),
.form-field :deep(.p-dropdown.p-invalid),
.form-field :deep(.p-inputnumber.p-invalid) {
  border-color: #ef4444;
}

.form-field small.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.25rem;
}

.form-field small.help-text {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: -0.25rem;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
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
