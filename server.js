require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const vendeurRoutes = require('./routes/vendeur');
const clientRoutes = require('./routes/client');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect to DB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Security & parsing
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Make io accessible to routes
app.set('io', io);

// Global template variables
app.use((req, res, next) => {
  res.locals.user = null;
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/vendeur', vendeurRoutes);
app.use('/', clientRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page non trouvee',
    message: 'La page que vous cherchez n\'existe pas.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue.'
  });
});

// Socket.IO
io.on('connection', (socket) => {
  // Join user-specific room for notifications
  socket.on('join', (data) => {
    if (data.userId) {
      socket.join(`client_${data.userId}`);
      socket.join(`vendeur_${data.userId}`);
    }
    if (data.commandeId) {
      socket.join(`commande_${data.commandeId}`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  ========================================
    SAVEURS CI - Marketplace Culinaire
    Serveur demarre sur le port ${PORT}
    http://localhost:${PORT}
  ========================================
  `);
});

module.exports = app;
