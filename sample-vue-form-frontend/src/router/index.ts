import { createWebHistory, createRouter } from "vue-router";
import Home from "@/pages/Home.vue";
import NestForm from "@/pages/NestForm/NestForm.vue";

const routes = [
  { path: "/", name: "home", component: Home, children: [] },
  { path: "/nest-form/:id", name: "nest-form", component: NestForm, children: [] },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
