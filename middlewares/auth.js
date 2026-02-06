const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // On récupère le token après le mot "Bearer"
        const token = req.headers.authorization.split(' ')[1];
        // On le décode
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        // On récupère le userId dedans
        const userId = decodedToken.userId;
        // ON LE RAJOUTE À LA REQUÊTE ! 
        req.auth = { userId: userId };
        
        next(); // On passe à la suite (le contrôleur)
    } catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};
