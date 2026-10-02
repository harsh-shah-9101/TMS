<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/config/api'

const $q = useQuasar()

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const rows = ref<any[]>([])
const search = ref('')
const activeTab = ref('ALL')

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// ─── KPI Counters ─────────────────────────────────────────────────────────────
const kpis = ref([
  { label: 'Total Parties', value: '0', color: 'primary', icon: 'storefront' },
  { label: 'Shippers', value: '0', color: 'info', icon: 'upload' },
  { label: 'Consignees', value: '0', color: 'positive', icon: 'download' },
  { label: 'Inactive', value: '0', color: 'grey-7', icon: 'block' },
])

// ─── Options ──────────────────────────────────────────────────────────────────
const typeOptions = [
  { label: 'Shipper', value: 'SHIPPER' },
  { label: 'Consignee', value: 'CONSIGNEE' },
  { label: 'Both', value: 'BOTH' },
]

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

// ─── Empty form factory ───────────────────────────────────────────────────────
const emptyForm = () => ({
  name: '',
  code: '',
  type: 'BOTH' as string,
  gstin: '',
  pan: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  status: 'ACTIVE' as string,
})

const form = ref(emptyForm())

// ─── Table columns ────────────────────────────────────────────────────────────
const columns: any[] = [
  { name: 'name', label: 'Party Name', align: 'left', field: 'name', sortable: true },
  { name: 'code', label: 'Code', align: 'left', field: 'code', sortable: true },
  { name: 'type', label: 'Type', align: 'center', field: 'type' },
  { name: 'gstin', label: 'GSTIN', align: 'left', field: 'gstin' },
  { name: 'city', label: 'City', align: 'left', field: 'city' },
  { name: 'phone', label: 'Phone', align: 'left', field: 'phone' },
  { name: 'status', label: 'Status', align: 'center', field: 'status' },
  { name: 'actions', label: 'Actions', align: 'right' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTypeColor = (type: string) => {
  switch (type) {
    case 'SHIPPER': return 'info'
    case 'CONSIGNEE': return 'positive'
    case 'BOTH': return 'purple'
    default: return 'grey'
  }
}

const getStatusColor = (status: string) =>
  status === 'ACTIVE' ? 'positive' : 'negative'

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchData = async (props?: any) => {
  const page = props?.pagination?.page || pagination.value.page
  const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage
  const typeFilter = activeTab.value === 'ALL' ? undefined : activeTab.value

  loading.value = true
  try {
    const response = await api.get('/customers', {
      params: { page, limit, search: search.value || undefined, type: typeFilter },
    })

    rows.value = response.data.data || []
    pagination.value.page = page
    pagination.value.rowsPerPage = limit
    pagination.value.rowsNumber = response.data.meta?.total || 0

    // Update KPIs from the returned page
    const all = rows.value as any[]
    kpis.value[0].value = String(pagination.value.rowsNumber)
    kpis.value[1].value = String(all.filter((r) => r.type === 'SHIPPER').length)
    kpis.value[2].value = String(all.filter((r) => r.type === 'CONSIGNEE').length)
    kpis.value[3].value = String(all.filter((r) => r.status === 'INACTIVE').length)
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Failed to fetch parties' })
  } finally {
    loading.value = false
  }
}

// Auto-generate code from name
watch(() => form.value.name, (val) => {
  if (!form.value.code && val) {
    form.value.code = val.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 10)
  }
})

// Re-fetch when tab changes
watch(activeTab, () => {
  pagination.value.page = 1
  fetchData()
})

// ─── Submit ───────────────────────────────────────────────────────────────────
const onSubmit = async () => {
  submitting.value = true
  try {
    await api.post('/customers', form.value)
    $q.notify({ type: 'positive', message: `Party "${form.value.name}" added successfully!` })
    showDialog.value = false
    form.value = emptyForm()
    fetchData()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.message || 'Failed to create party',
    })
  } finally {
    submitting.value = false
  }
}

const openNewDialog = () => {
  form.value = emptyForm()
  showDialog.value = true
}

onMounted(() => fetchData())
</script>

