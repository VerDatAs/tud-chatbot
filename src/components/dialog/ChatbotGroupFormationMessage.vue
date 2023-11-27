<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { Option } from '@/components/types/option';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';

export default {
  components: {
    ChatbotIcon
  },
  props: {
    botImagePath: {
      type: String,
      required: false
    },
    assistanceObject: {
      type: AssistanceObjectCommunication,
      required: true
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
  <ChatbotIcon :botImagePath="botImagePath" v-if="botImagePath" />
  <div class="messageContainer">
    {{ parameterValue(assistanceObject, 'message') }}
    <hr />
    <div class="groupInformation" v-if="parameterValue(assistanceObject, 'group')">
      <span style="text-decoration: underline">Gruppeninformationen:</span>
      <ul>
        <li v-if="parameterValue(assistanceObject, 'group')?.find((ao: any) => ao.key === 'groupId')">
          Gruppen-ID: {{ parameterValue(assistanceObject, 'group').find((ao: any) => ao.key === 'groupId').value }}
        </li>
        <li v-if="parameterValue(assistanceObject, 'group')?.find((ao: any) => ao.key === 'members').value">
          Anzahl Mitglieder:
          {{ parameterValue(assistanceObject, 'group').find((ao: any) => ao.key === 'members').value.length }}
        </li>
      </ul>
    </div>
    <hr />
    <span style="text-decoration: underline">Hinweis:</span>
    Benutze
    <span style="font-weight: 800">@group</span>
    um eine Nachricht an deine Gruppe zu senden.
  </div>
</template>
