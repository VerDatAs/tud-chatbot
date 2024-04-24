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
import { Option } from '@/components/types/option';
import { formatDate, parameterValue } from '@/util/assistanceObjectHelper';

export default {
  components: {
    ChatbotIcon
  },
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
    },
    botImagePath: {
      type: String,
      required: false
    },
    optionsEnabled: {
      type: Boolean,
      default: false
    },
    relatedResponseExists: {
      type: Boolean,
      default: false
    },
    relatedStateUpdateExists: {
      type: Boolean,
      default: false
    }
  },
  emits: ['selectOption'],
  computed: {
    /**
     * Check, whether the options need to be disabled.
     */
    disableOptions() {
      return !this.optionsEnabled || this.relatedResponseExists || this.relatedStateUpdateExists;
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
    parameterValue,
    /**
     * Handle the selection of an option.
     */
    selectOption(option: Option) {
      const responseOption: Option = new Option('options_response', option.key);
      const responseObject: AssistanceObjectCommunication = new AssistanceObjectCommunication();
      responseObject.aId = this.assistanceObject.aId;
      responseObject.parameters = [responseOption];
      this.$emit('selectOption', responseObject);
    }
  }
};
</script>

<template>
  <ChatbotIcon :botImagePath="botImagePath" v-if="botImagePath" />
  <div class="messageContainer">
    {{ parameterValue(assistanceObject, 'message') }}
    <hr />
    <button
      class="btn btn-default option-btn"
      v-for="option in parameterValue(assistanceObject, 'options')"
      @click="selectOption(option)"
      :key="assistanceObject.aId + option.key"
      :disabled="disableOptions"
    >
      {{ option.value }}
    </button>
    <div class="messageTimestamp" v-if="validTimestamp">{{ formatDate(assistanceObject.timestamp) }}</div>
  </div>
</template>

<style lang="scss" scoped>
.option-btn {
  display: block;
  margin-bottom: 5px;
  width: 100%;
  max-width: 100%;
  white-space: normal;
}
</style>