<template>
  <q-page class="q-pa-lg">

    <!-- PAGE HEADER -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-dark">Party Master</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Manage Shippers, Consignees & Partners</div>
        <div style="width: 40px; height: 3px; border-radius: 2px;" class="bg-primary q-mt-sm"></div>
      </div>
      <div class="q-gutter-sm">
        <q-btn outline color="grey-8" label="Export" icon="download" class="bg-white" />
        <q-btn unelevated color="primary" label="Add Party" icon="add" class="shadow-2" @click="openNewDialog" />
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-sm-3" v-for="kpi in kpis" :key="kpi.label">
        <q-card class="shadow-1 rounded-borders bg-white" flat bordered>
          <q-card-section class="q-pa-md row items-center justify-between no-wrap">
            <div>
              <div class="text-caption text-grey-6 text-uppercase q-mb-xs" style="letter-spacing:0.6px;">{{ kpi.label }}</div>
              <div class="text-h5 text-weight-bold text-dark">{{ kpi.value }}</div>
            </div>
            <q-avatar size="44px" :color="`${kpi.color}-1`" :text-color="kpi.color">
              <q-icon :name="kpi.icon" size="22px" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- FILTER CARD with tabs + search -->
    <q-card class="shadow-1 rounded-borders q-mb-md bg-white" flat bordered>
      <!-- Type Filter Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-6 q-px-md"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
        no-caps
      >
        <q-tab name="ALL" label="All Parties" />
        <q-tab name="SHIPPER" label="Shippers" />
        <q-tab name="CONSIGNEE" label="Consignees" />
        <q-tab name="BOTH" label="Both" />
      </q-tabs>
      <q-separator />

      <!-- Search Row -->
      <q-card-section class="q-pa-sm q-px-md row items-center q-gutter-md">
        <q-input
          v-model="search"
          dense outlined
          placeholder="Search Party Name / Code / GSTIN / City..."
          style="max-width: 420px; min-width: 200px;"
          @keyup.enter="fetchData()"
        >
          <template v-slot:prepend><q-icon name="search" /></template>
          <template v-slot:append v-if="search">
            <q-icon name="close" class="cursor-pointer" @click="search = ''; fetchData()" />
          </template>
        </q-input>
        <q-space />
        <q-btn flat color="primary" icon="refresh" round dense @click="fetchData()">
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
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
      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-badge :color="getTypeColor(props.row.type)" rounded class="q-px-sm text-weight-medium" style="font-size:11px;">
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
          <q-btn flat round color="grey-7" icon="visibility" size="sm"><q-tooltip>View</q-tooltip></q-btn>
          <q-btn flat round color="primary" icon="edit" size="sm"><q-tooltip>Edit</q-tooltip></q-btn>
          <q-btn flat round color="negative" icon="delete" size="sm"><q-tooltip>Delete</q-tooltip></q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="full-width column flex-center text-grey-5 q-pa-xl">
          <q-icon name="storefront" size="3em" class="q-mb-sm" />
          <div class="text-subtitle1">No parties found</div>
          <q-btn unelevated color="primary" label="Add First Party" icon="add" class="q-mt-md" @click="openNewDialog" />
        </div>
      </template>
    </q-table>

    <!-- ─── ADD PARTY SIDE DRAWER ─────────────────────────────────────────── -->
    <q-dialog v-model="showDialog" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card style="width: 520px; max-width: 100vw;" class="column bg-white">

        <!-- Header -->
        <q-card-section class="row items-center no-wrap q-py-md q-px-lg" style="border-bottom: 2px solid #f0f0f0; min-height: 64px;">
          <q-icon name="storefront" color="primary" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold text-dark">Add Party</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-6" size="sm" />
        </q-card-section>

        <!-- Scrollable Body -->
        <q-card-section class="col scroll q-pa-lg">
          <q-form id="partyForm" @submit.prevent="onSubmit">

            <!-- Section: Identity -->
            <div class="form-section-label">Identity</div>

            <q-input v-model="form.name" label="Party Name *" outlined dense class="q-mb-md" placeholder="e.g. Reliance Industries Ltd" :rules="[v => !!v || 'Required']" lazy-rules />

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-input v-model="form.code" label="Party Code *" outlined dense placeholder="RIL-001" :rules="[v => !!v || 'Required']" lazy-rules />
              </div>
              <div class="col-6">
                <q-select
                  v-model="form.type"
                  :options="typeOptions"
                  option-value="value" option-label="label"
                  emit-value map-options
                  label="Type *" outlined dense
                  :rules="[v => !!v || 'Required']" lazy-rules
                />
              </div>
            </div>

            <!-- Section: Tax Info -->
            <q-separator class="q-mb-md" />
            <div class="form-section-label">Tax & Compliance</div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-7">
                <q-input v-model="form.gstin" label="GSTIN" outlined dense placeholder="27AAAAA0000A1Z5" maxlength="15" />
              </div>
              <div class="col-5">
                <q-input v-model="form.pan" label="PAN" outlined dense placeholder="AAAAA0000A" maxlength="10" />
              </div>
            </div>

            <!-- Section: Contact -->
            <q-separator class="q-mb-md" />
            <div class="form-section-label">Contact Details</div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-input v-model="form.phone" label="Phone" outlined dense placeholder="98765XXXXX" />
              </div>
              <div class="col-6">
                <q-input v-model="form.email" type="email" label="Email" outlined dense placeholder="logistics@company.com" />
              </div>
            </div>

            <!-- Section: Address -->
            <q-separator class="q-mb-md" />
            <div class="form-section-label">Address</div>

            <q-input v-model="form.addressLine1" label="Address Line 1" outlined dense class="q-mb-sm" />
            <q-input v-model="form.addressLine2" label="Address Line 2" outlined dense class="q-mb-md" />

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-5">
                <q-input v-model="form.city" label="City" outlined dense />
              </div>
              <div class="col-4">
                <q-select
                  v-model="form.state"
                  :options="indianStates"
                  label="State" outlined dense
                  use-input
                  input-debounce="0"
                  behavior="menu"
                />
              </div>
              <div class="col-3">
                <q-input v-model="form.pincode" label="Pincode" outlined dense maxlength="6" />
              </div>
            </div>

            <!-- Status -->
            <q-separator class="q-mb-md" />
            <q-select
              v-model="form.status"
              :options="statusOptions"
              option-value="value" option-label="label"
              emit-value map-options
              label="Status *" outlined dense
              :rules="[v => !!v || 'Required']" lazy-rules
            />

          </q-form>
        </q-card-section>

        <!-- Footer -->
        <q-card-section class="row justify-end items-center q-py-sm q-px-lg" style="border-top: 1px solid #f0f0f0; background: #fafafa;">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-btn
            type="submit"
            form="partyForm"
            color="primary"
            label="Save Party"
            :loading="submitting"
            unelevated class="q-px-lg"
          />
        </q-card-section>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<style scoped>
.rounded-borders { border-radius: 12px !important; }
.text-mono { font-family: 'Roboto Mono', monospace; }
.form-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 14px;
  margin-top: 4px;
}
</style>
