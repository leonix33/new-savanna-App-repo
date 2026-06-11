<script setup>
import { onMounted, reactive, ref } from 'vue';
import { http } from '../api/http.js';

const users = ref([]);
const error = ref('');
const success = ref('');
const saving = ref(false);
const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'viewer'
});

async function load() {
  const { data } = await http.get('/users');
  users.value = data.users;
}

async function add() {
  error.value = '';
  success.value = '';
  saving.value = true;
  try {
    const { data } = await http.post('/users', form);
    Object.assign(form, { name: '', email: '', password: '', role: 'viewer' });
    success.value = `${data.user.name} was created.`;
    await load();
  } catch (err) {
    error.value =
      err.response?.data?.details?.[0]?.message || err.response?.data?.message || 'Unable to create user.';
  } finally {
    saving.value = false;
  }
}

async function update(user, patch) {
  await http.patch(`/users/${user.id || user._id}`, patch);
  await load();
}

onMounted(load);
</script>

<template>
  <section class="space-y-6">
    <div class="card">
      <p class="page-kicker">Access control</p>
      <h1 class="page-title">Users & Roles</h1>
      <p class="page-copy">Create operators, assign roles, and disable accounts without leaving the admin workspace.</p>
    </div>
    <form class="card grid gap-4 md:grid-cols-4" @submit.prevent="add">
      <label><span class="label">Name</span><input v-model="form.name" class="input" minlength="2" placeholder="Name" required /></label>
      <label><span class="label">Email</span><input v-model="form.email" class="input" placeholder="Email" required type="email" /></label>
      <label>
        <span class="label">Password</span>
        <input
          v-model="form.password"
          autocomplete="new-password"
          class="input"
          minlength="8"
          placeholder="At least 8 characters"
          required
          type="password"
        />
      </label>
      <label>
        <span class="label">Role</span>
        <select v-model="form.role" class="input">
          <option>viewer</option>
          <option>editor</option>
          <option>admin</option>
        </select>
      </label>
      <p v-if="error" class="rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200 md:col-span-4">
        {{ error }}
      </p>
      <p
        v-if="success"
        class="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100 md:col-span-4"
      >
        {{ success }}
      </p>
      <button class="btn md:col-span-4" :disabled="saving">{{ saving ? 'Creating user...' : 'Create user' }}</button>
    </form>
    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="text-orange-300">
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t border-orange-900/40">
            <td class="py-4 font-bold">{{ user.name }}</td>
            <td class="text-orange-100/70">{{ user.email }}</td>
            <td>
              <select class="input max-w-32" :value="user.role" @change="update(user, { role: $event.target.value })">
                <option>viewer</option>
                <option>editor</option>
                <option>admin</option>
              </select>
            </td>
            <td><span class="badge">{{ user.isActive ? 'active' : 'disabled' }}</span></td>
            <td>
              <button class="btn-secondary" @click="update(user, { isActive: !user.isActive })">
                {{ user.isActive ? 'Disable' : 'Enable' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!users.length" class="empty-state mt-4">No users loaded yet.</p>
    </div>
  </section>
</template>
