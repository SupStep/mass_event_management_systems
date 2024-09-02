import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const serverUrl = 'http://localhost:5000/api'

const emailRegex =
	/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

function isEmailValid(email) {
	if (!email || email.length > 254) return false

	var valid = emailRegex.test(email)
	if (!valid) return false

	var parts = email.split('@')
	if (parts.length !== 2 || parts[0].length > 64) return false

	var domainParts = parts[1].split('.')
	if (
		domainParts.length < 2 ||
		domainParts.some(function (part) {
			return part.length > 63
		})
	)
		return false

	return true
}

export const useEventStore = defineStore('event', () => {
	const router = useRouter()

	const userInfo = ref({
		token: '',
		role: '',
		idUser: '',
	})

	const error = ref('')

	const createEvent = async eventData => {
		try {
			const response = await axios.post(`${serverUrl}/createEvent`, eventData)

			if (response.data.success) {
				const eventId = response.data.eventId
				localStorage.setItem('eventId', eventId)
				// Выполните необходимые действия с eventId
				return eventId, true
			} else {
				// Обработка ошибки при создании ивента
				console.error('Ошибка при создании события:', response.data.error)
				throw response.data.error
			}
		} catch (error) {
			// Обработка ошибок, возникающих при выполнении запроса
			console.error('Ошибка при отправке данных на сервер:', error)
			throw error
		}
	}

	const addPlanAndTasks = async (eventId, planAndTasksData) => {
		try {
			const response = await axios.post(`${serverUrl}/addPlanAndTasks`, {
				eventId,
				...planAndTasksData,
			})

			if (response.data.success) {
				// Обработка успешного добавления плана и задач
				return true
			} else {
				// Обработка ошибки при добавлении плана и задач
				console.error(
					'Ошибка при добавлении плана и задач:',
					response.data.error
				)
				throw response.data.error
			}
		} catch (error) {
			// Обработка ошибок, возникающих при выполнении запроса
			console.error('Ошибка при отправке данных на сервер:', error)
			throw error
		}
	}

	const uploadPhotos = async (eventId, formData) => {
		try {
			const response = await axios.post(
				`${serverUrl}/uploadPhotos/${eventId}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			)

			if (response.data.success) {
				// Обработка успешной загрузки фотографий
				return true
			} else {
				// Обработка ошибки при загрузке фотографий
				console.error('Ошибка при загрузке фотографий:', response.data.error)
				throw response.data.error
			}
		} catch (error) {
			// Обработка ошибок, возникающих при выполнении запроса
			console.error('Ошибка при отправке данных на сервер:', error)
			throw error
		}
	}

	const login = async payload => {
		const { email, password } = payload

		if (!isEmailValid(email)) {
			error.value = 'Неверный формат Email.'
			throw error.value
		}

		if (password.length < 8) {
			error.value = 'Пароль должен содержать минимум 8 символов.'
			throw error.value
		}
		try {
			const response = await axios.post(`${serverUrl}/login`, payload)
			userInfo.value = {
				token: response.data.accessToken,
				idUser: response.data.idUser,
				role: response.data.role,
			}
			console.log(userInfo.value)
			localStorage.setItem(
				'userToken',
				JSON.stringify({
					token: userInfo.value.token,
					idUser: userInfo.value.idUser,
					role: userInfo.value.role,
				})
			)
			router.push('/')
		} catch (err) {
			if (err.response && err.response.data) {
				switch (err.response.data.error.message) {
					case 'EMAIL_EXISTS':
						error.value = 'Пользователь с данным Email уже существует'
						break
					default:
						error.value = 'Ошибка данных'
						break
				}
			} else {
				console.error('Ошибка при входе:', err)
				throw err
			}
		}
	}

	const signup = async payload => {
		const { full_name, email, password } = payload

		if (!isEmailValid(email)) {
			error.value = 'Неверный формат Email.'
			throw error.value
		}

		if (password.length < 8) {
			error.value = 'Пароль должен содержать минимум 8 символов.'
			throw error.value
		}
		try {
			const response = await axios.post(`${serverUrl}/user`, {
				full_name,
				email,
				password,
			})
			userInfo.value = {
				token: response.data.accessToken,
				role: response.data.role,
				idUser: response.data.idUser,
			}

			localStorage.setItem(
				'userToken',
				JSON.stringify({
					token: userInfo.value.token,
					idUser: userInfo.value.idUser,
					role: userInfo.value.role,
				})
			)

			router.push('/')
		} catch (err) {
			console.error('Ошибка при регистрации:', err.response.data.error)
			switch (err.response.data.error.message) {
				case 'EMAIL_EXISTS':
					error.value = 'Пользователь с данным Email уже существует'
					break
				default:
					error.value = 'Ошибка данных: ' + err.response.data.error.message
					break
			}
			throw error.value
		}
	}

	const logout = () => {
		// Очистка localStorage
		localStorage.removeItem('userToken')
		// Очистка информации о пользователе в хранилище
		userInfo.value = {
			token: '',
			role: '',
			idUser: '',
		}
	}

	const getEvents = async () => {
		try {
			// Отправляем запрос на сервер для получения данных о событиях
			const events = await axios.get(`${serverUrl}/events`)

			return events.data
		} catch (error) {
			console.error('Ошибка при получении данных о событиях:', error)
			throw error
		}
	}

	const getEventDetails = async eventId => {
		try {
			const response = await axios.get(`${serverUrl}/events/${eventId}`)

			if (response.status === 200) {
				return response.data
			} else {
				console.error(
					'Ошибка при получении данных о мероприятии:',
					response.statusText
				)
				throw new Error('Ошибка при получении данных о мероприятии')
			}
		} catch (error) {
			console.error('Ошибка при отправке запроса на сервер:', error)
			throw error
		}
	}

	const saveUserEventTasks = async (
		idUser,
		eventId,
		event_name,
		taskName,
		completionStatus,
		points
	) => {
		try {
			await axios.post(`${serverUrl}/userEvent`, {
				idUser,
				eventId,
				event_name,
				taskName,
				completionStatus,
				points,
			})
			// В случае успешной отправки данных на сервер вы можете выполнить какие-либо дополнительные действия здесь, если это необходимо.
		} catch (error) {
			console.error('Ошибка при отправке данных на сервер:', error)
			throw error
		}
	}

	const getUserEventTasksDetails = async () => {
		try {
			const response = await axios.get(`${serverUrl}/userEventDetail`)
			return response.data
		} catch (error) {
			console.error(
				'Ошибка при получении данных о заданиях пользователей на мероприятиях:',
				error
			)
			throw error
		}
	}

	const getUserTasks = async userId => {
		try {
			const response = await axios.get(
				`${serverUrl}/userTasks?userId=${userId}`
			)
			return response.data
		} catch (error) {
			console.error(
				'Ошибка при получении данных о заданиях пользователя:',
				error
			)
			throw error
		}
	}

	const deleteEventDetails = async eventId => {
		try {
			// Отправляем запрос на сервер для удаления данных о мероприятии по его ID
			const response = await axios.delete(
				`${serverUrl}/deleteEvents/${eventId}`
			)

			if (response.status === 200) {
				router.push('/')
				return true
			} else {
				// В случае ошибки выводим сообщение
				console.error(
					'Ошибка при удалении данных о мероприятии:',
					response.statusText
				)
				throw new Error('Ошибка при удалении данных о мероприятии')
			}
		} catch (error) {
			// Обрабатываем ошибку, если запрос не удался
			console.error(
				'Ошибка при отправке запроса на удаление данных о мероприятии:',
				error
			)
			throw error
		}
	}

	const updateEventInfo = async (eventId, eventData) => {
		try {
			const response = await axios.patch(
				`${serverUrl}/updateEvent/${eventId}`,
				{ eventId, ...eventData }
			)

			if (response.data.success) {
				// Обработка успешного обновления информации о мероприятии
				return true
			} else {
				// Обработка ошибки при обновлении информации о мероприятии
				console.error(
					'Ошибка при обновлении информации о мероприятии:',
					response.data.error
				)
				throw response.data.error
			}
		} catch (error) {
			// Обработка ошибок, возникающих при выполнении запроса
			console.error('Ошибка при отправке данных на сервер:', error)
			throw error
		}
	}

	const updatePlanAndTasks = async (eventId, newPlan, newTasks) => {
		try {
			const response = await axios.post(
				`${serverUrl}/updatePlanAndTasks/${eventId}`,
				{
					eventId,
					newPlan,
					newTasks,
				}
			)

			if (response.data.success) {
				// Обработка успешного обновления плана и задач
				return true
			} else {
				// Обработка ошибки при обновлении плана и задач
				console.error(
					'Ошибка при обновлении плана и задач:',
					response.data.error
				)
				throw response.data.error
			}
		} catch (error) {
			// Обработка ошибок, возникающих при выполнении запроса
			console.error('Ошибка при отправке данных на сервер:', error)
			throw error
		}
	}

	const uploadEventPhotos = async (eventId, formData) => {
		try {
			console.log(eventId)
			const response = await axios.post(
				`${serverUrl}/updateEventPhotos/${eventId}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			)

			if (response.data.success) {
				// Обработка успешной загрузки фотографий
				return true
			} else {
				// Обработка ошибки при загрузке фотографий
				console.error('Ошибка при загрузке фотографий:', response.data.error)
				throw response.data.error
			}
		} catch (error) {
			// Обработка ошибок, возникающих при выполнении запроса
			console.error('Ошибка при отправке данных на сервер:', error)
			throw error
		}
	}

	return {
		createEvent,
		addPlanAndTasks,
		uploadPhotos,
		login,
		signup,
		getEvents,
		getEventDetails,
		saveUserEventTasks,
		getUserEventTasksDetails,
		deleteEventDetails,
		logout,
		updateEventInfo,
		updatePlanAndTasks,
		uploadEventPhotos,
		getUserTasks,
		userInfo,
		error,
	}
})
