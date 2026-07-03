const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db     = require('../data/db');
const { verifyToken } = require('../middleware/auth');

const sign = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET || 'modaafrik_secret_2025',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const safeUser = (u) => {
  const { password, ...rest } = u;
  return rest;
};

// POST /api/auth/register — client
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('Prénom requis'),
  body('lastName').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
  body('phone').trim().notEmpty().withMessage('Téléphone requis'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { firstName, lastName, email, password, phone } = req.body;
  if (db.users.findByEmail(email))
    return res.status(409).json({ success: false, message: 'Email déjà utilisé' });

  const hashed = bcrypt.hashSync(password, 10);
  const user   = db.users.create({ firstName, lastName, email: email.toLowerCase(), password: hashed, phone, role: 'client', isActive: true, avatar: null });
  const token  = sign(user);
  res.status(201).json({ success: true, token, user: safeUser(user) });
});

// POST /api/auth/register-vendor
router.post('/register-vendor', [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').trim().notEmpty(),
  body('storeName').trim().notEmpty().withMessage('Nom boutique requis'),
  body('storeCity').trim().notEmpty().withMessage('Ville boutique requise'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { firstName, lastName, email, password, phone, storeName, storeCity, storeAddress, storeDesc } = req.body;
  if (db.users.findByEmail(email))
    return res.status(409).json({ success: false, message: 'Email déjà utilisé' });

  const hashed   = bcrypt.hashSync(password, 10);
  const storeSlug = storeName.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  const user = db.users.create({
    firstName, lastName, email: email.toLowerCase(), password: hashed, phone, role: 'vendor', isActive: false,
    storeName, storeCity, storeAddress: storeAddress || '', storeDesc: storeDesc || '',
    storeSlug, rating: 0, totalSales: 0, avatar: null,
  });
  const token = sign(user);
  res.status(201).json({ success: true, token, user: safeUser(user), message: 'Boutique créée, en attente de validation (24h).' });
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  const user = db.users.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Compte désactivé. Contactez le support.' });

  const token = sign(user);
  res.json({ success: true, token, user: safeUser(user) });
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  const user = db.users.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
  res.json({ success: true, user: safeUser(user) });
});

// PUT /api/auth/me
router.put('/me', verifyToken, (req, res) => {
  const allowed = ['firstName','lastName','phone','avatar'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const user = db.users.update(req.user.id, updates);
  res.json({ success: true, user: safeUser(user) });
});

module.exports = router;
