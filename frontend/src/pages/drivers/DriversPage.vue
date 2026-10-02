<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/config/api'
import TmsField from '@/components/form/TmsField.vue'
import TmsCombo from '@/components/form/TmsCombo.vue'
import { useTmsFormFocus } from '@/composables/useTmsFormFocus'

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
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// ─── Keyboard-first form focus ────────────────────────────────────────────────
const formContainerRef = ref<HTMLElement | null>(null)
const { focusNext, focusPrev, focusInitial } = useTmsFormFocus(
  formContainerRef,
  () => onSubmit(),
)

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = ref([
  { label: 'Total Drivers', value: '0', color: 'primary', icon: 'badge' },
  { label: 'Active', value: '0', color: 'positive', icon: 'check_circle' },
  { label: 'Inactive', value: '0', color: 'grey-7', icon: 'block' },
  { label: 'Expiring Soon', value: '0', color: 'warning', icon: 'warning' },
])

// ─── Options ──────────────────────────────────────────────────────────────────
const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
]
const licenseClassOptions = [
  { label: 'LMV (Light Motor Vehicle)', value: 'LMV' },
  { label: 'HMV (Heavy Motor Vehicle)', value: 'HMV' },
  { label: 'HGMV (Heavy Goods Motor Vehicle)', value: 'HGMV' },
  { label: 'HPMV (Heavy Passenger Motor Vehicle)', value: 'HPMV' },
]

// ─── Table Columns ────────────────────────────────────────────────────────────
const columns: any[] = [
  { name: 'name', label: 'Driver Name', align: 'left', field: 'name', sortable: true },
  { name: 'mobile', label: 'Mobile', align: 'left', field: 'mobile' },
  { name: 'licenseNumber', label: 'License No', align: 'left', field: 'licenseNumber' },
  { name: 'licenseExpiry', label: 'License Expiry', align: 'left', field: (r: any) => r.licenseExpiry ? r.licenseExpiry.split('T')[0] : '—' },
  { name: 'status', label: 'Status', align: 'center', field: 'status' },
  { name: 'actions', label: 'Actions', align: 'right' },
]

// ─── Form Factory ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
  name: '',
  mobile: '',
  alternatePhone: '',
  email: '',
  licenseNumber: '',
  licenseClass: null as string | null,
  licenseExpiry: '',
  badgeNumber: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
  status: 'ACTIVE',
})
const form = ref(emptyForm())

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStatusColor = (s: string) =>
  ({ ACTIVE: 'positive', INACTIVE: 'grey', SUSPENDED: 'negative' }[s] || 'grey')

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchData = async (props?: any) => {
  const page = props?.pagination?.page || pagination.value.page
  const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage
  const status = filterStatus.value !== 'ALL' ? filterStatus.value : undefined

  loading.value = true
  try {
    const res = await api.get('/drivers', {
      params: { page, limit, search: search.value || undefined, status },
    })
    rows.value = res.data.data || []
    pagination.value = { page, rowsPerPage: limit, rowsNumber: res.data.meta?.total || 0 }

    const all = rows.value as any[]
    kpis.value[0].value = String(pagination.value.rowsNumber)
    kpis.value[1].value = String(all.filter(r => r.status === 'ACTIVE').length)
    kpis.value[2].value = String(all.filter(r => r.status === 'INACTIVE').length)
    // Expiring within 30 days
    const soon = new Date(); soon.setDate(soon.getDate() + 30)
    kpis.value[3].value = String(all.filter(r => r.licenseExpiry && new Date(r.licenseExpiry) <= soon).length)
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to fetch drivers' })
  } finally {
    loading.value = false
  }
}

watch(filterStatus, () => { pagination.value.page = 1; fetchData() })

// ─── Create ──────────────────────────────────────────────────────────────────
const openCreateDialog = () => {
  isEditMode.value = false
  editingId.value = null
  form.value = emptyForm()
  showDialog.value = true
  focusInitial()
}

// ─── Edit ────────────────────────────────────────────────────────────────────
const openEditDialog = (row: any) => {
  isEditMode.value = true
  editingId.value = row.id
  form.value = {
    name: row.name || '',
    mobile: row.mobile || '',
    alternatePhone: row.alternatePhone || '',
    email: row.email || '',
    licenseNumber: row.licenseNumber || '',
    licenseClass: row.licenseClass || null,
    licenseExpiry: row.licenseExpiry ? row.licenseExpiry.split('T')[0] : '',
    badgeNumber: row.badgeNumber || '',
    addressLine1: row.addressLine1 || '',
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    status: row.status || 'ACTIVE',
  }
  showDialog.value = true
  focusInitial()
}

