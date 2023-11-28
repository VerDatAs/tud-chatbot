<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';

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
    groups: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    },
    incoming: {
      type: Boolean,
      default: false
    },
    keyToDisplay: {
      type: String,
      required: true
    },
    relatedOptions: {
      type: AssistanceObjectCommunication,
      default: null
    }
  },
  computed: {
    isGroupMessage() {
      let groupMessage: boolean = false;
      // Check, if message has the same aId and aoId as the group -> message from the group
      if (this.groups?.length > 0) {
        const group = this.groups[0];
        groupMessage = this.assistanceObject.aId === group.aId && this.assistanceObject.aoId === group.aoId;
      }
      return groupMessage;
    },
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
        this.groups?.[0]?.parameters
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
      return this.keyToDisplay === 'message_response' && this.isGroupMessage;
    }
  }
};
</script>

<template>
  <ChatbotIcon
    :bot-image-path="botImagePath"
    :is-group-message="isGroupMessage"
    :number-of-group-members="numberOfGroupMembers"
    v-if="incoming && botImagePath"
  />
  <div class="messageContainer">
    <span v-if="sentMessageToGroup()" class="fw-bold">@group: </span>
    <span>{{ getAssistanceObjectText() }}</span>
  </div>
</template>
