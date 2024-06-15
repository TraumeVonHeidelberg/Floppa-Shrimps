const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) {
		console.log('No token provided, continuing as unauthenticated user')
		return next()
	}

	jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
		if (err) {
			console.log('Token verification failed:', err.message)
			return next()
		}

		try {
			const dbUser = await User.findByPk(user.userId)
			if (!dbUser) {
				return next()
			}

			req.user = {
				userId: dbUser.id,
				role: dbUser.role,
			}
			console.log('Token verified, user ID:', user.userId, 'role:', dbUser.role)
			next()
		} catch (err) {
			console.log('Error fetching user:', err.message)
			return next()
		}
	})
}

module.exports = authenticateToken
