<script>
export default {
  props: {
    pluginPath: String
  },
  methods: {
    fadeIn() {
      document
        .getElementById('chatbotWidget')
        .classList.add('animate__fadeInRight');
    },
    fadeOut() {
      document
        .getElementById('chatbotWidget')
        .classList.add('animate__fadeOutRight');
    }
  }
};
</script>

<template>
  <div id="chatbotWidget" class="animate__animated">
    <img
      :src="this.pluginPath + '/templates/veri.png'"
      width="35"
      height="35"
      alt="Chatbot Icon"
    />
  </div>
</template>

<style>
#chatbotWidget {
  margin-right: 40px;
  margin-bottom: 40px;
  max-width: 60px;
  padding: 10px;
  background: #333;
  border-radius: 15px;
  border: 2px solid #000;
  transition:
    width 1s,
    height 1s;

  &:hover {
    cursor: pointer;
  }
}
</style>
