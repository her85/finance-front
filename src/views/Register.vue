<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/api/supabase';
import { useRouter } from 'vue-router';
import { showLoading, hideLoading } from '@/stores/loading';
import { sanitizeText } from '@/utils/sanitize';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const loading = ref(false);
const error = ref('');
const errors = ref({ name: '', email: '', password: '', passwordConfirm: '' });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (): boolean => {
    errors.value = { name: '', email: '', password: '', passwordConfirm: '' };
    let valid = true;

    if (!name.value.trim()) {
        errors.value.name = 'El nombre es requerido.';
        valid = false;
    }

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

    if (!passwordConfirm.value) {
        errors.value.passwordConfirm = 'Confirmá tu contraseña.';
        valid = false;
    } else if (password.value !== passwordConfirm.value) {
        errors.value.passwordConfirm = 'Las contraseñas no coinciden.';
        valid = false;
    }

    return valid;
};

const register = async () => {
    if (!validate()) return;
    loading.value = true;
    error.value = '';
    showLoading('Creando cuenta...');
    try {
        const emailVal = email.value.trim().toLowerCase();
        const { /*data: signUpData,*/ error: signUpError } = await supabase.auth.signUp({ email: emailVal, password: password.value });
        if (signUpError) throw signUpError;

        // Try to sign in after sign up (some Supabase configs auto-login, others require email confirm)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: emailVal, password: password.value });
        if (signInError) {
            // Account created but sign-in failed (e.g. confirmation required)
            error.value = 'Registro creado. Confirmá tu email si es necesario.';
            router.push('/login');
            return;
        }

        // Create or update profile row if possible
        if (signInData?.user?.id) {
            await supabase.from('profiles').upsert({ id: signInData.user.id, name: sanitizeText(name.value) });
        }

        await router.push('/');
    } catch (err: unknown) {
        const supErr = err as { message?: string };
        if (supErr?.message && (supErr.message.toLowerCase().includes('already') || supErr.message.toLowerCase().includes('duplicate'))) {
            errors.value.email = 'Este email ya está registrado.';
        } else {
            error.value = 'No se pudo crear la cuenta. Intentá de nuevo.';
        }
    } finally {
        loading.value = false;
        hideLoading();
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
                <p class="text-color-secondary mt-2 mb-0">Creá tu cuenta</p>
            </div>

            <Card class="shadow-4">
                <template #content>
                    <div class="flex flex-column gap-4">

                        <div class="flex flex-column gap-1">
                            <label for="name" class="font-medium text-sm">Nombre</label>
                            <InputText
                                id="name"
                                v-model="name"
                                type="text"
                                placeholder="Tu nombre"
                                :invalid="!!errors.name"
                                class="w-full"
                                @keyup.enter="register"
                            />
                            <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
                        </div>

                        <div class="flex flex-column gap-1">
                            <label for="email" class="font-medium text-sm">Email</label>
                            <InputText
                                id="email"
                                v-model="email"
                                type="email"
                                placeholder="tu@email.com"
                                :invalid="!!errors.email"
                                class="w-full"
                                @keyup.enter="register"
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
                                @keyup.enter="register"
                            />
                            <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
                        </div>

                        <div class="flex flex-column gap-1">
                            <label for="passwordConfirm" class="font-medium text-sm">Confirmar contraseña</label>
                            <Password
                                id="passwordConfirm"
                                v-model="passwordConfirm"
                                placeholder="••••••••"
                                class="w-full"
                                :feedback="false"
                                :invalid="!!errors.passwordConfirm"
                                toggleMask
                                @keyup.enter="register"
                            />
                            <small v-if="errors.passwordConfirm" class="text-red-500">{{ errors.passwordConfirm }}</small>
                        </div>

                        <p v-if="error" class="m-0 text-red-500 text-sm text-center">
                            <i class="pi pi-exclamation-circle mr-1"></i>{{ error }}
                        </p>

                        <Button
                            label="Crear cuenta"
                            icon="pi pi-user-plus"
                            :loading="loading"
                            class="w-full"
                            @click="register"
                        />

                        <p class="text-center text-sm text-color-secondary m-0">
                            ¿Ya tenés cuenta?
                            <RouterLink to="/login" class="text-primary font-medium">Ingresá</RouterLink>
                        </p>

                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>
