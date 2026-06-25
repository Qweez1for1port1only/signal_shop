<script setup lang="ts">
import { reactive } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { UserPlus } from "@lucide/vue";
import { useAuthStore } from "@/stores/auth";
import { safeRedirect } from "@/utils/navigation";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const form = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: ""
});

async function submit() {
  try {
    await authStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined,
      email: form.email,
      password: form.password
    });
    router.push(safeRedirect(route.query.redirect, "/"));
  } catch {
    // The store exposes the server message next to the form.
  }
}
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <form class="panel w-full max-w-xl p-6 sm:p-8" @submit.prevent="submit">
        <p class="eyebrow">Новый аккаунт</p>
        <h1 class="mt-2 text-3xl font-black text-ink">Регистрация в SIGNAL</h1>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Имя</span>
            <input v-model="form.firstName" class="input-field" type="text" autocomplete="given-name" required minlength="2" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Фамилия</span>
            <input v-model="form.lastName" class="input-field" type="text" autocomplete="family-name" required minlength="2" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Телефон</span>
            <input v-model="form.phone" class="input-field" type="tel" autocomplete="tel" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Email</span>
            <input v-model="form.email" class="input-field" type="email" autocomplete="email" required />
          </label>
          <label class="block sm:col-span-2">
            <span class="mb-1 block text-sm font-semibold text-steel">Пароль</span>
            <input v-model="form.password" class="input-field" type="password" autocomplete="new-password" required minlength="8" />
          </label>
        </div>
        <p v-if="authStore.error" class="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {{ authStore.error }}
        </p>
        <button class="btn-primary mt-6 w-full" type="submit" :disabled="authStore.loading">
          <UserPlus class="size-4" />
          Создать аккаунт
        </button>
        <p class="mt-5 text-center text-sm text-slate-500">
          Уже есть аккаунт?
          <RouterLink class="font-bold text-accent" :to="{ name: 'login', query: route.query }">
            Войти
          </RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>
