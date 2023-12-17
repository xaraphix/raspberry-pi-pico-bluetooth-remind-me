import time

class Reminder:
    def __init__(self, id, interval_seconds, completed, periodic):
        self.id = id
        self.interval_seconds = interval_seconds
        self.periodic = periodic
        self.completed = completed
        self.last_reminder_time = time.time()

    def is_time_for_reminder(self):
        current_time = time.time()
        elapsed_time = current_time - self.last_reminder_time
        return elapsed_time >= self.interval_seconds

    def execute_reminder(self):
        if self.is_time_for_reminder():
            self.last_reminder_time = time.time()
            if self.periodic == 'N':
                self.completed = 'Y'
  

