import { defineStore, acceptHMRUpdate } from 'pinia';
import type { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { parameterValue } from '@/util/assistanceObjectHelper';

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
    peerSolutionCommandEnabled: false as boolean,
    showStatisticsTab: false as boolean
  }),
  actions: {
    changeDialogOpen(dialogOpen: boolean) {
      this.dialogOpen = dialogOpen;
    },
    changeNotesAndPeerSolutionOpen(notesAndPeerSolutionOpen: boolean) {
      this.notesAndPeerSolutionOpen = notesAndPeerSolutionOpen;
    },
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
      this.showStatisticsTab = false;
    },
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
