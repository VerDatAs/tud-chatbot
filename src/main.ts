import { createApp } from 'vue';
import { createPinia } from 'pinia';
// Proposed by https://www.reddit.com/r/vuejs/comments/u0o7n6/comment/i47bqum
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import { ChatbotData } from "@/components/types/chatbot-data";
import axios from 'axios';

import './assets/main.scss';

function initChatbot(initChatbotData: ChatbotData) {
  console.log('init chatbotApp', JSON.stringify(initChatbotData))
  const app = createApp(App, { initChatbotData });

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  app.mount('#chatbotApp');
}

// Local development: Uncomment this lines and remove type from "import type ..."
// TODO: Find a better solution for local development: https://stackoverflow.com/questions/70709987/how-to-load-environment-variables-from-env-file-using-vite
// const backendUrl = 'http://localhost:8080';
// const pseudoId = 'ca1910';
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
  initChatbot(initChatbotData)
}
