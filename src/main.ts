import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Proposed by https://www.reddit.com/r/vuejs/comments/u0o7n6/comment/i47bqum
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import { ChatbotData } from '@/components/types/chatbot-data';
import { useChatbotDataStore } from '@/stores/chatbotData';
import axios from 'axios';
import * as ConfirmDialog from 'vuejs-confirm-dialog'

import './assets/main.scss';

function initChatbot(initChatbotData: ChatbotData) {
  console.log('init chatbotApp', JSON.stringify(initChatbotData));
  const app = createApp(App);

  app.use(ConfirmDialog);

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  useChatbotDataStore().setChatbotData(initChatbotData);

  app.mount('#chatbotApp');
}

// Local development: Uncomment this lines and remove type from "import type ..."
// TODO: Find a better solution for local development: https://stackoverflow.com/questions/70709987/how-to-load-environment-variables-from-env-file-using-vite
// const backendUrl = 'https://tasverdatas.showcase.verdatas.inf.tu-dresden.de';
// // use Safari as a second browser to simulate the cooperation
// const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
// const pseudoId = isSafari ? 'verdatas2' : 'verdatas1';
// const authUrl = backendUrl + '/api/v1/auth/login';
// const request = {
//   actorAccountName: pseudoId
// };
// const userData = axios.post(authUrl, request).then((data: any) => {
//   const token = data.data?.token;
//   const localChatbotData = new ChatbotData('', backendUrl, pseudoId, token, true)
//   localChatbotData.isRunLocally = true
//   initChatbot(localChatbotData);
// });

export function init(initChatbotData: ChatbotData) {
  initChatbot(initChatbotData);
}
