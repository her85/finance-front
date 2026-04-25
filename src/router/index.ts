import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import { supabase } from '@/api/supabase';
import { showLoading, hideLoading } from '@/stores/loading';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/login', component: Login },
    { path: '/register', component: Register }
  ]
});

const PUBLIC_PATHS = ['/login', '/register'];

router.beforeEach(async (to) => {
  showLoading();
  if (PUBLIC_PATHS.includes(to.path)) {
    hideLoading();
    return true;
  }
  try {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
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