<script setup>
import { reactive, ref } from 'vue';
import { http } from '../api/http.js';

const form = reactive({
  platform: 'Mixed',
  tone: 'Energetic',
  campaignGoal: 'Fill the weekly content calendar',
  audience: 'Savannah BBQ fans, lunch customers, catering prospects',
  featuredItems: 'Brisket, ribs, smoked wings, catering trays',
  promo: 'Weekend family pack'
});
const output = ref('');

async function generate() {
  const { data } = await http.post('/ai/generate', {
    task: 'weekly_planner',
    platform: form.platform,
    tone: form.tone,
    input: { ...form },
    save: true
  });
  output.value = data.output;
}
</script>

<template>
  <section class="space-y-6">
    <div class="card">
      <p class="page-kicker">Planning rhythm</p>
      <h1 class="page-title">Weekly Planner</h1>
      <p class="page-copy">Generate a 7-day platform calendar with prep notes, campaign intent, and featured items.</p>
    </div>
    <form class="card grid gap-4 md:grid-cols-2" @submit.prevent="generate">
      <label v-for="key in Object.keys(form)" :key="key">
        <span class="label capitalize">{{ key.replace(/([A-Z])/g, ' $1') }}</span>
        <input v-model="form[key]" class="input" />
      </label>
      <button class="btn md:col-span-2">Generate weekly calendar</button>
    </form>
    <pre class="card min-h-80 whitespace-pre-wrap text-sm leading-6 text-orange-50/90">{{ output || 'Calendar output will appear here after generation.' }}</pre>
  </section>
</template>
