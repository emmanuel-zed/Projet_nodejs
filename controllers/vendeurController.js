const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const Avis = require('../models/Avis');

// GET /vendeur/creer-boutique
exports.pageCreerBoutique = async (req, res) => {
  const boutiqueExistante = await Boutique.findOne({ vendeur: req.user._id });
  if (boutiqueExistante) {
    return res.redirect('/vendeur/tableau-de-bord');
  }
  res.render('vendor/creer-boutique', {
    title: 'Creer ma boutique - Saveurs CI',
    error: null
  });
};

// POST /vendeur/creer-boutique
exports.creerBoutique = async (req, res) => {
  try {
    const { nom, description, specialite, commune, details, telephone, horaires,
            livraisonDisponible, fraisLivraison } = req.body;

    const boutique = await Boutique.create({
      vendeur: req.user._id,
      nom,
      description,
      specialite,
      localisation: { commune, details },
      telephone: telephone || req.user.telephone,
      horaires,
      livraison: {
        disponible: livraisonDisponible === 'on',
        frais: fraisLivraison || 0
      },
      photoProfil: req.files && req.files.photoProfil
        ? '/images/uploads/' + req.files.photoProfil[0].filename
        : '/images/default-shop.png',
      photoBanniere: req.files && req.files.photoBanniere
        ? '/images/uploads/' + req.files.photoBanniere[0].filename
        : '/images/default-banner.png'
    });

    res.redirect('/vendeur/tableau-de-bord');
  } catch (error) {
    res.render('vendor/creer-boutique', {
      title: 'Creer ma boutique - Saveurs CI',
      error: error.message
    });
  }
};

// GET /vendeur/tableau-de-bord
exports.tableauDeBord = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ vendeur: req.user._id });
    if (!boutique) {
      return res.redirect('/vendeur/creer-boutique');
    }

    const [produits, commandesRecentes, stats] = await Promise.all([
      Produit.find({ boutique: boutique._id }).sort('-createdAt').limit(5),
      Commande.find({ vendeur: req.user._id })
        .populate('client', 'nom prenom telephone')
        .sort('-createdAt')
        .limit(10),
      Commande.aggregate([
        { $match: { vendeur: req.user._id } },
        {
          $group: {
            _id: '$statut',
            count: { $sum: 1 },
            total: { $sum: '$montantFinal' }
          }
        }
      ])
    ]);

    const totalVentes = stats.reduce((acc, s) => {
      if (['livree', 'recuperee'].includes(s._id)) return acc + s.total;
      return acc;
    }, 0);

    const commandesEnAttente = stats.find(s => s._id === 'en_attente')?.count || 0;
    const commandesEnPrep = stats.find(s => s._id === 'en_preparation')?.count || 0;

    res.render('vendor/tableau-de-bord', {
      title: 'Tableau de bord - Saveurs CI',
      boutique,
      produits,
      commandesRecentes,
      totalVentes,
      commandesEnAttente,
      commandesEnPrep,
      totalProduits: await Produit.countDocuments({ boutique: boutique._id })
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// GET /vendeur/produits
exports.listeProduits = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ vendeur: req.user._id });
    if (!boutique) return res.redirect('/vendeur/creer-boutique');

    const produits = await Produit.find({ boutique: boutique._id }).sort('-createdAt');
    res.render('vendor/produits', {
      title: 'Mes produits - Saveurs CI',
      produits,
      boutique
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// GET /vendeur/produits/ajouter
exports.pageAjouterProduit = async (req, res) => {
  const boutique = await Boutique.findOne({ vendeur: req.user._id });
  if (!boutique) return res.redirect('/vendeur/creer-boutique');

  res.render('vendor/ajouter-produit', {
    title: 'Ajouter un produit - Saveurs CI',
    boutique,
    error: null
  });
};

// POST /vendeur/produits/ajouter
exports.ajouterProduit = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ vendeur: req.user._id });
    if (!boutique) return res.redirect('/vendeur/creer-boutique');

    const { titre, description, prix, categorie, nombreParts, delaiPreparation,
            retrait, livraison } = req.body;

    const images = req.files ? req.files.map(f => '/images/uploads/' + f.filename) : [];

    await Produit.create({
      boutique: boutique._id,
      vendeur: req.user._id,
      titre,
      description,
      prix,
      categorie,
      nombreParts: nombreParts || undefined,
      delaiPreparation,
      images,
      modeRecuperation: {
        retrait: retrait === 'on' || retrait === 'true',
        livraison: livraison === 'on' || livraison === 'true'
      }
    });

    res.redirect('/vendeur/produits');
  } catch (error) {
    const boutique = await Boutique.findOne({ vendeur: req.user._id });
    res.render('vendor/ajouter-produit', {
      title: 'Ajouter un produit - Saveurs CI',
      boutique,
      error: error.message
    });
  }
};

