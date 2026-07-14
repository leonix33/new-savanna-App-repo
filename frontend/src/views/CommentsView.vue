<script setup>
import { onMounted, reactive, ref } from 'vue';
import EmptyState from '../components/EmptyState.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBanner from '../components/StatusBanner.vue';
import { http } from '../api/http.js';
import { useApiRequest } from '../composables/useApiRequest.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const comments = ref([]);
const status = ref({});
const { loading, error, run } = useApiRequest();
const form = reactive({ sourcePost: 'Manual entry', commenterName: 'Guest', commentText: '' });

async function load() {
  const [commentResponse, statusResponse] = await run(
    () => Promise.all([http.get('/comments'), http.get('/comments/status')]),
    { toastOnError: false }
  );
  comments.value = commentResponse.data.comments;
  status.value = statusResponse.data;
}

async function addManual() {
  await run(() => http.post('/comments', form), { successMessage: 'Comment added.' });
  form.commentText = '';
  await load();
}

async function action(id, name, body = {}) {
  await run(() => http.post(`/comments/${id}/${name}`, body), {
    successMessage: `Comment ${name.replace('-', ' ')} complete.`
  });
  await load();
}

async function addDemo() {
  await run(() => http.post('/comments/demo'), { successMessage: 'Demo comments loaded.' });
  await load();
}

async function fetchMeta() {
  await run(() => http.post('/comments/fetch-facebook'), {
    successMessage: 'Facebook comments fetched.'
  });
  await load();
}

onMounted(load);
</script>

<template>
  <section class="space-y-6">
    <div class="card">
      <PageHeader
        kicker="Customer care"
        title="Comment Automation"
        copy="Classify customer comments, draft replies, approve responses, and simulate reply handling."
      >
        <template #actions>
          <div class="flex flex-wrap gap-2">
            <span class="badge">Demo {{ status.demoMode ? 'on' : 'off' }}</span>
            <span class="badge">Facebook {{ status.facebookReadConfigured ? 'ready' : 'not ready' }}</span>
          </div>
        </template>
      </PageHeader>
    </div>

    <StatusBanner v-if="error" tone="error" :message="error" />

    <form v-if="auth.canEdit" class="card grid gap-4 md:grid-cols-3" @submit.prevent="addManual">
      <label><span class="label">Source post</span><input v-model="form.sourcePost" class="input" /></label>
      <label><span class="label">Commenter</span><input v-model="form.commenterName" class="input" /></label>
      <label class="md:col-span-3">
        <span class="label">Customer comment</span>
        <input v-model="form.commentText" class="input" placeholder="Customer comment" />
      </label>
      <button class="btn" :disabled="loading">{{ loading ? 'Saving...' : 'Add manual comment' }}</button>
      <button class="btn-secondary" type="button" :disabled="loading" @click="addDemo">Add demo comments</button>
      <button
        class="btn-secondary"
        type="button"
        :disabled="loading || !status.facebookReadConfigured"
        @click="fetchMeta"
      >
        Fetch Facebook comments
      </button>
    </form>
    <div class="grid gap-4">
      <EmptyState v-if="!comments.length" message="No comments yet. Add one manually or load demo comments to test the workflow." />
      <article v-for="comment in comments" :key="comment._id" class="card">
        <div class="flex flex-wrap justify-between gap-3">
          <div>
            <p class="font-black">{{ comment.commenterName }}</p>
            <p class="mt-1 text-sm text-orange-300">{{ comment.sourcePost }} · {{ comment.status }}</p>
          </div>
          <p class="badge">{{ comment.classification || 'unclassified' }}</p>
        </div>
        <p class="mt-4 leading-7 text-orange-50/90">{{ comment.commentText }}</p>
        <textarea
          v-if="comment.suggestedReply"
          class="input mt-3 min-h-24"
          :value="comment.suggestedReply"
          @change="comment.suggestedReply = $event.target.value"
        />
        <div v-if="auth.canEdit" class="mt-4 flex flex-wrap gap-2">
          <button class="btn-secondary" :disabled="loading" @click="action(comment._id, 'classify')">Classify</button>
          <button class="btn-secondary" :disabled="loading" @click="action(comment._id, 'draft-reply')">Draft reply</button>
          <button
            class="btn-secondary"
            :disabled="loading"
            @click="action(comment._id, 'approve', { replyText: comment.suggestedReply })"
          >
            Approve
          </button>
          <button class="btn" :disabled="loading" @click="action(comment._id, 'simulate-reply')">Simulate reply</button>
        </div>
      </article>
    </div>
  </section>
</template>
