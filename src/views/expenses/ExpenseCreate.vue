<template>
  <div class="expense-create">
    <Breadcrumb :home="home" :model="breadcrumbItems" class="mb-4" />

    <Card>
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-plus-circle text-primary" />
          <span>Create New Expense</span>
        </div>
      </template>

      <template #content>
        <form @submit.prevent="handleSubmit">
          <div class="grid">
            <!-- Expense Date -->
            <div class="col-12 md:col-6">
              <label for="expense_date" class="block mb-2 font-semibold"
                >Expense Date <span class="text-red-500">*</span></label
              >
              <Calendar
                id="expense_date"
                v-model="formData.expense_date"
                date-format="yy-mm-dd"
                show-icon
                class="w-full"
                :class="{ 'p-invalid': errors.expense_date }"
              />
              <small v-if="errors.expense_date" class="p-error">{{ errors.expense_date }}</small>
            </div>

            <!-- Category -->
            <div class="col-12 md:col-6">
              <label for="category" class="block mb-2 font-semibold"
                >Category <span class="text-red-500">*</span></label
              >
              <Dropdown
                id="category"
                v-model="formData.category"
                :options="categoryOptions"
                option-label="label"
                option-value="value"
                placeholder="Select Category"
                class="w-full"
                :class="{ 'p-invalid': errors.category }"
                @change="onCategoryChange"
              />
              <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
            </div>

            <!-- Amount -->
            <div class="col-12 md:col-6">
              <label for="amount" class="block mb-2 font-semibold"
                >Amount (Rs.) <span class="text-red-500">*</span></label
              >
              <InputNumber
                id="amount"
                v-model="formData.amount"
                mode="decimal"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
                class="w-full"
                :class="{ 'p-invalid': errors.amount }"
              />
              <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
            </div>

            <!-- Vehicle (shown for vehicle-related expenses) -->
            <div v-if="isVehicleExpense" class="col-12 md:col-6">
              <label for="vehicle_id" class="block mb-2 font-semibold"
                >Vehicle <span class="text-red-500">*</span></label
              >
              <Dropdown
                id="vehicle_id"
                v-model="formData.vehicle_id"
                :options="vehicles"
                option-label="name"
                option-value="id"
                placeholder="Select Vehicle"
                class="w-full"
                :class="{ 'p-invalid': errors.vehicle_id }"
                filter
              >
                <template #option="{ option }"> {{ option.code }} - {{ option.name }} </template>
              </Dropdown>
              <small v-if="errors.vehicle_id" class="p-error">{{ errors.vehicle_id }}</small>
            </div>

            <!-- Route (shown for fuel expenses) -->
            <div v-if="formData.category === 'vehicle_fuel'" class="col-12 md:col-6">
              <label for="route_id" class="block mb-2 font-semibold">Route</label>
              <Dropdown
                id="route_id"
                v-model="formData.route_id"
                :options="routes"
                option-label="name"
                option-value="id"
                placeholder="Select Route (Optional)"
                class="w-full"
                show-clear
                filter
              >
                <template #option="{ option }"> {{ option.code }} - {{ option.name }} </template>
              </Dropdown>
            </div>

            <!-- Distance (shown for fuel expenses) -->
            <div v-if="formData.category === 'vehicle_fuel'" class="col-12 md:col-6">
              <label for="distance_km" class="block mb-2 font-semibold">Distance (km)</label>
              <InputNumber
                id="distance_km"
                v-model="formData.distance_km"
                mode="decimal"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
                class="w-full"
              />
            </div>

            <!-- Description -->
            <div class="col-12">
              <label for="description" class="block mb-2 font-semibold">Description/Notes</label>
              <Textarea
                id="description"
                v-model="formData.description"
                rows="4"
                placeholder="Enter expense details..."
                class="w-full"
              />
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex gap-2 mt-4">
            <Button
              type="submit"
              label="Create Expense"
              icon="pi pi-check"
              :loading="loading"
              :disabled="loading"
            />
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="handleCancel"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useExpenseStore } from '@/stores/expense';
import { useRouteStore } from '@/stores/route';
import { useVehicleStore } from '@/stores/vehicle';
import Breadcrumb from 'primevue/breadcrumb';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const expenseStore = useExpenseStore();
const vehicleStore = useVehicleStore();
const routeStore = useRouteStore();
const { showSuccess, showError } = useToastNotification();

const home = ref({ icon: 'pi pi-home', to: '/dashboard' });
const breadcrumbItems = ref([{ label: 'Expenses', to: '/expenses' }, { label: 'Create' }]);

const formData = ref({
  expense_date: new Date(),
  category: null,
  amount: null,
  description: '',
  vehicle_id: null,
  route_id: null,
  distance_km: null,
});

const errors = ref({});
const loading = ref(false);
const vehicles = ref([]);
const routes = ref([]);

const categoryOptions = ref([
  { value: 'vehicle_fuel', label: 'Vehicle Fuel' },
  { value: 'vehicle_repair', label: 'Vehicle Repair' },
  { value: 'utility_bills', label: 'Utility Bills' },
  { value: 'store_maintenance', label: 'Store Maintenance' },
  { value: 'equipment_repair', label: 'Equipment Repair' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'rent', label: 'Rent' },
  { value: 'other', label: 'Other' },
]);

const isVehicleExpense = computed(() => {
  return formData.value.category === 'vehicle_fuel' || formData.value.category === 'vehicle_repair';
});

const onCategoryChange = () => {
  if (!isVehicleExpense.value) {
    formData.value.vehicle_id = null;
    formData.value.route_id = null;
    formData.value.distance_km = null;
  }
};

const validate = () => {
  errors.value = {};

  if (!formData.value.expense_date) {
    errors.value.expense_date = 'Expense date is required';
  }
  if (!formData.value.category) {
    errors.value.category = 'Category is required';
  }
  if (!formData.value.amount || formData.value.amount <= 0) {
    errors.value.amount = 'Amount must be greater than 0';
  }
  if (isVehicleExpense.value && !formData.value.vehicle_id) {
    errors.value.vehicle_id = 'Vehicle is required for vehicle-related expenses';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) {
    showError('Please fix the validation errors');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      expense_date: formData.value.expense_date.toISOString().split('T')[0],
      category: formData.value.category,
      amount: formData.value.amount,
      description: formData.value.description || null,
      vehicle_id: formData.value.vehicle_id || null,
      route_id: formData.value.route_id || null,
      distance_km: formData.value.distance_km || null,
    };

    await expenseStore.createExpense(payload);
    showSuccess('Expense created successfully');
    router.push('/expenses');
  } catch (error) {
    showError(error.message || 'Failed to create expense');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.push('/expenses');
};

const loadData = async () => {
  try {
    // Load vehicles
    await vehicleStore.fetchVehicles({ limit: 1000 });
    vehicles.value = vehicleStore.vehicles;

    // Load routes
    await routeStore.fetchRoutes({ limit: 1000 });
    routes.value = routeStore.routes;
  } catch (error) {
    showError('Failed to load form data');
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.expense-create {
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
