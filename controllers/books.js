const Book = require("../models/Book");
const fs = require("fs");

// GET : Récupérer tous les livres
exports.getAllBooks = (req, res) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error })); // Erreur brute
};

// GET : Récupérer un livre spécifique par son ID
exports.getBookById = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) return res.status(404).json({ message: "Livre non trouvé" });
            res.status(200).json(book);
        })
        .catch((error) => res.status(400).json({ error }));
};

// GET : Récupérer les 3 livres les mieux notés (pour la page d'accueil)
exports.getBestRating = (req, res) => {
    Book.find()
        .sort({ averageRating: -1 }) // Tri par note décroissante
        .limit(3) // On n'en prend que 3
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
};

// POST : Créer un nouveau livre
exports.createBook = (req, res) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId; // Sécurité : on ne fait pas confiance au userId du front

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // On utilise l'ID du token (authentification forcée)
        // L'image URL utilise le nom de fichier traité par Multer/Sharp
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        averageRating: bookObject.ratings[0]?.grade || 0
    });

    book.save()
        .then(() => res.status(201).json({ message: "Livre enregistré !" }))
        .catch(error => res.status(400).json({ error }));
};

// PUT : Modifier un livre existant

exports.updateBook = (req, res) => {
    // 1. On cherche d'abord le livre pour vérifier l'identité
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) return res.status(404).json({ message: "Livre non trouvé" });

            // EXIGENCE : Vérifier si l'utilisateur est le propriétaire (403)
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "403: unauthorized request" });
            }

            // --- NOUVELLE LOGIQUE DE NETTOYAGE D'IMAGE ---
            // Si l'utilisateur envoie une nouvelle image, on doit supprimer l'ancienne
            if (req.file) {
                const filename = book.imageUrl.split('/images/')[1]; // On récupère le nom du fichier
                fs.unlink(`images/${filename}`, (err) => {
                    if (err) console.log("Erreur lors de la suppression de l'ancienne image :", err);
                });
            }
            // ----------------------------------------------

            // 2. On prépare l'objet de mise à jour
            const bookObject = req.file ? {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            } : { ...req.body };

            delete bookObject._userId; // Sécurité : empêcher le changement de propriétaire

            // 3. Mise à jour dans la base
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: "Livre modifié !" }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(400).json({ error }));
};

// DELETE : Supprimer un livre et son image
exports.deleteBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) return res.status(404).json({ message: "Livre non trouvé" });
            
            // EXIGENCE : Vérifier si l'utilisateur est le propriétaire (403)
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "403: unauthorized request" });
            }

            // Suppression physique du fichier image du serveur (Green Code / Nettoyage)
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                // Suppression de l'entrée dans la base de données
                Book.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Livre supprimé !" }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// POST : Ajouter une note (Rating)
exports.rateBook = (req, res) => {
    const { rating } = req.body;
    const userId = req.auth.userId; // On prend le userId du token par sécurité

    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: "La note doit être entre 0 et 5." });
    }

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: "Livre non trouvé" });
            }

            // Vérifier si l'utilisateur a déjà noté ce livre
            const alreadyRated = book.ratings.find(r => r.userId === userId);
            if (alreadyRated) {
                return res.status(400).json({ message: "Livre déjà noté" });
            }

            // Ajout de la nouvelle note
            book.ratings.push({ userId, grade: rating });

            // RECALCUL DE LA MOYENNE
            // reduce additionne toutes les notes du tableau
            const totalGrade = book.ratings.reduce((sum, r) => sum + r.grade, 0);
            const average = totalGrade / book.ratings.length;
            // je Stocke le resultat dans la ppté "averageRating" et j'arrondi à une décimale
            book.averageRating = Math.round(average * 10) / 10;

            return book.save();
        })
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
};