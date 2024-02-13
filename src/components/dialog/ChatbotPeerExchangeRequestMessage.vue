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
    acceptExchangeCommandEnabled: {
      type: Boolean,
      default: false
    },
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
    },
    botImagePath: {
      type: String,
      required: false
    },
    relatedResponseExists: {
      type: Boolean,
      default: false
    },
    relatedStateUpdateExists: {
      type: Boolean,
      default: false
    }
  },
  emits: ['sendResponse'],
  computed: {
    disableButton() {
      return !this.acceptExchangeCommandEnabled || this.relatedResponseExists || this.relatedStateUpdateExists;
    },
    validTimestamp() {
      return this.assistanceObject.timestamp && formatDate(this.assistanceObject.timestamp) !== 'Invalid date';
    }
  },
  methods: {
    // https://stackoverflow.com/a/60617142
    formatDate,
    parameterValue,
    acceptRequest() {
      const responseObject: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      responseObject.aId = this.assistanceObject.aId;
      responseObject.parameters = [new AssistanceParameter('peer_exchange_request_response', 'accepted')];
      this.$emit('sendResponse', responseObject);
    }
  }
};
</script>

<template>
  <ChatbotIcon
    :botImagePath="botImagePath"
    :is-group-message="true"
    v-if="botImagePath"
  />
  <div class="messageContainer">
    {{ parameterValue(assistanceObject, 'message') }}
    <hr>
    <button class="btn btn-primary" :disabled="disableButton" @click="acceptRequest()">Akzeptieren</button>
    <div class="messageTimestamp" v-if="validTimestamp">{{ formatDate(assistanceObject.timestamp) }}</div>
  </div>
</template>
