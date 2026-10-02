<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const rows = ref([])
const search = ref('')
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const columns = [
  { name: 'name', required: true, label: 'Driver Name', align: 'left', field: 'name', sortable: true },
  { name: 'mobile', label: 'Mobile', align: 'left', field: 'mobile' },
  { name: 'license', label: 'License No', align: 'left', field: 'licenseNumber' },
  { name: 'expiry', label: 'License Expiry', align: 'left', field: 'licenseExpiry' },
  { name: 'status', align: 'center', label: 'Status', field: 'status' },
  { name: 'actions', label: 'Actions', align: 'right' }
]

const fetchData = async () => {
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
        <div class="text-h5 text-weight-bold text-dark">Driver Master</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Manage driver profiles and compliance</div>
        <div style="width: 40px; height: 3px; border-radius: 2px;" class="bg-cyan-6 q-mt-sm"></div>
      </div>
      <div class="q-gutter-sm">
        <q-btn unelevated color="primary" label="Add Driver" icon="add" class="q-px-md shadow-2" />
      </div>
    </div>

    <!-- FILTER BAR -->
    <q-card class="shadow-1 rounded-borders q-mb-md bg-white" flat bordered>
      <q-card-section class="q-pa-sm q-px-md row items-center q-gutter-md">
        <q-input v-model="search" dense outlined placeholder="Search Name / Mobile / License..." style="width: 350px;">
          <template v-slot:prepend><q-icon name="search" /></template>
        </q-input>
        <q-select v-model="search" :options="['ALL', 'ACTIVE', 'INACTIVE']" dense outlined label="Status" style="width: 150px;" />
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
      flat bordered
      table-header-class="bg-grey-1 text-weight-bold text-grey-8"
    >
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-pa-xl">
          <q-icon size="2em" name="badge" class="q-mr-sm" />
          <span>No drivers found.</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<style scoped>
.rounded-borders { border-radius: 12px !important; }
</style>
