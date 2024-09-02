import AddEvent from '@/views/AddEvent.vue'
import AuthView from '@/views/Auth.vue'
import CompleteTaskUserView from '@/views/CompleteTaskUserView.vue'
import EventView from '@/views/EventView.vue'
import HomeView from '@/views/HomeView.vue'
import UserEventView from '@/views/UserEventView.vue'
import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			component: HomeView,
		},
		{
			path: '/auth',
			component: AuthView,
		},
		{
			path: '/event/:id',
			name: 'event',
			component: EventView,
		},
		{
			path: '/AddEvent',
			component: AddEvent,
		},
		{
			path: '/UserEvent',
			component: UserEventView,
		},
		{
			path: '/CompleteTaskUser',
			component: CompleteTaskUserView,
		},
	],
})

export default router
