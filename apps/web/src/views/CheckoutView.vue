<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { CheckCircle2, CreditCard } from "@lucide/vue";
import { ApiError } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useOrderStore } from "@/stores/orders";
import { formatPrice } from "@/utils/format";

const authStore = useAuthStore();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter();
const errorMessage = ref("");
const fieldErrors = reactive<Record<string, string>>({});

const deliveryAddress = reactive({
  fullName: "",
  phone: "",
  city: "",
  address: "",
  postalCode: ""
});

const card = reactive({
  number: "",
  holder: "",
  expMonth: "",
  expYear: "",
  cvc: ""
});

const isComplete = computed(() => Boolean(orderStore.currentOrder));

function clearFieldError(field: string) {
  delete fieldErrors[field];
}

function clearFieldErrors() {
  Object.keys(fieldErrors).forEach(clearFieldError);
}

function applyValidationIssues(error: ApiError) {
  if (!error.payload || typeof error.payload !== "object") return;

  const issues = (error.payload as { issues?: unknown }).issues;
  if (!Array.isArray(issues)) return;

  for (const issue of issues) {
    if (!issue || typeof issue !== "object") continue;

    const path = (issue as { path?: unknown }).path;
    const message = (issue as { message?: unknown }).message;
    if (!Array.isArray(path) || typeof message !== "string") continue;

    const field = path[path.length - 1];
    if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = message;
  }
}

async function submit() {
  errorMessage.value = "";
  clearFieldErrors();

  try {
    await orderStore.checkout(
      {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        city: deliveryAddress.city,
        address: deliveryAddress.address,
        postalCode: deliveryAddress.postalCode || null
      },
      card
    );
    await cartStore.loadCart();
  } catch (error) {
    if (error instanceof ApiError) {
      applyValidationIssues(error);
      errorMessage.value = error.message;
      if (error.status !== 402) await cartStore.loadCart();
      return;
    }

    errorMessage.value = "Заказ не оформлен";
  }
}

