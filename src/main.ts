import './assets/main.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Proposed by https://www.reddit.com/r/vuejs/comments/u0o7n6/comment/i47bqum
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.mount('#chatbotApp');
