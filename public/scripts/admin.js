document.addEventListener('DOMContentLoaded', function () {
	//URL_API sluzy do komunikacji z serwerem; czyli w praktyce adres pod ktory wysylane sa rzadania HTTP jak get, post itd.
	const API_URL = window && window.process && window.process.type === 'renderer' ? 'http://localhost:3000/api' : '/api'

	const addElementsBtn = document.getElementById('add-elements-btn')
	const listElementsBtn = document.getElementById('list-elements-btn')
	const reservationsBtn = document.querySelector('aside button:nth-child(4)')
	const userProfileBtn = document.getElementById('user-profile-btn')
	const mainContent = document.getElementById('main-content')

	let originalValue = ''

	//to prosta funkcja aby usuwać klase z przycisków w sidebarze na panelu użytkownika (by nie były podświetlane na żółto)
	function clearActiveClass() {
		document.querySelectorAll('aside button').forEach(button => button.classList.remove('button-active'))
	}

	//prosta funkcja ktora sprawdza czy nowy e-mail wpisany przez uzytkownika jest poprawny
	function validateEmail(email) {
		//regula tworzenia e-maila za pomoca wyrazen regularnych
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		//re.test sprawdza czy email spelnia regule, lowerCase dla spojnosci danych
		return re.test(String(email).toLowerCase())
	}

	//to funkcja ktora modyfikuje cene pozycji w menu by miala wartosci po przecinku (2 miejsca po przecinku)
	function formatPriceInput(input) {
		input.addEventListener('blur', function () {
			let value = parseFloat(input.value)
			if (isNaN(value) || value < 0) {
				value = 0
			}
			input.value = value.toFixed(2)
		})
	}

	//obsluga formularza dodania pozycji menu
	function submitMenuForm(event) {
		//domyslnie przegladarka odswieza strone po wyslaniu formularza, ja temu zapobiegam dla lepszych odczuc uzytkownika
		event.preventDefault()

		//pobranie wartosci z formularza
		const name = document.getElementById('menu-name').value
		const description = document.getElementById('menu-description').value
		const price = document.getElementById('menu-price').value

		//fetch sluzy do wysylania asynchronicznych zapytan HTTP do serwera i asynchroniczne odbieranie odpowiedzi
		//w tym przypadku wysylane jest rzadanie POST sluzace do dodania pozycji menu na adres podany w API_URL
		fetch(`${API_URL}/admin/menu`, {
			method: 'POST',
			//naglowki rzadania
			//typ przesylanych danych jest w formacie json
			//dodatkowo mamy autoryzacje poprzez token JWT dla bezpieczenstwa
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			//dane przeksztalcane sa na format json i dolaczane do rzadania
			body: JSON.stringify({ name, description, price }),
		})
			//sprawdzana jest odpowiedz serwera
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok')
				}
				//jesli odpowiedz jest poprawna przeksztalcana jest na format json
				return response.json()
			})
			.then(data => {
				//informacja ze sie udalo
				alert('Pozycja dodana do menu!')
				//reset formularza gdyby uzytkownik chcial dodac nowa pozycje
				document.getElementById('menu-form').reset()
			})
			//wychwytywanie potencjalnych bledow
			.catch(error => {
				console.error('Error:', error)
				alert('Wystąpił błąd podczas dodawania pozycji do menu.')
			})
	}

	//funkcja obslugujaca wysylanie formularza z opinią (podobna do tej z menu)
	function submitTestimonialForm(event) {
		event.preventDefault()
		const text = document.getElementById('testimonial-text').value
		const author = document.getElementById('testimonial-author').value
		const company = document.getElementById('testimonial-company').value

		fetch(`${API_URL}/admin/testimonial`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
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

	//to funkcja ktora sluzy do dodawania dodatkowych par naglowek-tekst po kliknieciu przycisku
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

		//dodawanie tego html przed przyciskiem
		headersTextsContainer.insertBefore(headerTextContainer, headersTextsContainer.lastElementChild)
	}

	//obsluga formularza do dodawania newsow podobna do tej z menu
	function submitNewsForm(event) {
		event.preventDefault()
		//FormData to obiekt do tworzenia par klucz wartosc
		const formData = new FormData(event.target)
		//zbieranie wszystkich naglowkow newsa
		const headers = Array.from(document.querySelectorAll('.news-header')).map(input => input.value)
		//zbieranie wszystkich tekstow pod naglowkami
		const texts = Array.from(document.querySelectorAll('.news-text')).map(textarea => textarea.value)

		//dodanie do FormData wszystkich naglowkow i tekstow i zamiana ich na format json
		formData.append('headers', JSON.stringify(headers))
		formData.append('texts', JSON.stringify(texts))

		fetch(`${API_URL}/admin/news`, {
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
				//resetowanie formularza
				document.getElementById('news-form').reset()
				const headersTextsContainer = document.getElementById('headers-texts-container')
				while (headersTextsContainer.firstChild && headersTextsContainer.childElementCount > 1) {
					headersTextsContainer.removeChild(headersTextsContainer.firstChild)
				}
				addNewsHeaderText()
				// Zresetowanie wyświetlania nazwy pliku
				document.getElementById('file-name').textContent = 'Brak wybranego pliku'
			})
			.catch(error => {
				console.error('Error:', error)
				alert('Wystąpił błąd podczas dodawania news.')
			})
	}

	//to sluzy do usuwania pozycji
	function deleteItem(type, id) {
		//type jest pobierany dynamicznie zaleznie od elementu np. menu, testimonials, news etc.
		//podobnie jak id
		const url = `${API_URL}/admin/${type}/${id}`
		//identyfikacja elementu do usuniecia
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
				alert(`Pozycja ${type.charAt(0).toUpperCase() + type.slice(1)} usunięta!`)
				element.remove()
			})
			.catch(error => {
				console.error('Error:', error)
				alert(`Wystąpił błąd podczas usuwania ${type}.`)
			})
	}

	// dodawanie event listenera do kazdego przycisku delete (tagu <i> w praktyce)
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

	//funkcja do edycji elementow
	//type: Typ elementu, który ma być edytowany (menu, testimonial, news).
	//id: Identyfikator elementu, który ma być edytowany.
	//field: Pole, które ma być zaktualizowane.
	//value: Nowa wartość dla zaktualizowanego pola.
	//index: (Opcjonalnie) Indeks używany w przypadku edycji pól header lub text dla typu news by wiedziec ktory header badz text jest edytowany
	function editItem(type, id, field, value, index = null) {
		let url
		let data = {}

		if (type === 'menu') {
			url = `${API_URL}/admin/menu/${id}`

			//.trim() zapewnia ze wartosc nie zawiera bialych znakow
			const name = field === 'name' ? value : document.getElementById(`name-${id}`).textContent.trim()
			const description =
				field === 'description' ? value : document.getElementById(`description-${id}`).textContent.trim()
			const price =
				field === 'price'
					? value
					: parseFloat(document.getElementById(`price-${id}`).textContent.replace('zł', '').trim())
			data = { name, description, price }
		} else if (type === 'testimonial') {
			url = `${API_URL}/admin/testimonial/${id}`
			const text = field === 'text' ? value : document.getElementById(`text-${id}`).textContent.trim()
			const author = field === 'author' ? value : document.getElementById(`author-${id}`).textContent.trim()
			const company = field === 'company' ? value : document.getElementById(`company-${id}`).textContent.trim()
			data = { text, author, company }
		} else if (type === 'news') {
			url = `${API_URL}/admin/news/${id}`
			if (field === 'header' || field === 'text') {
				data[field] = value
				data['index'] = index
			} else {
				data[field] = value
			}
		}

		//rzadanie PUT sluzy do aktualizacji istniejacego zasobu
		fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify(data),
		})
			.then(response => {
				if (!response.ok) {
					return response.text().then(text => {
						console.error('Error response text:', text)
						throw new Error('Network response was not ok')
					})
				}
				return response.json()
			})
			.then(data => {
				alert(`Pozycja ${type.charAt(0).toUpperCase() + type.slice(1)} zaktualizowana!`)
				if (field !== 'header' && field !== 'text') {
					document.getElementById(`${field}-${id}`).textContent = data[field]
				}
			})
			.catch(error => {
				console.error('Error:', error)
				alert(`Wystąpił błąd podczas aktualizacji ${type}.`)
			})
	}

	//funkcja czyniąca pola możliwymi do edycji
	function makeEditable(element, type, id, field, index = null) {
		element.addEventListener('click', function () {
			const originalValue = element.textContent.trim() // Zapisanie oryginalnej wartości tekstu
			element.contentEditable = true // Ustawienie elementu jako edytowalny
			element.focus() // Skierowanie focusu na element

			// Funkcja obsługująca zdarzenie "blur"
			function handleBlur() {
				const newValue = element.textContent.trim() // Pobranie nowej wartości tekstu
				if (newValue !== originalValue) {
					// Jeśli nowa wartość różni się od oryginalnej
					editItem(type, id, field, newValue, index) // Wywołanie funkcji aktualizującej dane na serwerze
				}
				element.contentEditable = false // Przywrócenie pierwotnego stanu elementu
				element.removeEventListener('blur', handleBlur) // Usunięcie nasłuchiwania zdarzenia "blur"
				element.removeEventListener('keydown', handleKeydown) // Usunięcie nasłuchiwania zdarzenia "keydown"
			}

			// Funkcja obsługująca zdarzenie "keydown"
			function handleKeydown(event) {
				if (event.key === 'Enter') {
					// Jeśli naciśnięto klawisz "Enter"
					event.preventDefault() // Zablokowanie domyślnego zachowania (np. nowa linia)
					element.blur() // Zakończenie edycji i utrata focusu
				} else if (event.key === 'Escape') {
					// Jeśli naciśnięto klawisz "Escape"
					element.textContent = originalValue // Przywrócenie oryginalnej wartości tekstu
					element.blur() // Zakończenie edycji i utrata focusu
				}
			}

			element.addEventListener('blur', handleBlur) // Dodanie nasłuchiwania zdarzenia "blur"
			element.addEventListener('keydown', handleKeydown) // Dodanie nasłuchiwania zdarzenia "keydown"
		})
	}

	//funkcja umozliwiajaca edycje zdjec
	function makeImageEditable(imageElement, type, id) {
		imageElement.addEventListener('click', function () {
			const fileInput = document.createElement('input')
			fileInput.type = 'file'
			fileInput.accept = 'image/*'
			fileInput.style.display = 'none'

			fileInput.addEventListener('change', function () {
				if (fileInput.files.length > 0) {
					const formData = new FormData()

					//do FormData dodawany jest plik
					formData.append('image', fileInput.files[0])

					fetch(`${API_URL}/admin/news/${id}/image`, {
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

			//wyswietlenie okna dialogowego do wyboru pliku
			fileInput.click()
		})
	}

	//dynamiczne ładowanie formularzy do dodawania elementow
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
				const priceInput = document.getElementById('menu-price')
				formatPriceInput(priceInput)
				document.getElementById('menu-form').addEventListener('submit', submitMenuForm)
			} else if (selectedType === 'testimonial') {
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
				document.getElementById('testimonial-form').addEventListener('submit', submitTestimonialForm)
			} else if (selectedType === 'news') {
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
				document.getElementById('add-header-text-btn').addEventListener('click', addNewsHeaderText)
				document.getElementById('news-form').addEventListener('submit', submitNewsForm)

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

		elementTypeSelect.dispatchEvent(new Event('change'))
	}

	//wylistowanie elementow w panelu admina
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
									<p class="element-text" id="price-${item.id}">${parseFloat(item.price).toFixed(2)} zł</p>
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

		//to jest uzywane by domyslnie wczytywac elementy dla jednej z opcji
		elementListTypeSelect.dispatchEvent(new Event('change'))
	}

	//prosta funkcja ktora tworzy dynamicznie panel uzytkownika
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
		// Pobieranie tokenu z localStorage
		const token = localStorage.getItem('token')
		if (!token) {
			// Jeśli token nie istnieje, przekierowanie na stronę logowania
			window.location.href = '/index.html'
			return
		}

		// Wysyłanie żądania GET do API w celu pobrania informacji o profilu użytkownika
		fetch(`${API_URL}/profile`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`, // Dodanie tokenu do nagłówka autoryzacji
			},
		})
			.then(response => {
				if (!response.ok) {
					// Jeśli odpowiedź nie jest OK, sprawdzamy status
					if (response.status === 401 || response.status === 403) {
						// Jeśli status to 401 lub 403, usuwamy token i przekierowujemy na stronę logowania
						localStorage.removeItem('token')
						window.location.href = '/index.html'
					}
					throw new Error('Network response was not ok')
				}
				return response.json() // Parsowanie odpowiedzi do formatu JSON
			})
			.then(user => {
				// Aktualizacja danych użytkownika w interfejsie użytkownika
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
					field.addEventListener('blur', handleProfileUpdate) // Dodanie event listenera do obsługi aktualizacji profilu
				})

				// Obsługa zmiany zdjęcia profilowego
				document.getElementById('user-profile-picture').addEventListener('click', () => {
					document.getElementById('profile-picture-input').click()
				})

				document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureChange)

				// Obsługa zmiany hasła
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

					// Wysyłanie żądania PUT do API w celu zmiany hasła
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

				// Pokaż opcje administratora, jeśli użytkownik jest administratorem
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

		fetch(`${API_URL}/admin/reservations`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(response => {
				console.log('Response status:', response.status)
				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
						localStorage.removeItem('token')
						window.location.href = '/index.html'
					}
					return response.text().then(text => {
						console.error('Error response text:', text)
						throw new Error('Network response was not ok')
					})
				}
				return response.json()
			})
			.then(reservations => {
				console.log('Reservations:', reservations)
				const reservationsList = document.getElementById('reservations-list')
				if (reservations.length === 0) {
					reservationsList.innerHTML = ''
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
							<i class="fa-regular fa-circle-xmark" aria-hidden="true" onclick="cancelReservation(${reservation.id})"></i>
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
