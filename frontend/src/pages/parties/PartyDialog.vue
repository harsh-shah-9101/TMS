<template>
  <FormDialog
    v-model:open="open"
    :title="editingId ? `Edit Party · ${record?.name ?? ''}` : 'New Customer / Party'"
    :issues="issues"
    :server-issues="serverIssues"
    :saving="saving"
    :loading="loading"
    size="wide"
    @save="save"
  >
    <DeskSection section-id="party" title="Party Information">
      <DeskField v-model="form.name" field-id="name" label="Legal Business Name" required initial />
      <DeskField v-model="form.code" field-id="code" label="Party Code" required />
      <DeskField v-model="form.type" field-id="type" label="Party Classification" kind="select" :options="TYPE_OPTIONS" />
      <DeskField v-model="form.status" field-id="status" label="Status" kind="select" :options="STATUS_OPTIONS" />
    </DeskSection>

    <DeskSection section-id="tax" title="Tax & Financial Details">
      <DeskField v-model="form.gstin" field-id="gstin" label="GSTIN Number" />
      <DeskField v-model="form.pan" field-id="pan" label="PAN Number" />
      <DeskField v-model="form.creditLimit" field-id="creditLimit" label="Credit Limit (₹)" kind="number" />
      <DeskField v-model="form.creditDays" field-id="creditDays" label="Credit Period (Days)" kind="number" />
    </DeskSection>

    <DeskSection section-id="contact" title="Contact & Location">
      <DeskField v-model="form.phone" field-id="phone" label="Contact Phone" />
      <DeskField v-model="form.email" field-id="email" label="Contact Email" />
      <DeskField v-model="form.city" field-id="city" label="City" />
      <DeskField v-model="form.state" field-id="state" label="State" />
      <DeskField v-model="form.pincode" field-id="pincode" label="Pincode" />
      <DeskField v-model="form.address" field-id="address" label="Registered Address" kind="textarea" />
    </DeskSection>
  </FormDialog>
</template>

<script setup lang="ts">
import { DeskField, DeskSection, type DeskSelectOption } from '@/desk/tms/ui';
import FormDialog from '@/desk/tms/components/FormDialog.vue';
import { partiesApi, type Party } from '@/desk/tms/api/masters';
import { required, text, textOrNull, type FieldValue } from '@/desk/tms/data/fields';
import { useResourceDialog } from '@/desk/tms/data/useResourceDialog';

interface PartyForm {
  name: FieldValue;
  code: FieldValue;
  type: FieldValue;
  status: FieldValue;
  gstin: FieldValue;
  pan: FieldValue;
  creditLimit: FieldValue;
  creditDays: FieldValue;
  phone: FieldValue;
  email: FieldValue;
  city: FieldValue;
  state: FieldValue;
  pincode: FieldValue;
  address: FieldValue;
}

const TYPE_OPTIONS: DeskSelectOption[] = [
  { value: 'SHIPPER', label: 'Shipper / Consignor' },
  { value: 'CONSIGNEE', label: 'Consignee / Receiver' },
  { value: 'BOTH', label: 'Both (Consignor & Consignee)' },
];

const STATUS_OPTIONS: DeskSelectOption[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLACKLISTED', label: 'Blacklisted / On Hold' },
];

const emit = defineEmits<{ saved: [party: Party] }>();

const { open, editingId, form, record, loading, saving, issues, serverIssues, openNew, openEdit, save } =
  useResourceDialog(partiesApi, {
    blank: (): PartyForm => ({
      name: '',
      code: '',
      type: 'BOTH',
      status: 'ACTIVE',
      gstin: '',
      pan: '',
      creditLimit: '',
      creditDays: 30,
      phone: '',
      email: '',
      city: '',
      state: '',
      pincode: '',
      address: '',
    }),
    toForm: (p: any): PartyForm => ({
      name: p.name,
      code: p.code ?? '',
      type: p.type ?? 'BOTH',
      status: p.status ?? 'ACTIVE',
      gstin: p.gstin ?? '',
      pan: p.pan ?? '',
      creditLimit: p.creditLimit ?? '',
      creditDays: p.creditDays ?? 30,
      phone: p.phone ?? '',
      email: p.email ?? '',
      city: p.city ?? '',
      state: p.state ?? '',
      pincode: p.pincode ?? '',
      address: p.addressLine1 ?? p.address ?? '',
    }),
    toPayload: (values: PartyForm) => {
      const g = textOrNull(values.gstin)?.toUpperCase();
      const p = textOrNull(values.pan)?.toUpperCase();
      const e = textOrNull(values.email);
      const ph = textOrNull(values.phone);
      const c = textOrNull(values.city);
      const s = textOrNull(values.state);
      const pin = textOrNull(values.pincode);
      const addr = textOrNull(values.address);
      return {
        name: text(values.name),
        code: text(values.code).toUpperCase(),
        type: text(values.type) || 'BOTH',
        status: text(values.status) || 'ACTIVE',
        ...(g ? { gstin: g } : {}),
        ...(p ? { pan: p } : {}),
        ...(e ? { email: e } : {}),
        ...(ph ? { phone: ph } : {}),
        ...(c ? { city: c } : {}),
        ...(s ? { state: s } : {}),
        ...(pin ? { pincode: pin } : {}),
        ...(addr ? { addressLine1: addr } : {}),
      };
    },
    validate: (values: PartyForm) => required(values, ['name', 'Party Name'], ['code', 'Party Code']),
    onSaved: (party: Party) => emit('saved', party),
  });

defineExpose({ openNew, openEdit });
</script>
