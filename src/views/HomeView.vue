<template>
	<header>
		<router-link to="/" class="logo">SYMM</router-link>
		<div>
			<n-button v-if="isUser" quaternary type="info" @click="goToComplete"
				>Выполнение заданий</n-button
			>
			<n-button
				v-if="isAdmin"
				type="info"
				@click="goToAddEvent"
				style="margin-right: 20px"
				>Добавить ивент</n-button
			>
			<n-button
				v-if="isAdmin"
				type="info"
				@click="goToUserEvent"
				style="margin-right: 20px"
				>Очки пользователей</n-button
			>
			<n-button v-if="!isAuth" quaternary type="info" @click="goToAuth"
				>Регистрация</n-button
			>
			<n-button v-if="isAuth" quaternary type="info" @click="handleLogout"
				>Выход</n-button
			>
		</div>
	</header>
	<main>
		<h1 class="title">МЕРОПРИЯТИЯ</h1>
		<div class="event-container">
			<div class="event" v-for="event in events" :key="event.id">
				<h2 class="event-title">{{ event.name }}</h2>
				<p class="event-date">
					Дата проведения: <br />
					{{ formatDateTime(event.event_datetime) }}
				</p>
				<n-button quaternary type="info" @click="goToEvent(event.id)"
					>Перейти</n-button
				>
			</div>
		</div>
	</main>
</template>

<script setup>
import { useEventStore } from '@/stores'
import { useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const { getEvents, logout } = useEventStore()

const message = useMessage()

const router = useRouter()
const token = localStorage.getItem('userToken')
const userInfo = JSON.parse(localStorage.getItem('userToken'))
const role = userInfo ? userInfo.role : null

const isAdmin = ref(token && role === 'администратор')
const isUser = ref(token && role === 'пользователь')
const isAuth = ref(token && role)

const handleLogout = () => {
	logout()
	location.reload()
}
// Функция для перехода на страницу события
const goToEvent = eventId => {
	if (token) {
		router.push({ name: 'event', params: { id: eventId } })
	} else {
		message.error('Для начала авторизуйтесь')
	}
}

const goToAuth = () => {
	if (!token) {
		router.push('/auth')
	} else {
		message.success('Вы уже авторизованы')
	}
}

const goToComplete = () => {
	router.push('/CompleteTaskUser')
}

const formatDateTime = dateTimeString => {
	const dateTime = new Date(dateTimeString)
	return dateTime.toLocaleString('ru-RU', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

const goToAddEvent = () => {
	router.push('/AddEvent')
}

const goToUserEvent = () => {
	router.push('/UserEvent')
}
const events = ref([])
onMounted(async () => {
	try {
		const loadedEvents = await getEvents() // Вызываем функцию getEvents при монтировании компонента, чтобы загрузить данные
		events.value = loadedEvents // Присваиваем полученные данные переменной events
	} catch (error) {
		console.error('Ошибка при загрузке данных о событиях:', error)
	}
})
</script>

<style scoped>
header {
	display: flex;
	padding: 10px 80px;
	justify-content: space-between;
	align-items: center;
	background-color: #fff;
	box-shadow: 0px 9px 16px -1px rgba(34, 60, 80, 0.2);
}

.logo {
	font-size: 28px;
	text-decoration: none;
	color: black;
}

main {
	padding: 40px 80px;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.title {
	text-align: center;
}

.event-container {
	display: flex;
	justify-content: space-around;
	flex-wrap: wrap;
	gap: 40px;
}

.event {
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 18%;
	padding: 20px;
	background-color: #fff;
	border-radius: 10px;
	text-align: center;
	box-shadow: 0px 15px 30px 0px rgba(34, 60, 80, 0.2);
}
</style>
