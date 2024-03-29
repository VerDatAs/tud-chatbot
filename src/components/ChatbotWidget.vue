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
export default {
  props: {
    botImagePath: String,
    initialLoadAfterLogin: {
      type: Boolean,
      default: false
    },
    newItems: {
      type: Number,
      default: 0
    }
  },
  methods: {
    /**
     * Fade in the chatbot widget from the right.
     */
    fadeIn() {
      document.getElementById('chatbotWidget')?.classList.add('animate__fadeInRight');
    },
    /**
     * Fade out the chatbot widget to the right.
     */
    fadeOut() {
      document.getElementById('chatbotWidget')?.classList.add('animate__fadeOutRight');
    }
  }
};
</script>

<template>
  <div id="chatbotWidget" class="animate__animated">
    <div id="notificationBubble" v-if="newItems > 0 && !initialLoadAfterLogin">
      {{ newItems }}
    </div>
    <img :src="botImagePath" width="35" height="35" alt="Chatbot Icon" />
  </div>
</template>

<style lang="scss" scoped>
#chatbotWidget {
  position: relative;
  margin-right: 40px;
  margin-bottom: 40px;
  max-width: 59px;
  max-height: 59px;
  padding: 10px;
  background: #333;
  border-radius: 15px;
  border: 2px solid #000;
  transition:
    width 1s,
    height 1s;

  &:hover {
    cursor: pointer;
  }

  #notificationBubble {
    position: absolute;
    top: -8px;
    right: -8px;
    padding: 3px 8px;
    border-radius: 50%;
    background: #ee2336;
    color: #fff;
    font-size: 11px;
  }
}
</style>
