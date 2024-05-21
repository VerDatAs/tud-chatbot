<!--
Chatbot for the assistance system developed as part of the VerDatAs project
Copyright (C) 2023-2024 TU Dresden (Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">
import ChatbotDialog from '@/components/ChatbotDialog.vue';
import ChatbotWidget from '@/components/ChatbotWidget.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { AssistanceObjectQueueItem } from '@/components/types/assistance-object-queue-item';
import { AssistanceParameter } from '@/components/types/assistance-parameter';
import { useChatbotDataStore } from '@/stores/chatbotData';
import { useDisplayStore } from '@/stores/display';
import { useMessageExchangeStore } from '@/stores/messageExchange';
import { useNotesAndPeerSolutionStore } from '@/stores/notesAndPeerSolution';
import { checkForKeyPresence, parameterValue } from '@/util/assistanceObjectHelper';

// The escaped hexadecimal line feed and equivalent of \n (https://stackoverflow.com/a/9021756/3623608)
const lineFeedByte = '\x0A';
// The destination of the WebSocket connection
const webSocketDestination = '/user/queue/chat/0';

export default {
  data: () => ({
    hasJustLoggedIn: false as boolean,
    wasOpenedAutomaticallyOnce: false as boolean,
    initialLoadAfterLogin: false as boolean,
    backendUrl: '' as string,
    pluginPath: '' as string,
    isRunLocally: false as boolean,
    pseudoId: '' as string,
    userToken: '' as string,
    webSocket: null as any,
    chatbotDataStore: useChatbotDataStore(),
    displayStore: useDisplayStore(),
    messageToSend: '' as string,
    messageExchangeStore: useMessageExchangeStore(),
    notesAndPeerSolutionStore: useNotesAndPeerSolutionStore(),
    incomingMessageTypes: [
      'message',
      'options',
      'related_users',
      'require_click_notification',
      'state_update',
      'system_message',
      'uri',
      'user_message'
    ],
    outgoingMessageTypes: ['message_response', 'options_response', 'state_update_response'],
    pingTimeout: 0 as number,
    pongInterval: 0 as number,
    forceDisconnect: false as boolean,
    reconnectAttempted: false as boolean,
    sendWebSocketReconnectAttempted: false as boolean,
    // Use a trigger variable to update the changed WebSocket state: https://stackoverflow.com/a/64009199
    triggerVariable: 0
  }),
  components: {
    ChatbotDialog,
    ChatbotWidget
  },
  computed: {
    /**
     * Retrieves the path of the chatbot image.
     */
    botImagePath() {
      return this.pluginPath + (!this.isRunLocally ? '/templates' : '') + '/veri.png';
    },
    /**
     * Return, whether the WebSocket is still connected.
     */
    isWebSocketConnected() {
      return this.triggerVariable > 0 && this.webSocket?.readyState === 1;
    }
  },
  created() {
    this.initChatbotApp();
  },
  beforeUnmount() {
    this.forceDisconnect = true;
    this.webSocket.close();
  },
  methods: {
    /**
     * Initialize the chatbot app by defining the values of the variables depending on the chatbot data provided,
     * prepare and handle the message exchange,
     * and define several listeners and initial style adjustments.
     */
    async initChatbotApp() {
      this.isRunLocally = this.chatbotDataStore.data?.isRunLocally ?? false;
      this.pluginPath = this.chatbotDataStore.data.pluginPath;
      this.backendUrl = this.chatbotDataStore.data.backendUrl;
      this.pseudoId = this.chatbotDataStore.data.pseudoId;
      this.userToken = this.chatbotDataStore.data.token;
      this.hasJustLoggedIn = this.chatbotDataStore.data.hasJustLoggedIn;
      await this.prepareAndHandleMessageExchange();
      // Add a listener for detecting visibility changes
      // Additionally, delay the creation of the listener to avoid conflicts with the initialization of the chatbot
      setTimeout(() => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.reconnectWebSocket();
          }
        });
      }, 500);
      // Initially check for style adjustments and the adjustment of the content container
      this.checkForStyleAdjustments();
      this.adjustContentContainer(this.displayStore.dialogOpen);
      // After a minor timeout, add handlers for both resizing and scrolling (further style adjustments are necessary)
      setTimeout(() => {
        const body = document.getElementsByTagName('body')?.[0];
        if (body) {
          // Add a resize observer to adjust the height of the chatbot when resizing the window
          new ResizeObserver(() => {
            this.checkForStyleAdjustments();
            // On resize, additionally check for adjusting the content container
            this.adjustContentContainer(this.displayStore.dialogOpen);
          }).observe(body);
          // Add a scroll detector for devices smaller equal 768px (adjust the height of the chatbot, if necessary)
          window.addEventListener('scroll', () => {
            const bodyWidth = body?.offsetWidth || 1000;
            if (bodyWidth <= 768) {
              this.checkForStyleAdjustments();
            }
          });
        }
      }, 100);
    },
    /**
     * Check for style adjustments in order to fit the chatbot into the current view.
     */
    checkForStyleAdjustments() {
      // Calculate the height of the ILIAS header
      let headerHeight = 0;
      const headerElement = document.querySelector<HTMLElement>('.il-layout-page header');
      if (headerElement) {
        headerHeight = headerElement.offsetHeight;
      }
      // Retrieve the elements of interest that might be adjusted
      const chatbotApp = document.getElementById('chatbotApp');
      const chatbotDialog = document.getElementById('chatbotDialog');
      // Calculate the height of the page overlay
      let pageOverlayHeight = 0;
      const pageOverlay = document.querySelector<HTMLElement>('.il-page-overlay');
      // Check, whether the toolcheck header is present
      const isToolcheck = document.getElementsByClassName('toolcheck_header')?.length > 0 ?? false;
      if (isToolcheck && pageOverlay) {
        pageOverlayHeight = pageOverlay.offsetHeight;
      }
      // In the following, the width of the body has to be taken into account
      const bodyWidth = document.querySelector<HTMLElement>('body')?.offsetWidth || 1000;
      // Define a default height of the footer
      let footerHeight = 0;
      // If the page is smaller equal 768px, the ILIAS navbar is displayed on the bottom
      if (bodyWidth <= 768) {
        // The page overlay gets invisible when being scrolled over
        const htmlElementScrollTop = document.getElementsByTagName('html')?.[0]?.scrollTop;
        if (htmlElementScrollTop) {
          // The height cannot be smaller than 0
          if (pageOverlayHeight - htmlElementScrollTop < 0) {
            pageOverlayHeight = 0;
          } else {
            pageOverlayHeight -= htmlElementScrollTop;
          }
        }
        // Remove the border-top due to the none-removable margin-bottom of the header
        if (chatbotDialog) {
          chatbotDialog.style.borderTop = 'none';
        }
        // Calculate the footer height based on the height of the main controls (navbar)
        const navbar = document.querySelector<HTMLElement>('.nav.il-maincontrols');
        if (navbar) {
          footerHeight = navbar.offsetHeight;
        }
      }
      // Otherwise, the footer height is the difference between the body padding-bottom and the height of the toolcheck header
      else {
        const bodyElement = document.getElementsByTagName('body')?.[0];
        // Get the element padding: https://stackoverflow.com/questions/5227909/how-to-get-an-elements-padding-value-using-javascript#comment69593352_5240819
        if (
          isToolcheck &&
          bodyElement &&
          parseFloat(window.getComputedStyle(bodyElement, null)?.getPropertyValue('padding-bottom'))
        ) {
          footerHeight =
            parseFloat(window.getComputedStyle(bodyElement, null).getPropertyValue('padding-bottom')) -
            pageOverlayHeight;
        }
        // Add back the removed border-top
        if (chatbotDialog) {
          chatbotDialog.style.borderTop = '1px solid #ddd';
        }
      }
      // Calculate the height that has to be subtracted from the view height
      const heightToReduce = headerHeight + pageOverlayHeight + footerHeight;
      // Depending on the state of the chatbot, adjustments of different elements are necessary
      if (chatbotApp) {
        chatbotApp.style.bottom = footerHeight + 'px';
      }
      if (chatbotDialog) {
        chatbotDialog.style.height = 'calc(100vh - ' + heightToReduce + 'px)';
      }
    },
    /**
     * If the window width is large enough, adjust the ILIAS content container to make sure that the chatbot is visible.
     * @param {boolean} dialogVisible
     */
    adjustContentContainer(dialogVisible: boolean) {
      // Adjust the padding-right of the #fixed_content div of ILIAS to make space for the chatbot
      const fixedContent = document.getElementById('fixed_content');
      if (!fixedContent) {
        return;
      }
      const bodyWidth = document.querySelector<HTMLElement>('body')?.offsetWidth || 1000;
      // Check, whether the chatbot dialog is visible and the body width is larger than the breakpoint for mobile devices
      if (dialogVisible && bodyWidth > 768) {
        fixedContent.style.paddingRight = '360px';
      } else if (parseFloat(window.getComputedStyle(fixedContent, null)?.getPropertyValue('padding-right')) > 0) {
        fixedContent.style.paddingRight = '0';
      }
    },
    /**
     * Prepare and handle the message exchange by resetting the values on login and connecting the WebSocket.
     */
    async prepareAndHandleMessageExchange() {
      if (this.hasJustLoggedIn) {
        // On login, set the last logged-in user
        this.chatbotDataStore.lastLoggedInUser = this.pseudoId;
        // On login, reset potentially send messages
        this.messageExchangeStore.clearItems();
        // Also reset the displaying parameters
        this.displayStore.resetValues();
        // Hold variable to hide the new items number
        this.initialLoadAfterLogin = true;
        setTimeout(() => {
          this.initialLoadAfterLogin = false;
        }, 3000);
      }
      await this.handleWebSocketConnection(true);
    },
    /**
     * Handle the entire WebSocket connection depending on whether the page was switched or not.
     * @param {boolean} switchedPage
     */
    async handleWebSocketConnection(switchedPage: boolean) {
      if (this.webSocket?.readyState !== 1) {
        const backendUrlProtocol = this.backendUrl.includes('https://') ? 'https://' : 'http://';
        const webSocketPrefix = backendUrlProtocol === 'https://' ? 'wss://' : 'ws://';
        const webSocketURL = webSocketPrefix + this.backendUrl.split(backendUrlProtocol)?.[1] + '/api/v1/websocket';
        this.webSocket = new WebSocket(webSocketURL);

        // On WebSocket opening, send CONNECT and SUBSCRIBE messages and handle the wake-up message sending
        this.webSocket.onopen = () => {
          this.webSocket.send('CONNECT\ntoken:' + this.userToken + '\naccept-version:1.2\nheart-beat:3000,3000\n\n\0');
          // There is only one destination that needs to be subscribed: /user/queue/chat
          // TODO: Workaround to not send SUBSCRIBE before CONNECTED was received
          setTimeout(() => {
            this.webSocket.send('SUBSCRIBE\nid:sub-0\ndestination:' + webSocketDestination + '\n\n\0');
            // Reset potentially set values
            this.forceDisconnect = false;
            // Potentially send wake-up message
            // Check, whether the logged-in user is set correctly
            if (this.chatbotDataStore.lastLoggedInUser !== this.pseudoId) {
              this.messageExchangeStore.clearItems();
              // Temporary set the hasJustLoggedIn value to true to request the prior_messages again
              this.hasJustLoggedIn = true;
              this.handleWakeUpMessageSending(true);
              // Reset the last logged-in user
              this.chatbotDataStore.lastLoggedInUser = this.pseudoId;
              // Reset the hasJustLoggedIn value back to its existing value (false)
              setTimeout(() => {
                this.hasJustLoggedIn = false;
              }, 250);
            } else {
              this.handleWakeUpMessageSending(switchedPage);
            }
          }, 50);
        };

        // On WebSocket message retrieval, process the received message
        this.webSocket.onmessage = (event: any) => {
          this.triggerVariable += 1;
          // Extract content between \n\n and \0
          const message: string = event.data.substring(event.data.indexOf('\n\n') + 2, event.data.lastIndexOf('\0'));
          // tud-tas-backend sends JSON data in the body of the STOMP messages that can be deserialized
          // If no message ('') is received, this could be either a CONNECTED or ERROR message
          if (!message) {
            if (event.data?.startsWith('CONNECTED')) {
              this.initializePongMessageInterval();
              // Reset potentially set values for the case that the connection was successful
              this.reconnectAttempted = false;
              this.sendWebSocketReconnectAttempted = false;
            } else if (event.data?.startsWith('ERROR')) {
              console.error(event);
            }
          }
          // If a line feed byte is received, it is a ping message
          else if (message === lineFeedByte) {
            // The first ping message also starts to reset the ping timeout
            this.clearAndResetPingTimeout();
          }
          // Other, "real" messages
          else {
            // Normal messages will also reset the ping timeout
            this.clearAndResetPingTimeout();
            // It is necessary to parse the message
            // Hint: Even though this might be huge objects (tested with 8000 messages), this only takes like 30ms to execute
            const receivedMessageParsed: AssistanceObjectCommunication = JSON.parse(message);
            // If "previous_messages" or "unacknowledged_messages" do exist in the parameter keys, the value will be an Array of AssistanceObjectCommunications
            // Else, it is a single AssistanceObjectCommunication
            // Idea: Use a queue of AssistanceObjectQueueItems containing correctly parsed AssistanceObjectCommunication objects
            // as well as the information, whether it must be acknowledged or not
            const messagesQueue: AssistanceObjectQueueItem[] = [];
            // Either previous_messages or unacknowledged_messages are retrieved when sending a wake-up message
            // previous_messages might include "old" unacknowledged messages, whose are acknowledged automatically now
            if (this.checkForKeyPresence(receivedMessageParsed, 'previous_messages')) {
              parameterValue(receivedMessageParsed, 'previous_messages')?.forEach((message: any) => {
                messagesQueue.push(new AssistanceObjectQueueItem(message, false));
              });
              // The retrieval of the message including the previous_messages itself has to be acknowledged
              this.acknowledgeMessage(receivedMessageParsed);
            }
            // Handle the retrieval of unacknowledged_messages (just_logged_in: false)
            else if (this.checkForKeyPresence(receivedMessageParsed, 'unacknowledged_messages')) {
              const unacknowledgedMessages = parameterValue(receivedMessageParsed, 'unacknowledged_messages');
              // At least one unacknowledged message has to exist, otherwise, the handling will be skipped
              if (unacknowledgedMessages?.length > 0) {
                const existingMessages = this.messageExchangeStore.items;
                const emptyExistingMessages = !existingMessages?.length;
                const lastExistingMessageTimestamp =
                  !emptyExistingMessages && existingMessages[existingMessages.length - 1].timestamp;
                const firstUnacknowledgedMessageTimestamp = unacknowledgedMessages[0].timestamp;
                const timestampsExistAndExistingMessagesAreOlder =
                  lastExistingMessageTimestamp &&
                  firstUnacknowledgedMessageTimestamp &&
                  new Date(lastExistingMessageTimestamp)?.getTime() <
                    new Date(firstUnacknowledgedMessageTimestamp)?.getTime();
                // Either the existing messages are empty or the existing messages are older than the unacknowledged ones
                if (emptyExistingMessages || timestampsExistAndExistingMessagesAreOlder) {
                  // Push the unacknowledged_messages to the queue (add to existing messages and acknowledge them)
                  unacknowledgedMessages.forEach((msg: AssistanceObjectCommunication) => {
                    // unacknowledged_messages might include previous_messages
                    if (this.checkForKeyPresence(msg, 'previous_messages')) {
                      const unacknowledgedPreviousMessages = parameterValue(msg, 'previous_messages');
                      unacknowledgedPreviousMessages?.forEach((previousMsg: AssistanceObjectCommunication) => {
                        messagesQueue.push(new AssistanceObjectQueueItem(previousMsg, false));
                      });
                      // Acknowledge the message containing previous_messages
                      this.acknowledgeMessage(msg);
                    } else {
                      messagesQueue.push(new AssistanceObjectQueueItem(msg, true));
                    }
                  });
                }
                // Otherwise, clear the chatbot history and request the prior_messages again by sending a wake-up message
                else {
                  this.messageExchangeStore.clearItems();
                  // Temporary set the hasJustLoggedIn value to true to request the prior_messages again
                  this.hasJustLoggedIn = true;
                  this.handleWakeUpMessageSending(true);
                  // Reset the hasJustLoggedIn value back to its existing value (false)
                  setTimeout(() => {
                    this.hasJustLoggedIn = false;
                  }, 250);
                }
              }
            } else {
              messagesQueue.push(new AssistanceObjectQueueItem(receivedMessageParsed, true));
            }

            // Iterate messages (array of AssistanceObjectQueueItems)
            messagesQueue.forEach((queueItem: AssistanceObjectQueueItem, index: number) => {
              const receivedMessage: AssistanceObjectCommunication = queueItem.assistanceObject;
              if (!receivedMessage?.parameters) {
                return;
              }
              // It is assumed that the message received is valid
              // TODO: Find a better solution for this workaround (https://stackoverflow.com/a/41256353)
              this.messageExchangeStore.addItem(Object.assign(new AssistanceObjectCommunication(), receivedMessage));

              // If the message was not part of previous_messages, acknowledge it
              if (queueItem.requiresAcknowledgement) {
                this.acknowledgeMessage(receivedMessage);
              }
              // Next, check, if it requires an additional action
              this.checkIncomingMessageForAction(
                receivedMessage,
                queueItem.requiresAcknowledgement,
                messagesQueue.length === index - 1
              );
            });
            // If the user has just logged in, automatically display the chatbot dialog
            // TODO: the chatbot might be invisible some time when the view is rendered
            if (this.hasJustLoggedIn && !this.wasOpenedAutomaticallyOnce) {
              this.updateChatbotDialogVisible(true);
              this.wasOpenedAutomaticallyOnce = true;
            }
            if (this.displayStore.dialogOpen) {
              this.updateDialogScroll();
            }
          }
        };

        // On WebSocket closing, clear the ping timeout and pong interval
        this.webSocket.onclose = () => {
          this.triggerVariable += 1;
          window.clearInterval(this.pongInterval);
          if (this.pingTimeout) {
            window.clearTimeout(this.pingTimeout);
            this.pingTimeout = 0;
          }
          // Reset value, as it is not done automatically: https://stackoverflow.com/a/5978560/3623608
          this.pongInterval = 0;
          // Attempt reconnecting the WebSocket (if disconnect was not forced or the reconnect was not already attempted)
          if (!this.forceDisconnect && !this.reconnectAttempted) {
            this.attemptReconnect();
          }
        };
      } else {
        // WebSocket connection is still established
        // Potentially send wake-up message
        this.handleWakeUpMessageSending(switchedPage);
      }
    },
    /**
     * Attempt to reconnect the WebSocket.
     */
    attemptReconnect() {
      this.reconnectAttempted = true;
      this.reconnectWebSocket();
    },
    /**
     * Handle the reconnection of the WebSocket.
     */
    async reconnectWebSocket() {
      await this.handleWebSocketConnection(false);
    },
    checkForKeyPresence,
    parameterValue,
    /**
     * When switching the page, send information about having just logged in or not.
     * @param {boolean} switchedPage
     */
    handleWakeUpMessageSending(switchedPage: boolean) {
      // Delay message sending until the WebSocket is connected
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
    /**
     * Handle the message sending over the WebSocket.
     * @param {AssistanceObjectCommunication} messageToSend
     */
    async sendWebSocketMessage(messageToSend: AssistanceObjectCommunication) {
      const messageAsJson = JSON.stringify(messageToSend);
      if (this.isWebSocketConnected) {
        this.webSocket.send(
          'MESSAGE\ndestination:' +
            webSocketDestination +
            '\ncontent-length:' +
            this.countBytesOfMessage(messageAsJson) +
            '\n\n' +
            messageAsJson +
            '\0'
        );

        // Add any valid outgoing message to the messageExchangeStore
        if (messageToSend?.parameters?.find((param) => this.outgoingMessageTypes.includes(param.key))) {
          this.messageExchangeStore.addItem(messageToSend);
          this.updateDialogScroll();
        }

        // Reset WebSocket reconnection value
        this.sendWebSocketReconnectAttempted = false;
      } else {
        // Attempt reconnecting once, if the sending of a message failed
        if (!this.sendWebSocketReconnectAttempted) {
          await this.reconnectWebSocket();
          // Send again after 0.5 seconds
          setTimeout(() => {
            this.sendWebSocketMessage(messageToSend);
            this.sendWebSocketReconnectAttempted = true;
          }, 500);
        }
      }
    },
    /**
     * Check an incoming message for an action to execute.
     * @param {AssistanceObjectCommunication} receivedMessage
     * @param {boolean} isLiveMessage
     * @param {boolean} isLastItem
     */
    checkIncomingMessageForAction(
      receivedMessage: AssistanceObjectCommunication,
      isLiveMessage: boolean,
      isLastItem: boolean
    ) {
      // Actions that are executed when the message is retrieved in real-time
      if (isLiveMessage) {
        // It is requested to automatically send the solution
        if (parameterValue(receivedMessage, 'operation') === 'send_solution') {
          const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
          // Use aId of the received message to answer it
          messageToSend.aId = receivedMessage.aId;
          messageToSend.parameters = [
            new AssistanceParameter('solution_response', this.notesAndPeerSolutionStore.notes)
          ];
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
      // The solution might also need to be sent, if it is the last message in the previous_messages
      else if (isLastItem && parameterValue(receivedMessage, 'operation') === 'send_solution') {
        const messageToSend: AssistanceObjectCommunication = new AssistanceObjectCommunication();
        // Use aId of the received message to answer it
        messageToSend.aId = receivedMessage.aId;
        messageToSend.parameters = [new AssistanceParameter('solution_response', this.notesAndPeerSolutionStore.notes)];
        this.sendWebSocketMessage(messageToSend);
      }
      // Actions that are executed in any case
      // Operations have to be processed
      if (checkForKeyPresence(receivedMessage, 'operation')) {
        // Process every operation message
        this.displayStore.processOperation(receivedMessage);
        // enable_notes will automatically open the view for the notes and peer solution
        if (parameterValue(receivedMessage, 'operation') === 'enable_notes') {
          this.displayStore.changeNotesAndPeerSolutionOpen(true);
        }
      }
      // The template for the solution is provided
      else if (checkForKeyPresence(receivedMessage, 'solution_template')) {
        this.notesAndPeerSolutionStore.setTemplate(parameterValue(receivedMessage, 'solution_template'));
      }
      // The solution response is provided
      else if (checkForKeyPresence(receivedMessage, 'solution_response')) {
        this.notesAndPeerSolutionStore.setSolutionResponse(parameterValue(receivedMessage, 'solution_response'));
      }
      // The peer solution is provided
      else if (checkForKeyPresence(receivedMessage, 'peer_solution')) {
        this.notesAndPeerSolutionStore.setPeerSolution(parameterValue(receivedMessage, 'peer_solution'));
      }
    },
    /**
     * Acknowledge the reception of the message.
     * @param {AssistanceObjectCommunication} receivedMessage
     */
    acknowledgeMessage(receivedMessage: AssistanceObjectCommunication) {
      if (receivedMessage?.messageId) {
        const acknowledgeMessage: AssistanceObjectCommunication = {
          messageId: receivedMessage.messageId
        };
        this.sendWebSocketMessage(acknowledgeMessage);
      }
    },
    /**
     * Initialize the interval for sending pong messages.
     */
    initializePongMessageInterval() {
      // Send pong every 3 seconds
      this.pongInterval = window.setInterval(() => {
        this.webSocket.send(lineFeedByte);
      }, 3000);
    },
    /**
     * Clear and reset the ping timeout.
     */
    clearAndResetPingTimeout() {
      if (this.pingTimeout) {
        window.clearTimeout(this.pingTimeout);
        this.pingTimeout = 0;
      }
      // If no ping message is received within 20 seconds, force the disconnection of the WebSocket
      this.pingTimeout = window.setTimeout(() => {
        this.forceDisconnect = true;
        this.webSocket.close();
      }, 20000);
    },
    /**
     * Update the dialog scroll.
     */
    updateDialogScroll() {
      // https://stackoverflow.com/a/76297364/3623608
      (this.$refs.chatbotDialog as typeof ChatbotDialog)?.updateScroll();
    },
    /**
     * Change the visibility state of the dialog into a given value.
     * @param {boolean} dialogVisible
     */
    updateChatbotDialogVisible(dialogVisible: boolean) {
      if (dialogVisible) {
        (this.$refs.chatbotWidget as typeof ChatbotWidget)?.fadeOut();
        setTimeout(() => {
          this.displayStore.dialogOpen = dialogVisible;
          // If the dialog gets visible, reset the newItems counter
          this.messageExchangeStore.newItems = 0;
          // The ref must exist before it is addressed
          setTimeout(() => {
            this.adjustContentContainer(true);
            (this.$refs.chatbotDialog as typeof ChatbotDialog)?.fadeIn();
          }, 1);
        }, 300);
      } else {
        (this.$refs.chatbotDialog as typeof ChatbotDialog)?.fadeOut();
        this.adjustContentContainer(false);
        setTimeout(() => {
          this.displayStore.dialogOpen = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            (this.$refs.chatbotWidget as typeof ChatbotWidget)?.fadeIn();
          }, 1);
        }, 300);
      }
    },
    /**
     * Overwrite the message to send by a given message string.
     * @param {string} messageToSend
     */
    updateMessageToSend(messageToSend: string) {
      this.messageExchangeStore.messageToSend = messageToSend;
    },
    /**
     * Count the bytes of a given message.
     * @param {string} message
     */
    countBytesOfMessage(message: string) {
      const escapedMsg = encodeURI(message);
      if (escapedMsg.includes('%')) {
        let byteCount = escapedMsg.split('%').length - 1;
        if (byteCount === 0) {
          byteCount++;
        }
        const tmp = escapedMsg.length - byteCount * 3;
        return byteCount + tmp;
      }
      return escapedMsg.length;
    }
  }
};
</script>

