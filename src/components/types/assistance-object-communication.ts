import { AssistanceParameter } from './assistance-parameter';

export class AssistanceObjectCommunication {
  aId: string;
  aoId: string;
  parameters: AssistanceParameter[];

  constructor(aId: string, aoId: string, parameters: AssistanceParameter[]) {
    this.aId = aId;
    this.aoId = aoId;
    this.parameters = parameters;
  }
}
