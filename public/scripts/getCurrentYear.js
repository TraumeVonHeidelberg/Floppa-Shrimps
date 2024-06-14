//Prosta funkcja która ustawia w stopce aktualny rok
document.addEventListener('DOMContentLoaded', function () {
	const yearElement = document.getElementById('current-year')
	const currentYear = new Date().getFullYear()
	yearElement.textContent = currentYear
})
