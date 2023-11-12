<script lang="ts">
import ChatbotIcon from '@/components/ChatbotIcon.vue';

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
    message: {
      type: String,
      required: true
    }
  }
};
</script>

<template>
  <ChatbotIcon :botImagePath="botImagePath" v-if="incoming && botImagePath" />
  <span>
    {{ message }}
  </span>
</template>
