<template>
  <ResourcePage
    ref="page"
    title="Driver Master"
    :api="driversApi"
    :columns="columns"
    permission="drivers"
    storage-key="drivers"
    sort-column="firstName"
    :row-label="(row) => [row.firstName, row.lastName].filter(Boolean).join(' ') || row.name || ''"
    @new="dialog?.openNew()"
    @open="(row) => dialog?.openEdit(String(row.id))"
    @edit="(row) => dialog?.openEdit(String(row.id))"
  />
  <DriverDialog ref="dialog" @saved="page?.reload()" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import type { DeskColumn } from '@/desk/tms/ui';
import ResourcePage from '@/desk/tms/components/ResourcePage.vue';
import { driversApi } from '@/desk/tms/api/masters';
import { formatDate, formatStatus } from '@/desk/tms/format';
import DriverDialog from './DriverDialog.vue';

const page = useTemplateRef<any>('page');
const dialog = useTemplateRef<InstanceType<typeof DriverDialog>>('dialog');

const columns: DeskColumn[] = [
  {
    id: 'name',
    header: 'Driver Name',
    width: 200,
    format: (_, row: any) => [row.firstName, row.lastName].filter(Boolean).join(' ') || row.name || '—',
  },
  {
    id: 'phone',
    header: 'Phone Number',
    width: 140,
    format: (val) => String(val || '—'),
  },
  {
    id: 'licenseNumber',
    header: 'License Number',
    width: 170,
    format: (val) => String(val || '—'),
  },
  {
    id: 'licenseCategory',
    header: 'Category',
    width: 90,
    align: 'center',
    format: (val) => String(val || 'HMV'),
  },
  {
    id: 'licenseExpiry',
    header: 'License Expiry',
    width: 130,
    align: 'center',
    format: formatDate,
  },
  {
    id: 'status',
    header: 'Status',
    width: 120,
    align: 'center',
    format: formatStatus,
  },
];
</script>
