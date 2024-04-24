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
    isWebSocketConnected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reconnectWebSocket'],
  methods: {
    /**
     * Request that the WebSocket should be reconnected.
     */
    reconnectWebSocket() {
      this.$emit('reconnectWebSocket', true);
    }
  }
};
</script>

<template>
  <div class="onlineIndicator">
    <div class="onlineBubble" title="WebSocket verbunden" v-if="isWebSocketConnected"></div>
    <div class="offlineBubble" title="WebSocket getrennt" @click="reconnectWebSocket()" v-else></div>
  </div>
</template>

<style lang="scss" scoped>
.onlineIndicator {
  display: inline-block;
  margin-left: 1px;
  margin-bottom: -2px;
  z-index: 101;

  .onlineBubble {
    background: #198754;
    padding: 7px;
    max-height: 15px;
    border-radius: 7px;
  }

  .offlineBubble {
    border: 1px solid #bbb;
    padding: 6px;
    max-height: 13px;
    border-radius: 7px;
    cursor: pointer;
  }
}
</style>
