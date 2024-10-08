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
export default {
  props: {
    botImagePath: String,
    headerIcon: {
      type: Boolean,
      default: false
    },
    isGroupMessage: {
      type: Boolean,
      default: false,
      required: false
    },
    isLinkMessage: {
      type: Boolean,
      default: false,
      required: false
    },
    numberOfGroupMembers: {
      type: Number,
      default: 0,
      required: false
    }
  }
};
</script>

<template>
  <div class="chatbotIcon" :class="headerIcon ? 'headerIcon' : 'dialogIcon'">
    <img :src="botImagePath" width="25" height="25" alt="Chatbot Icon" v-if="!isGroupMessage && !isLinkMessage" />
    <div class="padding2px" v-else-if="isGroupMessage">
      <!-- TODO: Remove this workaround, if another solution was found (Number vs. number) -->
      <template v-if="parseInt(numberOfGroupMembers.toString()) > 2">
        <!-- Icon for groups in general: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Agroups%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
        <!-- The Google Material Design Icons are licensed under Apache License 2.0 -->
        <svg xmlns="http://www.w3.org/2000/svg" height="21" width="21" viewBox="0 -960 960 960">
          <path
            d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z"
          />
        </svg>
      </template>
      <template v-else>
        <!-- Icon for a group of two: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Agroup%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
        <!-- The Google Material Design Icons are licensed under Apache License 2.0 -->
        <svg xmlns="http://www.w3.org/2000/svg" height="21" width="21" viewBox="0 -960 960 960">
          <path
            d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"
          />
        </svg>
      </template>
    </div>
    <div class="padding2px" v-else>
      <!-- Icon for a link: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Alink%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
      <!-- The Google Material Design Icons are licensed under Apache License 2.0 -->
      <svg xmlns="http://www.w3.org/2000/svg" height="21" width="21" viewBox="0 -960 960 960">
        <path
          d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"
        />
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chatbotIcon {
  position: absolute;
  padding: 5px;
  border-radius: 25px;
  height: 35px;
  width: 35px;
  background: #ccc;

  .padding2px {
    padding: 2px;
  }

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
