document.addEventListener('DOMContentLoaded', function () {
	const modal = document.getElementById('modal')
	const btn = document.getElementById('login-icon')
	const modalContent = document.getElementById('modal-content')

	// Funkcja do wyświetlania modalnego okna
	btn.onclick = function () {
		modal.style.display = 'flex'
	}

	// Funkcja do zamykania modalnego okna
	function closeModal() {
		modal.style.display = 'none'
	}

	// Dodanie event listenera do przycisku zamykania
	document.getElementById('close-login').onclick = closeModal

	// Zamknij modalne okno po kliknięciu poza nim
	window.onclick = function (event) {
		if (event.target == modal) {
			closeModal()
		}
	}

	// Funkcja do ładowania formularza logowania
	function loadLoginForm() {
		modalContent.innerHTML = `
			<div class="modal-item">
				<h2 class="login-header">Zaloguj Się</h2>
				<i id="close-login" class="fa-solid fa-x close-login"></i>
			</div>
			<input class="form-input" type="email" placeholder="E-Mail">
			<input class="form-input" type="password" placeholder="Hasło">
			<button class="create-account-btn">Zaloguj się</button>
			<p class="login-text">Nie masz konta? <span id="register-link">Zarejestruj się</span></p>
		`

		// Ponowne przypisanie event listenera do przycisku zamykania
		document.getElementById('close-login').onclick = closeModal

		// Dodanie event listenera do linku rejestracji
		document.getElementById('register-link').onclick = loadRegisterForm
	}

	// Funkcja do ładowania formularza rejestracji
	function loadRegisterForm() {
		modalContent.innerHTML = `
			<div class="modal-item">
				<h2 class="login-header">Zarejestruj Się</h2>
				<i id="close-login" class="fa-solid fa-x close-login"></i>
			</div>
			<input class="form-input" type="text" placeholder="Nazwa">
			<input class="form-input" type="email" placeholder="E-Mail">
			<input class="form-input" type="password" placeholder="Hasło">
			<button class="create-account-btn">Stwórz Konto</button>
			<p class="login-text">Posiadasz już konto? <span id="login-link">Zaloguj się</span></p>
		`

		// Ponowne przypisanie event listenera do przycisku zamykania
		document.getElementById('close-login').onclick = closeModal

		// Dodanie event listenera do linku logowania
		document.getElementById('login-link').onclick = loadLoginForm
	}

	// Dodanie event listenera do linku logowania
	document.getElementById('login-link').onclick = loadLoginForm

	// Domyślnie załaduj formularz rejestracji po załadowaniu strony
	loadRegisterForm()
})
