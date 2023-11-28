<script lang="ts">
import ChatbotIcon from '@/components/shared/ChatbotIcon.vue';
import { AssistanceObjectCommunication } from '@/components/types/assistance-object-communication';
import { parameterValue } from '@/util/assistanceObjectHelper';

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
    },
    groupInitiation: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  methods: {
    // https://stackoverflow.com/a/60617142
    parameterValue
  }
};
</script>

<template>
  <ChatbotIcon :botImagePath="botImagePath" v-if="botImagePath" />
  <div class="messageContainer">
    <template v-if="groupInitiation">
      {{ parameterValue(assistanceObject, 'message') }}
      <hr />
    </template>
    <div class="groupInformation" v-if="parameterValue(assistanceObject, 'group')">
      <span class="text-decoration-underline">
        {{ groupInitiation ? 'Gruppeninformationen' : 'Abbruch der Gruppenkollaboration' }}{{ assistanceObject ? ':' : '' }}
      </span>
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
    <template v-if="groupInitiation">
      <hr />
      <span class="text-decoration-underline">Hinweis:</span>
      Benutze
      <span class="fw-bold">@group</span>
      um eine Nachricht an deine Gruppe zu senden.
    </template>
  </div>
</template>

<style lang="scss" scoped>
  ul {
    text-align: left;
  }
</style>
