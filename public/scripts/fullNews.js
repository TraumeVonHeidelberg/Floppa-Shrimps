document.addEventListener('DOMContentLoaded', function () {
	const params = new URLSearchParams(window.location.search)
	const newsId = params.get('id')

	if (!newsId) {
		console.error('News ID not found in URL')
		return
	}

	// Fetch and display the main news content
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
				data.author?.profilePicture || 'avatar-example.png'
			}" alt="Avatar użytkownika" class="user-avatar" id="news-author-avatar">${data.author?.firstName} ${
				data.author?.lastName
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
                            <p class="change-post-title" id="previous-post-container"><i class="fa-solid fa-arrow-left"></i> <span id="previous-post-title">Tytul Placeholder</span></p>
                        </div>

                        <div class="next-post">
                            <p class="call-to-action-sign">Następny post</p>
                            <p class="change-post-title" id="next-post-container"><span id="next-post-title">Tytul Placeholder</span> <i class="fa-solid fa-arrow-right"></i></p>
                        </div>
                    </div>

                    <p class="call-to-action-sign">Komentarze</p>

                    <div class="comment-content">
                        <textarea name="" id="comment-text" placeholder="Napisz Komentarz"></textarea>
                        <i class="fa-solid fa-chevron-right" id="submit-comment"></i>
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
                    <div class="aside-item" id="latest-posts">
                        <h3 class="section-header section-header-left">Ostatnie Posty</h3>
                    </div>
                    <div class="aside-item">
                        <h3 class="section-header section-header-left">Kategorie</h3>
                        <a href="">Wydarzenia Specjalne</a>
                        <a href="">Nowe Dania</a>
                        <a href="">Promocje</a>
                        <a href="">PlaceHolder</a>
                    </div>
                </aside>
                <div class="comment-section"></div>
            `

			// Fetch and update previous post
			fetch(`http://localhost:3000/api/news/${newsId}/previous`)
				.then(response => response.json())
				.then(previousData => {
					console.log('Fetched previous news:', previousData)
					const previousPostContainer = document.getElementById('previous-post-container')
					if (previousData && previousData.message !== 'No previous news found') {
						document.getElementById('previous-post-title').textContent = previousData.title
						previousPostContainer.addEventListener('click', () => {
							window.location.href = `full-news.html?id=${previousData.id}`
						})
					} else {
						previousPostContainer.style.display = 'none'
					}
				})
				.catch(error => {
					console.error('Error fetching previous news:', error)
					document.getElementById('previous-post-container').style.display = 'none'
				})

			// Fetch and update next post
			fetch(`http://localhost:3000/api/news/${newsId}/next`)
				.then(response => response.json())
				.then(nextData => {
					console.log('Fetched next news:', nextData)
					const nextPostContainer = document.getElementById('next-post-container')
					if (nextData && nextData.message !== 'No next news found') {
						document.getElementById('next-post-title').textContent = nextData.title
						nextPostContainer.addEventListener('click', () => {
							window.location.href = `full-news.html?id=${nextData.id}`
						})
					} else {
						nextPostContainer.style.display = 'none'
					}
				})
				.catch(error => {
					console.error('Error fetching next news:', error)
					document.getElementById('next-post-container').style.display = 'none'
				})

			// Fetch and display latest posts
			fetch(`http://localhost:3000/api/news/latest/5`)
				.then(response => response.json())
				.then(latestData => {
					console.log('Fetched latest news:', latestData)
					const latestPostsContainer = document.getElementById('latest-posts')
					latestData.forEach(item => {
						const postLink = document.createElement('a')
						postLink.href = `full-news.html?id=${item.id}`
						postLink.textContent = item.title
						latestPostsContainer.appendChild(postLink)
					})
				})
				.catch(error => {
					console.error('Error fetching latest news:', error)
				})

			// Fetch and display comments
			function fetchComments() {
				fetch(`http://localhost:3000/api/news/${newsId}/comments`)
					.then(response => response.json())
					.then(comments => {
						console.log('Fetched comments:', comments)
						const commentSection = document.querySelector('.comment-section')
						commentSection.innerHTML = ''
						if (!Array.isArray(comments) || comments.length === 0) {
							commentSection.innerHTML = '<p>Brak komentarzy</p>'
						} else {
							commentSection.innerHTML = comments
								.map(
									comment => `
                                <div class="comment">
                                    <img src="./img/uploads/${
																			comment.author.profilePicture || 'avatar-example.png'
																		}" alt="Avatar użytkownika" class="user-avatar">
                                    <div class="comment-text">
                                        <p><strong>${
																					comment.author.username ||
																					comment.author.firstName + ' ' + comment.author.lastName
																				}</strong></p>
                                        <p class="comment-date">${new Date(comment.createdAt).toLocaleString()}</p>
                                        <p class="main-comment-text">${comment.text}</p>
                                    </div>
                                </div>
                            `
								)
								.join('')
						}
					})
					.catch(error => {
						console.error('Error fetching comments:', error)
						const commentSection = document.querySelector('.comment-section')
						commentSection.innerHTML = '<p>Error loading comments</p>'
					})
			}

			fetchComments()

			// Add comment
			document.getElementById('submit-comment').addEventListener('click', function () {
				const commentText = document.getElementById('comment-text').value
				console.log(`Submitting comment: ${commentText}`)
				fetch(`http://localhost:3000/api/news/${newsId}/comments`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({ text: commentText }),
				})
					.then(response => {
						if (!response.ok) {
							throw new Error('Network response was not ok')
						}
						return response.json()
					})
					.then(comment => {
						console.log('Comment added:', comment)
						// Refresh comments
						fetchComments()
					})
					.catch(error => {
						console.error('Error adding comment:', error)
					})
			})
		})
		.catch(error => console.error('Error fetching news:', error))
})
