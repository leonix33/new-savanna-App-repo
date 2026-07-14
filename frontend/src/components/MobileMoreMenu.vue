<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  open: { type: Boolean, default: false },
  sections: { type: Array, default: () => [] }
});

const emit = defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="more-menu-overlay" @click.self="emit('close')">
      <div class="more-menu-panel card" role="dialog" aria-modal="true" aria-label="More navigation">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-black">More</h2>
          <button class="btn-secondary px-3 py-2" type="button" @click="emit('close')">Close</button>
        </div>
        <div v-for="section in sections" :key="section.title" class="mt-5">
          <p class="text-xs font-black uppercase tracking-[0.2em] text-orange-300">{{ section.title }}</p>
          <nav class="mt-2 space-y-1">
            <RouterLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-orange-100/80 transition hover:bg-orange-950/70 hover:text-orange-50"
              @click="emit('close')"
            >
              <span class="text-base">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>
  </Teleport>
</template>
