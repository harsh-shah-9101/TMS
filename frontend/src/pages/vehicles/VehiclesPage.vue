<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/config/api'

const $q = useQuasar()

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditMode = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<any>(null)

const rows = ref<any[]>([])
const search = ref('')
const filterStatus = ref('ALL')
const vehicleTypes = ref<{ label: string; value: string }[]>([])

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = ref([
  { label: 'Total Fleet', value: '0', color: 'primary', icon: 'local_shipping' },
  { label: 'Available', value: '0', color: 'positive', icon: 'check_circle' },
  { label: 'In Transit', value: '0', color: 'info', icon: 'route' },
  { label: 'Maintenance', value: '0', color: 'orange', icon: 'build' },
])

// ─── Table Columns ────────────────────────────────────────────────────────────
const columns: any[] = [
  { name: 'registrationNumber', required: true, label: 'Reg Number', align: 'left', field: 'registrationNumber', sortable: true },
  { name: 'makeModel', label: 'Make / Model', align: 'left', field: (r: any) => [r.make, r.model].filter(Boolean).join(' ') || '—' },
  { name: 'vehicleType', label: 'Type', align: 'left', field: (r: any) => r.vehicleType?.name || '—' },
  { name: 'capacityWeight', label: 'Capacity (MT)', align: 'right', field: 'capacityWeight', sortable: true },
  { name: 'ownershipType', label: 'Ownership', align: 'center', field: 'ownershipType' },
  { name: 'status', label: 'Status', align: 'center', field: 'status', sortable: true },
  { name: 'actions', label: 'Actions', align: 'right' },
]

// ─── Options ─────────────────────────────────────────────────────────────────
const ownershipOptions = [
  { label: 'Owned', value: 'OWNED' },
  { label: 'Leased', value: 'LEASED' },
  { label: 'Market / Third Party', value: 'MARKET' },
]
const statusOptions = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Out of Service', value: 'OUT_OF_SERVICE' },
]

// ─── Form Factory ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
  registrationNumber: '',
  vehicleTypeId: null as string | null,
  make: '',
  model: '',
  ownershipType: null as string | null,
  year: null as number | null,
  capacityWeight: null as number | null,
  targetKmPerL: null as number | null,
  chassisNumber: '',
  engineNumber: '',
  gpsDeviceId: '',
  fastagId: '',
  status: 'AVAILABLE',
  rcExpiry: '',
  fitnessExpiry: '',
  insuranceExpiry: '',
  pucExpiry: '',
  permitExpiry: '',
  roadTaxExpiry: '',
})
const form = ref(emptyForm())

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    AVAILABLE: 'positive', IN_TRANSIT: 'info', ASSIGNED: 'blue',
    MAINTENANCE: 'warning', OUT_OF_SERVICE: 'negative',
  }
  return map[status] || 'grey'
}

const getOwnershipLabel = (val: string) =>
  ownershipOptions.find(o => o.value === val)?.label || val || '—'

// ─── API Calls ────────────────────────────────────────────────────────────────
const fetchVehicleTypes = async () => {
  try {
    const res = await api.get('/vehicle-types', { params: { limit: 100 } })
    const data = res.data.data || res.data
    vehicleTypes.value = (Array.isArray(data) ? data : []).map((vt: any) => ({
      label: vt.name, value: vt.id,
    }))
  } catch { /* silent */ }
}

const fetchData = async (props?: any) => {
  const page = props?.pagination?.page || pagination.value.page
  const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage
  const status = filterStatus.value !== 'ALL' ? filterStatus.value : undefined

  loading.value = true
  try {
    const res = await api.get('/vehicles', { params: { page, limit, search: search.value || undefined, status } })
    rows.value = res.data.data || []
    pagination.value = { page, rowsPerPage: limit, rowsNumber: res.data.meta?.total || 0 }

    const all = rows.value as any[]
    kpis.value[0].value = String(pagination.value.rowsNumber)
    kpis.value[1].value = String(all.filter((r) => r.status === 'AVAILABLE').length)
    kpis.value[2].value = String(all.filter((r) => r.status === 'IN_TRANSIT').length)
    kpis.value[3].value = String(all.filter((r) => r.status === 'MAINTENANCE').length)
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to fetch vehicles' })
  } finally {
    loading.value = false
  }
}

