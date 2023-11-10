<script>
export default {
  props: {
    botImagePath: String,
    headerIcon: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<template>
  <div class="chatbotIcon" :class="headerIcon ? 'headerIcon' : 'dialogIcon'">
    <img :src="this.botImagePath" width="25" height="25" alt="Chatbot Icon" />
  </div>
</template>

<style lang="scss" scoped>
.chatbotIcon {
  position: absolute;
  padding: 5px;
  border-radius: 25px;
  // define fixed height and width for local development
  height: 35px;
  width: 35px;
  background: #ccc;

  &.headerIcon {
    top: 10px;
    left: 15px;
  }

  &.dialogIcon {
    top: -10px;
    left: 0;
  }
}
</style>
