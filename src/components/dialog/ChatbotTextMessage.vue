<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { formatDate } from '@/util/assistanceObjectHelper';

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
    numberOfGroupMembers() {
      // exemplary content of "this.groups[0]":
      // {"aId":"...", "aoId":"...","parameters":[
      //   {"key":"message","value":"..."},
      //   {"key":"group","value":[
      //     {"key":"groupId","value":"..."},
      //     {"key":"members","value":[
      //       {"key":"userId","value":"user1"},
      //       {"key":"userId","value":"user2"}
      //     ]}
      //   ]}
      // ]}
      return (
        this.relatedGroup?.parameters
          ?.find((param: any) => param?.key === 'group')
          ?.value?.find((groupParam: any) => groupParam.key === 'members')?.value?.length || 0
      );
    }
  },
  methods: {
    getAssistanceObjectText() {
      let textToDisplay =
        this.assistanceObject.parameters?.find((param) => param.key === this.keyToDisplay)?.value || '';
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
    sentMessageToGroup() {
      return this.keyToDisplay === 'message_response' && this.relatedGroup;
    },
    formatDate
  }
};
</script>

<template>
  <ChatbotIcon
    :bot-image-path="botImagePath"
    :is-group-message="!!relatedGroup"
    :number-of-group-members="numberOfGroupMembers"
    v-if="incoming && botImagePath"
  />
  <div class="messageContainer">
    <span v-if="sentMessageToGroup()" class="fw-bold">@group:</span>
    <span>{{ getAssistanceObjectText() }}</span>
    <div class="messageTimestamp" v-if="assistanceObject.timestamp">{{ formatDate(assistanceObject.timestamp) }}</div>
  </div>
</template>
