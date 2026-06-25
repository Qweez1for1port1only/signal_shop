import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import HomeView from "@/views/HomeView.vue";

const LoginView = () => import("@/views/LoginView.vue");
const RegisterView = () => import("@/views/RegisterView.vue");
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
      path: "/login",
      name: "login",
      component: LoginView
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView
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
    login: "Вход — SIGNAL",
    register: "Регистрация — SIGNAL",
    "not-found": "Страница не найдена — SIGNAL"
  };
  document.title = titles[String(to.name)] ?? "SIGNAL";
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.initialize();

  if ((to.name === "login" || to.name === "register") && authStore.isAuthenticated) {
    return { name: "home" };
  }

  return true;
});

export default router;
