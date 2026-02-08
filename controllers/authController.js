const User = require('../models/User');
const Boutique = require('../models/Boutique');

// GET /auth/inscription
exports.pageInscription = (req, res) => {
  res.render('auth/inscription', {
    title: 'Inscription - Saveurs CI',
    error: null
  });
};

// POST /auth/inscription
exports.inscription = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse, confirmMotDePasse, role, commune } = req.body;

    if (motDePasse !== confirmMotDePasse) {
      return res.render('auth/inscription', {
        title: 'Inscription - Saveurs CI',
        error: 'Les mots de passe ne correspondent pas',
        body: req.body
      });
    }

    const existant = await User.findOne({ email });
    if (existant) {
      return res.render('auth/inscription', {
        title: 'Inscription - Saveurs CI',
        error: 'Cet email est deja utilise',
        body: req.body
      });
    }

    const user = await User.create({
      nom,
      prenom,
      email,
      telephone,
      motDePasse,
      role: role || 'client',
      adresse: { commune }
    });

    req.session.userId = user._id;
    req.session.save(() => {
      if (user.role === 'vendeur') {
        return res.redirect('/vendeur/creer-boutique');
      }
      res.redirect('/');
    });
  } catch (error) {
    res.render('auth/inscription', {
      title: 'Inscription - Saveurs CI',
      error: error.message,
      body: req.body
    });
  }
};

// GET /auth/connexion
exports.pageConnexion = (req, res) => {
  res.render('auth/connexion', {
    title: 'Connexion - Saveurs CI',
    error: null
  });
};

// POST /auth/connexion
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/connexion', {
        title: 'Connexion - Saveurs CI',
        error: 'Email ou mot de passe incorrect',
        body: req.body
      });
    }

    const valide = await user.compareMotDePasse(motDePasse);
    if (!valide) {
      return res.render('auth/connexion', {
        title: 'Connexion - Saveurs CI',
        error: 'Email ou mot de passe incorrect',
        body: req.body
      });
    }

    if (!user.actif) {
      return res.render('auth/connexion', {
        title: 'Connexion - Saveurs CI',
        error: 'Votre compte a ete desactive',
        body: req.body
      });
    }

    req.session.userId = user._id;
    req.session.save(() => {
      if (user.role === 'vendeur') {
        return res.redirect('/vendeur/tableau-de-bord');
      }
      res.redirect('/');
    });
  } catch (error) {
    res.render('auth/connexion', {
      title: 'Connexion - Saveurs CI',
      error: 'Erreur lors de la connexion',
      body: req.body
    });
  }
};

// GET /auth/deconnexion
exports.deconnexion = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// GET /auth/profil
exports.pageProfil = async (req, res) => {
  res.render('auth/profil', {
    title: 'Mon Profil - Saveurs CI'
  });
};

// POST /auth/profil
exports.mettreAJourProfil = async (req, res) => {
  try {
    const { nom, prenom, telephone, commune } = req.body;
    const update = { nom, prenom, telephone, adresse: { commune } };

    if (req.file) {
      update.photo = '/images/uploads/' + req.file.filename;
    }

    await User.findByIdAndUpdate(req.user._id, update);
    req.session.save(() => {
      res.redirect('/auth/profil');
    });
  } catch (error) {
    res.render('auth/profil', {
      title: 'Mon Profil - Saveurs CI',
      error: error.message
    });
  }
};
