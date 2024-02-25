import { defineStore, acceptHMRUpdate } from 'pinia';
import { GenericStringKeyToAnyValueMapping } from '@/components/types/generic-string-key-to-any-value-mapping';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { useChatbotDataStore } from '@/stores/chatbotData';
import { useDisplayStore } from '@/stores/display';
import { checkForKeyPresence, parameterValue } from '@/util/assistanceObjectHelper';
import axios from 'axios';

export const useMessageExchangeStore = defineStore({
  id: 'messageExchange',
  state: () => ({
    items: [] as AssistanceObjectCommunication[],
    itemMessageIds: [] as string[],
    newItems: 0 as number,
    groups: [] as AssistanceObjectCommunication[],
    assistanceIdToCurrentPhaseMatching: {} as GenericStringKeyToAnyValueMapping,
    assistanceIdToTypeMatching: {} as GenericStringKeyToAnyValueMapping,
    idsRequested: [] as string[],
    typeToDataMatching: {} as GenericStringKeyToAnyValueMapping,
    typesRequested: [] as string[],
    messageToSend: ''
  }),
  actions: {
    clearItems() {
      this.items = [];
      this.itemMessageIds = [];
      this.newItems = 0;
      this.groups = [];
      this.assistanceIdToCurrentPhaseMatching = {};
      this.assistanceIdToTypeMatching = {};
      this.idsRequested = [];
      this.typeToDataMatching = {};
      this.typesRequested = [];
      this.messageToSend = '';
    },
    setItems(items: AssistanceObjectCommunication[]) {
      this.items = [];
      items.forEach((item: AssistanceObjectCommunication) => {
        this.addItem(item);
      });
    },
    addItem(assistanceObject: AssistanceObjectCommunication) {
      const messageId = assistanceObject.messageId;
      // only push or check items that do not already exist (for the check, the messageId must exist)
      if (!messageId || !this.itemMessageIds.includes(messageId)) {
        if (messageId) {
          this.itemMessageIds.push(messageId);
        }
        let itemToIterate = true;
        const paramList: string[] = [];
        assistanceObject.parameters?.forEach((param) => {
          if (['operation', 'peer_solution', 'solution_template', 'solution_response', 'state_update_response'].includes(param.key)) {
            itemToIterate = false;
          } else {
            paramList.push(param.key);
          }
        });
        if (itemToIterate) {
          // check parameters without taking into account 'message'
          // default to 'message', if no result was found
          const paramListWithoutMessages = paramList.filter(param => param !== 'message');
          assistanceObject.type = paramListWithoutMessages?.length > 0 ? paramListWithoutMessages[paramListWithoutMessages.length - 1] : 'message';
          // Only push first occurrence of state_updates
          if (assistanceObject.type === 'state_update') {
            const aId = assistanceObject.aId;
            const phaseNumber = parameterValue(assistanceObject, 'state_update')?.phase ?? 0;
            if (aId && (!this.assistanceIdToCurrentPhaseMatching[aId] || phaseNumber > this.assistanceIdToCurrentPhaseMatching[aId])) {
              this.assistanceIdToCurrentPhaseMatching[aId] = phaseNumber;
              this.items.push(assistanceObject);
            }
          } else {
            this.items.push(assistanceObject);
            // new items unequal state_update are count into newItems, if the dialog is hidden
            if (!useDisplayStore().dialogOpen) {
              this.newItems += 1;
            }
          }
        }
        this.checkForTypeMatching(assistanceObject);
        this.addOrRemoveGroup(assistanceObject);
      }
    },
    checkForTypeMatching(assistanceObject: AssistanceObjectCommunication) {
      if (assistanceObject.aId && !this.idsRequested.includes(assistanceObject.aId) && !this.assistanceIdToTypeMatching[assistanceObject.aId]) {
        // the assistanceType should be part of the assistanceObject
        if (assistanceObject.assistanceType) {
          this.idsRequested.push(assistanceObject.aId);
          if (assistanceObject.aId) {
            const typeKey = assistanceObject.assistanceType;
            this.assistanceIdToTypeMatching[assistanceObject.aId] = typeKey;
            this.checkTypeKeyData(typeKey);
          }
        }
        // otherwise, request it manually
        else {
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
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageExchangeStore, import.meta.hot));
}
