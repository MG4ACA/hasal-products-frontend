<script setup>
import { useToastNotification } from '@/composables/useToastNotification';
import { useVehicleStore } from '@/stores/vehicle';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';

const props = defineProps({
  vehicleId: {
    type: Number,
    required: true,
  },
});

const vehicleStore = useVehicleStore();
const { showError } = useToastNotification();

const loading = ref(false);
const assignmentHistory = ref([]);

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const calculateDuration = (assignedDate, unassignedDate) => {
  if (!assignedDate) return 'N/A';

  const start = new Date(assignedDate);
  const end = unassignedDate ? new Date(unassignedDate) : new Date();

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day';
  if (diffDays < 30) return `${diffDays} days`;

  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;

  if (months === 1 && remainingDays === 0) return '1 month';
  if (remainingDays === 0) return `${months} months`;
  return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
};

const loadHistory = async () => {
  try {
    loading.value = true;
    const response = await vehicleStore.fetchAssignmentHistory(props.vehicleId);
    assignmentHistory.value = response.history || [];
  } catch (error) {
    showError('Failed to load assignment history');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadHistory();
});

// Expose refresh method for parent components
defineExpose({
  refresh: loadHistory,
});
</script>

<template>
  <div class="assignment-history">
    <DataTable
      :value="assignmentHistory"
      :loading="loading"
      striped-rows
      responsive-layout="scroll"
      :paginator="assignmentHistory.length > 10"
      :rows="10"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rows-per-page-options="[10, 25, 50]"
      current-page-report-template="Showing {first} to {last} of {totalRecords} records"
    >
      <template #empty>
        <div class="text-center p-4 text-600">
          <i class="pi pi-inbox mb-3" style="font-size: 3rem" />
          <p class="m-0">No assignment history found</p>
        </div>
      </template>

      <Column header="Territory" style="min-width: 200px">
        <template #body="{ data }">
          <div>
            <div class="font-semibold text-900">
              {{ data.route?.name || 'N/A' }}
            </div>
            <div class="text-sm text-600">
              {{ data.route?.code || '' }}
            </div>
          </div>
        </template>
      </Column>

      <Column header="Assigned Date" style="min-width: 130px">
        <template #body="{ data }">
          {{ formatDate(data.assigned_date) }}
        </template>
      </Column>

      <Column header="Unassigned Date" style="min-width: 130px">
        <template #body="{ data }">
          {{ formatDate(data.unassigned_date) }}
        </template>
      </Column>

      <Column header="Duration" style="min-width: 130px">
        <template #body="{ data }">
          {{ calculateDuration(data.assigned_date, data.unassigned_date) }}
        </template>
      </Column>

      <Column header="Status" style="min-width: 100px">
        <template #body="{ data }">
          <Tag
            :value="data.is_current ? 'Current' : 'Past'"
            :severity="data.is_current ? 'success' : 'secondary'"
          />
        </template>
      </Column>

      <Column header="Notes" style="min-width: 200px">
        <template #body="{ data }">
          <span class="text-600">{{ data.notes || '-' }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.assignment-history {
  width: 100%;
}
</style>
