import Vue from 'vue'
import iziToast from 'izitoast'

import App from './App.vue'
import store from './store'

Vue.config.productionTip = process.env.NODE_ENV === 'production'

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
  render: h => h(App)
}).$mount('#app')
