<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { currentUser, signOut } from '@/api/supabase';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { showLoading, hideLoading } from '@/stores/loading';
import LoaderSpinner from '@/components/LoaderSpinner.vue';

const router = useRouter();
const toast = useToast();
const isDark = ref(false);
const drawerOpen = ref(false);

const userInitials = computed(() => {
    const name: string = currentUser.value?.name || currentUser.value?.email || '?';
    return name.slice(0, 2).toUpperCase();
});

const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('app-dark', isDark.value);
    localStorage.setItem('darkMode', String(isDark.value));
    toast.add({
        severity: 'info',
        summary: isDark.value ? 'Modo oscuro' : 'Modo claro',
        detail: isDark.value ? 'Tema oscuro activado.' : 'Tema claro activado.',
        life: 2000,
    });
};

onMounted(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
        isDark.value = true;
        document.documentElement.classList.add('app-dark');
    }
});

const logout = async () => {
    showLoading('Cerrando sesión...');
    try {
        await signOut();
        drawerOpen.value = false;
        toast.add({ severity: 'info', summary: 'Sesión cerrada', detail: 'Hasta luego.', life: 2000 });
        await router.push('/login');
    } finally {
        hideLoading();
    }
};
</script>

<template>
    <div class="min-h-screen surface-ground">
        <LoaderSpinner />

        <!-- Topbar -->
        <Toolbar v-if="currentUser" class="topbar surface-card shadow-2 px-4 py-3" style="position: sticky; top: 0; z-index: 100;">
            <template #start>
                <div class="flex align-items-center gap-3">
                    <i class="pi pi-wallet text-primary text-2xl"></i>
                    <span class="text-xl font-bold text-color">FinanceApp</span>
                </div>
            </template>
            <template #end>
                <div class="flex align-items-center gap-2">
                    <Button
                        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
                        rounded
                        text
                        severity="secondary"
                        @click="toggleDarkMode"
                        :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'"
                    />
                    <Avatar
                        :label="userInitials"
                        shape="circle"
                        class="cursor-pointer"
                        style="background-color: var(--p-primary-500); color: #fff; font-weight: 700;"
                        @click="drawerOpen = true"
                    />
                </div>
            </template>
        </Toolbar>

        <!-- Contenido principal -->
        <main class="px-3 py-4" style="max-width: 960px; margin: 0 auto;">
            <router-view />
        </main>

        <Toast position="top-right" />

        <!-- Drawer lateral de usuario -->
        <Drawer v-model:visible="drawerOpen" position="right" :style="{ width: '280px' }">
            <template #header>
                <span class="font-bold text-lg">Mi cuenta</span>
            </template>

            <div class="flex flex-column align-items-center gap-3 py-4">
                <Avatar
                    :label="userInitials"
                    shape="circle"
                    size="xlarge"
                    style="background-color: var(--p-primary-500); color: #fff; font-size: 1.5rem; font-weight: 700;"
                />
                <div class="text-center">
                    <p class="font-bold text-lg m-0">{{ currentUser?.name || 'Usuario' }}</p>
                    <p class="text-color-secondary text-sm m-0 mt-1">{{ currentUser?.email }}</p>
                </div>
            </div>

            <Divider />

            <div class="flex flex-column gap-2">
                <Button
                    label="Cerrar sesión"
                    icon="pi pi-sign-out"
                    severity="danger"
                    outlined
                    class="w-full"
                    @click="logout"
                />
            </div>
        </Drawer>
    </div>
</template>

<!-- Styles consolidated in src/assets/styles/main.css -->