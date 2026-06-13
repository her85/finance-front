# Finance App — Frontend (Vue 3 + TypeScript + Vite)

Frontend de la aplicación de finanzas construido con Vue 3, TypeScript y Vite. Esta carpeta contiene la interfaz web que se conecta a Supabase para autenticación y persistencia de datos (transacciones, balances, usuarios).

Características principales
- Registro e inicio de sesión con Supabase
- Crear, listar y eliminar transacciones
- Visualización de balance y resumen de gastos
- UI basada en PrimeVue (componentes y estilos)

Tecnologías
- Vue 3 + Composition API
- TypeScript
- Vite (dev server y build)
- Supabase (auth + base de datos)
- PrimeVue, PrimeFlex

Requisitos
- Node.js 18+ (recomendado)
- npm, yarn o pnpm

## Instalación rápida
1. Clona el repositorio y entra en la carpeta frontend:

```bash
git clone <repo-url>
cd finance-front
```

2. Instala dependencias:

```bash
npm install
# o yarn
yarn
# o pnpm
pnpm install
```

## Configuración (Supabase)
1. Crea un proyecto en Supabase y copia:
	- URL del proyecto (Supabase URL)
	- Anon public key (ANON KEY)

2. Crea un archivo `.env` o `.env.local` en la raíz del frontend con estas variables:

```text
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Nota: Vite expone variables que comienzan con `VITE_` al cliente. No incluyas claves sensibles de servicio en el frontend.

## Scripts disponibles
- `npm run dev` — Inicia el servidor de desarrollo (Vite).
- `npm run build` — Compila la aplicación para producción (`vue-tsc -b && vite build`).
- `npm run preview` — Sirve la versión construida localmente para previsualizar.

## Estructura del proyecto (resumen)
- `index.html` — Punto de entrada
- `src/main.ts` — Inicializa Vue y el router
- `src/App.vue` — Componente raíz
- `src/api/supabase.ts` — Cliente de Supabase (configurado desde `VITE_*`)
- `src/views/Home.vue` — Vista de presentacion del proyecto 
- `src/views/Dashboard.vue` — Vista principal con balances y lista de transacciones
- `src/views/Login.vue`, `src/views/Register.vue` — Páginas de autenticación
- `src/components/TransactionForm.vue` — Formulario para añadir transacciones
- `src/components/TransactionList.vue` — Lista y filtrado de transacciones
- `src/components/BalanceCard.vue` — Componente que muestra el balance
- `src/stores/loading.ts` — Estado global de carga

## PWA — Service Worker y manifest
--------------------------------

Este proyecto está configurado como Progressive Web App usando `vite-plugin-pwa`.

- Configuración del plugin PWA: revisá `vite.config.ts` (plugin `VitePWA`). Allí se define el `manifest`, las `icons`, y las reglas de `workbox` (caching, navigateFallback, runtimeCaching, etc.).
- Registro del Service Worker: se realiza en `src/main.ts` mediante `registerSW` (import desde `virtual:pwa-register`). El SW se genera en el build y **no** se registra en `npm run dev`.
- Manifest (web app manifest): el archivo principal de manifiesto está en `public/manifest.webmanifest`. Para personalizar el nombre, iconos o colores, editá ese archivo y los iconos en `public/icons/`.

## Despliegue
- Construye con `npm run build` y despliega los archivos estáticos resultantes en Netlify, Vercel, Surge, o cualquier hosting de archivos estáticos. Asegúrate de configurar las variables de entorno en la plataforma de despliegue (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).

## Cómo probar localmente

1. Generá la build y servila en modo preview (el Service Worker se registra sólo en la versión construida):

```bash
npm run build
npm run preview
# abrir la URL que muestre el comando (por ejemplo http://localhost:4173)
```

2. Abrí las DevTools del navegador → Application → Service Workers para verificar que el worker esté registrado y en qué estado está.

## Notas útiles

- Para forzar la actualización del SW en desarrollo/depuración: DevTools → Application → Service Workers → "Update" o limpiar "Site data".
- La estrategia de actualización por defecto aquí es `registerType: 'autoUpdate'` (ver `vite.config.ts`), lo que intenta actualizar el SW automáticamente.
- Si necesitás cambiar la política de cache o rutas cached, modificá la sección `workbox` dentro de la configuración PWA en `vite.config.ts`.
- La app también incluye sincronización offline/cola de transacciones mediante `src/api/offline.ts` y `src/utils/idb.ts`. Esta lógica coordina almacenar cambios localmente y sincronizarlos cuando vuelvas online.

## Buenas prácticas
- Usar cuentas y roles de Supabase apropiados. Mantén las reglas RLS (Row Level Security) si necesitas seguridad a nivel de fila.
- No pongas claves privadas en el frontend.

## Contribuir
- Abre un issue describiendo el cambio o el bug.
- Crea una rama con nombre descriptivo: `feature/nombre` o `fix/descripcion`.
- Envía un pull request y describe los cambios realizados.

