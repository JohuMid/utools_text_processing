import Vue from 'vue'
import App from './App.vue'
import Element from 'element-ui'
import VueCodemirror from 'vue-codemirror'
import 'element-ui/lib/theme-chalk/index.css'
import 'codemirror/lib/codemirror.css'
import router from './router/index'

Vue.use(VueCodemirror)
Vue.use(Element)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
