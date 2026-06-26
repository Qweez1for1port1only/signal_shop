import { defineStore } from "pinia";
import { ApiError, apiRequest } from "@/services/api";
import type { DeliveryAddress, Order, PaymentCard } from "@/types";

const CHECKOUT_KEY = "signal-checkout-key";

function createCheckoutKey() {
  const key = crypto.randomUUID();
  sessionStorage.setItem(CHECKOUT_KEY, key);
  return key;
}

function getCheckoutKey() {
  return sessionStorage.getItem(CHECKOUT_KEY) ?? createCheckoutKey();
}

export const useOrderStore = defineStore("orders", {
  state: () => ({
    currentOrder: null as Order | null,
    loading: false,
    checkoutMessage: "",
    error: "",
    checkoutKey: getCheckoutKey()
  }),
  actions: {
    async checkout(deliveryAddress: DeliveryAddress, card: PaymentCard) {
      this.loading = true;
      this.checkoutMessage = "";
      this.error = "";

      try {
        const data = await apiRequest<{ message: string; order: Order }>("/checkout", {
          method: "POST",
          body: JSON.stringify({ deliveryAddress, card, idempotencyKey: this.checkoutKey })
        });

        this.currentOrder = data.order;
        this.checkoutMessage = data.message;
        this.checkoutKey = createCheckoutKey();
        return data.order;
      } catch (error) {
        if (error instanceof ApiError && error.payload && typeof error.payload === "object") {
          const payload = error.payload as { message?: string; order?: Order };

          if (payload.order) {
            this.checkoutMessage = payload.message ?? error.message;
            this.checkoutKey = createCheckoutKey();
          }
        }

        this.error = error instanceof Error ? error.message : "Заказ не оформлен";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    beginCheckout() {
      this.currentOrder = null;
      this.checkoutMessage = "";
      this.error = "";
    },
    reset() {
      this.currentOrder = null;
      this.checkoutMessage = "";
      this.error = "";
      this.checkoutKey = createCheckoutKey();
    }
  }
});
