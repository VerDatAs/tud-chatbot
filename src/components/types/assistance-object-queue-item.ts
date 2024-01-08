import { AssistanceObjectCommunication } from './assistance-object-communication';

export class AssistanceObjectQueueItem {
  assistanceObject: AssistanceObjectCommunication;
  requiresAcknowledgement: boolean;

  constructor(assistanceObject: AssistanceObjectCommunication, requiresAcknowledgement: boolean) {
    this.assistanceObject = assistanceObject;
    this.requiresAcknowledgement = requiresAcknowledgement;
  }
}
