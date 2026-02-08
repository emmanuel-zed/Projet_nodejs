const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authentifier, redirectSiConnecte } = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/inscription', redirectSiConnecte, authController.pageInscription);
router.post('/inscription', redirectSiConnecte, authController.inscription);

router.get('/connexion', redirectSiConnecte, authController.pageConnexion);
router.post('/connexion', redirectSiConnecte, authController.connexion);

router.get('/deconnexion', authController.deconnexion);

router.get('/profil', authentifier, authController.pageProfil);
router.post('/profil', authentifier, upload.single('photo'), authController.mettreAJourProfil);

module.exports = router;
