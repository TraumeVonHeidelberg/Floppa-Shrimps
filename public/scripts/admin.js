document.addEventListener('DOMContentLoaded', function () {
	const addElementsBtn = document.getElementById('add-elements-btn')
	const listElementsBtn = document.getElementById('list-elements-btn')
	const reservationsBtn = document.querySelector('button:nth-child(3)')
	const userProfileBtn = document.getElementById('user-profile-btn')
	const mainContent = document.getElementById('main-content')

	function clearActiveClass() {
		document.querySelectorAll('aside button').forEach(button => button.classList.remove('button-active'))
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

		fetch('/api/menu', {
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

		fetch('/api/testimonials', {
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

		fetch('/api/news', {
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
		const url = type === 'menu' ? `/api/menu/${id}` : `/api/testimonials/${id}`
		const element = document.querySelector(`#element-${id}`)
		fetch(url, {
			method: 'DELETE',
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				alert(`${type === 'menu' ? 'Pozycja' : 'Testimonial'} usunięty!`)
				element.remove()
			})
			.catch(error => {
				console.error('Error:', error)
				alert(`Wystąpił błąd podczas usuwania ${type === 'menu' ? 'pozycji' : 'testimonialu'}.`)
			})
	}

	function editItem(type, id, field, value) {
		console.log(`Edit item: type=${type}, id=${id}, field=${field}, value=${value}`)
		const url = type === 'menu' ? `/api/menu/${id}` : `/api/testimonials/${id}`

		let data = {}
		if (type === 'menu') {
			const name = field === 'name' ? value : document.getElementById(`name-${id}`).textContent.trim()
			const description =
				field === 'description' ? value : document.getElementById(`description-${id}`).textContent.trim()
			const price =
				field === 'price'
					? value
					: parseFloat(document.getElementById(`price-${id}`).textContent.replace('$', '').trim())
			data = { name, description, price }
		} else if (type === 'testimonial') {
			const text = field === 'text' ? value : document.getElementById(`text-${id}`).textContent.trim()
			const author = field === 'author' ? value : document.getElementById(`author-${id}`).textContent.trim()
			const company = field === 'company' ? value : document.getElementById(`company-${id}`).textContent.trim()
			data = { text, author, company }
		}

		fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				return response.json()
			})
			.then(data => {
				alert(`${type === 'menu' ? 'Pozycja' : 'Testimonial'} zaktualizowany!`)
				// Update the text content without reloading the list
				if (field === 'name') document.getElementById(`name-${id}`).textContent = data.name
				if (field === 'description') document.getElementById(`description-${id}`).textContent = data.description
				if (field === 'price') document.getElementById(`price-${id}`).textContent = `$${data.price.toFixed(2)}`
				if (field === 'text') document.getElementById(`text-${id}`).textContent = data.text
				if (field === 'author') document.getElementById(`author-${id}`).textContent = data.author
				if (field === 'company') document.getElementById(`company-${id}`).textContent = data.company
			})
			.catch(error => {
				console.error('Error:', error)
				alert(`Wystąpił błąd podczas aktualizacji ${type === 'menu' ? 'pozycji' : 'testimonialu'}.`)
			})
	}

	function makeEditable(element, type, id, field) {
		element.addEventListener('click', function () {
			const originalValue = element.textContent.trim()
			element.contentEditable = true
			element.focus()

			function handleBlur() {
				const newValue = element.textContent.trim()
				if (newValue !== originalValue) {
					editItem(type, id, field, newValue)
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
					</select>
				</div>
				<div id="list-container" class="list-container"></div>
			</div>
		`

		const elementListTypeSelect = document.getElementById('element-list-type')
		const listContainer = document.getElementById('list-container')

		elementListTypeSelect.addEventListener('change', function () {
			const selectedType = elementListTypeSelect.value
			if (selectedType === 'menu') {
				fetch('/api/menu')
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
				fetch('/api/testimonials')
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
				fetch('/api/news')
					.then(response => response.json())
					.then(data => {
						listContainer.innerHTML = data
							.map(
								item => `
							<div class="element" id="element-${item.id}">
								<div class="text-container">
									<p class="element-text" id="category-${item.id}">${item.category}</p>
									<p class="element-text" id="title-${item.id}">${item.title}</p>
									<p class="element-text" id="introText-${item.id}">${item.introText}</p>
									<div id="headers-${item.id}">
										${item.headers.map((header, index) => `<p class="element-text news-header">${header}</p>`).join('')}
									</div>
									<div id="texts-${item.id}">
										${item.texts.map((text, index) => `<p class="element-text news-text">${text}</p>`).join('')}
									</div>
									${item.image ? `<img src="/uploads/${item.image}" alt="News Image" class="news-image">` : ''}
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
								makeEditable(document.getElementById(`headers-${item.id}`).children[index], 'news', item.id, 'headers')
							})
							item.texts.forEach((text, index) => {
								makeEditable(document.getElementById(`texts-${item.id}`).children[index], 'news', item.id, 'texts')
							})
						})
					})
					.catch(error => {
						console.error('Error:', error)
						alert('Wystąpił błąd podczas ładowania news.')
					})
			}
		})

		// Trigger the change event to load the default list
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
					<p class="common-user-text">Imię* <span class="user-data" contenteditable="true"
							data-field="firstName"></span></p>
					<p class="common-user-text">Nazwisko* <span class="user-data" contenteditable="true"
							data-field="lastName"></span></p>
					<p class="common-user-text">Pseudonim <span class="user-data" contenteditable="true"
							data-field="username"></span></p>
					<p class="common-user-text">Email* <span class="user-data" contenteditable="true"
							data-field="email"></span></p>
					<p class="common-user-text">Telefon <span class="user-data" contenteditable="true"
							data-field="phoneNumber"></span></p>
					<p class="common-user-text">Typ Konta* <span class="user-data" data-field="role"></span></p>
					<p class="common-user-text">Hasło* <span class="change-password">Zmień hasło</span></p>
				</div>
				<form action="" class="change-password-form hidden">
					<div class="configuration-item">
						<label for="menu-name">Stare hasło</label>
						<input type="password" id="current-password" required>
					</div>
					<div class="configuration-item">
						<label for="menu-name">Nowe hasło</label>
						<input type="password" id="new-password" required>
					</div>
					<div class="configuration-item">
						<label for="menu-name">Potwierdź hasło</label>
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
			window.location.href = '/login.html'
			return
		}

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
					document.querySelector('.user-name').textContent = `${user.firstName} ${user.lastName} ${
						user.username ? `(${user.username})` : ''
					}`
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

		// Dodanie obsługi edycji pól profilu
		document.querySelectorAll('.user-data[contenteditable="true"]').forEach(field => {
			field.addEventListener('blur', handleProfileUpdate)
		})

		function handleProfileUpdate(event) {
			const field = event.target
			const fieldName = field.getAttribute('data-field')
			const originalValue = field.getAttribute('data-original-value') || ''
			const fieldValue = field.textContent.trim()

			if (originalValue === fieldValue) {
				return // Jeśli wartość się nie zmieniła, nie wysyłaj żądania
			}

			fetch('/api/profile', {
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
					} else {
						alert('Profil zaktualizowany pomyślnie')
						field.setAttribute('data-original-value', fieldValue) // Zaktualizuj oryginalną wartość
					}
				})
				.catch(error => {
					console.error('Error updating profile:', error)
					alert('Błąd podczas aktualizacji profilu.')
				})
		}

		document.querySelectorAll('.user-data[contenteditable="true"]').forEach(field => {
			field.setAttribute('data-original-value', field.textContent.trim()) // Ustawienie oryginalnej wartości przy załadowaniu strony
			field.addEventListener('blur', handleProfileUpdate)
		})

		// Dodanie obsługi zmiany hasła
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

			fetch('/api/change-password', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
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

		loadUserProfile()
	}

	addElementsBtn.addEventListener('click', loadAddElements)
	listElementsBtn.addEventListener('click', loadListElements)
	userProfileBtn.addEventListener('click', loadUserProfile)

	// Domyślnie załaduj profil użytkownika po załadowaniu strony
	loadUserProfile()

	// Attach deleteItem and makeEditable functions to the window object to make them accessible
	window.deleteItem = deleteItem
	window.makeEditable = makeEditable
})
