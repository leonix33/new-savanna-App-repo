<script setup>
defineProps({
  message: { type: String, default: 'Loading...' }
});
</script>

<template>
  <div class="empty-state animate-pulse">{{ message }}</div>
</template>
