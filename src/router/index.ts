import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
//import Register from '@/views/Register.vue';
import NotFound from '@/views/NotFound.vue';
import { supabase } from '@/api/supabase';
import { showLoading, hideLoading } from '@/stores/loading';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/dashboard', component: Dashboard },
    { path: '/login', component: Login },
   /* { path: '/register', component: Register },*/
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
  ]
});

const PUBLIC_PATHS = ['/login', /*'/register'*/];

router.beforeEach(async (to) => {
  showLoading();
  try {
    const { data } = await supabase.auth.getUser();
    const isUser = !!data?.user;

    // Si la ruta es home ('/'): permitir acceso si NO está autenticado,
    // si está autenticado redirigir al dashboard.
    if (to.path === '/') {
      if (isUser) {
        hideLoading();
        return '/dashboard';
      }
      hideLoading();
      return true;
    }

    if (PUBLIC_PATHS.includes(to.path)) {
      hideLoading();
      return true;
    }

    if (!isUser) {
      hideLoading();
      return '/login';
    }

    return true;
  } catch (e) {
    hideLoading();
    return '/login';
  }
});

router.afterEach(() => {
  hideLoading();
});

export default router;