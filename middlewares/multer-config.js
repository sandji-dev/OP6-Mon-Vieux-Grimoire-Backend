const multer = require('multer');

// On définit les formats acceptés et leur extension
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({
  // 1. Destination du stockage
  destination: (req, file, callback) => {
    callback(null, 'images'); // Le dossier 'images' à la racine de ton projet
  },
  // 2. Création d'un nom de fichier unique
  filename: (req, file, callback) => {
    // On remplace les espaces par des underscores pour éviter les bugs d'URL
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const extension = MIME_TYPES[file.mimetype];
    // On ajoute un timestamp (Date.now()) pour être sûr que le nom est unique
    callback(null, name + Date.now() + '.' + extension);
  }
});

// On exporte le middleware configuré, .single('image') car on attend un seul fichier
module.exports = multer({ storage: storage }).single('image');