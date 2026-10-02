<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const rows = ref([])
const search = ref('')
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const columns = [
  { name: 'name', required: true, label: 'Vehicle Type', align: 'left', field: 'name', sortable: true },
  { name: 'capacity', label: 'Standard Capacity', align: 'right', field: 'capacity' },
  { name: 'fuel', label: 'Fuel Type', align: 'left', field: 'fuelType' },
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
        <div class="text-h5 text-weight-bold text-dark">Vehicle Types</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Define standard vehicle categories</div>
        <div style="width: 40px; height: 3px; border-radius: 2px;" class="bg-cyan-6 q-mt-sm"></div>
      </div>
      <q-btn unelevated color="primary" label="Add Type" icon="add" class="q-px-md shadow-2" />
    </div>

    <!-- FILTER BAR -->
    <q-card class="shadow-1 rounded-borders q-mb-md bg-white" flat bordered>
      <q-card-section class="q-pa-sm q-px-md">
        <q-input v-model="search" dense outlined placeholder="Search Type..." style="width: 300px;">
          <template v-slot:prepend><q-icon name="search" /></template>
        </q-input>
      </q-card-section>
    </q-card>

    <q-table :rows="rows" :columns="columns" row-key="id" :loading="loading" class="shadow-1 rounded-borders bg-white" flat bordered table-header-class="bg-grey-1 text-weight-bold text-grey-8">
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-pa-xl">
          <q-icon size="2em" name="category" class="q-mr-sm" />
          <span>No vehicle types defined.</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<style scoped>
.rounded-borders { border-radius: 12px !important; }
</style>
