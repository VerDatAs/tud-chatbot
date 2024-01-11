<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { formatDate, parameterValue } from '@/util/assistanceObjectHelper';

export default {
  components: {
    ChatbotIcon
  },
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true,
      default: null
    },
    botImagePath: {
      type: String,
      required: false
    }
  },
  computed: {
    numberOfGroupMembers() {
      return parameterValue(this.assistanceObject, 'related_users')?.length ?? 0;
    },
    validTimestamp() {
      return this.assistanceObject.timestamp && formatDate(this.assistanceObject.timestamp) !== 'Invalid date';
    }
  },
  methods: {
    // https://stackoverflow.com/a/60617142
    formatDate,
    parameterValue
  }
};
</script>

<template>
  <ChatbotIcon
    :bot-image-path="botImagePath"
    :is-group-message="true"
    :number-of-group-members="numberOfGroupMembers"
    v-if="botImagePath"
  />
  <div class="messageContainer">
    {{ parameterValue(assistanceObject, 'message') }}
    <div class="messageTimestamp" v-if="validTimestamp">{{ formatDate(assistanceObject.timestamp) }}</div>
  </div>
</template>

<style lang="scss" scoped>
ul {
  text-align: left;
}
</style>
