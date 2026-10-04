<template>
  <div class="desk-page dashboard-page">
    <div class="desk-toolbar">
      <strong>Operations Overview</strong>
      <span class="welcome-text">Welcome back, {{ userName }}.</span>
      <div class="quick-nav-actions">
        <button type="button" @click="router.push('/vehicles')">
          Vehicles <small>Alt+M V</small>
        </button>
        <button type="button" @click="router.push('/parties')">
          Parties <small>Alt+M P</small>
        </button>
        <button type="button" @click="router.push('/drivers')">
          Drivers <small>Alt+M R</small>
        </button>
        <button type="button" class="is-primary" @click="router.push('/vehicles?new=1')">
          + New Fleet <small>Alt+N</small>
        </button>
      </div>
      <span class="desk-toolbar-count">{{ currentDate }}</span>
    </div>

    <div class="dashboard-scrollable">
      <!-- KPI Row -->
      <div class="kpi-grid">
        <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card" :class="kpi.accent">
          <div class="kpi-header">
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-icon">{{ kpi.icon }}</span>
          </div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-subtext">{{ kpi.subtext }}</div>
        </div>
      </div>

      <!-- Main Dashboard Content Split -->
      <div class="dashboard-split">
        <!-- Live Fleet Health -->
        <div class="dash-panel">
          <div class="panel-header">
            <h3>Fleet Status Overview</h3>
            <button type="button" class="panel-link" @click="router.push('/vehicles')">
              View All Vehicles →
            </button>
          </div>
          <div class="fleet-status-bars">
            <div class="status-summary-bar">
              <div class="bar-segment seg-available" style="width: 55%;" title="Available: 55%"></div>
              <div class="bar-segment seg-transit" style="width: 30%;" title="In Transit: 30%"></div>
              <div class="bar-segment seg-maint" style="width: 10%;" title="Maintenance: 10%"></div>
              <div class="bar-segment seg-offline" style="width: 5%;" title="Out of Service: 5%"></div>
            </div>
            <div class="status-legend">
              <span class="legend-item"><span class="dot dot-avail"></span> 24 Available</span>
              <span class="legend-item"><span class="dot dot-transit"></span> 13 In Transit</span>
              <span class="legend-item"><span class="dot dot-maint"></span> 4 Maintenance</span>
              <span class="legend-item"><span class="dot dot-offline"></span> 2 Out of Service</span>
            </div>
          </div>

          <div class="quick-table-wrap">
            <table class="dash-table">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Vehicle Type</th>
                  <th>Ownership</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in sampleVehicles" :key="v.reg" @click="router.push('/vehicles')">
                  <td class="desk-mono-cell">{{ v.reg }}</td>
                  <td>{{ v.type }}</td>
                  <td>{{ v.ownership }}</td>
                  <td>
                    <span :class="['status-badge', v.statusClass]">{{ v.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Operations Feed -->
        <div class="dash-panel">
          <div class="panel-header">
            <h3>Recent Operations Log</h3>
            <span class="live-pulse"><span class="pulse-dot"></span> Live Stream</span>
          </div>
          <div class="feed-list">
            <div v-for="item in feedItems" :key="item.id" class="feed-item">
              <div class="feed-time">{{ item.time }}</div>
              <div class="feed-body">
                <div class="feed-title">
                  <strong>{{ item.code }}</strong> — {{ item.title }}
                </div>
                <div class="feed-desc">{{ item.desc }}</div>
              </div>
              <div class="feed-badge">
                <span :class="['status-badge', item.badgeClass]">{{ item.badge }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useDeskLayer } from '@/desk/tms/ui';

const router = useRouter();
const auth = useAuthStore();

useDeskLayer({
  handlers: {
    'action-new': () => {
      void router.push('/vehicles?new=1');
    },
    'nav-vehicles': () => void router.push('/vehicles'),
    'nav-parties': () => void router.push('/parties'),
    'nav-drivers': () => void router.push('/drivers'),
  },
});

const userName = computed(() => auth.user?.name || auth.user?.firstName || 'Dispatcher');

const currentDate = computed(() =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date()),
);

const kpis = [
  { label: 'Active Fleet', value: '43 / 48', subtext: '90% fleet utilization', icon: '🚛', accent: 'accent-primary' },
  { label: 'Active Trips', value: '18', subtext: '3 arriving today', icon: '🛣️', accent: 'accent-info' },
  { label: 'Pending PODs', value: '5', subtext: 'Action required', icon: '📄', accent: 'accent-warning' },
  { label: 'Revenue (MTD)', value: '₹48.2L', subtext: '+12.4% vs last month', icon: '💳', accent: 'accent-success' },
];

const sampleVehicles = [
  { reg: 'MH12AB1001', type: '32ft Container', ownership: 'Owned', status: 'Available', statusClass: 'status-success' },
  { reg: 'DL01XY5542', type: '16-Wheeler Trailer', ownership: 'Owned', status: 'In Transit', statusClass: 'status-info' },
  { reg: 'KA04CD9021', type: 'Open Body Truck', ownership: 'Leased', status: 'In Transit', statusClass: 'status-info' },
  { reg: 'GJ06EF3412', type: '24ft Container', ownership: 'Market', status: 'Maintenance', statusClass: 'status-warning' },
  { reg: 'MH04GH7819', type: '10-Wheeler', ownership: 'Owned', status: 'Available', statusClass: 'status-success' },
];

const feedItems = [
  { id: '1', time: '10m ago', code: 'TRP-1049', title: 'Trip Started', desc: 'Mumbai to Delhi · Tata Signa 4825', badge: 'Dispatched', badgeClass: 'status-info' },
  { id: '2', time: '25m ago', code: 'LR-8821', title: 'Booking Confirmed', desc: 'Reliance Ind. · 24 MT Polymers', badge: 'Confirmed', badgeClass: 'status-success' },
  { id: '3', time: '1h ago', code: 'POD-4029', title: 'Delivery Completed', desc: 'Bengaluru Distribution Hub', badge: 'Delivered', badgeClass: 'status-success' },
  { id: '4', time: '2h ago', code: 'ALR-201', title: 'Fitness Expiry Alert', desc: 'Vehicle DL01XY5542 expires in 5 days', badge: 'Attention', badgeClass: 'status-warning' },
];
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--desk-bg);
  overflow: hidden;
}

