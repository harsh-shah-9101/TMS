<template>
  <ResourcePage
    ref="page"
    title="Vehicle Types"
    :api="vehicleTypesApi"
    :columns="columns"
    permission="vehicle-types"
    storage-key="vehicle-types"
    sort-column="name"
    :row-label="(row) => String(row.name || '')"
    @new="dialog?.openNew()"
    @open="(row) => dialog?.openEdit(String(row.id))"
    @edit="(row) => dialog?.openEdit(String(row.id))"
  />
  <VehicleTypeDialog ref="dialog" @saved="page?.reload()" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import type { DeskColumn } from '@/desk/tms/ui';
import ResourcePage from '@/desk/tms/components/ResourcePage.vue';
import { vehicleTypesApi } from '@/desk/tms/api/masters';
import { formatStatus } from '@/desk/tms/format';
import VehicleTypeDialog from './VehicleTypeDialog.vue';

const page = useTemplateRef<any>('page');
const dialog = useTemplateRef<InstanceType<typeof VehicleTypeDialog>>('dialog');

const columns: DeskColumn[] = [
  {
    id: 'code',
    header: 'Code',
    width: 100,
    format: (val) => String(val || '—'),
  },
  {
    id: 'name',
    header: 'Vehicle Type',
    width: 240,
    format: (val) => String(val || '—'),
  },
  {
    id: 'capacityTons',
    header: 'Capacity (Tons)',
    width: 130,
    align: 'right',
    format: (val) => (val !== undefined && val !== null && val !== '' ? `${val} Tons` : '—'),
  },
  {
    id: 'volumeCuFt',
    header: 'Volume (Cu. Ft)',
    width: 130,
    align: 'right',
    format: (val) => (val ? `${val} cu.ft` : '—'),
  },
  {
    id: 'axleCount',
    header: 'Axles',
    width: 90,
    align: 'center',
    format: (val) => String(val || '—'),
  },
  {
    id: 'fuelType',
    header: 'Fuel Type',
    width: 110,
    align: 'center',
    format: formatStatus,
  },
  {
    id: 'status',
    header: 'Status',
    width: 110,
    align: 'center',
    format: formatStatus,
  },
];
</script>
