const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
        try {
            token = token.split(" ")[1]; // Extraire le token après "Bearer"
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifier le token

            req.user = await User.findById(decoded.id).select('-password'); // Ajouter l'utilisateur au req

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('Auth error:', error);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
