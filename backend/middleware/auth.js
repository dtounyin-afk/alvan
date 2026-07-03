const jwt = require('jsonwebtoken');
const db  = require('../data/db');

/**
 * Verify Bearer JWT token and attach user to req.user
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Accès refusé. Token manquant ou malformé.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Fetch fresh user data from db
    const user = db.users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Compte désactivé. Contactez le support.' });
    }

    // Attach user without password
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expiré. Veuillez vous reconnecter.' });
    }
    return res.status(401).json({ success: false, message: 'Token invalide.' });
  }
};

/**
 * Require admin role — must be used after verifyToken
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux administrateurs.',
    });
  }
  next();
};

/**
 * Require vendor or admin role — must be used after verifyToken
 */
const isVendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié.' });
  }
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux vendeurs.',
    });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isVendor };
