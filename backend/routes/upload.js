const router = require('express').Router();
const path   = require('path');
const { verifyToken, isVendor } = require('../middleware/auth');
const { uploadProduct, uploadAvatar, uploadLogo } = require('../middleware/upload');

router.post('/product', verifyToken, isVendor, uploadProduct.array('images', 8), (req, res) => {
  if (!req.files || !req.files.length)
    return res.status(400).json({ success:false, message:'Aucun fichier reçu' });
  const urls = req.files.map(f => `/uploads/products/${f.filename}`);
  res.json({ success:true, urls });
});

router.post('/avatar', verifyToken, uploadAvatar.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ success:false, message:'Aucun fichier reçu' });
  res.json({ success:true, url:`/uploads/avatars/${req.file.filename}` });
});

router.post('/logo', verifyToken, isVendor, uploadLogo.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ success:false, message:'Aucun fichier reçu' });
  res.json({ success:true, url:`/uploads/logos/${req.file.filename}` });
});

module.exports = router;
