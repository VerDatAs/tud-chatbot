<script lang="ts">
import ChatbotDialog from './components/ChatbotDialog.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';
import { AssistanceObjectCommunication } from './components/types/assistance-object-communication';
import { useDisplayStore } from './stores/display';
import { useNotesStore } from './stores/notes';
import { useMessageExchangeStore } from './stores/messageExchange';
import { useMessageHistoryStore } from './stores/messageHistory';
import axios from 'axios';
import type {AssistanceParameter} from "@/components/types/assistance-parameter";

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
    hasJustLoggedIn: true as boolean,
    backendUrl: 'http://localhost:8080' as string,
    pluginPath: '' as string,
    // WebSocket connection and message sending
    adminToken: '' as string,
    userIdOrActorAccountName: 'ca1910' as string,
    userToken: '' as string,
    // TODO: Fix type
    webSocket: null as any,
    displayStore: useDisplayStore(),
    notesStore: useNotesStore(),
    messageToSend: '' as string,
    messageExchangeStore: useMessageExchangeStore(),
    messageHistoryStore: useMessageHistoryStore(),
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
    if (this.isRunLocally) {
      import('./assets/local-dev.css');
    }
  },
  methods: {
    async initChatbotApp() {
      // Define default variables, e.g., the pluginPath
      this.pluginPath = this.isRunLocally
        ? ''
        : './Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/VerDatAsBot';
      document.addEventListener('init-bot', async (event: any) => {
        // https://github.com/vaadin/vaadin-upload/issues/138#issuecomment-266773430
        console.log('init-bot', event);
        this.pluginPath = event.detail.path;
        // TODO: Uncomment as soon as the backend works
        // this.backendUrl = event.backendUrl;
        this.hasJustLoggedIn = event.detail.hasJustLoggedIn;

        if (!this.isRunLocally) {
          await this.retrieveTokenAndHandleMessageExchange();
        }
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('tab gets visible again', this.webSocket?.readyState);
          this.handleWebSocketConnection(false);
        }
      });

      if (this.isRunLocally) {
        await this.retrieveTokenAndHandleMessageExchange();
      }
    },
    async retrieveTokenAndHandleMessageExchange() {
      await this.getAdminToken();
      await this.handleWebSocketConnection(true);
      // if (this.messageHistoryStore.items.length === 0) {
      //   this.greetUserMessage(true);
      // } else {
      //   this.greetUserMessage(false);
      // }
    },
    async handleWebSocketConnection(switchedPage: boolean) {
      console.log('handleWebSocketConnection');
      if (this.webSocket?.readyState !== 1) {
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
          // potentially send wake-up message
          this.handleWakeUpMessageSending(switchedPage);
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
            // TODO: Due to the message mocking, the message has to be parsed again -> need to be fixed
            // Currently, the object send by /chatbot-messages and /sendAssistanceTest are quite different
            const receivedMessage: AssistanceObjectCommunication = JSON.parse(message).msg ? JSON.parse(JSON.parse(message).msg) : JSON.parse(message);
            console.log('received message', receivedMessage);
            if (!receivedMessage?.parameters) {
              return;
            }
            if (this.checkForKeyPresence(receivedMessage, 'previous_messages')) {
              this.messageExchangeStore.setItems(this.checkForKeyPresence(receivedMessage, 'previous_messages')?.value);
              // If the user has just logged in, display the chatbot dialog
              if (this.hasJustLoggedIn) {
                this.updateChatbotDialogVisible(true);
              }
            } else if (this.checkForKeyPresence(receivedMessage, 'options')) {
              this.messageExchangeStore.addItem(receivedMessage);
              this.acknowledgeMessage(receivedMessage);
            }
            // else if (this.checkForKeyPresence(receivedMessage, 'message')) {
            //   this.messageExchangeStore.addItem(receivedMessage);
            //   this.acknowledgeMessage(receivedMessage);
            // }
            this.updateDialogScroll();
            // const messageToPush: AssistanceObjectCommunication = JSON.parse(message);
            // this.messageHistoryStore.addItem(messageToPush);
          }
        };

        this.webSocket.onclose = () => {
          console.log('WebSocket closed. Clear pong interval.', this.pongInterval);
          window.clearInterval(this.pongInterval);
          // reset value, as it is not done automatically: https://stackoverflow.com/a/5978560/3623608
          this.pongInterval = 0;
        };
      } else {
        // WebSocket connection is still established
        // potentially send wake-up message
        this.handleWakeUpMessageSending(switchedPage);
      }
    },
    checkForKeyPresence(assistanceObject: AssistanceObjectCommunication, key: string): AssistanceParameter | undefined {
      return assistanceObject?.parameters?.find((param) => param.key === key);
    },
    // When switching the page, send information about having just logged in or not
    handleWakeUpMessageSending(switchedPage: boolean) {
      // Delay message until the WebSocket is connected
      setTimeout(() => {
        if (switchedPage) {
          const message = {
            parameters: [
              {
                key: "just_logged_in",
                value: this.hasJustLoggedIn
              }
            ]
          }
          const messageAsJson = JSON.stringify(message);
          this.webSocket.send('MESSAGE\ndestination:/app/user/queue/chat\ncontent-length:' + messageAsJson.length + '\n\n' + messageAsJson + '\0');
          // the backend requests old messages from VSG and send then to the chatbot plugin
          this.mockBackendMessage('previous_messages');
          // if the user has just logged in, the backend will send a greeting message
          if (this.hasJustLoggedIn) {
            // Delay it some time to make it look more realistic
            setTimeout(() => {
              this.mockBackendMessage('greeting');
            }, 1500);
          }
        }
      }, 250);
    },
    // acknowledge the reception of the message
    acknowledgeMessage(receivedMessage: AssistanceObjectCommunication) {
      if (receivedMessage?.messageId) {
        const acknowledgeMessage = {
          messageId: receivedMessage.messageId
        };
        const messageAsJson = JSON.stringify(acknowledgeMessage);
        this.webSocket.send('MESSAGE\ndestination:/app/user/queue/chat\ncontent-length:' + messageAsJson.length + '\n\n' + messageAsJson + '\0');
      }
    },
    // an option has been selected
    selectOption(optionResponse: AssistanceObjectCommunication) {
      const messageAsJson = JSON.stringify(optionResponse);
      this.webSocket.send('MESSAGE\ndestination:/app/user/queue/chat\ncontent-length:' + messageAsJson.length + '\n\n' + messageAsJson + '\0');
    },
    initializePongMessageInterval() {
      // Send pong every 3 seconds, as it is done in the stomp-websocket library
      this.pongInterval = window.setInterval(() => {
        this.webSocket.send(BYTES.LF);
        console.log('Pong message sent.');
      }, 3000);
    },
    /**
     * Helper function to simulate the behavior of the Bot sending a greeting message
     */
    greetUserMessage(isInitialLogin: boolean) {
      setTimeout(() => {
        // TODO: Open dialog automatically, when hasJustLoggedIn
        this.updateChatbotDialogVisible(true);
        setTimeout(() => {
          this.generateMessageFromBackend(isInitialLogin);
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
    mockBackendMessage(type: string) {
      const requestUrl = this.backendUrl + '/api/v1/users/' + this.userIdOrActorAccountName + '/chatbot-messages';
      let baseRequest = {}
      if (type === 'previous_messages') {
        baseRequest = {
          parameters: [
            {
              key: "previous_messages",
              value: [
                {
                  aId: "2EA95788-7ABA-4DDD-B3BA-E7EB574685BD",
                  aoId: "BC2340BA-1623-41F8-9C0D-B4373956E6EC",
                  parameters: [
                    {
                      key: "message",
                      value: "Hallo, ich bin Veri :)"
                    }
                  ]
                },
                {
                  aId: "2EA95788-7ABA-4DDD-B3BA-E7EB574685BR",
                  aoId: "BC2340BA-1623-41F8-9C0D-B4373956E6ED",
                  parameters: [
                    {
                      key: "message_response",
                      value: "Hi Veri!"
                    }
                  ]
                }
              ]
            }
          ]
        };
      } else if (type === 'greeting') {
        baseRequest = {
          aId: "2EA95788-7ABA-4DDD-B3BA-E7EB574685BD",
          aoId: "BC2340BA-1623-41F8-9C0D-B4373956E6EC",
          messageId: "6A4B1434-2CD1-40D5-87DE-B15D17876869",
          parameters: [
            {
              key: "message",
              value: "Willkommen zurück"
            }
          ]
        }
      }
      // Send a mocking request to the backend
      const request = {
        type: 'informational_feedback',
        message: JSON.stringify(baseRequest)
      };
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.adminToken
      };
      axios.post(requestUrl, request, { headers: authHeader }).then((data) => {
        console.log(data);
      });
    },
    generateMessageFromBackend(initialMessage: boolean) {
      const messageToSend = initialMessage
        ? 'Hallo, mein Name ist Veri. Ich werde deinen Lernprozess unterstützen!'
        : 'Willkommen zurück!';
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
    updateMessageHistory(messageSent: AssistanceObjectCommunication) {
      this.messageHistoryStore.addItem(messageSent);
      this.updateDialogScroll();
    },
    updateChatbotDialogVisible(dialogVisible: boolean) {
      if (dialogVisible) {
        (this.$refs.chatbotWidget as typeof ChatbotWidget)?.fadeOut();
        setTimeout(() => {
          this.displayStore.dialogOpen = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            (this.$refs.chatbotDialog as typeof ChatbotDialog).fadeIn();
          }, 1);
        }, 300);
      } else {
        (this.$refs.chatbotDialog as typeof ChatbotDialog)?.fadeOut();
        setTimeout(() => {
          this.displayStore.dialogOpen = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            (this.$refs.chatbotWidget as typeof ChatbotWidget).fadeIn();
          }, 1);
        }, 300);
      }
    },
    updateChatbotNotesVisible(notesVisible: boolean) {
      this.displayStore.changeNotesOpen(notesVisible);
    },
    updateNotes(notes: string) {
      this.notesStore.setNotes(notes);
    }
  }
};
</script>

<template>
  <main :style="isRunLocally ? 'position: fixed; bottom: 0; right: 0; z-index: 998;' : ''">
    <ChatbotWidget
      ref="chatbotWidget"
      :botImagePath="botImagePath"
      @click="updateChatbotDialogVisible(!displayStore.dialogOpen)"
      v-if="!displayStore.dialogOpen"
    />
    <ChatbotDialog
      ref="chatbotDialog"
      :messageExchange="messageExchangeStore.items"
      :messageHistory="messageHistoryStore.items"
      :botImagePath="botImagePath"
      :notesVisible="displayStore.notesOpen"
      :notes="notesStore.text"
      @closeChatbotDialog="updateChatbotDialogVisible(false)"
      @resetMessageHistory="messageExchangeStore.clearItems()"
      @selectOption="selectOption"
      @updateMessageHistory="updateMessageHistory"
      @updateChatbotNotesVisible="updateChatbotNotesVisible"
      @updateNotes="updateNotes"
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
