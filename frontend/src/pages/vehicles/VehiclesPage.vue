<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../config/api'

const $q = useQuasar()

const columns = [
  { name: 'registrationNumber', required: true, label: 'Reg Number', align: 'left', field: 'registrationNumber', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'capacity', label: 'Capacity (Tons)', field: 'capacityWeight', sortable: true },
  { name: 'actions', label: 'Actions', align: 'center' }
]

const rows = ref([])
const loading = ref(false)
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// Dialog state
const showDialog = ref(false)
const form = ref({ registrationNumber: '', status: 'ACTIVE', capacityWeight: null })
const submitting = ref(false)

const fetchVehicles = async (props?: any) => {
  const page = props?.pagination?.page || pagination.value.page
  const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage
  
  loading.value = true
  try {
    const response = await api.get('/vehicles', { params: { page, limit } })
    rows.value = response.data.data
    pagination.value.page = page
    pagination.value.rowsPerPage = limit
    pagination.value.rowsNumber = response.data.meta.total
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
    fetchVehicles()
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Failed to create vehicle' })
  } finally {
    submitting.value = false
  }
}

const openNewVehicleDialog = () => {
  form.value = { registrationNumber: '', status: 'ACTIVE', capacityWeight: null }
  showDialog.value = true
}

onMounted(() => {
  fetchVehicles()
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Vehicles</div>
      <q-btn color="primary" icon="add" label="Add Vehicle" @click="openNewVehicleDialog" unelevated />
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="fetchVehicles"
      class="shadow-1 rounded-borders"
      flat
      bordered
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip :color="props.row.status === 'ACTIVE' ? 'positive' : 'negative'" text-color="white" size="sm">
            {{ props.row.status }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round color="primary" icon="edit" size="sm" />
          <q-btn flat round color="negative" icon="delete" size="sm" />
        </q-td>
      </template>
    </q-table>

    <!-- Create Vehicle Dialog -->
    <q-dialog v-model="showDialog" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width: 400px; max-width: 100vw;" class="column">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">New Vehicle</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="col">
          <q-form @submit.prevent="onSubmit" class="q-gutter-md q-mt-sm">
            <q-input v-model="form.registrationNumber" label="Registration Number" outlined dense lazy-rules :rules="[val => !!val || 'Required']" />
            <q-select v-model="form.status" :options="['ACTIVE', 'MAINTENANCE', 'INACTIVE']" label="Status" outlined dense />
            <q-input v-model.number="form.capacityWeight" type="number" label="Capacity (Tons)" outlined dense />
            
            <div class="row justify-end q-mt-lg">
              <q-btn flat label="Cancel" color="grey" v-close-popup />
              <q-btn type="submit" color="primary" label="Save Vehicle" :loading="submitting" unelevated class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
