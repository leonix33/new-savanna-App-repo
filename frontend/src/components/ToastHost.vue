<script setup>
import { useToastStore } from '../stores/toast.js';

const toast = useToastStore();

const toneClass = {
  success: 'border-green-400/30 bg-green-950/90 text-green-100',
  error: 'border-red-400/30 bg-red-950/90 text-red-100',
  info: 'border-orange-700/40 bg-pit/95 text-orange-100'
};
</script>

<template>
  <div class="toast-host" aria-live="polite">
    <div
      v-for="item in toast.items"
      :key="item.id"
      class="toast-item"
      :class="toneClass[item.type] || toneClass.info"
      role="status"
    >
      <p class="text-sm font-semibold leading-5">{{ item.message }}</p>
      <button class="toast-dismiss" type="button" aria-label="Dismiss" @click="toast.dismiss(item.id)">
        ×
      </button>
    </div>
  </div>
</template>
