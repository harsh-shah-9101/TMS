import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import CompanyLayout from '../layouts/CompanyLayout.vue'
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
    component: CompanyLayout,
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/dashboard/DashboardPage.vue') },
      { path: 'vehicles', name: 'Vehicles', component: () => import('../pages/vehicles/VehiclesPage.vue') },
      { path: 'parties', name: 'Parties', component: () => import('../pages/parties/PartiesPage.vue') },
      { path: 'drivers', name: 'Drivers', component: () => import('../pages/drivers/DriversPage.vue') },
      { path: 'vehicle-types', name: 'VehicleTypes', component: () => import('../pages/vehicle-types/VehicleTypesPage.vue') },
      { path: 'carriers', name: 'Carriers', component: () => import('../pages/carriers/CarriersPage.vue') },
      { path: 'routes', name: 'Routes', component: () => import('../pages/routes/RoutesPage.vue') }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
