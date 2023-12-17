<script setup lang="ts">
import {RouterView} from 'vue-router';
import { initiateConnection as connectToBluetoothDevice } from './Bluetooth';
import { useRemindersStore } from './stores/reminder';

const {initializeStore} = useRemindersStore();
initializeStore();
</script>

<template>
  <div
    class="bg-[#0A0A0A] w-screen h-screen flex flex-row text-white justify-center items-center">
    <RouterView />
  </div>
</template>
