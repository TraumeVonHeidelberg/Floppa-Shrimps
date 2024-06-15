//jsonwebtoken is used to verify and decode JWT tokens
const jwt = require('jsonwebtoken')
const User = require('../models/user')

//dotenv is used to get environment variables from .env file
require('dotenv').config()

// This function is a middleware that verifies the JWT token in the request's
// authorization header. If the token is valid, it sets the user's ID and role
// in the request object and calls the next middleware or route handler.
// If the token is invalid or not provided, it sends an appropriate response.

async function authenticateToken(req, res, next) {
  // Extract the token from the authorization header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  // If no token is provided, return a 401 Unauthorized response
  if (token == null) {
    console.log('No token provided')
    return res.sendStatus(401)
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    // If verification fails, return a 403 Forbidden response
    if (err) {
      console.log('Token verification failed:', err.message)
      return res.sendStatus(403)
    }

    try {
      // Find the user with the provided ID
      const userInfo = await User.findByPk(user.userId, {
        attributes: ['id', 'role'], // Retrieve the user's ID and role
      })

      // If the user is not found, return a 404 Not Found response
      if (!userInfo) {
        console.log('User not found')
        return res.sendStatus(404)
      }

      // Set the user's ID and role in the request object
      req.user = {
        userId: userInfo.id,
        role: userInfo.role,
      }
      console.log('Token verified, user ID:', userInfo.id, 'role:', userInfo.role)
      // Call the next middleware or route handler
      next()
    } catch (error) {
      // If there's an error fetching the user, return a 500 Internal Server Error response
      console.error('Error fetching user:', error)
      res.sendStatus(500)
    }
  })
}

module.exports = authenticateToken
