import { ref } from 'vue';

export const loading = ref(false);
export const loadingMessage = ref('Cargando...');
const loadingCount = ref(0);

export function showLoading(msg?: string) {
  loadingMessage.value = msg ?? 'Cargando...';
  loadingCount.value++;
  loading.value = true;
}

export function hideLoading() {
  loadingCount.value = Math.max(0, loadingCount.value - 1);
  if (loadingCount.value === 0) {
    loading.value = false;
    loadingMessage.value = 'Cargando...';
    loadingCount.value = 0;
  }
}

export function useLoading() {
  return { loading, loadingMessage, showLoading, hideLoading };
}
