interface Reminder {
  completed?: boolean;
  id: string;
  name: string;
  periodic: boolean;
  mins: number;
  secs: number;
  toBeRemoved?: boolean;
}
