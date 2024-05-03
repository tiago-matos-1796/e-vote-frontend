import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import VueChartkick from "vue-chartkick";
import "chartkick/chart.js";
import { createI18n } from "vue-i18n";
import de from "/locales/de.json";
import en from "/locales/en.json";
import es from "/locales/es.json";
import fr from "/locales/fr.json";
import it from "/locales/it.json";
import nl from "/locales/nl.json";
import pt from "/locales/pt.json";

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

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  legacy: true,
  messages: {
    de,
    en,
    es,
    fr,
    it,
    nl,
    pt,
  },
});

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
app.use(i18n);

app.mount("#app");
