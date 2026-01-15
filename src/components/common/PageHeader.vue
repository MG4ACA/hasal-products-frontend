<template>
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="page-subtitle">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.default" class="header-actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: null,
  },
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  flex: 1;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
}

.page-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #666;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
