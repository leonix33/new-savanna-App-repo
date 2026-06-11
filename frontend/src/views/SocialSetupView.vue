<script setup>
import { onMounted, ref } from 'vue';
import { http } from '../api/http.js';

const setup = ref(null);

onMounted(async () => {
  const { data } = await http.get('/settings/social');
  setup.value = data;
});
</script>

<template>
  <section class="space-y-6">
    <div class="card">
      <p class="page-kicker">Connection safety</p>
      <h1 class="page-title">Social Media Setup</h1>
      <p class="page-copy">Review connection readiness and safety flags. Publishing writes remain disabled until explicitly implemented.</p>
    </div>
    <div class="grid gap-4 md:grid-cols-3">
      <div v-for="(value, key) in setup || {}" :key="key" class="stat-card">
        <h2 class="mb-3 text-xl font-black capitalize">{{ key }}</h2>
        <pre class="whitespace-pre-wrap text-sm leading-6 text-orange-100/80">{{ value }}</pre>
      </div>
      <div v-if="!setup" class="empty-state md:col-span-3">Loading social setup state...</div>
    </div>
    <div class="card">
      <h2 class="text-xl font-black">Meta setup checklist</h2>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-orange-100/80">
        <li>Set <code>FACEBOOK_PAGE_ID</code>, <code>FACEBOOK_PAGE_ACCESS_TOKEN</code>, and graph version.</li>
        <li>Keep <code>LIVE_SOCIAL_PUBLISHING=false</code> until real publishing is implemented and reviewed.</li>
        <li>Use comment fetch to test read-only Meta access before any future write work.</li>
      </ul>
    </div>
  </section>
</template>
