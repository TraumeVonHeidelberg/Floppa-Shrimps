document.addEventListener('DOMContentLoaded', function () {
	const params = new URLSearchParams(window.location.search)
	const newsId = params.get('id')

	if (!newsId) {
		console.error('News ID not found in URL')
		return
	}

	/**
	 * Function to update the user interface based on the user's authentication status.
	 *
	 * This function checks if the user is authenticated by retrieving the token
	 * from the local storage. If the token does not exist, it means the user is not
	 * authenticated and the UI elements related to commenting are disabled.
	 *
	 * If the token exists, it means the user is authenticated and the UI elements
	 * related to commenting are enabled.
	 *
	 * @return {void} This function does not return anything.
	 */
	function updateUI() {
		// Retrieve the token from the local storage
		const token = localStorage.getItem('token')

		// Check if the token exists
		if (!token) {
			// If the token does not exist, the user is not authenticated
			// Disable the comment text input field and hide the submit comment button
			document.getElementById('comment-text').disabled = true
			document.getElementById('submit-comment').style.display = 'none'
		} else {
			// If the token exists, the user is authenticated
			// Enable the comment text input field and show the submit comment button
			document.getElementById('comment-text').disabled = false
			document.getElementById('submit-comment').style.display = 'block'
		}
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
                        <textarea name="" id="comment-text" placeholder="Napisz Komentarz" disabled></textarea>
                        <i class="fa-solid fa-chevron-right" id="submit-comment" style="display: none;"></i>
                    </div>
                </article>
                <aside>
                    <div class="aside-item" id="latest-posts">
                        <h3 class="section-header section-header-left">Ostatnie Posty</h3>
                    </div>
                </aside>
                <div class="comment-section"></div>
            `

			// Fetch and update previous post
			fetch(`http://localhost:3000/api/news/${newsId}/previous`)
				.then(response => response.json())
				.then(previousData => {
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

			// Function to fetch comments from the API and display them in the comment section
			function fetchComments() {
				// Check if the user is authenticated, and set the appropriate headers for the API request
				const headers = localStorage.getItem('token')
					? {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
					  }
					: {}

				// Send a GET request to the API to fetch the comments for the current news item
				fetch(`http://localhost:3000/api/news/${newsId}/comments`, { headers })
					.then(response => {
						// If the response is not ok, throw an error
						if (!response.ok) {
							throw new Error('Network response was not ok')
						}
						// Parse the response as JSON and return the comments
						return response.json()
					})
					.then(comments => {
						// Get the comment section element from the DOM
						const commentSection = document.querySelector('.comment-section')
						// Clear the comment section
						commentSection.innerHTML = ''

						// Check if the comments are an array and not empty
						if (!Array.isArray(comments) || comments.length === 0) {
							// If there are no comments, display a message
							commentSection.innerHTML = '<p></p>'
						} else {
							// If there are comments, map each comment to a HTML string
							commentSection.innerHTML = comments
								.map(
									comment => `
                                <div class="comment" data-id="${comment.id}">
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
                                    ${
																			comment.canEdit
																				? `<i class="fa-solid fa-pen edit-comment" data-id="${comment.id}"></i>`
																				: ''
																		}
                                    ${
																			comment.canDelete
																				? `<i class="fa-solid fa-x delete-comment" data-id="${comment.id}"></i>`
																				: ''
																		}
                                </div>
                            `
								)
								// Reverse the order of the comments
								.reverse()
								// Join the HTML strings into a single string
								.join('')

							// Add event listeners to delete buttons
							document.querySelectorAll('.delete-comment').forEach(button => {
								button.addEventListener('click', function () {
									// Get the comment ID from the button's data attribute
									const commentId = this.getAttribute('data-id')
									// Call the deleteComment function with the comment ID
									deleteComment(commentId)
								})
							})

							// Add event listeners to edit buttons
							document.querySelectorAll('.edit-comment').forEach(button => {
								button.addEventListener('click', function () {
									// Get the comment ID from the button's data attribute
									const commentId = this.getAttribute('data-id')
									// Call the editComment function with the comment ID
									editComment(commentId)
								})
							})
						}
					})
					.catch(error => {
						// Log any errors that occur during the API request
						console.error('Error fetching comments:', error)
						// Display an error message in the comment section
						const commentSection = document.querySelector('.comment-section')
						commentSection.innerHTML = '<p>Error loading comments</p>'
					})
			}

			/**
			 * Deletes a comment with the specified ID by making a DELETE request to the
			 * server API.
			 *
			 * @param {string} commentId - The ID of the comment to delete.
			 */
			function deleteComment(commentId) {
				// Construct the URL for the API request
				const url = `http://localhost:3000/api/news/${newsId}/comments/${commentId}`

				// Make a DELETE request to the API
				fetch(url, {
					// Specify the HTTP method
					method: 'DELETE',
					// Include the user's token in the request headers for authentication
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				})
					.then(response => {
						// If the response is not successful, log the error response text
						// and throw an error
						if (!response.ok) {
							return response.text().then(text => {
								console.error('Error response text:', text)
								throw new Error(text)
							})
						}
						// If the response is successful, parse it as JSON
						return response.json()
					})
					.then(() => {
						// Log that the comment was deleted
						console.log(`Comment ${commentId} deleted`)
						// Refresh the comments to update the UI
						fetchComments()
					})
					.catch(error => {
						// Log any errors that occur during the API request
						console.error('Error deleting comment:', error)
					})
			}

			/**
			 * Edit a comment by replacing its text with a textarea for editing,
			 * and adding event listeners to the save and cancel buttons.
			 *
			 * @param {string} commentId - The ID of the comment to edit.
			 */
			function editComment(commentId) {
				// Select the comment div element with the matching ID
				const commentDiv = document.querySelector(`.comment[data-id="${commentId}"]`)
				// Select the element with the class 'main-comment-text' within the comment div
				const commentTextElement = commentDiv.querySelector('.main-comment-text')
				// Get the original text content of the comment
				const originalText = commentTextElement.textContent

				// Replace the comment text with a textarea for editing
				commentTextElement.innerHTML = `
					<textarea class="edit-comment-textarea">${originalText}</textarea>
					<button class="save-comment">Save</button>
					<button class="cancel-edit">Cancel</button>
				`

				// Add event listener to the save button
				commentDiv.querySelector('.save-comment').addEventListener('click', function () {
					// Get the updated text from the textarea
					const updatedText = commentDiv.querySelector('.edit-comment-textarea').value
					// Send a PUT request to update the comment with the new text
					fetch(`http://localhost:3000/api/news/${newsId}/comments/${commentId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
						body: JSON.stringify({ text: updatedText }),
					})
						.then(response => {
							// If the response is not successful, throw an error
							if (!response.ok) {
								throw new Error('Network response was not ok')
							}
							// Parse the response as JSON
							return response.json()
						})
						.then(() => {
							// Log that the comment was updated
							console.log(`Comment ${commentId} updated`)
							// Refresh the comments to update the UI
							fetchComments()
						})
						.catch(error => {
							// Log any errors that occur during the API request
							console.error('Error updating comment:', error)
						})
				})

				// Add event listener to the cancel button
				commentDiv.querySelector('.cancel-edit').addEventListener('click', function () {
					// Restore the original text content of the comment
					commentTextElement.innerHTML = originalText
				})
			}

			// Initial fetch of comments and update UI
			fetchComments()
			updateUI()

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

			// Example login function to demonstrate dynamic UI update
			function login() {
				// Mock login process
				localStorage.setItem('token', 'mock-token')
				updateUI()
				fetchComments()
			}

			// Example logout function to demonstrate dynamic UI update
			function logout() {
				localStorage.removeItem('token')
				updateUI()
				fetchComments()
			}

			// Attach login/logout functions to buttons for demonstration
			document.getElementById('login-btn').addEventListener('click', login)
			document.getElementById('logout-btn').addEventListener('click', logout)
		})
		.catch(error => console.error('Error fetching news:', error))
})
