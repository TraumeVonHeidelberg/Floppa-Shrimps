document.addEventListener('DOMContentLoaded', function () {
	const token = localStorage.getItem('token')
	if (!token) {
		window.location.href = '/login.html'
		return
	}

	const loadUserProfile = () => {
		fetch('/api/profile', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
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
			document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName}${user.username ? ` (${user.username})` : ''}`
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

	const handleProfilePictureChange = (event) => {
		const file = event.target.files[0]
		if (file) {
			const formData = new FormData()
			formData.append('profilePicture', file)

			fetch('/api/profile-picture', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				},
				body: formData
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

	const handleProfileUpdate = (event) => {
		const field = event.target.getAttribute('data-field')
		const value = event.target.textContent

		fetch('/api/profile', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ [field]: value })
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
		.then(data => {
			if (data.errors) {
				alert(data.errors.map(error => error.msg).join('\n'))
			} else {
				alert('Profil zaktualizowany pomyślnie')
				loadUserProfile()
			}
		})
		.catch(error => {
			console.error('Error updating profile:', error)
			alert('Błąd podczas aktualizacji profilu.')
		})
	}

	document.getElementById('user-profile-picture').addEventListener('click', () => {
		document.getElementById('profile-picture-input').click()
	})

	document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureChange)

	// Dodaj zdarzenie blur do elementów contenteditable
	document.querySelectorAll('.user-data[contenteditable="true"]').forEach(element => {
		element.addEventListener('blur', handleProfileUpdate)
	})

	loadUserProfile()
})
