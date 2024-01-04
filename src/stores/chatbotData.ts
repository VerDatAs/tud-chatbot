import { defineStore, acceptHMRUpdate } from 'pinia';
import type { ChatbotData } from '@/components/types/chatbot-data';

export const useChatbotDataStore = defineStore({
  id: 'chatbotData',
  state: () => ({
    data: {} as ChatbotData
  }),
  actions: {
    setChatbotData(chatbotData: ChatbotData) {
      this.data = chatbotData;
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChatbotDataStore, import.meta.hot));
}
