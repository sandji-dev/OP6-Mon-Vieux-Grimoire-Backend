const Book = require("../models/Book");
const fs = require("fs");

// GET : Récupérer tous les livres
exports.getAllBooks = (req, res) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
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
    delete bookObject._userId; // Sécurité 

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // On utilise l'ID du token 
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
    // 1. On cherche d'abord le livre existant pour vérifier les droits et récupérer l'ancienne image
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // Sécurité : Si le livre n'existe pas
            if (!book) return res.status(404).json({ message: "Livre non trouvé" });

            // Sécurité : Vérifie que celui qui modifie est bien le propriétaire du livre
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "403: unauthorized request" });
            }

            // 2. Préparation des données de mise à jour
            // Si req.file existe, on traite la nouvelle image, sinon on récupère juste le corps de la requête
            const bookObject = req.file ? {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            } : { ...req.body };

            // Sécurité : On supprime le userId venant de la requête pour éviter qu'un malin change le propriétaire
            delete bookObject._userId;

            // 3. Action de mise à jour dans la base de données
            // On utilise l'ID des paramètres pour être sûr de viser le bon livre
            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => {
                    // 4. NETTOYAGE : Si une nouvelle image a été chargée avec succès
                    if (req.file) {
                        // On extrait le nom de l'ANCIENNE image de la base de données
                        const filename = book.imageUrl.split('/images/')[1];
                        // On supprime physiquement l'ancien fichier du serveur
                        fs.unlink(`images/${filename}`, (err) => {
                            if (err) console.log("Note : Ancienne image déjà absente ou erreur de suppression");
                        });
                    }
                    // Réponse finale  après succès de la DB et nettoyage
                    res.status(200).json({ message: "Livre modifié !" });
                })
                .catch(error => res.status(400).json({ error })); // Erreur lors de l'Update
        })
        .catch(error => res.status(500).json({ error })); // Erreur lors du FindOne
};

// DELETE : Supprimer un livre et son image
exports.deleteBook = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) return res.status(404).json({ message: "Livre non trouvé" });
            
            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "403: unauthorized request" });
            }

            const filename = book.imageUrl.split('/images/')[1];

            // 1. On supprime d'abord de la base de données
            Book.deleteOne({ _id: req.params.id })
                .then(() => {
                    // 2. Une fois que c'est fait, on supprime le fichier en arrière-plan
                    fs.unlink(`images/${filename}`, (err) => {
                        if (err) console.error("Erreur suppression fichier:", err);
                        // On répond au client que tout est OK
                        res.status(200).json({ message: "Livre supprimé !" });
                    });
                })
                .catch(error => res.status(400).json({ error }));
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
            // je Stocke le resultat dans "averageRating" et j'arrondi à une décimale
            book.averageRating = Math.round(average * 10) / 10;

            return book.save();
        })
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
};