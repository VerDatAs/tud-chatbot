<script lang="ts">
import ChatbotDialog from '@/components/ChatbotDialog.vue';
import ChatbotWidget from '@/components/ChatbotWidget.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { useDisplayStore } from '@/stores/display';
import { useGroupInformationStore } from '@/stores/groupInformation';
import { useNotesStore } from '@/stores/notes';
import { useMessageExchangeStore } from '@/stores/messageExchange';
import { useMessageHistoryStore } from '@/stores/messageHistory';
import { parameterValue } from '@/util/assistanceObjectHelper';
import { ChatbotData } from "@/components/types/chatbot-data";

// Retrieved from: https://github.com/JSteunou/webstomp-client/blob/master/src/utils.js#L27
// Define constants for bytes used throughout the code.
const BYTES = {
  // LINEFEED byte (octet 10)
  LF: '\x0A',
  // NULL byte (octet 0)
  NULL: '\x00'
};

const webSocketDestination = '/user/queue/chat';

export default {
  data: () => ({
    hasJustLoggedIn: false as boolean,
    backendUrl: '' as string,
    pluginPath: '' as string,
    isRunLocally: false as boolean,
    // WebSocket connection and message sending
    pseudoId: '' as string,
    userToken: '' as string,
    // TODO: Fix type
    webSocket: null as any,
    displayStore: useDisplayStore(),
    groupInformationStore: useGroupInformationStore(),
    notesStore: useNotesStore(),
    messageToSend: '' as string,
    messageExchangeStore: useMessageExchangeStore(),
    messageHistoryStore: useMessageHistoryStore(),
    incomingMessageTypes: ['message', 'options', 'group', 'assistance_state_update'],
    outgoingMessageTypes: ['message_response', 'options_response', 'assistance_state_update_response'],
    pongInterval: 0 as number
  }),
  components: {
    ChatbotDialog,
    ChatbotWidget
  },
  props: {
    initChatbotData: {
      type: ChatbotData,
      required: true
    }
  },
  computed: {
    botImagePath() {
      return this.pluginPath + (!this.isRunLocally ? '/templates' : '') + '/veri.png';
    }
  },
  created() {
    this.initChatbotApp();
    if (this.isRunLocally) {
      import('./assets/local-dev.scss');
    }
  },
  methods: {
    async initChatbotApp() {
      this.isRunLocally = this.initChatbotData?.isRunLocally ?? false
      this.pluginPath = this.initChatbotData.pluginPath;
      this.backendUrl = this.initChatbotData.backendUrl;
      this.pseudoId = this.initChatbotData.pseudoId;
      this.userToken = this.initChatbotData.token;
      this.hasJustLoggedIn = this.initChatbotData.hasJustLoggedIn;
      await this.retrieveTokenAndHandleMessageExchange();
    },
    async retrieveTokenAndHandleMessageExchange() {
      if (this.hasJustLoggedIn) {
        // On login, reset potentially send messages
        this.messageExchangeStore.clearItems();
      }
      await this.handleWebSocketConnection(true);
      // TODO: Remove as soon as the previous messages are sent
      if (this.hasJustLoggedIn) {
        this.updateChatbotDialogVisible(true);
      }
    },
    async handleWebSocketConnection(switchedPage: boolean) {
      console.log('handleWebSocketConnection');
      if (this.webSocket?.readyState !== 1) {
        const backendUrlProtocol = this.backendUrl.includes('https://') ? 'https://' : 'http://';
        const webSocketPrefix = (backendUrlProtocol === 'https://') ? 'wss://' : 'ws://';
        const webSocketURL = webSocketPrefix + this.backendUrl.split(backendUrlProtocol)?.[1] + '/api/v1/websocket';
        // TODO: "Vue: This expression is not constructable."
        this.webSocket = new WebSocket(webSocketURL);

        // Use code provided by Robert Peine from verdatas-backend README
        this.webSocket.onopen = () => {
          this.webSocket.send('CONNECT\ntoken:' + this.userToken + '\naccept-version:1.2\nheart-beat:3000,3000\n\n\0');
          // there is only one destination that needs to be subscribed: /user/queue/chat
          // dirty workaround to not send SUBSCRIBE before CONNECTED was received
          setTimeout(() => {
            this.webSocket.send('SUBSCRIBE\nid:sub-0\ndestination:' + webSocketDestination + '\n\n\0');
            // potentially send wake-up message
            this.handleWakeUpMessageSending(switchedPage);
          }, 50);
        };

        this.webSocket.onmessage = (event: any) => {
          // console.log('incoming message event', event);
          // extract content between \n\n and \0
          const message: string = event.data.substring(event.data.indexOf('\n\n') + 2, event.data.lastIndexOf('\0'));
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
            // currently, the objects sent by /chatbot-messages and /sendAssistanceTest are quite different
            const receivedMessageParsed: AssistanceObjectCommunication = JSON.parse(message).msg
              ? JSON.parse(JSON.parse(message).msg)
              : JSON.parse(message);
            // TODO: Find a better solution for this workaround (https://stackoverflow.com/a/41256353)
            // check, if the type casting was done properly
            // console.log(receivedMessage instanceof AssistanceObjectCommunication);

            // if "previous_messages" or "unacknowledged_messages" do exist in the parameter keys, the value will be an Array of AssistanceObjectCommunications
            // else, it is a single AssistanceObjectCommunication
            // idea, use queue of correctly parsed AssistanceObjectCommunication objects
            const messagesQueue: AssistanceObjectCommunication[] = [];
            if (this.checkForKeyPresence(receivedMessageParsed, 'previous_messages')) {
              parameterValue(receivedMessageParsed, 'previous_messages')?.forEach((message: any) => {
                messagesQueue.push(Object.assign(new AssistanceObjectCommunication(), message));
              });
            }
            else if (this.checkForKeyPresence(receivedMessageParsed, 'unacknowledged_messages')) {
              parameterValue(receivedMessageParsed, 'unacknowledged_messages')?.forEach((message: any) => {
                messagesQueue.push(Object.assign(new AssistanceObjectCommunication(), message));
              });
            }
            else {
              messagesQueue.push(Object.assign(new AssistanceObjectCommunication(), receivedMessageParsed));
            }

            // iterate messages
            messagesQueue.forEach((receivedMessage) => {
              if (!receivedMessage?.parameters) {
                return;
              }
              if (this.checkForKeyPresence(receivedMessage, 'previous_messages')) {
                // TODO: Find a better solution for this workaround (https://stackoverflow.com/a/41256353)
                const previousMessagesArray: AssistanceObjectCommunication[] = this.checkForKeyPresence(receivedMessage, 'previous_messages')?.value;
                const previousMessages: AssistanceObjectCommunication[] = [];
                previousMessagesArray.forEach((previousMessage: AssistanceObjectCommunication) => {
                  previousMessages.push(Object.assign(new AssistanceObjectCommunication(), previousMessage));
                })
                this.messageExchangeStore.setItems(previousMessages);
                // If the user has just logged in, display the chatbot dialog
                if (this.hasJustLoggedIn) {
                  this.updateChatbotDialogVisible(true);
                }
              } else if (this.checkForKeyPresence(receivedMessage, 'options')) {
                this.messageExchangeStore.addItem(receivedMessage);
                this.acknowledgeMessage(receivedMessage);
              } else if (this.checkForKeyPresence(receivedMessage, 'group')) {
                // store group in both messageExchange and groupInformation store
                this.messageExchangeStore.addItem(receivedMessage);
                this.groupInformationStore.addItem(receivedMessage);
                this.acknowledgeMessage(receivedMessage);
              } else if (this.checkForKeyPresence(receivedMessage, 'assistance_state_update')) {
                this.messageExchangeStore.addItem(receivedMessage);
                // potentially remove item from groupInformationStore
                if (this.parameterValue(receivedMessage, 'assistance_state_update') === 'completed') {
                  this.groupInformationStore.removeItem(receivedMessage.aId, receivedMessage.aoId);
                }
                this.acknowledgeMessage(receivedMessage);
              } else if (this.checkForKeyPresence(receivedMessage, 'message')) {
                this.messageExchangeStore.addItem(receivedMessage);
                this.acknowledgeMessage(receivedMessage);
              }
            });
            this.updateDialogScroll();
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
    // https://stackoverflow.com/a/60617142
    parameterValue,
    // When switching the page, send information about having just logged in or not
    handleWakeUpMessageSending(switchedPage: boolean) {
      // Delay message until the WebSocket is connected
      setTimeout(() => {
        if (switchedPage) {
          const message: AssistanceObjectCommunication = {
            parameters: [
              {
                key: 'just_logged_in',
                value: this.hasJustLoggedIn
              },
              {
                key: 'lms_url',
                value: window.location.origin
              }
            ]
          };
          this.sendWebSocketMessage(message);
          // the backend requests old messages from VSG and send then to the chatbot plugin
          // this.mockAssistanceRequest('previous_messages');
          // if the user has just logged in, the backend will send a greeting message
          // TODO: Comment in later, if this gets relevant again
          if (this.hasJustLoggedIn) {
            // Delay it some time to make it look more realistic
            setTimeout(() => {
              this.mockAssistanceRequest('greeting');
            }, 500);
          }
        }
      }, 250);
    },
    // handle message sending over the WebSocket
    sendWebSocketMessage(messageToSend: AssistanceObjectCommunication, destinationToOverwrite?: String) {
      const messageAsJson = JSON.stringify(messageToSend);
      const destination = (destinationToOverwrite && destinationToOverwrite !== '') ? destinationToOverwrite : webSocketDestination;
      this.webSocket.send(
        'MESSAGE\ndestination:' +
        destination +
        '\ncontent-length:' +
        this.countBytes(messageAsJson) +
        '\n\n' +
        messageAsJson +
        '\0'
      );

      // add any valid outgoing message to the messageExchangeStore
      if (messageToSend?.parameters?.find((param) => this.outgoingMessageTypes.includes(param.key))) {
        this.messageExchangeStore.addItem(messageToSend);
        this.updateDialogScroll();
      }
      // remove terminated group from the groupInformationStore
      if (messageToSend?.parameters?.find((param) => param.key === 'assistance_state_update_response' && param.value === 'completed')) {
        this.groupInformationStore.removeItem(messageToSend.aId, messageToSend.aoId);
      }
    },
    // acknowledge the reception of the message
    acknowledgeMessage(receivedMessage: AssistanceObjectCommunication) {
      if (receivedMessage?.messageId) {
        const acknowledgeMessage: AssistanceObjectCommunication = {
          messageId: receivedMessage.messageId
        };
        this.sendWebSocketMessage(acknowledgeMessage);
      }
    },
    initializePongMessageInterval() {
      // Send pong every 3 seconds, as it is done in the stomp-websocket library
      this.pongInterval = window.setInterval(() => {
        this.webSocket.send(BYTES.LF);
        console.log('Pong message sent.');
      }, 3000);
    },
    updateDialogScroll() {
      // https://stackoverflow.com/a/76297364/3623608
      (this.$refs.chatbotDialog as typeof ChatbotDialog)?.updateScroll();
    },
    mockAssistanceRequest(type: String) {
      const webSocketTestDestination = '/tutoring-system/queue/assistance';
      let messageToSend = {};
      if (type === 'greeting') {
        messageToSend = {
          "assistance": [
            {
              "aId": "2EA95788-7ABA-4DDD-B3BA-E7EB574685BD",
              "userId": this.pseudoId,
              "typeKey": "greeting",
              "timestamp": "2023-06-27T10:12:53.000000+02:00",
              "assistanceState": "completed",
              "assistanceObjects": [
                {
                  "userId": this.pseudoId,
                  "aoId": "BC2340BA-1623-41F8-9C0D-B4373956E6EC",
                  "timestamp": "2023-06-27T10:12:53.000000+02:00",
                  "parameters": [
                    {
                      "key": "message",
                      "value": "Hallo! Mein Name ist Veri und ich bin dein Lernassistent. Ich unterstütze Dich beim Lernen und gebe Dir Rückmeldung und hilfreiche Tipps.\n\nDies ist lediglich als Beispielnachricht zur Demonstration der Funktionsweise zu verstehen.\n\nWeitere Funktionen sind vorbereitet, aber noch nicht aktiv."
                    }
                  ]
                }
              ]
            }
          ]
        };
      }
      this.sendWebSocketMessage(messageToSend, webSocketTestDestination);
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
    // Solution retrieved from https://github.com/rabbitmq/rabbitmq-web-stomp-examples/issues/2
    countBytes(message: string) {
      const escapedStr = encodeURI(message);
      if (escapedStr.indexOf("%") != -1) {
        let count = escapedStr.split("%").length - 1;
        if (count == 0) count++;
        const tmp = escapedStr.length - (count * 3);
        return count + tmp;
      }
      else return escapedStr.length;
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
      :bot-image-path="botImagePath"
      :groups="groupInformationStore.items"
      :incoming-message-types="incomingMessageTypes"
      :message-exchange="messageExchangeStore.items"
      :message-history="messageHistoryStore.items"
      :notes-visible="displayStore.notesOpen"
      :notes="notesStore.text"
      :outgoing-message-types="outgoingMessageTypes"
      @closeChatbotDialog="updateChatbotDialogVisible(false)"
      @resetMessageHistory="messageExchangeStore.clearItems()"
      @sendAssistanceObject="sendWebSocketMessage"
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
