<!--
Chatbot for the assistance system developed as part of the VerDatAs project
Copyright (C) 2023-2024 TU Dresden (Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">

import axios from 'axios';

import { useChatbotDataStore } from "@/stores/chatbotData";

export default {
  data: () => ({
    chatbotDataStore: useChatbotDataStore(),
    username: '',
    password: '',
    backendUrl: '',
    lmsId: '',
    pseudoId: '',
    token: ''
  }),
  props: {
    otp: {
      type: String,
      default: ''
    }
  },
  created() {
    this.initializeLoginForm();
  },
  methods: {
    initializeLoginForm() {
      this.backendUrl = this.chatbotDataStore.data.backendUrl ?? '';
      this.lmsId = this.chatbotDataStore.data.lmsId ?? '';
      this.pseudoId = this.chatbotDataStore.data.pseudoId ?? '';
      this.token = this.chatbotDataStore.data.token ?? '';
    },
    async sendLogin() {
      if (this.backendUrl === '' || this.pseudoId === '' || this.lmsId === '' || this.username === '' || this.password === '') {
        alert('Incomplete parameters for request');
        return;
      }
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      };
      // Manual register
      if (this.username.includes('ester')) {
        const registerUrl = this.backendUrl + '/api/v1/auth/register';
        const registerRequest = {
          username: this.username,
          password: this.password
        };

        await axios.put(registerUrl, registerRequest, { headers: authHeader });
        console.log('register successfully');
      }
      // Pairing
      const pairingUrl = this.backendUrl + '/api/v1/auth/pairing';
      const request = {
        actorAccountName: this.pseudoId,
        lmsId: this.lmsId,
        otp: this.otp,
        username: this.username,
        password: this.password
      };
      const pairingData = await axios.put(pairingUrl, request, { headers: authHeader });
      console.log('pairingData', pairingData);
      this.chatbotDataStore.updateLmsId('');
      this.chatbotDataStore.updateOtp('');
      this.chatbotDataStore.updateToken(pairingData.data.token);
    },
    async sendDecline() {
      if (this.backendUrl === '' || this.pseudoId === '' || this.lmsId === '') {
        alert('Incomplete parameters for request');
        return;
      }
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      };
      // Decline
      const declineUrl = this.backendUrl + '/api/v1/auth/pairing/decline';
      const request = {
        actorAccountName: this.pseudoId,
        lmsId: this.lmsId,
        otp: this.otp
      };
      const declineData = await axios.put(declineUrl, request, { headers: authHeader });
      console.log('declineData', declineData);
      this.chatbotDataStore.updateLmsId('');
      this.chatbotDataStore.updateOtp('');
    }
  }
};
</script>

<template>
  <div class="login-form">
    <div class="row">
      <div class="col-xs-12">
        <h2>Login</h2>
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" name="username" class="form-control" type="text" v-model="username" placeholder="m_mustermann" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" name="password" class="form-control" type="password" v-model="password" placeholder="******" />
        </div>
        <button class="sendLogin" @click="sendLogin()">Login</button>
        <hr>
        <button class="sendLogin" @click="sendDecline()">Decline</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .login-form {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1000;
    background: #FFF;
    padding: 20px;

    h2 {
      margin-bottom: 15px;
    }
  }
</style>
