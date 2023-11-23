import { defineStore, acceptHMRUpdate } from 'pinia';

export const useNotesStore = defineStore({
  id: 'notes',
  state: () => ({
    text: '' as string
  }),
  actions: {
    setNotes(notes: string) {
      this.text = notes;
    },
    clearNotes() {
      this.text = '';
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotesStore, import.meta.hot));
}
