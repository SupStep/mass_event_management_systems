<template>
	<div class="container">
		<form v-if="!isAccount">
			<h1 class="form-title">Регистрация</h1>
			<div class="wrapper-input">
				<n-input
					v-model:value="email"
					type="email"
					placeholder="Почта"
				></n-input>
				<n-input v-model:value="fio" type="text" placeholder="ФИО"></n-input>
				<n-input
					v-model:value="password"
					type="password"
					placeholder="Пароль"
				></n-input>
			</div>
			<n-button type="info" @click.prevent="register">Регистрация</n-button>
			<span>Есть аккаунт?</span>
			<a @click="toggleAccount" class="toggle-btn">Войти</a>
		</form>

		<form v-if="isAccount">
			<h1 class="form-title">Вход</h1>
			<div class="wrapper-input">
				<n-input
					v-model:value="email"
					type="email"
					placeholder="Почта"
				></n-input>
				<n-input
					v-model:value="password"
					type="password"
					placeholder="Пароль"
				></n-input>
			</div>
			<n-button type="info" @click.prevent="loginUser">Вход</n-button>
			<span>Нет аккаунта?</span>
			<a @click="toggleAccount" class="toggle-btn">Регистрация</a>
		</form>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useEventStore } from '../stores/index'

const fio = ref('')
const email = ref('')
const password = ref('')

const isAccount = ref(false)

const toggleAccount = () => {
	isAccount.value = !isAccount.value
}

const { signup, login } = useEventStore()

const register = async () => {
	try {
		await signup({
			full_name: fio.value,
			email: email.value,
			password: password.value,
		})
	} catch (error) {
		if (error.response && error.response.data) {
			console.error('Ошибка при регистрации:', error.response.data)
		} else {
			console.error('Ошибка при регистрации:', error)
		}
	}
}

const loginUser = async () => {
	try {
		await login({ email: email.value, password: password.value })
	} catch (error) {
		console.error('Ошибка при входе:', error)
	}
}
</script>

<style scoped>
.container {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #fff;
	padding: 20px;
	border-radius: 10px;
	box-shadow: 0px 15px 30px 0px rgba(34, 60, 80, 0.2);
	width: 25%;
}

.form-title {
	text-align: center;
	margin-bottom: 20px;
}

.wrapper-input {
	display: flex;
	flex-direction: column;
	gap: 20px;
	margin-bottom: 20px;
}

.toggle-btn {
	color: #4098fcff;
	cursor: pointer;
	margin-left: 10px;
}

span {
	margin-left: 60px;
}
</style>
