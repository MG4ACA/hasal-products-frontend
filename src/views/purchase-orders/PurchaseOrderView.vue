<template>
  <div class="purchase-order-view-page">
    <PurchaseOrderViewComponent
      v-if="purchaseOrderId"
      :purchase-order-id="purchaseOrderId"
      @edit="handleEdit"
      @receive="handleReceive"
      @close="handleClose"
    />
  </div>
</template>

<script setup>
import PurchaseOrderViewComponent from '@/components/purchase-orders/PurchaseOrderView.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const receiveDialogVisible = ref(false);
const purchaseOrderId = computed(() => parseInt(route.params.id));

const handleEdit = () => {
  router.push(`/purchase-orders/${purchaseOrderId.value}/edit`);
};

const handleReceive = () => {
  router.push({
    name: 'PurchaseOrders',
    query: { receive: purchaseOrderId.value },
  });
};

const handleClose = () => {
  router.push('/purchase-orders');
};
</script>

<style scoped>
.purchase-order-view-page {
  padding: 20px;
}
</style>
