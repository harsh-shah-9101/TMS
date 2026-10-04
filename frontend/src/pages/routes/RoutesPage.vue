<template>
  <ResourcePage
    ref="page"
    title="Route Master"
    :api="routesApi"
    :columns="columns"
    permission="routes"
    storage-key="routes"
    sort-column="name"
    :row-label="(row) => String(row.name || '')"
    @new="dialog?.openNew()"
    @open="(row) => dialog?.openEdit(String(row.id))"
    @edit="(row) => dialog?.openEdit(String(row.id))"
  />
  <RouteDialog ref="dialog" @saved="page?.reload()" />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import type { DeskColumn } from '@/desk/tms/ui';
import ResourcePage from '@/desk/tms/components/ResourcePage.vue';
import { routesApi } from '@/desk/tms/api/masters';
import { formatStatus } from '@/desk/tms/format';
import RouteDialog from './RouteDialog.vue';

const page = useTemplateRef<any>('page');
const dialog = useTemplateRef<InstanceType<typeof RouteDialog>>('dialog');

const columns: DeskColumn[] = [
  {
    id: 'code',
    header: 'Route Code',
    width: 130,
    format: (val) => String(val || '—'),
  },
  {
    id: 'name',
    header: 'Route Name',
    width: 250,
    format: (val) => String(val || '—'),
  },
  {
    id: 'originCity',
    header: 'Origin',
    width: 140,
    format: (_, row: any) => [row.originCity, row.originState].filter(Boolean).join(', ') || '—',
  },
  {
    id: 'destinationCity',
    header: 'Destination',
    width: 140,
    format: (_, row: any) => [row.destinationCity, row.destinationState].filter(Boolean).join(', ') || '—',
  },
  {
    id: 'distanceKm',
    header: 'Distance (Km)',
    width: 120,
    align: 'right',
    format: (val) => (val ? `${val} km` : '—'),
  },
  {
    id: 'estimatedHours',
    header: 'Transit Time',
    width: 120,
    align: 'right',
    format: (val) => (val ? `${val} hrs` : '—'),
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
