import { defineStore } from "pinia";
import { apiRequest } from "@/services/api";
import type { Cart } from "@/types";

const emptyCart: Cart = {
  items: [],
  totalItems: 0,
  totalAmount: 0
};

export const useCartStore = defineStore("cart", {
  state: () => ({
    cart: emptyCart as Cart,
    loading: false,
    error: ""
  }),
  actions: {
    async loadCart() {
      this.loading = true;
      this.error = "";

      try {
        const data = await apiRequest<{ cart: Cart }>("/cart");
        this.cart = data.cart;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось загрузить корзину";
      } finally {
        this.loading = false;
      }
    },
    async addItem(productId: number, quantity = 1) {
      this.error = "";
      try {
        const data = await apiRequest<{ cart: Cart }>("/cart/items", {
          method: "POST",
          body: JSON.stringify({ productId, quantity })
        });
        this.cart = data.cart;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось добавить товар";
        throw error;
      }
    },
    async updateItem(productId: number, quantity: number) {
      this.error = "";
      try {
        const data = await apiRequest<{ cart: Cart }>(`/cart/items/${productId}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity })
        });
        this.cart = data.cart;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось изменить количество";
        throw error;
      }
    },
    async removeItem(productId: number) {
      this.error = "";
      try {
        const data = await apiRequest<{ cart: Cart }>(`/cart/items/${productId}`, {
          method: "DELETE"
        });
        this.cart = data.cart;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось удалить товар";
        throw error;
      }
    },
    async clearCart() {
      this.error = "";
      try {
        const data = await apiRequest<{ cart: Cart }>("/cart", {
          method: "DELETE"
        });
        this.cart = data.cart;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось очистить корзину";
        throw error;
      }
    },
    reset() {
      this.cart = emptyCart;
      this.error = "";
    }
  }
});
