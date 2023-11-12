import { defineStore, acceptHMRUpdate } from 'pinia';
import { Message } from '@/components/types/message';

export const useMessageHistoryStore = defineStore({
  id: 'messageHistory',
  state: () => ({
    items: [] as Message[],
  }),
  actions: {
    addItem(message: Message) {
      this.items.push(message)
    },
    clearItems() {
      console.log('hgo in')
      this.items = []
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageHistoryStore, import.meta.hot))
}
