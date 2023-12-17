import {ref, type Ref} from 'vue';
import {defineStore} from 'pinia';
import {
  sendReminderToDevice,
  removeReminderFromDevice,
  isConnected,
} from '@/Bluetooth';
import {REMINDERS} from '@/constants/Reminder';
import {
  addReminderToLocalStorage,
  getAllRemindersFromLocalStorage,
  getReminderFromLocalStorageById,
  removeReminderFromLocalStorage,
  updateReminderInStorage,
} from '@/utils/reminderUtils';
import router from '@/router';

export const useRemindersStore = defineStore(REMINDERS, () => {
  const reminders = ref<Reminder[]>([]);
  const remindersCount = ref<number>(0);
  const currentReminder = ref<Reminder | null>(null);
  const bluetoothConnected = ref<boolean>(false);

  setInterval(() => {
    bluetoothConnected.value = isConnected();
    if (!bluetoothConnected.value) {
      if (router.currentRoute.value.path !== '/connect')
        router.push({name: 'connect'});
    } else {
      router.push({name: 'home'});
    }
  }, 100);

  const initializeStore = () => {
    const remindersInLS = getAllRemindersFromLocalStorage();
    reminders.value = remindersInLS;
    sendAllRemindersToDevice();
  };

  const acknowledgeReminder = (reminder: Reminder) => {
    reminder.completed = true;
  };

  const notifyReminder = (reminder: Reminder) => {
    updateReminderInStorage(reminder);
    currentReminder.value = reminder;
    playSound();
  };

  const addNewReminder = (reminder: Reminder) => {
    reminders.value.push(reminder);
    remindersCount.value = reminders.value.length;
    addReminderToLocalStorage(reminder);
    sendReminderToDevice(reminder);
  };

  const removeReminder = (reminder: Reminder) => {
    reminders.value = reminders.value.filter(r => r.id !== reminder.id);
    remindersCount.value = reminders.value.length;
    removeReminderFromLocalStorage(reminder);
    removeReminderFromDevice(reminder);
  };

  const sendAllRemindersToDevice = () => {
    const remindersFromStorage = getAllRemindersFromLocalStorage();
    if (remindersFromStorage) {
      remindersFromStorage.forEach(reminder => {
        Array(5)
          .fill({value: 0})
          .forEach(_ => sendReminderToDevice(reminder));
      });
    }
  };

  const getReminderById = (reminderId: string): Reminder | null => {
    return getReminderFromLocalStorageById(reminderId);
  };

  const getAllReminders = (): Reminder[] => {
    return getAllRemindersFromLocalStorage();
  };
  const data = 'http://soundbible.com/mp3/analog-watch-alarm_daniel-simion.mp3';
  const playSound = () => {
    const audio = new Audio(data);
    audio.play();
  };

  return {
    reminders,
    remindersCount,
    addNewReminder,
    removeReminder,
    getAllReminders,
    getReminderById,
    initializeStore,
    currentReminder,
    notifyReminder,
    acknowledgeReminder,
  };
});