<template>
  <main :style="isRunLocally ? 'position: fixed; bottom: 0; right: 0; z-index: 998;' : ''">
    <ChatbotWidget
      ref="chatbotWidget"
      :bot-image-path="botImagePath"
      :initial-load-after-login="initialLoadAfterLogin"
      :new-items="messageExchangeStore.newItems"
      @click="updateChatbotDialogVisible(!displayStore.dialogOpen)"
      v-if="!displayStore.dialogOpen"
    />
    <ChatbotDialog
      ref="chatbotDialog"
      :abort-exchange-command-enabled="displayStore.abortExchangeCommandEnabled"
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
      :options-enabled="displayStore.optionsEnabled"
      :outgoing-message-types="outgoingMessageTypes"
      :peer-solution="notesAndPeerSolutionStore.peerSolution"
      :peer-solution-enabled="displayStore.peerSolutionEnabled"
      :peer-solution-command-enabled="displayStore.peerSolutionCommandEnabled"
      :stored-message-to-send="messageExchangeStore.messageToSend"
      @checkForStyleAdjustments="checkForStyleAdjustments"
      @closeChatbotDialog="updateChatbotDialogVisible(false)"
      @reconnectWebSocket="reconnectWebSocket"
      @sendAssistanceObject="sendWebSocketMessage"
      @updateMessageToSend="updateMessageToSend"
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
