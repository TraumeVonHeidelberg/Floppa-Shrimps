const Reservation = require('./models/reservation');
const Table = require('./models/table');
const User = require('./models/user');

User.hasMany(Reservation, { foreignKey: 'userId', as: 'userReservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'reservationUser' });

Table.hasMany(Reservation, { foreignKey: 'tableId', as: 'tableReservations' });
Reservation.belongsTo(Table, { foreignKey: 'tableId', as: 'reservationTable' });
