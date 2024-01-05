<script lang="ts">
import ChatbotGroupStatusMessage from '@/components/dialog/ChatbotGroupStatusMessage.vue';
import ChatbotNotes from '@/components/dialog/ChatbotNotes.vue';
import ChatbotOptionsMessage from '@/components/dialog/ChatbotOptionsMessage.vue';
import ChatbotStateUpdate from '@/components/dialog/ChatbotStateUpdate.vue';
import ChatbotSystemMessage from '@/components/dialog/ChatbotSystemMessage.vue';
import ChatbotTextMessage from '@/components/dialog/ChatbotTextMessage.vue';
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { checkForKeyPresence } from '@/util/assistanceObjectHelper';

export default {
  data: () => ({
    messageToSend: '' as string,
    messageUpdate: false as boolean,
    hasScrolled: false as boolean,
    wasScrolledAutomatically: false as boolean
  }),
  props: {
    botImagePath: String,
    groups: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    },
    messageExchange: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    },
    notesVisible: Boolean,
    notes: String,
    incomingMessageTypes: {
      type: Array<String>,
      default: []
    },
    outgoingMessageTypes: {
      type: Array<String>,
      default: []
    },
    stateUpdates: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    }
  },
  components: {
    ChatbotGroupStatusMessage,
    ChatbotNotes,
    ChatbotOptionsMessage,
    ChatbotStateUpdate,
    ChatbotSystemMessage,
    ChatbotTextMessage,
    ChatbotIcon
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
      // check message with removed linebreaks and trimmed whitespaces to be empty
      if (this.messageToSend.replace(/(\r\n|\n|\r)/gm, '').trimEnd() === '') {
        this.messageToSend = '';
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
      this.emitAssistanceObject(messageToSend);
      // Reset message input
      setTimeout(() => {
        this.messageToSend = '';
      }, 50);
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
    findRelatedItems(responseOption: AssistanceObjectCommunication, key: string) {
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
    },
    fadeOut() {
      document.getElementById('chatbotDialog')?.classList.add('animate__fadeOutRight');
    }
  }
};
</script>

<template>
  <div id="chatbotDialog" class="animate__animated">
    <ChatbotNotes :notesVisible="notesVisible" :notes="notes" />
    <div id="dialogHeader">
      <ChatbotIcon :botImagePath="botImagePath" :headerIcon="true" />
      <span class="headerName">VERI</span>
      <span class="headerDescription">Supporting lecturers</span>
      <span class="closeBtn" @click="closeChatbotDialog()">&times;</span>
    </div>
    <div id="dialogContainer">
      <div class="scrolledButNewMessages" v-if="hasScrolledButReceivedNewMessages" @click="scrollDown">
        New messages available!
      </div>
      <div
        id="messageExchange"
        :style="hasScrolledButReceivedNewMessages ? 'margin-top: 50px;' : ''"
        v-if="messageExchange.length > 0"
      >
        <div v-for="(message, messageIndex) in messageExchange" :key="'message' + messageIndex">
          <div
            class="message messageIncoming animate__animated animate__fadeInLeft"
            :class="checkForKeyPresence(message, 'state_update') ? 'systemMessage' : ''"
            v-if="isIncomingMessage(message)"
          >
            <ChatbotOptionsMessage
              :bot-image-path="botImagePath"
              :assistance-object="message"
              :is-last-item="messageIndex === messageExchange.length - 1"
              v-if="checkForKeyPresence(message, 'options')"
              @select-option="selectOption"
            />
            <ChatbotGroupStatusMessage
              :assistance-object="message"
              :bot-image-path="botImagePath"
              :group-initiation="true"
              v-else-if="checkForKeyPresence(message, 'group')"
            />
            <ChatbotStateUpdate
              :assistance-object="message"
              :key-of-interest="'state_update'"
              :state-updates="stateUpdates"
              v-else-if="checkForKeyPresence(message, 'state_update')"
            />
            <ChatbotSystemMessage
              :assistance-object="message"
              :key-to-display="'system_message'"
              v-else-if="checkForKeyPresence(message, 'system_message')"
            />
            <ChatbotTextMessage
              :assistance-object="message"
              :bot-image-path="botImagePath"
              :incoming="true"
              :key-to-display="'message'"
              :related-group="findRelatedItems(message, 'group')"
              v-else-if="checkForKeyPresence(message, 'message')"
            />
            <div v-else>-- none supported key --</div>
          </div>
          <div class="message messageOutgoing animate__animated animate__fadeInRight" v-else>
            <ChatbotTextMessage
              :assistance-object="message"
              :key-to-display="'message_response'"
              :related-group="findRelatedItems(message, 'group')"
              v-if="checkForKeyPresence(message, 'message_response')"
            />
            <ChatbotTextMessage
              :assistance-object="message"
              :key-to-display="'options_response'"
              :related-options="findRelatedItems(message, 'options')"
              v-else-if="checkForKeyPresence(message, 'options_response')"
            />
            <ChatbotGroupStatusMessage
              :assistance-object="findRelatedItems(message, 'group')"
              :group-initiation="false"
              v-else-if="checkForKeyPresence(message, 'state_update_response')"
            />
            <div v-else>-- none supported key --</div>
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
            placeholder="Sag etwas zu VERI."
            @keyup.enter.exact="sendMessage(null)"
          ></textarea>
          <button type="submit" class="sendBtn">Senden</button>
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
      display: block;
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
    padding: 15px;
    // header height - footer height
    // TODO: Fix height to work without fixed heights
    max-height: calc(100% - 56px - 80px);
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;

    .scrolledButNewMessages {
      position: absolute;
      top: 0;
      left: 0;
      padding: 10px;
      width: 100%;
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
      }

      .sendBtn {
        position: absolute;
        height: 50px;
        top: 14px;
        right: 14px;
        padding: 5px 10px;
      }
    }
  }
}
</style>
