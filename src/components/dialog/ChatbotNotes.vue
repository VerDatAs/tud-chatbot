<script lang="ts">
import { useDisplayStore } from '@/stores/display';
import { useNotesStore } from '@/stores/notes';

export default {
  data: () => ({
    displayStore: useDisplayStore(),
    notesStore: useNotesStore()
  }),
  props: {
    notes: String,
    notesVisible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleNotes(notesOpen: boolean) {
      this.displayStore.changeNotesOpen(notesOpen);
    },
    notesInput(event: any) {
      const text = event.target.value;
      this.notesStore.setNotes(text);
    }
  }
};
</script>

<template>
  <div id="chatbotNotes">
    <div class="notesIcon" @click="toggleNotes(true)" v-if="!notesVisible">
      <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" style="color: #fff">
        <path
          d="M160-400v-80h280v80H160Zm0-160v-80h440v80H160Zm0-160v-80h440v80H160Zm360 560v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T863-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z"
        />
      </svg>
    </div>
    <div class="notesIcon" @click="toggleNotes(false)" v-if="notesVisible" style="padding: 5px">
      <svg xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 -960 960 960" width="26">
        <path
          d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"
        />
      </svg>
    </div>
    <div class="notesContainer" v-if="notesVisible">
      <textarea placeholder="Your notes come here ..." :value="notes" @input="notesInput"></textarea>
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
}

.notesContainer {
  width: 250px;
  height: 100%;
  padding: 8px;
  background: #eee;
  position: absolute;
  left: -250px;
  border: 1px solid #bbb;
  top: 0;
  z-index: 99;

  textarea {
    width: 100%;
    height: 100%;
    padding: 10px;
    color: #333;
    font-family: monospace;
    font-size: 13px;
    letter-spacing: 0.1em;
    border: 1px solid #bbb;
    border-radius: 3px;
    outline: none;
  }
}
</style>
