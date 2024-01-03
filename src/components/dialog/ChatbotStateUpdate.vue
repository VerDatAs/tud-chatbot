<script lang="ts">
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { parameterValue } from '@/util/assistanceObjectHelper';

export default {
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
    },
    keyOfInterest: {
      type: String,
      required: true
    },
    stateUpdates: {
      type: Array<AssistanceObjectCommunication>,
      default: []
    }
  },
  computed: {
    currentPhase() {
      return parameterValue(this.assistanceObject, this.keyOfInterest)?.phase
    },
    // TODO: Calculate correct number of phases
    totalNumberOfPhases() {
      return 6;
    },
    checkForFirstOccurrence() {
      // find first occurrence of this state update by comparing the phase and the aId
      const firstOccurrence = this.stateUpdates.find((ao) => ao.aId === this.assistanceObject.aId && parameterValue(ao, this.keyOfInterest)?.phase === this.currentPhase);
      // check, if this first occurrence is the assistanceObject itself by comparing their messageIds
      return this.assistanceObject?.messageId && firstOccurrence?.messageId === this.assistanceObject.messageId;
    },
    width() {
      return this.currentPhase * 100 / this.totalNumberOfPhases;
    }
  }
};
</script>

<template>
  <div class="progress" role="progressbar" aria-label="Basic example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" v-if="checkForFirstOccurrence">
    <div class="progress-bar" :style="{ width: width + '%' }">Phase {{ currentPhase }}</div>
  </div>
</template>

<style lang="scss">
  .progress {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
</style>
