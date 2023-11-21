import { defineStore, acceptHMRUpdate } from 'pinia';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export const useMessageExchangeStore = defineStore({
  id: 'messageExchange',
  state: () => ({
    items: [] as AssistanceObjectCommunication[]
  }),
  actions: {
    setItems(items: AssistanceObjectCommunication[]) {
      this.items = items;
    },
    addItem(item: AssistanceObjectCommunication) {
      this.items.push(item);
    },
    clearItems() {
      console.log('clear message history');
      this.items = [];
    }
  },
  persist: false
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageExchangeStore, import.meta.hot));
}
