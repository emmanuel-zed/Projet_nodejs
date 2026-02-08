const mongoose = require('mongoose');
const slugify = require('slugify');

const boutiqueSchema = new mongoose.Schema({
  vendeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom de la boutique est requis'],
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: 1000
  },
  specialite: {
    type: String,
    enum: ['patisserie', 'traiteur', 'cuisine_maison', 'boulangerie', 'boissons', 'autre'],
    required: true
  },
  photoProfil: {
    type: String,
    default: '/images/default-shop.png'
  },
  photoBanniere: {
    type: String,
    default: '/images/default-banner.png'
  },
  localisation: {
    commune: {
      type: String,
      required: [true, 'La commune est requise']
    },
    ville: {
      type: String,
      default: 'Abidjan'
    },
    details: String
  },
  telephone: String,
  horaires: {
    type: String,
    default: 'Lun-Sam: 8h-18h'
  },
  livraison: {
    disponible: { type: Boolean, default: false },
    frais: { type: Number, default: 0 },
    zones: [String]
  },
  noteGlobale: {
    type: Number,
    default: 0
  },
  nombreAvis: {
    type: Number,
    default: 0
  },
  actif: {
    type: Boolean,
    default: true
  },
  verifie: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

boutiqueSchema.virtual('produits', {
  ref: 'Produit',
  localField: '_id',
  foreignField: 'boutique'
});

boutiqueSchema.pre('save', function(next) {
  if (this.isModified('nom')) {
    this.slug = slugify(this.nom, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

boutiqueSchema.index({ specialite: 1 });
boutiqueSchema.index({ 'localisation.commune': 1 });
boutiqueSchema.index({ noteGlobale: -1 });

module.exports = mongoose.model('Boutique', boutiqueSchema);
