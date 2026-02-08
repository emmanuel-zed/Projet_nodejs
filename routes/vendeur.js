const express = require('express');
const router = express.Router();
const vendeurController = require('../controllers/vendeurController');
const { authentifier, autoriser } = require('../middleware/auth');
const upload = require('../config/multer');

// All vendor routes require auth + vendor role
router.use(authentifier, autoriser('vendeur', 'admin'));

// Boutique
router.get('/creer-boutique', vendeurController.pageCreerBoutique);
router.post('/creer-boutique', upload.fields([
  { name: 'photoProfil', maxCount: 1 },
  { name: 'photoBanniere', maxCount: 1 }
]), vendeurController.creerBoutique);

router.get('/boutique/modifier', vendeurController.pageModifierBoutique);
router.post('/boutique/modifier', upload.fields([
  { name: 'photoProfil', maxCount: 1 },
  { name: 'photoBanniere', maxCount: 1 }
]), vendeurController.modifierBoutique);

// Dashboard
router.get('/tableau-de-bord', vendeurController.tableauDeBord);

// Products
router.get('/produits', vendeurController.listeProduits);
router.get('/produits/ajouter', vendeurController.pageAjouterProduit);
router.post('/produits/ajouter', upload.array('images', 5), vendeurController.ajouterProduit);
router.get('/produits/:id/modifier', vendeurController.pageModifierProduit);
router.post('/produits/:id/modifier', upload.array('images', 5), vendeurController.modifierProduit);
router.post('/produits/:id/supprimer', vendeurController.supprimerProduit);

// Orders
router.get('/commandes', vendeurController.listeCommandes);
router.post('/commandes/:id/statut', vendeurController.changerStatutCommande);

module.exports = router;
