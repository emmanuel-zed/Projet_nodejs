const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prenom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true
  },
  telephone: {
    type: String,
    required: [true, 'Le telephone est requis'],
    trim: true
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['client', 'vendeur', 'admin'],
    default: 'client'
  },
  photo: {
    type: String,
    default: '/images/default-avatar.png'
  },
  adresse: {
    commune: String,
    ville: { type: String, default: 'Abidjan' },
    details: String
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 12);
  next();
});

userSchema.methods.compareMotDePasse = async function(candidat) {
  return await bcrypt.compare(candidat, this.motDePasse);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.motDePasse;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
