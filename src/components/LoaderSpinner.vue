<template>
  <div v-if="loading" class="loader-overlay">
    <div class="loader-box surface-card shadow-3">

      <!-- Spinner propio con color del tema -->
      <svg class="spinner" viewBox="0 0 50 50">
        <circle
          class="path"
          cx="25" cy="25" r="20"
          fill="none"
          stroke="var(--p-primary-color)"
          stroke-width="4"
        />
      </svg>

      <p class="m-0 mt-2">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { loading, loadingMessage } from '@/stores/loading';

const message = computed(() => loadingMessage.value);
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  z-index: 9999;
}
.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  min-width: 160px;
}

.spinner {
  width: 48px;
  height: 48px;
  animation: rotate 1.4s linear infinite;
}
.path {
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.4s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}
@keyframes dash {
  0%   { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
  50%  { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; }
  100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; }
}
</style>
