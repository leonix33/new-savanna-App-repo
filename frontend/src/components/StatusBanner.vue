<script setup>
defineProps({
  tone: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error', 'warning'].includes(value)
  },
  message: { type: String, required: true }
});

const toneClass = {
  info: 'border-orange-700/40 bg-orange-950/30 text-orange-100',
  success: 'border-green-400/30 bg-green-950/30 text-green-100',
  error: 'border-red-400/30 bg-red-950/30 text-red-100',
  warning: 'border-amber-400/30 bg-amber-950/30 text-amber-100'
};
</script>

<template>
  <p class="rounded-2xl border px-4 py-3 text-sm font-semibold leading-6" :class="toneClass[tone]">
    {{ message }}
  </p>
</template>
