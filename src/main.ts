/**
 * Chatbot for the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2023-2024 TU Dresden (Tommy Kubica)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import App from './App.vue';
import { ChatbotData } from '@/components/types/chatbot-data';
import { useChatbotDataStore } from '@/stores/chatbotData';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import * as ConfirmDialog from 'vuejs-confirm-dialog';

import './assets/main.scss';
import 'animate.css/animate.css';

function isDevelopmentBuild(): boolean {
  return import.meta.env.MODE != 'production';
}

/**
 * Initialize the chatbot with the provided data.
 * @param {ChatbotData} initChatbotData
 */
function initChatbot(initChatbotData: ChatbotData) {
  const app = createApp(App);

  app.use(ConfirmDialog);

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  useChatbotDataStore().setChatbotData(initChatbotData);

  app.mount('#chatbotApp');
}

if (isDevelopmentBuild()) {
  // Conditional imports: https://stackoverflow.com/a/67059286
  const axios = (await import('axios')).default;
  import('./assets/local-dev.scss');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // Use Safari as a second browser to simulate the cooperation in development mode
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const pseudoId = import.meta.env.VITE_PSEUDO_ID;
  const alternativePseudoId = import.meta.env.VITE_ALTERNATIVE_PSEUDO_ID;
  const username = isSafari ? alternativePseudoId : pseudoId;
  const authUrl = backendUrl + '/api/v1/auth/login';
  const request = {
    actorAccountName: username
  };
  // Retrieve a token of the tud-tas-backend and init the chatbot with it
  axios.post(authUrl, request).then((data: any) => {
    const token = data.data?.token;
    const localChatbotData = new ChatbotData('', backendUrl, username, token, true);
    localChatbotData.isRunLocally = true;
    initChatbot(localChatbotData);
  });
}

/**
 * Init function that is called from an external system (e.g., ILIAS).
 */
export function init(initChatbotData: ChatbotData) {
  initChatbot(initChatbotData);
}
