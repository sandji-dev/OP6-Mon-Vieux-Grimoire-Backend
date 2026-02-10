// On importe bcrypt pour hacher et comparer les mots de passe
const bcrypt = require('bcrypt');

// On importe jsonwebtoken pour créer des tokens JWT
const jwt = require('jsonwebtoken');

// On importe le modèle User (MongoDB / Mongoose)
const User = require('../models/User');

 //  SIGNUP — Inscription

exports.signup = async (req, res) => {
    try {
        // 1️- On vérifie que le body existe
        if (!req.body) {
            return res.status(400).json({ message: "Body manquant" });
        }
        // 2️- On récupère email et password depuis la requête
        const { email, password } = req.body;

        // 3️- Vérification basique des champs
        if (!email || !password) {
            return res.status(400).json({ message: "Email ou mot de passe manquant" });
        }
         // ✅ Vérification du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "email invalide" });
        }
        // 4️- On hash le mot de passe (10 = niveau de sécurité recommandé)
        const hashedPassword = await bcrypt.hash(password, 10);
        // 5️- On crée un nouvel utilisateur
        const user = new User({
            email: email,
            password: hashedPassword
        });

        // 6️- On sauvegarde l'utilisateur en base de données
        await user.save();

        // 7️- Réponse succès
        res.status(201).json({ message: "Utilisateur créé avec succès !" });

    } catch (error) {
        // 8️- Gestion des erreurs (email déjà utilisé, Mongo, etc.)
        res.status(400).json({ error: error.message });
    }
};
// LOGIN — Connexion

exports.login = async (req, res) => {
    console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);
    try {
        // 1️- On vérifie le body
        if (!req.body) {
            return res.status(400).json({ message: "Body manquant" });
        }

        // 2️- On récupère email et password
        const { email, password } = req.body;

        // 3️- Vérification des champs
        if (!email || !password) {
            return res.status(400).json({ message: "Email ou mot de passe manquant" });
        }
        // 4️- On cherche l'utilisateur dans la base
        const user = await User.findOne({ email: email });

        // 5️- Si l'utilisateur n'existe pas
        if (!user) {
            return res.status(401).json({ message: "Mot de passe ou id incorrect" });
        }

        // 6️- On compare le mot de passe envoyé avec celui en base
        const isValidPassword = await bcrypt.compare(password, user.password);

        // 7️- Si le mot de passe est incorrect
        if (!isValidPassword) {
            return res.status(401).json({ message: "Mot de passe ou id incorrect" });
        }

        // 8- On crée le token JWT
        const token = jwt.sign(
            { userId: user._id },        // payload
            process.env.JWT_SECRET,      // clé secrète
            { expiresIn: '24h' }         // durée de validité
        );

        //9- Réponse succès
        res.status(200).json({
            userId: user._id,
            token: token
        });

    } catch (error) {
        //10- Erreur serveur
        res.status(500).json({ error: error.message });
    }
};
