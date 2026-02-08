require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Boutique = require('./models/Boutique');
const Produit = require('./models/Produit');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecte pour le seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Boutique.deleteMany({});
    await Produit.deleteMany({});

    // Create demo vendor
    const vendeur = await User.create({
      nom: 'Kouame',
      prenom: 'Marie',
      email: 'marie@saveurs-ci.com',
      telephone: '+225 07 08 09 10 11',
      motDePasse: 'password123',
      role: 'vendeur',
      adresse: { commune: 'Cocody', ville: 'Abidjan' }
    });

    // Create demo client
    await User.create({
      nom: 'Traore',
      prenom: 'Amadou',
      email: 'amadou@email.com',
      telephone: '+225 05 06 07 08 09',
      motDePasse: 'password123',
      role: 'client',
      adresse: { commune: 'Marcory', ville: 'Abidjan' }
    });

    // Create second vendor
    const vendeur2 = await User.create({
      nom: 'Bamba',
      prenom: 'Fatou',
      email: 'fatou@saveurs-ci.com',
      telephone: '+225 01 02 03 04 05',
      motDePasse: 'password123',
      role: 'vendeur',
      adresse: { commune: 'Yopougon', ville: 'Abidjan' }
    });

    // Create boutiques
    const boutique1 = await Boutique.create({
      vendeur: vendeur._id,
      nom: 'Les Delices de Marie',
      description: 'Patisserie artisanale haut de gamme. Specialiste des gateaux personnalises pour vos evenements : mariages, anniversaires, baptemes. Chaque creation est unique et preparee avec des ingredients de qualite.',
      specialite: 'patisserie',
      localisation: { commune: 'Cocody', ville: 'Abidjan', details: 'Riviera 3, pres du supermarche' },
      telephone: '+225 07 08 09 10 11',
      horaires: 'Lun-Sam: 8h-19h',
      livraison: { disponible: true, frais: 3000, zones: ['Cocody', 'Plateau', 'Marcory'] },
      noteGlobale: 4.5,
      nombreAvis: 12,
      verifie: true
    });

    const boutique2 = await Boutique.create({
      vendeur: vendeur2._id,
      nom: 'Chez Fatou Traiteur',
      description: 'Traiteur specialisee dans la cuisine ivoirienne authentique. Service traiteur pour mariages, baptemes, dots et evenements d\'entreprise. Plus de 10 ans d\'experience.',
      specialite: 'traiteur',
      localisation: { commune: 'Yopougon', ville: 'Abidjan', details: 'Quartier Millionnaire' },
      telephone: '+225 01 02 03 04 05',
      horaires: 'Lun-Dim: 7h-20h',
      livraison: { disponible: true, frais: 5000, zones: ['Yopougon', 'Adjame', 'Abobo'] },
      noteGlobale: 4.8,
      nombreAvis: 25,
      verifie: true
    });

    // Products for boutique 1
    const produits1 = [
      {
        boutique: boutique1._id, vendeur: vendeur._id,
        titre: 'Gateau Anniversaire 3 Etages - Theme Princesse',
        description: 'Magnifique gateau de 3 etages decore sur le theme princesse. Genoise vanille, creme au beurre, fondant rose et or. Personnalisation du prenom incluse. Ideal pour les petites filles de 3 a 10 ans.',
        prix: 35000, categorie: 'gateau_anniversaire',
        nombreParts: 30, delaiPreparation: 3,
        modeRecuperation: { retrait: true, livraison: true },
        disponible: true, nombreCommandes: 45
      },
      {
        boutique: boutique1._id, vendeur: vendeur._id,
        titre: 'Wedding Cake Elegant - 5 Etages',
        description: 'Wedding cake classique et elegant de 5 etages. Decoration en fondant blanc, fleurs en sucre, details dores. Saveur au choix : vanille, chocolat ou red velvet.',
        prix: 150000, categorie: 'wedding_cake',
        nombreParts: 100, delaiPreparation: 5,
        modeRecuperation: { retrait: true, livraison: true },
        disponible: true, nombreCommandes: 20
      },
      {
        boutique: boutique1._id, vendeur: vendeur._id,
        titre: 'Box de 12 Cupcakes Assortis',
        description: 'Assortiment de 12 cupcakes avec differents parfums : vanille, chocolat, fraise, citron. Decoration soignee au buttercream. Parfait pour les gouters et celebrations.',
        prix: 15000, categorie: 'cupcakes',
        delaiPreparation: 1,
        modeRecuperation: { retrait: true, livraison: true },
        disponible: true, nombreCommandes: 80
      },
      {
        boutique: boutique1._id, vendeur: vendeur._id,
        titre: 'Gateau de Bapteme - Decoration Ange',
        description: 'Gateau special bapteme avec decoration ange et nuages. 2 etages, genoise chocolat et vanille. Inclut prenom et date du bapteme.',
        prix: 45000, categorie: 'gateau_bapteme',
        nombreParts: 40, delaiPreparation: 3,
        modeRecuperation: { retrait: true, livraison: true },
        disponible: true, nombreCommandes: 15
      },
      {
        boutique: boutique1._id, vendeur: vendeur._id,
        titre: 'Macarons Coffret de 24',
        description: 'Coffret de 24 macarons artisanaux. Parfums : pistache, framboise, chocolat, caramel, passion, cafe. Emballage cadeau elegant inclus.',
        prix: 20000, categorie: 'macarons',
        delaiPreparation: 2,
        modeRecuperation: { retrait: true, livraison: false },
        disponible: true, nombreCommandes: 35
      }
    ];

    // Products for boutique 2
    const produits2 = [
      {
        boutique: boutique2._id, vendeur: vendeur2._id,
        titre: 'Forfait Traiteur Mariage - 100 Personnes',
        description: 'Service traiteur complet pour mariage de 100 personnes. Menu : entree (salade composee), plat (poulet braise + attieke + alloco), dessert (fruits + patisseries). Inclut vaisselle et service.',
        prix: 500000, categorie: 'traiteur_mariage',
        nombreParts: 100, delaiPreparation: 7,
        modeRecuperation: { retrait: false, livraison: true },
        disponible: true, nombreCommandes: 30
      },
      {
        boutique: boutique2._id, vendeur: vendeur2._id,
        titre: 'Attieke Poisson Braise - Plat Complet',
        description: 'Authentique attieke avec poisson braise (thon ou carpe), accompagne d\'alloco et de sauce tomate. Portion genereuse pour une personne. Le gout de la Cote d\'Ivoire !',
        prix: 3500, categorie: 'plat_ivoirien',
        delaiPreparation: 0,
        modeRecuperation: { retrait: true, livraison: true },
        disponible: true, nombreCommandes: 200
      },
      {
        boutique: boutique2._id, vendeur: vendeur2._id,
        titre: 'Kedjenou de Poulet - Grand Format',
        description: 'Kedjenou de poulet fermier mijoté avec legumes frais. Servi avec du riz blanc parfume ou du foutou banane. Grand format pour 4-5 personnes.',
        prix: 12000, categorie: 'plat_ivoirien',
        nombreParts: 5, delaiPreparation: 1,
        modeRecuperation: { retrait: true, livraison: true },
        disponible: true, nombreCommandes: 90
      },
      {
        boutique: boutique2._id, vendeur: vendeur2._id,
        titre: 'Jus de Bissap Frais - 2 Litres',
        description: 'Jus de bissap (hibiscus) fait maison, legerement sucre avec une touche de menthe et gingembre. Rafraichissant et naturel. Bouteille de 2 litres.',
        prix: 2500, categorie: 'bissap',
        delaiPreparation: 0,
        modeRecuperation: { retrait: true, livraison: true },
        disponible: true, nombreCommandes: 150
      },
      {
        boutique: boutique2._id, vendeur: vendeur2._id,
        titre: 'Forfait Dot Traditionnelle - 50 Personnes',
        description: 'Forfait traiteur pour ceremonie de dot. Menu traditionnel : poulet, poisson, riz, attieke, sauce graine, alloco. Service complet avec vaisselle.',
        prix: 250000, categorie: 'traiteur_dot',
        nombreParts: 50, delaiPreparation: 5,
        modeRecuperation: { retrait: false, livraison: true },
        disponible: true, nombreCommandes: 15
      }
    ];

    await Produit.insertMany([...produits1, ...produits2]);

    console.log('Seeding termine avec succes !');
    console.log('');
    console.log('Comptes de demo :');
    console.log('  Vendeur 1 : marie@saveurs-ci.com / password123');
    console.log('  Vendeur 2 : fatou@saveurs-ci.com / password123');
    console.log('  Client    : amadou@email.com / password123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Erreur de seeding:', error);
    process.exit(1);
  }
};

seedDB();
