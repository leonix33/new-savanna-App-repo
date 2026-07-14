<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm action' },
  message: { type: String, default: 'Are you sure you want to continue?' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  busy: { type: Boolean, default: false }
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-dialog card max-w-md" role="dialog" aria-modal="true" :aria-label="title">
        <h2 class="text-xl font-black">{{ title }}</h2>
        <p class="mt-3 text-sm leading-6 text-orange-100/75">{{ message }}</p>
        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button class="btn-secondary" type="button" :disabled="busy" @click="emit('cancel')">
            {{ cancelLabel }}
          </button>
          <button class="btn" type="button" :disabled="busy" @click="emit('confirm')">
            {{ busy ? 'Working...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
