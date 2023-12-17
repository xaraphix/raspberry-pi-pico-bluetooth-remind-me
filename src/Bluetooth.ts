import {useRemindersStore} from './stores/reminder';
import {
  convertReminderToBytes,
  createReminderFromString,
  decoder,
  encoder,
} from './utils/reminderUtils';

let readReminderCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let writeReminderCharacteristic: BluetoothRemoteGATTCharacteristic | null =
  null;
let dateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

const SERVICE_UUID = '0492fcec-7194-11eb-9439-0242ac130002';
const READ_REMINDERS_CHARACTERISTIC_UUID =
  'd4fe65e5-42e7-4616-9d13-06f24f72465f';
const NEW_REMINDER_CHARACTERISTIC_UUID = 'd4fe65e5-42e7-4616-9d13-06f24f7246ff';
const DATE_CHARACTERISTIC_UUID = 'd4fe65e5-42e7-4616-9d13-06f24f724fff';
const DEVICE_NAME = 'RPi Pico Remind Me';

let CONNECTED = false;

export const isConnected = () => {
  return CONNECTED;
};

export const initiateConnection = () => {
  navigator.bluetooth
    .requestDevice({
      filters: [
        {
          namePrefix: DEVICE_NAME,
        },
      ],
      optionalServices: [SERVICE_UUID],
    })
    .then(device => {
      console.log('Connecting to GATT Server...');
      return device?.gatt?.connect();
    })
    .then(server => {
      console.log('Getting Service...');
      return server?.getPrimaryServices();
    })
    .then((services: BluetoothRemoteGATTService[] | undefined) => {
      console.log('Getting Characteristics...');
      if (!services || !services.length) {
        return;
      }
      return services[0].getCharacteristics();
    })
    .then(
      (characteristics: BluetoothRemoteGATTCharacteristic[] | undefined) => {
        if (!characteristics || !characteristics.length) {
          return;
        }
        characteristics.forEach(c => {
          switch (c.uuid) {
            case READ_REMINDERS_CHARACTERISTIC_UUID:
              readReminderCharacteristic = c;
              readReminderCharacteristic?.addEventListener(
                'characteristicvaluechanged',
                readReminderCharacteristicValChanged,
              );
              readReminderCharacteristic?.readValue();
              break;
            case NEW_REMINDER_CHARACTERISTIC_UUID:
              writeReminderCharacteristic = c;
              break;
            case DATE_CHARACTERISTIC_UUID:
              dateCharacteristic = c;
              setInterval(syncTime, 2000);
              break;
          }
        });

        CONNECTED = true;
        return Promise.resolve();
      },
    )
    .catch((error: Error) => {
      CONNECTED = false;
      console.error(error);
    });
};

const readReminderCharacteristicValChanged = (event: Event) => {
  if (!event) {
    return;
  }
  const reminderString = decoder.decode(event.target?.value);
  if (reminderString !== '__$$NoTasks') {
    const reminder = createReminderFromString(reminderString);
    const {notifyReminder} = useRemindersStore();
    if (reminder) notifyReminder(reminder);
  }

  setTimeout(() => {
    try {
      if (readReminderCharacteristic) readReminderCharacteristic.readValue();
    } catch (e) {
      CONNECTED = false;
    }
  }, 100);
};

const syncTime = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes() + now.getSeconds() / 60.0).padStart(
    2,
    '0',
  );
  const timeString = `${year}&${month}&${date}&${hours}&${mins}`;

  console.log(timeString, decoder.decode(encoder.encode(timeString)));

  if (CONNECTED) {
    dateCharacteristic?.writeValue(encoder.encode(timeString));
  }
};

export const sendReminderToDevice = (reminder: Reminder) => {
  if (CONNECTED) {
    writeReminderCharacteristic?.writeValue(convertReminderToBytes(reminder));
  }
};

export const removeReminderFromDevice = (reminder: Reminder) => {
  if (CONNECTED) {
    reminder.toBeRemoved = true;
    writeReminderCharacteristic?.writeValue(convertReminderToBytes(reminder));
  }
};
