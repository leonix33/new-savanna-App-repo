import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import AnalyticsView from '../views/AnalyticsView.vue';
import CommentsView from '../views/CommentsView.vue';
import DashboardView from '../views/DashboardView.vue';
import GeneratorView from '../views/GeneratorView.vue';
import LoginView from '../views/LoginView.vue';
import MenuLabView from '../views/MenuLabView.vue';
import QueueView from '../views/QueueView.vue';
import SocialSetupView from '../views/SocialSetupView.vue';
import UsersView from '../views/UsersView.vue';
import WeeklyPlannerView from '../views/WeeklyPlannerView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/generator', component: GeneratorView, meta: { requiresAuth: true, editor: true } },
    { path: '/menu-lab', component: MenuLabView, meta: { requiresAuth: true, editor: true } },
    { path: '/weekly-planner', component: WeeklyPlannerView, meta: { requiresAuth: true, editor: true } },
    { path: '/queue', component: QueueView, meta: { requiresAuth: true } },
    { path: '/comments', component: CommentsView, meta: { requiresAuth: true } },
    { path: '/analytics', component: AnalyticsView, meta: { requiresAuth: true } },
    { path: '/social-setup', component: SocialSetupView, meta: { requiresAuth: true } },
    { path: '/users', component: UsersView, meta: { requiresAuth: true, admin: true } }
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.accessToken && !auth.user) {
    try {
      await auth.loadMe();
    } catch {
      await auth.logout();
    }
  }
  if (to.meta.requiresAuth && !auth.user) return '/login';
  if (to.meta.admin && !auth.isAdmin) return '/';
  if (to.meta.editor && !auth.canEdit) return '/';
  return true;
});
