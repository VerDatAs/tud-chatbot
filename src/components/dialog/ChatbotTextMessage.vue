<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { formatDate, parameterValue } from '@/util/assistanceObjectHelper';
import { useDisplayStore } from '@/stores/display';

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
  emits: ['clickNotificationResponse'],
  computed: {
    isUserMessage() {
      return this.keyToDisplay === 'user_message';
    },
    isInternalLink() {
      return this.linkValue?.includes(window.location.origin);
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
    openLinkAndSendNotificationResponse() {
      if (!this.linkValue || this.linkValue === '') {
        return;
      }
      // send response first and then open the link
      // TODO: The number of clicks should be counted and handed over here
      const responseParameter: AssistanceParameter = new AssistanceParameter('click_notification_response', 1);
      const responseObject: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      responseObject.aId = this.assistanceObject.aId;
      responseObject.parameters = [responseParameter];
      this.$emit('clickNotificationResponse', responseObject);
      // TODO: This is a hardcoded way to change the default CSS of the statistics tab of ILIAS
      const tabStatistics = document.getElementById('tab_statistics');
      if (tabStatistics) {
        tabStatistics.style.display = 'block';
      }
      this.displayStore.showStatisticsTab = true;
      // depending on the type of link, either open in the same window or in a new tab
      if (this.isInternalLink) {
        // https://stackoverflow.com/a/4813887/3623608
        window.location.href = this.linkValue;
      } else {
        // https://stackoverflow.com/a/11384018/3623608
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
      <hr>
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
