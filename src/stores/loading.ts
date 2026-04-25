import { ref } from 'vue';

export const loading = ref(false);
export const loadingMessage = ref('Cargando...');

export function showLoading(msg?: string) {
  loadingMessage.value = msg ?? 'Cargando...';
  loading.value = true;
}

export function hideLoading() {
  loading.value = false;
  loadingMessage.value = 'Cargando...';
}

export function useLoading() {
  return { loading, loadingMessage, showLoading, hideLoading };
}
