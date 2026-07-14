<script setup>
defineProps({
  kicker: { type: String, default: '' },
  title: { type: String, required: true },
  copy: { type: String, default: '' }
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p v-if="kicker" class="page-kicker">{{ kicker }}</p>
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="copy" class="page-copy">{{ copy }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>
