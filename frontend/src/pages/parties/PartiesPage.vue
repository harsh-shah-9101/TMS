<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/config/api'
import DeskForm from '@/desk/desk/framework/form/DeskForm.vue'
import DeskField from '@/desk/desk/framework/form/DeskField.vue'
import type { DeskIssue } from '@/desk/desk/framework/form/issues'

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
const activeTab = ref('ALL')  // always start on All Parties

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = ref([
  { label: 'Total Parties', value: '0', color: 'primary', icon: 'storefront' },
  { label: 'Shippers', value: '0', color: 'info', icon: 'upload' },
  { label: 'Consignees', value: '0', color: 'positive', icon: 'download' },
  { label: 'Inactive', value: '0', color: 'grey-7', icon: 'block' },
])

// ─── Options ──────────────────────────────────────────────────────────────────
const typeOptions = [
  { label: 'Shipper (Sender)', value: 'SHIPPER' },
  { label: 'Consignee (Receiver)', value: 'CONSIGNEE' },
  { label: 'Both', value: 'BOTH' },
]
const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]
const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

// ─── Table columns ────────────────────────────────────────────────────────────
const columns: any[] = [
  { name: 'name', label: 'Party Name', align: 'left', field: 'name', sortable: true },
  { name: 'code', label: 'Code', align: 'left', field: 'code', sortable: true },
  { name: 'type', label: 'Type', align: 'center', field: 'type' },
  { name: 'gstin', label: 'GSTIN', align: 'left', field: 'gstin' },
  { name: 'city', label: 'City / State', align: 'left', field: (r: any) => [r.city, r.state].filter(Boolean).join(', ') || '—' },
  { name: 'phone', label: 'Phone', align: 'left', field: 'phone' },
  { name: 'status', label: 'Status', align: 'center', field: 'status' },
  { name: 'actions', label: 'Actions', align: 'right' },
]

// ─── Form Factory ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
  name: '', code: '', type: 'BOTH',
  gstin: '', pan: '', email: '', phone: '',
  addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '', status: 'ACTIVE',
})
const form = ref(emptyForm())

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getTypeColor = (type: string) =>
  ({ SHIPPER: 'info', CONSIGNEE: 'positive', BOTH: 'purple' }[type] || 'grey')

const getStatusColor = (s: string) => s === 'ACTIVE' ? 'positive' : 'negative'

// ─── Auto-generate code from name (only on create) ───────────────────────────
watch(() => form.value.name, (val) => {
  if (!isEditMode.value && val) {
    form.value.code = val.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').slice(0, 10).replace(/-$/, '')
  }
})

// ─── Fetch real KPI counts from backend ──────────────────────────────────────
const fetchKpis = async () => {
  try {
    const [allRes, shipperRes, consigneeRes, inactiveRes] = await Promise.all([
      api.get('/customers', { params: { page: 1, limit: 1 } }),
      api.get('/customers', { params: { page: 1, limit: 1, type: 'SHIPPER' } }),
      api.get('/customers', { params: { page: 1, limit: 1, type: 'CONSIGNEE' } }),
      api.get('/customers', { params: { page: 1, limit: 1, status: 'INACTIVE' } }),
    ])
    kpis.value[0].value = String(allRes.data.meta?.total || 0)
    kpis.value[1].value = String(shipperRes.data.meta?.total || 0)
    kpis.value[2].value = String(consigneeRes.data.meta?.total || 0)
    kpis.value[3].value = String(inactiveRes.data.meta?.total || 0)
  } catch { /* silent */ }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchData = async (props?: any) => {
  const page = props?.pagination?.page || pagination.value.page
  const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage
  const typeFilter = activeTab.value !== 'ALL' ? activeTab.value : undefined

  loading.value = true
  try {
    const res = await api.get('/customers', {
      params: { page, limit, search: search.value || undefined, type: typeFilter },
    })
    rows.value = res.data.data || []
    pagination.value = { page, rowsPerPage: limit, rowsNumber: res.data.meta?.total || 0 }
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Failed to fetch parties' })
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => { pagination.value.page = 1; fetchData() })

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
    name: row.name || '',
    code: row.code || '',
    type: row.type || 'BOTH',
    gstin: row.gstin || '',
    pan: row.pan || '',
    email: row.email || '',
    phone: row.phone || '',
    addressLine1: row.addressLine1 || '',
    addressLine2: row.addressLine2 || '',
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    status: row.status || 'ACTIVE',
  }
  showDialog.value = true
}