onMounted(async () => {
  orderStore.beginCheckout();
  await cartStore.loadCart();

  if (!cartStore.cart.items.length && !orderStore.currentOrder) {
    router.push("/cart");
    return;
  }

  const user = authStore.user;

  if (user) {
    deliveryAddress.fullName = `${user.firstName} ${user.lastName}`;
    deliveryAddress.phone = user.phone ?? "";
    deliveryAddress.city = user.city ?? "";
    deliveryAddress.address = user.address ?? "";
    deliveryAddress.postalCode = user.postalCode ?? "";
    card.holder = `${user.firstName} ${user.lastName}`.toUpperCase();
  }
});
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="container-page py-8">
      <p class="eyebrow">Последний шаг</p>
      <h1 class="mt-2 text-4xl font-black tracking-tight text-ink">Оформление заказа</h1>

      <div v-if="isComplete" class="panel mt-6 p-6">
        <div class="flex items-start gap-4">
          <span class="grid size-12 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-700">
            <CheckCircle2 class="size-7" />
          </span>
          <div>
            <h2 class="text-xl font-bold text-ink">{{ orderStore.checkoutMessage || "Заказ создан" }}</h2>
            <p class="mt-2 text-sm text-slate-500">
              Номер заказа: {{ orderStore.currentOrder?.id }}
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              <RouterLink to="/account" class="btn-primary">Личный кабинет</RouterLink>
              <RouterLink to="/catalog" class="btn-secondary">Каталог</RouterLink>
            </div>
          </div>
        </div>
      </div>

      <form v-else class="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]" @submit.prevent="submit">
        <div class="space-y-6">
          <section class="panel p-5 sm:p-7">
            <h2 class="text-xl font-black text-ink">Доставка</h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-sm font-semibold text-steel">Получатель</span>
                <input v-model="deliveryAddress.fullName" class="input-field" :aria-invalid="Boolean(fieldErrors.fullName)" required @input="clearFieldError('fullName')" />
                <span v-if="fieldErrors.fullName" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.fullName }}</span>
              </label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-steel">Телефон</span>
                <input v-model="deliveryAddress.phone" class="input-field" type="tel" :aria-invalid="Boolean(fieldErrors.phone)" required @input="clearFieldError('phone')" />
                <span v-if="fieldErrors.phone" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.phone }}</span>
              </label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-steel">Город</span>
                <input v-model="deliveryAddress.city" class="input-field" :aria-invalid="Boolean(fieldErrors.city)" required @input="clearFieldError('city')" />
                <span v-if="fieldErrors.city" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.city }}</span>
              </label>
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-sm font-semibold text-steel">Адрес</span>
                <input v-model="deliveryAddress.address" class="input-field" :aria-invalid="Boolean(fieldErrors.address)" required @input="clearFieldError('address')" />
                <span v-if="fieldErrors.address" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.address }}</span>
              </label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-steel">Индекс</span>
                <input v-model="deliveryAddress.postalCode" class="input-field" :aria-invalid="Boolean(fieldErrors.postalCode)" @input="clearFieldError('postalCode')" />
                <span v-if="fieldErrors.postalCode" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.postalCode }}</span>
              </label>
            </div>
          </section>

          <section class="panel p-5 sm:p-7">
            <h2 class="text-xl font-black text-ink">Оплата</h2>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-sm font-semibold text-steel">Номер карты</span>
                <input v-model="card.number" class="input-field" inputmode="numeric" autocomplete="cc-number" :aria-invalid="Boolean(fieldErrors.number)" required minlength="12" maxlength="23" @input="clearFieldError('number')" />
                <span v-if="fieldErrors.number" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.number }}</span>
                <span class="mt-1 block text-xs text-slate-500">Для демо: 4242 4242 4242 4242</span>
              </label>
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-sm font-semibold text-steel">Владелец</span>
                <input v-model="card.holder" class="input-field" autocomplete="cc-name" :aria-invalid="Boolean(fieldErrors.holder)" required @input="clearFieldError('holder')" />
                <span v-if="fieldErrors.holder" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.holder }}</span>
              </label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-steel">Месяц</span>
                <input v-model="card.expMonth" class="input-field" inputmode="numeric" autocomplete="cc-exp-month" :aria-invalid="Boolean(fieldErrors.expMonth)" required placeholder="MM" maxlength="2" @input="clearFieldError('expMonth')" />
                <span v-if="fieldErrors.expMonth" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.expMonth }}</span>
              </label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-steel">Год</span>
                <input v-model="card.expYear" class="input-field" inputmode="numeric" autocomplete="cc-exp-year" :aria-invalid="Boolean(fieldErrors.expYear)" required placeholder="YY" maxlength="4" @input="clearFieldError('expYear')" />
                <span v-if="fieldErrors.expYear" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.expYear }}</span>
              </label>
              <label class="block">
                <span class="mb-1 block text-sm font-semibold text-steel">CVC</span>
                <input v-model="card.cvc" class="input-field" inputmode="numeric" autocomplete="cc-csc" :aria-invalid="Boolean(fieldErrors.cvc)" required maxlength="4" @input="clearFieldError('cvc')" />
                <span v-if="fieldErrors.cvc" class="mt-1 block text-xs font-semibold text-rose-700">{{ fieldErrors.cvc }}</span>
                <span class="mt-1 block text-xs text-slate-500">Для демо: 123</span>
              </label>
            </div>
          </section>
        </div>

        <aside class="panel h-fit bg-amberline p-5">
          <h2 class="text-xl font-black text-ink">Заказ</h2>
          <div class="mt-5 space-y-3">
            <div v-for="item in cartStore.cart.items" :key="item.productId" class="flex justify-between gap-4 text-sm">
              <span class="text-slate-600">{{ item.name }} × {{ item.quantity }}</span>
              <span class="font-semibold text-steel">{{ formatPrice(item.subtotal) }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-200 pt-3 text-base">
              <span class="font-bold text-ink">К оплате</span>
              <span class="font-bold text-ink">{{ formatPrice(cartStore.cart.totalAmount) }}</span>
            </div>
          </div>
          <p v-if="errorMessage" class="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert" aria-live="polite">
            {{ errorMessage }}
          </p>
          <button class="btn-primary mt-6 w-full" type="submit" :disabled="orderStore.loading">
            <CreditCard class="size-4" />
            Оплатить
          </button>
        </aside>
      </form>
    </section>
  </main>
</template>
