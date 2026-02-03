const mongoose = require('mongoose');
// On importe le plugin 'unique-validator' pour éviter d'avoir deux utilisateurs avec le même email
const uniqueValidator = require('mongoose-unique-validator');

// Définition de la structure de l'utilisateur
const userSchema = mongoose.Schema({
    
    email: { type: String, required: true, unique: true }, 
    // Le mot de passe sera stocké sous forme de hash (chaîne de caractères)
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

// On exporte ce schéma sous le nom 'User' pour l'utiliser dans nos contrôleurs
module.exports = mongoose.model('User', userSchema);