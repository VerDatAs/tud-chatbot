<script lang="ts">
import ChatbotGroupStatusMessage from '@/components/dialog/ChatbotGroupStatusMessage.vue';
import ChatbotNotesAndPeerSolution from '@/components/dialog/ChatbotNotesAndPeerSolution.vue';
import ChatbotOptionsMessage from '@/components/dialog/ChatbotOptionsMessage.vue';
import ChatbotStateUpdate from '@/components/dialog/ChatbotStateUpdate.vue';
import ChatbotSystemMessage from '@/components/dialog/ChatbotSystemMessage.vue';
import ChatbotTextMessage from '@/components/dialog/ChatbotTextMessage.vue';
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import ChatbotOnlineIndicator from '@/components/shared/ChatbotOnlineIndicator.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { checkForKeyPresence, parameterValue } from '@/util/assistanceObjectHelper';

export default {
  data: () => ({
    messageToSend: '' as string,
    messageUpdate: false as boolean,
    hasScrolled: false as boolean,
    wasScrolledAutomatically: false as boolean,
    sendChatDisabled: false as boolean
  }),
  props: {
    botImagePath: String,
    chatEnabled: {
      type: Boolean,
      default: false
    },
    groups: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    },
    isWebSocketConnected: {
      type: Boolean,
      default: false
    },
    messageExchange: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    },
    notes: String,
    notesAndPeerSolutionVisible: Boolean,
    notesEnabled: {
      type: Boolean,
      default: false
    },
    notesCommandEnabled: {
      type: Boolean,
      default: false
    },
    notesInputEnabled: {
      type: Boolean,
      default: false
    },
    peerSolution: String,
    peerSolutionEnabled: {
      type: Boolean,
      default: false
    },
    peerSolutionCommandEnabled: {
      type: Boolean,
      default: false
    },
    storedMessageToSend: {
      type: String,
      default: ''
    },
    incomingMessageTypes: {
      type: Array<String>,
      default: []
    },
    outgoingMessageTypes: {
      type: Array<String>,
      default: []
    }
  },
  components: {
    ChatbotIcon,
    ChatbotGroupStatusMessage,
    ChatbotNotesAndPeerSolution,
    ChatbotOnlineIndicator,
    ChatbotOptionsMessage,
    ChatbotStateUpdate,
    ChatbotSystemMessage,
    ChatbotTextMessage
  },
  watch: {
    messageToSend: function (newValue, oldValue) {
      this.$emit('updateMessageToSend', newValue);
    }
  },
  computed: {
    hasScrolledButReceivedNewMessages() {
      return this.hasScrolled && this.messageUpdate;
    }
  },
  mounted() {
    this.initChatbotDialog();
  },
  methods: {
    parameterValue,
    initChatbotDialog() {
      const dialogContainer = document.getElementById('dialogContainer');
      if (!dialogContainer) {
        return;
      }
      dialogContainer.onscroll = () => {
        console.log('hasScrolled');
        // avoid setting hasScrolled for situations, in which the dialog was scrolled automatically
        if (!this.wasScrolledAutomatically) {
          this.hasScrolled = true;
        }
        // reset hasScrolled, if the user manually scrolls to the bottom
        if (
          this.hasScrolled &&
          dialogContainer.scrollTop === dialogContainer.scrollHeight - dialogContainer.offsetHeight
        ) {
          this.hasScrolled = false;
          this.messageUpdate = false;
        }
      };
      this.messageToSend = this.storedMessageToSend;
    },
    resetInput() {
      this.messageToSend = '';
    },
    closeChatbotDialog() {
      this.$emit('closeChatbotDialog');
    },
    isIncomingMessage(message: AssistanceObjectCommunication) {
      const parameterKeyArray = message?.parameters?.map((param) => param.key) || [];
      return parameterKeyArray.some((item) => this.incomingMessageTypes.includes(item));
    },
    // https://stackoverflow.com/a/60617142
    checkForKeyPresence,
    sendMessage(event: Event | null) {
      if (event) {
        event.preventDefault();
      }
      // do not send messages, if the chat is disabled or the length of the message is too large
      if (!this.chatEnabled || this.messageToSend.length > 9999) {
        return;
      }
      // check message with removed linebreaks and trimmed whitespaces to be empty
      if (this.messageToSend.replace(/(\r\n|\n|\r)/gm, '').trimEnd() === '') {
        this.messageToSend = '';
        return;
      }
      // do not send messages, if the chat button is disabled (empty enter commands are returned before)
      if (this.sendChatDisabled) {
        return;
      }
      // prepare message to be sent
      const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      // check if message starts with @group and a group was formed previously -> group message
      // in this case, this.groups has to be used to find only active groups
      // TODO: Remove, if not used anymore
      if (this.messageToSend.trimStart().startsWith('@group') && this.groups.length > 0) {
        const groupToInform = this.groups[0];
        messageToSend.aId = groupToInform.aId;
        messageToSend.aoId = groupToInform.aoId;
        let remainingMessage = this.messageToSend.trimStart();
        // remove leading @group[:] prefix
        remainingMessage = this.messageToSend.trimStart().startsWith('@group:')
          ? this.messageToSend.replace('@group:', '')
          : this.messageToSend.replace('@group', '');
        // remove possible leading whitespaces
        remainingMessage = remainingMessage.trimStart();
        messageToSend.parameters = [new AssistanceParameter('message_response', remainingMessage)];
      } else if (
        this.groups.length > 0 &&
        (this.messageToSend === 'TERMINATE' || this.messageToSend === 'TERMINATE\n')
      ) {
        const groupToTerminate = this.groups[0];
        messageToSend.aId = groupToTerminate.aId;
        messageToSend.aoId = groupToTerminate.aoId;
        messageToSend.parameters = [new AssistanceParameter('state_update_response', { status: 'completed' })];
      } else {
        // Find last item in the history with an aId: https://stackoverflow.com/a/46822472
        const lastItemWithAssistanceId = this.messageExchange.slice().reverse().find(ao => !!ao.aId);
        if (lastItemWithAssistanceId) {
          messageToSend.aId = lastItemWithAssistanceId.aId;
          // Remove newlines (and all other whitespace) at the end: https://stackoverflow.com/a/48080903
          messageToSend.parameters = [new AssistanceParameter('message_response', this.messageToSend.trim())];
        } else {
          // Return, if no aId does exist as a target
          return;
        }
      }
      this.sendChatDisabled = true;
      this.emitAssistanceObject(messageToSend);
      // Reset message input
      setTimeout(() => {
        this.messageToSend = '';
        // Reset send chat disable
        setTimeout(() => {
          this.sendChatDisabled = false;
        }, 1500);
      }, 50);
    },
    acknowledgePeerSolution(acknowledge: boolean) {
      if (acknowledge) {
        const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
        // Find last item in the history with an aId: https://stackoverflow.com/a/46822472
        const lastItemWithAssistanceId = this.messageExchange.slice().reverse().find(ao => !!ao.aId);
        if (lastItemWithAssistanceId) {
          messageToSend.aId = lastItemWithAssistanceId.aId;
          messageToSend.parameters = [new AssistanceParameter('state_update_response', 'standby')];
          this.emitAssistanceObject(messageToSend);
        }
      }
    },
    sendSolution(solution: string) {
      const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      // Find last item in the history with an aId: https://stackoverflow.com/a/46822472
      const lastItemWithAssistanceId = this.messageExchange.slice().reverse().find(ao => !!ao.aId);
      if (lastItemWithAssistanceId) {
        messageToSend.aId = lastItemWithAssistanceId.aId;
        messageToSend.parameters = [new AssistanceParameter('solution_response', solution)];
        this.emitAssistanceObject(messageToSend);
      }
    },
    selectOption(optionResponse: AssistanceObjectCommunication) {
      this.emitAssistanceObject(optionResponse);
    },
    emitAssistanceObject(assistanceObject: AssistanceObjectCommunication) {
      // TODO: Remove, if this causes problems
      // add timestamp to messages that are sent to the backend
      if (!assistanceObject.timestamp) {
        assistanceObject.timestamp = new Date().toISOString();
      }
      this.$emit('sendAssistanceObject', assistanceObject);
    },
    reconnectWebSocket(reconnect: boolean) {
      if (reconnect) {
        this.$emit('reconnectWebSocket', true);
      }
    },
    findRelatedItem(responseOption: AssistanceObjectCommunication, key: string) {
      return this.messageExchange.find(
        (message) =>
          message.aId === responseOption.aId &&
          message.aoId === responseOption.aoId &&
          this.checkForKeyPresence(message, key)
      );
    },
    // Retrieved from https://stackoverflow.com/a/18614545
    updateScroll() {
      console.log('updateScroll');
      if (!this.hasScrolled) {
        setTimeout(() => {
          const element = document.getElementById('dialogContainer');
          if (element) {
            element.scrollTop = element.scrollHeight;
            this.wasScrolledAutomatically = true;
            setTimeout(() => {
              this.wasScrolledAutomatically = false;
            }, 250);
          }
        }, 100);
      } else {
        this.messageUpdate = true;
      }
    },
    scrollDown() {
      this.hasScrolled = false;
      this.messageUpdate = false;
      this.updateScroll();
    },
    fadeIn() {
      document.getElementById('chatbotDialog')?.classList.add('animate__fadeInRight');
      // after fade in, scroll down the view
      setTimeout(() => {
        this.scrollDown();
      }, 50);
    },
    fadeOut() {
      document.getElementById('chatbotDialog')?.classList.add('animate__fadeOutRight');
    }
  }
};
</script>

