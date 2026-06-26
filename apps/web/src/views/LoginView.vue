<script setup lang="ts">
import { reactive } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { LogIn } from "@lucide/vue";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useOrderStore } from "@/stores/orders";
import { safeRedirect } from "@/utils/navigation";

const authStore = useAuthStore();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const route = useRoute();
const router = useRouter();

const form = reactive({
  email: "",
  password: ""
});

async function submit() {
  try {
    await authStore.login(form);
    orderStore.reset();
    await cartStore.loadCart();
    router.push(safeRedirect(route.query.redirect));
  } catch {
    // The store exposes the server message next to the form.
  }
}
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <form class="panel w-full max-w-md p-6 sm:p-8" @submit.prevent="submit">
        <p class="eyebrow">С возвращением</p>
        <h1 class="mt-2 text-3xl font-black text-ink">Вход в SIGNAL</h1>
        <div class="mt-6 space-y-4">
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Email</span>
            <input v-model="form.email" class="input-field" type="email" autocomplete="email" required />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Пароль</span>
            <input v-model="form.password" class="input-field" type="password" autocomplete="current-password" required />
          </label>
        </div>
        <p v-if="authStore.error" class="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {{ authStore.error }}
        </p>
        <button class="btn-primary mt-6 w-full" type="submit" :disabled="authStore.loading">
          <LogIn class="size-4" />
          Войти
        </button>
        <p class="mt-5 text-center text-sm text-slate-500">
          Нет аккаунта?
          <RouterLink class="font-bold text-accent" :to="{ name: 'register', query: route.query }">
            Зарегистрироваться
          </RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>
