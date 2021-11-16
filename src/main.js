import Vue from 'vue'
import iziToast from 'izitoast'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import App from './App.vue'
import store from './store'
import router from './router'


Vue.config.productionTip = process.env.NODE_ENV === 'production'

window.iziToast = iziToast

iziToast.settings({
  timeout: 10000,
  progressBar: true,
  transitionIn: 'fadeInUp',
  transitionOut: 'fadeOut',
  theme: 'dark',
  position: 'bottomLeft',
  progressBarColor: '#ffaa00',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  pauseOnHover: false,
  titleColor: '#ffaa00'
})

new Vue({
  store,
  router,
  render: h => h(App),
  created () {
    if (sessionStorage.redirect) {
      const redirect = sessionStorage.redirect

      delete sessionStorage.redirect

      console.log(redirect)

      this.$router.push(redirect)
    }
  }
}).$mount('#app')
