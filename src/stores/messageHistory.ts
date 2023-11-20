import { defineStore, acceptHMRUpdate } from 'pinia';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export const useMessageHistoryStore = defineStore({
  id: 'messageHistory',
  state: () => ({
    items: [] as AssistanceObjectCommunication[]
  }),
  actions: {
    addItem(message: AssistanceObjectCommunication) {
      this.items.push(message);
    },
    clearItems() {
      console.log('clear message history');
      this.items = [];
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageHistoryStore, import.meta.hot));
}
