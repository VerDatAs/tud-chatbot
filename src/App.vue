<script>
import ChatbotDialog from './components/ChatbotDialog.vue';
import ChatbotWidget from './components/ChatbotWidget.vue';
import axios from 'axios';

export default {
  data: () => ({
    chatbotDialogVisible: false,
    backendUrl: 'http://localhost:8080',
    pluginPath:
      './Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/VerDatAsBot',
    adminToken: '',
    userIdOrActorAccountName: 'ca1910'
  }),
  components: {
    ChatbotDialog,
    ChatbotWidget
  },
  created() {
    this.initChatbotApp();
  },
  methods: {
    async initChatbotApp() {
      document.addEventListener('init-path', (event) => {
        // https://github.com/vaadin/vaadin-upload/issues/138#issuecomment-266773430
        console.log('init-path', event);
        this.pluginPath = event.detail;
      });
      await this.getAdminToken();
    },
    async getAdminToken() {
      const authUrl = this.backendUrl + '/api/v1/auth/login';
      const request = {
        actorAccountName: 'root',
        password: 'root'
      };
      await axios.post(authUrl, request).then((adminData) => {
        this.adminToken = adminData.data.token;
      });
    },
    updateChatbotDialogVisible(dialogVisible) {
      if (dialogVisible) {
        this.$refs.chatbotWidget.fadeOut();
        setTimeout(() => {
          this.chatbotDialogVisible = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            this.$refs.chatbotDialog.fadeIn();
          }, 1);
        }, 300);
      } else {
        this.$refs.chatbotDialog.fadeOut();
        setTimeout(() => {
          this.chatbotDialogVisible = dialogVisible;
          // The ref must exist before it is addressed
          setTimeout(() => {
            this.$refs.chatbotWidget.fadeIn();
          }, 1);
        }, 300);
      }
    }
  }
};
</script>

<template>
  <main>
    <ChatbotWidget
      ref="chatbotWidget"
      :pluginPath="pluginPath"
      @click="updateChatbotDialogVisible(!chatbotDialogVisible)"
      v-if="!chatbotDialogVisible"
    />
    <ChatbotDialog
      ref="chatbotDialog"
      :adminToken="adminToken"
      :backendUrl="backendUrl"
      :userIdOrActorAccountName="userIdOrActorAccountName"
      :pluginPath="pluginPath"
      @closeChatbotDialog="updateChatbotDialogVisible(false)"
      v-else
    />
  </main>
</template>

<style lang="scss" scoped>
main {
  outline: none;
  font-family: 'Open Sans', Verdana, Arial, Helvetica, sans-serif;
  font-size: 14px;
}
</style>
