<script lang="ts">
import ChatbotDialog from '@/components/ChatbotDialog.vue';
import ChatbotWidget from '@/components/ChatbotWidget.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceObjectQueueItem } from '@/components/types/assistance-object-queue-item';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { useChatbotDataStore } from '@/stores/chatbotData';
import { useDisplayStore } from '@/stores/display';
import { useNotesAndPeerSolutionStore } from '@/stores/notesAndPeerSolution';
import { useMessageExchangeStore } from '@/stores/messageExchange';
import { checkForKeyPresence, parameterValue } from '@/util/assistanceObjectHelper';

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
    chatbotDataStore: useChatbotDataStore(),
    displayStore: useDisplayStore(),
    notesAndPeerSolutionStore: useNotesAndPeerSolutionStore(),
    messageToSend: '' as string,
    messageExchangeStore: useMessageExchangeStore(),
    incomingMessageTypes: ['message', 'options', 'related_users', 'state_update', 'system_message', 'uri', 'user_message'],
    outgoingMessageTypes: ['message_response', 'options_response', 'state_update_response'],
    pongInterval: 0 as number,
    pingTimeout: 0 as number,
    // use triggerVariable to update changed webSocket: https://stackoverflow.com/a/64009199
    triggerVariable: 0
  }),
  components: {
    ChatbotDialog,
    ChatbotWidget
  },
  computed: {
    botImagePath() {
      return this.pluginPath + (!this.isRunLocally ? '/templates' : '') + '/veri.png';
    },
    isWebSocketConnected() {
      return this.triggerVariable > 0 && this.webSocket?.readyState === 1;
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
      // add listener for visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('The tab gets visible again.', this.webSocket?.readyState);
          this.handleWebSocketConnection(false);
        }
      });
      this.isRunLocally = this.chatbotDataStore.data?.isRunLocally ?? false;
      this.pluginPath = this.chatbotDataStore.data.pluginPath;
      this.backendUrl = this.chatbotDataStore.data.backendUrl;
      this.pseudoId = this.chatbotDataStore.data.pseudoId;
      this.userToken = this.chatbotDataStore.data.token;
      this.hasJustLoggedIn = this.chatbotDataStore.data.hasJustLoggedIn;
      await this.retrieveTokenAndHandleMessageExchange();
    },
    async retrieveTokenAndHandleMessageExchange() {
      if (this.hasJustLoggedIn) {
        // On login, reset potentially send messages
        this.messageExchangeStore.clearItems();
        // Also reset the displaying parameters
        this.displayStore.resetValues();
      }
      await this.handleWebSocketConnection(true);
    },
    async handleWebSocketConnection(switchedPage: boolean) {
      console.log('handleWebSocketConnection');
      if (this.webSocket?.readyState !== 1) {
        const backendUrlProtocol = this.backendUrl.includes('https://') ? 'https://' : 'http://';
        const webSocketPrefix = backendUrlProtocol === 'https://' ? 'wss://' : 'ws://';
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
          this.triggerVariable += 1;
          // console.log('incoming message event', event);
          // extract content between \n\n and \0
          const message: string = event.data.substring(event.data.indexOf('\n\n') + 2, event.data.lastIndexOf('\0'));
          // verdatas-backend sends JSON data in body of STOMP messages that can be deserialized
          // If no message ('') is received, it is the connect message
          if (!message) {
            console.log('Connected message. Initialize pong message interval and ping timeout check.');
            this.initializePongMessageInterval();
            this.clearAndResetPingTimeout();
          }
          // If BYTES.LF is received, it is a ping message
          // Retrieved from: https://github.com/JSteunou/webstomp-client/blob/master/src/client.js#L74
          else if (message === BYTES.LF) {
            console.log('Ping message received.');
            this.clearAndResetPingTimeout();
          }
          // Other, "real" messages
          else {
            // it is necessary to parse the message
            // hint: even though this might be huge objects (tested with 8000 messages), this takes like 30ms to execute
            const receivedMessageParsed: AssistanceObjectCommunication = JSON.parse(message);
            console.time('messageDelivering');
            // if "previous_messages" or "unacknowledged_messages" do exist in the parameter keys, the value will be an Array of AssistanceObjectCommunications
            // else, it is a single AssistanceObjectCommunication
            // idea, use a queue of AssistanceObjectQueueItems containing correctly parsed AssistanceObjectCommunication objects
            // as well as the information, whether it must be acknowledged or not
            const messagesQueue: AssistanceObjectQueueItem[] = [];
            // either previous_messages or unacknowledged_messages are retrieved when sending a wake-up message
            // previous_messages might include "old" unacknowledged messages, whose are acknowledged automatically now
            if (this.checkForKeyPresence(receivedMessageParsed, 'previous_messages')) {
              parameterValue(receivedMessageParsed, 'previous_messages')?.forEach((message: any) => {
                messagesQueue.push(new AssistanceObjectQueueItem(message, false));
              });
              // the retrieval of the message including the previous_messages itself has to be acknowledged
              this.acknowledgeMessage(receivedMessageParsed);
            }
            // handles the retrieval of unacknowledged_messages (just_logged_in: false)
            else if (this.checkForKeyPresence(receivedMessageParsed, 'unacknowledged_messages')) {
              const unacknowledgedMessages = parameterValue(receivedMessageParsed, 'unacknowledged_messages');
              // at least one unacknowledged message has to exist, otherwise, the handling will be skipped
              if (unacknowledgedMessages?.length > 0) {
                const existingMessages = this.messageExchangeStore.items;
                const emptyExistingMessages = !existingMessages?.length;
                const lastExistingMessageTimestamp = !emptyExistingMessages && existingMessages[existingMessages.length - 1].timestamp;
                const firstUnacknowledgedMessageTimestamp = unacknowledgedMessages[0].timestamp;
                const timestampsExistAndExistingMessagesAreOlder = lastExistingMessageTimestamp && firstUnacknowledgedMessageTimestamp && new Date(lastExistingMessageTimestamp)?.getTime() < new Date(firstUnacknowledgedMessageTimestamp)?.getTime();
                // either the existing messages are empty or the existing messages are older than the unacknowledged ones
                if (emptyExistingMessages || timestampsExistAndExistingMessagesAreOlder) {
                  // push the unacknowledged messages to the queue (add to existing messages + acknowledge them)
                  unacknowledgedMessages.forEach((msg: AssistanceObjectCommunication) => {
                    // unacknowledged_messages might include previous_messages
                    if (this.checkForKeyPresence(msg, 'previous_messages')) {
                      const unacknowledgedPreviousMessages = parameterValue(msg, 'previous_messages');
                      unacknowledgedPreviousMessages?.forEach((previousMsg: AssistanceObjectCommunication) => {
                        messagesQueue.push(new AssistanceObjectQueueItem(previousMsg, false));
                      });
                      // acknowledge the msg containing previous_messages
                      this.acknowledgeMessage(msg);
                    } else {
                      messagesQueue.push(new AssistanceObjectQueueItem(msg, true));
                    }
                  })
                }
                // otherwise, clear the chatbot history and request the prior_messages again by sending a wake-up message
                else {
                  this.messageExchangeStore.clearItems();
                  // temporary set the hasJustLoggedIn value to true to request the prior_messages again
                  this.hasJustLoggedIn = true;
                  this.handleWakeUpMessageSending(true);
                  // reset the hasJustLoggedIn value back to its existing value (false)
                  setTimeout(() => {
                    this.hasJustLoggedIn = false;
                  }, 250);
                }
              }
            }
            else {
              messagesQueue.push(new AssistanceObjectQueueItem(receivedMessageParsed, true));
            }

            // iterate messages (array of AssistanceObjectQueueItems)
            messagesQueue.forEach((queueItem: AssistanceObjectQueueItem, index: number) => {
              const receivedMessage: AssistanceObjectCommunication = queueItem.assistanceObject;
              if (!receivedMessage?.parameters) {
                return;
              }
              // It is assumed that the message received is valid
              // TODO: Find a better solution for this workaround (https://stackoverflow.com/a/41256353)
              // check, if the type casting was done properly
              // console.log(receivedMessage instanceof AssistanceObjectCommunication);
              this.messageExchangeStore.addItem(Object.assign(new AssistanceObjectCommunication(), receivedMessage));

              // if the message was not part of previous_messages, acknowledge it
              if (queueItem.requiresAcknowledgement) {
                this.acknowledgeMessage(receivedMessage);
              }
              // next, check, if it requires an additional action
              this.checkIncomingMessageForAction(receivedMessage, queueItem.requiresAcknowledgement, messagesQueue.length === (index - 1));
            });
            // if the user has just logged in, automatically display the chatbot dialog
            // TODO: the chatbot might be invisible some time when the view is rendered
            if (this.hasJustLoggedIn) {
              this.updateChatbotDialogVisible(true);
              // dialog scrolling might be delayed due to message loading
              // TODO: call method depending on the visibility of the component
              setTimeout(() => {
                this.updateDialogScroll();
              }, 2000)
            }
            this.updateDialogScroll();
            console.timeEnd('messageDelivering');
          }
        };

        this.webSocket.onclose = () => {
          this.triggerVariable += 1;
          console.log('WebSocket closed. Clear pong interval and ping timeout.', this.pongInterval);
          window.clearInterval(this.pongInterval);
          if (this.pingTimeout) {
            window.clearTimeout(this.pingTimeout);
            this.pingTimeout = 0;
          }
          // reset value, as it is not done automatically: https://stackoverflow.com/a/5978560/3623608
          this.pongInterval = 0;
          // TODO: Attempt reconnect the WebSocket
        };
      } else {
        // WebSocket connection is still established
        // potentially send wake-up message
        this.handleWakeUpMessageSending(switchedPage);
      }
    },
    // https://stackoverflow.com/a/60617142
    checkForKeyPresence,
    parameterValue,
    // When switching the page, send information about having just logged in or not
    handleWakeUpMessageSending(switchedPage: boolean) {
      // Delay message until the WebSocket is connected
      // TODO: Find a more reliable method, e.g., listening for the CONNECTED message
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
        }
      }, 250);
    },
    // handle message sending over the WebSocket
    sendWebSocketMessage(messageToSend: AssistanceObjectCommunication) {
      const messageAsJson = JSON.stringify(messageToSend);
      this.webSocket.send(
        'MESSAGE\ndestination:' +
          webSocketDestination +
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
    },
    // check incoming message for an action to execute
    checkIncomingMessageForAction(receivedMessage: AssistanceObjectCommunication, isLiveMessage: boolean, isLastItem: boolean) {
      // actions that are executed when the message is retrieved in real-time
      if (isLiveMessage) {
        // it is requested to automatically send the solution
        if (parameterValue(receivedMessage, 'operation') === 'send_solution') {
          const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
          // Use aId of the received message to answer it
          messageToSend.aId = receivedMessage.aId;
          messageToSend.parameters = [new AssistanceParameter('solution_response', this.notesAndPeerSolutionStore.notes)];
          this.sendWebSocketMessage(messageToSend);
        }
        // disable_chat will automatically reset the input field
        else if (parameterValue(receivedMessage, 'operation') === 'disable_chat') {
          (this.$refs.chatbotDialog as typeof ChatbotDialog)?.resetInput();
        }
        // reset_notes will reset the notes to the template
        else if (parameterValue(receivedMessage, 'operation') === 'reset_notes') {
          this.notesAndPeerSolutionStore.resetNotes();
        }
      }
      // the solution might also need to be sent, if it is the last message in previous_messages
      else if (isLastItem && parameterValue(receivedMessage, 'operation') === 'send_solution') {
        const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
        // Use aId of the received message to answer it
        messageToSend.aId = receivedMessage.aId;
        messageToSend.parameters = [new AssistanceParameter('solution_response', this.notesAndPeerSolutionStore.notes)];
        this.sendWebSocketMessage(messageToSend);
      }
      // actions that are executed in any case
      // operations have to be processed
      if (checkForKeyPresence(receivedMessage, 'operation')) {
        // process every operation message
        this.displayStore.processOperation(receivedMessage);
        // enable_notes will automatically open the notes and peer solution
        if (parameterValue(receivedMessage, 'operation') === 'enable_notes') {
          this.displayStore.changeNotesAndPeerSolutionOpen(true);
        }
      }
      // the template for the solution is provided
      else if (checkForKeyPresence(receivedMessage, 'solution_template')) {
        this.notesAndPeerSolutionStore.setTemplate(parameterValue(receivedMessage, 'solution_template'));
      }
      // the solution_response is provided
      else if (checkForKeyPresence(receivedMessage, 'solution_response')) {
        this.notesAndPeerSolutionStore.setSolutionResponse(parameterValue(receivedMessage, 'solution_response'))
      }
      // the peer solution is provided
      else if (checkForKeyPresence(receivedMessage, 'peer_solution')) {
        this.notesAndPeerSolutionStore.setPeerSolution(parameterValue(receivedMessage, 'peer_solution'));
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
    clearAndResetPingTimeout() {
      if (this.pingTimeout) {
        window.clearTimeout(this.pingTimeout);
        this.pingTimeout = 0;
      }
      // If no ping message is received within 10 seconds, force disconnection of the WebSocket
      this.pingTimeout = window.setTimeout(() => {
        this.webSocket.close();
      }, 10000);
    },
    updateDialogScroll() {
      // https://stackoverflow.com/a/76297364/3623608
      (this.$refs.chatbotDialog as typeof ChatbotDialog)?.updateScroll();
    },
    updateChatbotDialogVisible(dialogVisible: boolean) {
      if (dialogVisible) {
        (this.$refs.chatbotWidget as typeof ChatbotWidget)?.fadeOut();
        setTimeout(() => {
          this.displayStore.dialogOpen = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            (this.$refs.chatbotDialog as typeof ChatbotDialog)?.fadeIn();
          }, 1);
        }, 300);
      } else {
        (this.$refs.chatbotDialog as typeof ChatbotDialog)?.fadeOut();
        setTimeout(() => {
          this.displayStore.dialogOpen = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            (this.$refs.chatbotWidget as typeof ChatbotWidget)?.fadeIn();
          }, 1);
        }, 300);
      }
    },
    // Solution retrieved from https://github.com/rabbitmq/rabbitmq-web-stomp-examples/issues/2
    countBytes(message: string) {
      const escapedStr = encodeURI(message);
      if (escapedStr.indexOf('%') != -1) {
        let count = escapedStr.split('%').length - 1;
        if (count == 0) count++;
        const tmp = escapedStr.length - count * 3;
        return count + tmp;
      } else return escapedStr.length;
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
      :chat-enabled="displayStore.chatEnabled"
      :groups="messageExchangeStore.groups"
      :incoming-message-types="incomingMessageTypes"
      :is-web-socket-connected="isWebSocketConnected"
      :message-exchange="messageExchangeStore.items"
      :notes="notesAndPeerSolutionStore.notes"
      :notes-and-peer-solution-visible="displayStore.notesAndPeerSolutionOpen && displayStore.notesEnabled"
      :notes-enabled="displayStore.notesEnabled"
      :notes-command-enabled="displayStore.notesCommandEnabled"
      :notes-input-enabled="displayStore.notesInputEnabled"
      :outgoing-message-types="outgoingMessageTypes"
      :peer-solution="notesAndPeerSolutionStore.peerSolution"
      :peer-solution-enabled="displayStore.peerSolutionEnabled"
      :peer-solution-command-enabled="displayStore.peerSolutionCommandEnabled"
      @closeChatbotDialog="updateChatbotDialogVisible(false)"
      @reconnectWebSocket="handleWebSocketConnection(false)"
      @sendAssistanceObject="sendWebSocketMessage"
      v-else
    />
  </main>
  <DialogsWrapper />
</template>

<style lang="scss" scoped>
main {
  outline: none;
  font-family: 'Open Sans', Verdana, Arial, Helvetica, sans-serif;
  font-size: 14px;
}
</style>
