document.addEventListener('DOMContentLoaded', function () {
    const reservationForm = document.getElementById('reservation-form');
    const firstNameField = document.getElementById('firstNameField');
    const lastNameField = document.getElementById('lastNameField');
    const emailField = document.getElementById('emailField');
    const reservationDate = document.getElementById('reservation-date');
    const timeSelect = document.getElementById('time');

    const openingHours = {
        weekday: { start: 8, end: 22 },
        weekend: { start: 12, end: 24 }
    };

    function populateTimeOptions(dayOfWeek) {
        timeSelect.innerHTML = '';

        let startHour, endHour;
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Poniedziałek - Piątek
            startHour = openingHours.weekday.start;
            endHour = openingHours.weekday.end;
        } else {
            // Sobota - Niedziela
            startHour = openingHours.weekend.start;
            endHour = openingHours.weekend.end;
        }

        for (let hour = startHour; hour < endHour; hour++) {
            const hourFormatted = hour.toString().padStart(2, '0');
            timeSelect.appendChild(new Option(`${hourFormatted}:00`, `${hourFormatted}:00`));
            timeSelect.appendChild(new Option(`${hourFormatted}:30`, `${hourFormatted}:30`));
        }
    }

    reservationDate.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const dayOfWeek = selectedDate.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
        populateTimeOptions(dayOfWeek);
    });

    // Initial population based on today's date
    const today = new Date();
    populateTimeOptions(today.getUTCDay());

    reservationForm.addEventListener('submit', function (event) {
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

        console.log('Token:', token);
        console.log('Reservation data before sending:', reservationData);

        fetch('/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify(reservationData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
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
