document.addEventListener('DOMContentLoaded', function () {
	const token = localStorage.getItem('token')
	if (!token) {
		window.location.href = '/login.html'
		return
	}

	let userProfile = {}

	const loadUserProfile = () => {
		fetch('/api/profile', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => {
				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
						localStorage.removeItem('token')
						window.location.href = '/login.html'
					}
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(user => {
				userProfile = user

				document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName} (${user.username || ''})`
				document.querySelector('.user-data[data-field="firstName"]').textContent = user.firstName
				document.querySelector('.user-data[data-field="lastName"]').textContent = user.lastName
				document.querySelector('.user-data[data-field="email"]').textContent = user.email
				document.querySelector('.user-data[data-field="phoneNumber"]').textContent = user.phoneNumber || ''
				document.querySelector('.user-data[data-field="role"]').textContent = user.role
				document.querySelector('.user-data[data-field="username"]').textContent = user.username || ''
				const profilePicture = user.profilePicture ? `img/uploads/${user.profilePicture}` : './img/avatar-big.jpg'
				document.getElementById('user-profile-picture').style.backgroundImage = `url(${profilePicture})`
			})
			.catch(error => {
				console.error('Error loading user profile:', error)
				alert('Błąd podczas ładowania profilu użytkownika.')
			})
	}

	const handleProfileUpdate = event => {
		const span = event.target
		const field = span.getAttribute('data-field')
		const value = span.textContent

		if (value === userProfile[field]) {
			// Jeśli wartość nie została zmieniona, zakończ funkcję
			return
		}

		// Ignoruj zmiany w polu role
		if (field === 'role') {
			loadUserProfile()
			return
		}

		const data = {}
		data[field] = value

		fetch('/api/profile', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})
			.then(response => response.json())
			.then(data => {
				if (data.errors) {
					alert(data.errors.map(error => error.msg).join('\n'))
				} else {
					alert('Profil zaktualizowany pomyślnie')
					userProfile[field] = value // Aktualizuj lokalne dane użytkownika
				}
			})
			.catch(error => {
				console.error('Error updating profile:', error)
				alert('Błąd podczas aktualizacji profilu.')
			})
	}

	const handleProfilePictureChange = event => {
		const file = event.target.files[0]
		if (file) {
			const formData = new FormData()
			formData.append('profilePicture', file)

			fetch('/api/profile-picture', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			})
				.then(response => response.json())
				.then(data => {
					if (data.errors) {
						alert(data.errors.map(error => error.msg).join('\n'))
					} else {
						alert('Zdjęcie profilowe zaktualizowane pomyślnie')
						loadUserProfile()
					}
				})
				.catch(error => {
					console.error('Error uploading profile picture:', error)
					alert('Błąd podczas zmiany zdjęcia profilowego.')
				})
		}
	}

	document.getElementById('user-profile-picture').addEventListener('click', () => {
		document.getElementById('profile-picture-input').click()
	})

	document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureChange)

	document.querySelectorAll('.user-data[contenteditable="true"]').forEach(span => {
		span.addEventListener('blur', handleProfileUpdate)
	})

	loadUserProfile()
})
