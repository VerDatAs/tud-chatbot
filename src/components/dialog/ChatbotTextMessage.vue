<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';

export default {
  components: {
    ChatbotIcon
  },
  props: {
    botImagePath: {
      type: String,
      required: false
    },
    incoming: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      required: true
    }
  }
};
</script>

<template>
  <ChatbotIcon :botImagePath="botImagePath" v-if="incoming && botImagePath" />
  <div class="messageContainer">
    {{ text }}
  </div>
</template>
