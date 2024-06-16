document.addEventListener('DOMContentLoaded', function () {
	const modal = document.getElementById('modal')
	const btn = document.getElementById('login-icon')
	const modalContent = document.getElementById('modal-content')
	const userOptions = document.getElementById('user-options')
	const logoutBtn = document.getElementById('logout-btn')

	// Funkcja do wyświetlania modalnego okna lub menu użytkownika
	btn.onclick = function (event) {
		if (localStorage.getItem('token')) {
			userOptions.classList.toggle('hidden')
			event.stopPropagation() // Zatrzymaj propagację eventu kliknięcia
		} else {
			modal.style.display = 'flex'
		}
	}

	// Funkcja do zamykania modalnego okna
	function closeModal() {
		modal.style.display = 'none'
	}

	// Funkcja do przypisania event listenerów po dynamicznym załadowaniu zawartości modala
	function assignCloseModalListener() {
		const closeBtn = document.getElementById('close-login')
		if (closeBtn) {
			closeBtn.onclick = closeModal
		}
	}

	// Funkcja do ładowania formularza logowania
	function loadLoginForm() {
		modalContent.innerHTML = `
            <div class="modal-item">
                <h2 class="login-header">Zaloguj Się</h2>
                <i id="close-login" class="fa-solid fa-x close-login"></i>
            </div>
            <input class="form-input" type="email" id="login-email" placeholder="E-Mail">
            <input class="form-input" type="password" id="login-password" placeholder="Hasło">
            <button class="create-account-btn" id="login-btn">Zaloguj się</button>
            <p class="login-text">Nie masz konta? <span id="register-link">Zarejestruj się</span></p>
        `

		assignCloseModalListener()

		// Dodanie event listenera do linku rejestracji
		document.getElementById('register-link').onclick = loadRegisterForm

		// Dodanie event listenera do przycisku logowania
		document.getElementById('login-btn').addEventListener('click', handleLogin)
	}

	// Funkcja do ładowania formularza rejestracji
	function loadRegisterForm() {
		modalContent.innerHTML = `
            <div class="modal-item">
                <h2 class="login-header">Zarejestruj Się</h2>
                <i id="close-login" class="fa-solid fa-x close-login"></i>
            </div>
            <input class="form-input" type="text" id="firstName" placeholder="Imię">
            <input class="form-input" type="text" id="lastName" placeholder="Nazwisko">
            <input class="form-input" type="email" id="email" placeholder="E-Mail">
            <input class="form-input" type="password" id="password" placeholder="Hasło">
            <button class="create-account-btn" id="register-btn">Stwórz Konto</button>
            <p class="login-text">Posiadasz już konto? <span id="login-link">Zaloguj się</span></p>
        `

		assignCloseModalListener()

		// Dodanie event listenera do linku logowania
		document.getElementById('login-link').onclick = loadLoginForm

		// Dodanie event listenera do przycisku rejestracji
		document.getElementById('register-btn').addEventListener('click', handleRegistration)
	}

	// Funkcja obsługująca rejestrację
	function handleRegistration(event) {
		event.preventDefault()
		console.log('Register button clicked')

		const firstName = document.getElementById('firstName').value
		const lastName = document.getElementById('lastName').value
		const email = document.getElementById('email').value
		const password = document.getElementById('password').value

		if (!firstName || !lastName || !email || !password) {
			Swal.fire({
				title: 'Uwaga!',
				text: 'Proszę wypełnić wszystkie pola',
				icon: 'warning',
				confirmButtonText: 'OK',
			})
			return
		}

		fetch('http://localhost:3000/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ firstName, lastName, email, password }),
		})
			.then(response => response.json())
			.then(data => {
				if (data.errors) {
					Swal.fire({
						title: 'Błędy!',
						html: data.errors.map(error => `<p>${error.msg}</p>`).join(''),
						icon: 'error',
						confirmButtonText: 'OK',
					})
				} else {
					Swal.fire({
						title: 'Informacja',
						text: data.msg,
						icon: 'info',
						confirmButtonText: 'OK',
					})
					if (data.msg === 'Użytkownik zarejestrowany. Sprawdź swoją skrzynkę e-mail.') {
						document.getElementById('modal').style.display = 'none'
					}
				}
			})
			.catch(error => {
				console.error('Error:', error)
				Swal.fire({
					title: 'Błąd!',
					text: 'Wystąpił błąd podczas rejestracji.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	// Funkcja obsługująca logowanie
	function handleLogin(event) {
		event.preventDefault()
		console.log('Login button clicked')

		const email = document.getElementById('login-email').value
		const password = document.getElementById('login-password').value

		if (!email || !password) {
			Swal.fire({
				title: 'Uwaga!',
				text: 'Proszę wypełnić wszystkie pola',
				icon: 'warning',
				confirmButtonText: 'OK',
			})
			return
		}

		fetch('http://localhost:3000/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email, password }),
		})
			.then(response => response.json())
			.then(data => {
				if (data.errors) {
					Swal.fire({
						title: 'Błąd!',
						html: data.errors.map(error => `<p>${error.msg}</p>`).join(''),
						icon: 'error',
						confirmButtonText: 'OK',
					})
				} else {
					Swal.fire({
						title: 'Sukces!',
						text: 'Zalogowano pomyślnie',
						icon: 'success',
						confirmButtonText: 'OK',
					})
					localStorage.setItem('token', data.token)
					document.getElementById('modal').style.display = 'none'
					loadUserProfilePicture()
					btn.onclick = function (event) {
						userOptions.classList.toggle('hidden')
						event.stopPropagation()
					}
					document.dispatchEvent(new Event('userLoggedIn')) // Emitowanie niestandardowego zdarzenia
				}
			})
			.catch(error => {
				console.error('Error:', error)
				Swal.fire({
					title: 'Błąd!',
					text: 'Wystąpił błąd podczas logowania.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	// Funkcja obsługująca wylogowanie
	function handleLogout() {
		localStorage.removeItem('token')
		Swal.fire({
			title: 'Sukces!',
			text: 'Wylogowano pomyślnie',
			icon: 'success',
			confirmButtonText: 'OK',
		})
		location.reload()
	}

	// Funkcja ładująca zdjęcie profilowe użytkownika
	function loadUserProfilePicture() {
		const token = localStorage.getItem('token')
		if (token) {
			fetch('http://localhost:3000/api/profile', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
				.then(response => {
					if (!response.ok) {
						if (response.status === 401 || response.status === 403) {
							localStorage.removeItem('token')
							window.location.href = 'index.html'
						}
						throw new Error('Network response was not ok')
					}
					return response.json()
				})
				.then(user => {
					const profilePicture = user.profilePicture ? `img/uploads/${user.profilePicture}` : './img/avatar-big.jpg'
					btn.src = profilePicture
				})
				.catch(error => {
					console.error('Error loading user profile:', error)
					Swal.fire({
						title: 'Błąd!',
						text: 'Błąd podczas ładowania profilu użytkownika.',
						icon: 'error',
						confirmButtonText: 'OK',
					})
				})
		}
	}

	logoutBtn.addEventListener('click', handleLogout)

	document.addEventListener('click', function (event) {
		if (!userOptions.contains(event.target) && event.target !== btn) {
			userOptions.classList.add('hidden')
		}
	})

	const urlParams = new URLSearchParams(window.location.search)
	const token = urlParams.get('token')
	if (token) {
		localStorage.setItem('token', token)
		Swal.fire({
			title: 'Sukces!',
			text: 'Zalogowano pomyślnie po weryfikacji emaila',
			icon: 'success',
			confirmButtonText: 'OK',
		})
		loadUserProfilePicture()
		btn.onclick = function (event) {
			userOptions.classList.toggle('hidden')
			event.stopPropagation()
		}
	}

	loadLoginForm()
	loadUserProfilePicture()
})