// GET /vendeur/produits/:id/modifier
exports.pageModifierProduit = async (req, res) => {
  try {
    const produit = await Produit.findOne({
      _id: req.params.id,
      vendeur: req.user._id
    });
    if (!produit) return res.redirect('/vendeur/produits');

    const boutique = await Boutique.findOne({ vendeur: req.user._id });

    res.render('vendor/modifier-produit', {
      title: 'Modifier produit - Saveurs CI',
      produit,
      boutique,
      error: null
    });
  } catch (error) {
    res.redirect('/vendeur/produits');
  }
};

// POST /vendeur/produits/:id/modifier
exports.modifierProduit = async (req, res) => {
  try {
    const { titre, description, prix, categorie, nombreParts, delaiPreparation,
            retrait, livraison, disponible } = req.body;

    const update = {
      titre, description, prix, categorie,
      nombreParts: nombreParts || undefined,
      delaiPreparation,
      disponible: disponible === 'on',
      modeRecuperation: {
        retrait: retrait === 'on' || retrait === 'true',
        livraison: livraison === 'on' || livraison === 'true'
      }
    };

    if (req.files && req.files.length > 0) {
      update.images = req.files.map(f => '/images/uploads/' + f.filename);
    }

    await Produit.findOneAndUpdate(
      { _id: req.params.id, vendeur: req.user._id },
      update
    );

    res.redirect('/vendeur/produits');
  } catch (error) {
    res.redirect('/vendeur/produits/' + req.params.id + '/modifier');
  }
};

// POST /vendeur/produits/:id/supprimer
exports.supprimerProduit = async (req, res) => {
  await Produit.findOneAndDelete({ _id: req.params.id, vendeur: req.user._id });
  res.redirect('/vendeur/produits');
};

// GET /vendeur/commandes
exports.listeCommandes = async (req, res) => {
  try {
    const filtre = { vendeur: req.user._id };
    if (req.query.statut) filtre.statut = req.query.statut;

    const commandes = await Commande.find(filtre)
      .populate('client', 'nom prenom telephone email')
      .populate('articles.produit', 'titre images')
      .sort('-createdAt');

    res.render('vendor/commandes', {
      title: 'Mes commandes - Saveurs CI',
      commandes,
      statutFiltre: req.query.statut || 'toutes'
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// POST /vendeur/commandes/:id/statut
exports.changerStatutCommande = async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findOne({
      _id: req.params.id,
      vendeur: req.user._id
    });

    if (!commande) return res.redirect('/vendeur/commandes');

    commande.statut = statut;
    commande.historique.push({
      statut,
      commentaire: req.body.commentaire || ''
    });

    if (statut === 'confirmee') {
      commande.paiement.statut = 'confirme';
    }

    await commande.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`commande_${commande._id}`).emit('statutCommande', {
        commandeId: commande._id,
        statut,
        numero: commande.numero
      });
      io.to(`client_${commande.client}`).emit('notification', {
        type: 'commande',
        message: `Votre commande ${commande.numero} est maintenant: ${statut.replace('_', ' ')}`,
        commandeId: commande._id
      });
    }

    res.redirect('/vendeur/commandes');
  } catch (error) {
    res.redirect('/vendeur/commandes');
  }
};

// GET /vendeur/boutique/modifier
exports.pageModifierBoutique = async (req, res) => {
  const boutique = await Boutique.findOne({ vendeur: req.user._id });
  if (!boutique) return res.redirect('/vendeur/creer-boutique');

  res.render('vendor/modifier-boutique', {
    title: 'Modifier ma boutique - Saveurs CI',
    boutique,
    error: null
  });
};

// POST /vendeur/boutique/modifier
exports.modifierBoutique = async (req, res) => {
  try {
    const { nom, description, specialite, commune, details, telephone, horaires,
            livraisonDisponible, fraisLivraison } = req.body;

    const update = {
      nom, description, specialite,
      localisation: { commune, details },
      telephone, horaires,
      livraison: {
        disponible: livraisonDisponible === 'on',
        frais: fraisLivraison || 0
      }
    };

    if (req.files && req.files.photoProfil) {
      update.photoProfil = '/images/uploads/' + req.files.photoProfil[0].filename;
    }
    if (req.files && req.files.photoBanniere) {
      update.photoBanniere = '/images/uploads/' + req.files.photoBanniere[0].filename;
    }

    await Boutique.findOneAndUpdate({ vendeur: req.user._id }, update);
    res.redirect('/vendeur/tableau-de-bord');
  } catch (error) {
    const boutique = await Boutique.findOne({ vendeur: req.user._id });
    res.render('vendor/modifier-boutique', {
      title: 'Modifier ma boutique - Saveurs CI',
      boutique,
      error: error.message
    });
  }
};
