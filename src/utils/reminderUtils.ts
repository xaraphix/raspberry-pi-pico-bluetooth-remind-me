import {REMINDERS} from '@/constants/Reminder';

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export const addReminderToLocalStorage = (reminder: Reminder) => {
  const remindersFromStorage = localStorage.getItem(REMINDERS);
  const currentReminders = remindersFromStorage
    ? JSON.parse(remindersFromStorage)
    : [];
  currentReminders.push(reminder);
  localStorage.setItem(REMINDERS, JSON.stringify(currentReminders));
};

export const removeReminderFromLocalStorage = (reminder: Reminder) => {
  const remindersFromStorage = localStorage.getItem(REMINDERS);
  if (remindersFromStorage) {
    const currentReminders = JSON.parse(remindersFromStorage) as Reminder[];
    const updatedReminders = currentReminders.filter(r => r.id !== reminder.id);
    localStorage.setItem(REMINDERS, JSON.stringify(updatedReminders));
  }
};

export const convertReminderToBytes = (reminder: Reminder) => {
  const duration = reminder.mins * 60 + reminder.secs;
  return encoder.encode(
    `${reminder.id}&${duration}&${reminder.periodic ? 'Y' : 'N'}&${
      reminder.toBeRemoved ? 'Y' : 'N'
    }`,
  );
};

export const updateReminderInStorage = (reminder: Reminder) => {
  removeReminderFromLocalStorage(reminder);
  addReminderToLocalStorage(reminder);
};

export const createReminderFromString = (
  reminderString: string,
): Reminder | null => {
  const reminderId = reminderString.split('&')[0];
  return getReminderFromLocalStorageById(reminderId);
};

export const getReminderFromLocalStorageById = (
  reminderId: string,
): Reminder | null => {
  const remindersFromStorage = localStorage.getItem(REMINDERS);
  if (remindersFromStorage) {
    const currentReminders = JSON.parse(remindersFromStorage) as Reminder[];
    return currentReminders.find(r => r.id === reminderId) as Reminder;
  }
  return null;
};

export const getAllRemindersFromLocalStorage = (): Reminder[] => {
  const remindersFromStorage = localStorage.getItem(REMINDERS);
  if (remindersFromStorage) {
    return JSON.parse(remindersFromStorage) as Reminder[];
  }
  return [];
};
