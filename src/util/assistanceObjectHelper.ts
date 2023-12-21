import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export const parameterValue = (message: AssistanceObjectCommunication, key: string) => {
  // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
  return message.parameters?.find((param) => param.key === key)?.value ?? '';
};

// Retrieved from https://jerickson.net/how-to-format-dates-in-vue-3/
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Then specify how you want your dates to be formatted
  return new Intl.DateTimeFormat('default', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};
