<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { Eye } from "@lucide/vue";
import type { Product } from "@/types";
import { formatPrice } from "@/utils/format";

const props = defineProps<{
  product: Product;
}>();

const hasDiscount = computed(() => Boolean(props.product.oldPrice));
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
      <RouterLink :to="`/catalog/${product.slug}`" class="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-steel transition hover:text-accent">
        Подробнее
        <Eye class="size-4" />
      </RouterLink>
    </div>
  </article>
</template>
