import { createApp } from 'vue'
import App from './index.vue'
import '../assets/index.css'

chrome.devtools.panels.create('NetWanter', '', '../../devtools.html', function () {
  console.log('devtools panel create')
})


createApp(App).mount('#app')