.welcome-text {
  font-size: 12px;
  color: var(--desk-muted);
  margin-left: 10px;
}

.quick-nav-actions {
  display: flex;
  gap: 6px;
  margin-left: 20px;
}

.dashboard-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid var(--desk-grid-line);
  border-radius: 6px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.kpi-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.kpi-label {
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--desk-muted);
  letter-spacing: 0.03em;
}

.kpi-icon {
  font-size: 16px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 750;
  color: var(--desk-text);
  font-family: var(--desk-font-mono);
}

.kpi-subtext {
  font-size: 11.5px;
  color: var(--desk-muted);
  margin-top: 4px;
}

/* Split layout */
.dashboard-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .dashboard-split {
    grid-template-columns: 1fr;
  }
}

.dash-panel {
  background: #ffffff;
  border: 1px solid var(--desk-grid-line);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--desk-text);
}

.panel-link {
  background: none;
  border: none;
  color: var(--desk-primary);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
}

.panel-link:hover {
  text-decoration: underline;
}

/* Live Pulse */
.live-pulse {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #10b981;
  font-weight: 600;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Status bars */
.status-summary-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: #f1f5f9;
}

.bar-segment { height: 100%; }
.seg-available { background: var(--desk-success); }
.seg-transit { background: var(--desk-info); }
.seg-maint { background: var(--desk-warning); }
.seg-offline { background: var(--desk-danger); }

.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 6px;
  font-size: 11px;
  color: var(--desk-muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.dot-avail { background: var(--desk-success); }
.dot-transit { background: var(--desk-info); }
.dot-maint { background: var(--desk-warning); }
.dot-offline { background: var(--desk-danger); }

/* Quick table */
.quick-table-wrap {
  border: 1px solid var(--desk-grid-line);
  border-radius: 4px;
  overflow: hidden;
}

.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.dash-table th {
  background: #f8fafc;
  text-align: left;
  padding: 6px 10px;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid var(--desk-grid-line);
}

.dash-table td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--desk-grid-line);
  cursor: pointer;
}

.dash-table tr:hover td {
  background: #f8fafc;
}

/* Feed list */
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feed-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid #f1f5f9;
  border-radius: 5px;
  background: #fafafa;
}

.feed-time {
  font-family: var(--desk-font-mono);
  font-size: 10.5px;
  color: #94a3b8;
  min-width: 50px;
}

.feed-body {
  flex: 1;
}

.feed-title {
  font-size: 12px;
  color: var(--desk-text);
}

.feed-desc {
  font-size: 11px;
  color: var(--desk-muted);
}
</style>
