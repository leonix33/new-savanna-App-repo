<script setup>
import { Bar } from 'vue-chartjs';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { computed, onMounted, ref } from 'vue';
import { http } from '../api/http.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const analytics = ref(null);

const queueChart = computed(() => chartFromObject('Queue Status', analytics.value?.queueByStatus));
const commentChart = computed(() => chartFromObject('Comment Categories', analytics.value?.commentsByClassification));

function chartFromObject(label, obj = {}) {
  return {
    labels: Object.keys(obj),
    datasets: [{ label, data: Object.values(obj), backgroundColor: '#f97316' }]
  };
}

onMounted(async () => {
  const { data } = await http.get('/analytics');
  analytics.value = data;
});
</script>

<template>
  <section class="space-y-6">
    <div class="card">
      <p class="page-kicker">Performance room</p>
      <h1 class="page-title">Analytics Dashboard</h1>
      <p class="page-copy">Track content operations, queue health, and comment classifications from one overview.</p>
    </div>
    <div class="grid gap-4 md:grid-cols-5">
      <div v-for="(value, key) in analytics?.totals || {}" :key="key" class="stat-card">
        <p class="text-sm font-bold capitalize text-orange-200">{{ key.replace(/([A-Z])/g, ' $1') }}</p>
        <p class="mt-2 text-3xl font-black">{{ value }}</p>
      </div>
      <div v-if="!analytics" class="empty-state md:col-span-5">Loading analytics...</div>
    </div>
    <div class="grid gap-4 xl:grid-cols-2">
      <div class="card">
        <h2 class="mb-4 text-xl font-black">Queue status</h2>
        <Bar :data="queueChart" />
      </div>
      <div class="card">
        <h2 class="mb-4 text-xl font-black">Comment categories</h2>
        <Bar :data="commentChart" />
      </div>
    </div>
  </section>
</template>
