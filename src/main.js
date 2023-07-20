import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import VueChartkick from "vue-chartkick";
import "chartkick/chart.js";

import {
  Cookies,
  Dialog,
  Loading,
  LocalStorage,
  Notify,
  Quasar,
  SessionStorage,
} from "quasar";

import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";

import "quasar/src/css/index.sass";

const pinia = createPinia();
const app = createApp(App);

app.use(Quasar, {
  plugins: { Notify, Dialog, LocalStorage, SessionStorage, Cookies, Loading },
  config: {
    notify: {},
    loading: {},
  },
});
app.use(pinia);
app.use(router);
app.use(VueChartkick);

app.mount("#app");