// ─── Create ──────────────────────────────────────────────────────────────────
const openCreateDialog = () => {
  isEditMode.value = false
  editingId.value = null
  form.value = emptyForm()
  showDialog.value = true
}

// ─── Edit ────────────────────────────────────────────────────────────────────
const openEditDialog = (row: any) => {
  isEditMode.value = true
  editingId.value = row.id
  form.value = {
    registrationNumber: row.registrationNumber || '',
    vehicleTypeId: row.vehicleTypeId || null,
    make: row.make || '',
    model: row.model || '',
    ownershipType: row.ownershipType || null,
    year: row.year || null,
    capacityWeight: row.capacityWeight || null,
    targetKmPerL: row.targetKmPerL || null,
    chassisNumber: row.chassisNumber || '',
    engineNumber: row.engineNumber || '',
    gpsDeviceId: row.gpsDeviceId || '',
    fastagId: row.fastagId || '',
    status: row.status || 'AVAILABLE',
    rcExpiry: row.rcExpiry ? row.rcExpiry.split('T')[0] : '',
    fitnessExpiry: row.fitnessExpiry ? row.fitnessExpiry.split('T')[0] : '',
    insuranceExpiry: row.insuranceExpiry ? row.insuranceExpiry.split('T')[0] : '',
    pucExpiry: row.pucExpiry ? row.pucExpiry.split('T')[0] : '',
    permitExpiry: row.permitExpiry ? row.permitExpiry.split('T')[0] : '',
    roadTaxExpiry: row.roadTaxExpiry ? row.roadTaxExpiry.split('T')[0] : '',
  }
  showDialog.value = true
}

