const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token from session
const authentifier = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user && user.actif) {
        req.user = user;
        res.locals.user = user;
        return next();
      }
    }
    res.redirect('/auth/connexion');
  } catch (error) {
    res.redirect('/auth/connexion');
  }
};

// Optional auth - sets user if logged in but doesn't block
const authentifierOptionnel = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user && user.actif) {
        req.user = user;
        res.locals.user = user;
      }
    }
  } catch (error) {
    // Continue without auth
  }
  next();
};

// Check role
const autoriser = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        title: 'Acces refuse',
        message: 'Vous n\'avez pas les droits necessaires pour acceder a cette page.'
      });
    }
    next();
  };
};

// Redirect if already logged in
const redirectSiConnecte = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  next();
};

module.exports = { authentifier, authentifierOptionnel, autoriser, redirectSiConnecte };
