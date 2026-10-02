<script setup lang="ts">
// Auth Layout (Simple, minimal container for login/register pages)
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
