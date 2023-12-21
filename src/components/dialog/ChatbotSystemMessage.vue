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
