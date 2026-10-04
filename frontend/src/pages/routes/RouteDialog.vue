<template>
  <FormDialog
    v-model:open="open"
    :title="editingId ? `Edit Route · ${record?.name ?? ''}` : 'New Transit Route'"
    :issues="issues"
    :server-issues="serverIssues"
    :saving="saving"
    :loading="loading"
    @save="save"
  >
    <DeskSection section-id="route" title="Route Information">
      <DeskField v-model="form.name" field-id="name" label="Route Name" required initial />
      <DeskField v-model="form.code" field-id="code" label="Route Code" required />
      <DeskField v-model="form.status" field-id="status" label="Status" kind="select" :options="STATUS_OPTIONS" />
    </DeskSection>

    <DeskSection section-id="locations" title="Corridor & Distance">
      <DeskField v-model="form.originCity" field-id="originCity" label="Origin City" required />
      <DeskField v-model="form.originState" field-id="originState" label="Origin State" />
      <DeskField v-model="form.destinationCity" field-id="destinationCity" label="Destination City" required />
      <DeskField v-model="form.destinationState" field-id="destinationState" label="Destination State" />
      <DeskField v-model="form.distanceKm" field-id="distanceKm" label="Distance (Km)" kind="number" />
      <DeskField v-model="form.estimatedHours" field-id="estimatedHours" label="Transit Time (Hours)" kind="number" />
    </DeskSection>
  </FormDialog>
</template>

<script setup lang="ts">
import { DeskField, DeskSection, type DeskSelectOption } from '@/desk/tms/ui';
import FormDialog from '@/desk/tms/components/FormDialog.vue';
import { routesApi, type Route } from '@/desk/tms/api/masters';
import { numOrNull, required, text, textOrNull, type FieldValue } from '@/desk/tms/data/fields';
import { useResourceDialog } from '@/desk/tms/data/useResourceDialog';

interface RouteForm {
  name: FieldValue;
  code: FieldValue;
  originCity: FieldValue;
  originState: FieldValue;
  destinationCity: FieldValue;
  destinationState: FieldValue;
  distanceKm: FieldValue;
  estimatedHours: FieldValue;
  status: FieldValue;
}

const STATUS_OPTIONS: DeskSelectOption[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const emit = defineEmits<{ saved: [route: Route] }>();

const { open, editingId, form, record, loading, saving, issues, serverIssues, openNew, openEdit, save } =
  useResourceDialog(routesApi, {
    blank: (): RouteForm => ({
      name: '',
      code: '',
      originCity: '',
      originState: '',
      destinationCity: '',
      destinationState: '',
      distanceKm: '',
      estimatedHours: '',
      status: 'ACTIVE',
    }),
    toForm: (r: any): RouteForm => ({
      name: r.name,
      code: r.code ?? '',
      originCity: r.originCity ?? '',
      originState: r.originState ?? '',
      destinationCity: r.destinationCity ?? '',
      destinationState: r.destinationState ?? '',
      distanceKm: r.distanceKm ?? '',
      estimatedHours: r.estimatedHours ?? '',
      status: r.status ?? 'ACTIVE',
    }),
    toPayload: (values: RouteForm) => {
      const os = textOrNull(values.originState);
      const ds = textOrNull(values.destinationState);
      const d = numOrNull(values.distanceKm);
      const h = numOrNull(values.estimatedHours);
      return {
        name: text(values.name),
        code: text(values.code).toUpperCase(),
        originCity: text(values.originCity),
        ...(os ? { originState: os } : {}),
        destinationCity: text(values.destinationCity),
        ...(ds ? { destinationState: ds } : {}),
        ...(d !== null ? { distanceKm: d } : {}),
        ...(h !== null ? { estimatedHours: h } : {}),
        status: text(values.status) || 'ACTIVE',
      };
    },
    validate: (values: RouteForm) =>
      required(
        values,
        ['name', 'Route Name'],
        ['code', 'Route Code'],
        ['originCity', 'Origin City'],
        ['destinationCity', 'Destination City'],
      ),
    onSaved: (route: Route) => emit('saved', route),
  });

defineExpose({ openNew, openEdit });
</script>
