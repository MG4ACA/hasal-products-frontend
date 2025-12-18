<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

const props = defineProps({
  rawMaterials: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['view', 'edit', 'delete']);

// Format category for display
const formatCategory = category => {
  const categoryMap = {
    spice: 'Spice',
    packaging: 'Packaging',
    other: 'Other',
  };
  return categoryMap[category] || category;
};

// Get category badge class
const getCategoryClass = category => {
  const classMap = {
    spice: 'category-spice',
    packaging: 'category-packaging',
    other: 'category-other',
  };
  return classMap[category] || '';
};

// Get status badge class
const getStatusClass = status => {
  return status === 'active' ? 'status-active' : 'status-inactive';
};

// Check if stock is low
const isLowStock = rawMaterial => {
  if (!rawMaterial.current_stock || !rawMaterial.reorder_level) return false;
  return parseFloat(rawMaterial.current_stock) <= parseFloat(rawMaterial.reorder_level);
};

// Handle action events
const handleView = rawMaterial => emit('view', rawMaterial);
const handleEdit = rawMaterial => emit('edit', rawMaterial);
const handleDelete = rawMaterial => emit('delete', rawMaterial);
</script>

<template>
  <div class="raw-material-list">
    <DataTable
      :value="rawMaterials"
      :loading="loading"
      striped-rows
      responsive-layout="scroll"
      :row-hover="true"
      class="raw-material-table"
    >
      <!-- Empty State -->
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox" />
          <p>No raw materials found</p>
        </div>
      </template>

      <!-- Loading State -->
      <template #loading>
        <div class="loading-state">
          <i class="pi pi-spinner pi-spin" />
          <p>Loading raw materials...</p>
        </div>
      </template>

      <!-- Code Column -->
      <Column field="code" header="Code" :sortable="true" style="min-width: 120px">
        <template #body="{ data }">
          <span class="code-badge">{{ data.code }}</span>
        </template>
      </Column>

      <!-- Name Column -->
      <Column field="name" header="Name" :sortable="true" style="min-width: 200px">
        <template #body="{ data }">
          <span class="material-name">{{ data.name }}</span>
        </template>
      </Column>

      <!-- Category Column -->
      <Column field="category" header="Category" :sortable="true" style="min-width: 120px">
        <template #body="{ data }">
          <span class="category-badge" :class="getCategoryClass(data.category)">
            {{ formatCategory(data.category) }}
          </span>
        </template>
      </Column>

      <!-- Unit Column -->
      <Column field="unit" header="Unit" :sortable="true" style="min-width: 100px">
        <template #body="{ data }">
          <span class="unit-text">{{ data.unit }}</span>
        </template>
      </Column>

      <!-- Current Stock Column -->
      <Column
        field="current_stock"
        header="Current Stock"
        :sortable="true"
        style="min-width: 140px"
      >
        <template #body="{ data }">
          <div class="stock-cell">
            <span class="stock-value" :class="{ 'low-stock': isLowStock(data) }">
              {{ data.current_stock || '0' }} {{ data.unit }}
            </span>
            <i
              v-if="isLowStock(data)"
              v-tooltip.top="'Stock below reorder level'"
              class="pi pi-exclamation-triangle low-stock-icon"
            />
          </div>
        </template>
      </Column>

      <!-- Reorder Level Column -->
      <Column
        field="reorder_level"
        header="Reorder Level"
        :sortable="true"
        style="min-width: 140px"
      >
        <template #body="{ data }">
          <span class="reorder-level">{{ data.reorder_level || '-' }} {{ data.unit }}</span>
        </template>
      </Column>

      <!-- Status Column -->
      <Column field="status" header="Status" :sortable="true" style="min-width: 100px">
        <template #body="{ data }">
          <span class="status-badge" :class="getStatusClass(data.status)">
            {{ data.status === 'active' ? 'Active' : 'Inactive' }}
          </span>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Actions" style="min-width: 150px">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              v-tooltip.top="'View Details'"
              icon="pi pi-eye"
              class="p-button-text p-button-sm"
              @click="handleView(data)"
            />
            <Button
              v-tooltip.top="'Edit'"
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              @click="handleEdit(data)"
            />
            <Button
              v-tooltip.top="'Delete'"
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              @click="handleDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.raw-material-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.raw-material-table {
  font-size: 0.875rem;
}

/* Empty and Loading States */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state i,
.loading-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.loading-state i {
  color: #3b82f6;
}

.empty-state p,
.loading-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Code Badge */
.code-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.813rem;
  font-weight: 600;
  color: #1f2937;
}

/* Material Name */
.material-name {
  font-weight: 600;
  color: #1f2937;
}

/* Category Badges */
.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.category-spice {
  background: #fef3c7;
  color: #92400e;
}

.category-packaging {
  background: #dbeafe;
  color: #1e40af;
}

.category-other {
  background: #e5e7eb;
  color: #374151;
}

/* Unit Text */
.unit-text {
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
}

/* Stock Cell */
.stock-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-value {
  font-weight: 600;
  color: #059669;
}

.stock-value.low-stock {
  color: #ef4444;
}

.low-stock-icon {
  color: #f59e0b;
  font-size: 0.875rem;
}

/* Reorder Level */
.reorder-level {
  color: #6b7280;
  font-weight: 500;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .raw-material-table {
    font-size: 0.813rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.125rem;
  }
}
</style>
