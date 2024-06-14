//Wyświetlanie skrótów trzech najnowszych newsów w index.html
document.addEventListener('DOMContentLoaded', function () {
	fetch('http://localhost:3000/api/news/latest')
		.then(response => response.json())
		.then(data => {
			console.log('Fetched data:', data) // Dodane logowanie

			if (!Array.isArray(data)) {
				console.error('Data is not an array:', data)
				return
			}

			const container = document.getElementById('news-grid-container')
			container.innerHTML = '' // Czyść kontener przed dodaniem nowych elementów

			data.forEach(item => {
				const newsCard = `
                    <div class="news-card">
                        <p class="news-category">${item.category}</p>
                        <h4 class="news-title">${item.title}</h4>
                        <p class="news-footer">${new Date(
													item.createdAt
												).toLocaleDateString()} <span class="news-author">
                            <img src="./img/uploads/${
															item.author.profilePicture || 'avatar-example.png'
														}" alt="Avatar użytkownika" class="user-avatar">
                            ${item.author.firstName} ${item.author.lastName}
                        </span></p>
                        <img src="./img/uploads/${
													item.image || 'default-news.jpg'
												}" alt="Zdjęcie newsa" class="news-img">
                        <p class="common-text news-text">${item.introText}</p>
                        <a href="full-news.html?id=${item.id}"><button class="main-btn">Dowiedz Się Więcej</button></a>
                    </div>
                `
				container.innerHTML += newsCard
			})
		})
		.catch(error => console.error('Error:', error))
})
