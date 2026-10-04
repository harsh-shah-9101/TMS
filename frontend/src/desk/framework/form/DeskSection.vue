<template>
  <section class="desk-section" :data-desk-section="sectionId">
    <h3>{{ title }}</h3>
    <div class="body"><slot /></div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ sectionId: string; title: string }>();
</script>
