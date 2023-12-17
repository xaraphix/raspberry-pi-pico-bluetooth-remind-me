import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ConnectBluetoothView from '../views/ConnectBluetoothView.vue';
import ReminderView from '../views/ReminderView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/connect',
      name: 'connect',
      component: ConnectBluetoothView,
    },
    {
      path: '/reminders',
      name: 'reminders',
      component: ReminderView,
    },
  ],
});

export default router;
