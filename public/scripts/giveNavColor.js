document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.news-nav');
    const scrollOffset = 10; // Liczba pikseli, po której nawigacja zmienia kolor

    window.addEventListener('scroll', function () {
        if (window.scrollY > scrollOffset) {
            nav.classList.add('nav-color');
        } else {
            nav.classList.remove('nav-color');
        }
    });
});