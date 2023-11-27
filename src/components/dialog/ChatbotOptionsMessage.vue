<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { Option } from '@/components/types/option';

export default {
  components: {
    ChatbotIcon
  },
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
    },
    botImagePath: {
      type: String,
      required: false
    },
    isLastItem: {
      type: Boolean,
      default: false
    }
  },
  emits: ['selectOption'],
  methods: {
    parameterValue(assistanceObject: AssistanceObjectCommunication, key: string) {
      // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
      return assistanceObject.parameters?.find((param) => param.key === key)?.value ?? '';
    },
    selectOption(option: Option) {
      const responseOption: Option = new Option('options_response', option.key);
      const responseObject: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      responseObject.aId = this.assistanceObject.aId;
      responseObject.aoId = this.assistanceObject.aoId;
      responseObject.parameters = [responseOption];
      this.$emit('selectOption', responseObject);
    }
  }
};
</script>

<template>
  <ChatbotIcon :botImagePath="botImagePath" v-if="botImagePath" />
  <div class="messageContainer">
    {{ parameterValue(assistanceObject, 'message') }}
    <hr />
    <button
      class="btn btn-default"
      style="display: block; margin-bottom: 5px; width: 100%"
      v-for="option in parameterValue(assistanceObject, 'options')"
      @click="selectOption(option)"
      :key="assistanceObject.aId + option.key"
      :disabled="!isLastItem"
    >
      {{ option.value }}
    </button>
  </div>
</template>
