// Cart is managed client-side; this endpoint validates items & pricing
const router = require('express').Router();
const db     = require('../data/db');

// POST /api/cart/validate — validate cart items and return current prices
router.post('/validate', (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(422).json({ success:false, message:'Panier vide' });

  const result = [];
  for (const item of items) {
    const p = db.products.findById(item.productId);
    if (!p || !p.isActive) { result.push({ ...item, valid:false, error:'Produit indisponible' }); continue; }
    if (p.stock < item.qty) { result.push({ ...item, valid:false, error:`Stock insuffisant (${p.stock} dispo)` }); continue; }
    result.push({ ...item, valid:true, currentPrice: p.salePrice || p.price, name:p.name, stock:p.stock });
  }
  res.json({ success:true, items:result });
});

// GET /api/cart/shipping-rates
router.get('/shipping-rates', (req, res) => {
  res.json({ success:true, rates:db.shippingRates });
});

module.exports = router;
