const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  numero: {
    type: String,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  articles: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    titre: String,
    prix: Number,
    quantite: {
      type: Number,
      required: true,
      min: 1
    },
    options: String,
    sousTotal: Number
  }],
  montantTotal: {
    type: Number,
    required: true
  },
  fraisLivraison: {
    type: Number,
    default: 0
  },
  montantFinal: {
    type: Number,
    required: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'recuperee', 'annulee'],
    default: 'en_attente'
  },
  modeRecuperation: {
    type: String,
    enum: ['retrait', 'livraison'],
    required: true
  },
  adresseLivraison: {
    commune: String,
    details: String
  },
  dateRecuperation: {
    type: Date,
    required: [true, 'La date de recuperation est requise']
  },
  paiement: {
    methode: {
      type: String,
      enum: ['orange_money', 'mtn_money', 'moov_money', 'wave', 'carte_bancaire'],
      required: true
    },
    statut: {
      type: String,
      enum: ['en_attente', 'confirme', 'echoue', 'rembourse'],
      default: 'en_attente'
    },
    reference: String
  },
  notes: String,
  historique: [{
    statut: String,
    date: { type: Date, default: Date.now },
    commentaire: String
  }]
}, {
  timestamps: true
});

commandeSchema.pre('save', function(next) {
  if (!this.numero) {
    const prefix = 'SAV';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.numero = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

commandeSchema.index({ client: 1 });
commandeSchema.index({ vendeur: 1 });
commandeSchema.index({ statut: 1 });
// numero already has unique:true which creates an index

module.exports = mongoose.model('Commande', commandeSchema);
