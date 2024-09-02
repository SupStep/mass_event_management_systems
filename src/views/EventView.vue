<template>
	<header>
		<router-link to="/" class="logo">SYMM</router-link>
		<div>
			<n-button v-if="isAdmin" type="info" @click="deleteEvent"
				>Удалить ивент</n-button
			>
		</div>
	</header>
	<div class="event-container">
		<div class="event-img_map">
			<n-carousel
				show-arrow
				style="box-shadow: 0px 15px 30px 0px rgba(34, 60, 80, 0.2)"
			>
				<img
					v-for="photo in eventDetails.eventPhotos"
					:src="getPhotoUrl(photo)"
					:key="photo"
					alt="Фото события"
					class="carousel-img"
				/>
			</n-carousel>
			<div class="map-container">
				<yandex-map
					:settings="{
						location: {
							center: eventCoordinates,
							zoom: 14,
						},
					}"
					width="600px"
					height="400px"
				>
					<yandex-map-default-scheme-layer />
					<yandex-map-default-features-layer />
					<yandex-map-marker
						:settings="{
							coordinates: eventCoordinates,
						}"
					>
						<div class="marker" />
					</yandex-map-marker>
				</yandex-map>
			</div>
		</div>
		<div class="event-about">
			<h1 class="event-title">{{ eventDetails.name }}</h1>
			<p class="event-data">
				Дата проведения: {{ formatDate(eventDetails.event_datetime) }}
			</p>
			<p class="event-desc">{{ eventDetails.description }}</p>

			<h2 class="title">План</h2>
			<ul class="plan-list">
				<li class="plan-item" v-for="stage in eventDetails.eventPlan">
					<h3 class="plan-title">{{ stage.stage_name }}</h3>
					<p class="plan-time">{{ stage.stage_time }}</p>
				</li>
			</ul>

			<h2 class="title">Задания в рамках мероприятия</h2>
			<div class="task-container">
				<div>
					<ul class="task-list">
						<li v-for="task in eventDetails.eventTasks" :key="task.task_name">
							<n-checkbox
								@update:checked="updateTotalPoints(task)"
								size="large"
								v-model:checked="task.completion_status"
								>{{ task.task_name }} ({{ task.points }} баллов)</n-checkbox
							>
						</li>
					</ul>
					<n-button type="info" @click="updateTaskCompletion"
						>Сохранить</n-button
					>
				</div>
				<div class="counter">
					<p>Количество баллов</p>
					<span>{{ totalPoints }}</span>
				</div>
			</div>
		</div>
	</div>

	<div v-if="isAdmin" class="update">
		<div class="event-about-update">
			<h3 class="event-title">Обновление основной информации</h3>
			<n-input
				v-model:value="eventName"
				type="text"
				placeholder="Название мероприятия"
			/>
			<n-input v-model:value="eventDate" type="datetime-local" placeholder="" />
			<n-input
				type="textarea"
				v-model:value="eventDescription"
				placeholder="Описание мероприятия"
			/>
			<n-input
				type="text"
				v-model:value="updateEventCoordinates"
				placeholder="координаты"
			/>
			<!-- Кнопка для вызова функции обновления -->
			<n-button type="info" @click="updateEvent">Обновить информацию</n-button>
		</div>

		<div>
			<h2>План ивента</h2>
			<n-button type="info" @click.prevent="addStage">Добавить этап</n-button>
			<div v-for="(stage, index) in eventPlan" :key="index">
				<label>Название этапа:</label>
				<n-input v-model:value="stage.name" />
				<label>Время этапа:</label>
				<n-input type="time" v-model:value="stage.time" />
			</div>
		</div>
		<!-- Задания ивента -->
		<div>
			<h2>Задания ивента</h2>
			<n-button type="info" @click.prevent="addTask">Добавить задание</n-button>
			<div v-for="(task, index) in eventTasks" :key="index">
				<label>Название задания:</label>
				<n-input v-model:value="task.name" />
				<label>Статус выполнения:</label>
				<input type="checkbox" v-model="task.completed" />
				<br />
				<label>Очки:</label>
				<n-input-number
					type="number"
					v-model:value="task.points"
					name="taskPoints"
				/>
			</div>
		</div>
		<n-button type="info" @click="updatePlanAndTask"
			>Обновить план и задачи</n-button
		>
		<div>
			<h2>Фотографии ивента</h2>
			<input type="file" multiple @change="handleUpdateFileUpload" />
		</div>
	</div>
