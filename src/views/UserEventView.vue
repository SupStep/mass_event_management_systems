<template>
	<header>
		<router-link to="/" class="logo">SYMM</router-link>
		<div></div>
	</header>
	<div class="container">
		<div
			v-for="(userEvent, userIndex) in userEventTasksDetails"
			:key="userIndex"
			class="task-block"
		>
			<p>Пользователь: {{ userEvent.user_full_name }}</p>
			<div
				v-for="(event, eventIndex) in userEvent.events"
				:key="eventIndex"
				class="event-block"
			>
				<h3>Название мероприятия: {{ event.event_name }}</h3>
				<div v-for="(task, taskIndex) in event.tasks" :key="taskIndex">
					<p>Задание: {{ task.task_name }}</p>
					<p>
						Статус выполнения:
						{{ task.completion_status ? 'Выполнено' : 'Не выполнено' }}
					</p>
					<p>Количество очков: {{ task.points }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useEventStore } from '@/stores'
import { onMounted, ref } from 'vue'

const { getUserEventTasksDetails } = useEventStore()

const userEventTasksDetails = ref([])

onMounted(async () => {
	try {
		const data = await getUserEventTasksDetails()
		// Преобразование данных в ожидаемый формат
		userEventTasksDetails.value = transformData(data)
	} catch (error) {
		console.error(
			'Ошибка при получении данных о заданиях пользователей на мероприятиях:',
			error
		)
	}
})

// Функция преобразования данных
const transformData = data => {
	const transformedData = []
	for (const userFullName in data) {
		if (Object.hasOwnProperty.call(data, userFullName)) {
			const userData = {
				user_full_name: userFullName,
				events: data[userFullName],
			}
			transformedData.push(userData)
		}
	}
	return transformedData
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

ul {
	list-style-type: none;
}

.logo {
	font-size: 28px;
	text-decoration: none;
}

.container {
	display: flex;
	flex-wrap: wrap;
	gap: 40px;
	padding: 40px 80px;
}

.task-block {
	background-color: #fff;
	border-radius: 10px;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	box-shadow: 0px 15px 30px 0px rgba(34, 60, 80, 0.2);
}
</style>
