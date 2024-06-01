const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const authenticateToken = require('../middleware/authenticateToken');
const { Op } = require('sequelize');
const { transporter } = require('./auth'); // Ensure this path is correct
const User = require('../models/user');

// Endpoint do sprawdzania dostępności rezerwacji
router.post('/check-availability', async (req, res) => {
    const { date, time, seats } = req.body;

    try {
        const existingReservations = await Reservation.findAll({
            where: {
                date,
                time,
                seats: {
                    [Op.gte]: seats
                }
            }
        });

        if (existingReservations.length > 0) {
            return res.status(400).json({ error: 'Termin niedostępny. Wybierz inny czas.' });
        }

        res.json({ available: true });
    } catch (err) {
        console.error('Error checking availability:', err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint do dodawania nowej rezerwacji
router.post('/reservations', authenticateToken, async (req, res) => {
    const { date, time, seats, additionalInfo, firstName, lastName, email } = req.body;
    let userId = null;

    if (req.user) {
        userId = req.user.userId;
    }

    try {
        const existingReservations = await Reservation.findAll({
            where: {
                date,
                time,
                seats: {
                    [Op.gte]: seats
                }
            }
        });

        if (existingReservations.length > 0) {
            return res.status(400).json({ error: 'Termin niedostępny. Wybierz inny czas.' });
        }

        const newReservation = await Reservation.create({
            date,
            time,
            seats,
            additionalInfo,
            firstName: userId ? null : firstName,
            lastName: userId ? null : lastName,
            email: userId ? null : email,
            userId
        });

        // Fetch user email if logged in
        let userEmail = email;
        if (userId) {
            const user = await User.findByPk(userId);
            if (user) {
                userEmail = user.email;
            }
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Potwierdzenie rezerwacji',
            text: `Twoja rezerwacja na dzień ${date} o godzinie ${time} została dokonana.`,
            html: `<p>Twoja rezerwacja na dzień ${date} o godzinie ${time} została dokonana.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending reservation confirmation email:', error);
            } else {
                console.log('Reservation confirmation email sent: ' + info.response);
            }
        });

        res.status(201).json(newReservation);
    } catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint do anulowania rezerwacji
router.delete('/reservations/:id', authenticateToken, async (req, res) => {
    const reservationId = req.params.id;

    try {
        const reservation = await Reservation.findByPk(reservationId);
        if (!reservation) {
            return res.status(404).json({ error: 'Rezerwacja nie znaleziona' });
        }

        await reservation.destroy();

        // Fetch user email if logged in
        let userEmail = reservation.email;
        if (reservation.userId) {
            const user = await User.findByPk(reservation.userId);
            if (user) {
                userEmail = user.email;
            }
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Anulowanie rezerwacji',
            text: `Twoja rezerwacja na dzień ${reservation.date} o godzinie ${reservation.time} została anulowana.`,
            html: `<p>Twoja rezerwacja na dzień ${reservation.date} o godzinie ${reservation.time} została anulowana.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending reservation cancellation email:', error);
            } else {
                console.log('Reservation cancellation email sent: ' + info.response);
            }
        });

        res.json({ msg: 'Rezerwacja anulowana' });
    } catch (err) {
        console.error('Error cancelling reservation:', err);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint do pobierania rezerwacji użytkownika
router.get('/reservations', authenticateToken, async (req, res) => {
    try {
        const reservations = await Reservation.findAll({ where: { userId: req.user.userId } });
        console.log('Reservations for user:', reservations); // Logowanie danych rezerwacji
        res.json(reservations);
    } catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
