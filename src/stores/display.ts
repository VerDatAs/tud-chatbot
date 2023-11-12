import { defineStore, acceptHMRUpdate } from 'pinia';

export const useDisplayStore = defineStore({
  id: 'display',
  state: () => ({
    dialogOpen: false as boolean,
  }),
  actions: {
    changeDialogOpen(dialogOpen: boolean) {
      this.dialogOpen = dialogOpen;
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDisplayStore, import.meta.hot))
}
