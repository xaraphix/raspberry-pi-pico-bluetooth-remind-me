<script setup lang="ts">
import { useRemindersStore } from '@/stores/reminder';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

const name = ref('');
const upcomingReminder = ref('');
const repeat = ref(false);
const minutes = ref('');
const seconds = ref('');

const reminderStore = useRemindersStore();
const { removeReminder, addNewReminder, getAllReminders} = reminderStore;
const { remindersCount,  currentReminder} = storeToRefs(reminderStore);

const isNameValid = computed(
  () => name.value.length > 0 && name.value.length <= 6,
);
const areInputsValid = computed(() => {
  const validMinutes =
    !isNaN(parseInt(minutes.value)) && parseInt(minutes.value) >= 0;
  const validSeconds =
    !isNaN(parseInt(seconds.value)) &&
    parseInt(seconds.value) >= 0 &&
    parseInt(seconds.value) < 60;
  return isNameValid.value && validMinutes && validSeconds;
});

const createNewReminder = () => {
  const reminder = <Reminder>{
    id: (remindersCount.value + 10).toString(),
    name: name.value,
    periodic: repeat.value,
    mins: parseInt(minutes.value),
    secs: parseInt(seconds.value),
    toBeRemoved: false
  }
  addNewReminder(reminder);
};
</script>

<template>
  <div class="bg-[#0A0A0A] h-full flex-row w-full px-64 flex items-center justify-center">
    <div class="w-full h-[400px] items-center justify-center flex">

      <h1 v-if="currentReminder" class="text-4xl mb-6 text-[#707070]">
        {{ currentReminder.name }}
      </h1>
      <h1 v-else-if="upcomingReminder != ''" class="text-4xl mb-6">
        {{ upcomingReminder }}
      </h1>
      <h1 v-else class="text-4xl mb-6 text-[#707070]">No Reminders set</h1>
    </div>

    <div class="flex w-full flex-col items-center justify-center">
      <div class="flex h-full flex-col space-y-8 items-center justify-center w-64">
        <label class="flex flex-col items-start w-full">
          <span class="text-[#909090]">Name</span>
          <input v-model="name" type="text" placeholder="Provide reminder"
            class="border-b border-b-gray-400 w-full px-4 py-2 bg-[#1A1A1A] text-white rounded-md" :maxlength="6" />
        </label>

        <div class="flex space-x-4 w-full">
          <label class="flex flex-col items-start w-1/2">
            <span class="text-[#909090]">Minutes</span>
            <input v-model="minutes" type="number" placeholder="Minutes"
              class="border-b border-b-gray-400 px-4 py-2 w-full bg-[#1A1A1A] w-full text-white rounded-md" />
          </label>
          <label class="flex flex-col items-start w-1/2">
            <span class="text-[#909090]">Seconds</span>
            <input v-model="seconds" type="number" placeholder="Seconds"
              class="border-b border-b-gray-400 px-4 py-2 w-full bg-[#1A1A1A] w-full text-white rounded-md" />
          </label>
        </div>
        <label class="flex items-center space-x-2 px-4 py-2">
          <input v-model="repeat" type="checkbox"
            class="rounded border border-gray-400 w-5 h-5 bg-black accent-emerald-500/25" />
          <span class="font-bold pl-2">Repeat</span>
        </label>

        <button :disabled="!areInputsValid" :class="{ 'opacity-50': !areInputsValid }"
          class="flex w-full h-16 flex-row items-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#00007f] cursor-pointer"
          @click="createNewReminder">
          <div
            class="flex h-full w-full flex-row items-center justify-center space-x-4 rounded-2xl border-8 border-l-0 border-t-0 border-slate-300 py-6">
            <span class="text-error-container-dark font-heading text-xl font-bold text-black select-none">
              Add Reminder
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
