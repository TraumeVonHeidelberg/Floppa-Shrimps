//Prosta funkcja która dodaje pozycje do wyświetlenia w Menu w index.html
document.addEventListener('DOMContentLoaded', function () {
	fetch('http://localhost:3000/api/menu')
		.then(response => response.json())
		.then(data => {
			const container = document.querySelector('.menu-grid-container')
			container.innerHTML = '' // Czyść kontener przed dodaniem nowych elementów
			data.forEach(item => {
				const formattedPrice = parseFloat(item.price).toFixed(2)
				const card = `<div class="product-card">
                          <p class="product-name">${item.name}</p>
                          <p class="product-with">${item.description}</p>
                          <p class="product-price">${formattedPrice} zł</p>
                        </div>`
				container.innerHTML += card
			})
		})
		.catch(error => console.error('Error:', error))
})
