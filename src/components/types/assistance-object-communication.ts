import { AssistanceParameter } from './assistance-parameter';

export class AssistanceObjectCommunication {
  aId?: string;
  aoId?: string;
  assistanceType?: string;
  messageId?: string;
  timestamp?: string;
  type?: string;
  parameters?: AssistanceParameter[];
}
