<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="grid min-h-[70vh] place-items-center bg-paper px-4 py-16">
    <section class="max-w-xl text-center">
      <p class="text-sm font-black uppercase tracking-[0.24em] text-accent">Ошибка 404</p>
      <h1 class="mt-4 text-5xl font-black tracking-tight text-ink sm:text-7xl">Такой страницы нет</h1>
      <p class="mt-5 text-base leading-7 text-steel">Вернитесь на главную страницу, пока остальные разделы готовятся.</p>
      <RouterLink to="/" class="btn-primary mt-8">На главную</RouterLink>
    </section>
  </main>
</template>