<template>
  <div id="chatbotDialog" class="animate__animated">
    <ChatbotNotesAndPeerSolution
      :notes="notes"
      :notes-and-peer-solution-visible="notesAndPeerSolutionVisible"
      :notes-enabled="notesEnabled"
      :notes-command-enabled="notesCommandEnabled"
      :notes-input-enabled="notesInputEnabled"
      :peer-solution="peerSolution"
      :peer-solution-enabled="peerSolutionEnabled"
      :peer-solution-command-enabled="peerSolutionCommandEnabled"
      @acknowledgePeerSolution="acknowledgePeerSolution"
      @sendSolution="sendSolution"
      v-if="notesEnabled"
    />
    <div id="dialogHeader">
      <ChatbotIcon :botImagePath="botImagePath" :headerIcon="true" />
      <div class="headerName">
        VERI
        <ChatbotOnlineIndicator
          :is-web-socket-connected="isWebSocketConnected"
          @reconnect-web-socket="reconnectWebSocket"
        />
      </div>
      <span class="headerDescription">Unterstützung von Lernenden</span>
      <span class="closeBtn" @click="closeChatbotDialog()">&times;</span>
    </div>
    <div id="dialogContainer">
      <div class="scrolledButNewMessages" v-if="hasScrolledButReceivedNewMessages" @click="scrollDown">
        Neue Nachrichten verfügbar!
      </div>
      <div
        id="messageExchange"
        v-if="messageExchange.length > 0"
      >
        <div v-for="(message, messageIndex) in messageExchange" :key="'message' + messageIndex">
          <div
            class="message messageIncoming animate__animated animate__fadeInLeft"
            :class="message.type === 'state_update' ? 'systemMessage' : ''"
            v-if="isIncomingMessage(message)"
          >
            <ChatbotStateUpdate
              :assistance-object="message"
              :key-of-interest="'state_update'"
              v-if="message.type === 'state_update'"
            />
            <ChatbotTextMessage
              :assistance-object="message"
              :bot-image-path="botImagePath"
              :incoming="true"
              :key-to-display="'message'"
              :related-group="findRelatedItem(message, 'related_users')"
              v-if="message.type === 'message'"
            />
            <ChatbotSystemMessage
              :assistance-object="message"
              :key-to-display="'system_message'"
              v-else-if="message.type === 'system_message'"
            />
            <ChatbotTextMessage
              :assistance-object="message"
              :bot-image-path="botImagePath"
              :incoming="true"
              :key-to-display="'user_message'"
              v-else-if="message.type === 'user_message'"
            />
            <ChatbotTextMessage
              :assistance-object="message"
              :bot-image-path="botImagePath"
              :incoming="true"
              :key-to-display="'message'"
              :link-value="parameterValue(message, 'uri')"
              v-else-if="message.type === 'uri'"
            />
            <ChatbotGroupStatusMessage
              :assistance-object="message"
              :bot-image-path="botImagePath"
              v-else-if="message.type === 'related_users'"
            />
            <ChatbotOptionsMessage
              :bot-image-path="botImagePath"
              :assistance-object="message"
              :is-last-item="messageIndex === messageExchange.length - 1"
              v-else-if="message.type === 'options'"
              @select-option="selectOption"
            />
          </div>
          <div class="message messageOutgoing animate__animated animate__fadeInRight" v-else>
            <ChatbotTextMessage
              :assistance-object="message"
              :key-to-display="'message_response'"
              :related-group="findRelatedItem(message, 'related_users')"
              v-if="message.type === 'message_response'"
            />
            <ChatbotTextMessage
              :assistance-object="message"
              :key-to-display="'options_response'"
              :related-options="findRelatedItem(message, 'options')"
              v-else-if="message.type === 'options_response'"
            />
          </div>
        </div>
      </div>
    </div>
    <div id="dialogInput">
      <div class="inputContainer">
        <form @submit="sendMessage($event)">
          <textarea
            id="messageInput"
            v-model="messageToSend"
            placeholder="Geben Sie Ihre Nachricht ein"
            @keydown.enter.exact.prevent="sendMessage(null)"
            :maxlength="9999"
            :disabled="!chatEnabled"
          ></textarea>
          <button type="submit" class="sendBtn" :disabled="!chatEnabled || sendChatDisabled">Senden</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#chatbotDialog {
  position: relative;
  width: 360px;
  height: calc(100vh - 60px);
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  background: #fff;

  #dialogHeader {
    position: relative;
    padding: 12px 15px 12px 15px;
    border-bottom: 1px solid #ddd;
    height: 56px;

    .headerName,
    .headerDescription {
      padding-left: 50px;
    }

    .headerName {
      line-height: 12px;
      font-weight: 600;
      font-size: 14px;
    }

    .headerDescription {
      font-weight: 600;
      font-size: 12px;
      color: #9a9a9a;
    }

    .closeBtn {
      position: absolute;
      padding: 5px 10px 5px 5px;
      top: 0;
      right: 0;
      font-size: 24px;
      cursor: pointer;
    }
  }

  #dialogContainer {
    // header height - footer height
    // TODO: Fix height to work without fixed heights
    max-height: calc(100% - 56px - 80px);
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;

    #messageExchange {
      padding: 15px;
    }

    .scrolledButNewMessages {
      // https://www.w3schools.com/howto/howto_css_sticky_element.asp
      // https://caniuse.com/css-sticky
      position: -webkit-sticky; /* Safari */
      position: sticky;
      top: 0;
      left: 0;
      padding: 10px;
      width: 100%;
      z-index: 99;
      text-align: center;
      background: #eee;
      border-bottom: 1px solid #ddd;
      text-decoration: underline;
      cursor: pointer;
    }

    .message {
      position: relative;
      margin-bottom: 16px;
      color: #fff;
      white-space: pre-wrap;
      word-break: break-word;

      &:first-child {
        margin-top: 10px;
      }

      &.messageIncoming,
      &.messageOutgoing {
        .messageContainer {
          display: inline-block;
          padding: 0.5rem 0.75rem;
          border-radius: 15px;

          .messageTimestamp {
            margin-top: 8px;
            font-size: 10px;
          }
        }
      }

      &.messageIncoming {
        padding-left: 45px;
        padding-right: 18px;

        .messageContainer {
          border-top-left-radius: 0;
          border: 1px solid #ccc;
          background: #f6f6f6;
          color: #000;

          .messageTimestamp {
            text-align: right;
            color: #333;
          }
        }
      }

      &.messageOutgoing {
        text-align: right;
        padding-left: 18px;

        .messageContainer {
          border-bottom-right-radius: 0;
          background: #000;

          .messageTimestamp {
            color: #eee;
          }
        }
      }
    }

    .systemMessage {
      padding: 0 !important;
      border-radius: 0 !important;
      background: none;
      color: inherit;
    }
  }

  #dialogInput {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 80px;
    border-top: 1px solid #ccc;
    background: #fff;

    .inputContainer {
      position: relative;
      padding: 15px 100px 15px 15px;

      textarea {
        padding: 5px 10px;
        height: 48px;
        width: 100%;
        border: none;
        resize: none;

        &:disabled, &[disabled] {
          cursor: not-allowed;
        }
      }

      .sendBtn {
        position: absolute;
        height: 50px;
        top: 14px;
        right: 14px;
        padding: 5px 10px;

        &:disabled, &[disabled] {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
