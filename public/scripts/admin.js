document.addEventListener('DOMContentLoaded', function () {
	const addElementsBtn = document.getElementById('add-elements-btn')
	const listElementsBtn = document.getElementById('list-elements-btn')
	const reservationsBtn = document.querySelector('button:nth-child(3)')
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

	function deleteItem(type, id) {
		const url = type === 'menu' ? `/api/menu/${id}` : `/api/testimonials/${id}`
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
				loadListElements() // Reload list after deletion
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
				loadListElements() // Reload list after update
			})
			.catch(error => {
				console.error('Error:', error)
				alert(`Wystąpił błąd podczas aktualizacji ${type === 'menu' ? 'pozycji' : 'testimonialu'}.`)
			})
	}

	function makeEditable(element, type, id, field) {
		element.addEventListener('click', function () {
			const currentValue = element.textContent.trim()
			const input = document.createElement('input')
			input.type = 'text'
			input.value = currentValue
			input.addEventListener('blur', function () {
				const newValue = input.value.trim()
				if (newValue !== currentValue) {
					editItem(type, id, field, newValue)
				}
				element.textContent = newValue || currentValue
			})
			element.textContent = ''
			element.appendChild(input)
			input.focus()
		})
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
							<div class="element">
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
							<div class="element">
								<div class="text-container">
									<p class="element-text main-testimonial" id="text-${item.id}">${item.text}</p>
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
			}
		})

		// Trigger the change event to load the default list
		elementListTypeSelect.dispatchEvent(new Event('change'))
	}

	addElementsBtn.addEventListener('click', loadAddElements)
	listElementsBtn.addEventListener('click', loadListElements)

	// Domyślnie załaduj opcję "Dodaj Elementy" po załadowaniu strony
	loadAddElements()

	// Attach deleteItem and makeEditable functions to the window object to make them accessible
	window.deleteItem = deleteItem
	window.makeEditable = makeEditable
})
