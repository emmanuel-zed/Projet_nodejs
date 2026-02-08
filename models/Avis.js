const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },
  note: {
    type: Number,
    required: [true, 'La note est requise'],
    min: 1,
    max: 5
  },
  commentaire: {
    type: String,
    maxlength: 500
  },
  photos: [String]
}, {
  timestamps: true
});

// One review per order
avisSchema.index({ client: 1, commande: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);
