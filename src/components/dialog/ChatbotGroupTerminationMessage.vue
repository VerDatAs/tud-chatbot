<script lang="ts">
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export default {
  props: {
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
    },
    relatedGroup: {
      type: AssistanceObjectCommunication,
      default: null
    }
  },
  methods: {
    parameterValue(assistanceObject: AssistanceObjectCommunication, key: string) {
      // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
      return assistanceObject.parameters?.find((param) => param.key === key)?.value ?? '';
    }
  }
};
</script>

<template>
  <div class="messageContainer">
    <span style="text-decoration: underline">Abbruch der Gruppenkollaboration{{ relatedGroup ? ':' : ''}}</span>
    <ul v-if="relatedGroup">
      <li v-if="parameterValue(relatedGroup, 'group')?.find((ao: any) => ao.key === 'groupId')">
        Gruppen-ID: {{ parameterValue(relatedGroup, 'group').find((ao: any) => ao.key === 'groupId').value }}
      </li>
      <li v-if="parameterValue(relatedGroup, 'group')?.find((ao: any) => ao.key === 'members').value">
        Anzahl Mitglieder:
        {{ parameterValue(relatedGroup, 'group').find((ao: any) => ao.key === 'members').value.length }}
      </li>
    </ul>
  </div>
</template>
