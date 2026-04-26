<script setup lang="ts">
defineProps<{
    balance: number;
}>();

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
};
</script>

<template>
    <div
        class="border-round-xl p-4 shadow-3 text-white"
        :style="{
            background: balance >= 0
                ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                : 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)'
        }"
    >
        <div class="flex align-items-center justify-content-between mb-3">
            <span class="text-sm font-medium uppercase" style="letter-spacing:.08em; opacity:.85">Saldo del período</span>
            <div class="flex align-items-center justify-content-center border-circle" style="width:2.5rem;height:2.5rem;background:rgba(255,255,255,.15);">
                <i class="pi pi-credit-card text-white"></i>
            </div>
        </div>
        <p class="text-4xl font-bold m-0">{{ formatCurrency(balance) }}</p>
        <p class="text-sm mt-2 mb-0" style="opacity:.8;">
            <i :class="balance >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="mr-1"></i>
            {{ balance >= 0 ? 'Balance positivo' : 'Balance negativo' }}
        </p>
    </div>
</template>