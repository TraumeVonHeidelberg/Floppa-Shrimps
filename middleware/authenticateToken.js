//W tym kodzie dokonuje weryfikacji tokenów JWT, które wykorzystuję do autoryzacji i uwierzytelniania użytkowników np. rejestracja, logowanie

//biblioteka do generowania i weryfikowania JWT
const jwt = require('jsonwebtoken')
//dotenv sluzy do importowania zmiennych srodowiskowych z pliku .env
require('dotenv').config()

function authenticateToken(req, res, next) {
	//pobranie naglowka autoryzacji z rzadania HTTP
	const authHeader = req.headers['authorization']
	//pobranie drugiej czesci naglowka czyli wlasciwy token JWT (zwykle w formacie Bearer <token>)
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) {
		console.log('No token provided')
		return res.sendStatus(401)
	}

	//weryfikacja tokenu uzywajac zmiennej z pliku .env
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			console.log('Token verification failed:', err.message)
			return res.sendStatus(403)
		}

		//jesli werfykacja sie powiedzie do obiektu req.user przypisywane jest userId wykorzystywane np. w logowaniu
		req.user = {
			userId: user.userId,
		}
		console.log('Token verified, user ID:', user.userId)
		//next w razie potrzeby kontynuowalo by przetwarzanie rzadan w kolejnych middleware
		next()
	})
}

module.exports = authenticateToken
