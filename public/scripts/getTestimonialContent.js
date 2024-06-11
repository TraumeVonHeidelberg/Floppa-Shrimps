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

function initializeTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial');
    const navContainer = document.querySelector('.testimonial-nav');
    let currentIndex = 0;
    let interval;

    // Funkcja do tworzenia bullet pointów
    function createBullets() {
        for (let i = 0; i < testimonials.length; i++) {
            const span = document.createElement('span');
            span.addEventListener('click', () => {
                currentIndex = i;
                changeTestimonial();
                resetInterval();
            });
            navContainer.appendChild(span);
        }
    }

    // Funkcja do zmiany aktywnej opinii i bullet pointa
    function changeTestimonial() {
        testimonials.forEach((testimonial, index) => {
            testimonial.style.display = 'none'; // ukrywa wszystkie opinie
            navContainer.children[index].classList.remove('active-bullet');
        });
        testimonials[currentIndex].style.display = 'block';
        navContainer.children[currentIndex].classList.add('active-bullet');
        currentIndex = (currentIndex + 1) % testimonials.length;
    }

    // Funkcja do resetowania interwału
    function resetInterval() {
        clearInterval(interval);
        interval = setInterval(changeTestimonial, 8000); // Resetuje i uruchamia nowy interwał
    }

    // Inicjacja pierwszej opinii i ustawienie interwału
    createBullets();
    changeTestimonial();
    resetInterval(); // Ustawia początkowy interwał
}
