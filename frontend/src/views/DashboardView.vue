<script setup>
import { onMounted, ref } from 'vue';
import { http } from '../api/http.js';

const analytics = ref(null);

onMounted(async () => {
  const { data } = await http.get('/analytics');
  analytics.value = data;
});
</script>

<template>
  <section class="space-y-6">
    <div class="card overflow-hidden p-0">
      <div class="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
        <div>
          <p class="page-kicker">Enterprise rebuild</p>
          <h1 class="page-title">savanna bbq growth</h1>
          <p class="page-copy">
            Generate campaigns, manage the content queue, review comments, and simulate publishing from one service.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink class="btn" to="/generator">Create campaign</RouterLink>
            <RouterLink class="btn-secondary" to="/queue">Open queue</RouterLink>
          </div>
        </div>
        <div class="rounded-3xl border border-orange-800/30 bg-black/25 p-5">
          <p class="badge">Today focus</p>
          <p class="mt-4 text-2xl font-black leading-tight">Keep content moving from idea to scheduled post.</p>
          <p class="mt-3 text-sm leading-6 text-orange-100/65">
            Generate copy, send strong drafts into the queue, then review comments before publishing simulation.
          </p>
        </div>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-4">
      <div v-for="(value, key) in analytics?.totals || {}" :key="key" class="stat-card">
        <p class="text-sm font-bold capitalize text-orange-200">{{ key.replace(/([A-Z])/g, ' $1') }}</p>
        <p class="mt-2 text-3xl font-black">{{ value }}</p>
      </div>
      <div v-if="!analytics" class="empty-state md:col-span-4">Loading operating metrics...</div>
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
      <RouterLink class="panel transition hover:border-orange-600/60 hover:bg-orange-950/30" to="/generator">
        <p class="badge">Step 1</p>
        <h2 class="mt-4 text-xl font-black">Create campaign copy</h2>
        <p class="mt-2 text-sm leading-6 text-orange-100/65">Draft posts, emails, hooks, and promo copy with saved AI generations.</p>
      </RouterLink>
      <RouterLink class="panel transition hover:border-orange-600/60 hover:bg-orange-950/30" to="/queue">
        <p class="badge">Step 2</p>
        <h2 class="mt-4 text-xl font-black">Schedule content</h2>
        <p class="mt-2 text-sm leading-6 text-orange-100/65">Move approved content into the queue and manage publishing states.</p>
      </RouterLink>
      <RouterLink class="panel transition hover:border-orange-600/60 hover:bg-orange-950/30" to="/comments">
        <p class="badge">Step 3</p>
        <h2 class="mt-4 text-xl font-black">Review replies</h2>
        <p class="mt-2 text-sm leading-6 text-orange-100/65">Classify customer comments and approve reply drafts before simulation.</p>
      </RouterLink>
    </div>
    <div class="card">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-black">Best-practice review notes</h2>
          <p class="mt-1 text-sm text-orange-100/65">Immediate product risks to address after this UI pass.</p>
        </div>
        <RouterLink class="btn-secondary" to="/analytics">View analytics</RouterLink>
      </div>
      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <p class="surface-list text-sm leading-6 text-orange-100/70">Add shared API loading and error states so every view handles failed requests gracefully.</p>
        <p class="surface-list text-sm leading-6 text-orange-100/70">Replace browser alerts with inline toasts or status banners for queue and generator actions.</p>
        <p class="surface-list text-sm leading-6 text-orange-100/70">Move repeated form/output layouts into components as the UI grows past this MVP.</p>
      </div>
    </div>
  </section>
</template>
