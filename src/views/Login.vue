<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/api/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const errors = ref({ email: '', password: '' });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (): boolean => {
    errors.value = { email: '', password: '' };
    let valid = true;
    const trimmedEmail = email.value.trim();
    if (!trimmedEmail) {
        errors.value.email = 'El email es requerido.';
        valid = false;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        errors.value.email = 'Ingresá un email válido.';
        valid = false;
    }
    if (!password.value) {
        errors.value.password = 'La contraseña es requerida.';
        valid = false;
    } else if (password.value.length < 8) {
        errors.value.password = 'La contraseña debe tener al menos 8 caracteres.';
        valid = false;
    }
    return valid;
};

const login = async () => {
    if (!validate()) return;
    loading.value = true;
    error.value = '';
    try {
        const emailVal = email.value.trim().toLowerCase();
        const res = await supabase.auth.signInWithPassword({ email: emailVal, password: password.value });
        if (res.error) {
            error.value = 'Email o contraseña incorrectos.';
        } else {
            await router.push('/');
        }
    } catch {
        error.value = 'Email o contraseña incorrectos.';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="flex justify-content-center align-items-center" style="min-height: calc(100vh - 80px);">
        <div style="width: 100%; max-width: 400px;">

            <div class="text-center mb-5">
                <div class="inline-flex align-items-center justify-content-center border-circle bg-primary mb-3" style="width:4rem;height:4rem;">
                    <i class="pi pi-wallet text-white text-2xl"></i>
                </div>
                <h2 class="text-3xl font-bold m-0">FinanceApp</h2>
                <p class="text-color-secondary mt-2 mb-0">Ingresá para continuar</p>
            </div>

            <Card class="shadow-4">
                <template #content>
                    <div class="flex flex-column gap-4">

                        <div class="flex flex-column gap-1">
                            <label for="email" class="font-medium text-sm">Email</label>
                            <InputText
                                id="email"
                                v-model="email"
                                type="email"
                                placeholder="tu@email.com"
                                :invalid="!!errors.email"
                                class="w-full"
                                @keyup.enter="login"
                            />
                            <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
                        </div>

                        <div class="flex flex-column gap-1">
                            <label for="password" class="font-medium text-sm">Contraseña</label>
                            <Password
                                id="password"
                                v-model="password"
                                placeholder="••••••••"
                                class="w-full"
                                :feedback="false"
                                :invalid="!!errors.password"
                                toggleMask
                                @keyup.enter="login"
                            />
                            <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
                        </div>

                        <p v-if="error" class="m-0 text-red-500 text-sm text-center">
                            <i class="pi pi-exclamation-circle mr-1"></i>{{ error }}
                        </p>

                        <Button
                            label="Ingresar"
                            icon="pi pi-sign-in"
                            :loading="loading"
                            class="w-full"
                            @click="login"
                        />

                        <p class="text-center text-sm text-color-secondary m-0">
                            ¿No tenés cuenta?
                            <RouterLink to="/register" class="text-primary font-medium">Registrate</RouterLink>
                        </p>
                        <p class="text-center text-sm text-color-secondary mt-2 m-0">
                            <RouterLink to="/" class="text-primary font-medium">Volver al inicio</RouterLink>
                        </p>

                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>