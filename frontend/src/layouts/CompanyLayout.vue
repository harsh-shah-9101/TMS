<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const leftDrawerOpen = ref(true)
const search = ref('')

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  authStore.logout()
  router.push('/auth/login')
}

// Navigation structure
const menu = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', icon: 'dashboard', to: '/' }
    ]
  },
  {
    title: 'MASTERS',
    items: [
      { name: 'Vehicle Master', icon: 'local_shipping', to: '/vehicles' },
      { name: 'Party Master', icon: 'storefront', to: '/parties' },
      { name: 'Driver Master', icon: 'badge', to: '/drivers' },
      { name: 'Vehicle Types', icon: 'category', to: '/vehicle-types' },
      { name: 'Carrier Master', icon: 'airport_shuttle', to: '/carriers' },
      { name: 'Route Master', icon: 'route', to: '/routes' }
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Booking / LR', icon: 'receipt_long', to: '/bookings' },
      { name: 'Trip & Allocation', icon: 'alt_route', to: '/trips' },
      { name: 'Dispatch', icon: 'send', to: '/dispatch' },
      { name: 'Tracking', icon: 'my_location', to: '/tracking' },
      { name: 'Fuel Entry', icon: 'local_gas_station', to: '/fuel' },
      { name: 'Driver Advances', icon: 'payments', to: '/advances' },
      { name: 'Tyre Operations', icon: 'adjust', to: '/tyres' },
      { name: 'Maintenance', icon: 'build', to: '/maintenance' },
      { name: 'Compliance', icon: 'verified_user', to: '/compliance' },
      { name: 'POD', icon: 'fact_check', to: '/pod' }
    ]
  },
  {
    title: 'FINANCE',
    items: [
      { name: 'Billing', icon: 'request_quote', to: '/billing' },
      { name: 'Purchase Bills', icon: 'shopping_cart', to: '/purchase-bills' },
      { name: 'Settlements', icon: 'account_balance_wallet', to: '/settlements' }
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { name: 'Reports & Analytics', icon: 'bar_chart', to: '/reports' },
      { name: 'Exception Inbox', icon: 'error_outline', to: '/exceptions' },
      { name: 'Audit Logs', icon: 'history', to: '/audit-logs' },
      { name: 'Notifications', icon: 'notifications', to: '/notifications' }
    ]
  },
  {
    title: 'AI',
    items: [
      { name: 'Gati Copilot', icon: 'auto_awesome', to: '/ai' }
    ]
  },
  {
    title: 'ACCOUNT / ADMIN',
    items: [
      { name: 'Access Management', icon: 'admin_panel_settings', to: '/access' },
      { name: 'Profile', icon: 'person', to: '/profile' },
      { name: 'Company Settings', icon: 'settings', to: '/settings' }
    ]
  }
]
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    
    <!-- HEADER -->
    <q-header class="bg-white text-dark q-py-xs shadow-1" style="border-bottom: 1px solid #e5e7eb;">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" color="primary" />

        <div class="q-ml-md flex items-center">
          <!-- Company Context -->
          <q-avatar rounded size="32px" color="primary" text-color="white" class="q-mr-sm">
            {{ authStore.user?.organization?.name?.charAt(0) || 'C' }}
          </q-avatar>
          <div class="column justify-center">
            <span class="text-weight-bold text-subtitle2" style="line-height: 1.2;">
              {{ authStore.user?.organization?.name || 'Company Name' }}
            </span>
            <span class="text-caption text-grey-6" style="line-height: 1;">
              HQ Branch
            </span>
          </div>
        </div>

        <q-space />

        <!-- Global Search -->
        <q-input 
          dense 
          outlined 
          v-model="search" 
          placeholder="Search everywhere..." 
          class="q-mr-lg"
          style="width: 300px; max-width: 40vw;"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Header Actions -->
        <q-btn flat round dense icon="notifications_none" color="grey-8" class="q-mr-sm">
          <q-badge color="red" floating>2</q-badge>
        </q-btn>
        
        <q-btn flat round dense icon="help_outline" color="grey-8" class="q-mr-sm" />

        <!-- User Profile Dropdown -->
        <q-btn flat no-caps class="q-pl-sm q-pr-sm">
          <div class="flex items-center">
            <q-avatar size="32px" class="q-mr-sm bg-grey-3 text-grey-8">
              {{ authStore.user?.firstName?.charAt(0) || 'U' }}
            </q-avatar>
            <div class="column items-start q-mr-sm desktop-only">
              <span class="text-weight-medium text-body2" style="line-height: 1.2">
                {{ authStore.user?.firstName || 'User' }}
              </span>
              <span class="text-caption text-grey-6" style="line-height: 1">
                {{ authStore.user?.roles?.[0]?.name || 'Admin' }}
              </span>
            </div>
            <q-icon name="keyboard_arrow_down" size="16px" color="grey-7" />
          </div>

          <q-menu fit anchor="bottom right" self="top right" class="shadow-3">
            <q-list style="min-width: 200px">
              <q-item clickable v-close-popup to="/profile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>My Profile</q-item-section>
              </q-item>
              <q-item clickable v-close-popup to="/settings">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Settings</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="logout" class="text-negative">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Sign Out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-white"
      :width="260"
    >
      <q-scroll-area class="fit">
        <q-list padding class="q-mb-xl text-grey-9">
          <template v-for="(section, idx) in menu" :key="idx">
            
            <q-item-label 
              header 
              class="text-weight-bold text-caption text-grey-6 q-pb-xs q-pt-md"
              style="letter-spacing: 0.5px;"
            >
              {{ section.title }}
            </q-item-label>

            <q-item 
              v-for="item in section.items" 
              :key="item.name"
              clickable
              v-ripple
              :to="item.to"
              active-class="bg-cyan-1 text-primary text-weight-medium"
              class="q-mx-sm q-mb-xs rounded-borders"
              style="min-height: 40px; padding: 0 12px;"
            >
              <q-item-section avatar style="min-width: 36px">
                <q-icon :name="item.icon" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">{{ item.name }}</q-item-label>
              </q-item-section>
            </q-item>
            
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- PAGE CONTAINER -->
    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
/* Override quasar default hover for sidebar items */
.q-item:hover {
  background-color: #f3f4f6;
}
.q-item.q-router-link--active:hover {
  background-color: var(--q-primary);
  opacity: 0.1;
}
</style>
