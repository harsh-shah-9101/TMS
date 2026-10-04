<template>
  <ResourcePage
    ref="page"
    title="Vehicle Master"
    :api="vehiclesApi"
    :columns="columns"
    permission="vehicles"
    storage-key="vehicles"
    sort-column="registrationNumber"
    :row-label="(row) => String(row.registrationNumber || '')"
    @new="dialog?.openNew()"
    @open="(row) => dialog?.openEdit(String(row.id))"
    @edit="(row) => dialog?.openEdit(String(row.id))"
  />
  <VehicleDialog ref="dialog" @saved="page?.reload()" />
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import type { DeskColumn } from '@/desk/tms/ui';
import ResourcePage from '@/desk/tms/components/ResourcePage.vue';
import { vehiclesApi } from '@/desk/tms/api/masters';
import { formatStatus } from '@/desk/tms/format';
import VehicleDialog from './VehicleDialog.vue';

const route = useRoute();
const page = useTemplateRef<any>('page');
const dialog = useTemplateRef<InstanceType<typeof VehicleDialog>>('dialog');

onMounted(() => {
  if (route.query.new === '1') {
    setTimeout(() => {
      dialog.value?.openNew();
    }, 150);
  }
});

const columns: DeskColumn[] = [
  {
    id: 'registrationNumber',
    header: 'Reg Number',
    width: 140,
    format: (val) => String(val || '—'),
  },
  {
    id: 'make',
    header: 'Make / Model',
    width: 200,
    format: (_, row) => [row.make, row.model].filter(Boolean).join(' ') || '—',
  },
  {
    id: 'vehicleTypeId',
    header: 'Type',
    width: 160,
    format: (_, row: any) => row.vehicleType?.name || '—',
  },
  {
    id: 'capacityWeight',
    header: 'Capacity (MT)',
    width: 120,
    align: 'right',
    format: (val) => (val !== undefined && val !== null && val !== '' ? `${val} MT` : '—'),
  },
  {
    id: 'ownershipType',
    header: 'Ownership',
    width: 110,
    align: 'center',
    format: formatStatus,
  },
  {
    id: 'status',
    header: 'Status',
    width: 130,
    align: 'center',
    format: formatStatus,
  },
  {
    id: 'year',
    header: 'Year',
    width: 80,
    align: 'center',
    format: (val) => String(val || '—'),
  },
  {
    id: 'gpsDeviceId',
    header: 'GPS Device',
    width: 140,
    format: (val) => String(val || '—'),
  },
];
</script>
