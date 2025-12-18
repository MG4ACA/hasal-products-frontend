<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { reactive, watch } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      payment_terms: 'cash',
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
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  payment_terms: 'cash',
  status: 'active',
});

// Validation errors
const errors = reactive({
  name: '',
  email: '',
  phone: '',
});

// Dropdown options
const paymentTermsOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Credit', value: 'credit' },
  { label: 'Check', value: 'check' },
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
    }
  },
  { immediate: true }
);

// Validation functions
const validateEmail = email => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = phone => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
};

const validateForm = () => {
  let isValid = true;

  // Reset errors
  errors.name = '';
  errors.email = '';
  errors.phone = '';

  // Validate name (required)
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Supplier name is required';
    isValid = false;
  }

  // Validate email (optional but must be valid format)
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Validate phone (optional but must be valid format)
  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number (minimum 9 digits)';
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
  <div class="supplier-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <!-- Supplier Name (Required) -->
        <div class="form-field">
          <label for="name" class="required">Supplier Name</label>
          <InputText
            id="name"
            v-model="formData.name"
            :class="{ 'p-invalid': errors.name }"
            placeholder="Enter supplier name"
            :disabled="loading"
          />
          <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
        </div>

        <!-- Contact Person -->
        <div class="form-field">
          <label for="contact_person">Contact Person</label>
          <InputText
            id="contact_person"
            v-model="formData.contact_person"
            placeholder="Enter contact person name"
            :disabled="loading"
          />
        </div>

        <!-- Phone -->
        <div class="form-field">
          <label for="phone">Phone</label>
          <InputText
            id="phone"
            v-model="formData.phone"
            :class="{ 'p-invalid': errors.phone }"
            placeholder="Enter phone number"
            :disabled="loading"
          />
          <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
        </div>

        <!-- Email -->
        <div class="form-field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="formData.email"
            :class="{ 'p-invalid': errors.email }"
            type="email"
            placeholder="Enter email address"
            :disabled="loading"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <!-- Payment Terms -->
        <div class="form-field">
          <label for="payment_terms">Payment Terms</label>
          <Dropdown
            id="payment_terms"
            v-model="formData.payment_terms"
            :options="paymentTermsOptions"
            option-label="label"
            option-value="value"
            placeholder="Select payment terms"
            :disabled="loading"
          />
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

        <!-- Address (Full Width) -->
        <div class="form-field full-width">
          <label for="address">Address</label>
          <Textarea
            id="address"
            v-model="formData.address"
            rows="3"
            placeholder="Enter full address"
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
          :label="isEdit ? 'Update Supplier' : 'Create Supplier'"
          icon="pi pi-check"
          :loading="loading"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.supplier-form {
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
.form-field :deep(.p-inputtextarea) {
  width: 100%;
}

.form-field :deep(.p-inputtext.p-invalid),
.form-field :deep(.p-dropdown.p-invalid) {
  border-color: #ef4444;
}

.form-field small.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.25rem;
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
