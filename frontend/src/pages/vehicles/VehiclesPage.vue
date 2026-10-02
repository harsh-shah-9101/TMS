<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/config/api'

const $q = useQuasar()

// State
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const rows = ref([])
const search = ref('')
const filterStatus = ref('ALL')

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// Form
const form = ref({ registrationNumber: '', status: 'ACTIVE', capacityWeight: null, make: '', model: '' })

// KPIs (Mock)
const kpis = ref([
  { label: 'Total Fleet', value: '45', color: 'primary' },
  { label: 'Active', value: '38', color: 'positive' },
  { label: 'In Maintenance', value: '5', color: 'orange' },
  { label: 'Idle', value: '2', color: 'grey-7' }
])

const columns = [
  { name: 'registrationNumber', required: true, label: 'Reg Number', align: 'left', field: 'registrationNumber', sortable: true },
  { name: 'make', label: 'Make', align: 'left', field: 'make', sortable: true },
  { name: 'model', label: 'Model', align: 'left', field: 'model', sortable: true },
  { name: 'capacity', label: 'Capacity (Tons)', align: 'right', field: 'capacityWeight', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'actions', label: 'Actions', align: 'right' }
]

const getStatusColor = (status: string) => {
  switch(status) {
    case 'ACTIVE': return 'positive'
    case 'IN_TRANSIT': return 'info'
    case 'MAINTENANCE': return 'warning'
    case 'INACTIVE': return 'negative'
    case 'BLOCKED': return 'negative'
    case 'IDLE': return 'grey'
    default: return 'grey'
  }
}

const fetchData = async (props?: any) => {
  const page = props?.pagination?.page || pagination.value.page
  const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage
  
  loading.value = true
  try {
    const response = await api.get('/vehicles', { params: { page, limit, search: search.value } })
    rows.value = response.data.data
    pagination.value.page = page
    pagination.value.rowsPerPage = limit
    pagination.value.rowsNumber = response.data.meta?.total || 0
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to fetch vehicles' })
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  submitting.value = true
  try {
    await api.post('/vehicles', form.value)
    $q.notify({ type: 'positive', message: 'Vehicle added successfully' })
    showDialog.value = false
    fetchData()
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to create vehicle' })
  } finally {
    submitting.value = false
  }
}

const openNewDialog = () => {
  form.value = { registrationNumber: '', status: 'ACTIVE', capacityWeight: null, make: '', model: '' }
  showDialog.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <q-page class="q-pa-lg">
    
    <!-- PAGE HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Vehicle Master</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Manage your fleet and vehicle details</div>
        <div style="width: 40px; height: 3px; border-radius: 2px;" class="bg-cyan-6 q-mt-sm"></div>
      </div>
      <div class="q-gutter-sm">
        <q-btn outline color="grey-8" label="Import" icon="upload_file" class="bg-white q-px-md" />
        <q-btn unelevated color="primary" label="Add Vehicle" icon="add" class="q-px-md shadow-2" @click="openNewDialog" />
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="kpi in kpis" :key="kpi.label">
        <q-card class="shadow-1 rounded-borders full-height bg-white" flat bordered>
          <q-card-section class="q-pa-md flex items-center justify-between">
            <div>
              <div class="text-subtitle2 text-grey-6 text-uppercase" style="letter-spacing: 0.5px">{{ kpi.label }}</div>
              <div class="text-h5 text-weight-bold text-dark q-mt-xs">{{ kpi.value }}</div>
            </div>
            <q-avatar size="42px" :color="`${kpi.color}-1`" :text-color="kpi.color">
              <q-icon name="local_shipping" size="24px" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- FILTER BAR -->
    <q-card class="shadow-1 rounded-borders q-mb-md bg-white" flat bordered>
      <q-card-section class="q-pa-sm q-px-md row items-center q-gutter-md">
        <q-input 
          v-model="search" 
          dense 
          outlined 
          placeholder="Search Reg No / Make / Model..." 
          class="col-grow"
          style="max-width: 400px;"
          @keyup.enter="fetchData()"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="filterStatus"
          :options="['ALL', 'ACTIVE', 'MAINTENANCE', 'IN_TRANSIT']"
          dense
          outlined
          label="Status"
          style="min-width: 150px;"
        />
        
        <q-space />
        <q-btn flat color="primary" icon="filter_list" label="More Filters" />
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
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)" rounded class="q-px-sm py-xs text-weight-medium" style="letter-spacing: 0.3px;">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="grey-7" icon="edit" size="sm" class="q-mr-xs">
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn flat round color="negative" icon="delete" size="sm">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Create Dialog -->
    <q-dialog v-model="showDialog" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width: 450px; max-width: 100vw;" class="column bg-white">
        <q-card-section class="row items-center q-pb-none" style="border-bottom: 1px solid #e5e7eb;">
          <div class="text-h6 text-weight-bold">New Vehicle</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
        </q-card-section>

        <q-card-section class="col scroll q-pa-lg">
          <q-form id="vehicleForm" @submit.prevent="onSubmit" class="q-gutter-md">
            
            <div class="text-subtitle2 text-grey-8 text-weight-bold q-mb-sm">Basic Information</div>
            
            <q-input v-model="form.registrationNumber" label="Registration Number *" outlined lazy-rules :rules="[val => !!val || 'Required']" />
            
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model="form.make" label="Make" outlined />
              </div>
              <div class="col-6">
                <q-input v-model="form.model" label="Model" outlined />
              </div>
            </div>

            <q-select v-model="form.status" :options="['ACTIVE', 'MAINTENANCE', 'INACTIVE']" label="Status *" outlined />
            <q-input v-model.number="form.capacityWeight" type="number" label="Capacity (Tons)" outlined />
            
          </q-form>
        </q-card-section>
        
        <q-card-section class="bg-grey-1 row justify-end items-center" style="border-top: 1px solid #e5e7eb;">
          <q-btn flat label="Cancel" color="grey-8" v-close-popup class="q-mr-sm" />
          <q-btn type="submit" form="vehicleForm" color="primary" label="Save Vehicle" :loading="submitting" unelevated class="q-px-md" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style scoped>
.rounded-borders {
  border-radius: 12px !important;
}
</style>
