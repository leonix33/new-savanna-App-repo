<script setup>
import { reactive, ref } from 'vue';
import { http } from '../api/http.js';

const form = reactive({
  platform: 'Facebook',
  tone: 'Warm and local',
  signatureItems: 'Brisket, ribs, pulled pork, mac and cheese',
  weeklySpecials: 'Friday rib plate, Saturday family pack',
  happyHour: '3-5pm smoked wings',
  deliveryOffer: 'Free delivery for office orders over $75',
  audience: 'Local families, office teams, and event planners',
  goal: 'More weekend orders and catering leads'
});
const output = ref('');
const loading = ref(false);

async function run() {
  loading.value = true;
  try {
    const { data } = await http.post('/ai/generate', {
      task: 'menu_specials_lab',
      platform: form.platform,
      tone: form.tone,
      input: { ...form },
      save: true
    });
    output.value = data.output;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="grid gap-6 xl:grid-cols-[440px_1fr]">
    <form class="card space-y-5" @submit.prevent="run">
      <div>
        <p class="page-kicker">Offer lab</p>
        <h1 class="page-title">Menu & Specials Lab</h1>
        <p class="page-copy">Turn signature items, weekly promos, and delivery offers into a polished local plan.</p>
      </div>
      <label v-for="key in Object.keys(form)" :key="key">
        <span class="label capitalize">{{ key.replace(/([A-Z])/g, ' $1') }}</span>
        <textarea v-if="key !== 'platform' && key !== 'tone'" v-model="form[key]" class="input min-h-20" />
        <input v-else v-model="form[key]" class="input" />
      </label>
      <button class="btn w-full" :disabled="loading">{{ loading ? 'Building...' : 'Build plan' }}</button>
    </form>
    <div class="card">
      <p class="badge">Draft plan</p>
      <h2 class="mb-4 mt-3 text-2xl font-black">Menu plan</h2>
      <pre class="min-h-96 whitespace-pre-wrap rounded-3xl border border-orange-900/40 bg-black/30 p-5 text-sm leading-6 text-orange-50/90">{{ output || 'Your menu plan will appear here after you build a plan.' }}</pre>
    </div>
  </section>
</template>
