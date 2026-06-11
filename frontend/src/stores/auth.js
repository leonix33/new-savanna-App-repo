import { defineStore } from 'pinia';
import { http } from '../api/http.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user || state.accessToken),
    isAdmin: (state) => state.user?.role === 'admin',
    canEdit: (state) => ['admin', 'editor'].includes(state.user?.role)
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const { data } = await http.post('/auth/login', credentials);
        this.user = data.user;
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
      } finally {
        this.loading = false;
      }
    },
    async loginForLocalDev() {
      this.loading = true;
      try {
        const { data } = await http.post('/auth/dev-login');
        this.user = data.user;
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
      } finally {
        this.loading = false;
      }
    },
    async loadMe() {
      if (!this.accessToken) return;
      const { data } = await http.get('/auth/me');
      this.user = data.user;
    },
    async logout() {
      try {
        await http.post('/auth/logout');
      } finally {
        this.user = null;
        this.accessToken = null;
        localStorage.removeItem('accessToken');
      }
    }
  }
});
