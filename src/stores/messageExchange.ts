import { defineStore, acceptHMRUpdate } from 'pinia';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { checkForKeyPresence, parameterValue } from '@/util/assistanceObjectHelper';

export const useMessageExchangeStore = defineStore({
  id: 'messageExchange',
  state: () => ({
    items: [] as AssistanceObjectCommunication[],
    groups: [] as AssistanceObjectCommunication[],
    stateUpdates: [] as AssistanceObjectCommunication[]
  }),
  actions: {
    clearItems() {
      this.items = [];
      this.groups = [];
      this.stateUpdates = [];
    },
    setItems(items: AssistanceObjectCommunication[]) {
      this.items = items;
      this.items?.forEach((assistanceObject: AssistanceObjectCommunication) => {
        this.addOrRemoveGroup(assistanceObject);
        this.addStateUpdate(assistanceObject);
      });
    },
    addItem(assistanceObject: AssistanceObjectCommunication) {
      // only push items that do not already exist
      if (!this.items.some((item: AssistanceObjectCommunication) => item.messageId === assistanceObject.messageId)) {
        this.items.push(assistanceObject);
        this.addOrRemoveGroup(assistanceObject);
        this.addStateUpdate(assistanceObject);
      }
    },
    addOrRemoveGroup(assistanceObject: AssistanceObjectCommunication) {
      if (checkForKeyPresence(assistanceObject, 'group')) {
        this.groups.push(assistanceObject);
      } else if (parameterValue(assistanceObject, 'state_update')?.status === 'completed'
        || parameterValue(assistanceObject, 'state_update_response')?.status === 'completed') {
        this.groups = this.groups.filter((item) => item.aId !== assistanceObject.aId || item.aoId !== assistanceObject.aoId);
      }
    },
    addStateUpdate(assistanceObject: AssistanceObjectCommunication) {
      if (checkForKeyPresence(assistanceObject, 'state_update')) {
        this.stateUpdates.push(assistanceObject);
      }
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageExchangeStore, import.meta.hot));
}
