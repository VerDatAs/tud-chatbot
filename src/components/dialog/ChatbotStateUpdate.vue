<script lang="ts">
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { parameterValue } from '@/util/assistanceObjectHelper';
import { useMessageExchangeStore } from '@/stores/messageExchange';

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
    currentPhase() {
      return parameterValue(this.assistanceObject, this.keyOfInterest)?.phase ?? 0;
    },
    totalNumberOfPhases() {
      const typeOfAssistanceId = this.assistanceObject.aId ? this.messageExchangeStore.assistanceIdToTypeMatching[this.assistanceObject.aId] : 'peer_collaboration';
      const dataForType = this.messageExchangeStore.typeToDataMatching[typeOfAssistanceId] ?? {};
      return dataForType?.phases?.length ?? 6;
    },
    width() {
      return this.currentPhase * 100 / this.totalNumberOfPhases;
    }
  }
};
</script>

<template>
  <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" v-if="currentPhase > 0 && totalNumberOfPhases > 1">
    <div class="progress-bar" :style="{ width: width + '%' }">Phase {{ currentPhase }}</div>
  </div>
</template>

<style lang="scss">
  .progress {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
</style>
