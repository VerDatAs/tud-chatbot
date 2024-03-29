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
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { formatDate, parameterValue } from '@/util/assistanceObjectHelper';

export default {
  components: {
    ChatbotIcon
  },
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true,
      default: null
    },
    botImagePath: {
      type: String,
      required: false
    }
  },
  computed: {
    /**
     * Return the number of group members.
     */
    numberOfGroupMembers() {
      return parameterValue(this.assistanceObject, 'related_users')?.length ?? 0;
    },
    /**
     * Check, whether the timestamp provided by the assistance object is valid.
     */
    validTimestamp() {
      return this.assistanceObject.timestamp && formatDate(this.assistanceObject.timestamp) !== 'Invalid date';
    }
  },
  methods: {
    formatDate,
    parameterValue
  }
};
</script>

<template>
  <ChatbotIcon
    :bot-image-path="botImagePath"
    :is-group-message="true"
    :number-of-group-members="numberOfGroupMembers"
    v-if="botImagePath"
  />
  <div class="messageContainer">
    {{ parameterValue(assistanceObject, 'message') }}
    <div class="messageTimestamp" v-if="validTimestamp">{{ formatDate(assistanceObject.timestamp) }}</div>
  </div>
</template>

<style lang="scss" scoped>
ul {
  text-align: left;
}
</style>
