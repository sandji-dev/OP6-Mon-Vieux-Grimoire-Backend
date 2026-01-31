const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/users');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/test', (req, res) => {
    res.json({ message: 'users route OK' });
});

module.exports = router;
