const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authentifier, authentifierOptionnel } = require('../middleware/auth');
const upload = require('../config/multer');

// Public routes
router.get('/', authentifierOptionnel, clientController.accueil);
router.get('/explorer', authentifierOptionnel, clientController.explorer);
router.get('/boutique/:slug', authentifierOptionnel, clientController.voirBoutique);
router.get('/produit/:id', authentifierOptionnel, clientController.voirProduit);

// Authenticated routes
router.post('/panier/ajouter', authentifier, clientController.ajouterAuPanier);
router.get('/panier', authentifier, clientController.voirPanier);
router.post('/panier/supprimer/:produitId', authentifier, clientController.supprimerDuPanier);

router.get('/commander', authentifier, clientController.pageCommander);
router.post('/commander', authentifier, clientController.passerCommande);

router.get('/mes-commandes', authentifier, clientController.mesCommandes);
router.get('/commande/:id', authentifier, clientController.voirCommande);

router.post('/avis', authentifier, upload.array('photos', 3), clientController.laisserAvis);

module.exports = router;
