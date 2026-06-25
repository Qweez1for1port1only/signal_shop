<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Eye, ShoppingCart } from "@lucide/vue";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/types";
import { formatPrice } from "@/utils/format";

const props = defineProps<{
  product: Product;
}>();

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();
const busy = ref(false);
const added = ref(false);
const errorMessage = ref("");
const hasDiscount = computed(() => Boolean(props.product.oldPrice));

async function addToCart() {
  if (!authStore.isAuthenticated) {
    router.push({ name: "login", query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  busy.value = true;
  errorMessage.value = "";

  try {
    await cartStore.addItem(props.product.id);
    added.value = true;
    window.setTimeout(() => (added.value = false), 1400);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Не удалось добавить товар";
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/70">
    <RouterLink :to="`/catalog/${product.slug}`" class="block aspect-[4/3] overflow-hidden bg-slate-100">
      <img
        :src="product.imageUrl"
        :alt="product.name"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
    </RouterLink>
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <p class="text-xs font-bold uppercase tracking-[0.14em] text-accent">{{ product.category.name }}</p>
      <RouterLink
        :to="`/catalog/${product.slug}`"
        class="mt-2 line-clamp-2 text-lg font-bold leading-6 text-ink transition hover:text-accent"
      >
        {{ product.name }}
      </RouterLink>
      <p class="mt-1.5 line-clamp-1 text-sm leading-5 text-slate-500">
        {{ product.description }}
      </p>
      <div class="mt-auto flex items-end gap-2 pt-4">
        <span class="text-xl font-bold text-ink">{{ formatPrice(product.price) }}</span>
        <span v-if="hasDiscount" class="pb-0.5 text-sm text-slate-400 line-through">
          {{ formatPrice(product.oldPrice ?? 0) }}
        </span>
      </div>
      <p v-if="errorMessage" class="mt-3 text-xs font-bold text-rose-700" role="alert">{{ errorMessage }}</p>
      <div class="mt-4 flex items-center justify-between gap-3">
        <RouterLink :to="`/catalog/${product.slug}`" class="inline-flex items-center gap-1.5 text-sm font-bold text-steel transition hover:text-accent">
          Подробнее
          <Eye class="size-4" />
        </RouterLink>
        <button class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50" type="button" :disabled="busy || product.stock === 0" @click="addToCart">
          <ShoppingCart class="size-4" />
          {{ product.stock ? (added ? "Добавлено" : "В корзину") : "Нет в наличии" }}
        </button>
      </div>
    </div>
  </article>
</template>
