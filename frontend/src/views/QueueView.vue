<script setup>
import { onMounted, reactive, ref } from 'vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import EmptyState from '../components/EmptyState.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBanner from '../components/StatusBanner.vue';
import { http } from '../api/http.js';
import { useApiRequest } from '../composables/useApiRequest.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const items = ref([]);
const logs = ref([]);
const showSchedulerConfirm = ref(false);
const { loading, error, run } = useApiRequest();
const form = reactive({
  platform: 'Facebook',
  tone: 'Friendly',
  content: '',
  scheduledDate: '',
  scheduledTime: '',
  timezone: 'America/New_York'
});

async function load() {
  const [queueResponse, logsResponse] = await run(
    () => Promise.all([http.get('/queue'), http.get('/logs/publishing')]),
    { toastOnError: false }
  );
  items.value = queueResponse.data.items;
  logs.value = logsResponse.data.logs;
}

async function add() {
  await run(() => http.post('/queue', form), { successMessage: 'Queue item added.' });
  form.content = '';
  await load();
}

async function updateStatus(item, status) {
  await run(() => http.patch(`/queue/${item._id}`, { status }), {
    successMessage: `Queue item marked ${status}.`
  });
  await load();
}

async function runScheduler() {
  await run(() => http.post('/scheduler/run'), { successMessage: 'Scheduler run completed.' });
  showSchedulerConfirm.value = false;
  await load();
}

onMounted(load);
</script>

<template>
  <section class="space-y-6">
    <div class="card">
      <PageHeader
        kicker="Publishing ops"
        title="Content Queue"
        copy="Compose, schedule, and publish posts with full publishing logs."
      >
        <template #actions>
          <button v-if="auth.isAdmin" class="btn" :disabled="loading" @click="showSchedulerConfirm = true">
            Run scheduler
          </button>
        </template>
      </PageHeader>
    </div>

    <StatusBanner v-if="error" tone="error" :message="error" />

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
      <button class="btn md:col-span-2" :disabled="loading">{{ loading ? 'Saving...' : 'Add queue item' }}</button>
    </form>

    <div class="grid gap-4 xl:grid-cols-2">
      <div class="card space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-xl font-black">Queue</h2>
          <span class="badge">{{ items.length }} items</span>
        </div>
        <EmptyState v-if="!items.length" message="No queue items yet. Add a post above or send generated copy from the AI Generator." />
        <article v-for="item in items" :key="item._id" class="surface-list">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-black">{{ item.platform }}</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{{ item.status }}</p>
            </div>
            <select
              v-if="auth.canEdit"
              class="input max-w-40"
              :value="item.status"
              :disabled="loading"
              @change="updateStatus(item, $event.target.value)"
            >
              <option v-for="status in ['queued', 'scheduled', 'publishing', 'posted', 'failed']" :key="status">
                {{ status }}
              </option>
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
        <EmptyState v-if="!logs.length" message="Scheduler activity will appear here after a run." />
        <article v-for="log in logs" :key="log._id" class="surface-list text-sm">
          <p class="font-bold">{{ log.platform }} · {{ log.status }}</p>
          <p class="mt-2 leading-6 text-orange-100/70">{{ log.message || log.errorMessage }}</p>
        </article>
      </div>
    </div>

    <ConfirmDialog
      :open="showSchedulerConfirm"
      title="Run scheduler now?"
      message="This will process due queue items and attempt publishing based on your safety flags."
      confirm-label="Run scheduler"
      :busy="loading"
      @cancel="showSchedulerConfirm = false"
      @confirm="runScheduler"
    />
  </section>
</template>
