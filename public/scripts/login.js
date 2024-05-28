document.querySelector('.login-btn').addEventListener('click', function(event) {
    event.preventDefault();

    const email = document.querySelector('.login-input[type="email"]').value;
    const password = document.querySelector('.login-input[type="password"]').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.errors) {
            alert(data.errors.map(error => error.msg).join('\n'));
        } else {
            alert(data.msg);
            if (data.msg === 'Zalogowano pomyślnie') {
                window.location.href = '/admin';
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Wystąpił błąd podczas logowania.');
    });
});
