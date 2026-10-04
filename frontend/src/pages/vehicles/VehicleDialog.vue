<template>
  <FormDialog
    v-model:open="open"
    :title="editingId ? `Edit Vehicle · ${record?.registrationNumber ?? ''}` : 'New Vehicle'"
    :issues="issues"
    :server-issues="serverIssues"
    :saving="saving"
    :loading="loading"
    size="wide"
    @save="save"
  >
    <DeskSection section-id="vehicle" title="Vehicle Identity">
      <DeskField v-model="form.registrationNumber" field-id="registrationNumber" label="Reg Number" required initial />
      <DeskField v-model="form.vehicleTypeId" field-id="vehicleTypeId" label="Vehicle Type" kind="select" :options="typeOptions" required />
      <DeskField v-model="form.make" field-id="make" label="Make / Manufacturer" />
      <DeskField v-model="form.model" field-id="model" label="Model" />
      <DeskField v-model="form.ownershipType" field-id="ownershipType" label="Ownership" kind="select" :options="OWNERSHIP_OPTIONS" />
      <DeskField v-model="form.status" field-id="status" label="Status" kind="select" :options="STATUS_OPTIONS" />
    </DeskSection>

    <DeskSection section-id="specs" title="Specifications & Tracking">
      <DeskField v-model="form.capacityWeight" field-id="capacityWeight" label="Capacity (MT)" kind="number" />
      <DeskField v-model="form.targetKmPerL" field-id="targetKmPerL" label="Target Km/L" kind="number" />
      <DeskField v-model="form.year" field-id="year" label="Manufacturing Year" kind="number" />
      <DeskField v-model="form.chassisNumber" field-id="chassisNumber" label="Chassis Number" />
      <DeskField v-model="form.engineNumber" field-id="engineNumber" label="Engine Number" />
      <DeskField v-model="form.gpsDeviceId" field-id="gpsDeviceId" label="GPS Device ID" />
      <DeskField v-model="form.fastagId" field-id="fastagId" label="Fastag ID" />
    </DeskSection>

    <DeskSection section-id="compliance" title="Compliance & Validity">
      <DeskField v-model="form.fitnessExpiry" field-id="fitnessExpiry" label="Fitness Expiry" kind="date" />
      <DeskField v-model="form.insuranceExpiry" field-id="insuranceExpiry" label="Insurance Expiry" kind="date" />
      <DeskField v-model="form.pucExpiry" field-id="pucExpiry" label="PUC Expiry" kind="date" />
      <DeskField v-model="form.permitExpiry" field-id="permitExpiry" label="Permit Expiry" kind="date" />
    </DeskSection>
  </FormDialog>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { DeskField, DeskSection, type DeskSelectOption } from '@/desk/tms/ui';
import FormDialog from '@/desk/tms/components/FormDialog.vue';
import { vehiclesApi, vehicleTypesApi, type Vehicle, type VehicleSave } from '@/desk/tms/api/masters';
import { useOptions } from '@/desk/tms/data/options';
import { numOrNull, required, text, textOrNull, type FieldValue } from '@/desk/tms/data/fields';
import { useResourceDialog } from '@/desk/tms/data/useResourceDialog';

interface VehicleForm {
  registrationNumber: FieldValue;
  vehicleTypeId: FieldValue;
  make: FieldValue;
  model: FieldValue;
  ownershipType: FieldValue;
  status: FieldValue;
  capacityWeight: FieldValue;
  targetKmPerL: FieldValue;
  year: FieldValue;
  chassisNumber: FieldValue;
  engineNumber: FieldValue;
  gpsDeviceId: FieldValue;
  fastagId: FieldValue;
  fitnessExpiry: FieldValue;
  insuranceExpiry: FieldValue;
  pucExpiry: FieldValue;
  permitExpiry: FieldValue;
}

const OWNERSHIP_OPTIONS: DeskSelectOption[] = [
  { value: 'OWNED', label: 'Owned' },
  { value: 'LEASED', label: 'Leased' },
  { value: 'MARKET', label: 'Market / Third Party' },
];

const STATUS_OPTIONS: DeskSelectOption[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

const { options: typeOptions, load: loadTypes } = useOptions(vehicleTypesApi, (t) => t.name);

const emit = defineEmits<{ saved: [vehicle: Vehicle] }>();

const { open, editingId, form, record, loading, saving, issues, serverIssues, openNew, openEdit, save } =
  useResourceDialog<Vehicle, VehicleForm, VehicleSave>(vehiclesApi, {
    blank: (): VehicleForm => ({
      registrationNumber: '',
      vehicleTypeId: '',
      make: '',
      model: '',
      ownershipType: 'OWNED',
      status: 'AVAILABLE',
      capacityWeight: null,
      targetKmPerL: null,
      year: new Date().getFullYear(),
      chassisNumber: '',
      engineNumber: '',
      gpsDeviceId: '',
      fastagId: '',
      fitnessExpiry: '',
      insuranceExpiry: '',
      pucExpiry: '',
      permitExpiry: '',
    }),
    toForm: (v: Vehicle): VehicleForm => ({
      registrationNumber: v.registrationNumber,
      vehicleTypeId: v.vehicleTypeId ? String(v.vehicleTypeId) : '',
      make: v.make ?? '',
      model: v.model ?? '',
      ownershipType: v.ownershipType ?? 'OWNED',
      status: v.status ?? 'AVAILABLE',
      capacityWeight: v.capacityWeight ?? null,
      targetKmPerL: v.targetKmPerL ?? null,
      year: v.year ?? null,
      chassisNumber: v.chassisNumber ?? '',
      engineNumber: v.engineNumber ?? '',
      gpsDeviceId: v.gpsDeviceId ?? '',
      fastagId: v.fastagId ?? '',
      fitnessExpiry: v.fitnessExpiry ? v.fitnessExpiry.split('T')[0] : '',
      insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.split('T')[0] : '',
      pucExpiry: v.pucExpiry ? v.pucExpiry.split('T')[0] : '',
      permitExpiry: v.permitExpiry ? v.permitExpiry.split('T')[0] : '',
    }),
    toPayload: (values: VehicleForm): VehicleSave => {
      const ch = textOrNull(values.chassisNumber);
      const eng = textOrNull(values.engineNumber);
      const mk = textOrNull(values.make);
      const md = textOrNull(values.model);
      const yr = numOrNull(values.year);
      return {
        registrationNumber: text(values.registrationNumber).replace(/\s+/g, '').toUpperCase(),
        vehicleTypeId: text(values.vehicleTypeId),
        ...(ch ? { chassisNumber: ch } : {}),
        ...(eng ? { engineNumber: eng } : {}),
        ...(mk ? { make: mk } : {}),
        ...(md ? { model: md } : {}),
        ...(yr ? { year: yr } : {}),
        ownershipType: text(values.ownershipType) || 'OWNED',
        status: text(values.status) || 'AVAILABLE',
      };
    },
    validate: (values: VehicleForm) =>
      required(values, ['registrationNumber', 'Reg Number'], ['vehicleTypeId', 'Vehicle Type']),
    onSaved: (vehicle: Vehicle) => emit('saved', vehicle),
  });

onMounted(() => {
  void loadTypes();
});

defineExpose({ openNew, openEdit });
</script>