</template>

<script setup>
import { useEventStore } from '@/stores'
import { useMessage } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
	YandexMap,
	YandexMapDefaultFeaturesLayer,
	YandexMapDefaultSchemeLayer,
	YandexMapMarker,
} from 'vue-yandex-maps'

const token = localStorage.getItem('userToken')
const userInfo = JSON.parse(localStorage.getItem('userToken'))
const role = userInfo ? userInfo.role : null
const isAdmin = ref(token && role === 'администратор')

const message = useMessage()

const {
	getEventDetails,
	saveUserEventTasks,
	deleteEventDetails,
	updateEventInfo,
	updatePlanAndTasks,
	uploadEventPhotos,
} = useEventStore()

const route = useRoute()
const eventId = computed(() => route.params.id)

const totalPoints = ref(0)

const eventDetails = ref([])
const eventCoordinates = ref([0, 0])

const eventName = ref('')
const eventDate = ref('')
const eventDescription = ref('')
const updateEventCoordinates = ref('')

const eventPlan = ref([{ name: '', time: '' }])
const eventTasks = ref([{ name: '', completed: false, points: 0 }])

const addStage = () => {
	eventPlan.value.push({ name: '', time: '' })
}

const addTask = () => {
	eventTasks.value.push({ name: '', completed: false, points: 0 })
}

const handleUpdateFileUpload = async event => {
	const files = event.target.files
	const formData = new FormData()
	for (let i = 0; i < files.length; i++) {
		formData.append('photos', files[i])
	}

	try {
		const res = await uploadEventPhotos(eventId.value, formData)
		if (res === true) {
			message.info('Фото загруженны')
		}
	} catch (error) {
		console.error('Ошибка при загрузке фотографий:', error)
		// Обработка ошибок при загрузке фотографий
	}
}

const updatePlanAndTask = async () => {
	for (const stage of eventPlan.value) {
		const stageTime = new Date(eventDate.value)
		const stageDateTime = new Date(stage.time)
		if (stageDateTime < stageTime) {
			message.error(
				'Время этапа плана не может быть раньше времени проведения ивента'
			)
			return
		}
	}
	try {
		const res = await updatePlanAndTasks(
			eventId.value,
			eventPlan.value,
			eventTasks.value
		)
		if (res === true) {
			message.info('План и задачи обновлены')
		}
	} catch (error) {
		console.error('Ошибка при обновлении плана и задач:', error)
		// Обработка ошибок
	}
}

const updateEvent = async () => {
	try {
		// Формируем объект с данными для обновления
		const eventData = {
			name: eventName.value,
			event_datetime: eventDate.value,
			description: eventDescription.value,
			coordinates: updateEventCoordinates.value,
			// Добавьте другие поля, если необходимо
		}

		// Вызываем функцию обновления информации из стора
		const res = await updateEventInfo(eventId.value, eventData)
		// Очищаем значения инпутов после обновления
		eventName.value = ''
		eventDate.value = ''
		eventDescription.value = ''
		if (res === true) {
			message.info('Информация обновлена')
			location.reload()
		}
	} catch (error) {
		console.error('Ошибка при обновлении информации о мероприятии:', error)
		// Обработка ошибок
	}
}

const updateTotalPoints = task => {
	// Убедимся, что task.points является числом
	if (!isNaN(task.points)) {
		if (task.completion_status) {
			totalPoints.value -= parseInt(task.points)
		} else {
			totalPoints.value += parseInt(task.points)
		}
	} else {
		console.error('Некорректное значение очков задания:', task.points)
	}
}

