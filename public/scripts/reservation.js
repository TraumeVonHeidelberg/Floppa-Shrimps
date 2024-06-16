document.addEventListener('DOMContentLoaded', function () {
	const API_URL = window && window.process && window.process.type === 'renderer' ? 'http://localhost:3000/api' : '/api'

	const reservationForm = document.getElementById('reservation-form')
	const firstNameField = document.getElementById('firstNameField')
	const lastNameField = document.getElementById('lastNameField')
	const emailField = document.getElementById('emailField')
	const reservationDate = document.getElementById('reservation-date')
	const timeSelect = document.getElementById('time')
	const seatsSelect = document.getElementById('seats')

	const openingHours = {
		weekday: { start: 8, end: 22 },
		weekend: { start: 12, end: 24 },
	}

	/**
+ * This function populates the time select options based on the selected day and date.
+ * It takes in two parameters: dayOfWeek, which is the number representing the day of the week,
+ * and selectedDate, which is the date selected by the user.
+ * 
+ * The function first clears the options in the time select element.
+ * 
+ * It then determines the start and end hours based on whether the day is a weekday or weekend.
+ * 
+ * It also checks if the selected date is today and if it is, it skips any times before the current time.
+ * 
+ * The function then loops through each hour between the start and end hours.
+ * For each hour, it creates an option for each 30 minute interval.
+ * 
+ * The created options are added to the time select element.
+ */

	function populateTimeOptions(dayOfWeek, selectedDate) {
		timeSelect.innerHTML = '' // Clear the options in the time select element

		// Determine the start and end hours based on whether the day is a weekday or weekend
		let startHour, endHour
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			startHour = openingHours.weekday.start
			endHour = openingHours.weekday.end
		} else {
			startHour = openingHours.weekend.start
			endHour = openingHours.weekend.end
		}

		// Check if the selected date is today and if it is, skip any times before the current time
		const currentDateTime = new Date()
		const isToday = selectedDate.toDateString() === currentDateTime.toDateString()

		// Loop through each hour between the start and end hours
		for (let hour = startHour; hour < endHour; hour++) {
			const hourFormatted = hour.toString().padStart(2, '0') // Format the hour as a two-digit string

			for (let minutes of ['00', '30']) {
				const timeString = `${hourFormatted}:${minutes}`
				const timeOption = new Date(selectedDate)
				const [hours, mins] = timeString.split(':')
				timeOption.setHours(hours, mins)

				// Skip any times before the current time if the selected date is today
				if (isToday && timeOption <= currentDateTime) continue

				timeSelect.appendChild(new Option(timeString, timeString))
			}
		}
	}

	/**
	 * Fetches the maximum number of seats from the server.
	 * If the fetch is successful, it returns the maximum number of seats.
	 * If the fetch fails, it logs an error and returns a default value of 10.
	 *
	 * @return {Promise<number>} The maximum number of seats or a default value.
	 */
	async function fetchMaxSeats() {
		try {
			// Send a GET request to the server to fetch the maximum number of seats
			const response = await fetch(`${API_URL}/tables/max-seats`)

			// Check if the response was successful (status code in the 200-299 range)
			if (response.ok) {
				// Parse the response as JSON and extract the maximum number of seats
				const data = await response.json()
				return data.maxSeats
			} else {
				// If the response is not successful, throw an error
				throw new Error('Error fetching max seats')
			}
		} catch (error) {
			// If any errors occur during the fetch, log the error and return a default value
			console.error('Error:', error)
			return 10
		}
	}

	/**
	 * Populates the seats select options based on the available seats and the
	 * selected seats. If availableSeats is null, all seats are available.
	 *
	 * @param {Array|null} availableSeats - An array of available seats or null.
	 * @param {number|null} selectedSeats - The selected number of seats or null.
	 */
	async function populateSeatsOptions(availableSeats = null, selectedSeats = null) {
		// Fetch the maximum number of seats from the server
		const maxSeats = await fetchMaxSeats()

		// Clear the seats select options
		seatsSelect.innerHTML = ''

		// Loop through each seat number from 1 to the maximum number of seats
		for (let i = 1; i <= maxSeats; i++) {
			// Create a new option element for each seat number
			const option = new Option(i, i)

			// If availableSeats is null or if the current seat number is included in availableSeats,
			// add the option element to the seats select options
			if (availableSeats === null || availableSeats.includes(i)) {
				seatsSelect.appendChild(option)
			}
		}

		// If selectedSeats is not null and is included in availableSeats or if availableSeats is null,
		// set the value of the seats select options to the selected number of seats.
		// Otherwise, set the value to 2.
		if (selectedSeats && (availableSeats === null || availableSeats.includes(selectedSeats))) {
			seatsSelect.value = selectedSeats
		} else {
			seatsSelect.value = 2
		}
	}

	// This function updates the available seats based on the selected date and time.
	// It sends a POST request to the server with the selected date and time as the request body.
	// If the response is successful, it parses the JSON data and passes the available seats and the selected seats to the populateSeatsOptions function.
	// If the response is not successful, it logs an error message to the console.
	// If any errors occur during the process, it logs the error to the console.
	async function updateAvailableSeats() {
		// Get the selected date and time from the form fields
		const date = reservationDate.value
		const time = timeSelect.value

		// If both date and time are selected, proceed with the update
		if (date && time) {
			// Get the selected number of seats from the seats select options
			const selectedSeats = parseInt(seatsSelect.value) || 2

			try {
				// Send a POST request to the server with the selected date and time as the request body
				const response = await fetch(`${API_URL}/available-seats`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ date, time }),
				})

				// Check if the response is successful
				if (response.ok) {
					// Parse the JSON data from the response
					const data = await response.json()

					// Pass the available seats and the selected seats to the populateSeatsOptions function
					populateSeatsOptions(data.availableSeats, selectedSeats)
				} else {
					// If the response is not successful, log an error message to the console
					console.error('Error fetching available seats')
				}
			} catch (error) {
				// If any errors occur during the process, log the error to the console
				console.error('Error:', error)
			}
		}
	}

	const today = new Date()
	reservationDate.min = today.toISOString().split('T')[0]
	reservationDate.value = today.toISOString().split('T')[0] // Ustawienie dzisiejszej daty jako domyślnej

	reservationDate.addEventListener('change', function () {
		const selectedDate = new Date(this.value)
		const dayOfWeek = selectedDate.getUTCDay()
		populateTimeOptions(dayOfWeek, selectedDate)
		updateAvailableSeats()
	})

	timeSelect.addEventListener('change', updateAvailableSeats)

	// Populate options on initial load
	populateTimeOptions(today.getUTCDay(), today)
	updateAvailableSeats()

	reservationForm.addEventListener('submit', function (event) {
		event.preventDefault()

		const date = reservationDate.value
		const time = timeSelect.value
		const seats = seatsSelect.value
		const additionalInfo = document.getElementById('additionalInfo').value
		const firstName = document.getElementById('firstName').value
		const lastName = document.getElementById('lastName').value
		const email = document.getElementById('email').value

		const token = localStorage.getItem('token')
		let reservationData = { date, time, seats, additionalInfo }

		if (!token) {
			if (!firstName || !lastName || !email) {
				Swal.fire({
					title: 'Uwaga!',
					text: 'Proszę wypełnić wszystkie pola.',
					icon: 'warning',
					confirmButtonText: 'OK',
				})
				return
			}
			reservationData = { ...reservationData, firstName, lastName, email }
		}

		fetch(`${API_URL}/reservations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
			},
			body: JSON.stringify(reservationData),
		})
			.then(response => {
				console.log('Response status:', response.status)
				return response.json()
			})
			.then(data => {
				if (data.error) {
					Swal.fire({
						title: 'Błąd!',
						text: data.error,
						icon: 'error',
						confirmButtonText: 'OK',
					})
				} else {
					Swal.fire({
						title: 'Sukces!',
						text: 'Rezerwacja została złożona pomyślnie!',
						icon: 'success',
						confirmButtonText: 'OK',
					})
					reservationForm.reset()
					reservationDate.value = today.toISOString().split('T')[0] // Resetowanie daty do dzisiejszej
					populateTimeOptions(today.getUTCDay(), today) // Odświeżenie dostępnych godzin
					populateSeatsOptions()
				}
			})
			.catch(error => console.error('Error:', error))
	})

	const toggleAdditionalFields = () => {
		const token = localStorage.getItem('token')
		if (!token) {
			firstNameField.classList.remove('hidden')
			lastNameField.classList.remove('hidden')
			emailField.classList.remove('hidden')
		} else {
			firstNameField.classList.add('hidden')
			lastNameField.classList.add('hidden')
			emailField.classList.add('hidden')
		}
	}

	toggleAdditionalFields()

	window.addEventListener('storage', event => {
		if (event.key === 'token') {
			toggleAdditionalFields()
		}
	})

	document.addEventListener('userLoggedIn', toggleAdditionalFields)

	toggleAdditionalFields()
})
