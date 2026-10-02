import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: () => import('../pages/auth/LoginPage.vue') },
      { path: 'register', name: 'Register', component: () => import('../pages/auth/RegisterPage.vue') }
    ]
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/dashboard/DashboardPage.vue') },
      { path: 'vehicles', name: 'Vehicles', component: () => import('../pages/vehicles/VehiclesPage.vue') }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
