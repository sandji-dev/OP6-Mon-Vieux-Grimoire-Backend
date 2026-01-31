const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res, next) => {
    // Si aucun fichier n'est envoyé (ex: modification de texte uniquement), on passe au suivant
    if (!req.file) {
        return next();
    }

    try {
        // 1. On définit le nom et le chemin de l'image optimisée
        const name = req.file.filename.split('.')[0];
        const outputName = `${name}_optimized.webp`;
        const outputPath = path.join('images', outputName);

        // 2. Traitement avec Sharp (Green Code)
        await sharp(req.file.path)
            .resize({ width: 400 }) // Redimensionnement
            .webp({ quality: 80 })  // Compression WebP
            .toFile(outputPath);    // Enregistrement

        // 3. Suppression de l'image originale trop lourde
        fs.unlink(req.file.path, (error) => {
            if (error) console.log("Erreur lors de la suppression de l'original :", error);
        });

        // 4. On remplace les données de req.file pour que le contrôleur utilise la nouvelle image
        req.file.filename = outputName;
        req.file.path = outputPath;

        next(); // On passe au contrôleur
    } catch (error) {
        res.status(500).json({ error });
    }
};