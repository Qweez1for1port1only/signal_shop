<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { LogOut, Menu, User, X } from "@lucide/vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const isOpen = ref(false);

const links = [
  { to: "/", label: "Главная" },
  { to: "/login", label: "Вход" },
  { to: "/register", label: "Регистрация" }
];

function closeMenu() {
  isOpen.value = false;
}

async function logout() {
  await authStore.logout();
  closeMenu();
  router.push("/");
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
          :key="link.to"
          :to="link.to"
          class="rounded-full px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          active-class="bg-amberline text-ink"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <RouterLink
          v-if="!authStore.isAuthenticated"
          to="/login"
          class="inline-flex h-10 items-center gap-2 rounded-full bg-amberline px-4 text-sm font-black text-ink transition hover:bg-white"
        >
          <User class="size-4" />
          Войти
        </RouterLink>
        <button v-else class="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-black text-white hover:bg-white/10" type="button" @click="logout">
          <LogOut class="size-4" />
          Выйти
        </button>
      </div>

      <button
        class="inline-flex size-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:hidden"
        type="button"
        title="Меню"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? 'Закрыть меню' : 'Открыть меню'"
        @click="isOpen = !isOpen"
      >
        <X v-if="isOpen" class="size-5" />
        <Menu v-else class="size-5" />
      </button>
    </div>

    <div v-if="isOpen" class="border-t border-white/10 bg-ink md:hidden">
      <div class="container-page flex flex-col gap-2 py-4">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-xl px-3 py-2 text-sm font-bold text-slate-300"
          active-class="bg-amberline text-ink"
          @click="closeMenu"
        >
          {{ link.label }}
        </RouterLink>
        <button v-if="authStore.isAuthenticated" class="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-4 py-3 text-sm font-black text-white" type="button" @click="logout">
          <LogOut class="size-4" />
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>
