import {createApp} from 'vue'
import App from './App.vue'
import router from "@/router";
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, LocalStorage, SessionStorage, Cookies } from 'quasar';

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

import 'quasar/src/css/index.sass'
import {useAuthStore} from "@/stores/auth";

const pinia = createPinia();
const app = createApp(App);

app.use(Quasar, {
    plugins: {Notify, Dialog, LocalStorage, SessionStorage, Cookies},
    config: {
        notify: {}
    }
});
app.use(pinia);
app.use(router);



app.mount('#app');
