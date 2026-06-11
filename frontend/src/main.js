import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { registerSW } from 'virtual:pwa-register';
import App from './App.vue';
import { router } from './router/index.js';
import './styles.css';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new window.CustomEvent('pwa-update-available', { detail: { updateSW } }));
  }
});

createApp(App).use(createPinia()).use(router).mount('#app');
