<template>
  <FormDialog
    v-model:open="open"
    :title="editingId ? `Edit Carrier · ${record?.name ?? ''}` : 'New Transporter / Carrier'"
    :issues="issues"
    :server-issues="serverIssues"
    :saving="saving"
    :loading="loading"
    size="wide"
    @save="save"
  >
    <DeskSection section-id="carrier" title="Carrier Details">
      <DeskField v-model="form.name" field-id="name" label="Carrier Name" required initial />
      <DeskField v-model="form.code" field-id="code" label="Carrier Code" required />
      <DeskField v-model="form.rating" field-id="rating" label="Performance Rating (1-5)" kind="number" />
      <DeskField v-model="form.status" field-id="status" label="Status" kind="select" :options="STATUS_OPTIONS" />
    </DeskSection>

    <DeskSection section-id="tax" title="Tax & Compliance">
      <DeskField v-model="form.gstin" field-id="gstin" label="GSTIN Number" />
      <DeskField v-model="form.pan" field-id="pan" label="PAN Number" />
    </DeskSection>

    <DeskSection section-id="contact" title="Contact & Address">
      <DeskField v-model="form.phone" field-id="phone" label="Phone Number" />
      <DeskField v-model="form.email" field-id="email" label="Email Address" />
      <DeskField v-model="form.city" field-id="city" label="City" />
      <DeskField v-model="form.state" field-id="state" label="State" />
      <DeskField v-model="form.pincode" field-id="pincode" label="Pincode" />
      <DeskField v-model="form.addressLine1" field-id="addressLine1" label="Full Address" kind="textarea" />
    </DeskSection>
  </FormDialog>
</template>

<script setup lang="ts">
import { DeskField, DeskSection, type DeskSelectOption } from '@/desk/tms/ui';
import FormDialog from '@/desk/tms/components/FormDialog.vue';
import { carriersApi, type Carrier } from '@/desk/tms/api/masters';
import { numOrNull, required, text, textOrNull, type FieldValue } from '@/desk/tms/data/fields';
import { useResourceDialog } from '@/desk/tms/data/useResourceDialog';

interface CarrierForm {
  name: FieldValue;
  code: FieldValue;
  rating: FieldValue;
  status: FieldValue;
  gstin: FieldValue;
  pan: FieldValue;
  phone: FieldValue;
  email: FieldValue;
  city: FieldValue;
  state: FieldValue;
  pincode: FieldValue;
  addressLine1: FieldValue;
}

const STATUS_OPTIONS: DeskSelectOption[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
];

const emit = defineEmits<{ saved: [carrier: Carrier] }>();

const { open, editingId, form, record, loading, saving, issues, serverIssues, openNew, openEdit, save } =
  useResourceDialog(carriersApi, {
    blank: (): CarrierForm => ({
      name: '',
      code: '',
      rating: 5,
      status: 'ACTIVE',
      gstin: '',
      pan: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      pincode: '',
      addressLine1: '',
    }),
    toForm: (c: any): CarrierForm => ({
      name: c.name,
      code: c.code ?? '',
      rating: c.rating ?? 5,
      status: c.status ?? 'ACTIVE',
      gstin: c.gstin ?? '',
      pan: c.pan ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      city: c.city ?? '',
      state: c.state ?? '',
      pincode: c.pincode ?? '',
      addressLine1: c.addressLine1 ?? c.address ?? '',
    }),
    toPayload: (values: CarrierForm) => {
      const g = textOrNull(values.gstin)?.toUpperCase();
      const p = textOrNull(values.pan)?.toUpperCase();
      const e = textOrNull(values.email);
      const ph = textOrNull(values.phone);
      const c = textOrNull(values.city);
      const s = textOrNull(values.state);
      const pin = textOrNull(values.pincode);
      const addr = textOrNull(values.addressLine1);
      const r = numOrNull(values.rating);
      return {
        name: text(values.name),
        code: text(values.code).toUpperCase(),
        ...(r !== null ? { rating: r } : {}),
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
    validate: (values: CarrierForm) => required(values, ['name', 'Carrier Name'], ['code', 'Carrier Code']),
    onSaved: (carrier: Carrier) => emit('saved', carrier),
  });

defineExpose({ openNew, openEdit });
</script>
