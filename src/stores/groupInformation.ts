import { defineStore, acceptHMRUpdate } from 'pinia';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export const useGroupInformationStore = defineStore({
  id: 'groupInformation',
  state: () => ({
    items: [] as AssistanceObjectCommunication[]
  }),
  actions: {
    setItems(items: AssistanceObjectCommunication[]) {
      this.items = items;
    },
    addItem(item: AssistanceObjectCommunication) {
      // TODO: Adjust as soon as multiple groups should be supported
      // For the moment, it is only allowed to participate in one group
      // this.items.push(item);
      this.items = [item];
    },
    clearItems() {
      console.log('clear group information');
      this.items = [];
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGroupInformationStore, import.meta.hot));
}
