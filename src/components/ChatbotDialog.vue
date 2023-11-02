<script>
export default {
  methods: {
    closeChatbotDialog() {
      this.$emit("closeChatbotDialog");
    },
    fadeIn() {
      document.getElementById("chatbotDialog").classList.add("animate__fadeInRight");
      // setTimeout(() => {
      //   document
      //     .getElementById("chatbotDialog")
      //     .classList.remove("animate__fadeInRight");
      // }, 500);
    },
    fadeOut() {
      document
        .getElementById("chatbotDialog")
        .classList.add("animate__fadeOutRight");
      // setTimeout(() => {
      //   document
      //     .getElementById("chatbotDialog")
      //     .classList.remove("animate__fadeOutRight");
      // }, 500);
    },
  },
};
</script>

<template>
  <div id="chatbotDialog" class="animate__animated">
    <span
      style="position: absolute; top: 5px; right: 5px"
      @click="closeChatbotDialog()"
    >
      &times;
    </span>
    <p>Test</p>
  </div>
</template>

<style>
#chatbotDialog {
  position: relative;
  padding: 10px;
  width: 300px;
  height: calc(100vh - 60px);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
}
</style>
