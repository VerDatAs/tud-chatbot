<script lang="ts">
import ChatbotDialog from './components/ChatbotDialog.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';
import axios from 'axios';
import { Message } from './components/types/message';

// Retrieved from: https://github.com/JSteunou/webstomp-client/blob/master/src/utils.js#L27
// Define constants for bytes used throughout the code.
const BYTES = {
  // LINEFEED byte (octet 10)
  LF: '\x0A',
  // NULL byte (octet 0)
  NULL: '\x00'
};

export default {
  data: () => ({
    chatbotDialogVisible: false as boolean,
    backendUrl: 'http://localhost:8080' as string,
    pluginPath: '' as string,
    // WebSocket connection and message sending
    adminToken: '' as string,
    userIdOrActorAccountName: 'ca1910' as string,
    userToken: '' as string,
    // TODO: Fix type
    webSocket: null as any,
    messageToSend: '' as string,
    messageHistory: [] as Message[],
    pongInterval: 0 as number
  }),
  components: {
    ChatbotDialog,
    ChatbotWidget
  },
  computed: {
    botImagePath() {
      return this.pluginPath + (!this.isRunLocally ? '/templates' : '') + '/veri.png';
    },
    isRunLocally() {
      return process.env.NODE_ENV === 'development';
    }
  },
  created() {
    this.initChatbotApp();
  },
  methods: {
    async initChatbotApp() {
      // Define default variables, e.g., the pluginPath
      this.pluginPath = this.isRunLocally
        ? ''
        : './Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/VerDatAsBot';
      document.addEventListener('init-path', (event: any) => {
        // https://github.com/vaadin/vaadin-upload/issues/138#issuecomment-266773430
        console.log('init-path', event);
        this.pluginPath = event.detail;
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('tab gets visible again', this.webSocket?.readyState);
          if (this.webSocket?.readyState !== 1) {
            this.initWebSocketConnection();
          }
        }
      });
      await this.getAdminToken();
      await this.initWebSocketConnection();
      this.showInitialBotMessage();
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
      const webSocketURL = 'ws://' + this.backendUrl.split('http://')?.[1] + '/api/v1/websocket';
      // TODO: "Vue: This expression is not constructable."
      this.webSocket = new WebSocket(webSocketURL);

      // Use code provided by Robert Peine from verdatas-backend README
      this.webSocket.onopen = () => {
        this.webSocket.send('CONNECT\ntoken:' + this.userToken + '\naccept-version:1.2\nheart-beat:3000,3000\n\n\0');
        // there is only one destination that needs to be subscribed: /user/queue/chat
        this.webSocket.send('SUBSCRIBE\nid:sub-0\ndestination:/user/queue/chat\n\n\0');
      };

      this.webSocket.onmessage = (event: any) => {
        // console.log('incoming message event', event);
        // extract content between \n\n and \0
        const message = event.data.substring(event.data.indexOf('\n\n') + 2, event.data.lastIndexOf('\0'));
        // verdatas-backend sends JSON data in body of STOMP messages that can be deserialized
        // If no message ('') is received, it is the connect message
        if (!message) {
          console.log('Connected message. Initialize pong message interval.');
          this.initializePongMessageInterval();
        }
        // If BYTES.LF is received, it is a ping message
        // Retrieved from: https://github.com/JSteunou/webstomp-client/blob/master/src/client.js#L74
        else if (message === BYTES.LF) {
          console.log('Ping message received.');
        }
        // Other, "real" messages
        else {
          const messageToPush: Message = JSON.parse(message);
          this.messageHistory.push(messageToPush);
          this.updateDialogScroll();
          // console.log('other message', messageToPush);
        }
      };

      this.webSocket.onclose = () => {
        console.log('WebSocket closed. Clear pong interval.', this.pongInterval);
        window.clearInterval(this.pongInterval);
        // reset value, as it is not done automatically: https://stackoverflow.com/a/5978560/3623608
        this.pongInterval = 0;
      };
    },
    initializePongMessageInterval() {
      // Send pong every 3 seconds, as it is done in the stomp-websocket library
      this.pongInterval = window.setInterval(() => {
        this.webSocket.send(BYTES.LF);
        console.log('Pong message sent.');
      }, 3000);
    },
    /**
     * Helper function to simulate the behavior of the Bot sending an initial introduc
     */
    showInitialBotMessage() {
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
      // https://stackoverflow.com/a/76297364/3623608
      (this.$refs.chatbotDialog as typeof ChatbotDialog).updateScroll();
    },
    generateMessageFromBackend(initialMessage: boolean) {
      const optionsToChoose = ['Stein', 'Schere', 'Papier'];
      const messageToSend = initialMessage
        ? 'Hallo, mein Name ist Veri. Ich werde deinen Lernprozess unterstützen! Du kannst aber auch Stein, Schere, Papier mit mir spielen.'
        : optionsToChoose[Math.floor(Math.random() * optionsToChoose.length)];
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.adminToken
      };
      const authUrl = 'http://localhost:8080/api/v1/assistance/sendAssistanceTest';
      const request = {
        assistance: [
          {
            aId: '2EA95788-7ABA-4DDD-B3BA-E7EB574685BD',
            userId: this.userIdOrActorAccountName,
            typeKey: 'offer_help_options',
            timestamp: '2023-06-27T10:12:53.000000+02:00',
            assistanceState: 'initiated',
            assistanceObjects: [
              {
                userId: this.userIdOrActorAccountName,
                aoId: 'BC2340BA-1623-41F8-9C0D-B4373956E6EC',
                timestamp: '2023-06-27T10:12:53.000000+02:00',
                parameters: [
                  {
                    key: 'message',
                    value: messageToSend
                  },
                  {
                    key: 'options',
                    value: [
                      {
                        key: 'example_solution',
                        value: 'Lösungsbeispiel anzeigen'
                      },
                      {
                        key: 'group_formation',
                        value: 'Gruppe bilden'
                      },
                      {
                        key: 'cancel',
                        value: 'Hilfe ablehnen'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
      axios.post(authUrl, request, { headers: authHeader }).then((data) => {
        console.log(data);
      });
    },
    updateMessageHistory(messageSent: Message) {
      this.messageHistory.push(messageSent);
      this.updateDialogScroll();
      setTimeout(() => {
        this.generateMessageFromBackend(false);
      }, 500);
    },
    updateChatbotDialogVisible(dialogVisible: boolean) {
      if (dialogVisible) {
        (this.$refs.chatbotWidget as typeof ChatbotWidget).fadeOut();
        setTimeout(() => {
          this.chatbotDialogVisible = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            (this.$refs.chatbotDialog as typeof ChatbotDialog).fadeIn();
          }, 1);
        }, 300);
      } else {
        (this.$refs.chatbotDialog as typeof ChatbotDialog).fadeOut();
        setTimeout(() => {
          this.chatbotDialogVisible = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            (this.$refs.chatbotWidget as typeof ChatbotWidget).fadeIn();
          }, 1);
        }, 300);
      }
    }
  }
};
</script>

<template>
  <main :style="isRunLocally ? 'position: fixed; bottom: 0; right: 0; z-index: 998;' : ''">
    <ChatbotWidget
      ref="chatbotWidget"
      :botImagePath="botImagePath"
      @click="updateChatbotDialogVisible(!chatbotDialogVisible)"
      v-if="!chatbotDialogVisible"
    />
    <ChatbotDialog
      ref="chatbotDialog"
      :messageHistory="messageHistory"
      :botImagePath="botImagePath"
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
