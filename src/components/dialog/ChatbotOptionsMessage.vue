<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { Option } from '@/components/types/option';
import { formatDate, parameterValue } from '@/util/assistanceObjectHelper';

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
  computed: {
    validTimestamp() {
      return this.assistanceObject.timestamp && formatDate(this.assistanceObject.timestamp) !== 'Invalid date';
    }
  },
  methods: {
    // https://stackoverflow.com/a/60617142
    formatDate,
    parameterValue,
    selectOption(option: Option) {
      const responseOption: Option = new Option('options_response', option.key);
      const responseObject: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      responseObject.aId = this.assistanceObject.aId;
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
      class="btn btn-default option-btn"
      v-for="option in parameterValue(assistanceObject, 'options')"
      @click="selectOption(option)"
      :key="assistanceObject.aId + option.key"
      :disabled="!isLastItem"
    >
      {{ option.value }}
    </button>
    <div class="messageTimestamp" v-if="validTimestamp">{{ formatDate(assistanceObject.timestamp) }}</div>
  </div>
</template>

<style lang="scss" scoped>
  .option-btn {
    display: block;
    margin-bottom: 5px;
    width: 100%;
    max-width: 100%;
    // wrap text in button: https://stackoverflow.com/a/1194680
    white-space: normal;
  }
</style>
