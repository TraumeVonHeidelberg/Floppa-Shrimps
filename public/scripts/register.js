document.addEventListener('DOMContentLoaded', function () {
	console.log('register.js loaded')

	function addRegisterEventListener() {
		const registerButton = document.getElementById('register-btn')
		console.log('Register button:', registerButton)

		if (!registerButton) {
			console.error('Register button not found')
			return
		}

		registerButton.addEventListener('click', function (event) {
			event.preventDefault()
			console.log('Register button clicked')

			const username = document.querySelector('#username').value
			const email = document.querySelector('#email').value
			const password = document.querySelector('#password').value

			console.log('Username:', username)
			console.log('Email:', email)
			console.log('Password:', password)

			if (!username || !email || !password) {
				alert('Proszę wypełnić wszystkie pola')
				return
			}

			fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, email, password }),
			})
				.then(response => response.json())
				.then(data => {
					if (data.errors) {
						alert(data.errors.map(error => error.msg).join('\n'))
					} else {
						alert(data.msg)
						if (data.msg === 'Użytkownik zarejestrowany. Sprawdź swoją skrzynkę e-mail.') {
							document.getElementById('modal').style.display = 'none'
						}
					}
				})
				.catch(error => {
					console.error('Error:', error)
					alert('Wystąpił błąd podczas rejestracji.')
				})
		})
	}

	addRegisterEventListener()
})
