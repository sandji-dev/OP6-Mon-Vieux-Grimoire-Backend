const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/books');
const multer = require("../middlewares/multer-config");
const auth = require('../middlewares/auth');
const sharp = require('../middlewares/sharp-config');

// les routes:

router.get('/', bookCtrl.getAllBooks);
router.get("/bestrating", bookCtrl.getBestRating); 
router.get("/:id", bookCtrl.getBookById);
router.post('/', auth, multer, sharp, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.put("/:id", auth, multer, sharp, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);


module.exports = router;