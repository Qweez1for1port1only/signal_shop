<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Check, ShoppingCart } from "@lucide/vue";
import QuantityStepper from "@/components/QuantityStepper.vue";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useCatalogStore } from "@/stores/catalog";
import { formatPrice } from "@/utils/format";

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const quantity = ref(1);
const busy = ref(false);
const product = computed(() => catalogStore.product);

async function loadProduct() {
  await catalogStore.loadProduct(String(route.params.slug));
  quantity.value = 1;
}

async function addToCart() {
  if (!product.value) {
    return;
  }

  if (!authStore.isAuthenticated) {
    router.push({ name: "login", query: { redirect: route.fullPath } });
    return;
  }

  busy.value = true;

  try {
    await cartStore.addItem(product.value.id, quantity.value);
    router.push({ name: "cart" });
  } catch {
    // The cart store keeps the visible error message.
  } finally {
    busy.value = false;
  }
}

onMounted(loadProduct);
watch(() => route.params.slug, loadProduct);
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="container-page py-8">
      <button class="mb-6 inline-flex items-center gap-2 text-sm font-bold text-accent" type="button" @click="router.back()">
        <ArrowLeft class="size-4" />
        Назад
      </button>

      <div v-if="catalogStore.loading" class="grid gap-8 lg:grid-cols-2">
        <div class="aspect-square animate-pulse rounded-md bg-white" />
        <div class="h-96 animate-pulse rounded-md bg-white" />
      </div>

      <div v-else-if="catalogStore.error" class="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center" role="alert">
        <h1 class="text-2xl font-black text-ink">Товар не найден</h1>
        <p class="mt-2 text-sm font-semibold text-rose-700">{{ catalogStore.error }}</p>
        <button class="btn-secondary mt-5" type="button" @click="router.push('/catalog')">Вернуться в каталог</button>
      </div>

      <div v-else-if="product" class="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div class="overflow-hidden rounded-[2rem] border-2 border-ink bg-white shadow-[10px_10px_0_#C7FF43]">
          <img :src="product.imageUrl" :alt="product.name" class="aspect-square w-full object-cover" />
        </div>

        <div>
          <p class="text-sm font-bold uppercase tracking-[0.16em] text-accent">{{ product.category.name }}</p>
          <h1 class="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">{{ product.name }}</h1>
          <p class="mt-4 text-base leading-7 text-slate-600">{{ product.description }}</p>

          <div class="mt-6 flex flex-wrap items-end gap-3">
            <span class="text-3xl font-bold text-ink">{{ formatPrice(product.price) }}</span>
            <span v-if="product.oldPrice" class="pb-1 text-lg text-slate-400 line-through">
              {{ formatPrice(product.oldPrice) }}
            </span>
          </div>

          <div class="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Check class="size-5" />
            На складе: {{ product.stock }} шт.
          </div>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <QuantityStepper v-model="quantity" :min="1" :max="Math.max(product.stock, 1)" />
            <button class="btn-primary h-10 flex-1" type="button" :disabled="busy || product.stock === 0" @click="addToCart">
              <ShoppingCart class="size-4" />
              Добавить в корзину
            </button>
          </div>
          <p v-if="cartStore.error" class="mt-4 text-sm font-bold text-rose-700" role="alert">{{ cartStore.error }}</p>

          <div class="panel mt-8 p-5">
            <h2 class="text-lg font-black text-ink">Характеристики</h2>
            <dl class="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                v-for="(value, key) in product.specs"
                :key="key"
                class="rounded-md bg-slate-50 p-3"
              >
                <dt class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{{ key }}</dt>
                <dd class="mt-1 text-sm font-semibold text-steel">{{ value }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
