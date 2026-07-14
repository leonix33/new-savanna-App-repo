import { ref } from 'vue';
import { useToastStore } from '../stores/toast.js';

export function useApiRequest() {
  const loading = ref(false);
  const error = ref('');
  const toast = useToastStore();

  async function run(fn, options = {}) {
    const {
      successMessage,
      errorMessage,
      toastOnError = true,
      toastOnSuccess = false
    } = options;

    loading.value = true;
    error.value = '';

    try {
      const result = await fn();
      if (successMessage && toastOnSuccess) toast.success(successMessage);
      return result;
    } catch (err) {
      const msg =
        err.response?.data?.message || errorMessage || err.message || 'Request failed';
      error.value = msg;
      if (toastOnError) toast.error(msg);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, run };
}
