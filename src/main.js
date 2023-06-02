import {createApp} from 'vue'
import App from './App.vue'
import router from "./router";
import { Quasar, Notify, Dialog } from 'quasar';

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

import 'quasar/src/css/index.sass'

const app = createApp(App);
app.use(router);
app.use(Quasar, {
    plugins: {Notify, Dialog},
    config: {
        notify: {}
    }
});

app.mount('#app');
