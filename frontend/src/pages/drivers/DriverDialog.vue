<template>
  <FormDialog
    v-model:open="open"
    :title="editingId ? `Edit Driver · ${record?.firstName ?? ''} ${record?.lastName ?? ''}` : 'New Driver'"
    :issues="issues"
    :server-issues="serverIssues"
    :saving="saving"
    :loading="loading"
    @save="save"
  >
    <DeskSection section-id="driver" title="Personal Details">
      <DeskField v-model="form.firstName" field-id="firstName" label="First Name" required initial />
      <DeskField v-model="form.lastName" field-id="lastName" label="Last Name" required />
      <DeskField v-model="form.phone" field-id="phone" label="Phone Number" required />
      <DeskField v-model="form.status" field-id="status" label="Status" kind="select" :options="STATUS_OPTIONS" />
    </DeskSection>

    <DeskSection section-id="license" title="Driving License & Compliance">
      <DeskField v-model="form.licenseNumber" field-id="licenseNumber" label="License Number" required />
      <DeskField v-model="form.licenseCategory" field-id="licenseCategory" label="Category (e.g. HMV)" />
      <DeskField v-model="form.licenseExpiry" field-id="licenseExpiry" label="License Expiry" kind="date" />
    </DeskSection>
  </FormDialog>
</template>

<script setup lang="ts">
import { DeskField, DeskSection, type DeskSelectOption } from '@/desk/tms/ui';
import FormDialog from '@/desk/tms/components/FormDialog.vue';
import { driversApi, type Driver } from '@/desk/tms/api/masters';
import { required, text, textOrNull, type FieldValue } from '@/desk/tms/data/fields';
import { useResourceDialog } from '@/desk/tms/data/useResourceDialog';

interface DriverForm {
  firstName: FieldValue;
  lastName: FieldValue;
  phone: FieldValue;
  licenseNumber: FieldValue;
  licenseCategory: FieldValue;
  licenseExpiry: FieldValue;
  status: FieldValue;
}

const STATUS_OPTIONS: DeskSelectOption[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ON_TRIP', label: 'On Trip' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const emit = defineEmits<{ saved: [driver: Driver] }>();

const { open, editingId, form, record, loading, saving, issues, serverIssues, openNew, openEdit, save } =
  useResourceDialog(driversApi, {
    blank: (): DriverForm => ({
      firstName: '',
      lastName: '',
      phone: '',
      licenseNumber: '',
      licenseCategory: 'HMV',
      licenseExpiry: '',
      status: 'AVAILABLE',
    }),
    toForm: (d: any): DriverForm => {
      const parts = (d.name || '').split(' ');
      return {
        firstName: d.firstName ?? parts[0] ?? '',
        lastName: d.lastName ?? parts.slice(1).join(' ') ?? '',
        phone: d.phone ?? '',
        licenseNumber: d.licenseNumber ?? '',
        licenseCategory: d.licenseCategory ?? 'HMV',
        licenseExpiry: d.licenseExpiry ? d.licenseExpiry.split('T')[0] : '',
        status: d.status ?? 'AVAILABLE',
      };
    },
    toPayload: (values: DriverForm) => {
      const cat = textOrNull(values.licenseCategory);
      const exp = textOrNull(values.licenseExpiry);
      return {
        firstName: text(values.firstName),
        lastName: text(values.lastName),
        phone: text(values.phone),
        licenseNumber: text(values.licenseNumber).toUpperCase(),
        ...(cat ? { licenseCategory: cat.toUpperCase() } : {}),
        ...(exp ? { licenseExpiry: `${exp}T00:00:00.000Z` } : {}),
        status: text(values.status) || 'AVAILABLE',
      };
    },
    validate: (values: DriverForm) =>
      required(values, ['firstName', 'First Name'], ['lastName', 'Last Name'], ['phone', 'Phone'], ['licenseNumber', 'License Number']),
    onSaved: (driver: Driver) => emit('saved', driver),
  });

defineExpose({ openNew, openEdit });
</script>
