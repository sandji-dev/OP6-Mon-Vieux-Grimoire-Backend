// On importe jsonwebtoken
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        //  On récupère le token dans le header Authorization
        const token = req.headers.authorization.split(' ')[1];

        //  On vérifie et décode le token avec la clé secrète
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        //  On récupère l'id de l'utilisateur depuis le token
        const userId = decodedToken.userId;

        //  On ajoute l'userId à la requête
        req.auth = { userId };

        // Tout est OK → on passe à la suite(controllers)
        next();

    } catch (error) {
        // Si le token est absent ou invalide → accès refusé
        res.status(401).json({ error: 'Requête non authentifiée !' });
    }
};
