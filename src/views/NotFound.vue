<template>
    <div class="flex flex-column justify-content-center align-items-center" style="min-height: calc(100vh - 80px); gap: 1.5rem;">

        <div class="inline-flex align-items-center justify-content-center border-circle bg-primary-100" style="width:6rem;height:6rem;">
            <i class="pi pi-exclamation-triangle text-primary" style="font-size: 2.5rem;"></i>
        </div>

        <div class="text-center">
            <h1 class="m-0 font-bold" style="font-size: 5rem; line-height: 1; color: var(--primary-color);">404</h1>
            <h2 class="mt-2 mb-1 text-2xl font-semibold">Página no encontrada</h2>
            <p class="text-color-secondary m-0">La página que buscás no existe o fue movida.</p>
        </div>

        <Button
            label="Volver al inicio"
            icon="pi pi-home"
            @click="router.push('/')"
        />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
