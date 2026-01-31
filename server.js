const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connexion à MongoDB réussie');
        const server = http.createServer(app);
        
        // Gestion des erreurs de serveur (ex: port déjà utilisé)
        server.on('error', (error) => {
            console.error('Erreur serveur:', error);
        });

        server.listen(PORT, () => {
            console.log(`Serveur démarré sur http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Connexion à MongoDB échouée', error.message);
    });