<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue";
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="grid min-h-[70vh] place-items-center bg-paper px-4 py-16">
    <section class="max-w-xl text-center">
      <p class="text-sm font-black uppercase tracking-[0.24em] text-accent">Ошибка 404</p>
      <h1 class="mt-4 text-5xl font-black tracking-tight text-ink sm:text-7xl">Такой страницы нет</h1>
      <p class="mt-5 text-base leading-7 text-steel">
        Адрес мог измениться. Вернитесь на главную или продолжите выбор в каталоге.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <RouterLink to="/" class="btn-primary"><ArrowLeft class="size-4" />На главную</RouterLink>
        <RouterLink to="/catalog" class="btn-secondary">Открыть каталог</RouterLink>
      </div>
    </section>
  </main>
</template>
