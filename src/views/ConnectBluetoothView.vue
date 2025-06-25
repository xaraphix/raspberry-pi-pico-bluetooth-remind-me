<script setup lang="ts">
import { initiateConnection as connectToBluetoothDevice } from '@/Bluetooth';
import { ref } from 'vue';
let connecting = ref<Boolean>(false);
const connect = async () => {
  connecting.value = true;
  await connectToBluetoothDevice();
  connecting.value = false;
}
</script>

<template>
  <div class="bg-[#0A0A0A] h-full flex-col w-full px-64 flex space-y-8 items-center justify-center">

    <div class="w-[300px] h-[300px] flex items-center justify-center">
      <div class="absolute flex justify-center items-center">
        <div v-bind:class="{ 'opacity-0': !connecting, 'opacity-100': connecting }"
          class="animate-spin rounded-full h-64 w-64 border-t-2 border-b-2 border-purple-900"></div>
        <img src="/raspberrypi.png" class="w-full absolute top-12" />
      </div>


    </div>
    <h1 class="text-4xl mb-6 font-bold">
      Connect to Raspberry Pi Pico
    </h1>

    <button
      class="flex w-64 h-16 flex-row items-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#00007f] cursor-pointer"
      @click="connect">
      <div
        class="flex h-full w-full flex-row items-center justify-center space-x-4 rounded-2xl border-8 border-l-0 border-t-0 border-slate-300 py-6">
        <span class="text-error-container-dark font-heading text-xl font-bold text-black select-none hover:text-[#0000FF]">
          Connect
        </span>
      </div>
    </button>

  </div>
</template>
