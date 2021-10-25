import VueRouter from 'vue-router'

import Home from './pages/Home.vue'

const router = new VueRouter({
  base: process.env.BASE_URL,
  mode: 'history',
  routes: [
    {
      path: '/:bin?',
      component: Home,
    },
    { path: '*', redirect: '/' }
  ]
})

export default router
