<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Mock data (in future fetch from backend APIs)
const stats = ref([
  { title: 'Total Fleet', value: '45', icon: 'local_shipping', color: 'cyan-8', subtitle: '+2 this month' },
  { title: 'Fleet Utilisation', value: '82%', icon: 'data_usage', color: 'primary', subtitle: 'Above target' },
  { title: 'Avg KM/L', value: '4.2', icon: 'speed', color: 'cyan-8', subtitle: 'Steady' },
  { title: 'Compliance Alerts', value: '3', icon: 'warning', color: 'amber-9', subtitle: 'Needs attention', isAlert: true },
  { title: 'Open LRs', value: '18', icon: 'receipt_long', color: 'primary', subtitle: 'Pending assignment' },
  { title: 'Active Trips', value: '12', icon: 'alt_route', color: 'cyan-8', subtitle: 'In transit' },
  { title: 'Pending POD', value: '5', icon: 'fact_check', color: 'amber-9', subtitle: 'Action required' },
  { title: 'Outstanding Recv', value: '₹1.2M', icon: 'account_balance', color: 'negative', subtitle: 'Overdue >30 days' }
])

const recentActivity = ref([
  { id: 'LR-10023', type: 'LR Created', details: 'Reliance Industries', time: '10 mins ago', status: 'DRAFT', statusColor: 'grey' },
  { id: 'TRP-5042', type: 'Trip Started', details: 'Mumbai - Delhi (MH-04-AB-1234)', time: '1 hr ago', status: 'IN_TRANSIT', statusColor: 'cyan' },
  { id: 'POD-8891', type: 'POD Uploaded', details: 'Tata Motors', time: '2 hrs ago', status: 'VERIFIED', statusColor: 'positive' },
  { id: 'EXC-901', type: 'Fuel Anomaly', details: 'Vehicle MH-12-CD-9090 reported 20% drop', time: '3 hrs ago', status: 'REVIEW', statusColor: 'amber' }
])
</script>

<template>
  <q-page class="q-pa-lg">
    
    <!-- PAGE HEADER -->
    <div class="row items-center q-mb-xl">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Operations Overview</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">
          Welcome back, {{ authStore.user?.firstName || 'User' }}. Here's what's happening today.
        </div>
        <div style="width: 40px; height: 3px; border-radius: 2px;" class="bg-cyan-6 q-mt-sm"></div>
      </div>
      <q-space />
      <div class="q-gutter-sm">
        <q-btn outline color="grey-8" label="Export Report" icon="download" class="bg-white q-px-md" />
        <q-btn unelevated color="primary" label="New Booking" icon="add" class="q-px-md shadow-2" />
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
        <q-card 
          class="my-card shadow-1 rounded-borders full-height" 
          flat 
          bordered
          :class="stat.isAlert ? 'border-amber' : ''"
        >
          <q-card-section class="q-pa-md flex column justify-between full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-grey-7 text-weight-medium text-uppercase" style="letter-spacing: 0.5px">
                {{ stat.title }}
              </div>
              <q-avatar size="38px" :color="`${stat.color}-1`" :text-color="stat.color">
                <q-icon :name="stat.icon" size="20px" />
              </q-avatar>
            </div>
            
            <div>
              <div class="text-h4 text-weight-bold text-dark q-mb-xs">
                {{ stat.value }}
              </div>
              <div class="text-caption text-weight-medium" :class="stat.isAlert ? 'text-amber-9' : 'text-grey-6'">
                {{ stat.subtitle }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <div class="row q-col-gutter-lg">
      
      <!-- LEFT COLUMN (Charts/Main) -->
      <div class="col-12 col-lg-8">
        <q-card class="shadow-1 rounded-borders q-mb-lg" flat bordered>
          <q-card-section class="q-pa-md border-bottom">
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold text-dark">Trip Revenue vs Cost (Mock)</div>
              <q-btn-dropdown flat dense color="grey-7" label="Last 30 Days" />
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-lg flex flex-center" style="height: 300px; background: #fafafa">
            <!-- Placeholder for actual chart component (e.g. vue-apexcharts) -->
            <div class="text-grey-5 column items-center">
              <q-icon name="bar_chart" size="64px" />
              <div>Chart Component Placeholder</div>
              <div class="text-caption">Requires backend analytics API integration</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="shadow-1 rounded-borders" flat bordered>
          <q-card-section class="q-pa-md border-bottom">
            <div class="text-h6 text-weight-bold text-dark">Fleet Status Overview (Mock)</div>
          </q-card-section>
          
          <q-card-section class="q-pa-lg flex flex-center" style="height: 250px; background: #fafafa">
             <!-- Placeholder for map/donut chart -->
             <div class="text-grey-5 column items-center">
              <q-icon name="pie_chart" size="64px" />
              <div>Fleet Distribution Placeholder</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- RIGHT COLUMN (Activity/Alerts) -->
      <div class="col-12 col-lg-4">
        
        <!-- Recent Activity -->
        <q-card class="shadow-1 rounded-borders q-mb-lg full-height" flat bordered>
          <q-card-section class="q-pa-md border-bottom">
            <div class="text-h6 text-weight-bold text-dark">Recent Activity</div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item v-for="item in recentActivity" :key="item.id" class="q-py-md">
                <q-item-section avatar top>
                  <q-avatar size="40px" color="grey-2" text-color="grey-8">
                    <q-icon name="history" size="20px" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold text-dark">{{ item.type }}</q-item-label>
                  <q-item-label caption class="text-grey-7 q-mt-xs">{{ item.details }}</q-item-label>
                  <div class="q-mt-sm row items-center">
                    <q-badge :color="item.statusColor" rounded class="q-mr-sm q-px-sm py-xs text-weight-medium">
                      {{ item.status }}
                    </q-badge>
                    <span class="text-caption text-grey-5">{{ item.time }}</span>
                  </div>
                </q-item-section>
                
                <q-item-section side top>
                  <q-btn flat round dense icon="chevron_right" color="grey-6" />
                </q-item-section>
              </q-item>
            </q-list>
            
            <div class="q-pa-md text-center border-top">
              <q-btn flat color="primary" label="View All Activity" class="full-width" />
            </div>
          </q-card-section>
        </q-card>
        
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.my-card {
  border-radius: 12px;
  border-color: #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}
.my-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}
.border-top {
  border-top: 1px solid #e5e7eb;
}

.border-amber {
  border-color: #f59e0b !important;
  border-width: 1px;
}
</style>
