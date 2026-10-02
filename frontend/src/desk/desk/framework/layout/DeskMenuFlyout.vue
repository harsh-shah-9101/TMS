<template>
  <div class="desk-flyout">
    <div v-for="(item, index) in items" :key="`${item.label}-${index}`" class="desk-flyout-row">
      <button
        type="button"
        :class="{ on: path[0] === index }"
        @mouseenter="onHover(index)"
        @click="choose(item, index)"
      >
        <span class="desk-flyout-label">
          <template v-for="(part, partIndex) in splitAccessLabel(item.label, item.letter)" :key="partIndex">
            <u v-if="part.mark">{{ part.text }}</u>
            <template v-else>{{ part.text }}</template>
          </template>
        </span>
        <span v-if="item.children?.length" class="desk-flyout-more">▸</span>
      </button>
      <DeskMenuFlyout
        v-if="showChildren(item, index)"
        :items="item.children ?? []"
        :path="path.slice(1)"
        @path="(next) => emit('path', [index, ...next])"
        @pick="emit('pick', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { splitAccessLabel, type DeskMenuNode } from '../menu/deskMenu';

const props = defineProps<{
  items: DeskMenuNode[];
  path: number[];
}>();

const emit = defineEmits<{
  path: [path: number[]];
  pick: [route: string];
}>();

const hovering = ref(-1);

watch(
  () => props.path[0],
  (index) => {
    if (index !== hovering.value) hovering.value = -1;
  },
);

function showChildren(item: DeskMenuNode, index: number): boolean {
  if (!item.children?.length || props.path[0] !== index) return false;
  return props.path.length > 1 || hovering.value === index;
}

function onHover(index: number): void {
  hovering.value = index;
  emit('path', [index]);
}

function choose(item: DeskMenuNode, index: number): void {
  if (item.route) {
    emit('pick', item.route);
    return;
  }
  emit('path', [index]);
}
</script>

<style scoped>
.desk-flyout {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 40;
  min-width: 220px;
  background: #fff;
  border: 1px solid lightgray;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.desk-flyout-row {
  position: relative;
}
.desk-flyout-row > button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: auto;
  min-height: 26px;
  padding: 4px 10px;
  border: 0;
  background: transparent;
  text-align: left;
  font-size: 0.88rem;
  cursor: pointer;
  color: inherit;
}
.desk-flyout-row > button.on,
.desk-flyout-row > button:hover {
  background: #e9ecef;
}
.desk-flyout-more {
  color: #6c757d;
}
.desk-flyout .desk-flyout {
  top: 0;
  left: 100%;
}
</style>
