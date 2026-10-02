import { createApp } from 'vue'
import { Quasar, Notify } from 'quasar'
import { createPinia } from 'pinia'
import router from './router'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import '@/desk/desk/framework/theme/desk-tokens.css'
import '@/desk/desk/framework/theme/desk-grid.css'
import { configureDesk } from '@/desk/desk/framework/host'
import App from './App.vue'

configureDesk({
  presets: {},
  presetLabels: [],
  defaultPreset: '',
  label: (id: string) => id
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.use(Quasar, {
  plugins: { Notify },
})

// Bootstrap auth store so the global 401 interceptor registers immediately
import('@/stores/auth').then(({ useAuthStore }) => useAuthStore())

app.mount('#app')
