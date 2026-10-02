<template>
  <form class="desk-form" @submit.prevent="emit('save')">
    <slot />
    <Teleport to="body">
      <div v-if="toasts.length > 0" class="desk-toasts" role="alert">
        <div v-for="issue in toasts" :key="`${issue.fieldId ?? ''}|${issue.message}`" class="desk-toast">{{ issue.message }}</div>
      </div>
    </Teleport>
  </form>
</template>

<script setup lang="ts">
import { computed, provide, reactive, ref, watch } from 'vue';
import { useDeskLayer } from '../keys/useDeskLayer';
import { DESK_FORM_ISSUES, unplacedIssues, type DeskIssue } from './issues';

const props = withDefaults(
  defineProps<{
    /** Field id to focus when the page opens. Omit to focus the first visible field or grid. */
    initialFocus?: string;
    /** When true, do not move focus when the page opens. */
    disableInitialFocus?: boolean;
    /** When true, Ctrl+Arrow is not a field move on this page. */
    disableSpatialMove?: boolean;
    /**
     * Problems to show. A field on screen shows its own; the rest stay as toasts until their
     * field mounts or the problem leaves this list. The page decides when the list fills.
     */
    issues?: readonly DeskIssue[];
    /**
     * Problems the server returned. Same display as `issues`, and a field the user edits hides
     * its own until this list is replaced (the next save).
     */
    serverIssues?: readonly DeskIssue[];
  }>(),
  { disableInitialFocus: false, disableSpatialMove: false, issues: () => [], serverIssues: () => [] },
);
const emit = defineEmits<{ save: [] }>();

useDeskLayer({
  ...(props.initialFocus === undefined ? {} : { initialFocus: props.initialFocus }),
  disableInitialFocus: props.disableInitialFocus,
  disableSpatialMove: props.disableSpatialMove,
});

/** Fields on screen, counted so a field that remounts in one tick is not lost. */
const mounted = reactive(new Map<string, number>());
/** Fields the user changed since the server list last arrived. */
const edited = ref(new Set<string>());

watch(
  () => props.serverIssues,
  () => {
    edited.value = new Set();
  },
);

/** Client rules, then server problems the user has not edited away. */
const shown = computed(() => [
  ...props.issues,
  ...props.serverIssues.filter((issue) => issue.fieldId === undefined || !edited.value.has(issue.fieldId)),
]);
const toasts = computed(() => unplacedIssues(shown.value, (id) => mounted.has(id)));

provide(DESK_FORM_ISSUES, {
  issueFor: (fieldId) => shown.value.find((issue) => issue.fieldId === fieldId)?.message ?? null,
  mount(fieldId) {
    mounted.set(fieldId, (mounted.get(fieldId) ?? 0) + 1);
    return () => {
      const left = (mounted.get(fieldId) ?? 1) - 1;
      if (left <= 0) mounted.delete(fieldId);
      else mounted.set(fieldId, left);
    };
  },
  edited(fieldId) {
    if (edited.value.has(fieldId)) return;
    const next = new Set(edited.value);
    next.add(fieldId);
    edited.value = next;
  },
});
</script>
