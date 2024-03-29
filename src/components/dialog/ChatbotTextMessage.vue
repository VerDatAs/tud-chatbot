<!--
Chatbot for the assistance system developed as part of the VerDatAs project
Copyright (C) 2023-2024 TU Dresden (Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { useDisplayStore } from '@/stores/display';
import { formatDate, parameterValue } from '@/util/assistanceObjectHelper';

export default {
  data: () => ({
    displayStore: useDisplayStore()
  }),
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
    },
    requireClickNotification: {
      type: Number,
      default: 0
    }
  },
  emits: [
    'clickNotificationResponse'
  ],
  computed: {
    /**
     * Check, whether the text message is a message from a user.
     */
    isUserMessage() {
      return this.keyToDisplay === 'user_message';
    },
    /**
     * Check, whether the link value is an internal link.
     */
    isInternalLink() {
      return this.linkValue?.includes(window.location.origin);
    },
    /**
     * Return the number of group members.
     */
    numberOfGroupMembers() {
      if (this.relatedGroup) {
        return parameterValue(this.relatedGroup, 'related_users')?.length ?? 0;
      } else {
        return 0;
      }
    },
    /**
     * Check, whether the timestamp provided by the assistance object is valid.
     */
    validTimestamp() {
      return this.assistanceObject.timestamp && formatDate(this.assistanceObject.timestamp) !== 'Invalid date';
    }
  },
  methods: {
    /**
     * Retrieve the value of a provided parameter key.
     */
    getAssistanceObjectText() {
      let textToDisplay = parameterValue(this.assistanceObject, this.keyToDisplay);
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
    /**
     * Open the link defined in the link value and send a notification response.
     */
    openLinkAndSendNotificationResponse() {
      // Early return, if no link value exists
      if (!this.linkValue || this.linkValue === '') {
        return;
      }
      // It is only possible to send the response first and then open the link
      // TODO: The number of clicks should be counted and handed over here
      const responseParameter: AssistanceParameter = new AssistanceParameter('click_notification_response', 1);
      const responseObject: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      responseObject.aId = this.assistanceObject.aId;
      responseObject.parameters = [responseParameter];
      this.$emit('clickNotificationResponse', responseObject);
      // Depending on the type of link, either open it in the same window or in a new tab
      if (this.isInternalLink) {
        // Open the link in the same window: https://stackoverflow.com/a/4813887/3623608
        window.location.href = this.linkValue;
      } else {
        // Open the link in a new tab: https://stackoverflow.com/a/11384018/3623608
        window.open(this.linkValue, '_blank')?.focus();
      }
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
      <hr />
      <template v-if="requireClickNotification === 0">
        <a class="btn btn-primary" :href="linkValue" v-if="isInternalLink">Interner Link</a>
        <a class="btn btn-primary" :href="linkValue" target="_blank" v-else>Externer Link</a>
      </template>
      <template v-else>
        <button class="btn btn-primary" @click="openLinkAndSendNotificationResponse()">
          {{ isInternalLink ? 'Interner Link' : 'Externer Link' }}
        </button>
      </template>
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
