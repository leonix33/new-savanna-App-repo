<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const nav = computed(() => [
  ['/', 'Dashboard', true],
  ['/generator', 'AI Generator', auth.canEdit],
  ['/menu-lab', 'Menu Lab', auth.canEdit],
  ['/weekly-planner', 'Planner', auth.canEdit],
  ['/queue', 'Queue', true],
  ['/comments', 'Comments', true],
  ['/analytics', 'Analytics', true],
  ['/social-setup', 'Social Setup', true],
  ['/users', 'Users', auth.isAdmin]
]);
const visibleNav = computed(() => nav.value.filter(([, , show]) => show));
const isLoginRoute = computed(() => route.name === 'login');
const userInitials = computed(() =>
  (auth.user?.name || auth.user?.email || 'GE')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
);

async function logout() {
  await auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen">
    <aside
      v-if="!isLoginRoute"
      class="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-orange-900/40 bg-black/35 p-5 backdrop-blur-xl lg:block"
    >
      <div class="mb-8 rounded-3xl border border-orange-900/40 bg-orange-950/20 p-4">
        <p class="page-kicker">Savannah BBQ</p>
        <h1 class="mt-2 text-2xl font-black tracking-tight">Growth Engine</h1>
        <p class="mt-2 text-sm leading-6 text-orange-200/75">Campaigns, queue, comments, and ops in one kitchen.</p>
      </div>
      <nav class="space-y-1.5">
        <RouterLink
          v-for="[href, label] in visibleNav"
          :key="href"
          :to="href"
          class="group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-orange-100/80 transition hover:bg-orange-950/70 hover:text-orange-50"
          active-class="bg-orange-900/60 text-orange-50"
        >
          <span>{{ label }}</span>
          <span class="h-1.5 w-1.5 rounded-full bg-orange-300 opacity-0 transition group-[.router-link-active]:opacity-100" />
        </RouterLink>
      </nav>
      <div class="absolute inset-x-5 bottom-5 rounded-3xl border border-orange-900/40 bg-black/25 p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-900/70 text-sm font-black">
            {{ userInitials }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-bold">{{ auth.user?.name || 'Operator' }}</p>
            <p class="truncate text-xs text-orange-200/60">{{ auth.user?.role || auth.user?.email }}</p>
          </div>
        </div>
        <button class="btn-secondary mt-4 w-full" @click="logout">Sign out</button>
      </div>
    </aside>

    <div
      v-if="!isLoginRoute"
      class="sticky top-0 z-10 border-b border-orange-900/40 bg-pit/85 px-4 py-3 backdrop-blur lg:hidden"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <p class="page-kicker">Savannah BBQ</p>
          <p class="font-black">Growth Engine</p>
        </div>
        <button class="btn-secondary px-3 py-2" @click="logout">Sign out</button>
      </div>
      <nav class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <RouterLink
          v-for="[href, label] in visibleNav"
          :key="href"
          :to="href"
          class="shrink-0 rounded-full border border-orange-900/50 bg-black/20 px-3 py-2 text-xs font-bold text-orange-100/75"
          active-class="border-orange-500 bg-orange-900/60 text-orange-50"
        >
          {{ label }}
        </RouterLink>
      </nav>
    </div>

    <main :class="!isLoginRoute ? 'lg:ml-72' : ''" class="min-h-screen p-4 sm:p-6 lg:p-8">
      <RouterView />
    </main>
  </div>
</template>
