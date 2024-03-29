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

import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { GenericStringKeyToAnyValueMapping } from '@/components/types/generic-string-key-to-any-value-mapping';
import { useChatbotDataStore } from '@/stores/chatbotData';
import { useDisplayStore } from '@/stores/display';
import { checkForKeyPresence, parameterValue } from '@/util/assistanceObjectHelper';
import axios from 'axios';
import { defineStore, acceptHMRUpdate } from 'pinia';

/**
 * Pinia store for all assistance messages related information.
 */
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
    /**
     * Reset the variables of the entire store to their default values.
     */
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
    /**
     * Add a given assistance object into the store and check for executing several actions.
     * @param {AssistanceObjectCommunication} assistanceObject
     */
    addItem(assistanceObject: AssistanceObjectCommunication) {
      const messageId = assistanceObject.messageId;
      // Only push or check items that do not already exist (for the check, the messageId must exist)
      if (!messageId || !this.itemMessageIds.includes(messageId)) {
        if (messageId) {
          this.itemMessageIds.push(messageId);
        }
        let itemToIterate = true;
        const paramList: string[] = [];
        const keysToNotIterate = [
          'operation',
          'peer_solution',
          'solution_response',
          'solution_template',
          'state_update_response'
        ];
        assistanceObject.parameters?.forEach((param) => {
          if (keysToNotIterate.includes(param.key)) {
            itemToIterate = false;
          } else {
            paramList.push(param.key);
          }
        });
        if (itemToIterate) {
          // Check parameters without taking into account "message"
          // Default to "message", if no result was found
          const paramListWithoutMessages = paramList.filter((param) => param !== 'message');
          assistanceObject.type =
            paramListWithoutMessages?.length > 0
              ? paramListWithoutMessages[paramListWithoutMessages.length - 1]
              : 'message';
          // For state_updates, additional checks are required
          if (assistanceObject.type === 'state_update') {
            const aId = assistanceObject.aId;
            const phaseNumber = parameterValue(assistanceObject, 'state_update')?.phase ?? 0;
            // Only push the first occurrence of state_updates
            if (
              aId &&
              (!this.assistanceIdToCurrentPhaseMatching[aId] ||
                phaseNumber > this.assistanceIdToCurrentPhaseMatching[aId])
            ) {
              this.assistanceIdToCurrentPhaseMatching[aId] = phaseNumber;
              this.items.push(assistanceObject);
            }
          } else {
            this.items.push(assistanceObject);
            // New items unequal state_updates are count into newItems, if the dialog is hidden
            if (!useDisplayStore().dialogOpen) {
              this.newItems += 1;
            }
          }
        }
        this.checkForTypeMatching(assistanceObject);
        this.addOrRemoveGroup(assistanceObject);
      }
    },
    /**
     * Check, whether a matching for the type of a given assistance object exists.
     * @param {AssistanceObjectCommunication} assistanceObject
     */
    checkForTypeMatching(assistanceObject: AssistanceObjectCommunication) {
      if (
        assistanceObject.aId &&
        !this.idsRequested.includes(assistanceObject.aId) &&
        !this.assistanceIdToTypeMatching[assistanceObject.aId]
      ) {
        // The assistanceType should be part of the assistanceObject
        if (assistanceObject.assistanceType) {
          this.idsRequested.push(assistanceObject.aId);
          if (assistanceObject.aId) {
            const typeKey = assistanceObject.assistanceType;
            this.assistanceIdToTypeMatching[assistanceObject.aId] = typeKey;
            this.checkTypeKeyData(typeKey);
          }
        }
        // Otherwise, request it manually
        else {
          const url = useChatbotDataStore().data.backendUrl + '/api/v1/assistance/' + assistanceObject.aId + '/type';
          const authHeader = {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: 'Bearer ' + useChatbotDataStore().data.token
          };
          this.idsRequested.push(assistanceObject.aId);

          axios.get(url, { headers: authHeader }).then((data: any) => {
            if (assistanceObject.aId) {
              const typeKey = data.data?.typeKey;
              this.assistanceIdToTypeMatching[assistanceObject.aId] = typeKey;
              this.checkTypeKeyData(typeKey);
            }
          });
        }
      }
    },
    /**
     * Check, whether data for a given type key exists.
     * @param {string} typeKey
     */
    checkTypeKeyData(typeKey: string) {
      if (!this.typesRequested.includes(typeKey) && !this.typeToDataMatching[typeKey]) {
        const url = useChatbotDataStore().data.backendUrl + '/api/v1/assistance/types/' + typeKey;
        const authHeader = {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: 'Bearer ' + useChatbotDataStore().data.token
        };
        this.typesRequested.push(typeKey);

        axios.get(url, { headers: authHeader }).then((data: any) => {
          this.typeToDataMatching[typeKey] = data.data;
        });
      }
    },
    /**
     * When specific keys are present, add or remove an assistance object from the groups list.
     * @param {AssistanceObjectCommunication} assistanceObject
     */
    addOrRemoveGroup(assistanceObject: AssistanceObjectCommunication) {
      if (checkForKeyPresence(assistanceObject, 'related_users')) {
        this.groups.push(assistanceObject);
      } else if (
        parameterValue(assistanceObject, 'state_update')?.status === 'completed' ||
        parameterValue(assistanceObject, 'state_update_response')?.status === 'completed'
      ) {
        this.groups = this.groups.filter(
          (item) => item.aId !== assistanceObject.aId || item.aoId !== assistanceObject.aoId
        );
      }
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageExchangeStore, import.meta.hot));
}
