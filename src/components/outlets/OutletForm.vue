<script setup>
import { useRouteStore } from '@/stores/route';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
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

const paymentTermsOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Credit', value: 'credit' },
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
  <div class="outlet-form">
    <div class="form-card">
      <div class="p-fluid">
        <!-- Code Field -->
        <div class="field">
          <label for="code">Outlet Code</label>
          <InputText
            id="code"
            v-model="formData.code"
            placeholder="Auto-generated (e.g., OT-0001)"
            :disabled="true"
          />
          <small class="form-help">Code is auto-generated</small>
        </div>

        <!-- Name Field -->
        <div class="field">
          <label for="name">Outlet Name <span class="required">*</span></label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="Enter outlet name"
            :disabled="loading"
            required
          />
        </div>

        <div class="field-group">
          <!-- Owner Name -->
          <div class="field">
            <label for="owner_name">Owner Name</label>
            <InputText
              id="owner_name"
              v-model="formData.owner_name"
              placeholder="Enter owner name"
              :disabled="loading"
            />
          </div>

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

        <!-- Address -->
        <div class="field">
          <label for="address">Address</label>
          <textarea
            id="address"
            v-model="formData.address"
            rows="3"
            class="p-inputtext p-component"
            placeholder="Enter outlet address"
            :disabled="loading"
          />
        </div>

        <div class="field-group">
          <!-- Route -->
          <div class="field">
            <label for="route_id">Route</label>
            <Dropdown
              id="route_id"
              v-model="formData.route_id"
              :options="routes"
              option-label="label"
              option-value="value"
              placeholder="Select Route"
              :disabled="loading"
              :show-clear="true"
            />
          </div>

          <!-- Payment Terms -->
          <div class="field">
            <label for="payment_terms">Payment Terms <span class="required">*</span></label>
            <Dropdown
              id="payment_terms"
              v-model="formData.payment_terms"
              :options="paymentTermsOptions"
              option-label="label"
              option-value="value"
              placeholder="Select Payment Terms"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="field-group">
          <!-- Default Discount -->
          <div class="field">
            <label for="default_discount">Default Discount (%)</label>
            <InputNumber
              id="default_discount"
              v-model="formData.default_discount"
              :min="0"
              :max="100"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
              placeholder="0.00"
              :disabled="loading"
            />
          </div>

          <!-- Credit Limit -->
          <div class="field">
            <label for="credit_limit">Credit Limit (LKR)</label>
            <InputNumber
              id="credit_limit"
              v-model="formData.credit_limit"
              :min="0"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
              placeholder="0.00"
              :disabled="loading"
            />
          </div>
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
            label="Save Outlet"
            icon="pi pi-check"
            :loading="loading"
            :disabled="!formData.name || !formData.payment_terms || !formData.status"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.outlet-form {
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

textarea.p-inputtext {
  resize: vertical;
  min-height: 80px;
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
