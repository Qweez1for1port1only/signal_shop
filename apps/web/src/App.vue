<template>
  <AppHeader />
  <RouterView />
  <footer class="bg-ink text-white">
    <div class="container-page flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-full bg-amberline font-black text-ink">S</span>
        <strong class="tracking-[0.2em]">SIGNAL</strong>
      </div>
      <span class="text-slate-400">Техника по делу. Москва, 2026.</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initialize();
});
</script>
