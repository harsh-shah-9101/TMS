<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/config/api'

const $q = useQuasar()

const loading = ref(false)
const rows = ref([])
const search = ref('')
const tab = ref('ALL')

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const kpis = ref([
  { label: 'Total Parties', value: '142', color: 'primary' },
  { label: 'Active Customers', value: '89', color: 'positive' },
  { label: 'Credit Hold', value: '4', color: 'negative' }
])

const columns = [
  { name: 'name', required: true, label: 'Party Name', align: 'left', field: 'name', sortable: true },
  { name: 'type', label: 'Type', align: 'left', field: 'type', sortable: true },
  { name: 'gstin', label: 'GSTIN', align: 'left', field: 'gstin', sortable: true },
  { name: 'creditLimit', label: 'Credit Limit', align: 'right', field: 'creditLimit' },
  { name: 'status', align: 'center', label: 'Status', field: 'status' },
  { name: 'actions', label: 'Actions', align: 'right' }
]

const fetchData = async (props?: any) => {
  // Placeholder API call
  loading.value = true
  setTimeout(() => { loading.value = false }, 500)
}

onMounted(() => fetchData())
</script>

<template>
  <q-page class="q-pa-lg">
    
    <!-- PAGE HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Party Master</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Manage Customers, Vendors, and Partners</div>
        <div style="width: 40px; height: 3px; border-radius: 2px;" class="bg-cyan-6 q-mt-sm"></div>
      </div>
      <div class="q-gutter-sm">
        <q-btn outline color="grey-8" label="Export" icon="download" class="bg-white q-px-md" />
        <q-btn unelevated color="primary" label="Add Party" icon="add" class="q-px-md shadow-2" />
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4" v-for="kpi in kpis" :key="kpi.label">
        <q-card class="shadow-1 rounded-borders full-height bg-white" flat bordered>
          <q-card-section class="q-pa-md flex items-center justify-between">
            <div>
              <div class="text-subtitle2 text-grey-6 text-uppercase" style="letter-spacing: 0.5px">{{ kpi.label }}</div>
              <div class="text-h5 text-weight-bold text-dark q-mt-xs">{{ kpi.value }}</div>
            </div>
            <q-avatar size="42px" :color="`${kpi.color}-1`" :text-color="kpi.color">
              <q-icon name="storefront" size="24px" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- FILTER BAR & TABS -->
    <q-card class="shadow-1 rounded-borders q-mb-md bg-white" flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-7 q-pt-sm q-px-sm"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="ALL" label="All" />
        <q-tab name="CUSTOMER" label="Customers" />
        <q-tab name="FUEL_STATION" label="Fuel Stations" />
        <q-tab name="SERVICE_CENTRE" label="Service Centres" />
      </q-tabs>
      
      <q-separator />

      <q-card-section class="q-pa-sm q-px-md row items-center q-gutter-md">
        <q-input 
          v-model="search" 
          dense 
          outlined 
          placeholder="Search Party / GSTIN / PAN..." 
          class="col-grow"
          style="max-width: 400px;"
          @keyup.enter="fetchData()"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />
        <q-btn flat color="primary" icon="filter_list" label="Filters" />
      </q-card-section>
    </q-card>

    <!-- DATA TABLE -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="fetchData"
      class="shadow-1 rounded-borders bg-white"
      flat
      bordered
      table-header-class="bg-grey-1 text-weight-bold text-grey-8"
    >
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-pa-xl">
          <q-icon size="2em" name="storefront" class="q-mr-sm" />
          <span>No parties found.</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<style scoped>
.rounded-borders {
  border-radius: 12px !important;
}
</style>
