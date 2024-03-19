import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Proposed by https://www.reddit.com/r/vuejs/comments/u0o7n6/comment/i47bqum
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import { ChatbotData } from '@/components/types/chatbot-data';
import { useChatbotDataStore } from '@/stores/chatbotData';
import * as ConfirmDialog from 'vuejs-confirm-dialog'

import './assets/main.scss';
import 'animate.css/animate.css';

function isDevelopmentBuild(): boolean {
  return import.meta.env.MODE != 'production';
}

function initChatbot(initChatbotData: ChatbotData) {
  // console.log('init chatbotApp', JSON.stringify(initChatbotData));
  const app = createApp(App);

  app.use(ConfirmDialog);

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  useChatbotDataStore().setChatbotData(initChatbotData);

  app.mount('#chatbotApp');
}

if (isDevelopmentBuild()) {
  console.log('is development build');
  // solution of conditional imports retrieved from https://stackoverflow.com/a/67059286
  const axios = (await import('axios')).default;
  import('./assets/local-dev.scss');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // use Safari as a second browser to simulate the cooperation
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const pseudoId = import.meta.env.VITE_PSEUDO_ID;
  const alternativePseudoId = import.meta.env.VITE_ALTERNATIVE_PSEUDO_ID;
  const username = isSafari ? alternativePseudoId : pseudoId;
  const authUrl = backendUrl + '/api/v1/auth/login';
  const request = {
    actorAccountName: username
  };
  axios.post(authUrl, request).then((data: any) => {
    const token = data.data?.token;
    const localChatbotData = new ChatbotData('', backendUrl, username, token, true);
    localChatbotData.isRunLocally = true;
    initChatbot(localChatbotData);
  });
}

export function init(initChatbotData: ChatbotData) {
  initChatbot(initChatbotData);
}
