import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const items = ref([]);
  let nextId = 0;

  function push(message, type = 'info', duration = 4000) {
    const id = ++nextId;
    items.value.push({ id, message, type });
    if (duration > 0) {
      globalThis.setTimeout(() => dismiss(id), duration);
    }
    return id;
  }

  function success(message) {
    return push(message, 'success');
  }

  function error(message) {
    return push(message, 'error', 6000);
  }

  function info(message) {
    return push(message, 'info');
  }

  function dismiss(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  return { items, push, success, error, info, dismiss };
});
