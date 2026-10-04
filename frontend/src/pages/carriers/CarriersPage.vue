<template>
  <ResourcePage
    ref="page"
    title="Transporter & Carrier Master"
    :api="carriersApi"
    :columns="columns"
    permission="carriers"
    storage-key="carriers"
    sort-column="name"
    :row-label="(row) => String(row.name || '')"
    @new="dialog?.openNew()"
    @open="(row) => dialog?.openEdit(String(row.id))"
    @edit="(row) => dialog?.openEdit(String(row.id))"
  />
  <CarrierDialog ref="dialog" @saved="page?.reload()" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import type { DeskColumn } from '@/desk/tms/ui';
import ResourcePage from '@/desk/tms/components/ResourcePage.vue';
import { carriersApi } from '@/desk/tms/api/masters';
import { formatStatus } from '@/desk/tms/format';
import CarrierDialog from './CarrierDialog.vue';

const page = useTemplateRef<any>('page');
const dialog = useTemplateRef<InstanceType<typeof CarrierDialog>>('dialog');

const columns: DeskColumn[] = [
  {
    id: 'code',
    header: 'Carrier Code',
    width: 120,
    format: (val) => String(val || '—'),
  },
  {
    id: 'name',
    header: 'Transporter Name',
    width: 250,
    format: (val) => String(val || '—'),
  },
  {
    id: 'gstin',
    header: 'GSTIN',
    width: 150,
    format: (val) => String(val || '—'),
  },
  {
    id: 'city',
    header: 'City',
    width: 130,
    format: (val) => String(val || '—'),
  },
  {
    id: 'phone',
    header: 'Phone Number',
    width: 140,
    format: (val) => String(val || '—'),
  },
  {
    id: 'rating',
    header: 'Rating',
    width: 90,
    align: 'center',
    format: (val) => (val ? `★ ${Number(val).toFixed(1)}` : '—'),
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
