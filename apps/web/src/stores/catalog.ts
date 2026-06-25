import { defineStore } from "pinia";
import { apiRequest } from "@/services/api";
import type { Category, Product } from "@/types";

type ProductFilters = {
  category?: string;
  q?: string;
  sort?: "popular" | "price_asc" | "price_desc" | "name";
  page?: number;
  limit?: number;
};

export const useCatalogStore = defineStore("catalog", {
  state: () => ({
    categories: [] as Category[],
    products: [] as Product[],
    featured: [] as Product[],
    product: null as Product | null,
    loading: false,
    total: 0,
    catalogTotal: 0,
    page: 1,
    limit: 12,
    error: ""
  }),
  actions: {
    async loadCategories() {
      try {
        const data = await apiRequest<{ categories: Category[] }>("/categories", { auth: false });
        this.categories = data.categories;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось загрузить категории";
      }
    },
    async loadProducts(filters: ProductFilters = {}) {
      this.loading = true;
      this.error = "";

      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.set(key, String(value));
          }
        });

        const data = await apiRequest<{ products: Product[]; total: number; page: number; limit: number }>(
          `/products${params.size ? `?${params.toString()}` : ""}`,
          { auth: false }
        );

        this.products = data.products;
        this.total = data.total;
        this.page = data.page;
        this.limit = data.limit;
      } catch (error) {
        this.products = [];
        this.error = error instanceof Error ? error.message : "Не удалось загрузить каталог";
      } finally {
        this.loading = false;
      }
    },
    async loadFeatured() {
      try {
        const data = await apiRequest<{ products: Product[]; total: number }>("/products?sort=popular&limit=4", {
          auth: false
        });
        this.featured = data.products;
        this.catalogTotal = data.total;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось загрузить товары";
      }
    },
    async loadProduct(slug: string) {
      this.loading = true;
      this.product = null;
      this.error = "";

      try {
        const data = await apiRequest<{ product: Product }>(`/products/${slug}`, { auth: false });
        this.product = data.product;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Не удалось загрузить товар";
      } finally {
        this.loading = false;
      }
    }
  }
});
