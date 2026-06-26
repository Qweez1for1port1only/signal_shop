<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { CreditCard, Trash2 } from "@lucide/vue";
import QuantityStepper from "@/components/QuantityStepper.vue";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format";

const cartStore = useCartStore();

async function updateQuantity(productId: number, quantity: number) {
  try {
    await cartStore.updateItem(productId, quantity);
  } catch {
    // The cart store keeps the visible error message.
  }
}

async function removeProduct(productId: number) {
  try {
    await cartStore.removeItem(productId);
  } catch {
    // The cart store keeps the visible error message.
  }
}

async function clearCart() {
  try {
    await cartStore.clearCart();
  } catch {
    // The cart store keeps the visible error message.
  }
}

onMounted(() => {
  cartStore.loadCart();
});
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="container-page py-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow">Ваш выбор</p>
          <h1 class="mt-2 text-4xl font-black tracking-tight text-ink">Корзина</h1>
          <p class="mt-1 text-sm text-slate-500">Товаров: {{ cartStore.cart.totalItems }}</p>
        </div>
        <button
          v-if="cartStore.cart.items.length"
          class="btn-secondary"
          type="button"
          @click="clearCart"
        >
          <Trash2 class="size-4" />
          Очистить
        </button>
      </div>

      <p v-if="cartStore.error" class="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700" role="alert">
        {{ cartStore.error }}
      </p>

      <div v-if="cartStore.cart.items.length" class="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div class="space-y-3">
          <article
            v-for="item in cartStore.cart.items"
            :key="item.productId"
            class="grid gap-4 rounded-[1.5rem] border-2 border-ink bg-white p-4 sm:grid-cols-[120px_1fr_auto]"
          >
            <RouterLink :to="`/catalog/${item.slug}`" class="block aspect-square overflow-hidden rounded-md bg-slate-100">
              <img :src="item.imageUrl" :alt="item.name" class="h-full w-full object-cover" />
            </RouterLink>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{{ item.category.name }}</p>
              <RouterLink :to="`/catalog/${item.slug}`" class="mt-1 block text-lg font-bold text-ink hover:text-accent">
                {{ item.name }}
              </RouterLink>
              <p class="mt-2 text-sm text-slate-500">На складе: {{ item.stock }} шт.</p>
              <div class="mt-4">
                <QuantityStepper
                  :model-value="item.quantity"
                  :min="0"
                  :max="item.stock"
                  @update:model-value="updateQuantity(item.productId, $event)"
                />
              </div>
            </div>
            <div class="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
              <strong class="text-lg text-ink">{{ formatPrice(item.subtotal) }}</strong>
              <button class="inline-flex size-10 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50" type="button" title="Удалить" @click="removeProduct(item.productId)">
                <Trash2 class="size-5" />
              </button>
            </div>
          </article>
        </div>

        <aside class="panel h-fit bg-amberline p-5">
          <h2 class="text-xl font-black text-ink">Итого</h2>
          <div class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Товары</span>
              <span class="font-semibold text-steel">{{ cartStore.cart.totalItems }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-200 pt-3 text-base">
              <span class="font-bold text-ink">Сумма</span>
              <span class="font-bold text-ink">{{ formatPrice(cartStore.cart.totalAmount) }}</span>
            </div>
          </div>
          <RouterLink to="/checkout" class="btn-primary mt-6 w-full">
            <CreditCard class="size-4" />
            Оформить заказ
          </RouterLink>
        </aside>
      </div>

      <div v-else class="panel p-10 text-center">
        <p class="text-lg font-bold text-ink">Корзина пуста</p>
        <RouterLink to="/catalog" class="btn-primary mt-5">В каталог</RouterLink>
      </div>
    </section>
  </main>
</template>
