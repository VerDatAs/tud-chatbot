import { defineStore, acceptHMRUpdate } from 'pinia';
import { GenericStringKeyToAnyValueMapping } from '@/components/types/generic-string-key-to-any-value-mapping';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { useChatbotDataStore } from '@/stores/chatbotData';
import { checkForKeyPresence, checkLastOperationIsEnabledValue, parameterValue } from '@/util/assistanceObjectHelper';
import axios from 'axios';

export const useMessageExchangeStore = defineStore({
  id: 'messageExchange',
  state: () => ({
    items: [] as AssistanceObjectCommunication[],
    groups: [] as AssistanceObjectCommunication[],
    operationItems: [] as AssistanceObjectCommunication[],
    stateUpdates: [] as AssistanceObjectCommunication[],
    assistanceIdToTypeMatching: {} as GenericStringKeyToAnyValueMapping,
    idsRequested: [] as string[],
    typeToDataMatching: {} as GenericStringKeyToAnyValueMapping,
    typesRequested: [] as string[]
  }),
  actions: {
    clearItems() {
      this.items = [];
      this.groups = [];
      this.operationItems = [];
      this.stateUpdates = [];
      this.assistanceIdToTypeMatching = {};
      this.idsRequested = [];
      this.typeToDataMatching = {};
      this.typesRequested = [];
    },
    setItems(items: AssistanceObjectCommunication[]) {
      this.items = [];
      items.forEach((item: AssistanceObjectCommunication) => {
        this.addItem(item);
      });
    },
    addItem(assistanceObject: AssistanceObjectCommunication) {
      // only push or check items that do not already exist (messageId must exist)
      if (!this.items.some((item: AssistanceObjectCommunication) => assistanceObject.messageId && item.messageId === assistanceObject.messageId)) {
        this.items.push(assistanceObject);
        this.checkForTypeMatching(assistanceObject);
        this.addOrRemoveGroup(assistanceObject);
        this.addOperationItem(assistanceObject);
        this.addStateUpdate(assistanceObject);
      }
    },
    checkForTypeMatching(assistanceObject: AssistanceObjectCommunication) {
      if (assistanceObject.aId && !this.idsRequested.includes(assistanceObject.aId) && !this.assistanceIdToTypeMatching[assistanceObject.aId]) {
        const url = useChatbotDataStore().data.backendUrl + '/api/v1/assistance/' + assistanceObject.aId + '/type';
        const authHeader = {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: 'Bearer ' + useChatbotDataStore().data.token
        }
        this.idsRequested.push(assistanceObject.aId);

        axios.get(url, { headers: authHeader })
          .then((data: any) => {
            if (assistanceObject.aId) {
              const typeKey = data.data?.typeKey;
              this.assistanceIdToTypeMatching[assistanceObject.aId] = typeKey;
              this.checkTypeKeyData(typeKey);
            }
          })
      }
    },
    checkTypeKeyData(typeKey: string) {
      if (!this.typesRequested.includes(typeKey) && !this.typeToDataMatching[typeKey]) {
        const url = useChatbotDataStore().data.backendUrl + '/api/v1/assistance/types/' + typeKey;
        const authHeader = {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: 'Bearer ' + useChatbotDataStore().data.token
        }
        this.typesRequested.push(typeKey);

        axios.get(url, { headers: authHeader })
          .then((data: any) => {
            this.typeToDataMatching[typeKey] = data.data;
          })
      }
    },
    addOrRemoveGroup(assistanceObject: AssistanceObjectCommunication) {
      if (checkForKeyPresence(assistanceObject, 'related_users')) {
        this.groups.push(assistanceObject);
      } else if (parameterValue(assistanceObject, 'state_update')?.status === 'completed'
        || parameterValue(assistanceObject, 'state_update_response')?.status === 'completed') {
        this.groups = this.groups.filter((item) => item.aId !== assistanceObject.aId || item.aoId !== assistanceObject.aoId);
      }
    },
    addOperationItem(assistanceObject: AssistanceObjectCommunication) {
      if (checkForKeyPresence(assistanceObject, 'operation')) {
        this.operationItems.push(assistanceObject);
      }
    },
    addStateUpdate(assistanceObject: AssistanceObjectCommunication) {
      if (checkForKeyPresence(assistanceObject, 'state_update')) {
        this.stateUpdates.push(assistanceObject);
      }
    }
  },
  getters: {
    chatEnabled: (state) => {
      return () => checkLastOperationIsEnabledValue(state, 'enable_chat', 'disable_chat');
    },
    notesEnabled: (state) => {
      return () => checkLastOperationIsEnabledValue(state, 'enable_notes', 'disable_notes');
    },
    notesCommandEnabled: (state) => {
      return () => checkLastOperationIsEnabledValue(state, 'enable_notes_command', 'disable_notes_command');
    },
    peerSolutionEnabled: (state) => {
      return () => checkLastOperationIsEnabledValue(state, 'enable_peer_solution', 'disable_peer_solution');
    },
    peerSolutionCommandEnabled: (state) => {
      return () => checkLastOperationIsEnabledValue(state, 'enable_peer_solution_command', 'disable_peer_solution_command');
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageExchangeStore, import.meta.hot));
}
