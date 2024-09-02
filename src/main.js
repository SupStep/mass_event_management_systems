import naive from 'naive-ui'
import { createPinia } from 'pinia'
import 'vfonts/Roboto.css'
import { createApp } from 'vue'
import { createYmaps } from 'vue-yandex-maps'
import App from './App.vue'
import './assets/main.css'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)
app.use(
	createYmaps({
		apikey: '7e68ec2a-85d7-442d-9c23-df5d60044c89',
	})
)

app.mount('#app')
