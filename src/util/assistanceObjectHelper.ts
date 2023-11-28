import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export const parameterValue = (message: AssistanceObjectCommunication, key: string) => {
  // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
  return message.parameters?.find((param) => param.key === key)?.value ?? '';
};
