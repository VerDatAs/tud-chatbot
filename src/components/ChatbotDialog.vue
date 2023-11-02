<script>
import ChatbotIcon from "./ChatbotIcon.vue";

export default {
  props: {
    pluginPath: String
  },
  components: {
    ChatbotIcon
  },
  methods: {
    closeChatbotDialog() {
      this.$emit("closeChatbotDialog");
    },
    fadeIn() {
      document
        .getElementById("chatbotDialog")
        .classList.add("animate__fadeInRight");
    },
    fadeOut() {
      document
        .getElementById("chatbotDialog")
        .classList.add("animate__fadeOutRight");
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
    <div class="dialogContainer">
      <div class="message messageIncoming">
        <ChatbotIcon :pluginPath="pluginPath" />
        <span>Test</span>
      </div>
      <div class="message messageOutgoing">
        <span>Test2</span>
      </div>
      <div class="message messageIncoming">
        <ChatbotIcon :pluginPath="pluginPath" />
        <span>Test3</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#chatbotDialog {
  width: 360px;
  height: calc(100vh - 60px);
  border-left: 1px solid #ddd;
  background: #fff;

  .dialogHeader {
    position: relative;
    padding: 12px 35px 12px 15px;
    border-bottom: 1px solid #ddd;

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

  .dialogContainer {
    padding: 15px 10px;

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
}
</style>
