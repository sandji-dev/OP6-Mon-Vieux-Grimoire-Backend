const express = require('express');
const cors = require('cors');
const path = require('path'); // Ajoute cet import
const app = express();

// 1️- Middleware CORS (Remplace avantageusement le bloc manuel)
app.use(cors());

// 2️- Middleware JSON
app.use(express.json());

const userRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');

// Gestion de la ressource images de manière statique
// Utiliser path.join est plus robuste que juste 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

// 3️- Routes
app.use("/api/books", booksRoutes);
app.use('/api/auth', userRoutes);

// 4️- Route test
app.get('/', (req, res) => res.json({ message: 'OK' }));

module.exports = app;