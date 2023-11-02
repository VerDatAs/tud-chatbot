<script>
export default {
  props: {
    pluginPath: String,
    headerIcon: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<template>
  <div class="chatbotIcon" :class="headerIcon ? 'headerIcon' : 'dialogIcon'">
    <img
      :src="this.pluginPath + '/templates/veri.png'"
      width="25"
      height="25"
      alt="Chatbot Icon"
    />
  </div>
</template>

<style lang="scss">
.chatbotIcon {
  position: absolute;
  padding: 5px;
  border-radius: 25px;
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
