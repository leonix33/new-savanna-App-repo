<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();
const form = reactive({ email: 'admin@savannahbbq.local', password: 'ChangeMe123!' });
const error = ref('');
const showLocalDevLogin = import.meta.env.DEV;

async function submit() {
  error.value = '';
  try {
    await auth.login(form);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  }
}

async function loginForLocalDev() {
  error.value = '';
  try {
    await auth.loginForLocalDev();
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Local dev login failed';
  }
}
</script>

<template>
  <section class="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
    <div class="hidden lg:block">
      <p class="page-kicker">Savannah BBQ</p>
      <h1 class="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight">
        Run the content kitchen with a cleaner command center.
      </h1>
      <p class="mt-5 max-w-2xl text-lg leading-8 text-orange-100/70">
        Plan campaigns, generate copy, schedule queue items, and review comment replies from one focused workspace.
      </p>
      <div class="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
        <div class="panel">
          <p class="text-2xl font-black">AI</p>
          <p class="mt-1 text-sm text-orange-100/65">Campaign generation</p>
        </div>
        <div class="panel">
          <p class="text-2xl font-black">Ops</p>
          <p class="mt-1 text-sm text-orange-100/65">Queue simulation</p>
        </div>
        <div class="panel">
          <p class="text-2xl font-black">Meta</p>
          <p class="mt-1 text-sm text-orange-100/65">Comment workflow</p>
        </div>
      </div>
    </div>

    <form class="card w-full space-y-5 p-6 sm:p-8" @submit.prevent="submit">
      <div>
        <p class="page-kicker">Secure access</p>
        <h1 class="page-title">Welcome back</h1>
        <p class="page-copy">Sign in to manage Savannah BBQ campaigns, publishing queues, and customer replies.</p>
      </div>
      <label>
        <span class="label">Email</span>
        <input v-model="form.email" autocomplete="email" class="input" type="email" />
      </label>
      <label>
        <span class="label">Password</span>
        <input v-model="form.password" autocomplete="current-password" class="input" type="password" />
      </label>
      <p v-if="error" class="rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
        {{ error }}
      </p>
      <button class="btn w-full" :disabled="auth.loading">{{ auth.loading ? 'Signing in...' : 'Sign in' }}</button>
      <button
        v-if="showLocalDevLogin"
        class="btn-secondary w-full"
        type="button"
        :disabled="auth.loading"
        @click="loginForLocalDev"
      >
        Local dev login
      </button>
      <p class="rounded-2xl bg-black/20 px-4 py-3 text-xs leading-5 text-orange-200/70">
        Seed the first admin with <code>npm run seed:admin</code>.
      </p>
    </form>
  </section>
</template>
