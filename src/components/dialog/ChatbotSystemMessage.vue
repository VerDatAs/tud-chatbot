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
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export default {
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
    },
    keyToDisplay: {
      type: String,
      required: true
    }
  },
  methods: {
    /**
     * Retrieve the value of a provided parameter key.
     */
    getAssistanceObjectText() {
      return this.assistanceObject.parameters?.find((param) => param.key === this.keyToDisplay)?.value || '';
    }
  }
};
</script>

<template>
  <div class="alert alert-info text-center">
    <span>{{ getAssistanceObjectText() }}</span>
  </div>
</template>