const formIssues = ref<DeskIssue[]>([])

const validate = () => {
  const issues: DeskIssue[] = []
  if (!form.value.name) issues.push({ fieldId: 'name', message: 'Required' })
  if (!form.value.code) issues.push({ fieldId: 'code', message: 'Required' })
  if (!form.value.type) issues.push({ fieldId: 'type', message: 'Required' })
  if (!form.value.status) issues.push({ fieldId: 'status', message: 'Required' })
  formIssues.value = issues
  return issues.length === 0
}

// ─── Submit ───────────────────────────────────────────────────────────────────
const onSubmit = async () => {
  if (!validate()) return
  submitting.value = true
  try {
    if (isEditMode.value && editingId.value) {
      await api.patch(`/customers/${editingId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Party updated successfully!' })
    } else {
      await api.post('/customers', form.value)
      $q.notify({ type: 'positive', message: `Party "${form.value.name}" created!` })
    }
    showDialog.value = false
    form.value = emptyForm()
    refreshAll()
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
    await api.delete(`/customers/${deleteTarget.value.id}`)
    $q.notify({ type: 'positive', message: `Party "${deleteTarget.value.name}" deleted` })
    showDeleteDialog.value = false
    deleteTarget.value = null
    refreshAll()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Delete failed' })
  } finally {
    deleting.value = false
  }
}
const refreshAll = () => {
  fetchData()
  fetchKpis()
}

onMounted(() => refreshAll())
</script>

<template>
  <q-page class="q-pa-lg">

    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Party Master</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Manage Shippers, Consignees & Partners</div>
        <div style="width:40px;height:3px;border-radius:2px;" class="bg-primary q-mt-sm"></div>
      </div>
      <div class="q-gutter-sm">
        <q-btn outline color="grey-8" label="Export" icon="download" class="bg-white" />
        <q-btn unelevated color="primary" label="Add Party" icon="add" class="shadow-2" @click="openCreateDialog" />
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

    <!-- FILTER CARD -->
    <q-card class="shadow-1 rounded-borders q-mb-md bg-white" flat bordered>
      <q-tabs v-model="activeTab" dense class="text-grey-6 q-px-md" active-color="primary" indicator-color="primary" align="left" narrow-indicator no-caps>
        <q-tab name="ALL" label="All Parties" />
        <q-tab name="SHIPPER" label="Shippers" />
        <q-tab name="CONSIGNEE" label="Consignees" />
        <q-tab name="BOTH" label="Both" />
      </q-tabs>
      <q-separator />
      <q-card-section class="q-pa-sm q-px-md row items-center q-gutter-md">
        <q-input v-model="search" dense outlined placeholder="Search Name / Code / GSTIN / City..." style="max-width:420px;" @keyup.enter="fetchData()">
          <template v-slot:prepend><q-icon name="search" /></template>
          <template v-slot:append v-if="search">
            <q-icon name="close" class="cursor-pointer" @click="search='';fetchData()" />
          </template>
        </q-input>
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
      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-badge :color="getTypeColor(props.row.type)" rounded class="q-px-sm" style="font-size:11px;">
            {{ props.row.type }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)" rounded class="q-px-sm" style="font-size:11px;">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-gstin="props">
        <q-td :props="props">
          <span class="text-mono text-grey-8" style="font-size:12px;">{{ props.row.gstin || '—' }}</span>
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
          <q-icon name="storefront" size="3em" class="q-mb-sm" />
          <div class="text-subtitle1">No parties found</div>
          <q-btn unelevated color="primary" label="Add First Party" icon="add" class="q-mt-md" @click="openCreateDialog" />
        </div>
      </template>
    </q-table>

    <!-- ─── CREATE / EDIT DRAWER ──────────────────────────────────── -->
    <q-dialog v-model="showDialog" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width:520px;max-width:100vw;" class="column bg-white">

        <q-card-section class="row items-center no-wrap q-py-md q-px-lg" style="border-bottom:2px solid #f0f0f0;min-height:64px;">
          <q-icon name="storefront" color="primary" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold text-dark">{{ isEditMode ? 'Edit Party' : 'Add Party' }}</div>
          <q-badge v-if="isEditMode" color="orange-2" text-color="orange-9" class="q-ml-sm" label="EDITING" />
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-6" size="sm" />
        </q-card-section>

        <q-card-section class="col scroll q-pa-lg">
          <DeskForm id="partyForm" :issues="formIssues" @save="onSubmit" data-desk-layer>
            
            <div class="form-section-label">Identity</div>
            <DeskField class="q-mb-md" fieldId="name" label="Party Name" v-model="form.name" required initial />

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <DeskField fieldId="code" label="Party Code" v-model="form.code" required :readonly="isEditMode" />
              </div>
              <div class="col-6">
                <DeskField fieldId="type" kind="select" label="Type" :options="typeOptions" v-model="form.type" required />
              </div>
            </div>

            <q-separator class="q-mb-md" />
            <div class="form-section-label">Tax & Compliance</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-7"><DeskField fieldId="gstin" label="GSTIN" v-model="form.gstin" /></div>
              <div class="col-5"><DeskField fieldId="pan" label="PAN" v-model="form.pan" /></div>
            </div>

            <q-separator class="q-mb-md" />
            <div class="form-section-label">Contact Details</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6"><DeskField fieldId="phone" label="Phone" v-model="form.phone" /></div>
              <div class="col-6"><DeskField fieldId="email" label="Email" v-model="form.email" /></div>
            </div>

            <q-separator class="q-mb-md" />
            <div class="form-section-label">Address</div>
            <DeskField class="q-mb-sm" fieldId="addressLine1" label="Address Line 1" v-model="form.addressLine1" />
            <DeskField class="q-mb-md" fieldId="addressLine2" label="Address Line 2" v-model="form.addressLine2" />
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4"><DeskField fieldId="city" label="City" v-model="form.city" /></div>
              <div class="col-5">
                <DeskField fieldId="state" kind="select" label="State" :options="indianStates.map(s => ({label: s, value: s}))" v-model="form.state" />
              </div>
              <div class="col-3"><DeskField fieldId="pincode" label="Pincode" v-model="form.pincode" /></div>
            </div>

            <q-separator class="q-mb-md" />
            <DeskField fieldId="status" kind="select" label="Status" :options="statusOptions" v-model="form.status" required />

          </DeskForm>
        </q-card-section>

        <q-card-section class="row justify-end items-center q-py-sm q-px-lg" style="border-top:1px solid #f0f0f0;background:#fafafa;">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-btn type="submit" form="partyForm"
            :color="isEditMode ? 'orange' : 'primary'"
            :label="isEditMode ? 'Update Party' : 'Save Party'"
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
            <div class="text-h6">Delete Party?</div>
            <div class="text-caption text-grey-6">This action cannot be undone</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-body2">
            Are you sure you want to delete party <strong>{{ deleteTarget?.name }}</strong>
            <span class="text-grey-6"> ({{ deleteTarget?.code }})</span>?
          </div>
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
.text-mono { font-family: 'Roboto Mono', monospace; }
.form-section-label {
  font-size: 11px; font-weight: 700; letter-spacing: .8px;
  text-transform: uppercase; color: #6b7280; margin-bottom: 14px; margin-top: 4px;
}
</style>
