import { defineStore, acceptHMRUpdate } from 'pinia';

const template = 'Definition des Problems:\n*\n*\n*\n\nAnalyse der Ursache:\n*\n*\n*\n\nVorschläge zur Lösung:\n*\n*\n*\n\nBewertung der Vorschläge:\n*\n*\n*\n';

export const useNotesStore = defineStore({
  id: 'notes',
  state: () => ({
    text: template as string
  }),
  actions: {
    resetNotes() {
      this.text = template;
    },
    setNotes(notes: string) {
      this.text = notes;
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotesStore, import.meta.hot));
}
