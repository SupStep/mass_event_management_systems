<template>
	<div>
		<header>
			<router-link to="/" class="logo">SYMM</router-link>
		</header>

		<div class="container">
			<h2 style="margin-bottom: 20px">Выполнение заданий</h2>
			<div class="list">
				<div
					v-for="(taskGroup, index) in groupedTasks"
					:key="index"
					class="task-block"
				>
					<h3>Название мероприятия: {{ taskGroup.event_name }}</h3>
					<div
						v-for="(task, taskIndex) in taskGroup.tasks"
						:key="taskIndex"
						class="task-item"
					>
						<h4>Задание: {{ task.task_name }}</h4>
						<p>
							Статус выполнения:
							{{ task.completion_status ? 'Выполнено' : 'Не выполнено' }}
						</p>
						<p>Количество очков: {{ task.points }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useEventStore } from '@/stores'
import { computed, onMounted, ref } from 'vue'

const { getUserTasks } = useEventStore()

const idUser = JSON.parse(localStorage.getItem('userToken')).idUser
const userTasks = ref([])

onMounted(async () => {
	try {
		userTasks.value = await getUserTasks(idUser)
	} catch (error) {
		console.error('Ошибка при получении данных о заданиях пользователя:', error)
	}
})

// Группировка заданий по названию мероприятия
const groupedTasks = computed(() => {
	const grouped = {}
	userTasks.value.forEach(task => {
		if (!grouped[task.event_name]) {
			grouped[task.event_name] = {
				event_name: task.event_name,
				tasks: [],
			}
		}
		grouped[task.event_name].tasks.push(task)
	})
	return Object.values(grouped)
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
.container {
	padding: 40px 80px;
}

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

.task-block {
	background-color: #fff;
	padding: 20px;
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.list {
	display: flex;
	flex-wrap: wrap;
	gap: 40px;
}
</style>
