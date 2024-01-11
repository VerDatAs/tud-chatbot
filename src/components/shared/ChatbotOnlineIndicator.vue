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
    reconnectWebSocket() {
      this.$emit('reconnectWebSocket', true);
    }
  }
};
</script>

<template>
  <div class="onlineIndicator">
    <div class="onlineBubble" v-if="isWebSocketConnected"></div>
    <div class="offlineBubble" @click="reconnectWebSocket()" v-else></div>
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