// ─── Submit ───────────────────────────────────────────────────────────────────
const onSubmit = async () => {
  submitting.value = true
  try {
    if (isEditMode.value && editingId.value) {
      await api.patch(`/drivers/${editingId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Driver updated successfully!' })
    } else {
      await api.post('/drivers', form.value)
      $q.notify({ type: 'positive', message: `Driver "${form.value.name}" added!` })
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
const confirmDelete = (row: any) => { deleteTarget.value = row; showDeleteDialog.value = true }

const onDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.delete(`/drivers/${deleteTarget.value.id}`)
    $q.notify({ type: 'positive', message: `Driver "${deleteTarget.value.name}" deleted` })
    showDeleteDialog.value = false
    deleteTarget.value = null
    fetchData()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Delete failed' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <q-page class="q-pa-lg">

    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Driver Master</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Manage driver profiles and compliance</div>
        <div style="width:40px;height:3px;border-radius:2px;" class="bg-cyan-6 q-mt-sm"></div>
      </div>
      <div class="q-gutter-sm">
        <q-btn outline color="grey-8" label="Export" icon="download" class="bg-white" />
        <q-btn unelevated color="primary" label="Add Driver" icon="add" class="shadow-2" @click="openCreateDialog" />
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
        <q-input v-model="search" dense outlined placeholder="Search Name / Mobile / License..." style="max-width:380px;" @keyup.enter="fetchData()">
          <template v-slot:prepend><q-icon name="search" /></template>
          <template v-slot:append v-if="search">
            <q-icon name="close" class="cursor-pointer" @click="search='';fetchData()" />
          </template>
        </q-input>
        <q-select v-model="filterStatus" :options="['ALL','ACTIVE','INACTIVE','SUSPENDED']" dense outlined label="Status" style="min-width:150px;" />
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
            {{ props.row.status }}
          </q-badge>
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
          <q-icon name="badge" size="3em" class="q-mb-sm" />
          <div class="text-subtitle1">No drivers found</div>
          <q-btn unelevated color="primary" label="Add First Driver" icon="add" class="q-mt-md" @click="openCreateDialog" />
        </div>
      </template>
    </q-table>

    <!-- ─── CREATE / EDIT DRAWER ──────────────────────────────────── -->
    <q-dialog v-model="showDialog" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width:520px;max-width:100vw;" class="column bg-white">

        <q-card-section class="row items-center no-wrap q-py-md q-px-lg" style="border-bottom:2px solid #f0f0f0;min-height:64px;">
          <q-icon name="badge" color="cyan-7" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold text-dark">{{ isEditMode ? 'Edit Driver' : 'Add Driver' }}</div>
          <q-badge v-if="isEditMode" color="orange-2" text-color="orange-9" class="q-ml-sm" label="EDITING" />
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-6" size="sm" />
        </q-card-section>

        <q-card-section class="col scroll q-pa-lg">
          <div ref="formContainerRef">
          <q-form id="driverForm" @submit.prevent="onSubmit">

            <!-- Personal Info -->
            <div class="form-section-label">Personal Information</div>
            <TmsField field-id="d-name" label="Full Name" v-model="form.name"
              :required="true" :initial="true" placeholder="e.g. Ramesh Patel"
              :focus-next="focusNext" :focus-prev="focusPrev" class="q-mb-md" />

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <TmsField field-id="d-mobile" label="Mobile" v-model="form.mobile"
                  type="tel" :required="true" placeholder="98765XXXXX"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
              <div class="col-6">
                <TmsField field-id="d-altphone" label="Alternate Phone" v-model="form.alternatePhone"
                  type="tel" placeholder="Optional"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
            </div>

            <TmsField field-id="d-email" label="Email" v-model="form.email"
              type="email" placeholder="driver@example.com"
              :focus-next="focusNext" :focus-prev="focusPrev" class="q-mb-md" />

            <!-- License -->
            <q-separator class="q-mb-md" />
            <div class="form-section-label">License Details</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <TmsField field-id="d-license" label="License No" v-model="form.licenseNumber"
                  :required="true" placeholder="GJ0120220012345"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
              <div class="col-6">
                <TmsCombo field-id="d-lclass" label="License Class" v-model="form.licenseClass"
                  :options="licenseClassOptions" :required="true"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
            </div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <TmsField field-id="d-lexpiry" label="License Expiry" v-model="form.licenseExpiry"
                  type="date" :required="true"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
              <div class="col-6">
                <TmsField field-id="d-badge" label="Badge Number" v-model="form.badgeNumber"
                  placeholder="BD-001"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
            </div>

            <!-- Address -->
            <q-separator class="q-mb-md" />
            <div class="form-section-label">Address</div>
            <TmsField field-id="d-addr" label="Address" v-model="form.addressLine1"
              :focus-next="focusNext" :focus-prev="focusPrev" class="q-mb-md" />
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4">
                <TmsField field-id="d-city" label="City" v-model="form.city"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
              <div class="col-5">
                <TmsField field-id="d-state" label="State" v-model="form.state"
                  :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
              <div class="col-3">
                <TmsField field-id="d-pin" label="Pincode" v-model="form.pincode"
                  maxlength="6" :focus-next="focusNext" :focus-prev="focusPrev" />
              </div>
            </div>

            <!-- Status -->
            <q-separator class="q-mb-md" />
            <TmsCombo field-id="d-status" label="Status" v-model="form.status"
              :options="statusOptions" :required="true"
              :focus-next="focusNext" :focus-prev="focusPrev" />

          </q-form>
          </div>
        </q-card-section>

        <q-card-section class="row justify-end items-center q-py-sm q-px-lg" style="border-top:1px solid #f0f0f0;background:#fafafa;">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-btn type="submit" form="driverForm"
            :color="isEditMode ? 'orange' : 'cyan-7'"
            :label="isEditMode ? 'Update Driver' : 'Save Driver'"
            :loading="submitting" unelevated class="q-px-lg" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ─── DELETE CONFIRM ─────────────────────────────────────────── -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width:360px;" class="rounded-borders">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="warning" color="negative" text-color="white" size="42px" />
          <div class="q-ml-md">
            <div class="text-h6">Delete Driver?</div>
            <div class="text-caption text-grey-6">This action cannot be undone</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-body2">Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>?</div>
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
