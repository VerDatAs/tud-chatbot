import { AssistanceParameter } from './assistance-parameter';

export class AssistanceObjectCommunication {
  aId?: string;
  aoId?: string;
  messageId?: string;
  parameters: AssistanceParameter[];

  constructor(parameters: AssistanceParameter[]) {
    this.parameters = parameters;
  }
}
