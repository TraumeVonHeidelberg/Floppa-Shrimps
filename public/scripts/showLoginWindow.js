document.addEventListener('DOMContentLoaded', function () {
	const modal = document.getElementById('modal')
	const btn = document.getElementById('login-icon')
	const closeBtn = document.getElementById('close-login')

	btn.onclick = function () {
		modal.style.display = 'flex'
	}

	closeBtn.onclick = function () {
		modal.style.display = 'none'
	}

	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = 'none'
		}
	}
})
