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

import { defineStore, acceptHMRUpdate } from 'pinia';

const defaultTemplate =
  'Anforderungen des Szenarios:\n*\n*\n*\n\nRanking der Cloud-Provider:\n*\n*\n*\n\nAuswahl des am besten geeigneten Providers:\n*\n*\n*\n\nBegründung der Auswahl:\n*\n*\n*\n';

/**
 * Pinia store for all notes and peer solution related information.
 */
export const useNotesAndPeerSolutionStore = defineStore({
  id: 'notesAndPeerSolution',
  state: () => ({
    notes: defaultTemplate as string,
    peerSolution: defaultTemplate as string,
    template: defaultTemplate as string
  }),
  actions: {
    /**
     * Reset the notes by the latest provided template.
     */
    resetNotes() {
      this.notes = this.template;
    },
    /**
     * Overwrite the existing value of the notes by a given input.
     * @param {string} notes
     */
    setNotes(notes: string) {
      this.notes = notes;
    },
    /**
     * Overwrite the existing value of the peer solution by a given input.
     * @param {string} peerSolution
     */
    setPeerSolution(peerSolution: string) {
      this.peerSolution = peerSolution;
    },
    /**
     * Overwrite the existing value of the solution response by a given input, if it was not already modified.
     * @param {string} solutionResponse
     */
    setSolutionResponse(solutionResponse: string) {
      // Only overwrite the notes, if those are equal to the template
      if (this.notes === this.template || this.notes === defaultTemplate) {
        this.setNotes(solutionResponse);
      }
    },
    /**
     * Overwrite the default template and load it into the notes by a given input, if those were not already modified.
     * @param {string} templateString
     */
    setTemplate(templateString: string) {
      this.template = templateString;
      // Check, whether the notes view still contains the defaultTemplate. If true, reset the notes.
      // Do not always reset the notes, as logout and login again will reset the notes, if no solution_response was sent.
      if (this.notes === defaultTemplate) {
        this.resetNotes();
      }
    }
  },
  persist: true
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotesAndPeerSolutionStore, import.meta.hot));
}
