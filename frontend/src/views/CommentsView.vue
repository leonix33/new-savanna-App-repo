<script setup>
import { onMounted, reactive, ref } from 'vue';
import { http } from '../api/http.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const comments = ref([]);
const status = ref({});
const form = reactive({ sourcePost: 'Manual entry', commenterName: 'Guest', commentText: '' });

async function load() {
  const [commentResponse, statusResponse] = await Promise.all([
    http.get('/comments'),
    http.get('/comments/status')
  ]);
  comments.value = commentResponse.data.comments;
  status.value = statusResponse.data;
}

async function addManual() {
  await http.post('/comments', form);
  form.commentText = '';
  await load();
}

async function action(id, name, body = {}) {
  await http.post(`/comments/${id}/${name}`, body);
  await load();
}

async function addDemo() {
  await http.post('/comments/demo');
  await load();
}

async function fetchMeta() {
  await http.post('/comments/fetch-facebook');
  await load();
}

onMounted(load);
</script>

<template>
  <section class="space-y-6">
    <div class="card flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="page-kicker">Customer care</p>
        <h1 class="page-title">Comment Automation</h1>
        <p class="page-copy">Classify customer comments, draft replies, approve responses, and simulate reply handling.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="badge">Demo {{ status.demoMode ? 'on' : 'off' }}</span>
        <span class="badge">Facebook {{ status.facebookReadConfigured ? 'ready' : 'not ready' }}</span>
      </div>
    </div>
    <form v-if="auth.canEdit" class="card grid gap-4 md:grid-cols-3" @submit.prevent="addManual">
      <label><span class="label">Source post</span><input v-model="form.sourcePost" class="input" /></label>
      <label><span class="label">Commenter</span><input v-model="form.commenterName" class="input" /></label>
      <label class="md:col-span-3"><span class="label">Customer comment</span><input v-model="form.commentText" class="input" placeholder="Customer comment" /></label>
      <button class="btn">Add manual comment</button>
      <button class="btn-secondary" type="button" @click="addDemo">Add demo comments</button>
      <button class="btn-secondary" type="button" :disabled="!status.facebookReadConfigured" @click="fetchMeta">
        Fetch Facebook comments
      </button>
    </form>
    <div class="grid gap-4">
      <p v-if="!comments.length" class="empty-state">No comments yet. Add one manually or load demo comments to test the workflow.</p>
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
          <button class="btn-secondary" @click="action(comment._id, 'classify')">Classify</button>
          <button class="btn-secondary" @click="action(comment._id, 'draft-reply')">Draft reply</button>
          <button class="btn-secondary" @click="action(comment._id, 'approve', { replyText: comment.suggestedReply })">
            Approve
          </button>
          <button class="btn" @click="action(comment._id, 'simulate-reply')">Simulate reply</button>
        </div>
      </article>
    </div>
  </section>
</template>
