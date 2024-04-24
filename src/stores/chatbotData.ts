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

import type { ChatbotData } from '@/components/types/chatbot-data';
import { defineStore, acceptHMRUpdate } from 'pinia';

/**
 * Pinia store for holding all chatbot data related information.
 */
export const useChatbotDataStore = defineStore({
  id: 'chatbotData',
  state: () => ({
    data: {} as ChatbotData,
    lastLoggedInUser: ''
  }),
  actions: {
    /**
     * Overwrite the existing value of the chatbot data by a given input.
     * @param {ChatbotData} chatbotData
     */
    setChatbotData(chatbotData: ChatbotData) {
      this.data = chatbotData;
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChatbotDataStore, import.meta.hot));
}
