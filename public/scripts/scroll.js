//Prosta funkcja która ustala offset przy klikaniu linków w nawigacji

document.addEventListener('DOMContentLoaded', function () {
	// Pobierz wszystkie elementy pasujące do selektorów
	const links = document.querySelectorAll('.main-nav-list li a, .section-link')

	// Konwertuj NodeList na tablicę
	const linksArray = Array.prototype.slice.call(links)

	// Usuń pierwszy element z tablicy (pierwszy .main-nav-list li a)
	linksArray.shift()

	// Dodaj zdarzenie 'click' do pozostałych elementów w tablicy
	linksArray.forEach(link => {
		link.addEventListener('click', function (e) {
			e.preventDefault()
			const targetId = this.getAttribute('href').substring(1)
			const targetElement = document.getElementById(targetId)
			const offset = 164 // Dodatkowa wysokość by nie przewijać równo na początek sekcji

			window.scrollTo({
				top: targetElement.offsetTop - offset,
				behavior: 'smooth',
			})
		})
	})
})
