import { AssistanceParameter } from './assistance-parameter';

export class AssistanceResponseObject {
  aoId: string;
  parameters: AssistanceParameter[];

  constructor(aoId: string, parameters: AssistanceParameter[]) {
    this.aoId = aoId;
    this.parameters = parameters;
  }
}
