import Vue from 'vue'
import Router from 'vue-router'
import HandsontableDemo from '@/components/handsontableDemo/handsontableDemo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HandsontableDemo',
      component: HandsontableDemo
    }
  ]
})
