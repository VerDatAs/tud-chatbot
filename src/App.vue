<script>
import ChatbotDialog from './components/ChatbotDialog.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';
import axios from 'axios';

const BYTES = {
  // LINEFEED byte (octet 10)
  LF: '\x0A',
  // NULL byte (octet 0)
  NULL: '\x00'
};

export default {
  data: () => ({
    chatbotDialogVisible: false,
    backendUrl: 'http://localhost:8080',
    pluginPath:
      './Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/VerDatAsBot',
    // WebSocket connection and message sending
    adminToken: '',
    userIdOrActorAccountName: 'ca1910',
    userToken: '',
    webSocket: null,
    messageToSend: '',
    messageHistory: []
  }),
  components: {
    ChatbotDialog,
    ChatbotWidget
  },
  created() {
    this.initChatbotApp();
  },
  methods: {
    async initChatbotApp() {
      document.addEventListener('init-path', (event) => {
        // https://github.com/vaadin/vaadin-upload/issues/138#issuecomment-266773430
        console.log('init-path', event);
        this.pluginPath = event.detail;
      });
      await this.getAdminToken();
      await this.initWebSocketConnection();
    },
    async initWebSocketConnection() {
      console.log('initWebSocketConnection');
      const authUrl = this.backendUrl + '/api/v1/auth/login';
      const request = {
        actorAccountName: 'ca1910'
      };
      const userData = await axios.post(authUrl, request);
      if (!userData.data) {
        return;
      }
      this.userToken = userData.data.token;
      const webSocketURL =
        'ws://' + this.backendUrl.split('http://')?.[1] + '/api/v1/websocket';
      this.webSocket = new WebSocket(webSocketURL);

      // Use code provided by Robert Peine on verdatas-backend README
      this.webSocket.onopen = (event) => {
        this.webSocket.send(
          'CONNECT\ntoken:' +
            this.userToken +
            '\naccept-version:1.2\nheart-beat:3000,3000\n\n\0'
        );
        // there is only one destination that needs to be subscribed: /user/queue/chat
        this.webSocket.send(
          'SUBSCRIBE\nid:sub-0\ndestination:/user/queue/chat\n\n\0'
        );
      };

      this.webSocket.onmessage = (event) => {
        // console.log('incoming message event', event);
        // extract content between \n\n and \0
        const message = event.data.substring(
          event.data.indexOf('\n\n') + 2,
          event.data.lastIndexOf('\0')
        );
        // verdatas-backend sends JSON data in body of STOMP messages that can be deserialized
        if (!message) {
          console.log('skip connect message');
        } else if (message === BYTES.LF) {
          // console.log('ping message received');
          this.webSocket.send(BYTES.LF);
        } else {
          const messageToPush = {
            incoming: true,
            message: JSON.parse(message).msg,
            timestamp: parseInt(event.timeStamp)
          };
          this.messageHistory.push(messageToPush);
          this.updateDialogScroll();
          // console.log('other message', messageToPush);
        }
      };

      setTimeout(() => {
        // TODO: Open dialog automatically, when hasJustLoggedIn
        this.updateChatbotDialogVisible(true);
        setTimeout(() => {
          this.generateMessageFromBackend(true);
        }, 500);
      }, 500);
    },
    async getAdminToken() {
      const authUrl = this.backendUrl + '/api/v1/auth/login';
      const request = {
        actorAccountName: 'root',
        password: 'root'
      };
      await axios.post(authUrl, request).then((adminData) => {
        this.adminToken = adminData.data.token;
      });
    },
    updateDialogScroll() {
      this.$refs.chatbotDialog.updateScroll();
    },
    generateMessageFromBackend(initialMessage) {
      const optionsToChoose = ['Stein', 'Schere', 'Papier'];
      const messageToSend = initialMessage
        ? 'Hallo, mein Name ist Veri. Ich werde deinen Lernprozess unterstützen! Du kannst aber auch Stein, Schere, Papier mit mir spielen.'
        : optionsToChoose[Math.floor(Math.random() * optionsToChoose.length)];
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.adminToken
      };
      const authUrl =
        'http://localhost:8080/api/v1/users/' +
        this.userIdOrActorAccountName +
        '/chatbot-messages';
      const request = {
        type: 'informational_feedback',
        message: messageToSend
      };
      axios.post(authUrl, request, { headers: authHeader }).then((data) => {
        console.log(data);
      });
    },
    updateMessageHistory(messageSent) {
      this.messageHistory.push(messageSent);
      this.updateDialogScroll();
      setTimeout(() => {
        this.generateMessageFromBackend(false);
      }, 500);
    },
    updateChatbotDialogVisible(dialogVisible) {
      if (dialogVisible) {
        this.$refs.chatbotWidget.fadeOut();
        setTimeout(() => {
          this.chatbotDialogVisible = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            this.$refs.chatbotDialog.fadeIn();
          }, 1);
        }, 300);
      } else {
        this.$refs.chatbotDialog.fadeOut();
        setTimeout(() => {
          this.chatbotDialogVisible = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            this.$refs.chatbotWidget.fadeIn();
          }, 1);
        }, 300);
      }
    }
  }
};
</script>

<template>
  <main>
    <ChatbotWidget
      ref="chatbotWidget"
      :pluginPath="pluginPath"
      @click="updateChatbotDialogVisible(!chatbotDialogVisible)"
      v-if="!chatbotDialogVisible"
    />
    <ChatbotDialog
      ref="chatbotDialog"
      :messageHistory="messageHistory"
      :pluginPath="pluginPath"
      @closeChatbotDialog="updateChatbotDialogVisible(false)"
      @updateMessageHistory="updateMessageHistory"
      v-else
    />
  </main>
</template>

<style lang="scss" scoped>
main {
  outline: none;
  font-family: 'Open Sans', Verdana, Arial, Helvetica, sans-serif;
  font-size: 14px;
}
</style>
