import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import ProtocolAuthView from '@/views/ProtocolAuthView.vue'
import ProtocolWorkbenchView from '@/views/ProtocolWorkbenchView.vue'
import ProtocolDataTestView from '@/views/ProtocolDataTestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/protocol', name: 'protocol', component: ProtocolAuthView },
    { path: '/protocol/workbench', name: 'protocol-workbench', component: ProtocolWorkbenchView },
    { path: '/protocol/data-test', name: 'protocol-data-test', component: ProtocolDataTestView },
  ],
})

export default router
