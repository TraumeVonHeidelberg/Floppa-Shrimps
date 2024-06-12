document.addEventListener('DOMContentLoaded', function () {
	const params = new URLSearchParams(window.location.search)
	const newsId = params.get('id')

	if (!newsId) {
		console.error('News ID not found in URL')
		return
	}

	fetch(`http://localhost:3000/api/news/${newsId}`)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok')
			}
			return response.json()
		})
		.then(data => {
			console.log('Fetched news:', data)

			if (!data) {
				console.error('News not found:', data)
				return
			}

			// Update the news header section
			document.getElementById('news-category').textContent = data.category
			document.getElementById('news-title').textContent = data.title
			document.getElementById('news-footer').innerHTML = `${new Date(
				data.createdAt
			).toLocaleDateString()} <span class="avatar-name"><img src="./img/uploads/${
				data.author.profilePicture || 'avatar-example.png'
			}" alt="Avatar użytkownika" class="user-avatar" id="news-author-avatar">${data.author.firstName} ${
				data.author.lastName
			}</span>`

			// Set the background image of the header
			const headerElement = document.querySelector('.main-news-header')
			headerElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('./img/uploads/${
				data.image || 'default-news.jpg'
			}')`

			// Update the main news content
			const newsContent = document.getElementById('news-content')
			newsContent.innerHTML = `
                <article>
                    <p class="common-text">
                        <span class="mark-letter">${data.introText.charAt(0)}</span>${data.introText.slice(1)}
                    </p>
                    ${data.headers
											.map(
												headerText => `
                        <h3 class="section-header section-header-left article-header">${headerText.header}</h3>
                        <p class="common-text">${headerText.text}</p>
                    `
											)
											.join('')}
                    <div class="change-post">
                        <div class="previous-post">
                            <p class="call-to-action-sign">Poprzedni post</p>
                            <p class="change-post-title"><i class="fa-solid fa-arrow-left"></i> <span id="previous-post-title">Tytul Placeholder</span></p>
                        </div>

                        <div class="next-post">
                            <p class="call-to-action-sign">Następny post</p>
                            <p class="change-post-title"><span id="next-post-title">Tytul Placeholder</span> <i class="fa-solid fa-arrow-right"></i></p>
                        </div>
                    </div>

                    <p class="call-to-action-sign">Komentarze</p>

                    <div class="comment-content">
                        <textarea name="" id="" placeholder="Napisz Komentarz"></textarea>
                        <i class="fa-solid fa-chevron-right"></i>
                    </div>
                </article>
                <aside>
                    <div class="search-bar">
                        <p class="search-bar-sign">Wyszukaj</p>
                        <div class="main-search-bar">
                            <input type="text">
                            <button class="search-btn">Szukaj</button>
                        </div>
                    </div>
                    <div class="aside-item">
                        <h3 class="section-header section-header-left">Ostatnie Posty</h3>
                        <a href="">Degustacja Nowego Menu</a>
                        <a href="">Wprowadzenie Nowych Dań</a>
                        <a href="">Promocja Na Dania Z Krewetkami</a>
                        <a href="">Cos1</a>
                        <a href="">Cos2</a>
                    </div>
                    <div class="aside-item">
                        <h3 class="section-header section-header-left">Archiwum</h3>
                        <a href="">Maj 2024</a>
                    </div>
                    <div class="aside-item">
                        <h3 class="section-header section-header-left">Kategorie</h3>
                        <a href="">Wydarzenia Specjalne</a>
                        <a href="">Nowe Dania</a>
                        <a href="">Promocje</a>
                        <a href="">PlaceHolder</a>
                    </div>
                </aside>
            `

			// Fetch and update previous post
			fetch(`http://localhost:3000/api/news/${newsId}/previous`)
				.then(response => response.json())
				.then(previousData => {
					if (previousData) {
						document.getElementById('previous-post-title').textContent = previousData.title
						document.querySelector('.previous-post').addEventListener('click', () => {
							window.location.href = `full-news.html?id=${previousData.id}`
						})
					}
				})
				.catch(error => console.error('Error fetching previous news:', error))

			// Fetch and update next post
			fetch(`http://localhost:3000/api/news/${newsId}/next`)
				.then(response => response.json())
				.then(nextData => {
					if (nextData) {
						document.getElementById('next-post-title').textContent = nextData.title
						document.querySelector('.next-post').addEventListener('click', () => {
							window.location.href = `full-news.html?id=${nextData.id}`
						})
					}
				})
				.catch(error => console.error('Error fetching next news:', error))
		})
		.catch(error => console.error('Error fetching news:', error))
})
