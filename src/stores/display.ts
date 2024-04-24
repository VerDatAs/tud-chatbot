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

import type { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { parameterValue } from '@/util/assistanceObjectHelper';
import { defineStore, acceptHMRUpdate } from 'pinia';

/**
 * Pinia store for all display related information.
 */
export const useDisplayStore = defineStore({
  id: 'display',
  state: () => ({
    dialogOpen: false as boolean,
    notesAndPeerSolutionOpen: false as boolean,
    abortExchangeCommandEnabled: false as boolean,
    chatEnabled: false as boolean,
    notesEnabled: false as boolean,
    notesInputEnabled: false as boolean,
    notesCommandEnabled: false as boolean,
    optionsEnabled: false as boolean,
    peerSolutionEnabled: false as boolean,
    peerSolutionCommandEnabled: false as boolean
  }),
  actions: {
    /**
     * Reset the variables of the entire store to their default values.
     */
    resetValues() {
      this.dialogOpen = false;
      this.notesAndPeerSolutionOpen = false;
      this.abortExchangeCommandEnabled = false;
      this.chatEnabled = false;
      this.notesEnabled = false;
      this.notesInputEnabled = false;
      this.notesCommandEnabled = false;
      this.optionsEnabled = false;
      this.peerSolutionEnabled = false;
      this.peerSolutionCommandEnabled = false;
    },
    /**
     * Change the opening state of the dialog into a given value.
     * @param {boolean} dialogOpen
     */
    changeDialogOpen(dialogOpen: boolean) {
      this.dialogOpen = dialogOpen;
    },
    /**
     * Change the opening state of the view for the notes and peer solution into a given value.
     * @param {boolean} notesAndPeerSolutionOpen
     */
    changeNotesAndPeerSolutionOpen(notesAndPeerSolutionOpen: boolean) {
      this.notesAndPeerSolutionOpen = notesAndPeerSolutionOpen;
    },
    /**
     * Process a given assistance object containing a specific operation.
     * @param {AssistanceObjectCommunication} assistanceObject
     */
    processOperation(assistanceObject: AssistanceObjectCommunication) {
      switch (parameterValue(assistanceObject, 'operation')) {
        case 'enable_abort_exchange_command':
          this.abortExchangeCommandEnabled = true;
          break;
        case 'disable_abort_exchange_command':
          this.abortExchangeCommandEnabled = false;
          break;
        case 'enable_chat':
          this.chatEnabled = true;
          break;
        case 'disable_chat':
          this.chatEnabled = false;
          break;
        case 'enable_notes':
          this.notesEnabled = true;
          break;
        case 'disable_notes':
          this.notesEnabled = false;
          break;
        case 'enable_notes_input':
          this.notesInputEnabled = true;
          break;
        case 'disable_notes_input':
          this.notesInputEnabled = false;
          break;
        case 'enable_notes_command':
          this.notesCommandEnabled = true;
          break;
        case 'disable_notes_command':
          this.notesCommandEnabled = false;
          break;
        case 'enable_options':
          this.optionsEnabled = true;
          break;
        case 'disable_options':
          this.optionsEnabled = false;
          break;
        case 'enable_peer_solution':
          this.peerSolutionEnabled = true;
          break;
        case 'disable_peer_solution':
          this.peerSolutionEnabled = false;
          break;
        case 'enable_peer_solution_command':
          this.peerSolutionCommandEnabled = true;
          break;
        case 'disable_peer_solution_command':
          this.peerSolutionCommandEnabled = false;
          break;
        default:
          break;
      }
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDisplayStore, import.meta.hot));
}
