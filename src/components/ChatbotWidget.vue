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
    fadeIn() {
      document.getElementById('chatbotWidget')?.classList.add('animate__fadeInRight');
    },
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
  margin-right: 40px;
  margin-bottom: 40px;
  max-width: 59px;
  // TODO: Check, why this does not work properly in development mode
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
    left: -8px;
    padding: 3px 8px;
    border-radius: 50%;
    background: #ee2336;
    color: #fff;
    font-size: 11px;
  }
}
</style>
