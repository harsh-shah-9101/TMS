<template>
  <ResourcePage
    ref="page"
    title="Customer & Party Master"
    :api="partiesApi"
    :columns="columns"
    permission="customers"
    storage-key="parties"
    sort-column="name"
    :row-label="(row) => String(row.name || '')"
    @new="dialog?.openNew()"
    @open="(row) => dialog?.openEdit(String(row.id))"
    @edit="(row) => dialog?.openEdit(String(row.id))"
  />
  <PartyDialog ref="dialog" @saved="page?.reload()" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import type { DeskColumn } from '@/desk/tms/ui';
import ResourcePage from '@/desk/tms/components/ResourcePage.vue';
import { partiesApi } from '@/desk/tms/api/masters';
import { formatCurrency, formatStatus } from '@/desk/tms/format';
import PartyDialog from './PartyDialog.vue';

const page = useTemplateRef<any>('page');
const dialog = useTemplateRef<InstanceType<typeof PartyDialog>>('dialog');

const columns: DeskColumn[] = [
  {
    id: 'code',
    header: 'Party Code',
    width: 120,
    format: (val) => String(val || '—'),
  },
  {
    id: 'name',
    header: 'Customer / Party Name',
    width: 250,
    format: (val) => String(val || '—'),
  },
  {
    id: 'type',
    header: 'Type',
    width: 120,
    align: 'center',
    format: formatStatus,
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
    width: 120,
    format: (val) => String(val || '—'),
  },
  {
    id: 'phone',
    header: 'Contact',
    width: 130,
    format: (val) => String(val || '—'),
  },
  {
    id: 'creditLimit',
    header: 'Credit Limit',
    width: 130,
    align: 'right',
    format: (val) => (val ? formatCurrency(val) : '—'),
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
