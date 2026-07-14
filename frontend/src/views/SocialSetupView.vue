<script setup>
import SetupChecklist from '../components/SetupChecklist.vue';
import PageHeader from '../components/PageHeader.vue';
</script>

<template>
  <section class="space-y-6">
    <div class="card">
      <PageHeader
        kicker="Connection safety"
        title="Social Media Setup"
        copy="Review connection readiness, safety flags, and integration tests before enabling live publishing."
      />
    </div>
    <SetupChecklist />
  </section>
</template>
