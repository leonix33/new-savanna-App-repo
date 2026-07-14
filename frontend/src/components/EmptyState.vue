<script setup>
defineProps({
  message: { type: String, default: 'Nothing here yet.' }
});
</script>

<template>
  <p class="empty-state">{{ message }}</p>
</template>
