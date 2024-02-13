<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
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
    linkValue: {
      type: String,
      required: false
    },
    incoming: {
      type: Boolean,
      default: false
    },
    keyToDisplay: {
      type: String,
      required: true
    },
    relatedGroup: {
      type: AssistanceObjectCommunication,
      required: false,
      default: null
    },
    relatedOptions: {
      type: AssistanceObjectCommunication,
      default: null
    }
  },
  computed: {
    isUserMessage() {
      return this.keyToDisplay === 'user_message'
    },
    numberOfGroupMembers() {
      if (this.relatedGroup) {
        return parameterValue(this.relatedGroup, 'related_users')?.length ?? 0;
      } else {
        return 0;
      }
    },
    validTimestamp() {
      return this.assistanceObject.timestamp && formatDate(this.assistanceObject.timestamp) !== 'Invalid date';
    }
  },
  methods: {
    getAssistanceObjectText() {
      let textToDisplay = parameterValue(this.assistanceObject, this.keyToDisplay);
      // TODO: Remove workaround if related items were added for this type
      if (this.keyToDisplay === 'peer_exchange_request_response' && textToDisplay === 'accepted') {
        textToDisplay = 'Akzeptiert';
      }
      // Properly display the value of the options_response
      if (this.keyToDisplay === 'options_response' && this.relatedOptions?.parameters) {
        const options = this.relatedOptions.parameters?.find((param) => param.key === 'options')?.value;
        if (options) {
          const optionValue = options.find((val: AssistanceParameter) => val.key === textToDisplay)?.value;
          if (optionValue) {
            textToDisplay = optionValue;
          }
        }
      }
      return textToDisplay;
    },
    formatDate
  }
};
</script>

<template>
  <ChatbotIcon
    :bot-image-path="botImagePath"
    :is-group-message="!!relatedGroup || isUserMessage"
    :is-link-message="!!linkValue"
    :number-of-group-members="numberOfGroupMembers"
    v-if="incoming && botImagePath"
  />
  <div class="messageContainer">
    <span>{{ getAssistanceObjectText() }}</span>
    <div v-if="!!linkValue">
      <hr>
      <a :href="linkValue" target="_blank">{{ linkValue }}</a>
    </div>
    <div class="messageTimestamp" v-if="validTimestamp">{{ formatDate(assistanceObject.timestamp) }}</div>
  </div>
</template>

<style lang="scss" scoped>
  hr {
    margin-top: 12px;
    margin-bottom: 12px;
  }
</style>
