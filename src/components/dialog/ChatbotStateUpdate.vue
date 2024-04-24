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
import { useMessageExchangeStore } from '@/stores/messageExchange';
import { parameterValue } from '@/util/assistanceObjectHelper';

export default {
  data: () => ({
    messageExchangeStore: useMessageExchangeStore()
  }),
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
    },
    keyOfInterest: {
      type: String,
      required: true
    }
  },
  computed: {
    /**
     * Retrieve the current phase number from the assistance object.
     */
    currentPhase() {
      return parameterValue(this.assistanceObject, this.keyOfInterest)?.phase ?? 0;
    },
    /**
     * Return the total number of phases.
     */
    totalNumberOfPhases() {
      const typeOfAssistanceId = this.assistanceObject.aId
        ? this.messageExchangeStore.assistanceIdToTypeMatching[this.assistanceObject.aId]
        : 'peer_collaboration';
      const dataForType = this.messageExchangeStore.typeToDataMatching[typeOfAssistanceId] ?? {};
      return dataForType?.phases?.length ?? 6;
    },
    /**
     * Calculate the width of the progress bar.
     */
    width() {
      return (this.currentPhase * 100) / this.totalNumberOfPhases;
    }
  }
};
</script>

<template>
  <div
    class="progress"
    role="progressbar"
    aria-label="Basic example"
    aria-valuenow="25"
    aria-valuemin="0"
    aria-valuemax="100"
    v-if="currentPhase > 0 && totalNumberOfPhases > 1"
  >
    <div class="progress-bar" :style="{ width: width + '%' }">Phase {{ currentPhase }}</div>
  </div>
</template>

<style lang="scss">
.progress {
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}
</style>
