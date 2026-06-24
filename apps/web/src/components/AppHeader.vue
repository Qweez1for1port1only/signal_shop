<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";

const isOpen = ref(false);

const links = [
  { to: "/", label: "Главная" },
  { to: "/#principles", label: "Подход" },
  { to: "/#interface", label: "Интерфейс" }
];

function closeMenu() {
  isOpen.value = false;
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/10 bg-ink text-white shadow-lg shadow-black/5">
    <div class="container-page flex h-20 items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-center gap-3" @click="closeMenu">
        <span class="flex size-10 items-center justify-center rounded-full bg-amberline text-sm font-black text-ink">S</span>
        <span>
          <span class="block text-base font-black tracking-[0.22em]">SIGNAL</span>
          <span class="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">техника по делу</span>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          class="rounded-full px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          active-class="bg-amberline text-ink"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <button class="inline-flex size-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:hidden" type="button" :aria-expanded="isOpen" @click="isOpen = !isOpen">
        {{ isOpen ? "×" : "≡" }}
      </button>
    </div>

    <div v-if="isOpen" class="border-t border-white/10 bg-ink md:hidden">
      <div class="container-page flex flex-col gap-2 py-4">
        <RouterLink v-for="link in links" :key="link.label" :to="link.to" class="rounded-xl px-3 py-2 text-sm font-bold text-slate-300" active-class="bg-amberline text-ink" @click="closeMenu">
          {{ link.label }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>
