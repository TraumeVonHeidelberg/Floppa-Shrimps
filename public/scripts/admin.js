document.addEventListener('DOMContentLoaded', function () {
	const addElementsBtn = document.getElementById('add-elements-btn')
	const listElementsBtn = document.querySelector('button:nth-child(2)')
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
			.then(response => response.json())
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
			.then(response => response.json())
			.then(data => {
				alert('Testimonial dodany!')
				document.getElementById('testimonial-form').reset()
			})
			.catch(error => {
				console.error('Error:', error)
				alert('Wystąpił błąd podczas dodawania testimonialu.')
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

	addElementsBtn.addEventListener('click', loadAddElements)

	// Domyślnie załaduj opcję "Dodaj Elementy" po załadowaniu strony
	loadAddElements()
})
