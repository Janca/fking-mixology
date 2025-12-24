/**
 * Main entry point for Mixology Matcher
 */

import { createApp } from "vue";
import { pinia } from "./stores";
import router from "./router";
import App from "./App.vue";

import "./styles/main.scss";

const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount("#app");
