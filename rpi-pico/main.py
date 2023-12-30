
import sys

sys.path.append("")

from micropython import const

import uasyncio as asyncio
import aioble
import bluetooth
import machine
import random
import struct
import time

from reminders import Reminder

BLUETOOTH_DEVICE_NAME = "RPi Pico Remind Me"
TASK_SERVICE_UUID = bluetooth.UUID("0492fcec-7194-11eb-9439-0242ac130002")
TASK_CHARACTERISTIC_UUID = bluetooth.UUID("d4fe65e5-42e7-4616-9d13-06f24f72465f")
NEW_TASK_CHARACTERISTIC_UUID = bluetooth.UUID("d4fe65e5-42e7-4616-9d13-06f24f7246ff")
TIME_CHARACTERISTIC_UUID = bluetooth.UUID("d4fe65e5-42e7-4616-9d13-06f24f724fff")
_ADV_APPEARANCE_GENERIC_THERMOMETER = const(768)
_ADV_INTERVAL_MS = 250_000
TASKS = []

led = machine.Pin("LED", machine.Pin.OUT)
# Register GATT server.
task_service = aioble.Service(TASK_SERVICE_UUID)
task_characteristic = aioble.Characteristic(
    task_service, TASK_CHARACTERISTIC_UUID, read=True, notify=True)
new_task_characteristic = aioble.Characteristic(
    task_service, NEW_TASK_CHARACTERISTIC_UUID, read=True, notify=True, write=True, capture=True
)
time_characteristic = aioble.Characteristic(
    task_service, TIME_CHARACTERISTIC_UUID, read=True, notify=True, write=True, capture=True
)
aioble.register_services(task_service)
CONNECTION = None

async def peripheral_task():
    global CONNECTION
    while True:
        async with await aioble.advertise(
            _ADV_INTERVAL_MS,
            name=BLUETOOTH_DEVICE_NAME,
            services=[TASK_SERVICE_UUID],
            appearance=_ADV_APPEARANCE_GENERIC_THERMOMETER,
        ) as connection:
            CONNECTION = connection
            print("Connection from", connection.device)
            
            #await connection.disconnected()
            while connection.is_connected():
                await new_task_characteristic.written()
                task = new_task_characteristic.read().decode('utf-8').split("&")
                append_to_tasks(task)
                await asyncio.sleep_ms(500)
            
            print("Disconnected")  

async def time_task():
    global CONNECTION
    while True:
        while CONNECTION and CONNECTION.is_connected():
            await time_characteristic.written()
            time = time_characteristic.read().decode('utf-8').split("&")
            set_time(time)
            await asyncio.sleep_ms(500)
        
        await asyncio.sleep_ms(500)

def set_time(_time):
    rtc = machine.RTC()
    year = int(_time[0])
    month = int(_time[1])
    date = int(_time[2])
    hours = int(_time[3])
    mins = int(float(_time[4])/1)
    seconds = int((float(_time[4])* 60) % 60)
    print(mins, seconds)
    try:
        rtc.datetime((year, month, date, 0, hours, mins, seconds, 1))
    except:
        rtc.datetime((year, month, date, 0, hours, mins, 0, 20))

async def blink_task():
    """ Task to blink LED """
    
    global CONNECTION
    toggle = True
    while True:
        led.value(toggle)
        toggle = not toggle
        blink = 1000
        if CONNECTION and CONNECTION.is_connected():
            blink = 1000
        else:
            blink = 250
        await asyncio.sleep_ms(blink)
        
def append_to_tasks(task):
    global TASKS
    already_present = False
    id = task[0]
    if (task[3] == 'Y'):
        tasks = []
        for t in TASKS:
            if t.id == id:
                already_present = True
            if t.id != id:
                tasks.append(t)
        TASKS = tasks
        return
    
    if already_present:
        return
    
    interval_seconds = int(task[1])
    completed = 'N'
    periodic = task[2]
    new_task = Reminder(id, interval_seconds, completed, periodic)
    print(task)
    TASKS.append(new_task)

async def reminders_task():
    global CONNECTION
    while True:
        while CONNECTION and CONNECTION.is_connected():
            tasks_to_remind = get_tasks_to_remind()
            if not len(tasks_to_remind):
                print('NO TASKS')
                task_characteristic.write('__$$NoTasks')
                await asyncio.sleep_ms(10)
            else:
                
                print('TASKS TO SEND')
                for v in tasks_to_remind:
                    task_characteristic.write(v)
                    await asyncio.sleep_ms(10)
            await asyncio.sleep_ms(100)
            tasks_to_remind = []
        await asyncio.sleep_ms(100)

def get_tasks_to_remind():
    global TASKS
    tasks_to_remind = []
    for T in TASKS:
        if (T.periodic == 'Y' or (T.periodic == 'N' and T.completed == 'N')) and T.is_time_for_reminder():
            tasks_to_remind.append(T.id)
            T.execute_reminder()
    return tasks_to_remind

async def main():
    t1 = asyncio.create_task(reminders_task())
    t2 = asyncio.create_task(peripheral_task())
    t3 = asyncio.create_task(time_task())
    t4 = asyncio.create_task(blink_task())
    await asyncio.gather(t1, t2, t3, t4)

asyncio.run(main())

