import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import FlowEdit from './../components/FlowEdit'
import FlowManage from "./../components/FlowManage";
const routes = [
  {
    path: '/',
    name: 'FlowManage',
    component: FlowManage
  },
  {
    path: '/FlowEdit',
    name: 'FlowEdit',
    component: FlowEdit
  },
  {
    path: '/FlowManage',
    name: 'FlowManage',
    component: FlowManage
  },
]

const router = new VueRouter({
  routes
})

export default router
