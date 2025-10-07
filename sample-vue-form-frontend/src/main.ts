import { createApp } from "vue";
import "./style.css";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";
import { router } from "./router";
import { vueQueryPluginOptions } from "./api/vue-query-plugin-options";

const app = createApp(App);

app.use(router);
app.use(VueQueryPlugin, vueQueryPluginOptions);

app.mount("#app");
