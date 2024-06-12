document.addEventListener('DOMContentLoaded', function () {
	const API_URL = window && window.process && window.process.type === 'renderer' ? 'http://localhost:3000/api' : '/api'

	const addElementsBtn = document.getElementById('add-elements-btn')
	const listElementsBtn = document.getElementById('list-elements-btn')
	const reservationsBtn = document.querySelector('aside button:nth-child(4)') // Przycisk Rezerwacje
	const userProfileBtn = document.getElementById('user-profile-btn')
	const mainContent = document.getElementById('main-content')

	let originalValue = '' // Przechowywanie oryginalnej wartości

	function clearActiveClass() {
		document.querySelectorAll('aside button').forEach(button => button.classList.remove('button-active'))
	}

	function validateEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return re.test(String(email).toLowerCase())
	}

	function formatPriceInput(input) {
		input.addEventListener('blur', function () {
			let value = parseFloat(input.value)
			if (isNaN(value) || value < 0) {
				value = 0
			}
			input.value = value.toFixed(2)
		})
	}

	function submitMenuForm(event) {
		event.preventDefault()
		const name = document.getElementById('menu-name').value
		const description = document.getElementById('menu-description').value
		const price = document.getElementById('menu-price').value

		fetch(`${API_URL}/menu`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, description, price }),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				alert('Pozycja dodana do menu!')
				document.getElementById('menu-form').reset()
			})
			.catch(error => {
				console.error('Error:', error)
				alert('Wystąpił błąd podczas dodawania pozycji do menu.')
			})
	}

	function submitTestimonialForm(event) {
		event.preventDefault()
		const text = document.getElementById('testimonial-text').value
		const author = document.getElementById('testimonial-author').value
		const company = document.getElementById('testimonial-company').value

		fetch(`${API_URL}/testimonials`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text, author, company }),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				alert('Testimonial dodany!')
				document.getElementById('testimonial-form').reset()
			})
			.catch(error => {
				console.error('Error:', error)
				alert('Wystąpił błąd podczas dodawania testimonialu.')
			})
	}

	function submitNewsForm(event) {
		event.preventDefault()
		const formData = new FormData(event.target)
		const headers = Array.from(document.querySelectorAll('.news-header')).map(input => input.value)
		const texts = Array.from(document.querySelectorAll('.news-text')).map(textarea => textarea.value)
		formData.append('headers', JSON.stringify(headers))
		formData.append('texts', JSON.stringify(texts))

		fetch(`${API_URL}/news`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: formData,
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				alert('News dodany!')
				document.getElementById('news-form').reset()
			})
			.catch(error => {
				console.error('Error:', error)
				alert('Wystąpił błąd podczas dodawania news.')
			})
	}

	function deleteItem(type, id) {
		const url =
			type === 'menu'
				? `${API_URL}/menu/${id}`
				: type === 'testimonial'
				? `${API_URL}/testimonials/${id}`
				: `${API_URL}/reservations/${id}`
		const element = document.querySelector(`#element-${id}`)
		fetch(url, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				alert(`${type === 'menu' ? 'Pozycja' : type === 'testimonial' ? 'Testimonial' : 'Rezerwacja'} usunięta!`)
				element.remove()
			})
			.catch(error => {
				console.error('Error:', error)
				alert(
					`Wystąpił błąd podczas usuwania ${
						type === 'menu' ? 'pozycji' : type === 'testimonial' ? 'testimonialu' : 'rezerwacji'
					}.`
				)
			})
	}

	function editItem(type, id, field, value, index = null) {
		console.log(`Edit item: type=${type}, id=${id}, field=${field}, value=${value}`)
		let url
		let data = {}

		if (type === 'menu') {
			url = `${API_URL}/menu/${id}`
			const name = field === 'name' ? value : document.getElementById(`name-${id}`).textContent.trim()
			const description =
				field === 'description' ? value : document.getElementById(`description-${id}`).textContent.trim()
			const price =
				field === 'price'
					? value
					: parseFloat(document.getElementById(`price-${id}`).textContent.replace('$', '').trim())
			data = { name, description, price }
		} else if (type === 'testimonial') {
			url = `${API_URL}/testimonials/${id}`
			const text = field === 'text' ? value : document.getElementById(`text-${id}`).textContent.trim()
			const author = field === 'author' ? value : document.getElementById(`author-${id}`).textContent.trim()
			const company = field === 'company' ? value : document.getElementById(`company-${id}`).textContent.trim()
			data = { text, author, company }
		} else if (type === 'news') {
			url = `${API_URL}/news/${id}`
			if (field === 'header' || field === 'text') {
				data[field] = value
				data['index'] = index // Pass the index of the header or text to be updated
			} else {
				data[field] = value
			}
		}

		console.log('Sending PUT request to:', url, 'with data:', data)

		fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify(data),
		})
			.then(response => {
				console.log('Response status:', response.status)
				if (!response.ok) {
					return response.text().then(text => {
						console.error('Error response text:', text)
						throw new Error('Network response was not ok')
					})
				}
				return response.json()
			})
			.then(data => {
				alert(`${type.charAt(0).toUpperCase() + type.slice(1)} zaktualizowany!`)
				// Update the text content without reloading the list
				if (field !== 'header' && field !== 'text') {
					document.getElementById(`${field}-${id}`).textContent = data[field]
				}
			})
			.catch(error => {
				console.error('Error:', error)
				alert(`Wystąpił błąd podczas aktualizacji ${type}.`)
			})
	}

	function makeEditable(element, type, id, field, index = null) {
		element.addEventListener('click', function () {
			const originalValue = element.textContent.trim()
			element.contentEditable = true
			element.focus()

			function handleBlur() {
				const newValue = element.textContent.trim()
				if (newValue !== originalValue) {
					editItem(type, id, field, newValue, index)
				}
				element.contentEditable = false
				element.removeEventListener('blur', handleBlur)
				element.removeEventListener('keydown', handleKeydown)
			}

			function handleKeydown(event) {
				if (event.key === 'Enter') {
					event.preventDefault()
					element.blur()
				} else if (event.key === 'Escape') {
					element.textContent = originalValue
					element.blur()
				}
			}

			element.addEventListener('blur', handleBlur)
			element.addEventListener('keydown', handleKeydown)
		})
	}

	function makeImageEditable(imageElement, type, id) {
		imageElement.addEventListener('click', function () {
			const fileInput = document.createElement('input')
			fileInput.type = 'file'
			fileInput.accept = 'image/*'
			fileInput.style.display = 'none'

			fileInput.addEventListener('change', function () {
				if (fileInput.files.length > 0) {
					const formData = new FormData()
					formData.append('image', fileInput.files[0])

					fetch(`${API_URL}/news/${id}/image`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
						body: formData,
					})
						.then(response => {
							if (!response.ok) {
								throw new Error('Network response was not ok')
							}
							return response.json()
						})
						.then(data => {
							alert('Obraz zaktualizowany!')
							imageElement.src = `/img/uploads/${data.image}`
						})
						.catch(error => {
							console.error('Error:', error)
							alert('Wystąpił błąd podczas aktualizacji obrazu.')
						})
				}
			})

			fileInput.click()
		})
	}

	function addNewsHeaderText() {
		const headersTextsContainer = document.getElementById('headers-texts-container')
		const headerTextContainer = document.createElement('div')
		headerTextContainer.classList.add('header-text-container')
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
		headersTextsContainer.insertBefore(headerTextContainer, headersTextsContainer.lastElementChild)
	}

	function loadAddElements() {
		clearActiveClass()
		addElementsBtn.classList.add('button-active')
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

		const elementTypeSelect = document.getElementById('element-type')
		const formContainer = document.getElementById('form-container')

		elementTypeSelect.addEventListener('change', function () {
			const selectedType = elementTypeSelect.value
			if (selectedType === 'menu') {
				formContainer.innerHTML = `
                    <form id="menu-form">
                        <div class="configuration-item">
                            <label for="menu-name">Nazwa</label>
                            <input type="text" id="menu-name" name="name" required>
                        </div>
                        <div class="configuration-item">
                            <label for="menu-description">Opis</label>
                            <textarea id="menu-description" name="description" required></textarea>
                        </div>
                        <div class="configuration-item">
                            <label for="menu-price">Cena</label>
                            <input type="number" id="menu-price" name="price" min="0" step="0.01" required>
                        </div>
                        <button type="submit">Dodaj</button>
                    </form>
                `
				const priceInput = document.getElementById('menu-price')
				formatPriceInput(priceInput)
				document.getElementById('menu-form').addEventListener('submit', submitMenuForm)
			} else if (selectedType === 'testimonial') {
				formContainer.innerHTML = `
                    <form id="testimonial-form">
                        <div class="configuration-item">
                            <label for="testimonial-text">Tekst</label>
                            <textarea id="testimonial-text" name="text" required></textarea>
                        </div>
                        <div class="configuration-item">
                            <label for="testimonial-author">Autor</label>
                            <input type="text" id="testimonial-author" name="author" required>
                        </div>
                        <div class="configuration-item">
                            <label for="testimonial-company">Firma</label>
                            <input type="text" id="testimonial-company" name="company" required>
                        </div>
						                        <button type="submit">Dodaj</button>
                    </form>
                `
				document.getElementById('testimonial-form').addEventListener('submit', submitTestimonialForm)
			} else if (selectedType === 'news') {
				formContainer.innerHTML = `
                    <form id="news-form" enctype="multipart/form-data">
                        <div class="configuration-item">
                            <label for="news-category">Kategoria</label>
                            <input type="text" id="news-category" name="category" required>
                        </div>
                        <div class="configuration-item">
                            <label for="news-title">Tytuł</label>
                            <input type="text" id="news-title" name="title" required>
                        </div>
                        <div class="configuration-item">
                            <label for="news-intro-text">Wstępny tekst</label>
                            <textarea id="news-intro-text" name="introText" required></textarea>
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
                                    <input type="text" class="news-header" name="header" required>
                                </div>
                                <div class="configuration-item">
                                    <label for="news-text">Tekst</label>
                                    <textarea class="news-text" name="text" required></textarea>
                                </div>
                            </div>
                            <div class="configuration-item">
                                <button type="button" id="add-header-text-btn">Dodaj nagłówek + tekst</button>
                            </div>
                        </div>
                        <button type="submit">Dodaj</button>
                    </form>
                `
				document.getElementById('add-header-text-btn').addEventListener('click', addNewsHeaderText)
				document.getElementById('news-form').addEventListener('submit', submitNewsForm)

				// Custom file input handling
				const fileInput = document.getElementById('news-image')
				const fileBtn = document.getElementById('custom-file-btn')
				const fileName = document.getElementById('file-name')

				fileBtn.addEventListener('click', function () {
					fileInput.click()
				})

				fileInput.addEventListener('change', function () {
					if (fileInput.files.length > 0) {
						fileName.textContent = fileInput.files[0].name
					} else {
						fileName.textContent = 'Brak wybranego pliku'
					}
				})
			}
		})

		// Trigger the change event to load the default form
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
				fetch(`${API_URL}/menu`)
					.then(response => response.json())
					.then(data => {
						listContainer.innerHTML = data
							.map(
								item => `
							<div class="element" id="element-${item.id}">
								<div class="text-container">
									<p class="element-text" id="name-${item.id}">${item.name}</p>
									<p class="element-text" id="description-${item.id}">${item.description}</p>
									<p class="element-text" id="price-${item.id}">$${item.price.toFixed(2)}</p>
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
						alert('Wystąpił błąd podczas ładowania pozycji menu.')
					})
			} else if (selectedType === 'testimonial') {
				fetch(`${API_URL}/testimonials`)
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
						alert('Wystąpił błąd podczas ładowania testimonials.')
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
										${item.image ? `<img src="/img/uploads/${item.image}" alt="News Image" class="news-image" id="image-${item.id}">` : ''}
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
						alert('Wystąpił błąd podczas ładowania news.')
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
							<i class="fa-regular fa-circle-xmark" onclick="deleteItem('reservation', ${reservation.id})"></i>
						</div>
					`
							)
							.join('')
					})
					.catch(error => {
						console.error('Error:', error)
						alert('Wystąpił błąd podczas ładowania rezerwacji.')
					})
			}
		})

		elementListTypeSelect.dispatchEvent(new Event('change'))
	}

	function loadUserProfile() {
		clearActiveClass()
		userProfileBtn.classList.add('button-active')
		mainContent.innerHTML = `
            <div class="dynamic-content user-content">
                <h2 class="user-profile-header">Mój Profil</h2>
                <div class="user-item">
                    <div class="user-profile-picture" id="user-profile-picture">
                        <i class="fa-solid fa-pen"></i>
                        <input type="file" id="profile-picture-input" class="hidden">
                    </div>
                    <p class="user-name"></p>
                </div>
                <div class="user-item user-grid">
                    <p class="common-user-text">Imię* <span class="user-data" contenteditable="true" data-field="firstName"></span></p>
                    <p class="common-user-text">Nazwisko* <span class="user-data" contenteditable="true" data-field="lastName"></span></p>
                    <p class="common-user-text">Pseudonim <span class="user-data" contenteditable="true" data-field="username"></span></p>
                    <p class="common-user-text">Hasło* <span class="change-password">Zmień hasło</span></p>
                    <p class="common-user-text">Email* <span class="user-data" contenteditable="true" data-field="email"></span></p>
                    <p class="common-user-text">Typ Konta* <span class="user-data" data-field="role"></span></p>  
                </div>
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
        `
		loadUserInfo()
	}

	function loadUserInfo() {
		const token = localStorage.getItem('token')
		if (!token) {
			window.location.href = '/index.html'
			return
		}

		fetch(`${API_URL}/profile`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => {
				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
						localStorage.removeItem('token')
						window.location.href = '/index.html'
					}
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(user => {
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

				// Dodanie obsługi edycji pól profilu
				document.querySelectorAll('.user-data[contenteditable="true"]').forEach(field => {
					field.setAttribute('data-original-value', field.textContent.trim()) // Ustawienie oryginalnej wartości przy załadowaniu strony
					field.addEventListener('focus', event => {
						originalValue = event.target.textContent.trim() // Zapisz oryginalną wartość przed edycją
					})
					field.addEventListener('blur', handleProfileUpdate)
				})

				document.getElementById('user-profile-picture').addEventListener('click', () => {
					document.getElementById('profile-picture-input').click()
				})

				document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureChange)

				document.querySelector('.change-password').addEventListener('click', () => {
					document.querySelector('.change-password-form').classList.toggle('hidden')
				})

				document.getElementById('update-password-btn').addEventListener('click', event => {
					event.preventDefault()
					const currentPassword = document.getElementById('current-password').value
					const newPassword = document.getElementById('new-password').value
					const confirmPassword = document.getElementById('confirm-password').value

					if (newPassword !== confirmPassword) {
						alert('Nowe hasło i potwierdzenie hasła nie są zgodne.')
						return
					}

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
								alert(data.errors.map(error => error.msg).join('\n'))
							} else {
								alert('Hasło zostało zaktualizowane pomyślnie.')
								document.querySelector('.change-password-form').classList.add('hidden')
							}
						})
						.catch(error => {
							console.error('Error changing password:', error)
							alert('Błąd podczas zmiany hasła.')
						})
				})

				// Show admin options if user is an admin
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
				alert('Błąd podczas ładowania profilu użytkownika.')
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

	function handleProfileUpdate(event) {
		const field = event.target
		const fieldName = field.getAttribute('data-field')
		const fieldValue = field.textContent.trim()
		const originalValue = field.getAttribute('data-original-value') || ''

		if (originalValue === fieldValue) {
			return // Jeśli wartość się nie zmieniła, nie wysyłaj żądania
		}

		// Walidacja e-maila
		if (fieldName === 'email' && !validateEmail(fieldValue)) {
			alert('Proszę podać poprawny adres e-mail.')
			field.textContent = originalValue // Przywróć oryginalną wartość
			return
		}

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
					alert(data.errors.map(error => error.msg).join('\n'))
					field.textContent = originalValue // Przywróć oryginalną wartość w przypadku błędu
				} else {
					alert('Profil zaktualizowany pomyślnie')
					field.setAttribute('data-original-value', fieldValue) // Zaktualizuj oryginalną wartość

					// Aktualizacja pseudonimu w górnej części profilu użytkownika
					if (fieldName === 'username') {
						const userNameDisplay = document.querySelector('.user-name')
						const firstName = document.querySelector('.user-data[data-field="firstName"]').textContent.trim()
						const lastName = document.querySelector('.user-data[data-field="lastName"]').textContent.trim()
						const username = fieldValue ? `(${fieldValue})` : ''
						userNameDisplay.textContent = `${firstName} ${lastName} ${username}`
					}
				}
			})
			.catch(error => {
				console.error('Error updating profile:', error)
				alert('Błąd podczas aktualizacji profilu.')
				field.textContent = originalValue // Przywróć oryginalną wartość w przypadku błędu
			})
	}

	function cancelReservation(reservationId) {
		const token = localStorage.getItem('token')
		if (!token) {
			window.location.href = '/index.html'
			return
		}

		fetch(`${API_URL}/reservations/${reservationId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => {
				if (!response.ok) {
					return response.json().then(err => {
						// Read the response body to get error details
						console.error('Error details:', err)
						throw new Error('Network response was not ok')
					})
				}
				return response.json()
			})
			.then(data => {
				alert('Rezerwacja anulowana!')
				loadUserReservations() // Ponowne załadowanie listy rezerwacji
			})
			.catch(error => {
				console.error('Error:', error)
				alert('Wystąpił błąd podczas anulowania rezerwacji.')
			})
	}

	function loadReservations() {
		clearActiveClass()
		reservationsBtn.classList.add('button-active')
		mainContent.innerHTML = `
            <div class="dynamic-content reservations-content">
                <h2 class="user-profile-header">Moje Rezerwacje</h2>
                <div class="reservations-list list-container" id="reservations-list"></div>
            </div>
        `
		loadUserReservations()
	}

	function loadUserReservations() {
		const token = localStorage.getItem('token')
		if (!token) {
			window.location.href = '/index.html'
			return
		}

		fetch(`${API_URL}/reservations`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => {
				console.log('Response status:', response.status) // Dodaj logowanie statusu odpowiedzi
				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
						localStorage.removeItem('token')
						window.location.href = '/index.html'
					}
					return response.text().then(text => {
						// Dodaj logowanie treści odpowiedzi w przypadku błędu
						console.error('Error response text:', text)
						throw new Error('Network response was not ok')
					})
				}
				return response.json()
			})
			.then(reservations => {
				console.log('Reservations:', reservations) // Logowanie otrzymanych rezerwacji
				const reservationsList = document.getElementById('reservations-list')
				if (reservations.length === 0) {
					reservationsList.innerHTML = 'Brak rezerwacji'
				} else {
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
				console.error('Error loading reservations:', error)
				alert('Błąd podczas ładowania rezerwacji.')
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
