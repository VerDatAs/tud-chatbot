<script>
import ChatbotIcon from "./ChatbotIcon.vue";
import axios from "axios";

export default {
  data: () => ({
    userToken: "",
    webSocket: null
  }),
  props: {
    adminToken: String,
    userIdOrActorAccountName: String,
    pluginPath: String
  },
  components: {
    ChatbotIcon
  },
  created() {
    this.initChatbotDialog();
  },
  methods: {
    initChatbotDialog() {
      console.log("initChatbotDialog");
      const authUrl = "http://localhost:8080/api/v1/auth/login";
      const request = {
        actorAccountName: "tommy1910"
      };
      axios.post(authUrl, request).then((userData) => {
        this.userToken = userData.data.token;
        const webSocketURL = "ws://localhost:8080/api/v1/websocket";
        this.webSocket = new WebSocket("ws://localhost:8080/api/v1/websocket");
        this.webSocket.addEventListener("open", (event) => {
          this.webSocket.send(
            "CONNECT\ntoken:" +
              this.userToken +
              "\naccept-version:1.2\nheart-beat:3000,3000\n\n\0"
          );
          this.webSocket.send(
            "SUBSCRIBE\nid:sub-0\ndestination:/user/queue/chat\n\n\0"
          );
        });
        this.webSocket.addEventListener("message", (data, isBinary) => {
          const message = data.data;

          const BYTES = {
            // LINEFEED byte (octet 10)
            LF: "\x0A",
            // NULL byte (octet 0)
            NULL: "\x00"
          };

          console.log("message received", message);

          // Ping message incoming
          if (message === BYTES.LF || message === "\n") {
            console.log("ping received");
            this.webSocket.send(BYTES.LF);
            return;
          }
          console.log("other message");
        });
      });
    },
    closeChatbotDialog() {
      this.$emit("closeChatbotDialog");
    },
    sendMessage() {
      const authHeader = {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + this.adminToken
      };
      const authUrl =
        "http://localhost:8080/api/v1/users/" +
        this.userIdOrActorAccountName +
        "/chatbot-messages";
      const request = {
        type: "informational_feedback",
        message: "Test 1234!"
      };
      axios
        .post(authUrl, request, { headers: authHeader })
        .then((adminData) => {
          this.adminToken = adminData.data.token;
        });
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
    <div class="dialogInput">
      <div class="inputContainer">
        <textarea placeholder="Sag etwas zu VERI."></textarea>
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

  .dialogContainer {
    padding: 15px;
    // header height - footer height
    height: calc(100% - 62px - 80px);
    overflow-y: scroll;

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
        height: 43px;
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
