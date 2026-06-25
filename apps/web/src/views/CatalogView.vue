<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Search, SlidersHorizontal } from "@lucide/vue";
import ProductCard from "@/components/ProductCard.vue";
import { useCatalogStore } from "@/stores/catalog";

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
const search = ref(String(route.query.q ?? ""));
const selectedCategory = ref(String(route.query.category ?? ""));
const selectedSort = ref<"popular" | "price_asc" | "price_desc" | "name">(
  String(route.query.sort ?? "popular") as "popular" | "price_asc" | "price_desc" | "name"
);
const currentPage = ref(Math.max(1, Number(route.query.page) || 1));
const totalPages = computed(() => Math.max(1, Math.ceil(catalogStore.total / catalogStore.limit)));

const title = computed(() => {
  const category = catalogStore.categories.find((item) => item.slug === selectedCategory.value);
  return category ? category.name : "Каталог техники";
});

async function loadProducts() {
  await catalogStore.loadProducts({
    category: selectedCategory.value || undefined,
    q: search.value || undefined,
    sort: selectedSort.value,
    page: currentPage.value,
    limit: catalogStore.limit
  });
}

async function applyFilters(page = 1) {
  const query: Record<string, string> = {};

  if (selectedCategory.value) {
    query.category = selectedCategory.value;
  }

  if (search.value) {
    query.q = search.value;
  }

  if (selectedSort.value !== "popular") {
    query.sort = selectedSort.value;
  }

  if (page > 1) query.page = String(page);

  const target = router.resolve({ name: "catalog", query });
  if (target.fullPath === route.fullPath) {
    currentPage.value = page;
    await loadProducts();
    return;
  }

  await router.replace({ name: "catalog", query });
}

function selectCategory(slug: string) {
  selectedCategory.value = selectedCategory.value === slug ? "" : slug;
  applyFilters();
}

async function syncFromRoute() {
  const allowedSorts = ["popular", "price_asc", "price_desc", "name"] as const;
  const routeSort = String(route.query.sort ?? "popular");

  selectedCategory.value = String(route.query.category ?? "");
  search.value = String(route.query.q ?? "");
  selectedSort.value = allowedSorts.includes(routeSort as (typeof allowedSorts)[number])
    ? (routeSort as typeof selectedSort.value)
    : "popular";
  currentPage.value = Math.max(1, Number(route.query.page) || 1);
  await loadProducts();
}

onMounted(async () => {
  await catalogStore.loadCategories();
  await syncFromRoute();
});

watch(
  () => route.query,
  syncFromRoute
);
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="border-b border-slate-200 bg-white">
      <div class="container-page py-8">
        <p class="eyebrow">Каталог / SIGNAL</p>
        <h1 class="mt-2 text-4xl font-black tracking-tight text-ink">{{ title }}</h1>
        <div class="mt-6 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label class="relative block">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              v-model="search"
              class="input-field h-11 pl-10"
              type="search"
              placeholder="Поиск по каталогу"
              @keyup.enter="applyFilters()"
            />
          </label>
          <select v-model="selectedSort" class="input-field h-11" aria-label="Сортировка" @change="applyFilters()">
            <option value="popular">Сначала популярные</option>
            <option value="price_asc">Сначала дешевле</option>
            <option value="price_desc">Сначала дороже</option>
            <option value="name">По названию</option>
          </select>
        </div>
      </div>
    </section>

    <section class="container-page py-8">
      <div class="mb-6 flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-2 pr-2 text-sm font-bold text-steel">
          <SlidersHorizontal class="size-4" />
          Категории
        </span>
        <button
          class="rounded-full border px-4 py-2 text-sm font-bold transition"
          :class="!selectedCategory ? 'border-ink bg-ink text-white' : 'border-slate-300 bg-white text-steel hover:border-slate-500 hover:text-ink'"
          type="button"
          @click="selectCategory('')"
        >
          Все
        </button>
        <button
          v-for="category in catalogStore.categories"
          :key="category.slug"
          class="rounded-full border px-4 py-2 text-sm font-bold transition"
          :class="selectedCategory === category.slug ? 'border-ink bg-ink text-white' : 'border-slate-300 bg-white text-steel hover:border-slate-500 hover:text-ink'"
          type="button"
          @click="selectCategory(category.slug)"
        >
          {{ category.name }}
        </button>
      </div>

      <div v-if="catalogStore.error" class="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700" role="alert">
        {{ catalogStore.error }}
      </div>

      <div v-if="catalogStore.loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="item in 8" :key="item" class="h-80 animate-pulse rounded-md bg-white shadow-sm" />
      </div>

      <div v-else-if="catalogStore.products.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="product in catalogStore.products" :key="product.id" :product="product" />
      </div>

      <div v-else class="panel p-10 text-center">
        <p class="text-lg font-bold text-ink">Товары не найдены</p>
        <p class="mt-2 text-sm text-slate-500">Измените запрос или выберите другую категорию.</p>
      </div>

      <nav v-if="!catalogStore.loading && !catalogStore.error && totalPages > 1" class="mt-8 flex items-center justify-center gap-3" aria-label="Страницы каталога">
        <button class="btn-secondary" type="button" :disabled="currentPage === 1" @click="applyFilters(currentPage - 1)">
          Назад
        </button>
        <span class="text-sm font-bold text-steel">{{ currentPage }} / {{ totalPages }}</span>
        <button class="btn-secondary" type="button" :disabled="currentPage === totalPages" @click="applyFilters(currentPage + 1)">
          Дальше
        </button>
      </nav>
    </section>
  </main>
</template>
