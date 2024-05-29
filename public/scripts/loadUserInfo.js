document.addEventListener('DOMContentLoaded', function () {
	const urlParams = new URLSearchParams(window.location.search)
	const token = urlParams.get('token')

	if (token) {
		localStorage.setItem('token', token)
		history.replaceState({}, document.title, window.location.pathname) // Usunięcie tokena z URL
	}

	const loadUserProfile = () => {
		const token = localStorage.getItem('token')
		if (!token) {
			window.location.href = '/login.html'
			return
		}

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
				document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName} (${user.username || ''})`
				document.querySelector('.user-data[data-field="firstName"]').textContent = user.firstName
				document.querySelector('.user-data[data-field="lastName"]').textContent = user.lastName
				document.querySelector('.user-data[data-field="email"]').textContent = user.email
				document.querySelector('.user-data[data-field="phoneNumber"]').textContent = user.phoneNumber || ''
				document.querySelector('.user-data[data-field="role"]').textContent = user.role
				document.querySelector('.user-data[data-field="username"]').textContent = user.username || ''
			})
			.catch(error => {
				console.error('Error loading user profile:', error)
				alert('Wystąpił błąd podczas ładowania profilu użytkownika.')
			})
	}

	loadUserProfile()
})
