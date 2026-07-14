<script setup>
import { reactive, ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBanner from '../components/StatusBanner.vue';
import { http } from '../api/http.js';
import { useApiRequest } from '../composables/useApiRequest.js';

const tasks = [
  ['campaign', 'Campaign Generator'],
  ['facebook_reel_captions', 'Facebook Reel captions'],
  ['viral_hooks', 'Short viral hooks'],
  ['hashtags', 'Hashtag Generator'],
  ['customer_replies', 'Customer comment replies'],
  ['weekend_promos', 'Weekend promo post ideas'],
  ['event_announcements', 'Event announcements'],
  ['catering_promotions', 'Catering promotions'],
  ['email_campaigns', 'Email campaigns']
];

const form = reactive({
  task: 'campaign',
  platform: 'Facebook',
  tone: 'Friendly',
  menuItem: 'Brisket plate',
  goal: 'Drive lunch orders',
  audience: 'Savannah locals and office teams',
  notes: ''
});
const output = ref('');
const { loading, error, run } = useApiRequest();

async function generate() {
  const { data } = await run(
    () =>
      http.post('/ai/generate', {
        task: form.task,
        platform: form.platform,
        tone: form.tone,
        input: { ...form },
        save: true
      }),
    { successMessage: 'Campaign copy generated.' }
  );
  output.value = data.output;
}

async function queueOutput() {
  await run(
    () =>
      http.post('/queue', {
        platform: form.platform,
        tone: form.tone,
        content: output.value,
        mediaType: 'text'
      }),
    { successMessage: 'Added to queue and ready for scheduling.' }
  );
}
</script>

<template>
  <section class="grid gap-6 xl:grid-cols-[430px_1fr]">
    <form class="card space-y-5" @submit.prevent="generate">
      <PageHeader
        kicker="Content studio"
        title="AI Generator"
        copy="Create Savannah-ready campaign copy, hooks, replies, promos, and email drafts."
      />
      <label>
        <span class="label">Task</span>
        <select v-model="form.task" class="input">
          <option v-for="[value, label] in tasks" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <div class="grid gap-3 md:grid-cols-2">
        <label><span class="label">Platform</span><input v-model="form.platform" class="input" /></label>
        <label><span class="label">Tone</span><input v-model="form.tone" class="input" /></label>
      </div>
      <label><span class="label">Menu item / offer</span><input v-model="form.menuItem" class="input" /></label>
      <label><span class="label">Goal</span><input v-model="form.goal" class="input" /></label>
      <label><span class="label">Audience</span><input v-model="form.audience" class="input" /></label>
      <label><span class="label">Notes</span><textarea v-model="form.notes" class="input min-h-28" /></label>
      <button class="btn w-full" :disabled="loading">{{ loading ? 'Generating...' : 'Generate' }}</button>
    </form>
    <div class="card flex min-h-[520px] flex-col">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="badge">Draft output</p>
          <h2 class="mt-3 text-2xl font-black">Generated copy</h2>
        </div>
        <button class="btn-secondary" :disabled="!output || loading" @click="queueOutput">Add to queue</button>
      </div>
      <StatusBanner v-if="error" class="mb-4" tone="error" :message="error" />
      <pre class="min-h-96 flex-1 whitespace-pre-wrap rounded-3xl border border-orange-900/40 bg-black/30 p-5 text-sm leading-6 text-orange-50/90">{{ output || 'Generated copy will appear here after you choose a task and click Generate.' }}</pre>
    </div>
  </section>
</template>
