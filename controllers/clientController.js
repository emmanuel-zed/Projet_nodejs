const Boutique = require('../models/Boutique');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const Panier = require('../models/Panier');
const Avis = require('../models/Avis');

// GET / - Page d'accueil
exports.accueil = async (req, res) => {
  try {
    const [boutiquesVedettes, produitsPopulaires, categories] = await Promise.all([
      Boutique.find({ actif: true })
        .sort('-noteGlobale')
        .limit(6),
      Produit.find({ disponible: true })
        .populate('boutique', 'nom slug localisation')
        .sort('-nombreCommandes')
        .limit(8),
      Produit.aggregate([
        { $match: { disponible: true } },
        { $group: { _id: '$categorie', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.render('client/accueil', {
      title: 'Saveurs CI - Marketplace culinaire ivoirienne',
      boutiquesVedettes,
      produitsPopulaires,
      categories
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// GET /explorer
exports.explorer = async (req, res) => {
  try {
    const { categorie, commune, q, prix_min, prix_max, tri } = req.query;
    const filtre = { disponible: true };

    if (categorie) filtre.categorie = categorie;
    if (prix_min || prix_max) {
      filtre.prix = {};
      if (prix_min) filtre.prix.$gte = Number(prix_min);
      if (prix_max) filtre.prix.$lte = Number(prix_max);
    }

    let query;
    if (q) {
      query = Produit.find({ ...filtre, $text: { $search: q } });
    } else {
      query = Produit.find(filtre);
    }

    let sortOption = '-createdAt';
    if (tri === 'prix_asc') sortOption = 'prix';
    else if (tri === 'prix_desc') sortOption = '-prix';
    else if (tri === 'populaire') sortOption = '-nombreCommandes';
    else if (tri === 'note') sortOption = '-noteGlobale';

    const produits = await query
      .populate('boutique', 'nom slug localisation livraison')
      .sort(sortOption);

    // Filter by commune through populated boutique
    const produitsFiltres = commune
      ? produits.filter(p => p.boutique && p.boutique.localisation.commune === commune)
      : produits;

    res.render('client/explorer', {
      title: 'Explorer - Saveurs CI',
      produits: produitsFiltres,
      filtres: { categorie, commune, q, prix_min, prix_max, tri }
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// GET /boutique/:slug
exports.voirBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findOne({ slug: req.params.slug, actif: true })
      .populate('vendeur', 'nom prenom');
    if (!boutique) {
      return res.status(404).render('error', {
        title: 'Boutique non trouvee',
        message: 'Cette boutique n\'existe pas.'
      });
    }

    const [produits, avis] = await Promise.all([
      Produit.find({ boutique: boutique._id, disponible: true }).sort('-createdAt'),
      Avis.find({ boutique: boutique._id })
        .populate('client', 'nom prenom photo')
        .sort('-createdAt')
        .limit(10)
    ]);

    res.render('client/boutique', {
      title: `${boutique.nom} - Saveurs CI`,
      boutique,
      produits,
      avis
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// GET /produit/:id
exports.voirProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id)
      .populate('boutique', 'nom slug localisation livraison telephone horaires vendeur');
    if (!produit) {
      return res.status(404).render('error', {
        title: 'Produit non trouve',
        message: 'Ce produit n\'existe pas.'
      });
    }

    const [autresProduits, avis] = await Promise.all([
      Produit.find({
        boutique: produit.boutique._id,
        _id: { $ne: produit._id },
        disponible: true
      }).limit(4),
      Avis.find({ produit: produit._id })
        .populate('client', 'nom prenom photo')
        .sort('-createdAt')
        .limit(5)
    ]);

    res.render('client/produit', {
      title: `${produit.titre} - Saveurs CI`,
      produit,
      autresProduits,
      avis
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// POST /panier/ajouter
exports.ajouterAuPanier = async (req, res) => {
  try {
    const { produitId, quantite, options } = req.body;
    const produit = await Produit.findById(produitId).populate('boutique');
    if (!produit || !produit.disponible) {
      return res.status(404).json({ error: 'Produit non disponible' });
    }

    let panier = await Panier.findOne({ client: req.user._id });
    if (!panier) {
      panier = new Panier({ client: req.user._id, articles: [] });
    }

    const articleExistant = panier.articles.find(
      a => a.produit.toString() === produitId
    );

    if (articleExistant) {
      articleExistant.quantite = Number(quantite) || articleExistant.quantite + 1;
      if (options) articleExistant.options = options;
    } else {
      panier.articles.push({
        produit: produitId,
        boutique: produit.boutique._id,
        quantite: Number(quantite) || 1,
        options: options || ''
      });
    }

    await panier.save();
    res.redirect('/panier');
  } catch (error) {
    res.redirect('back');
  }
};

// GET /panier
exports.voirPanier = async (req, res) => {
  try {
    const panier = await Panier.findOne({ client: req.user._id })
      .populate({
        path: 'articles.produit',
        select: 'titre prix images boutique delaiPreparation'
      })
      .populate('articles.boutique', 'nom livraison localisation');

    // Group articles by boutique
    const articlesParBoutique = {};
    if (panier && panier.articles) {
      for (const article of panier.articles) {
        if (!article.produit) continue;
        const boutiqueId = article.boutique._id.toString();
        if (!articlesParBoutique[boutiqueId]) {
          articlesParBoutique[boutiqueId] = {
            boutique: article.boutique,
            articles: [],
            sousTotal: 0
          };
        }
        const sousTotal = article.produit.prix * article.quantite;
        articlesParBoutique[boutiqueId].articles.push({
          ...article.toObject(),
          sousTotal
        });
        articlesParBoutique[boutiqueId].sousTotal += sousTotal;
      }
    }

    const total = Object.values(articlesParBoutique)
      .reduce((sum, group) => sum + group.sousTotal, 0);

    res.render('client/panier', {
      title: 'Mon panier - Saveurs CI',
      articlesParBoutique,
      total,
      panierVide: !panier || panier.articles.length === 0
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// POST /panier/supprimer/:produitId
exports.supprimerDuPanier = async (req, res) => {
  try {
    const panier = await Panier.findOne({ client: req.user._id });
    if (panier) {
      panier.articles = panier.articles.filter(
        a => a.produit.toString() !== req.params.produitId
      );
      await panier.save();
    }
    res.redirect('/panier');
  } catch (error) {
    res.redirect('/panier');
  }
};

// GET /commander
exports.pageCommander = async (req, res) => {
  try {
    const panier = await Panier.findOne({ client: req.user._id })
      .populate({
        path: 'articles.produit',
        select: 'titre prix images boutique delaiPreparation'
      })
      .populate('articles.boutique', 'nom livraison localisation');

    if (!panier || panier.articles.length === 0) {
      return res.redirect('/panier');
    }

    // Group articles by boutique
    const articlesParBoutique = {};
    let total = 0;
    for (const article of panier.articles) {
      if (!article.produit) continue;
      const boutiqueId = article.boutique._id.toString();
      if (!articlesParBoutique[boutiqueId]) {
        articlesParBoutique[boutiqueId] = {
          boutique: article.boutique,
          articles: [],
          sousTotal: 0
        };
      }
      const sousTotal = article.produit.prix * article.quantite;
      articlesParBoutique[boutiqueId].articles.push({
        ...article.toObject(),
        sousTotal
      });
      articlesParBoutique[boutiqueId].sousTotal += sousTotal;
      total += sousTotal;
    }

    // Calculate max preparation delay
    let maxDelai = 0;
    for (const article of panier.articles) {
      if (article.produit && article.produit.delaiPreparation > maxDelai) {
        maxDelai = article.produit.delaiPreparation;
      }
    }

    const dateMinRecuperation = new Date();
    dateMinRecuperation.setDate(dateMinRecuperation.getDate() + maxDelai);

    res.render('client/commander', {
      title: 'Commander - Saveurs CI',
      articlesParBoutique,
      total,
      dateMinRecuperation: dateMinRecuperation.toISOString().split('T')[0]
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// POST /commander
exports.passerCommande = async (req, res) => {
  try {
    const { modeRecuperation, dateRecuperation, communeLivraison,
            detailsLivraison, methodePaiement, notes } = req.body;

    const panier = await Panier.findOne({ client: req.user._id })
      .populate({
        path: 'articles.produit',
        select: 'titre prix boutique vendeur'
      })
      .populate('articles.boutique', 'nom livraison vendeur');

    if (!panier || panier.articles.length === 0) {
      return res.redirect('/panier');
    }

    // Group by boutique and create one order per boutique
    const articlesParBoutique = {};
    for (const article of panier.articles) {
      if (!article.produit) continue;
      const boutiqueId = article.boutique._id.toString();
      if (!articlesParBoutique[boutiqueId]) {
        articlesParBoutique[boutiqueId] = {
          boutique: article.boutique,
          articles: []
        };
      }
      articlesParBoutique[boutiqueId].articles.push(article);
    }

    const commandes = [];
    for (const [boutiqueId, group] of Object.entries(articlesParBoutique)) {
      const articles = group.articles.map(a => ({
        produit: a.produit._id,
        titre: a.produit.titre,
        prix: a.produit.prix,
        quantite: a.quantite,
        options: a.options,
        sousTotal: a.produit.prix * a.quantite
      }));

      const montantTotal = articles.reduce((sum, a) => sum + a.sousTotal, 0);
      const fraisLivraison = modeRecuperation === 'livraison'
        ? (group.boutique.livraison?.frais || 0)
        : 0;

      const commande = await Commande.create({
        client: req.user._id,
        boutique: boutiqueId,
        vendeur: group.boutique.vendeur,
        articles,
        montantTotal,
        fraisLivraison,
        montantFinal: montantTotal + fraisLivraison,
        modeRecuperation,
        dateRecuperation: new Date(dateRecuperation),
        adresseLivraison: modeRecuperation === 'livraison'
          ? { commune: communeLivraison, details: detailsLivraison }
          : undefined,
        paiement: {
          methode: methodePaiement,
          reference: 'PAY-' + Date.now().toString(36).toUpperCase()
        },
        notes,
        historique: [{
          statut: 'en_attente',
          commentaire: 'Commande passee'
        }]
      });

      // Update product order counts
      for (const article of articles) {
        await Produit.findByIdAndUpdate(article.produit, {
          $inc: { nombreCommandes: article.quantite }
        });
      }

      commandes.push(commande);

      // Notify vendor via socket
      const io = req.app.get('io');
      if (io) {
        io.to(`vendeur_${group.boutique.vendeur}`).emit('notification', {
          type: 'nouvelle_commande',
          message: `Nouvelle commande #${commande.numero}`,
          commandeId: commande._id
        });
      }
    }

    // Clear cart
    await Panier.findOneAndDelete({ client: req.user._id });

    res.render('client/confirmation', {
      title: 'Commande confirmee - Saveurs CI',
      commandes
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// GET /mes-commandes
exports.mesCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find({ client: req.user._id })
      .populate('boutique', 'nom slug')
      .populate('articles.produit', 'titre images')
      .sort('-createdAt');

    res.render('client/mes-commandes', {
      title: 'Mes commandes - Saveurs CI',
      commandes
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// GET /commande/:id
exports.voirCommande = async (req, res) => {
  try {
    const commande = await Commande.findOne({
      _id: req.params.id,
      client: req.user._id
    })
      .populate('boutique', 'nom slug localisation telephone')
      .populate('articles.produit', 'titre images prix');

    if (!commande) {
      return res.status(404).render('error', {
        title: 'Commande non trouvee',
        message: 'Cette commande n\'existe pas.'
      });
    }

    res.render('client/commande-detail', {
      title: `Commande ${commande.numero} - Saveurs CI`,
      commande
    });
  } catch (error) {
    res.render('error', { title: 'Erreur', message: error.message });
  }
};

// POST /avis
exports.laisserAvis = async (req, res) => {
  try {
    const { commandeId, note, commentaire } = req.body;

    const commande = await Commande.findOne({
      _id: commandeId,
      client: req.user._id,
      statut: { $in: ['livree', 'recuperee'] }
    });

    if (!commande) {
      return res.redirect('/mes-commandes');
    }

    const avis = await Avis.create({
      client: req.user._id,
      boutique: commande.boutique,
      commande: commandeId,
      note: Number(note),
      commentaire,
      photos: req.files ? req.files.map(f => '/images/uploads/' + f.filename) : []
    });

    // Update boutique rating
    const tousAvis = await Avis.find({ boutique: commande.boutique });
    const noteMoyenne = tousAvis.reduce((sum, a) => sum + a.note, 0) / tousAvis.length;

    await Boutique.findByIdAndUpdate(commande.boutique, {
      noteGlobale: Math.round(noteMoyenne * 10) / 10,
      nombreAvis: tousAvis.length
    });

    res.redirect('/commande/' + commandeId);
  } catch (error) {
    if (error.code === 11000) {
      return res.redirect('/mes-commandes');
    }
    res.redirect('/mes-commandes');
  }
};