// ─── Submit (create or update) ───────────────────────────────────────────────
const onSubmit = async () => {
  submitting.value = true
  try {
    if (isEditMode.value && editingId.value) {
      await api.patch(`/vehicles/${editingId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Vehicle updated successfully!' })
    } else {
      await api.post('/vehicles', form.value)
      $q.notify({ type: 'positive', message: 'Vehicle added successfully!' })
    }
    showDialog.value = false
    form.value = emptyForm()
    fetchData()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Operation failed' })
  } finally {
    submitting.value = false
  }
}

// ─── Delete ──────────────────────────────────────────────────────────────────
const confirmDelete = (row: any) => {
  deleteTarget.value = row
  showDeleteDialog.value = true
}

const onDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.delete(`/vehicles/${deleteTarget.value.id}`)
    $q.notify({ type: 'positive', message: `Vehicle "${deleteTarget.value.registrationNumber}" deleted` })
    showDeleteDialog.value = false
    deleteTarget.value = null
    fetchData()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Delete failed' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => { fetchData(); fetchVehicleTypes() })
</script>

<template>
  <q-page class="q-pa-lg">

    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Vehicle Master</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Manage your fleet — vehicles, compliance & tracking</div>
        <div style="width:40px;height:3px;border-radius:2px;" class="bg-primary q-mt-sm"></div>
      </div>
      <div class="q-gutter-sm">
        <q-btn outline color="grey-8" label="Import" icon="upload_file" class="bg-white" />
        <q-btn unelevated color="primary" label="Add Vehicle" icon="add" class="shadow-2" @click="openCreateDialog" />
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-sm-3" v-for="kpi in kpis" :key="kpi.label">
        <q-card class="shadow-1 rounded-borders bg-white" flat bordered>
          <q-card-section class="q-pa-md row items-center justify-between no-wrap">
            <div>
              <div class="text-caption text-grey-6 text-uppercase q-mb-xs" style="letter-spacing:.6px;">{{ kpi.label }}</div>
              <div class="text-h5 text-weight-bold text-dark">{{ kpi.value }}</div>
            </div>
            <q-avatar size="44px" :color="`${kpi.color}-1`" :text-color="kpi.color">
              <q-icon :name="kpi.icon" size="22px" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- FILTER BAR -->
    <q-card class="shadow-1 rounded-borders q-mb-md bg-white" flat bordered>
      <q-card-section class="q-pa-sm q-px-md row items-center q-gutter-md">
        <q-input v-model="search" dense outlined placeholder="Search Reg No / Make / Model..." style="max-width:380px;" @keyup.enter="fetchData()">
          <template v-slot:prepend><q-icon name="search" /></template>
          <template v-slot:append v-if="search">
            <q-icon name="close" class="cursor-pointer" @click="search='';fetchData()" />
          </template>
        </q-input>
        <q-select v-model="filterStatus" :options="['ALL','AVAILABLE','IN_TRANSIT','ASSIGNED','MAINTENANCE','OUT_OF_SERVICE']" dense outlined label="Status" style="min-width:170px;" @update:model-value="fetchData()" />
        <q-space />
        <q-btn flat color="primary" icon="refresh" round dense @click="fetchData()"><q-tooltip>Refresh</q-tooltip></q-btn>
      </q-card-section>
    </q-card>

    <!-- TABLE -->
    <q-table
      :rows="rows" :columns="columns" row-key="id"
      :loading="loading" v-model:pagination="pagination" @request="fetchData"
      class="shadow-1 rounded-borders bg-white" flat bordered
      table-header-class="bg-grey-1 text-weight-bold text-grey-8"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)" rounded class="q-px-sm" style="font-size:11px;">
            {{ props.row.status?.replace(/_/g, ' ') }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-ownershipType="props">
        <q-td :props="props" class="text-center">
          <span class="text-grey-8 text-caption">{{ getOwnershipLabel(props.row.ownershipType) }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn flat round color="primary" icon="edit" size="sm" @click="openEditDialog(props.row)">
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmDelete(props.row)">
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width column flex-center text-grey-5 q-pa-xl">
          <q-icon name="local_shipping" size="3em" class="q-mb-sm" />
          <div class="text-subtitle1">No vehicles found</div>
          <q-btn unelevated color="primary" label="Add First Vehicle" icon="add" class="q-mt-md" @click="openCreateDialog" />
        </div>
      </template>
    </q-table>

    <!-- ─── CREATE / EDIT DRAWER ──────────────────────────────────── -->
    <q-dialog v-model="showDialog" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width:520px;max-width:100vw;" class="column bg-white">
        <q-card-section class="row items-center no-wrap q-py-md q-px-lg" style="border-bottom:2px solid #f0f0f0;min-height:64px;">
          <q-icon name="local_shipping" color="primary" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold text-dark">{{ isEditMode ? 'Edit Vehicle' : 'Add Vehicle' }}</div>
          <q-badge v-if="isEditMode" color="orange-2" text-color="orange-9" class="q-ml-sm" label="EDITING" />
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-6" size="sm" />
        </q-card-section>

        <q-card-section class="col scroll q-pa-lg">
          <q-form id="vehicleForm" @submit.prevent="onSubmit">

            <div class="form-section-label">Identity</div>

            <q-input v-model="form.registrationNumber" label="Registration No *" outlined dense class="q-mb-md"
              placeholder="GJ-01-XX-0000" :rules="[v => !!v || 'Required']" lazy-rules
              :disable="isEditMode"
              :hint="isEditMode ? 'Registration number cannot be changed' : ''"
            />

            <q-select v-model="form.vehicleTypeId" :options="vehicleTypes" option-value="value" option-label="label"
              emit-value map-options label="Vehicle Type *" outlined dense class="q-mb-md"
              :rules="[v => !!v || 'Required']" lazy-rules />

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><q-input v-model="form.make" label="Make *" outlined dense placeholder="Tata" :rules="[v => !!v || 'Required']" lazy-rules /></div>
              <div class="col-6"><q-input v-model="form.model" label="Model *" outlined dense placeholder="Prima 4928.S" :rules="[v => !!v || 'Required']" lazy-rules /></div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-select v-model="form.ownershipType" :options="ownershipOptions" option-value="value" option-label="label"
                  emit-value map-options label="Ownership *" outlined dense :rules="[v => !!v || 'Required']" lazy-rules />
              </div>
              <div class="col-6"><q-input v-model.number="form.year" type="number" label="Year of Mfg" outlined dense placeholder="2022" /></div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><q-input v-model.number="form.capacityWeight" type="number" label="Capacity (MT) *" outlined dense :rules="[v => !!v || 'Required']" lazy-rules /></div>
              <div class="col-6"><q-input v-model.number="form.targetKmPerL" type="number" step="0.1" label="Target km/L" outlined dense /></div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><q-input v-model="form.chassisNumber" label="Chassis No" outlined dense /></div>
              <div class="col-6"><q-input v-model="form.engineNumber" label="Engine No" outlined dense /></div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><q-input v-model="form.gpsDeviceId" label="GPS Device ID" outlined dense /></div>
              <div class="col-6"><q-input v-model="form.fastagId" label="FASTag ID" outlined dense /></div>
            </div>

            <q-select v-model="form.status" :options="statusOptions" option-value="value" option-label="label"
              emit-value map-options label="Status *" outlined dense class="q-mb-lg"
              :rules="[v => !!v || 'Required']" lazy-rules />

            <q-separator class="q-mb-md" />
            <div class="form-section-label">Documents — Expiry Dates</div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><q-input v-model="form.rcExpiry" type="date" label="RC Expiry *" outlined dense stack-label :rules="[v => !!v || 'Required']" lazy-rules /></div>
              <div class="col-6"><q-input v-model="form.fitnessExpiry" type="date" label="Fitness Expiry *" outlined dense stack-label :rules="[v => !!v || 'Required']" lazy-rules /></div>
            </div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><q-input v-model="form.insuranceExpiry" type="date" label="Insurance Expiry *" outlined dense stack-label :rules="[v => !!v || 'Required']" lazy-rules /></div>
              <div class="col-6"><q-input v-model="form.pucExpiry" type="date" label="PUC Expiry *" outlined dense stack-label :rules="[v => !!v || 'Required']" lazy-rules /></div>
            </div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><q-input v-model="form.permitExpiry" type="date" label="Permit Expiry" outlined dense stack-label /></div>
              <div class="col-6"><q-input v-model="form.roadTaxExpiry" type="date" label="Road Tax Expiry" outlined dense stack-label /></div>
            </div>

          </q-form>
        </q-card-section>

        <q-card-section class="row justify-end items-center q-py-sm q-px-lg" style="border-top:1px solid #f0f0f0;background:#fafafa;">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-btn type="submit" form="vehicleForm" :color="isEditMode ? 'orange' : 'primary'"
            :label="isEditMode ? 'Update Vehicle' : 'Save Vehicle'"
            :loading="submitting" unelevated class="q-px-lg" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ─── DELETE CONFIRM DIALOG ─────────────────────────────────── -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width:360px;" class="rounded-borders">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="warning" color="negative" text-color="white" size="42px" />
          <div class="q-ml-md">
            <div class="text-h6">Delete Vehicle?</div>
            <div class="text-caption text-grey-6">This action cannot be undone</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-body2">Are you sure you want to delete vehicle <strong>{{ deleteTarget?.registrationNumber }}</strong>?</div>
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn unelevated label="Yes, Delete" color="negative" :loading="deleting" @click="onDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<style scoped>
.rounded-borders { border-radius: 12px !important; }
.form-section-label {
  font-size: 11px; font-weight: 700; letter-spacing: .8px;
  text-transform: uppercase; color: #6b7280; margin-bottom: 14px; margin-top: 4px;
}
</style>
