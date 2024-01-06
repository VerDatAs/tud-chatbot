import { defineStore, acceptHMRUpdate } from 'pinia';

export const useNotesStore = defineStore({
  id: 'notes',
  state: () => ({
    text: 'Definition des Problems:\n*\n*\n*\n\nAnalyse der Ursache:\n*\n*\n*\n\nVorschläge zur Lösung:\n*\n*\n*\n\nBewertung der Vorschläge:\n*\n*\n*\n' as string
  }),
  actions: {
    setNotes(notes: string) {
      this.text = notes;
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotesStore, import.meta.hot));
}
