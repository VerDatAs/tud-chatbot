<script>
import ChatbotIcon from './ChatbotIcon.vue';

export default {
  data: () => ({
    messageToSend: '',
    hasScrolled: false
  }),
  props: {
    messageHistory: Array,
    pluginPath: String
  },
  components: {
    ChatbotIcon
  },
  mounted() {
    this.initChatbotDialog();
  },
  methods: {
    initChatbotDialog() {
      document.getElementById('dialogContainer').onscroll = () => {
        console.log('hasScrolled');
        this.hasScrolled = true;
      };
    },
    closeChatbotDialog() {
      this.$emit('closeChatbotDialog');
    },
    sendMessage() {
      const messageToSend = {
        incoming: false,
        message: this.messageToSend,
        timestamp: Math.round(Date.now() / 1000)
      };
      // TODO: Send message via WebSocket (input as Prop)
      this.$emit('updateMessageHistory', messageToSend);
      // Reset message input
      setTimeout(() => {
        this.messageToSend = '';
      }, 50);
    },
    // Retrieved from https://stackoverflow.com/a/18614545
    updateScroll() {
      console.log('updateScroll');
      // if (!this.hasScrolled) {
      setTimeout(() => {
        const element = document.getElementById('dialogContainer');
        element.scrollTop = element.scrollHeight;
      }, 100);
      // }
    },
    fadeIn() {
      document
        .getElementById('chatbotDialog')
        .classList.add('animate__fadeInRight');
    },
    fadeOut() {
      document
        .getElementById('chatbotDialog')
        .classList.add('animate__fadeOutRight');
    }
  }
};
</script>

<template>
  <div id="chatbotDialog" class="animate__animated">
    <div class="dialogHeader">
      <ChatbotIcon :pluginPath="pluginPath" :headerIcon="true" />
      <span class="headerName">VERI</span>
      <span class="headerDescription">Supporting lecturers</span>
      <span class="closeBtn" @click="closeChatbotDialog()">&times;</span>
    </div>
    <div id="dialogContainer">
      <template v-for="message in messageHistory">
        <div class="message messageIncoming animate__animated animate__fadeInLeft" v-if="message.incoming">
          <ChatbotIcon :pluginPath="pluginPath" />
          <span>
            {{ message.message }}
          </span>
        </div>
        <div class="message messageOutgoing animate__animated animate__fadeInRight" v-else>
          <span>
            {{ message.message }}
          </span>
        </div>
      </template>
    </div>
    <div class="dialogInput">
      <div class="inputContainer">
        <textarea
          v-model="messageToSend"
          placeholder="Sag etwas zu VERI."
        ></textarea>
        <button class="sendBtn" @click="sendMessage()">Senden</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#chatbotDialog {
  position: relative;
  width: 360px;
  height: calc(100vh - 60px);
  border-left: 1px solid #ddd;
  background: #fff;

  .dialogHeader {
    position: relative;
    padding: 12px 35px 12px 15px;
    border-bottom: 1px solid #ddd;
    height: 62px;

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
    height: calc(100% - 62px - 80px);
    overflow-x: hidden;
    overflow-y: auto;

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
        span {
          display: inline-block;
          padding: 0.5rem 0.75rem;
          border-radius: 15px;
        }
      }

      &.messageIncoming {
        padding-left: 45px;
        padding-right: 18px;

        span {
          border-top-left-radius: 0;
          border: 1px solid #ccc;
          background: #f6f6f6;
          color: #000;
        }
      }

      &.messageOutgoing {
        text-align: right;
        padding-left: 18px;

        span {
          border-bottom-right-radius: 0;
          background: #000;
        }
      }
    }
  }

  .dialogInput {
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
        height: 40px;
        width: calc(100% - 20px);
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
