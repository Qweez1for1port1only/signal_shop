<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { ArrowRight, Headphones, Laptop, Smartphone, Zap } from "@lucide/vue";
import ProductCard from "@/components/ProductCard.vue";
import { useCatalogStore } from "@/stores/catalog";

const catalogStore = useCatalogStore();

const categoryIcons = {
  laptops: Laptop,
  smartphones: Smartphone,
  audio: Headphones,
  accessories: Zap
};

onMounted(async () => {
  await Promise.all([catalogStore.loadCategories(), catalogStore.loadFeatured()]);
});
</script>

<template>
  <main class="bg-paper">
    <section class="container-page py-8 sm:py-12">
      <div class="grid overflow-hidden rounded-[1.75rem] border border-slate-300 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div class="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
          <p class="eyebrow">Новая техника без лишнего шума</p>
          <h1 class="mt-5 max-w-3xl text-[2.35rem] font-black leading-[1] tracking-[-0.045em] text-ink min-[380px]:text-5xl sm:text-7xl lg:text-[5.7rem]">
            Выбирайте.<br /><span class="text-accent">Подключайте.</span><br />Пользуйтесь.
          </h1>
          <p class="mt-7 max-w-xl text-base font-semibold leading-7 text-steel sm:text-lg">
            Устройства для работы, дома и движения. Понятные характеристики, актуальные остатки и оформление в несколько шагов.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink to="/catalog" class="btn-primary">
              Смотреть каталог <ArrowRight class="size-4" />
            </RouterLink>
            <RouterLink to="/register" class="btn-secondary">Создать аккаунт</RouterLink>
          </div>
        </div>

        <div class="relative min-h-[420px] overflow-hidden bg-ink p-7 text-white sm:min-h-[560px] sm:p-10">
          <div class="absolute -right-20 -top-16 size-72 rounded-full border-[42px] border-amberline" />
          <div class="absolute -bottom-24 -left-16 size-80 rounded-full border-[54px] border-accent" />
          <div class="relative flex h-full flex-col justify-between">
            <div class="flex items-start justify-between gap-4">
              <span class="rounded-full border border-white/30 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">SIGNAL / 01</span>
              <span class="grid size-14 place-items-center rounded-full bg-amberline text-2xl font-black text-ink">↗</span>
            </div>
            <div class="max-w-sm rounded-[1.5rem] bg-white p-6 text-ink shadow-2xl">
              <p class="text-xs font-black uppercase tracking-[0.2em] text-accent">В наличии сегодня</p>
              <p class="mt-3 text-4xl font-black tracking-tight">{{ catalogStore.catalogTotal }} моделей</p>
              <p class="mt-3 text-sm font-semibold leading-6 text-steel">Ноутбуки, смартфоны, аудио и аксессуары с быстрым оформлением.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container-page pb-12">
      <div class="mb-5 flex items-end justify-between">
        <div>
          <p class="eyebrow">Направления</p>
          <h2 class="mt-2 text-3xl font-black tracking-tight text-ink">Что ищем?</h2>
        </div>
        <span class="hidden text-sm font-bold text-steel sm:block">4 категории</span>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          v-for="(category, index) in catalogStore.categories"
          :key="category.slug"
          :to="{ name: 'catalog', query: { category: category.slug } }"
          class="group flex min-h-36 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <span class="flex items-start justify-between">
            <span class="text-xs font-black tracking-[0.2em] text-steel">0{{ index + 1 }}</span>
            <span class="grid size-10 place-items-center rounded-xl bg-blue-50 text-accent transition group-hover:bg-accent group-hover:text-white">
            <component :is="categoryIcons[category.slug as keyof typeof categoryIcons] ?? Zap" class="size-6" />
            </span>
          </span>
          <span class="mt-7">
            <span class="block text-xl font-black text-ink">{{ category.name }}</span>
            <span class="mt-1 line-clamp-2 block text-sm font-semibold leading-5 text-steel">{{ category.description }}</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <section class="border-t border-slate-200 bg-white py-14">
      <div class="container-page">
      <div v-if="catalogStore.error" class="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700" role="alert">
        {{ catalogStore.error }}
      </div>
      <div class="mb-6 flex items-end justify-between gap-4">
        <div>
          <p class="eyebrow">Выбор покупателей</p>
          <h2 class="mt-2 text-4xl font-black tracking-tight text-ink">Сейчас в фокусе</h2>
        </div>
        <RouterLink to="/catalog" class="hidden items-center gap-2 text-sm font-black text-accent sm:inline-flex">
          Все товары <ArrowRight class="size-4" />
        </RouterLink>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="product in catalogStore.featured" :key="product.id" :product="product" />
      </div>
      </div>
    </section>
  </main>
</template>
