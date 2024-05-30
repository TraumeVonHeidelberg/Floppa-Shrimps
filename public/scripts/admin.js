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

    function submitNewsForm(event) {
        event.preventDefault()
        const category = document.getElementById('news-category').value
        const title = document.getElementById('news-title').value
        const introText = document.getElementById('news-intro-text').value
        const headers = document.querySelectorAll('.news-header')
        const texts = document.querySelectorAll('.news-text')

        const content = []
        headers.forEach((header, index) => {
            content.push({
                header: header.value,
                text: texts[index].value
            })
        })

        fetch('/api/news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, title, introText, content }),
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
        const url = type === 'menu' ? `/api/menu/${id}` : type === 'testimonial' ? `/api/testimonials/${id}` : `/api/news/${id}`
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
                alert(`${type === 'menu' ? 'Pozycja' : type === 'testimonial' ? 'Testimonial' : 'News'} usunięty!`)
                element.remove()
            })
            .catch(error => {
                console.error('Error:', error)
                alert(`Wystąpił błąd podczas usuwania ${type === 'menu' ? 'pozycji' : type === 'testimonial' ? 'testimonialu' : 'news'}.`)
            })
    }

    function editItem(type, id, field, value) {
        console.log(`Edit item: type=${type}, id=${id}, field=${field}, value=${value}`)
        const url = type === 'menu' ? `/api/menu/${id}` : type === 'testimonial' ? `/api/testimonials/${id}` : `/api/news/${id}`

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
        } else if (type === 'news') {
            const category = field === 'category' ? value : document.getElementById(`category-${id}`).textContent.trim()
            const title = field === 'title' ? value : document.getElementById(`title-${id}`).textContent.trim()
            const introText = field === 'introText' ? value : document.getElementById(`introText-${id}`).textContent.trim()
            const headers = field === 'headers' ? value : Array.from(document.querySelectorAll(`#headers-${id} .news-header`)).map(header => header.textContent.trim())
            const texts = field === 'texts' ? value : Array.from(document.querySelectorAll(`#texts-${id} .news-text`)).map(text => text.textContent.trim())
            data = { category, title, introText, headers, texts }
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
                alert(`${type === 'menu' ? 'Pozycja' : type === 'testimonial' ? 'Testimonial' : 'News'} zaktualizowany!`)
                // Update the text content without reloading the list
                if (type === 'menu') {
                    if (field === 'name') document.getElementById(`name-${id}`).textContent = data.name
                    if (field === 'description') document.getElementById(`description-${id}`).textContent = data.description
                    if (field === 'price') document.getElementById(`price-${id}`).textContent = `$${data.price.toFixed(2)}`
                } else if (type === 'testimonial') {
                    if (field === 'text') document.getElementById(`text-${id}`).textContent = data.text
                    if (field === 'author') document.getElementById(`author-${id}`).textContent = data.author
                    if (field === 'company') document.getElementById(`company-${id}`).textContent = data.company
                } else if (type === 'news') {
                    if (field === 'category') document.getElementById(`category-${id}`).textContent = data.category
                    if (field === 'title') document.getElementById(`title-${id}`).textContent = data.title
                    if (field === 'introText') document.getElementById(`introText-${id}`).textContent = data.introText
                    if (field === 'headers') {
                        const headers = document.querySelectorAll(`#headers-${id} .news-header`)
                        headers.forEach((header, index) => {
                            header.textContent = data.headers[index]
                        })
                    }
                    if (field === 'texts') {
                        const texts = document.querySelectorAll(`#texts-${id} .news-text`)
                        texts.forEach((text, index) => {
                            text.textContent = data.texts[index]
                        })
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error)
                alert(`Wystąpił błąd podczas aktualizacji ${type === 'menu' ? 'pozycji' : type === 'testimonial' ? 'testimonialu' : 'news'}.`)
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
					<form id="news-form">
						<div class="configuration-item">
							<label for="news-category">Kategoria</label>
							<input type="text" id="news-category" name="category" required>
						</div>
						<div class="configuration-item">
							<label for="news-title">Tytuł</label>
							<input type="text" id="news-title" name="title" required>
						</div>
						<div class="configuration-item">
							<label for="news-intro-text">Wstępny Tekst</label>
							<textarea id="news-intro-text" name="introText" required></textarea>
						</div>
                        <div class="configuration-item">
                            <button type="button" id="add-header-text">Dodaj Nagłówek + Tekst</button>
                        </div>
						<div id="news-content-container"></div>
						<button type="submit">Dodaj</button>
					</form>
				`

                document.getElementById('add-header-text').addEventListener('click', function () {
                    const newsContentContainer = document.getElementById('news-content-container')
                    const headerTextDiv = document.createElement('div')
                    headerTextDiv.classList.add('configuration-item')
                    headerTextDiv.innerHTML = `
						<label for="news-header">Nagłówek</label>
						<input type="text" class="news-header" name="header" required>
						<label for="news-text">Tekst</label>
						<textarea class="news-text" name="text" required></textarea>
					`
                    newsContentContainer.appendChild(headerTextDiv)
                })

                document.getElementById('news-form').addEventListener('submit', submitNewsForm)
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
								<div class="news-headers-texts">
									${item.content.map((content, index) => `
										<p class="element-text news-header" id="header-${item.id}-${index}">${content.header}</p>
										<p class="element-text news-text" id="text-${item.id}-${index}">${content.text}</p>
									`).join('')}
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
                            item.content.forEach((content, index) => {
                                makeEditable(document.getElementById(`header-${item.id}-${index}`), 'news', item.id, 'headers')
                                makeEditable(document.getElementById(`text-${item.id}-${index}`), 'news', item.id, 'texts')
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

    addElementsBtn.addEventListener('click', loadAddElements)
    listElementsBtn.addEventListener('click', loadListElements)

    // Domyślnie załaduj opcję "Dodaj Elementy" po załadowaniu strony
    loadAddElements()

    // Attach deleteItem and makeEditable functions to the window object to make them accessible
    window.deleteItem = deleteItem
    window.makeEditable = makeEditable
})
