//jsonwebtoken is used to verify and decode JWT tokens
const jwt = require('jsonwebtoken')
//dotenv is used to get environment variables from .env file
require('dotenv').config()
const User = require('../models/user')

/**
 * Middleware function to authenticate the user using a JWT token.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function authenticateToken(req, res, next) {
	// Get the authorization header from the request
	const authHeader = req.headers['authorization']

	// If no authorization header is present, continue as an unauthenticated user
	if (!authHeader) {
		console.log('No token provided, continuing as unauthenticated user')
		return next()
	}

	// Extract the token from the authorization header
	const token = authHeader && authHeader.split(' ')[1]

	// If no token is present, continue as an unauthenticated user
	if (token == null) return next()

	// Verify the token using the JWT secret
	jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
		if (err) {
			// If token verification fails, continue as an unauthenticated user
			console.log('Token verification failed:', err.message)
			return next()
		}

		try {
			// Find the user in the database based on the user ID in the token
			const dbUser = await User.findByPk(user.userId)

			// If no user is found, continue as an unauthenticated user
			if (!dbUser) {
				return next()
			}

			// Set the authenticated user information in the request object
			req.user = {
				userId: dbUser.id,
				role: dbUser.role,
			}

			// Log the successful token verification
			console.log('Token verified, user ID:', user.userId, 'role:', dbUser.role)

			// Call the next middleware function
			next()

		} catch (err) {
			// If there is an error fetching the user, log the error and continue as an unauthenticated user
			console.log('Error fetching user:', err.message)
			return next()
		}
	})
}

module.exports = authenticateToken
