<template>
	<header>
		<router-link to="/" class="logo">SYMM</router-link>
	</header>
	<div class="container">
		<h1>Добавление ивента</h1>
		<form>
			<!-- Информация об ивенте -->
			<div>
				<label for="eventName">Название ивента:</label>
				<n-input id="eventName" type="text" v-model:value="eventName" />
			</div>
			<div>
				<label for="eventDatetime">Дата и время:</label>
				<n-input
					id="eventDatetime"
					type="datetime-local"
					placeholder=""
					v-model:value="eventDatetime"
				/>
			</div>
			<div>
				<label for="description">Описание:</label>
				<n-input
					type="textarea"
					id="description"
					v-model:value="description"
				></n-input>
			</div>
			<div>
				<label for="coordinates">Координаты:</label>
				<n-input id="coordinates" type="text" v-model:value="coordinates" />
			</div>
			<!-- План ивента -->
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
				<n-button type="info" @click.prevent="addTask"
					>Добавить задание</n-button
				>
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
			<!-- Фотографии ивента -->
			<div>
				<h2>Фотографии ивента</h2>
				<input type="file" multiple @change="handleFileUpload" />
			</div>
			<n-button
				type="info"
				class="btn"
				@click="submitEvent"
				style="margin-right: 20px"
				>Добавить ивент</n-button
			>
			<n-button type="info" class="btn" @click="submitPlanAndTasks"
				>Загрузить план и задачи</n-button
			>
		</form>
	</div>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useEventStore } from '../stores/index'

const message = useMessage()
const store = useEventStore()

const eventName = ref('')
const eventDatetime = ref('')
const description = ref('')
const coordinates = ref('')
const eventPlan = ref([{ name: '', time: '' }])
const eventTasks = ref([{ name: '', completed: false, points: 0 }])
const selectedPhotos = ref([])

const addStage = () => {
	eventPlan.value.push({ name: '', time: '' })
}

const addTask = () => {
	eventTasks.value.push({ name: '', completed: false, points: 0 })
}

const handleFileUpload = async event => {
	const files = event.target.files
	const formData = new FormData()
	for (let i = 0; i < files.length; i++) {
		formData.append('photos', files[i])
	}

	try {
		const res = await store.uploadPhotos(
			localStorage.getItem('eventId'),
			formData
		)
		if (res === true) {
			message.info('Фото загруженны')
		}
	} catch (error) {
		console.error('Ошибка при загрузке фотографий:', error)
		// Обработка ошибок при загрузке фотографий
	}
}

const submitEvent = async () => {
	try {
		const res = await store.createEvent({
			name: eventName.value,
			event_datetime: eventDatetime.value,
			description: description.value,
			coordinates: coordinates.value,
		})
		if (res === true) {
			message.info('Данные о мероприятии загружены')
		}
	} catch (error) {
		console.error('Ошибка при отправке данных на сервер:', error)
		// Обработка ошибок при отправке данных на сервер
	}
}

// const submitPlanAndTasks = async () => {
// 	const eventId = localStorage.getItem('eventId')
// 	try {
// 		const res = await store.addPlanAndTasks(eventId, {
// 			event_plan: eventPlan.value,
// 			event_tasks: eventTasks.value,
// 		})
// 		if (res === true) {
// 			message.info('План и задачи загруженны загружены')
// 		}
// 	} catch (error) {
// 		console.error('Ошибка при отправке данных на сервер:', error)
// 		// Обработка ошибок при отправке данных на сервер
// 	}
// }

const submitPlanAndTasks = async () => {
	const eventId = localStorage.getItem('eventId')
	const eventDateTime = new Date(eventDatetime.value)

	// Проверка времени проведения ивента и каждого этапа плана ивента
	for (const stage of eventPlan.value) {
		const stageTime = new Date(eventDateTime)
		const timeParts = stage.time.split(':')
		stageTime.setHours(parseInt(timeParts[0]))
		stageTime.setMinutes(parseInt(timeParts[1]))

		// Если время этапа раньше времени проведения ивента, выведите сообщение об ошибке
		if (stageTime < eventDateTime) {
			message.error(
				'Время этапа плана не может быть раньше времени проведения ивента'
			)
			return
		}
	}

	try {
		const res = await store.addPlanAndTasks(eventId, {
			event_plan: eventPlan.value,
			event_tasks: eventTasks.value,
		})
		if (res === true) {
			message.info('План и задачи загружены')
		}
	} catch (error) {
		console.error('Ошибка при отправке данных на сервер:', error)
		// Обработка ошибок при отправке данных на сервер
	}
}
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

.container {
	padding: 40px 80px;
}

.btn {
	margin-top: 20px;
}
</style>
