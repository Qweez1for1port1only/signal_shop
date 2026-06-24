import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const NotFoundView = () => import("@/views/NotFoundView.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

router.afterEach((to) => {
  const titles: Record<string, string> = {
    home: "SIGNAL — техника по делу",
    "not-found": "Страница не найдена — SIGNAL"
  };
  document.title = titles[String(to.name)] ?? "SIGNAL";
});

export default router;
