/**
 * Chatbot for the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2023-2024 TU Dresden (Tommy Kubica)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

/**
 * Check, whether a given key exists in the parameters of a given assistance object.
 *
 * @param {AssistanceObjectCommunication} assistanceObject
 * @param {string} key
 */
export const checkForKeyPresence = (assistanceObject: AssistanceObjectCommunication, key: string): boolean => {
  return !!assistanceObject.parameters?.find((param) => param.key === key);
};

/**
 * Return the value of a given parameter key within a given assistance object.
 *
 * @param {AssistanceObjectCommunication} assistanceObject
 * @param {string} key
 */
export const parameterValue = (assistanceObject: AssistanceObjectCommunication, key: string) => {
  // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
  return assistanceObject.parameters?.find((param) => param.key === key)?.value ?? '';
};

/**
 * Format a given date time into a readable string.
 *
 * @param dateTime
 */
export const formatDate = (dateTime: any) => {
  // Retrieve dateTime from dateTimeString (https://stackoverflow.com/a/1353710)
  const timestamp = Date.parse(dateTime);
  if (!isNaN(timestamp)) {
    const dateTimestamp = new Date(timestamp);
    return new Intl.DateTimeFormat('default', { dateStyle: 'short', timeStyle: 'short' }).format(dateTimestamp);
  } else {
    return 'Invalid date';
  }
};
