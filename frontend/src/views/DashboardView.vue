<script setup>
import { onMounted, ref } from 'vue';
import LoadingCard from '../components/LoadingCard.vue';
import SetupChecklist from '../components/SetupChecklist.vue';
import StatusBanner from '../components/StatusBanner.vue';
import { http } from '../api/http.js';
import { useApiRequest } from '../composables/useApiRequest.js';

const analytics = ref(null);
const { loading, error, run } = useApiRequest();

onMounted(async () => {
  const { data } = await run(() => http.get('/analytics'), { toastOnError: false });
  analytics.value = data;
});
</script>

<template>
  <section class="space-y-6">
    <div class="card overflow-hidden p-0">
      <div class="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
        <div>
          <p class="page-kicker">Growth operations</p>
          <h1 class="page-title">savannah-bbq</h1>
          <p class="page-copy">
            Generate campaigns, manage the content queue, review comments, and publish from one service.
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
            Generate copy, send strong drafts into the queue, then review comments before publishing.
          </p>
        </div>
      </div>
    </div>

    <StatusBanner v-if="error" tone="error" :message="error" />

    <div class="grid gap-4 md:grid-cols-4">
      <div v-for="(value, key) in analytics?.totals || {}" :key="key" class="stat-card">
        <p class="text-sm font-bold capitalize text-orange-200">{{ key.replace(/([A-Z])/g, ' $1') }}</p>
        <p class="mt-2 text-3xl font-black">{{ value }}</p>
      </div>
      <LoadingCard v-if="loading && !analytics" class="md:col-span-4" message="Loading operating metrics..." />
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
        <p class="mt-2 text-sm leading-6 text-orange-100/65">Classify customer comments and approve reply drafts before publishing.</p>
      </RouterLink>
    </div>

    <SetupChecklist />
  </section>
</template>
