const mongoose = require('mongoose');

const panierSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  articles: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boutique',
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    options: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Panier', panierSchema);
