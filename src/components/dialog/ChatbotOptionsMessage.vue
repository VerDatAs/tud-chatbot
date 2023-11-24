<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { Option } from '@/components/types/option';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export default {
  components: {
    ChatbotIcon
  },
  props: {
    botImagePath: {
      type: String,
      required: false
    },
    message: {
      type: AssistanceObjectCommunication,
      required: true
    }
  },
  emits: ['selectOption'],
  methods: {
    parameterValue(message: AssistanceObjectCommunication, key: string) {
      // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
      return message.parameters?.find((param) => param.key === key)?.value ?? '';
    },
    selectOption(option: Option) {
      const responseOption: Option = new Option('options_response', option.key);
      const responseObject: AssistanceObjectCommunication = new AssistanceObjectCommunication([responseOption]);
      responseObject.aId = this.message.aId;
      responseObject.aoId = this.message.aoId;
      this.$emit('selectOption', responseObject);
    }
  }
};
</script>

<template>
  <ChatbotIcon :botImagePath="botImagePath" v-if="botImagePath" />
  <div class="messageContainer">
    {{ parameterValue(message, 'message') }}
    <hr />
    <button
      class="btn btn-default"
      style="display: block; margin-bottom: 5px; width: 100%"
      v-for="option in parameterValue(message, 'options')"
      @click="selectOption(option)"
      :key="message.aId + option.key"
    >
      {{ option.value }}
    </button>
  </div>
</template>
