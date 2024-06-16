document.addEventListener('DOMContentLoaded', function () {
	//URL_API sluzy do komunikacji z serwerem; czyli w praktyce adres pod ktory wysylane sa rzadania HTTP jak get, post itd.
	const API_URL = window && window.process && window.process.type === 'renderer' ? 'http://localhost:3000/api' : '/api'

	const addElementsBtn = document.getElementById('add-elements-btn')
	const listElementsBtn = document.getElementById('list-elements-btn')
	const reservationsBtn = document.getElementById('reservations-btn')
	const userProfileBtn = document.getElementById('user-profile-btn')
	const mainContent = document.getElementById('main-content')

	/*
	 * This function clears the 'button-active' class from all buttons in the sidebar.
	 * This is done to prevent buttons from being highlighted in yellow when they are active.
	 *
	 * The function works by selecting all buttons in the sidebar and removing the 'button-active' class from them.
	 * The 'button-active' class is a CSS class that changes the appearance of the button when it is active.
	 *
	 * The function uses the 'document.querySelectorAll' method to select all buttons in the sidebar.
	 * It then uses the 'forEach' method to iterate over each button and remove the 'button-active' class using the 'classList.remove' method.
	 *
	 * This function is called when the DOM content has loaded and is called by the 'DOMContentLoaded' event listener.
	 */
	function clearActiveClass() {
		// Select all buttons in the sidebar
		document.querySelectorAll('aside button').forEach(button => {
			// Remove the 'button-active' class from the button
			button.classList.remove('button-active')
		})
	}

	/*
	 * This function formats the price input of a menu item so that it has two decimal places.
	 * It does this by adding a 'blur' event listener to the input field.
	 * When the input field loses focus (i.e. the user clicks outside of it), the function is called.
	 *
	 * The function works by first parsing the value of the input field as a float using the 'parseFloat' function.
	 * If the parsed value is not a number or is less than 0, it is set to 0.
	 * The parsed value is then formatted to have two decimal places using the 'toFixed' function.
	 * The formatted value is then assigned back to the input field.
	 *
	 * The function is called by passing the input field as an argument when the DOM content has loaded.
	 *
	 * @param {HTMLInputElement} input - The input field containing the price of the menu item.
	 */
	function formatPriceInput(input) {
		// Add a 'blur' event listener to the input field
		input.addEventListener('blur', function () {
			// Parse the value of the input field as a float
			let value = parseFloat(input.value)
			// If the parsed value is not a number or is less than 0, set it to 0
			if (isNaN(value) || value < 0) {
				value = 0
			}
			// Format the value to have two decimal places and assign it back to the input field
			input.value = value.toFixed(2)
		})
	}

	// Helper function to get the correct image path
	function getImagePath(image) {
		let imagePath
		if (window && window.process && window.process.type === 'renderer') {
			imagePath = `http://localhost:3000/${image}`
		} else {
			imagePath = `${image}`
		}
		console.log(`Generated image path: ${imagePath}`) // Log the generated image path
		return imagePath
	}

	/**
	 * This function handles the submission of the menu item form.
	 * It prevents the default form submission behavior, which is to refresh the page.
	 *
	 * It then retrieves the values of the form fields and sends an HTTP POST request to the server to add the menu item.
	 * The request is sent to the '/admin/menu' endpoint with the form data in JSON format.
	 * The request includes the 'Content-Type' header set to 'application/json' and an 'Authorization' header with a JSON Web Token (JWT) for authentication.
	 *
	 * After sending the request, the function checks the response from the server.
	 * If the response is not successful (status code is not in the 200-299 range), it throws an error.
	 * If the response is successful, it parses the response body as JSON and displays a success message to the user.
	 * It also resets the form fields to their initial state.
	 *
	 * If any errors occur during the process, it catches the error and logs it to the console,
	 * and displays an error message to the user.
	 *
	 * @param {Event} event - The event object representing the form submission event.
	 */
	function submitMenuForm(event) {
		// Prevent the default form submission behavior
		event.preventDefault()

		// Retrieve the values of the form fields
		const name = document.getElementById('menu-name').value
		const description = document.getElementById('menu-description').value
		const price = document.getElementById('menu-price').value

		// Send an HTTP POST request to the server to add the menu item
		fetch(`${API_URL}/admin/menu`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json', // Specify the request body format as JSON
				Authorization: `Bearer ${localStorage.getItem('token')}`, // Include the JSON Web Token for authentication
			},
			body: JSON.stringify({ name, description, price }), // Convert the form data to JSON and send it in the request body
		})
			// Check the response from the server
			.then(response => {
				if (!response.ok) {
					// If the response is not successful, throw an error
					throw new Error('Network response was not ok')
				}
				// If the response is successful, parse it as JSON
				return response.json()
			})
			// Handle the parsed response data
			.then(data => {
				// Display a success message to the user
				Swal.fire({
					title: 'Sukces!',
					text: 'Pozycja dodana do menu!',
					icon: 'success',
					confirmButtonText: 'OK',
				})
				// Reset the form fields to their initial state
				document.getElementById('menu-form').reset()
			})
			// Handle any errors that occur during the process
			.catch(error => {
				console.error('Error:', error) // Log the error to the console
				// Display an error message to the user
				Swal.fire({
					title: 'Błąd!',
					text: 'Wystąpił błąd podczas dodawania pozycji do menu.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	// Function to handle the submission of the testimonial form (similar to the one used for the menu form)
	function submitTestimonialForm(event) {
		// Prevent the default form submission behavior
		event.preventDefault()

		// Retrieve the values of the form fields
		const text = document.getElementById('testimonial-text').value // Get the value of the text input field
		const author = document.getElementById('testimonial-author').value // Get the value of the author input field
		const company = document.getElementById('testimonial-company').value // Get the value of the company input field

		// Send an HTTP POST request to the server to add the testimonial
		fetch(`${API_URL}/admin/testimonial`, {
			method: 'POST', // Set the request method to POST
			headers: {
				'Content-Type': 'application/json', // Specify the request body format as JSON
				Authorization: `Bearer ${localStorage.getItem('token')}`, // Include the JSON Web Token for authentication
			},
			body: JSON.stringify({ text, author, company }), // Convert the form data to JSON and send it in the request body
		})
			.then(response => {
				// Check if the response is successful
				if (!response.ok) {
					// If the response is not successful, throw an error
					throw new Error('Network response was not ok')
				}
				// If the response is successful, parse it as JSON
				return response.json()
			})
			.then(data => {
				// Display a success message to the user
				Swal.fire({
					title: 'Success!',
					text: 'Opinia Dodana!',
					icon: 'success',
					confirmButtonText: 'OK',
				})
				// Reset the form fields to their initial state
				document.getElementById('testimonial-form').reset()
			})
			.catch(error => {
				// Log the error to the console
				console.error('Error:', error)
				// Display an error message to the user
				Swal.fire({
					title: 'Error!',
					text: 'An error occurred while adding the testimonial.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	// This function is responsible for adding additional header-text pairs to the form.
	// It creates a new HTML container for each header-text pair and adds it to the
	// 'headers-texts-container' before the 'submit' button.
	function addNewsHeaderText() {
		// Get the container that holds all the header-text pairs.
		const headersTextsContainer = document.getElementById('headers-texts-container')

		// Create a new HTML container for the header-text pair.
		const headerTextContainer = document.createElement('div')

		// Add a CSS class to the container so that it can be styled.
		headerTextContainer.classList.add('header-text-container')

		// Create the HTML for the header-text pair.
		// The 'configuration-item' class is used to style the input fields.
		headerTextContainer.innerHTML = `
            <div class="configuration-item">
                <label for="news-header">Nagłówek</label>
                <input type="text" class="news-header" name="header" required>
            </div>
            <div class="configuration-item">
                <label for="news-text">Tekst</label>
                <textarea class="news-text" name="text" required></textarea>
            </div>
        `

		// Add the new container before the 'submit' button.
		headersTextsContainer.insertBefore(headerTextContainer, headersTextsContainer.lastElementChild)
	}

	// This function handles the form submission for adding news.
	// It prevents the default form submission behavior, collects all the header-text pairs,
	// and sends them to the server along with the form data.
	function submitNewsForm(event) {
		// Prevent the default form submission behavior.
		event.preventDefault()

		// Create a new FormData object to collect form data.
		const formData = new FormData(event.target)

		// Collect all the header inputs and store their values in an array.
		const headers = Array.from(document.querySelectorAll('.news-header')).map(input => input.value)

		// Collect all the textarea inputs and store their values in an array.
		const texts = Array.from(document.querySelectorAll('.news-text')).map(textarea => textarea.value)

		// Add the headers and texts arrays to the FormData object in JSON format.
		formData.append('headers', JSON.stringify(headers))
		formData.append('texts', JSON.stringify(texts))

		// Send a POST request to the server with the form data.
		fetch(`${API_URL}/admin/news`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: formData,
		})
			.then(response => {
				// If the response is not ok, throw an error.
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}

				// Parse the response as JSON.
				return response.json()
			})
			.then(data => {
				// Display a success message to the user.
				Swal.fire({
					title: 'Success!',
					text: 'News Dodany!',
					icon: 'success',
					confirmButtonText: 'OK',
				})

				// Reset the form.
				document.getElementById('news-form').reset()

				// Remove all the header-text containers except for the first one.
				const headersTextsContainer = document.getElementById('headers-texts-container')
				while (headersTextsContainer.firstChild && headersTextsContainer.childElementCount > 1) {
					headersTextsContainer.removeChild(headersTextsContainer.firstChild)
				}

				// Add a new header-text container to the form.
				addNewsHeaderText()

				// Reset the file name display.
				document.getElementById('file-name').textContent = 'No file selected'
			})
			.catch(error => {
				// Log the error to the console.
				console.error('Error:', error)

				// Display an error message to the user.
				Swal.fire({
					title: 'Error!',
					text: 'Wystąpił błąd podczas dodawania newsa.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	// This function is used to delete an item from the server.
	//
	// Parameters:
	// - type: The type of the item to be deleted. It is dynamically determined based on the element that triggered the function.
	// - id: The ID of the item to be deleted. It is dynamically determined based on the element that triggered the function.
	function deleteItem(type, id) {
		// Construct the URL for the API request using the type and ID parameters.
		const url = `${API_URL}/admin/${type}/${id}`

		// Find the element that should be deleted on the webpage based on the ID parameter.
		const element = document.querySelector(`#element-${id}`)

		// Send a DELETE request to the server with the appropriate URL and headers.
		fetch(url, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`, // Include the user's token in the request headers.
			},
		})
			.then(response => {
				if (!response.ok) {
					// Check if the response from the server is not OK.
					throw new Error('Network response was not ok') // Throw an error if the response is not OK.
				}
				return response.json() // Parse the response as JSON.
			})
			.then(data => {
				// Display a success message to the user.
				Swal.fire({
					title: 'Sukces!',
					text: `Pozycja ${type.charAt(0).toUpperCase() + type.slice(1)} usunięta!`,
					icon: 'success',
					confirmButtonText: 'OK',
				})
				element.remove() // Remove the element from the webpage.
			})
			.catch(error => {
				console.error('Error:', error) // Log the error to the console.
				// Display an error message to the user.
				Swal.fire({
					title: 'Błąd!',
					text: `Wystąpił błąd podczas usuwania ${type}.`,
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	// added event listener to all delete buttons
	document.addEventListener('DOMContentLoaded', function () {
		document.querySelectorAll('.delete-btn').forEach(button => {
			button.addEventListener('click', function () {
				//pobierane type i id
				const type = this.dataset.type
				const id = this.dataset.id
				deleteItem(type, id)
			})
		})
	})

	/**
	 * This function is responsible for editing an item in the system.
	 * It takes in the type of item, the ID of the item, the field to edit,
	 * the new value of the field, and an optional index for editing header or text.
	 * It then sends a PUT request to the appropriate API endpoint with the new data.
	 * If the request is successful, it displays a success message to the user.
	 * If the request fails, it logs the error to the console and displays an error message to the user.
	 *
	 * @param {string} type - The type of item to edit (menu, testimonial, or news).
	 * @param {number} id - The ID of the item to edit.
	 * @param {string} field - The field to edit on the item.
	 * @param {string|number} value - The new value for the field.
	 * @param {number|null} index - The index of the header or text to edit (optional).
	 */
	function editItem(type, id, field, value, index = null) {
		// Define the URL for the API endpoint based on the type of item.
		let url
		// Define an empty object to hold the data to send in the request.
		let data = {}

		// Check the type of item and set the appropriate URL and data.
		if (type === 'menu') {
			url = `${API_URL}/admin/menu/${id}`

			// Trim the original text content to remove any leading or trailing whitespace.
			const name = field === 'name' ? value : document.getElementById(`name-${id}`).textContent.trim()
			const description =
				field === 'description' ? value : document.getElementById(`description-${id}`).textContent.trim()
			// Remove 'zł' from the price text content and parse it as a float.
			const price =
				field === 'price'
					? value
					: parseFloat(document.getElementById(`price-${id}`).textContent.replace('zł', '').trim())
			// Set the data object with the new values.
			data = { name, description, price }
		} else if (type === 'testimonial') {
			url = `${API_URL}/admin/testimonial/${id}`
			const text = field === 'text' ? value : document.getElementById(`text-${id}`).textContent.trim()
			const author = field === 'author' ? value : document.getElementById(`author-${id}`).textContent.trim()
			const company = field === 'company' ? value : document.getElementById(`company-${id}`).textContent.trim()
			data = { text, author, company }
		} else if (type === 'news') {
			url = `${API_URL}/admin/news/${id}`
			// If the field is 'header' or 'text', set the index on the data object.
			if (field === 'header' || field === 'text') {
				data[field] = value
				data['index'] = index
			} else {
				// Otherwise, just set the new value on the data object.
				data[field] = value
			}
		}

		// Send a PUT request to the API endpoint with the new data.
		fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify(data),
		})
			.then(response => {
				// If the response is not OK, log the error text and throw an error.
				if (!response.ok) {
					return response.text().then(text => {
						console.error('Error response text:', text)
						throw new Error('Network response was not ok')
					})
				}
				// If the response is OK, parse it as JSON.
				return response.json()
			})
			.then(data => {
				// Display a success message to the user.
				Swal.fire({
					title: 'Sukces!',
					text: `Pozycja ${type.charAt(0).toUpperCase() + type.slice(1)} zaktualizowana!`,
					icon: 'success',
					confirmButtonText: 'OK',
				})
				// If the field is not 'header' or 'text', update the text content of the element with the new value.
				if (field !== 'header' && field !== 'text') {
					document.getElementById(`${field}-${id}`).textContent = data[field]
				}
			})
			.catch(error => {
				// Log the error to the console and display an error message to the user.
				console.error('Error:', error)
				Swal.fire({
					title: 'Błąd!',
					text: `Wystąpił błąd podczas aktualizacji ${type}.`,
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	// Function that makes an element editable
	function makeEditable(element, type, id, field, index = null) {
		// Add event listener for 'click' event on the element
		element.addEventListener('click', function () {
			// Store the original value of the text content
			const originalValue = element.textContent.trim()

			// Set the element as editable
			element.contentEditable = true

			// Set focus on the element
			element.focus()

			// Function to handle the 'blur' event
			function handleBlur() {
				// Get the new value of the text content
				const newValue = element.textContent.trim()

				// If the new value is different from the original value
				if (newValue !== originalValue) {
					// Call the function to update the data on the server
					editItem(type, id, field, newValue, index)
				}

				// Reset the original state of the element
				element.contentEditable = false

				// Remove the 'blur' event listener
				element.removeEventListener('blur', handleBlur)

				// Remove the 'keydown' event listener
				element.removeEventListener('keydown', handleKeydown)
			}

			// Function to handle the 'keydown' event
			function handleKeydown(event) {
				// If the 'Enter' key is pressed
				if (event.key === 'Enter') {
					// Prevent the default behavior (e.g., new line)
					event.preventDefault()

					// End the editing and lose focus
					element.blur()
				} else if (event.key === 'Escape') {
					// If the 'Escape' key is pressed
					// Restore the original value of the text content
					element.textContent = originalValue

					// End the editing and lose focus
					element.blur()
				}
			}

			// Add event listener for 'blur' event
			element.addEventListener('blur', handleBlur)

			// Add event listener for 'keydown' event
			element.addEventListener('keydown', handleKeydown)
		})
	}

	// This function allows the user to edit an image by clicking on it.
	// When the image is clicked, it creates a file input element and hides it.
	// The user can then select an image file from their device and upload it.
	// The selected image file is then sent to the server using a POST request.
	// If the upload is successful, the image source is updated to display the new image.
	function makeImageEditable(imageElement, type, id) {
		// Add a click event listener to the image element
		imageElement.addEventListener('click', function () {
			// Create a file input element
			const fileInput = document.createElement('input')
			fileInput.type = 'file' // Set the input type to file
			fileInput.accept = 'image/*' // Only allow image files to be selected
			fileInput.style.display = 'none' // Hide the file input element

			// Add a change event listener to the file input element
			fileInput.addEventListener('change', function () {
				// Check if a file was selected
				if (fileInput.files.length > 0) {
					// Create a new FormData object to send the file to the server
					const formData = new FormData()

					// Add the selected image file to the FormData object
					formData.append('image', fileInput.files[0])

					// Send the FormData object to the server using a POST request
					fetch(`${API_URL}/admin/news/${id}/image`, {
						method: 'POST', // Set the request method to POST
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`, // Add the authorization header with the user's token
						},
						body: formData, // Set the request body to the FormData object
					})
						.then(response => {
							// Check if the response was successful
							if (!response.ok) {
								throw new Error('Network response was not ok') // Throw an error if the response was not ok
							}
							return response.json() // Parse the response as JSON
						})
						.then(data => {
							// Display a success message to the user
							Swal.fire({
								title: 'Sukces!',
								text: 'Obraz zaktualizowany!',
								icon: 'success',
								confirmButtonText: 'OK',
							})
							// Update the image source to display the new image
							let imagePath
							if (window && window.process && window.process.type === 'renderer') {
								imagePath = `http://localhost:3000/img/uploads/${data.image}`
							} else {
								imagePath = `/img/uploads/${data.image}`
							}
							console.log(`Updated image path: ${imagePath}`) // Log the updated image path
							imageElement.src = imagePath
						})
						.catch(error => {
							console.error('Error:', error) // Log any errors to the console
							// Display an error message to the user
							Swal.fire({
								title: 'Błąd!',
								text: 'Wystąpił błąd podczas aktualizacji obrazu.',
								icon: 'error',
								confirmButtonText: 'OK',
							})
						})
				}
			})

			// Open the file input element to allow the user to select an image file
			fileInput.click()
		})
	}

	// This function is responsible for loading the form to add elements
	// to the admin panel. It dynamically creates the form based on the
	// selected element type.
	function loadAddElements() {
		// Clear the active class from all elements in the admin panel
		clearActiveClass()
		// Add the 'button-active' class to the 'addElementsBtn' element
		addElementsBtn.classList.add('button-active')
		// Set the innerHTML of the 'mainContent' element to the form structure
		mainContent.innerHTML = `
            <div class="dynamic-content">
                <div class="select-element">
                    <label for="element-type">Wybierz typ elementu:</label>
                    <select id="element-type" class="element-type">
                        <option value="menu">Menu</option>
                        <option value="testimonial">Testimonial</option>
                        <option value="news">News</option>
                    </select>
                </div>
                <div id="form-container"></div>
            </div>
        `

		// Get the element type select element from the DOM
		const elementTypeSelect = document.getElementById('element-type')
		// Get the form container element from the DOM
		const formContainer = document.getElementById('form-container')

		// Add an event listener to the element type select element
		elementTypeSelect.addEventListener('change', function () {
			// Get the selected element type
			const selectedType = elementTypeSelect.value
			// Based on the selected type, create the appropriate form
			if (selectedType === 'menu') {
				// Create the menu form
				formContainer.innerHTML = `
                    <form id="menu-form">
                        <div class="configuration-item">
                            <label for="menu-name">Nazwa</label>
                            <input type="text" id="menu-name" name="name" required spellcheck="false">
                        </div>
                        <div class="configuration-item">
                            <label for="menu-description">Opis</label>
                            <textarea id="menu-description" name="description" required spellcheck="false"></textarea>
                        </div>
                        <div class="configuration-item">
                            <label for="menu-price">Cena</label>
                            <input type="number" id="menu-price" name="price" min="0" step="0.01" required>
                        </div>
                        <button type="submit">Dodaj</button>
                    </form>
                `
				// Format the price input to have two decimal places
				const priceInput = document.getElementById('menu-price')
				formatPriceInput(priceInput)
				// Add an event listener to the menu form to submit it
				document.getElementById('menu-form').addEventListener('submit', submitMenuForm)
			} else if (selectedType === 'testimonial') {
				// Create the testimonial form
				formContainer.innerHTML = `
                    <form id="testimonial-form">
                        <div class="configuration-item">
                            <label for="testimonial-text">Tekst</label>
                            <textarea id="testimonial-text" name="text" required spellcheck="false"></textarea>
                        </div>
                        <div class="configuration-item">
                            <label for="testimonial-author">Autor</label>
                            <input type="text" id="testimonial-author" name="author" required spellcheck="false">
                        </div>
                        <div class="configuration-item">
                            <label for="testimonial-company">Firma</label>
                            <input type="text" id="testimonial-company" name="company" spellcheck="false">
                        </div>
                        <button type="submit">Dodaj</button>
                    </form>
                `
				// Add an event listener to the testimonial form to submit it
				document.getElementById('testimonial-form').addEventListener('submit', submitTestimonialForm)
			} else if (selectedType === 'news') {
				// Create the news form
				formContainer.innerHTML = `
                    <form id="news-form" enctype="multipart/form-data">
                        <div class="configuration-item">
                            <label for="news-category">Kategoria</label>
                            <input type="text" id="news-category" name="category" required spellcheck="false">
                        </div>
                        <div class="configuration-item">
                            <label for="news-title">Tytuł</label>
                            <input type="text" id="news-title" name="title" required spellcheck="false">
                        </div>
                        <div class="configuration-item">
                            <label for="news-intro-text">Wstępny tekst</label>
                            <textarea id="news-intro-text" name="introText" required spellcheck="false"></textarea>
                        </div>
                        <div class="configuration-item">
                            <label for="news-image">Zdjęcie</label>
                            <input type="file" style="display:none" id="news-image" name="image" accept="image/*">
                            <button type="button" class="file-btn" id="custom-file-btn">Wybierz zdjęcie</button>
                            <span id="file-name">Brak wybranego pliku</span>
                        </div>
                        <div id="headers-texts-container">
                            <div class="header-text-container">
                                <div class="configuration-item">
                                    <label for="news-header">Nagłówek</label>
                                    <input type="text" class="news-header" name="header" required spellcheck="false">
                                </div>
                                <div class="configuration-item">
                                    <label for="news-text">Tekst</label>
                                    <textarea class="news-text" name="text" required spellcheck="false"></textarea>
                                </div>
                            </div>
                            <div class="configuration-item">
                                <button type="button" id="add-header-text-btn">Dodaj nagłówek + tekst</button>
                            </div>
                        </div>
                        <button type="submit">Dodaj</button>
                    </form>
                `
				// Add an event listener to the 'add-header-text-btn' button
				document.getElementById('add-header-text-btn').addEventListener('click', addNewsHeaderText)
				// Add an event listener to the news form to submit it
				document.getElementById('news-form').addEventListener('submit', submitNewsForm)

				// Get the file input, file button, and file name elements from the DOM
				const fileInput = document.getElementById('news-image')
				const fileBtn = document.getElementById('custom-file-btn')
				const fileName = document.getElementById('file-name')

				// Add an event listener to the file button to open the file input when clicked
				fileBtn.addEventListener('click', function () {
					fileInput.click()
				})

				// Add an event listener to the file input to update the file name when a file is selected
				fileInput.addEventListener('change', function () {
					if (fileInput.files.length > 0) {
						fileName.textContent = fileInput.files[0].name
					} else {
						fileName.textContent = 'Brak wybranego pliku'
					}
				})
			}
		})

		// Dispatch a 'change' event to the element type select element
		// to trigger the initial form creation
		elementTypeSelect.dispatchEvent(new Event('change'))
	}

	function loadListElements() {
		clearActiveClass()
		listElementsBtn.classList.add('button-active')
		mainContent.innerHTML = `
        <div class="dynamic-content">
            <div class="select-element">
                <label for="element-list-type">Wybierz typ elementu:</label>
                <select id="element-list-type" class="element-type">
                    <option value="menu">Menu</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="news">News</option>
                    <option value="reservations">Rezerwacje</option>
                </select>
            </div>
            <div id="list-container" class="list-container"></div>
        </div>
    `

		const elementListTypeSelect = document.getElementById('element-list-type')
		const listContainer = document.getElementById('list-container')

		elementListTypeSelect.addEventListener('change', function () {
			const selectedType = elementListTypeSelect.value

			listContainer.classList.remove('news-list-container')

			if (selectedType === 'menu') {
				fetch(`${API_URL}/menu`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})
					.then(response => response.json())
					.then(data => {
						listContainer.innerHTML = data
							.map(
								item => `
                            <div class="element" id="element-${item.id}">
                                <div class="text-container">
                                    <p class="element-text" id="name-${item.id}">${item.name}</p>
                                    <p class="element-text" id="description-${item.id}">${item.description}</p>
                                    <p class="element-text" id="price-${item.id}">${parseFloat(item.price).toFixed(
									2
								)} zł</p>
                                </div>
                                <i class="fa-regular fa-circle-xmark" onclick="deleteItem('menu', ${item.id})"></i>
                            </div>
                        `
							)
							.join('')
						data.forEach(item => {
							makeEditable(document.getElementById(`name-${item.id}`), 'menu', item.id, 'name')
							makeEditable(document.getElementById(`description-${item.id}`), 'menu', item.id, 'description')
							makeEditable(document.getElementById(`price-${item.id}`), 'menu', item.id, 'price')
						})
					})
					.catch(error => {
						console.error('Error:', error)
						Swal.fire({
							title: 'Błąd!',
							text: 'Wystąpił błąd podczas ładowania pozycji menu.',
							icon: 'error',
							confirmButtonText: 'OK',
						})
					})
			} else if (selectedType === 'testimonial') {
				fetch(`${API_URL}/testimonials`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})
					.then(response => response.json())
					.then(data => {
						listContainer.innerHTML = data
							.map(
								item => `
                            <div class="element" id="element-${item.id}">
                                <div class="text-container">
                                    <p class="element-text main-testimonial-text" id="text-${item.id}">${item.text}</p>
                                    <p class="element-text" id="author-${item.id}">${item.author}</p>
                                    <p class="element-text" id="company-${item.id}">${item.company}</p>
                                </div>
                                <i class="fa-regular fa-circle-xmark" onclick="deleteItem('testimonial', ${item.id})"></i>
                            </div>
                        `
							)
							.join('')
						data.forEach(item => {
							makeEditable(document.getElementById(`text-${item.id}`), 'testimonial', item.id, 'text')
							makeEditable(document.getElementById(`author-${item.id}`), 'testimonial', item.id, 'author')
							makeEditable(document.getElementById(`company-${item.id}`), 'testimonial', item.id, 'company')
						})
					})
					.catch(error => {
						console.error('Error:', error)
						Swal.fire({
							title: 'Błąd!',
							text: 'Wystąpił błąd podczas ładowania opinii.',
							icon: 'error',
							confirmButtonText: 'OK',
						})
					})
			} else if (selectedType === 'news') {
				listContainer.classList.add('news-list-container')

				fetch(`${API_URL}/news`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})
					.then(response => response.json())
					.then(data => {
						listContainer.innerHTML = data
							.map(
								item => `
								<div class="element news-element" id="element-${item.id}">
									<div class="news-item">
										<div class="news-meta">
											<p class="element-text" id="category-${item.id}">${item.category}</p>
											<p class="element-text" id="title-${item.id}">${item.title}</p>
											${item.image ? `<img src="${getImagePath(item.image)}" alt="News Image" class="news-image" id="image-${item.id}">` : ''}
											<p class="element-text" id="introText-${item.id}">${item.introText}</p>
										</div>
										<div id="headers-texts-${item.id}">
											${item.headers
												.map(
													(header, index) => `
												<div class="header-text-pair">
													<p class="element-text news-header" id="header-${item.id}-${index}">${header.header}</p>
													<p class="element-text news-text" id="text-${item.id}-${index}">${header.text}</p>
												</div>
											`
												)
												.join('')}
										</div>
									</div>
									<i class="fa-regular fa-circle-xmark" onclick="deleteItem('news', ${item.id})"></i>
								</div>
							`
							)
							.join('')
						data.forEach(item => {
							makeEditable(document.getElementById(`category-${item.id}`), 'news', item.id, 'category')
							makeEditable(document.getElementById(`title-${item.id}`), 'news', item.id, 'title')
							makeEditable(document.getElementById(`introText-${item.id}`), 'news', item.id, 'introText')
							item.headers.forEach((header, index) => {
								makeEditable(document.getElementById(`header-${item.id}-${index}`), 'news', item.id, 'header', index)
								makeEditable(document.getElementById(`text-${item.id}-${index}`), 'news', item.id, 'text', index)
							})

							const imageElement = document.getElementById(`image-${item.id}`)
							if (imageElement) {
								makeImageEditable(imageElement, 'news', item.id)
							}
						})
					})
					.catch(error => {
						console.error('Error:', error)
						Swal.fire({
							title: 'Błąd!',
							text: 'Wystąpił błąd podczas ładowania news.',
							icon: 'error',
							confirmButtonText: 'OK',
						})
					})
			} else if (selectedType === 'reservations') {
				fetch(`${API_URL}/admin/reservations`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})
					.then(response => response.json())
					.then(data => {
						listContainer.innerHTML = data
							.map(
								reservation => `
                    <div class="element" id="element-${reservation.id}">
                        <div class="text-container">
                            <p>Imię i Nazwisko: ${reservation.firstName || reservation.user?.firstName || ''} ${
									reservation.lastName || reservation.user?.lastName || ''
								}</p>
                            <p>E-Mail: ${reservation.email}</p>
                            <p>Data: ${reservation.date}</p>
                            <p>Godzina: ${reservation.time}</p>
                            <p>Liczba Miejsc: ${reservation.seats}</p>
                            ${reservation.additionalInfo ? `<p>Dodatkowe Uwagi: ${reservation.additionalInfo}</p>` : ''}
                            ${reservation.userId ? `<p>UserID: ${reservation.userId}</p>` : ''}
                            <p>Numer Stolika: ${reservation.tableId}</p>
                        </div>
                        <i class="fa-regular fa-circle-xmark" onclick="deleteItem('reservation', ${
													reservation.id
												})"></i>
                    </div>
                `
							)
							.join('')
					})
					.catch(error => {
						console.error('Error:', error)
						Swal.fire({
							title: 'Błąd!',
							text: 'Wystąpił błąd podczas ładowania rezerwacji.',
							icon: 'error',
							confirmButtonText: 'OK',
						})
					})
			}
		})

		//to jest uzywane by domyslnie wczytywac elementy dla jednej z opcji
		elementListTypeSelect.dispatchEvent(new Event('change'))
	}

	// This function dynamically creates a user profile panel.
	// It adds a styled header, a profile picture and name,
	// and a grid of user information fields that are editable.
	// There is also a button to change the user's password.
	function loadUserProfile() {
		// Clear the active class from all buttons
		clearActiveClass()
		// Add the active class to the user profile button
		userProfileBtn.classList.add('button-active')

		// Clear the main content
		mainContent.innerHTML = ''

		// Dynamically create the user profile panel
		mainContent.innerHTML = `
            <!-- Start of user profile panel -->
            <div class="dynamic-content user-content">
                <!-- Header -->
                <h2 class="user-profile-header">Mój Profil</h2>
                
                <!-- Profile picture and name -->
                <div class="user-item">
                    <div class="user-profile-picture" id="user-profile-picture">
                        <i class="fa-solid fa-pen"></i>
                        <input type="file" id="profile-picture-input" class="hidden">
                    </div>
                    <p class="user-name"></p>
                </div>
                
                <!-- Grid of user information fields -->
                <div class="user-item user-grid">
                    <p class="common-user-text">Imię* <span class="user-data" contenteditable="true" data-field="firstName"></span></p>
                    <p class="common-user-text">Nazwisko* <span class="user-data" contenteditable="true" data-field="lastName"></span></p>
                    <p class="common-user-text">Pseudonim <span class="user-data" contenteditable="true" data-field="username"></span></p>
                    <p class="common-user-text">Hasło* <span class="change-password">Zmień hasło</span></p>
                    <p class="common-user-text">Email* <span class="user-data" contenteditable="true" data-field="email"></span></p>
                    <p class="common-user-text">Typ Konta* <span class="user-data" data-field="role"></span></p>  
                </div>
                
                <!-- Form to change the user's password -->
                <form action="" class="change-password-form hidden">
                    <div class="configuration-item">
                        <label for="current-password">Stare hasło</label>
                        <input type="password" id="current-password" required>
                    </div>
                    <div class="configuration-item">
                        <label for="new-password">Nowe hasło</label>
                        <input type="password" id="new-password" required>
                    </div>
                    <div class="configuration-item">
                        <label for="confirm-password">Potwierdź hasło</label>
                        <input type="password" id="confirm-password" required>
                    </div>
                    <button id="update-password-btn">Zaktualizuj hasło</button>
                </form>
            </div>
            <!-- End of user profile panel -->
        `

		// Load user information
		loadUserInfo()
	}

	// Function to load user information from the API and display it in the user profile panel
	function loadUserInfo() {
		// Get the token from localStorage
		const token = localStorage.getItem('token')
		// If the token does not exist, redirect to the login page
		if (!token) {
			window.location.href = '/index.html'
			return
		}

		// Send a GET request to the API to retrieve the user profile information
		fetch(`${API_URL}/profile`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`, // Add the token to the authorization header
			},
		})
			.then(response => {
				// If the response is not OK, check the status
				if (!response.ok) {
					// If the status is 401 or 403, remove the token and redirect to the login page
					if (response.status === 401 || response.status === 403) {
						localStorage.removeItem('token')
						window.location.href = '/index.html'
					}
					throw new Error('Network response was not ok')
				}
				return response.json() // Parse the response to JSON format
			})
			.then(user => {
				// Update the user information displayed in the user interface
				document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName} ${
					user.username ? `(${user.username})` : ''
				}`
				document.querySelector('.user-data[data-field="firstName"]').textContent = user.firstName
				document.querySelector('.user-data[data-field="lastName"]').textContent = user.lastName
				document.querySelector('.user-data[data-field="email"]').textContent = user.email
				document.querySelector('.user-data[data-field="role"]').textContent = user.role
				document.querySelector('.user-data[data-field="username"]').textContent = user.username || ''
				const profilePicture = user.profilePicture ? `img/uploads/${user.profilePicture}` : './img/avatar-big.jpg'
				document.getElementById('user-profile-picture').style.backgroundImage = `url(${profilePicture})`

				// Add event listeners to handle profile field editing
				document.querySelectorAll('.user-data[contenteditable="true"]').forEach(field => {
					field.setAttribute('data-original-value', field.textContent.trim()) // Save the original value when the page loads
					field.addEventListener('focus', event => {
						originalValue = event.target.textContent.trim() // Save the original value before editing
					})
					field.addEventListener('blur', handleProfileUpdate) // Add event listener to handle profile updates
				})

				// Handle profile picture change
				document.getElementById('user-profile-picture').addEventListener('click', () => {
					document.getElementById('profile-picture-input').click()
				})

				document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureChange)

				// Handle password change
				document.querySelector('.change-password').addEventListener('click', () => {
					document.querySelector('.change-password-form').classList.toggle('hidden')
				})

				document.getElementById('update-password-btn').addEventListener('click', event => {
					event.preventDefault()
					const currentPassword = document.getElementById('current-password').value
					const newPassword = document.getElementById('new-password').value
					const confirmPassword = document.getElementById('confirm-password').value

					if (newPassword !== confirmPassword) {
						Swal.fire({
							title: 'Error!',
							text: 'Stare i Nowe Hasło do Siebie Nie Pasują',
							icon: 'error',
							confirmButtonText: 'OK',
						})
						return
					}

					// Send a PUT request to the API to change the password
					fetch(`${API_URL}/change-password`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
						body: JSON.stringify({ currentPassword, newPassword }),
					})
						.then(response => response.json())
						.then(data => {
							if (data.errors) {
								Swal.fire({
									title: 'Błąd!',
									text: data.errors.map(error => error.msg).join('\n'),
									icon: 'error',
									confirmButtonText: 'OK',
								})
							} else {
								Swal.fire({
									title: 'Success!',
									text: 'Hasło pomyślnie zaktualizowane.',
									icon: 'success',
									confirmButtonText: 'OK',
								})
								document.querySelector('.change-password-form').classList.add('hidden')
							}
						})
						.catch(error => {
							console.error('Error changing password:', error)
							Swal.fire({
								title: 'Error!',
								text: 'Błąd zmiany hasła.',
								icon: 'error',
								confirmButtonText: 'OK',
							})
						})
				})

				// Show admin options if the user is an admin
				if (user.role === 'admin') {
					document.getElementById('add-elements-btn').style.display = 'flex'
					document.getElementById('list-elements-btn').style.display = 'flex'
				} else {
					document.getElementById('add-elements-btn').style.display = 'none'
					document.getElementById('list-elements-btn').style.display = 'none'
				}
			})
			.catch(error => {
				console.error('Error loading user profile:', error)
				Swal.fire({
					title: 'Error!',
					text: 'Error loading user profile.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	const handleProfilePictureChange = event => {
		const file = event.target.files[0]
		if (file) {
			const formData = new FormData()
			formData.append('profilePicture', file)

			fetch(`${API_URL}/profile-picture`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: formData,
			})
				.then(response => response.json())
				.then(data => {
					if (data.errors) {
						Swal.fire({
							title: 'Error!',
							text: data.errors.map(error => error.msg).join('\n'),
							icon: 'error',
							confirmButtonText: 'OK',
						})
					} else {
						Swal.fire({
							title: 'Sukces!',
							text: 'Zdjęcie profilowe zaktualizowane pomyślnie',
							icon: 'success',
							confirmButtonText: 'OK',
						})
						loadUserProfile()
					}
				})
				.catch(error => {
					console.error('Error uploading profile picture:', error)
					Swal.fire({
						title: 'Błąd!',
						text: 'Błąd podczas zmiany zdjęcia profilowego.',
						icon: 'error',
						confirmButtonText: 'OK',
					})
				})
		}
	}

	function handleProfileUpdate(event) {
		const field = event.target
		const fieldName = field.getAttribute('data-field')
		const fieldValue = field.textContent.trim()
		const originalValue = field.getAttribute('data-original-value') || ''

		if (originalValue === fieldValue) {
			return // Jeśli wartość się nie zmieniła, nie wysyłaj żądania
		}

		// Walidacja
		function validateEmail(email) {
			const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			return re.test(String(email).toLowerCase())
		}

		function isCapitalized(str) {
			return str.charAt(0) === str.charAt(0).toUpperCase()
		}

		if (fieldName === 'firstName' || fieldName === 'lastName') {
			if (fieldValue === '') {
				Swal.fire({
					title: 'Błąd!',
					text: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} nie może być puste.`,
					icon: 'error',
					confirmButtonText: 'OK',
				})
				field.textContent = originalValue // Przywróć oryginalną wartość
				return
			}
			if (!isCapitalized(fieldValue)) {
				Swal.fire({
					title: 'Błąd!',
					text: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} musi zaczynać się wielką literą.`,
					icon: 'error',
					confirmButtonText: 'OK',
				})

				field.textContent = originalValue // Przywróć oryginalną wartość
				return
			}
		}

		if (fieldName === 'email' && !validateEmail(fieldValue)) {
			Swal.fire({
				title: 'Błąd!',
				text: 'Proszę podać poprawny adres e-mail.',
				icon: 'error',
				confirmButtonText: 'OK',
			})
			field.textContent = originalValue // Przywróć oryginalną wartość
			return
		}

		// Wysłanie żądania PUT do API
		fetch(`${API_URL}/profile`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify({ [fieldName]: fieldValue }),
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
					field.textContent = originalValue // Przywróć oryginalną wartość w przypadku błędu
				} else {
					Swal.fire({
						title: 'Sukces!',
						text: 'Profil zaktualizowany pomyślnie',
						icon: 'success',
						confirmButtonText: 'OK',
					})
					field.setAttribute('data-original-value', fieldValue) // Zaktualizuj oryginalną wartość

					// Aktualizacja imienia, nazwiska i pseudonimu w górnej części profilu użytkownika
					const userNameDisplay = document.querySelector('.user-name')
					const firstName = document.querySelector('.user-data[data-field="firstName"]').textContent.trim()
					const lastName = document.querySelector('.user-data[data-field="lastName"]').textContent.trim()
					const username = document.querySelector('.user-data[data-field="username"]').textContent.trim() || ''
					const usernameDisplay = username ? `(${username})` : ''
					userNameDisplay.textContent = `${firstName} ${lastName} ${usernameDisplay}`
				}
			})
			.catch(error => {
				console.error('Error updating profile:', error)
				Swal.fire({
					title: 'Błąd!',
					text: 'Błąd podczas aktualizacji profilu.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
				field.textContent = originalValue // Przywróć oryginalną wartość w przypadku błędu
			})
	}

	/**
	 * This function cancels a reservation by sending a DELETE request to the API.
	 * It first checks if the user is logged in by checking if a token exists in localStorage.
	 * If the user is not logged in, it redirects them to the login page.
	 * If the user is logged in, it sends a DELETE request to the API with the reservation ID.
	 * If the request is successful, it displays a success message and reloads the user's reservations.
	 * If the request is not successful, it logs the error details and displays an error message.
	 *
	 * @param {string} reservationId - The ID of the reservation to be canceled.
	 */
	function cancelReservation(reservationId) {
		// Check if the user is logged in by getting the token from localStorage
		const token = localStorage.getItem('token')

		// If the user is not logged in, redirect them to the login page
		if (!token) {
			window.location.href = '/index.html'
			return
		}

		// Send a DELETE request to the API with the reservation ID
		fetch(`${API_URL}/reservations/${reservationId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`, // Include the token in the request headers
			},
		})
			.then(response => {
				// If the response is not ok, parse the error details and throw an error
				if (!response.ok) {
					return response.json().then(err => {
						console.error('Error details:', err)
						throw new Error('Network response was not ok')
					})
				}
				// If the response is ok, parse it as JSON
				return response.json()
			})
			.then(data => {
				// Display a success message and reload the user's reservations
				Swal.fire({
					title: 'Sukces!',
					text: 'Rezerwacja anulowana!',
					icon: 'success',
					confirmButtonText: 'OK',
				})

				loadUserReservations() // Reload the user's reservations
			})
			.catch(error => {
				// Log the error details and display an error message
				console.error('Error:', error)
				Swal.fire({
					title: 'Błąd!',
					text: 'Wystąpił błąd podczas anulowania rezerwacji.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	/**
	 * This function is responsible for loading the reservations page
	 * and displaying the user's reservations. It does the following:
	 * - Clears the 'button-active' class from all elements with the
	 *   class 'button-active' to remove the active styling from
	 *   previously active buttons.
	 * - Adds the 'button-active' class to the 'reservationsBtn' element
	 *   to set the active styling for the reservations button.
	 * - Sets the HTML content of the 'mainContent' element to a dynamically
	 *   generated HTML string that includes a header and a container for the
	 *   reservations list.
	 * - Calls the 'loadUserReservations' function to load and display the
	 *   user's reservations on the page.
	 */
	function loadReservations() {
		// Clear the 'button-active' class from all elements with the class
		clearActiveClass()

		// Add the 'button-active' class to the 'reservationsBtn' element
		reservationsBtn.classList.add('button-active')

		// Set the HTML content of the 'mainContent' element to a dynamically
		// generated HTML string that includes a header and a container for the
		// reservations list
		mainContent.innerHTML = `
            <div class="dynamic-content reservations-content">
                <!-- Display a header for the reservations section -->
                <h2 class="user-profile-header">Moje Rezerwacje</h2>
                <!-- Container for the reservations list -->
                <div class="reservations-list list-container" id="reservations-list"></div>
            </div>
        `

		// Load and display the user's reservations on the page
		loadUserReservations()
	}

	/**
	 * This function is responsible for loading and displaying the user's
	 * reservations on the page. It does the following:
	 * - Retrieves the user's authentication token from local storage.
	 * - If there is no token, it redirects the user to the login page.
	 * - Makes a GET request to the server to retrieve the user's reservations.
	 * - Handles the response from the server:
	 *   - If the response is not ok, it checks if the response status is
	 *     unauthorized (401) or forbidden (403). If so, it removes the token
	 *     from local storage and redirects the user to the login page.
	 *   - If the response is ok, it parses the response as JSON and retrieves
	 *     the reservations array.
	 * - Generates HTML for each reservation and appends it to the reservations
	 *   list on the page.
	 * - If there are no reservations, it clears the reservations list.
	 */
	function loadUserReservations() {
		// Retrieve the user's authentication token from local storage
		const token = localStorage.getItem('token')

		// If there is no token, redirect the user to the login page
		if (!token) {
			window.location.href = '/index.html'
			return
		}

		// Make a GET request to the server to retrieve the user's reservations
		fetch(`${API_URL}/reservations`, {
			// Change from /admin/reservations to /reservations
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => {
				// Log the response status to the console
				console.log('Response status:', response.status)

				// If the response is not ok, handle the error
				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
						// Remove the token from local storage and redirect the user to the login page
						localStorage.removeItem('token')
						window.location.href = '/index.html'
					}
					return response.text().then(text => {
						// Log the error response text to the console and throw an error
						console.error('Error response text:', text)
						throw new Error('Network response was not ok')
					})
				}

				// If the response is ok, parse the response as JSON and retrieve the reservations array
				return response.json()
			})
			.then(reservations => {

				// Get the reservations list element from the page
				const reservationsList = document.getElementById('reservations-list')

				// If there are no reservations, clear the reservations list
				if (reservations.length === 0) {
					reservationsList.innerHTML = ''
				} else {
					// Generate HTML for each reservation and append it to the reservations list on the page
					reservationsList.innerHTML = reservations
						.map(
							reservation => `
                            <div class="element" id="element-${reservation.id}">
                                <div class="text-container">
                                    <p>Data: ${reservation.date}</p>
                                    <p>Godzina: ${reservation.time}</p>
                                    <p>Miejsca: ${reservation.seats}</p>
                                    ${reservation.additionalInfo ? `<p>Uwagi: ${reservation.additionalInfo}</p>` : ''}
                                    ${reservation.firstName ? `<p>Imię: ${reservation.firstName}</p>` : ''}
                                    ${reservation.lastName ? `<p>Nazwisko: ${reservation.lastName}</p>` : ''}
                                </div>
                                <i class="fa-regular fa-circle-xmark" aria-hidden="true" onclick="cancelReservation(${
																	reservation.id
																})"></i>
                            </div>
                        `
						)
						.join('')
				}
			})
			.catch(error => {
				// Log any errors to the console and display an error message to the user
				console.error('Error loading reservations:', error)
				Swal.fire({
					title: 'Błąd!',
					text: 'Błąd podczas ładowania rezerwacji.',
					icon: 'error',
					confirmButtonText: 'OK',
				})
			})
	}

	addElementsBtn.addEventListener('click', loadAddElements)
	listElementsBtn.addEventListener('click', loadListElements)
	userProfileBtn.addEventListener('click', loadUserProfile)
	reservationsBtn.addEventListener('click', loadReservations)

	// Domyślnie załaduj profil użytkownika po załadowaniu strony
	loadUserProfile()

	window.deleteItem = deleteItem
	window.makeEditable = makeEditable
	window.cancelReservation = cancelReservation
})
