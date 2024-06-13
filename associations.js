const Reservation = require('./models/reservation')
const Table = require('./models/table')
const User = require('./models/user')
const News = require('./models/news')
const NewsHeaderText = require('./models/newsHeaderText')
const Comment = require('./models/comment')
const MenuItem = require('./models/menuItem')
const Testimonial = require('./models/testimonial')

// Asocjacje dla User i Reservation
User.hasMany(Reservation, { foreignKey: 'userId', as: 'userReservations' })
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// Asocjacje dla Table i Reservation
Table.hasMany(Reservation, { foreignKey: 'tableId', as: 'tableReservations' })
Reservation.belongsTo(Table, { foreignKey: 'tableId', as: 'table' })

// Asocjacje dla News i User
User.hasMany(News, { foreignKey: 'userId', as: 'createdNews' })
News.belongsTo(User, { foreignKey: 'userId', as: 'author' })

// Asocjacje dla News i NewsHeaderText z opcją CASCADE
News.hasMany(NewsHeaderText, { foreignKey: 'newsId', as: 'headers', onDelete: 'CASCADE' })
NewsHeaderText.belongsTo(News, { foreignKey: 'newsId', as: 'news' })

// Asocjacje dla Comment
User.hasMany(Comment, { foreignKey: 'userId', as: 'userComments' })
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' })

News.hasMany(Comment, { foreignKey: 'newsId', as: 'newsComments' })
Comment.belongsTo(News, { foreignKey: 'newsId' })

// Asocjacje dla MenuItem i User
User.hasMany(MenuItem, { foreignKey: 'userId', as: 'menuItems' })
MenuItem.belongsTo(User, { foreignKey: 'userId', as: 'creator' })

// Asocjacje dla Testimonial i User
User.hasMany(Testimonial, { foreignKey: 'userId', as: 'testimonials' })
Testimonial.belongsTo(User, { foreignKey: 'userId', as: 'creator' })
