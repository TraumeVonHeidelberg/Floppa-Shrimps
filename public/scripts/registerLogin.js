document.addEventListener('DOMContentLoaded', function () {
	const modal = document.getElementById('modal')
	const btn = document.getElementById('login-icon')
	const modalContent = document.getElementById('modal-content')
	const userOptions = document.getElementById('user-options')
	const logoutBtn = document.getElementById('logout-btn')

	
	// Event listener for the login icon button
	// When the button is clicked, perform the following actions:
	// 1. Check if a token exists in the localStorage
	//    If a token exists, toggle the visibility of the user options
	//    and prevent the click event from propagating to the parent elements
	// 2. If no token exists, show the modal dialog box
	btn.onclick = function (event) {
		// Check if a token exists in the localStorage
		if (localStorage.getItem('token')) {
			// Toggle the visibility of the user options
			userOptions.classList.toggle('hidden')

			// Prevent the click event from propagating to the parent elements
			event.stopPropagation() 
		} else {
			// Show the modal dialog box
			modal.style.display = 'flex'
		}
	}

	/**
	 * Function to close the modal dialog box
	 * 
	 * This function is responsible for hiding the modal dialog box when the user clicks on the close button or outside the modal.
	 * It sets the display property of the modal element to 'none', effectively hiding it from the user's view.
	 */
	function closeModal() {
		// Hide the modal dialog box by setting the display property to 'none'
		modal.style.display = 'none'
	}

	/**
	 * Function to assign a close modal event listener to the close button
	 * 
	 * This function checks if the close button exists in the DOM. If it does, it assigns
	 * an event listener to the button. When the button is clicked, the closeModal function
	 * is called to hide the modal dialog box.
	 */
	function assignCloseModalListener() {
		// Get the close button element from the DOM
		const closeBtn = document.getElementById('close-login')
		
		// Check if the close button exists in the DOM
		if (closeBtn) {
			// Assign an event listener to the close button
			closeBtn.onclick = closeModal
		}
	}

	/**
	 * Function to load the login form
	 * 
	 * This function sets the HTML content of the modalContent element to the login form.
	 * It then assigns an event listener to the close button and the login button.
	 * The event listener on the close button calls the closeModal function when the button is clicked.
	 * The event listener on the login button calls the handleLogin function when the button is clicked.
	 * Additionally, it assigns an event listener to the register link that calls the loadRegisterForm function when the link is clicked.
	 */
	function loadLoginForm() {
		// Set the HTML content of the modalContent element to the login form
		modalContent.innerHTML = `
            <div class="modal-item">
                <h2 class="login-header">Zaloguj Się</h2>
                <i id="close-login" class="fa-solid fa-x close-login"></i>
            </div>
            <input class="form-input" type="email" id="login-email" placeholder="E-Mail">
            <input class="form-input" type="password" id="login-password" placeholder="Hasło">
            <button class="create-account-btn" id="login-btn">Zaloguj się</button>
            <p class="login-text">Nie masz konta? <span id="register-link">Zarejestruj się</span></p>
        `;

		// Call the assignCloseModalListener function to assign an event listener to the close button
		assignCloseModalListener();

		// Assign an event listener to the register link that calls the loadRegisterForm function when the link is clicked
		document.getElementById('register-link').onclick = loadRegisterForm;

		// Assign an event listener to the login button that calls the handleLogin function when the button is clicked
		document.getElementById('login-btn').addEventListener('click', handleLogin);
	}

	/**
	 * Function to load the registration form
	 * 
	 * This function sets the HTML content of the modalContent element to the registration form.
	 * It then assigns an event listener to the close button and the registration button.
	 * The event listener on the close button calls the closeModal function when the button is clicked.
	 * The event listener on the registration button calls the handleRegistration function when the button is clicked.
	 * Additionally, it assigns an event listener to the login link that calls the loadLoginForm function when the link is clicked.
	 */
	function loadRegisterForm() {
		// Set the HTML content of the modalContent element to the registration form
		modalContent.innerHTML = `
            <!-- The header of the modal -->
            <div class="modal-item">
                <h2 class="login-header">Zarejestruj Się</h2>
                <!-- Close button for the modal -->
                <i id="close-login" class="fa-solid fa-x close-login"></i>
            </div>
            <!-- Input field for the first name -->
            <input class="form-input" type="text" id="firstName" placeholder="Imię">
            <!-- Input field for the last name -->
            <input class="form-input" type="text" id="lastName" placeholder="Nazwisko">
            <!-- Input field for the email -->
            <input class="form-input" type="email" id="email" placeholder="E-Mail">
            <!-- Input field for the password -->
            <input class="form-input" type="password" id="password" placeholder="Hasło">
            <!-- Registration button -->
            <button class="create-account-btn" id="register-btn">Stwórz Konto</button>
            <!-- Text indicating that the user already has an account -->
            <p class="login-text">Posiadasz już konto? <span id="login-link">Zaloguj się</span></p>
        `

		// Call the assignCloseModalListener function to assign an event listener to the close button
		assignCloseModalListener()

		// Assign an event listener to the login link that calls the loadLoginForm function when the link is clicked
		document.getElementById('login-link').onclick = loadLoginForm

		// Assign an event listener to the registration button that calls the handleRegistration function when the button is clicked
		document.getElementById('register-btn').addEventListener('click', handleRegistration)
	}

	// Function to handle user registration
	function handleRegistration(event) {
		// Prevent the default form submission behavior
		event.preventDefault()
		
		// Log that the register button has been clicked
		console.log('Register button clicked')

		// Retrieve the values of the form fields
		const firstName = document.getElementById('firstName').value
		const lastName = document.getElementById('lastName').value
		const email = document.getElementById('email').value
		const password = document.getElementById('password').value

		// Log the values of the form fields
		console.log('First Name:', firstName)
		console.log('Last Name:', lastName)
		console.log('Email:', email)
		console.log('Password:', password)

		// Check if any of the form fields are empty
		if (!firstName || !lastName || !email || !password) {
			// Display an alert message if any of the form fields are empty
			alert('Proszę wypełnić wszystkie pola')
			return
		}

		// Send an HTTP POST request to the server to register the user
		fetch('http://localhost:3000/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json', // Specify the request body format as JSON
			},
			body: JSON.stringify({ firstName, lastName, email, password }), // Convert the form data to JSON and send it in the request body
		})
			// Handle the response from the server
			.then(response => response.json())
			// Handle the parsed response data
			.then(data => {
				// Check if the response contains errors
				if (data.errors) {
					// Display the error messages in an alert dialog
					alert(data.errors.map(error => error.msg).join('\n'))
				} else {
					// Display a success message in an alert dialog
					alert(data.msg)
					// If the registration was successful, hide the modal
					if (data.msg === 'Użytkownik zarejestrowany. Sprawdź swoją skrzynkę e-mail.') {
						document.getElementById('modal').style.display = 'none'
					}
				}
			})
			// Handle any errors that occur during the process
			.catch(error => {
				// Log the error to the console
				console.error('Error:', error)
				// Display an error message in an alert dialog
				alert('Wystąpił błąd podczas rejestracji.')
			})
	}

	// Function to handle the login process
	function handleLogin(event) {
		// Prevent the default form submission behavior
		event.preventDefault()

		// Log a message to the console indicating that the login button was clicked
		console.log('Login button clicked')

		// Get the email and password values from the form inputs
		const email = document.getElementById('login-email').value
		const password = document.getElementById('login-password').value

		// Log the email and password values to the console
		console.log('Email:', email)
		console.log('Password:', password)

		// Check if the email or password fields are empty
		if (!email || !password) {
			// Display an alert message indicating that all fields must be filled
			alert('Proszę wypełnić wszystkie pola')
			return
		}

		// Send an HTTP POST request to the server to authenticate the user
		fetch('http://localhost:3000/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json', // Specify the request body format as JSON
			},
			body: JSON.stringify({ email, password }), // Convert the form data to JSON and send it in the request body
		})
			.then(response => response.json()) // Parse the response as JSON
			.then(data => {
				// Check if the response contains any errors
				if (data.errors) {
					// Display the error messages in an alert dialog, separated by newlines
					alert(data.errors.map(error => error.msg).join('\n'))
				} else {
					// Display a success message in an alert dialog
					alert('Zalogowano pomyślnie')

					// Store the token in the browser's local storage
					localStorage.setItem('token', data.token)

					// Hide the modal
					document.getElementById('modal').style.display = 'none'

					// Load the user profile picture
					loadUserProfilePicture()

					// Add a click event listener to the user options button
					const btn = document.getElementById('user-options-btn')
					const userOptions = document.getElementById('user-options')
					btn.onclick = function (event) {
						userOptions.classList.toggle('hidden')
						event.stopPropagation()
					}

					// Dispatch a custom event to indicate that the user has logged in
					document.dispatchEvent(new Event('userLoggedIn'))
				}
			})
			.catch(error => {
				// Log the error to the console
				console.error('Error:', error)
				// Display an error message in an alert dialog
				alert('Wystąpił błąd podczas logowania.')
			})
	}

	/**
	 * This function handles the logout process.
	 * It removes the token from the browser's local storage,
	 * displays a success message,
	 * and reloads the current page.
	 */
	function handleLogout() {
		// Remove the token from the local storage
		localStorage.removeItem('token')

		// Display a success message
		alert('Wylogowano pomyślnie')

		// Reload the current page
		// This is done to ensure that the user is logged out and the token is no longer valid
		// The page will be refreshed and the updated state will be reflected
		location.reload()
	}

	/**
	 * This function loads the user's profile picture.
	 * It first retrieves the token from the browser's local storage.
	 * If the token exists, it sends a GET request to the server to retrieve the user's profile information.
	 * The request includes the token in the authorization header for authentication.
	 * If the response is not successful (status code is not in the 200-299 range), it checks the status code.
	 * If the status code is 401 or 403, it removes the token from the local storage and redirects to the login page.
	 * If the response is successful, it parses the response body as JSON and retrieves the profile picture URL.
	 * If the user has a profile picture, it sets the source of the user options button to the URL of the profile picture.
	 * If the user does not have a profile picture, it sets the source to the default profile picture.
	 * If any errors occur during the process, it logs the error to the console and displays an error message in an alert dialog.
	 */
	function loadUserProfilePicture() {
		// Retrieve the token from the local storage
		const token = localStorage.getItem('token')

		// Check if the token exists
		if (token) {
			// Send a GET request to the server to retrieve the user's profile information
			fetch('http://localhost:3000/api/profile', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`, // Add the token to the authorization header
				},
			})
				.then(response => {
					// Check if the response is not successful
					if (!response.ok) {
						// Check the status code of the response
						if (response.status === 401 || response.status === 403) {
							// Remove the token from the local storage and redirect to the login page
							localStorage.removeItem('token')
							window.location.href = 'index.html'
						}
						throw new Error('Network response was not ok')
					}
					return response.json() // Parse the response body as JSON
				})
				.then(user => {
					// Retrieve the profile picture URL from the user object
					const profilePicture = user.profilePicture ? `img/uploads/${user.profilePicture}` : './img/avatar-big.jpg'

					// Set the source of the user options button to the profile picture URL
					btn.src = profilePicture
				})
				.catch(error => {
					// Log the error to the console
					console.error('Error loading user profile:', error)

					// Display an error message in an alert dialog
					alert('Błąd podczas ładowania profilu użytkownika.')
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
		alert('Zalogowano pomyślnie po weryfikacji emaila')
		loadUserProfilePicture()
		btn.onclick = function (event) {
			userOptions.classList.toggle('hidden')
			event.stopPropagation()
		}
	}

	loadLoginForm()
	loadUserProfilePicture()
})
