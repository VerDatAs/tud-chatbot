import { defineStore, acceptHMRUpdate } from 'pinia';

export const useDisplayStore = defineStore({
  id: 'display',
  state: () => ({
    dialogOpen: false as boolean,
    notesAndPeerSolutionOpen: false as boolean
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
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDisplayStore, import.meta.hot));
}
