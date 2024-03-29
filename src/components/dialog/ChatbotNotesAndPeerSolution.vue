<!--
Chatbot for the assistance system developed as part of the VerDatAs project
Copyright (C) 2023-2024 TU Dresden (Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">
import ModalDialog from '@/components/shared/ModalDialog.vue';
import { useDisplayStore } from '@/stores/display';
import { useNotesAndPeerSolutionStore } from '@/stores/notesAndPeerSolution';
import { createConfirmDialog } from 'vuejs-confirm-dialog';

export default {
  data: () => ({
    displayStore: useDisplayStore(),
    notesAndPeerSolutionStore: useNotesAndPeerSolutionStore(),
    dialog: null as any,
    sendingInProgress: false as boolean
  }),
  props: {
    notes: String,
    notesAndPeerSolutionVisible: {
      type: Boolean,
      default: false
    },
    notesEnabled: {
      type: Boolean,
      default: false
    },
    notesCommandEnabled: {
      type: Boolean,
      default: false
    },
    notesInputEnabled: {
      type: Boolean,
      default: false
    },
    peerSolution: String,
    peerSolutionEnabled: {
      type: Boolean,
      default: false
    },
    peerSolutionCommandEnabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /**
     * Return the solution template as the placeholder of the notes.
     */
    notesPlaceholder() {
      return this.notesAndPeerSolutionStore.template;
    }
  },
  emits: [
    'acknowledgePeerSolution',
    'sendSolution'
  ],
  methods: {
    /**
     * Change the opening state of the notes and peer solution into a given value.
     * @param {boolean} notesAndPeerSolutionOpen
     */
    toggleNotes(notesAndPeerSolutionOpen: boolean) {
      if (this.notesEnabled) {
        this.displayStore.changeNotesAndPeerSolutionOpen(notesAndPeerSolutionOpen);
      }
    },
    /**
     * Handle the input of the notes textarea.
     * @param {Event} event
     */
    notesInput(event: Event) {
      // Related issue for specifying the correct type for the event:
      // https://stackoverflow.com/questions/44321326/property-value-does-not-exist-on-type-eventtarget-in-typescript
      const text = (event.target as HTMLInputElement)?.value;
      this.notesAndPeerSolutionStore.setNotes(text);
    },
    /**
     * Attempt to reset the notes by opening a confirmation dialog.
     */
    resetNotes() {
      // Only allow resetting notes, if the input is enabled
      if (this.notesInputEnabled) {
        // @ts-ignore
        this.dialog = createConfirmDialog(ModalDialog, {
          title: 'Notizen zurücksetzen',
          question: 'Sind Sie sich sicher, dass Sie die Notizen zurücksetzen wollen?',
          confirmTxt: 'Bestätigen',
          cancelTxt: 'Abbrechen'
        });
        this.dialog.reveal();
        this.dialog.onConfirm(() => {
          this.notesAndPeerSolutionStore.resetNotes();
        });
        this.dialog.onCancel(() => {
          this.dialog.close();
        });
      }
    },
    /**
     * Attempt to send the solution by opening a confirmation dialog.
     */
    sendSolution() {
      // @ts-ignore
      this.dialog = createConfirmDialog(ModalDialog, {
        title: 'Lösung abschicken',
        question:
          'Sind Sie sich sicher, dass Sie die Lösung abschicken wollen? Dieser Schritt kann nicht rückgängig gemacht werden.',
        confirmTxt: 'Bestätigen',
        cancelTxt: 'Abbrechen'
      });
      this.dialog.reveal();
      this.dialog.onConfirm(() => {
        if (this.notesAndPeerSolutionStore.notes?.length <= 9999) {
          this.sendingInProgress = true;
          this.$emit('sendSolution', this.notesAndPeerSolutionStore.notes);
          setTimeout(() => {
            this.sendingInProgress = false;
          }, 5000);
        }
      });
      this.dialog.onCancel(() => {
        this.dialog.close();
      });
    },
    /**
     * Attempt to acknowledge the peer solution by opening a confirmation dialog.
     */
    acknowledgePeerSolution() {
      // @ts-ignore
      this.dialog = createConfirmDialog(ModalDialog, {
        title: 'Weiterschalten',
        question: 'Sind Sie sich sicher, dass Sie fortfahren wollen?',
        confirmTxt: 'Bestätigen',
        cancelTxt: 'Abbrechen'
      });
      this.dialog.reveal();
      this.dialog.onConfirm(() => {
        this.sendingInProgress = true;
        this.$emit('acknowledgePeerSolution', true);
        setTimeout(() => {
          this.sendingInProgress = false;
        }, 5000);
      });
      this.dialog.onCancel(() => {
        this.dialog.close();
      });
    }
  }
};
</script>

<template>
  <div id="chatbotNotesAndPeerSolution" :class="!notesEnabled ? 'disabledState' : ''">
    <div class="notesIcon" @click="toggleNotes(true)" v-if="!notesAndPeerSolutionVisible">
      <!-- Icon for note taking: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Aedit_note%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
      <!-- The Google Material Design Icons are licensed under Apache License 2.0 -->
      <svg xmlns="http://www.w3.org/2000/svg" height="32" width="32" viewBox="0 -960 960 960">
        <path
          d="M160-400v-80h280v80H160Zm0-160v-80h440v80H160Zm0-160v-80h440v80H160Zm360 560v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T863-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z"
        />
      </svg>
    </div>
    <div class="notesIcon padding5px" @click="toggleNotes(false)" v-if="notesAndPeerSolutionVisible">
      <!-- Icon for arrows right: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Akeyboard_double_arrow_right%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
      <!-- The Google Material Design Icons are licensed under Apache License 2.0 -->
      <svg xmlns="http://www.w3.org/2000/svg" height="26" width="26" viewBox="0 -960 960 960">
        <path
          d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"
        />
      </svg>
    </div>
    <div class="messageContainer notesContainer" v-if="notesAndPeerSolutionVisible">
      <div class="header">
        <h4>Notizen:</h4>
        <div class="resetButton" :class="!notesInputEnabled ? 'disabledState' : ''" @click="resetNotes()">
          <!-- Icon for delete: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Adelete%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
          <!-- The Google Material Design Icons are licensed under Apache License 2.0 -->
          <svg xmlns="http://www.w3.org/2000/svg" height="21" width="21" viewBox="0 -960 960 960">
            <path
              d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
            />
          </svg>
        </div>
      </div>
      <textarea
        :placeholder="notesPlaceholder"
        :value="notes"
        @input="notesInput"
        :maxlength="9999"
        :disabled="!notesEnabled || !notesInputEnabled"
      ></textarea>
      <div class="footer text-right">
        <button @click="sendSolution()" :disabled="!notesCommandEnabled || sendingInProgress">Absenden</button>
      </div>
    </div>
    <div class="messageContainer peerSolutionContainer" v-if="notesAndPeerSolutionVisible && peerSolutionEnabled">
      <div class="header">
        <h4>Lösung des Peers:</h4>
      </div>
      <textarea :placeholder="notesPlaceholder" :value="peerSolution" disabled></textarea>
      <div class="footer text-right">
        <button @click="acknowledgePeerSolution()" :disabled="!peerSolutionCommandEnabled || sendingInProgress">
          Weiter
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notesIcon {
  width: 36px;
  height: 36px;
  padding: 2px;
  background: #ccc;
  position: absolute;
  left: -23px;
  border-radius: 3px;
  border: 1px solid #bbb;
  top: calc(25%);
  cursor: pointer;
  z-index: 100;

  &.padding5px {
    padding: 5px;
  }
}

.disabledState {
  // This currently never applies, as the notes icon is not displayed, when being disabled
  .notesIcon {
    background: #eee !important;
    cursor: not-allowed !important;
  }
  &.resetButton {
    cursor: not-allowed !important;
    svg {
      fill: #979797 !important;
    }
  }
}

.messageContainer {
  width: 275px;
  height: 100%;
  padding: 8px;
  background: #eee;
  position: absolute;
  border: 1px solid #bbb;
  top: 0;
  z-index: 99;

  &.notesContainer {
    left: -275px;
  }

  &.peerSolutionContainer {
    left: -550px;
  }

  .header {
    height: 32px;
    padding: 3px 0 8px 5px;
    position: relative;

    h4 {
      margin-top: 0;
      margin-bottom: 0;
    }

    .resetButton {
      position: absolute;
      top: 1px;
      right: 5px;
      cursor: pointer;
    }
  }

  textarea {
    width: 100%;
    height: calc(100% - 70px);
    padding: 10px;
    color: #333;
    font-family: monospace;
    font-size: 13px;
    letter-spacing: 0.1em;
    border: 1px solid #bbb;
    border-radius: 3px;
    outline: none;
    resize: none;

    &:disabled,
    &[disabled] {
      cursor: not-allowed;
    }
  }

  .footer {
    height: 38px;
    padding: 3px 0;

    button {
      padding: 4px 7px;
      width: 100%;

      &:disabled,
      &[disabled] {
        cursor: not-allowed;
      }
    }
  }
}
</style>
