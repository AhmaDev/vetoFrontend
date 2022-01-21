import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  { path: '/items', name: 'Items', component: () => import('../views/Items.vue') },
  { path: '/item/:id', name: 'Item', component: () => import('../components/Item.vue') },
  { path: '/invoices', name: 'Invoices', component: () => import('../views/Invoices.vue') },
  { path: '/invoice/:id', name: 'Invoice', component: () => import('../views/NewInvoice.vue') },
  { path: '/print/invoice/:id', name: 'InvoicePrint', component: () => import('../views/print/invoice.vue') },
  { path: '/new/invoice', name: 'Invoice', component: () => import('../views/NewInvoice.vue') },
  { path: '/customers', name: 'Customers', component: () => import('../views/Customers.vue') },
  { path: '/customer/:id', name: 'Customer', component: () => import('../components/Customer.vue') },
  { path: '/accounts', name: 'Accounts', component: () => import('../views/Accounts.vue') },
  { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue') },
  { path: '/reports', name: 'Reports', component: () => import('../views/Reports.vue') },
  { path: '/reports/overview', name: 'Overview', component: () => import('../views/reports/delegates/Overview.vue') },
  { path: '/visits', name: 'Visits', component: () => import('../views/Visits.vue') },
  { path: '/map', name: 'Map', component: () => import('../views/Map.vue') },
  { path: '/damagedItems', name: 'DamagedItems', component: () => import('../views/DamagedItems.vue') },
  { path: '/new/damagedItems', name: 'DamagedItems', component: () => import('../views/NewDamagedInvoice.vue') },
  { path: '/damagedItems/:id', name: 'DamagedItems', component: () => import('../views/NewDamagedInvoice.vue') },
  { path: '/user/:id', name: 'User', component: () => import('../views/User.vue') },
  { path: '/delivery', name: 'Delivery', component: () => import('../views/Delivery.vue') },
  { path: '/delivery/:id', name: 'DeliveryStatus', component: () => import('../components/DeliveryStatus.vue') },
  { path: '/money/:id', name: 'DeliveryStatus', component: () => import('../components/MoneyStatus.vue') },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
