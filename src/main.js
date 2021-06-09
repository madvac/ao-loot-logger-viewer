import Vue from 'vue'

import App from './App.vue'
import store from './store'
import lazyload from './directives/lazyload'

Vue.config.productionTip = process.env.NODE_ENV === 'production'

Vue.directive('lazyload', lazyload)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
