# 📚 Mon Vieux Grimoire – Backend

Backend de l’application **Mon Vieux Grimoire**, une plateforme de notation de livres.  
Projet réalisé dans le cadre du **Projet 6 OpenClassrooms – Développez le back-end d’un site de notation de livres**.

---

## 🚀 Technologies

- Node.js  
- Express.js  
- MongoDB & Mongoose  
- JWT (jsonwebtoken)  
- bcrypt  
- Multer  
- dotenv  
- cors  
- sharp

---

## 📂 Structure du projet

backend/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── images/
├── app.js
├── server.js
├── .env
├── package.json
└── README.md


## ⚙️ Installation

### 1. Cloner le projet

git clone <url-du-repo>
cd backend
2. Installer les dépendances
npm install
3. Créer le fichier .env

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
PORT=4000
JWT_SECRET=super_secret_key_mon_grimoire

▶️ Lancer le serveur
npm run dev
ou
npm start
Serveur disponible sur :
http://localhost:4000

🔐 Authentification

Inscription

Copier le code
POST /api/auth/signup
json
Copier le code
{
  "email": "user@email.com",
  "password": "password"
}
Connexion
Copier le code
POST /api/auth/login
json
Copier le code
{
  "userId": "...",
  "token": "JWT_TOKEN"
}
Header requis pour les routes protégées :

Copier le code
Authorization: Bearer <token>
📘 API – Livres
GET /api/books → Tous les livres

GET /api/books/:id → Un livre

GET /api/books/bestrating → Top 3 des livres

Créer un livre (protégé)

Copier le code
POST /api/books
Body (form-data) :

image : file

book : JSON string

Modifier un livre (protégé)

Copier le code

PUT /api/books/:id
Supprimer un livre (protégé)

Copier le code
DELETE /api/books/:id
Noter un livre

Copier le code
POST /api/books/:id/rating
json
Copier le code
{
  "userId": "...",
  "rating": 4
}
🖼️ Images
Stockées dans le dossier /images

Accessibles via :


Copier le code
http://localhost:4000/images/nom_image.jpg
🔒 Sécurité
Mots de passe hashés avec bcrypt

Authentification JWT

Routes sensibles protégées

Un utilisateur ne peut noter un livre qu’une seule fois

👤 Auteur
Ricky
Formation Développeur Web – OpenClassrooms