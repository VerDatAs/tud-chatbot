import { defineStore, acceptHMRUpdate } from 'pinia';

const defaultTemplate = 'Anforderungen des Szenarios:\n*\n*\n*\n\nRanking der Cloud-Provider:\n*\n*\n*\n\nAuswahl des am besten geeigneten Providers:\n*\n*\n*\n\nBegründung der Auswahl:\n*\n*\n*\n';

export const useNotesAndPeerSolutionStore = defineStore({
  id: 'notesAndPeerSolution',
  state: () => ({
    notes: defaultTemplate as string,
    peerSolution: defaultTemplate as string,
    template: defaultTemplate as string
  }),
  actions: {
    resetNotes() {
      this.notes = this.template;
    },
    setNotes(notes: string) {
      this.notes = notes;
    },
    setPeerSolution(peerSolution: string) {
      this.peerSolution = peerSolution;
    },
    setSolutionResponse(solutionResponse: string) {
      // only overwrite the notes, if those are equal to the template
      if (this.notes === this.template || this.notes === defaultTemplate) {
        this.setNotes(solutionResponse);
      }
    },
    setTemplate(templateString: string) {
      this.template = templateString;
      // check, whether the notes still contain the defaultTemplate -> if true, reset the notes
      // do not always reset the notes, as logout and login again will reset the notes, if no solution_response was sent.
      if (this.notes === defaultTemplate) {
        this.resetNotes();
      }
      // TODO: Think about supporting multiple consecutive collaborations
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotesAndPeerSolutionStore, import.meta.hot));
}
