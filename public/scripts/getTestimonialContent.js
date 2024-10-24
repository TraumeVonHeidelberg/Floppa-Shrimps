document.addEventListener('DOMContentLoaded', function () {
    const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
    const API_URL = isElectron ? 'http://localhost:3000/api' : '/api';

    fetch(`${API_URL}/testimonials`)
        .then(response => response.json())
        .then(data => {
            const testimonialsContainer = document.querySelector('.testimonials');
            testimonialsContainer.innerHTML = '';
            data.forEach(item => {
                const testimonialItem = `<div class="testimonial">
                                         <blockquote class="testimonial-text">
                                           "${item.text}"
                                         </blockquote>
                                         <p class="testimonial-author">${item.author}</p>
                                         <p class="testimonial-company">${item.company}</p>
                                       </div>`;
                testimonialsContainer.innerHTML += testimonialItem;
            });

            // Po załadowaniu danych, uruchamiamy funkcję zmieniającą opinie
            initializeTestimonials();
        })
        .catch(error => console.error('Error fetching testimonials:', error));
});

/**
 * This function initializes the testimonials section of the page.
 * It first selects all the testimonial elements on the page.
 * It then creates a navigation container for the bullet points.
 * It sets the initial index to 0 and initializes an interval variable.
 * 
 * The next function, createBullets(), creates bullet points for each testimonial.
 * It loops through all the testimonials and creates a new span element for each.
 * It adds a click event listener to each span that updates the current index,
 * changes the active testimonial, and resets the interval.
 * 
 * The changeTestimonial() function changes the active testimonial and bullet point.
 * It hides all the testimonials and clears the active bullet points.
 * It then shows the current testimonial and sets the current bullet point to active.
 * It updates the current index to the next testimonial.
 * 
 * The resetInterval() function resets the interval to a new interval that changes the testimonial.
 * 
 * Finally, the function calls createBullets(), changes the first testimonial, and resets the interval.
 */
function initializeTestimonials() {
    // Select all the testimonial elements on the page
    const testimonials = document.querySelectorAll('.testimonial');
    // Create a navigation container for the bullet points
    const navContainer = document.querySelector('.testimonial-nav');
    // Set the initial index to 0
    let currentIndex = 0;
    // Initialize an interval variable
    let interval;

    // Function to create bullet points for each testimonial
    function createBullets() {
        // Loop through all the testimonials
        for (let i = 0; i < testimonials.length; i++) {
            // Create a new span element for each testimonial
            const span = document.createElement('span');
            // Add a click event listener to each span
            span.addEventListener('click', () => {
                // Update the current index to the clicked testimonial
                currentIndex = i;
                // Change the active testimonial and bullet point
                changeTestimonial();
                // Reset the interval
                resetInterval();
            });
            // Append the new span to the navigation container
            navContainer.appendChild(span);
        }
    }

    // Function to change the active testimonial and bullet point
    function changeTestimonial() {
        // Hide all the testimonials
        testimonials.forEach((testimonial, index) => {
            testimonial.style.display = 'none';
            navContainer.children[index].classList.remove('active-bullet');
        });
        // Show the current testimonial and set the current bullet point to active
        testimonials[currentIndex].style.display = 'block';
        navContainer.children[currentIndex].classList.add('active-bullet');
        // Update the current index to the next testimonial
        currentIndex = (currentIndex + 1) % testimonials.length;
    }

    // Function to reset the interval to a new interval that changes the testimonial
    function resetInterval() {
        // Clear the current interval
        clearInterval(interval);
        // Reset the interval to a new interval that changes the testimonial
        interval = setInterval(changeTestimonial, 8000);
    }

    // Initialize the first testimonial and set the interval
    createBullets();
    changeTestimonial();
    resetInterval();
}
