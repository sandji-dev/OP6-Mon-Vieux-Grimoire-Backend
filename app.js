const express = require('express');
const cors = require('cors');
const path = require('path'); 
const app = express();

// 1️- Middleware CORS
app.use(cors());

// 2️- Middleware JSON
app.use(express.json());

const userRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');

// Gestion de la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// 3️- Routes officielles
app.use("/api/books", booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;