<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';

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
    },
    relatedOptions: {
      type: AssistanceObjectCommunication,
      default: null
    }
  },
  methods: {
    getOptionText(text: string) {
      let textToDisplay = text;
      const options = this.relatedOptions?.parameters?.find((param) => param.key === 'options')?.value;
      if (options) {
        const optionValue = options.find((val: AssistanceParameter) => val.key === text)?.value;
        if (optionValue) {
          textToDisplay = optionValue;
        }
      }
      return textToDisplay;
    }
  }
};
</script>

<template>
  <ChatbotIcon :botImagePath="botImagePath" v-if="incoming && botImagePath" />
  <div class="messageContainer">
    {{ getOptionText(text) }}
  </div>
</template>
