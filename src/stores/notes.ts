import { defineStore, acceptHMRUpdate } from 'pinia';

const defaultTemplate = 'Definition des Problems:\n*\n*\n*\n\nAnalyse der Ursache:\n*\n*\n*\n\nVorschläge zur Lösung:\n*\n*\n*\n\nBewertung der Vorschläge:\n*\n*\n*\n';

export const useNotesStore = defineStore({
  id: 'notes',
  state: () => ({
    text: defaultTemplate as string,
    template: defaultTemplate as string
  }),
  actions: {
    resetNotes() {
      this.text = this.template;
    },
    setNotes(notes: string) {
      this.text = notes;
    },
    setTemplate(templateString: string) {
      this.template = templateString;
      // if the template is sent, reset the notes (to it).
      // this ensures executing the scenario multiple times correctly.
      // an alternative could be to keep the existing solution and just display a hint to reload.
      this.resetNotes();
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotesStore, import.meta.hot));
}
