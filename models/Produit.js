const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  vendeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titre: {
    type: String,
    required: [true, 'Le titre du produit est requis'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: 2000
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas etre negatif']
  },
  categorie: {
    type: String,
    enum: [
      'gateau_anniversaire', 'wedding_cake', 'gateau_bapteme',
      'cupcakes', 'macarons', 'viennoiseries', 'patisserie_traditionnelle',
      'traiteur_mariage', 'traiteur_bapteme', 'traiteur_entreprise',
      'traiteur_anniversaire', 'traiteur_dot',
      'plat_ivoirien', 'cuisine_internationale', 'plat_dietetique',
      'pain_artisanal', 'sandwich',
      'jus_naturel', 'bissap', 'cocktail',
      'autre'
    ],
    required: true
  },
  images: [{
    type: String
  }],
  options: [{
    nom: String,
    choix: [String],
    supplement: { type: Number, default: 0 }
  }],
  nombreParts: {
    type: Number,
    min: 1
  },
  delaiPreparation: {
    type: Number, // en jours
    required: [true, 'Le delai de preparation est requis'],
    min: 0
  },
  modeRecuperation: {
    retrait: { type: Boolean, default: true },
    livraison: { type: Boolean, default: false }
  },
  disponible: {
    type: Boolean,
    default: true
  },
  enVedette: {
    type: Boolean,
    default: false
  },
  nombreCommandes: {
    type: Number,
    default: 0
  },
  noteGlobale: {
    type: Number,
    default: 0
  },
  nombreAvis: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

produitSchema.index({ boutique: 1 });
produitSchema.index({ categorie: 1 });
produitSchema.index({ prix: 1 });
produitSchema.index({ titre: 'text', description: 'text' });

module.exports = mongoose.model('Produit', produitSchema);
