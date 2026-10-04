<template>
  <FormDialog
    v-model:open="open"
    :title="editingId ? `Edit Vehicle Type · ${record?.name ?? ''}` : 'New Vehicle Type'"
    :issues="issues"
    :server-issues="serverIssues"
    :saving="saving"
    :loading="loading"
    @save="save"
  >
    <DeskSection section-id="type" title="Vehicle Type Details">
      <DeskField v-model="form.name" field-id="name" label="Type Name" required initial />
      <DeskField v-model="form.code" field-id="code" label="Type Code" required />
      <DeskField v-model="form.capacityTons" field-id="capacityTons" label="Capacity (Tons)" kind="number" required />
      <DeskField v-model="form.volumeCuFt" field-id="volumeCuFt" label="Volume (Cu. Ft)" kind="number" />
      <DeskField v-model="form.axleCount" field-id="axleCount" label="Axle Count" kind="number" />
      <DeskField v-model="form.fuelType" field-id="fuelType" label="Fuel Type" kind="select" :options="FUEL_OPTIONS" />
      <DeskField v-model="form.status" field-id="status" label="Status" kind="select" :options="STATUS_OPTIONS" />
    </DeskSection>
  </FormDialog>
</template>

<script setup lang="ts">
import { DeskField, DeskSection, type DeskSelectOption } from '@/desk/tms/ui';
import FormDialog from '@/desk/tms/components/FormDialog.vue';
import { vehicleTypesApi, type VehicleType } from '@/desk/tms/api/masters';
import { numOrNull, required, text, textOrNull, type FieldValue } from '@/desk/tms/data/fields';
import { useResourceDialog } from '@/desk/tms/data/useResourceDialog';

interface VehicleTypeForm {
  name: FieldValue;
  code: FieldValue;
  capacityTons: FieldValue;
  volumeCuFt: FieldValue;
  axleCount: FieldValue;
  fuelType: FieldValue;
  status: FieldValue;
}

const FUEL_OPTIONS: DeskSelectOption[] = [
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'PETROL', label: 'Petrol' },
  { value: 'CNG', label: 'CNG' },
  { value: 'ELECTRIC', label: 'Electric' },
];

const STATUS_OPTIONS: DeskSelectOption[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const emit = defineEmits<{ saved: [type: VehicleType] }>();

const { open, editingId, form, record, loading, saving, issues, serverIssues, openNew, openEdit, save } =
  useResourceDialog(vehicleTypesApi, {
    blank: (): VehicleTypeForm => ({
      name: '',
      code: '',
      capacityTons: 10,
      volumeCuFt: '',
      axleCount: 2,
      fuelType: 'DIESEL',
      status: 'ACTIVE',
    }),
    toForm: (v: VehicleType): VehicleTypeForm => ({
      name: v.name,
      code: v.code ?? '',
      capacityTons: v.capacityTons ?? '',
      volumeCuFt: v.volumeCuFt ?? '',
      axleCount: v.axleCount ?? 2,
      fuelType: v.fuelType ?? 'DIESEL',
      status: v.status ?? 'ACTIVE',
    }),
    toPayload: (values: VehicleTypeForm) => {
      const vol = numOrNull(values.volumeCuFt);
      const axles = numOrNull(values.axleCount);
      return {
        name: text(values.name),
        code: text(values.code).toUpperCase(),
        capacityTons: numOrNull(values.capacityTons) ?? 1,
        ...(vol !== null ? { volumeCuFt: vol } : {}),
        ...(axles !== null ? { axleCount: axles } : {}),
        fuelType: textOrNull(values.fuelType) ?? 'DIESEL',
        status: text(values.status) || 'ACTIVE',
      };
    },
    validate: (values: VehicleTypeForm) =>
      required(values, ['name', 'Type Name'], ['code', 'Type Code'], ['capacityTons', 'Capacity (Tons)']),
    onSaved: (vt: VehicleType) => emit('saved', vt),
  });

defineExpose({ openNew, openEdit });
</script>
