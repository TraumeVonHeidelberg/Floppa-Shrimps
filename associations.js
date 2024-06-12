const Reservation = require('./models/reservation')
const Table = require('./models/table')
const User = require('./models/user') // Upewnij się, że ten import jest poprawny
const News = require('./models/news')
const NewsHeaderText = require('./models/newsHeaderText')
const Comment = require('./models/comment');

User.hasMany(Reservation, { foreignKey: 'userId', as: 'userReservations' })
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'reservationUser' })

Table.hasMany(Reservation, { foreignKey: 'tableId', as: 'tableReservations' })
Reservation.belongsTo(Table, { foreignKey: 'tableId', as: 'reservationTable' })

// Asocjacje dla News i User
User.hasMany(News, { foreignKey: 'userId', as: 'createdNews' }) // Unikalny alias 'createdNews'
News.belongsTo(User, { foreignKey: 'userId', as: 'author' }) // Unikalny alias 'author'

// Asocjacje dla News i NewsHeaderText z opcją CASCADE
News.hasMany(NewsHeaderText, { foreignKey: 'newsId', as: 'headers', onDelete: 'CASCADE' })
NewsHeaderText.belongsTo(News, { foreignKey: 'newsId', as: 'news' })

// Asocjacje dla Comment
User.hasMany(Comment, { foreignKey: 'userId', as: 'userComments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

News.hasMany(Comment, { foreignKey: 'newsId', as: 'newsComments' });
Comment.belongsTo(News, { foreignKey: 'newsId' });
