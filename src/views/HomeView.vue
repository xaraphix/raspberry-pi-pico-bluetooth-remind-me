<script setup lang="ts">
import { useRemindersStore } from '@/stores/reminder';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';


const isDrawerOpen = ref(false);
const name = ref('');
const repeat = ref(false);
const minutes = ref('');
const seconds = ref('');

const reminderStore = useRemindersStore();
const { removeReminder, addNewReminder, getAllReminders } = reminderStore;
const { remindersCount, currentReminders } = storeToRefs(reminderStore);

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
}

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
  name.value = '';
  minutes.value = '';
  seconds.value = '';
  repeat.value = false;
  isDrawerOpen.value = false;
};

const calcTop = (index: number) => {
  return index * (200 - index * 5) + 100;
};

const calcFontSize = (index: number) => {
  return 150 - index * 50; 
}

const calcColor = (index: number) => {
  if (!index) {
    return 'white'
  } else {
    return 'gray'
  } 
}
</script>

<template>
  <div class="bg-[#0A0A0A] h-full flex-row w-full px-64 flex items-center justify-center">


    <!-- Button to open drawer -->
    <div class="fixed top-1/2 right-0 -mt-4 mr-4 z-50">
      <button v-if="!isDrawerOpen" @click="toggleDrawer"
        class="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>


    </div>

    <!-- Drawer -->
    <Transition name="slide-fade">
      <div v-show="isDrawerOpen"
        class="fixed top-0 right-0 h-screen bg-none z-40 w-1/4 p-4 flex items-center justify-center border-l-[#8A8A8A] border-l">
        <!-- Close button -->
        <button @click="toggleDrawer"
          class="flex items-center justify-center w-8 h-8 bg-gray-700 text-white rounded-md absolute top-4 right-4">

          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="flex w-full flex-col items-center justify-center">
          <div class="flex h-full flex-col space-y-8 items-center justify-center w-full px-8">
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

            <button :disabled="!areInputsValid"
              class="flex w-full h-16 flex-row items-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#00007f] cursor-pointer"
              @click="createNewReminder">
              <div
                class="flex h-full w-full flex-row items-center justify-center space-x-4 rounded-2xl border-8 border-l-0 border-t-0 border-slate-300 py-6">
                <span class="text-error-container-dark font-heading text-xl font-bold text-[#0000FF] select-none"
                  :class="{ 'text-[#4A4A4A]': !areInputsValid }">
                  Add Reminder
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

    </Transition>

  <div class="w-full h-full items-center justify-center flex relative overflow-hidden">
    <div v-if="currentReminders.length > 1" class="absolute top-[50% + 100px] left-0 w-full h-1/2 flex flex-col items-center justify-center">
      <template v-for="(currentReminder, index) in currentReminders.reverse()">
        <h1
          class="font-bold mb-6 text-white absolute"
          :style="{ fontSize: `${calcFontSize(index)}px`, top: `${calcTop(index)}px`,
          color:`${calcColor(index)}` }"
        >
          {{ currentReminder.name }}
        </h1>
      </template>
    </div>
    <h1 v-else class="text-8xl mb-6 text-[#707070] z-10">No Reminders set</h1>
  </div>
</div>

</template>


<style>
.slide-fade-enter-to {
  transform: translateX(0%);
  opacity: 1;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
