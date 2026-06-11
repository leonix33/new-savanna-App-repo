<script setup>
import { onMounted, reactive, ref } from 'vue';
import { http } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const items = ref([]);
const logs = ref([]);
const form = reactive({
  platform: 'Facebook',
  tone: 'Friendly',
  content: '',
  scheduledDate: '',
  scheduledTime: '',
  timezone: 'America/New_York'
});

async function load() {
  const [queueResponse, logsResponse] = await Promise.all([
    http.get('/queue'),
    http.get('/logs/publishing')
  ]);
  items.value = queueResponse.data.items;
  logs.value = logsResponse.data.logs;
}

async function add() {
  await http.post('/queue', form);
  form.content = '';
  await load();
}

async function updateStatus(item, status) {
  await http.patch(`/queue/${item._id}`, { status });
  await load();
}

async function runScheduler() {
  await http.post('/scheduler/run');
  await load();
}

onMounted(load);
</script>

<template>
  <section class="space-y-6">
    <div class="card flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="page-kicker">Publishing ops</p>
        <h1 class="page-title">Content Queue</h1>
        <p class="page-copy">Compose, schedule, and simulate posts before anything reaches live publishing.</p>
      </div>
      <button v-if="auth.isAdmin" class="btn" @click="runScheduler">Run scheduler</button>
    </div>
    <form v-if="auth.canEdit" class="card grid gap-4 md:grid-cols-2" @submit.prevent="add">
      <label><span class="label">Platform</span><input v-model="form.platform" class="input" placeholder="Facebook" /></label>
      <label><span class="label">Tone</span><input v-model="form.tone" class="input" placeholder="Friendly" /></label>
      <label class="md:col-span-2">
        <span class="label">Post content</span>
        <textarea v-model="form.content" class="input min-h-32" placeholder="Write or paste the post content..." />
      </label>
      <label><span class="label">Date</span><input v-model="form.scheduledDate" class="input" type="date" /></label>
      <label><span class="label">Time</span><input v-model="form.scheduledTime" class="input" type="time" /></label>
      <label class="md:col-span-2"><span class="label">Timezone</span><input v-model="form.timezone" class="input" /></label>
      <button class="btn md:col-span-2">Add queue item</button>
    </form>
    <div class="grid gap-4 xl:grid-cols-2">
      <div class="card space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-black">Queue</h2>
          <span class="badge">{{ items.length }} items</span>
        </div>
        <p v-if="!items.length" class="empty-state">No queue items yet. Add a post above or send generated copy from the AI Generator.</p>
        <article v-for="item in items" :key="item._id" class="surface-list">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-black">{{ item.platform }}</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{{ item.status }}</p>
            </div>
            <select v-if="auth.canEdit" class="input max-w-40" :value="item.status" @change="updateStatus(item, $event.target.value)">
              <option v-for="status in ['queued', 'scheduled', 'publishing', 'posted', 'failed']" :key="status">{{ status }}</option>
            </select>
          </div>
          <p class="mt-4 whitespace-pre-wrap text-sm leading-6 text-orange-100/80">{{ item.content }}</p>
          <p class="mt-4 rounded-full bg-orange-950/40 px-3 py-1 text-xs text-orange-300">
            {{ item.scheduledDate || 'No date' }} {{ item.scheduledTime || '' }} {{ item.timezone }}
          </p>
        </article>
      </div>
      <div class="card space-y-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-black">Publishing log</h2>
          <span class="badge">{{ logs.length }} events</span>
        </div>
        <p v-if="!logs.length" class="empty-state">Scheduler activity will appear here after a run.</p>
        <article v-for="log in logs" :key="log._id" class="surface-list text-sm">
          <p class="font-bold">{{ log.platform }} · {{ log.status }}</p>
          <p class="mt-2 leading-6 text-orange-100/70">{{ log.message || log.errorMessage }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
