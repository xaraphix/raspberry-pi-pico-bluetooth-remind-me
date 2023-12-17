let readTaskCharacteristic = null;
let writeTaskCharacteristic = null;
let dateCharacteristic = null;
let serviceUuid = '0492fcec-7194-11eb-9439-0242ac130002';
let characteristicUuid = 'd4fe65e5-42e7-4616-9d13-06f24f72465f';
let newCharacteristicUuid = 'd4fe65e5-42e7-4616-9d13-06f24f7246ff';
let dateCharacteristicUuid = 'd4fe65e5-42e7-4616-9d13-06f24f724fff';

navigator.bluetooth
  .requestDevice({
    filters: [
      {
        namePrefix: 'RPi Pico Remind Me',
      },
    ],
    optionalServices: [serviceUuid],
  })
  .then(device => {
    console.log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    console.log('Getting Service...');
    return server.getPrimaryServices();
  })
  .then(services => {
    console.log('Getting Characteristics...');
    return services[0].getCharacteristics();
  })
  .then(characteristics => {
    characteristics.forEach(c => {
      switch (c.uuid) {
        case characteristicUuid:
          readTaskCharacteristic = c;
          readTaskCharacteristic.addEventListener(
            'characteristicvaluechanged',
            readTaskCharacteristicValChanged,
          );
          readTaskCharacteristic.readValue();
          break;
        case newCharacteristicUuid:
          writeTaskCharacteristic = c;
          break;
        case dateCharacteristicUuid:
          dateCharacteristic = c;
          break;
      }
    });
  })
  .catch(error => {
    console.error(error);
  });

function readTaskCharacteristicValChanged(event) {
  const batteryLevel = new TextDecoder().decode(event.target.value);
  console.log('Battery percentage is ' + batteryLevel);
  setTimeout(() => {
    if (readTaskCharacteristic) readTaskCharacteristic.readValue();
  }, 100);
}

setTimeout(() => {
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

  const encoder = new TextEncoder();
  console.log(timeString, new TextDecoder().decode(encoder.encode(timeString)));
  dateCharacteristic.writeValue(encoder.encode(timeString));
  writeTaskCharacteristic.writeValue(encoder.encode('NewTask&10&N&Y'));
}, 5000);
