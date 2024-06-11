document.addEventListener('DOMContentLoaded', function () {
    // Ustawienie URL API w zależności od środowiska (Electron vs przeglądarka)
    const API_URL = (window && window.process && window.process.type === 'renderer') ? 'http://localhost:3000/api' : '/api';

    const reservationForm = document.getElementById('reservation-form');
    const firstNameField = document.getElementById('firstNameField');
    const lastNameField = document.getElementById('lastNameField');
    const emailField = document.getElementById('emailField');
    const reservationDate = document.getElementById('reservation-date');
    const timeSelect = document.getElementById('time');
    const seatsSelect = document.getElementById('seats');

    const openingHours = {
        weekday: { start: 8, end: 22 },
        weekend: { start: 12, end: 24 }
    };

    function populateTimeOptions(dayOfWeek, selectedDate) {
        timeSelect.innerHTML = '';

        let startHour, endHour;
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            startHour = openingHours.weekday.start;
            endHour = openingHours.weekday.end;
        } else {
            startHour = openingHours.weekend.start;
            endHour = openingHours.weekend.end;
        }

        const currentDateTime = new Date();
        const isToday = selectedDate.toDateString() === currentDateTime.toDateString();

        for (let hour = startHour; hour < endHour; hour++) {
            const hourFormatted = hour.toString().padStart(2, '0');

            if (isToday && hour < currentDateTime.getHours()) continue;

            timeSelect.appendChild(new Option(`${hourFormatted}:00`, `${hourFormatted}:00`));
            timeSelect.appendChild(new Option(`${hourFormatted}:30`, `${hourFormatted}:30`));
        }

        if (isToday) {
            const remainingMinutes = currentDateTime.getMinutes();
            const nextHalfHour = Math.ceil(remainingMinutes / 30) * 30;

            if (nextHalfHour < 60) {
                const nextHourFormatted = currentDateTime.getHours().toString().padStart(2, '0');
                const nextMinutesFormatted = nextHalfHour.toString().padStart(2, '0');

                for (const option of timeSelect.options) {
                    if (parseInt(option.value.split(':')[0]) === currentDateTime.getHours() &&
                        parseInt(option.value.split(':')[1]) < nextHalfHour) {
                        option.remove();
                    }
                }
            }
        }
    }

    async function fetchMaxSeats() {
        try {
            const response = await fetch(`${API_URL}/tables/max-seats`);
            if (response.ok) {
                const data = await response.json();
                return data.maxSeats;
            } else {
                throw new Error('Error fetching max seats');
            }
        } catch (error) {
            console.error('Error:', error);
            return 10;
        }
    }

    async function populateSeatsOptions() {
        const maxSeats = await fetchMaxSeats();
        seatsSelect.innerHTML = '';

        for (let i = 1; i <= maxSeats; i++) {
            const option = new Option(i, i);
            if (i === 2) {
                option.selected = true;
            }
            seatsSelect.appendChild(option);
        }
    }

    const today = new Date();
    reservationDate.min = today.toISOString().split('T')[0];

    reservationDate.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const dayOfWeek = selectedDate.getUTCDay();
        populateTimeOptions(dayOfWeek, selectedDate);
    });

    populateTimeOptions(today.getUTCDay(), today);
    populateSeatsOptions();

    reservationForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const date = reservationDate.value;
        const time = timeSelect.value;
        const seats = seatsSelect.value;
        const additionalInfo = document.getElementById('additionalInfo').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;

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

        fetch(`${API_URL}/reservations`, {
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
                seatsSelect.value = '2';
            }
        })
        .catch(error => console.error('Error:', error));
    });

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

    // Nasłuchiwanie na zdarzenia logowania i wylogowania
    window.addEventListener('storage', (event) => {
        if (event.key === 'token') {
            toggleAdditionalFields();
        }
    });

    // Nasłuchiwanie na zdarzenia logowania przy użyciu niestandardowego zdarzenia
    document.addEventListener('userLoggedIn', toggleAdditionalFields);

    // Sprawdzenie, czy użytkownik jest zalogowany na początku
    toggleAdditionalFields();
});
