<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MobileMoreMenu from './components/MobileMoreMenu.vue';
import ToastHost from './components/ToastHost.vue';
import { useAuthStore } from './stores/auth.js';
import { mobileNav, moreNavSections } from './utils/navigation.js';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const updateAvailable = ref(false);
const applyAppUpdate = ref(null);
const showMoreMenu = ref(false);

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
const mobileNavItems = computed(() =>
  mobileNav.filter((item) => !item.requiresEdit || auth.canEdit)
);
const moreSections = computed(() =>
  moreNavSections({ canEdit: auth.canEdit, isAdmin: auth.isAdmin })
);
const isLoginRoute = computed(() => route.name === 'login');
const userInitials = computed(() =>
  (auth.user?.name || auth.user?.email || 'GE')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
);

function isMobileActive(item) {
  if (item.exact) return route.path === item.to;
  return route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to));
}

async function logout() {
  await auth.logout();
  router.push('/login');
}

function handlePwaUpdate(event) {
  updateAvailable.value = true;
  applyAppUpdate.value = event.detail.updateSW;
}

function reloadForUpdate() {
  applyAppUpdate.value?.(true);
}

onMounted(() => {
  window.addEventListener('pwa-update-available', handlePwaUpdate);
});

onBeforeUnmount(() => {
  window.removeEventListener('pwa-update-available', handlePwaUpdate);
});
</script>

<template>
  <ToastHost />

  <div class="min-h-screen min-h-dvh">
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

    <div v-if="!isLoginRoute" class="mobile-content-column flex min-h-screen min-h-dvh flex-col lg:ml-72">
      <header class="mobile-header safe-top sticky top-0 z-10 border-b border-orange-900/40 bg-pit/85 px-4 py-3 backdrop-blur lg:hidden">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="page-kicker">Savannah BBQ</p>
            <p class="font-black">Growth Engine</p>
          </div>
          <button class="btn-secondary px-3 py-2" @click="logout">Sign out</button>
        </div>
      </header>

      <main class="mobile-main flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>

      <nav
        class="mobile-tab-bar safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-orange-900/40 bg-pit/95 backdrop-blur lg:hidden"
        aria-label="Main navigation"
      >
        <RouterLink
          v-for="item in mobileNavItems"
          :key="item.to"
          :to="item.to"
          :title="item.label"
          :aria-label="item.label"
          class="mobile-tab flex flex-1 flex-col items-center justify-center gap-0.5 font-medium transition"
          :class="isMobileActive(item) ? 'bg-orange-900/40 text-orange-100' : 'text-orange-200/55 hover:text-orange-100/80'"
        >
          <span class="mobile-tab-icon" :class="isMobileActive(item) ? 'text-orange-200' : 'text-orange-300/50'">
            {{ item.icon }}
          </span>
          <span class="mobile-tab-label">{{ item.label }}</span>
        </RouterLink>
        <button
          type="button"
          class="mobile-tab flex flex-1 flex-col items-center justify-center gap-0.5 font-medium text-orange-200/55 transition hover:text-orange-100/80"
          aria-label="More navigation"
          @click="showMoreMenu = true"
        >
          <span class="mobile-tab-icon text-orange-300/50">☰</span>
          <span class="mobile-tab-label">More</span>
        </button>
      </nav>

      <MobileMoreMenu :open="showMoreMenu" :sections="moreSections" @close="showMoreMenu = false" />
    </div>

    <main v-else class="min-h-screen">
      <RouterView />
    </main>

    <div
      v-if="updateAvailable"
      class="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-xl rounded-3xl border border-orange-700/50 bg-pit/95 p-4 shadow-2xl shadow-black/40 backdrop-blur lg:bottom-4"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-black text-orange-50">Update ready</p>
          <p class="mt-1 text-sm text-orange-100/70">A fresh version of Savannah BBQ is ready to install.</p>
        </div>
        <button class="btn shrink-0" @click="reloadForUpdate">Update now</button>
      </div>
    </div>
  </div>
</template>
