<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const goLogin = () => router.push('/login');
//const goRegister = () => router.push('/register');
</script>

<template>
  <div class="flex align-items-center justify-content-center" style="min-height: calc(100vh - 80px);">
    <div class="surface-0 px-4 py-6 md:px-8 md:py-12 w-full" style="max-width:1100px;">
      <div class="grid align-items-center">

      <!-- Hero: texto + CTAs -->
      <div class="col-12 md:col-6">
        <h1 class="m-0 text-3xl md:text-4xl font-bold">Controla tus finanzas personales</h1>
        <p class="text-color-secondary mt-3">Registra ingresos y gastos, sincroniza en modo offline y obtén reportes sencillos para entender tu dinero.</p>

        <div class="flex gap-3 mt-5">
          <Button label="Iniciar sesión" class="p-button-lg p-button-primary" @click="goLogin" />
          <!--<Button label="Registrarse" class="p-button-lg" @click="goRegister" />-->
        </div>
      </div>

      <!-- Columna de características -->
      <div class="col-12 md:col-6">
        <Card class="shadow-1">
          <template #title>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-check-circle text-green-500 text-xl"></i>
              <span>Qué ofrecemos</span>
            </div>
          </template>

          <template #content>
            <ul class="list-none m-0 p-0">
              <li class="flex align-items-start gap-3 mb-4">
                <i class="pi pi-wallet text-primary text-xl mt-1"></i>
                <div>
                  <div class="font-semibold">Registro rápido</div>
                  <div class="text-color-secondary text-sm">Agrega movimientos en segundos desde el formulario.</div>
                </div>
              </li>
              <li class="flex align-items-start gap-3 mb-4">
                <i class="pi pi-cloud text-primary text-xl mt-1"></i>
                <div>
                  <div class="font-semibold">Sincronización offline</div>
                  <div class="text-color-secondary text-sm">Funciona sin conexión y sincroniza cuando vuelvas online.</div>
                </div>
              </li>
              <li class="flex align-items-start gap-3">
                <i class="pi pi-chart-line text-primary text-xl mt-1"></i>
                <div>
                  <div class="font-semibold">Reportes esenciales</div>
                  <div class="text-color-secondary text-sm">Totales por mes, año y balance acumulado.</div>
                </div>
              </li>
            </ul>
          </template>
        </Card>
      </div>

    </div>

      <div class="text-center text-color-secondary mt-6">
        <small>Hecho por HB con tecnologías modernas. Tus datos se mantienen privados.</small>
      </div>
    </div>
  </div>
</template>