const updateTaskCompletion = async task => {
	try {
		await saveTasks() // Сохранение всех заданий при каждом изменении статуса выполнения
	} catch (error) {
		console.error('Ошибка при сохранении статуса выполнения задания:', error)
		message.error('Ошибка при сохранении статуса выполнения задания')
	}
}

const saveTasks = async () => {
	try {
		const idUser = JSON.parse(localStorage.getItem('userToken')).idUser

		for (const task of eventDetails.value.eventTasks) {
			await saveUserEventTasks(
				idUser,
				eventId.value,
				eventDetails.value.name,
				task.task_name,
				task.completion_status,
				task.points
			)
		}

		message.success('Задания сохранены успешно')
	} catch (error) {
		console.error('Ошибка при сохранении заданий:', error)
		message.error('Ошибка при сохранении заданий')
	}
}

const deleteEvent = async () => {
	try {
		const res = await deleteEventDetails(eventId.value)
		if (res.status === true) {
			message.info('Мероприятие удалено')
		}
	} catch (error) {
		console.error('Ошибка удаления:', error)
	}
}

const formatDate = dateTime => {
	const eventDate = new Date(dateTime)
	return eventDate.toLocaleString()
}

const getPhotoUrl = photoName => {
	return `http://localhost:5000/uploads/${photoName}`
}

onMounted(async () => {
	try {
		const loadedEvent = await getEventDetails(eventId.value)

		// Присваиваем полученные данные переменной eventDetails
		eventDetails.value = loadedEvent.event

		// Присваиваем координаты переменной eventCoordinates
		eventCoordinates.value = JSON.parse(loadedEvent.event.coordinates)

		if (loadedEvent.eventPlan) {
			eventDetails.value.eventPlan = loadedEvent.eventPlan
		}
		if (loadedEvent.eventTasks) {
			eventDetails.value.eventTasks = loadedEvent.eventTasks
		}
		if (loadedEvent.eventPhotos) {
			eventDetails.value.eventPhotos = loadedEvent.eventPhotos
		}
	} catch (error) {
		console.error('Ошибка при загрузке данных о событии:', error)
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

ul {
	list-style-type: none;
}

.logo {
	font-size: 28px;
	text-decoration: none;
	color: black;
}

.marker {
	position: relative;
	width: 10px;
	height: 10px;
	background: #ff0000;
	border-radius: 50%;
	border: 2px solid #fff;
	box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
	text-align: center;
	color: #fff;
	font-weight: bold;
	line-height: 20px;
}

.event-container {
	padding: 40px 80px;
	display: flex;
	gap: 40px;
}

.map-container {
	padding: 10px;
	border-radius: 10px;
	background-color: #fff;
	display: inline-block;
	box-shadow: 0px 15px 30px 0px rgba(34, 60, 80, 0.2);
}

.event-img_map {
	display: flex;
	flex-direction: column;
	gap: 20px;
	align-items: start;
	width: 620px;
}
.carousel-img {
	width: 100%;
	height: 440px;
	object-fit: cover;
}

.event-title {
	font-size: 38px;
}

.event-data {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 18px;
}

.event-desc {
	font-size: 16px;
	margin-bottom: 18px;
}

.plan-list {
	margin-left: 20px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 20px;
}

.plan-time {
	font-size: 16px;
	font-weight: bold;
}

.task-container {
	padding: 20px;
	background-color: #fff;
	border-radius: 10px;
	display: flex;
	justify-content: space-between;
}

.task-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 20px;
}

.counter {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-right: 40px;
}

.counter p {
	font-size: 18px;
}

.counter span {
	font-size: 80px;
	color: #4098fcff;
}

.update {
	width: 50%;
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 40px;
	margin: 0 auto;
}

.event-about-update {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
</style>
