import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export const parameterValue = (message: AssistanceObjectCommunication, key: string) => {
  // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
  return message.parameters?.find((param) => param.key === key)?.value ?? '';
};

// Retrieved from https://jerickson.net/how-to-format-dates-in-vue-3/
export const formatDate = (dateTime: any) => {
  // Retrieve dateTime from dateTimeString: https://stackoverflow.com/a/1353710
  const timestamp = Date.parse(dateTime);
  if (!isNaN(timestamp)) {
    const dateTimestamp = new Date(timestamp);
    return new Intl.DateTimeFormat('default', { dateStyle: 'short', timeStyle: 'short' }).format(dateTimestamp);
  } else {
    return 'Invalid date';
  }
};
