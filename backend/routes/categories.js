const router = require('express').Router();
const db     = require('../data/db');

router.get('/', (req, res) => {
  const cats = db.categories.findAll().map(c => ({
    ...c,
    productCount: db.products.findAll().filter(p => p.isActive && p.category === c.slug).length,
  }));
  res.json({ success:true, categories:cats });
});

router.get('/shipping-rates', (req, res) => {
  res.json({ success:true, rates: db.shippingRates });
});

module.exports = router;
