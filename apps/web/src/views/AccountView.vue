<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { Package, Save, UserRound } from "@lucide/vue";
import StatusBadge from "@/components/StatusBadge.vue";
import { useAuthStore } from "@/stores/auth";
import { useOrderStore } from "@/stores/orders";
import { formatDate, formatPrice } from "@/utils/format";

const authStore = useAuthStore();
const orderStore = useOrderStore();
const activeTab = ref<"profile" | "orders">("profile");
const saved = ref(false);

const form = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  address: "",
  postalCode: ""
});

function fillForm() {
  const user = authStore.user;

  if (!user) {
    return;
  }

  form.firstName = user.firstName;
  form.lastName = user.lastName;
  form.phone = user.phone ?? "";
  form.city = user.city ?? "";
  form.address = user.address ?? "";
  form.postalCode = user.postalCode ?? "";
}

async function saveProfile() {
  saved.value = false;
  try {
    await authStore.updateProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || null,
      city: form.city || null,
      address: form.address || null,
      postalCode: form.postalCode || null
    });
    saved.value = true;
  } catch {
    saved.value = false;
  }
}

onMounted(async () => {
  try {
    await authStore.loadProfile();
  } catch {
    return;
  }
  fillForm();
  await orderStore.loadOrders();
});

watch(() => authStore.user, fillForm);
</script>

<template>
  <main class="min-h-screen bg-paper">
    <section class="container-page py-8">
      <div class="mb-6">
        <p class="eyebrow">Аккаунт</p>
        <h1 class="mt-2 text-4xl font-black tracking-tight text-ink">Личный кабинет</h1>
        <p v-if="authStore.user" class="mt-1 text-sm text-slate-500">{{ authStore.user.email }}</p>
      </div>

      <p v-if="orderStore.error" class="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700" role="alert">
        {{ orderStore.error }}
      </p>

      <div class="mb-6 inline-grid grid-cols-2 rounded-md border border-slate-300 bg-white p-1">
        <button
          class="inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-sm font-bold transition"
          :class="activeTab === 'profile' ? 'bg-accent text-white' : 'text-steel hover:bg-slate-100'"
          type="button"
          @click="activeTab = 'profile'"
        >
          <UserRound class="size-4" />
          Профиль
        </button>
        <button
          class="inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-sm font-bold transition"
          :class="activeTab === 'orders' ? 'bg-accent text-white' : 'text-steel hover:bg-slate-100'"
          type="button"
          @click="activeTab = 'orders'"
        >
          <Package class="size-4" />
          Заказы
        </button>
      </div>

      <form
        v-if="activeTab === 'profile'"
        class="panel p-5 sm:p-7"
        @submit.prevent="saveProfile"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Имя</span>
            <input v-model="form.firstName" class="input-field" required minlength="2" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Фамилия</span>
            <input v-model="form.lastName" class="input-field" required minlength="2" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Телефон</span>
            <input v-model="form.phone" class="input-field" type="tel" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Город</span>
            <input v-model="form.city" class="input-field" />
          </label>
          <label class="block sm:col-span-2">
            <span class="mb-1 block text-sm font-semibold text-steel">Адрес</span>
            <input v-model="form.address" class="input-field" />
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-steel">Индекс</span>
            <input v-model="form.postalCode" class="input-field" />
          </label>
        </div>

        <p v-if="authStore.error" class="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
          {{ authStore.error }}
        </p>
        <p v-if="saved" class="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          Данные сохранены
        </p>

        <button class="btn-primary mt-6" type="submit" :disabled="authStore.loading">
          <Save class="size-4" />
          Сохранить
        </button>
      </form>

      <section v-else class="space-y-4">
        <article
          v-for="order in orderStore.orders"
          :key="order.id"
          class="panel p-5"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-slate-500">{{ formatDate(order.createdAt) }}</p>
              <h2 class="mt-1 break-all text-lg font-bold text-ink">Заказ {{ order.id }}</h2>
            </div>
            <StatusBadge :status="order.status" />
          </div>

          <div class="mt-4 space-y-2">
            <div v-for="item in order.items" :key="item.id" class="flex justify-between gap-4 text-sm">
              <span class="text-slate-600">{{ item.productName }} × {{ item.quantity }}</span>
              <span class="font-semibold text-steel">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span class="text-slate-500">
              Карта: **** {{ order.payment?.cardLast4 ?? "----" }}
            </span>
            <span class="text-lg font-bold text-ink">{{ formatPrice(order.totalAmount) }}</span>
          </div>
        </article>

        <div v-if="!orderStore.orders.length" class="rounded-md border border-dashed border-slate-300 bg-white p-10 text-center">
          <p class="text-lg font-bold text-ink">Заказов пока нет</p>
        </div>
      </section>
    </section>
  </main>
</template>
