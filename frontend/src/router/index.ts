import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import CompanyLayout from '../layouts/CompanyLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

const routes: RouteRecordRaw[] = [
  // ── Auth routes (public) ──────────────────────────────────────────────────
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      { path: 'login', name: 'Login', component: () => import('../pages/auth/LoginPage.vue') },
      { path: 'register', name: 'Register', component: () => import('../pages/auth/RegisterPage.vue') },
    ],
  },

  // ── Protected app routes ──────────────────────────────────────────────────
  {
    path: '/',
    component: CompanyLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/dashboard/DashboardPage.vue') },
      { path: 'vehicles', name: 'Vehicles', component: () => import('../pages/vehicles/VehiclesPage.vue') },
      { path: 'parties', name: 'Parties', component: () => import('../pages/parties/PartiesPage.vue') },
      { path: 'drivers', name: 'Drivers', component: () => import('../pages/drivers/DriversPage.vue') },
      { path: 'vehicle-types', name: 'VehicleTypes', component: () => import('../pages/vehicle-types/VehicleTypesPage.vue') },
      { path: 'carriers', name: 'Carriers', component: () => import('../pages/carriers/CarriersPage.vue') },
      { path: 'routes', name: 'Routes', component: () => import('../pages/routes/RoutesPage.vue') },
    ],
  },

  // ── Catch-all: redirect to dashboard ─────────────────────────────────────
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Global Navigation Guard ───────────────────────────────────────────────────
router.beforeEach((to) => {
  const token = localStorage.getItem('tms_token')
  const isLoggedIn = !!token

  // Route requires auth but user is not logged in → redirect to login
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'Login' }
  }

  // Route is for guests only (login/register) but user is already logged in → redirect to dashboard
  if (to.meta.requiresGuest && isLoggedIn) {
    return { name: 'Dashboard' }
  }
})

export default router
