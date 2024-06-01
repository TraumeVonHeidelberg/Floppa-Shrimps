document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservation-form');
    const firstNameField = document.getElementById('firstNameField');
    const lastNameField = document.getElementById('lastNameField');
    const emailField = document.getElementById('emailField');

    reservationForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const date = document.getElementById('reservation-date').value;
        const time = document.getElementById('time').value;
        const seats = document.getElementById('seats').value;
        const additionalInfo = document.getElementById('additionalInfo').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;

        // Sprawdzanie, czy użytkownik jest zalogowany
        const token = localStorage.getItem('token');
        let reservationData = { date, time, seats, additionalInfo };

        if (!token) {
            if (!firstName || !lastName || !email) {
                alert('Proszę wypełnić wszystkie pola.');
                return;
            }
            reservationData = { ...reservationData, firstName, lastName, email };
        }

        fetch('/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify(reservationData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Rezerwacja została złożona pomyślnie!');
                reservationForm.reset();
                if (!token) {
                    firstNameField.classList.add('hidden');
                    lastNameField.classList.add('hidden');
                    emailField.classList.add('hidden');
                }
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // Pokazywanie dodatkowych pól dla niezalogowanych użytkowników
    const toggleAdditionalFields = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            firstNameField.classList.remove('hidden');
            lastNameField.classList.remove('hidden');
            emailField.classList.remove('hidden');
        } else {
            firstNameField.classList.add('hidden');
            lastNameField.classList.add('hidden');
            emailField.classList.add('hidden');
        }
    };

    toggleAdditionalFields();
});
