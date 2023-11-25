<script lang="ts">
import ChatbotNotes from '@/components/dialog/ChatbotNotes.vue';
import ChatbotTextMessage from '@/components/dialog/ChatbotTextMessage.vue';
import ChatbotOptionsMessage from '@/components/dialog/ChatbotOptionsMessage.vue';
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';

export default {
  data: () => ({
    messageToSend: '' as string,
    messageUpdate: false as boolean,
    hasScrolled: false as boolean,
    wasScrolledAutomatically: false as boolean,
    incomingMessageTypes: ['message', 'options'],
    outgoingMessageTypes: ['message_response', 'options_response']
  }),
  props: {
    messageExchange: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    },
    messageHistory: Array<AssistanceObjectCommunication>,
    botImagePath: String,
    notesVisible: Boolean,
    notes: String
  },
  components: {
    ChatbotNotes,
    ChatbotOptionsMessage,
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
    parametersIncludeKey(message: AssistanceObjectCommunication, key: string) {
      const parameterKeyArray = message?.parameters?.map((param) => param.key) || [];
      return parameterKeyArray.includes(key);
    },
    sendMessage(event: Event | null) {
      if (event) {
        event.preventDefault();
      }
      // TODO: This does not work with ENTER, if the second condition is not set
      if (this.messageToSend === 'RESET' || this.messageToSend === 'RESET\n') {
        this.$emit('resetMessageHistory');
        this.messageToSend = '';
        return;
      }
      // check message with removed linebreaks and trimmed whitespaces to be empty
      if (this.messageToSend.replace(/(\r\n|\n|\r)/gm, '').trimEnd() === '') {
        this.messageToSend = '';
        return;
      }
      const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      messageToSend.aId = '2EA95788-7ABA-4DDD-B3BA-E7EB344685BD';
      messageToSend.aoId = 'BC2340BA-1623-41F8-9BVD-B4373956E6EC';
      messageToSend.parameters = [ new AssistanceParameter('message_response', this.messageToSend) ];
      // TODO: Send message via WebSocket (input as Prop)
      this.$emit('updateMessageHistory', messageToSend);
      // Reset message input
      setTimeout(() => {
        this.messageToSend = '';
      }, 50);
    },
    parameterValue(message: AssistanceObjectCommunication, key: string) {
      // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
      return message.parameters?.find((param) => param.key === key)?.value ?? '';
    },
    selectOption(optionResponse: AssistanceObjectCommunication) {
      this.$emit('selectOption', optionResponse);
    },
    findRelatedOptions(responseOption: AssistanceObjectCommunication) {
      return this.messageExchange.find((message) => message.aId === responseOption.aId && message.aoId === responseOption.aoId && this.parametersIncludeKey(message, 'options'));
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
      <div id="messageExchange" :style="hasScrolledButReceivedNewMessages ? 'margin-top: 50px;' : ''" v-if="messageExchange.length > 0">
        <div v-for="(message, messageIndex) in messageExchange" :key="'message' + messageIndex">
          <div class="message messageIncoming animate__animated animate__fadeInLeft" v-if="isIncomingMessage(message)">
            <ChatbotOptionsMessage
              :bot-image-path="botImagePath"
              :message="message"
              :is-last-item="messageIndex === messageExchange.length - 1"
              v-if="parametersIncludeKey(message, 'options')"
              @select-option="selectOption"
            />
            <ChatbotTextMessage
              :bot-image-path="botImagePath"
              :incoming="true"
              :text="parameterValue(message, 'message')"
              v-else-if="parametersIncludeKey(message, 'message')"
            />
            <div v-else>-- none supported key --</div>
          </div>
          <div class="message messageOutgoing animate__animated animate__fadeInRight" v-else>
            <ChatbotTextMessage
              :text="parameterValue(message, 'message_response')"
              v-if="parametersIncludeKey(message, 'message_response')"
            />
            <ChatbotTextMessage
              :related-options="findRelatedOptions(message)"
              :text="parameterValue(message, 'options_response')"
              v-else-if="parametersIncludeKey(message, 'options_response')"
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
        }
      }

      &.messageOutgoing {
        text-align: right;
        padding-left: 18px;

        .messageContainer {
          border-bottom-right-radius: 0;
          background: #000;
        }
      }
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
