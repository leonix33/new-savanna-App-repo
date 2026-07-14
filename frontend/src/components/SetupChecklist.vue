<script setup>
import { computed, onMounted, ref } from 'vue';
import { http } from '../api/http.js';
import { useApiRequest } from '../composables/useApiRequest.js';
import { useAuthStore } from '../stores/auth.js';
import StatusBanner from './StatusBanner.vue';

const auth = useAuthStore();
const { loading, error, run } = useApiRequest();
const health = ref(null);
const testPostMsg = ref('');
const testPostError = ref('');
const testPostBusy = ref(false);

const items = computed(() => {
  const h = health.value || {};
  return [
    {
      id: 'mongo',
      label: 'Database',
      ok: Boolean(h.mongoConnected),
      hint: h.mongoConnected ? 'MongoDB connected' : 'MongoDB not connected — data may not persist'
    },
    {
      id: 'openai',
      label: 'AI generation',
      ok: Boolean(h.openaiConfigured),
      hint: h.openaiConfigured
        ? `Live mode · ${h.openaiTextModel || 'gpt-4o-mini'}`
        : 'Demo mode — add OPENAI_API_KEY for live AI output'
    },
    {
      id: 'facebook-read',
      label: 'Facebook read access',
      ok: Boolean(h.facebookReadOnlyReady),
      hint: h.facebookReadOnlyReady
        ? `Page + token configured · Graph ${h.facebookGraphVersion || 'v20.0'}`
        : 'Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN'
    },
    {
      id: 'facebook-publish',
      label: 'Facebook publishing',
      optional: !h.facebookPublishEnabled,
      ok: Boolean(h.facebookPublishReady),
      hint: !h.facebookPublishEnabled
        ? 'Simulation mode — set FACEBOOK_PUBLISH_ENABLED=true to go live'
        : h.facebookPublishReady
          ? 'Live Facebook text publishing is ready'
          : 'Publish flag is on but page credentials are missing'
    },
    {
      id: 'instagram',
      label: 'Instagram publishing',
      optional: true,
      ok: Boolean(h.instagramConfigured),
      hint: h.instagramConfigured ? 'Business ID configured' : 'Not implemented yet — config placeholder only'
    },
    {
      id: 'tiktok',
      label: 'TikTok publishing',
      optional: true,
      ok: Boolean(h.tiktokConfigured),
      hint: h.tiktokConfigured ? 'Business ID configured' : 'Not implemented yet — config placeholder only'
    }
  ];
});

const coreReady = computed(() => {
  const h = health.value || {};
  return Boolean(h.mongoConnected && h.openaiConfigured);
});

async function load() {
  testPostMsg.value = '';
  testPostError.value = '';
  try {
    const { data } = await run(() => http.get('/setup/status'), { toastOnError: false });
    health.value = data;
  } catch {
    try {
      const { data } = await http.get('/health');
      health.value = data;
    } catch {
      health.value = null;
    }
  }
}

async function testFacebookPost() {
  testPostBusy.value = true;
  testPostMsg.value = '';
  testPostError.value = '';
  try {
    const { data } = await http.post('/integrations/facebook/test-post', {
      message: 'Savannah BBQ Growth Engine — Facebook integration test post.'
    });
    testPostMsg.value = data.message || (data.simulated ? 'Simulated publish succeeded.' : 'Facebook test post sent.');
  } catch (err) {
    testPostError.value = err.response?.data?.message || err.message || 'Facebook test failed';
  } finally {
    testPostBusy.value = false;
  }
}

onMounted(load);
defineExpose({ refresh: load });
</script>

<template>
  <div class="card space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="page-kicker">System readiness</p>
        <h2 class="text-xl font-black">Setup checklist</h2>
        <p class="mt-1 text-sm text-orange-100/65">
          Review database, AI, and social connections before scheduling or publishing.
        </p>
      </div>
      <button class="btn-secondary" type="button" :disabled="loading" @click="load">
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <StatusBanner v-if="error" tone="error" :message="error" />

    <ul class="space-y-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-start gap-3 rounded-2xl border border-orange-900/40 bg-black/25 px-4 py-3 text-sm"
      >
        <span
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black"
          :class="
            item.ok
              ? 'bg-green-500/20 text-green-300'
              : item.optional
                ? 'bg-orange-950/60 text-orange-300/60'
                : 'bg-amber-500/15 text-amber-300'
          "
        >
          {{ item.ok ? '✓' : item.optional ? '○' : '!' }}
        </span>
        <span>
          <span class="font-bold text-orange-50">{{ item.label }}</span>
          <span class="mt-0.5 block text-xs leading-5 text-orange-100/60">{{ item.hint }}</span>
        </span>
      </li>
    </ul>

    <p v-if="coreReady" class="text-xs text-green-300">
      Core services ready — generate content, queue posts, and review comments.
    </p>
    <p v-else class="text-xs text-amber-300">
      Finish database and AI setup before relying on production workflows.
    </p>

    <div v-if="auth.isAdmin" class="rounded-2xl border border-orange-900/40 bg-black/25 p-4">
      <p class="text-sm font-bold text-orange-50">Facebook test post</p>
      <p class="mt-1 text-xs leading-5 text-orange-100/60">
        Sends a harmless test message. When publish is disabled, the backend returns a simulated response.
      </p>
      <button class="btn-secondary mt-3" type="button" :disabled="testPostBusy" @click="testFacebookPost">
        {{ testPostBusy ? 'Testing...' : 'Run Facebook test' }}
      </button>
      <p v-if="testPostMsg" class="mt-2 text-xs text-green-300">{{ testPostMsg }}</p>
      <p v-if="testPostError" class="mt-2 text-xs text-red-300">{{ testPostError }}</p>
    </div>

    <div v-if="health?.safety" class="rounded-2xl border border-orange-900/40 bg-black/25 p-4 text-xs text-orange-100/70">
      <p class="font-bold text-orange-100">Safety flags</p>
      <ul class="mt-2 space-y-1">
        <li>Auto publish: {{ health.safety.autoPublishMode ? 'on' : 'off' }}</li>
        <li>Live Facebook mode: {{ health.safety.liveFacebookMode ? 'on' : 'off' }}</li>
        <li>Live social publishing: {{ health.safety.liveSocialPublishing ? 'on' : 'off' }}</li>
        <li>Facebook publish enabled: {{ health.safety.facebookPublishEnabled ? 'on' : 'off' }}</li>
      </ul>
    </div>
  </div>
</template>
