const router  = require('express').Router();
const db      = require('../data/db');
const { verifyToken, isVendor } = require('../middleware/auth');

// GET /api/products — liste filtrée + paginée
router.get('/', (req, res) => {
  const { cat, minPrice, maxPrice, sizes, colors, sort, page = 1, limit = 12, search } = req.query;
  let list = db.products.findAll().filter(p => p.isActive);

  if (cat)      list = list.filter(p => p.category === cat);
  if (search)   list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.includes(search.toLowerCase()));
  if (minPrice) list = list.filter(p => (p.salePrice || p.price) >= Number(minPrice));
  if (maxPrice) list = list.filter(p => (p.salePrice || p.price) <= Number(maxPrice));
  if (sizes)    list = list.filter(p => sizes.split(',').some(s => p.sizes.includes(s)));
  if (colors)   list = list.filter(p => colors.split(',').some(c => p.colors.some(pc => pc.toLowerCase().includes(c.toLowerCase()))));

  if (sort === 'price-asc')  list.sort((a,b) => (a.salePrice||a.price) - (b.salePrice||b.price));
  if (sort === 'price-desc') list.sort((a,b) => (b.salePrice||b.price) - (a.salePrice||a.price));
  if (sort === 'new')        list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === 'popular')    list.sort((a,b) => b.reviewCount - a.reviewCount);
  if (sort === 'rating')     list.sort((a,b) => b.rating - a.rating);

  const total = list.length;
  const start = (Number(page) - 1) * Number(limit);
  const items = list.slice(start, start + Number(limit));

  // Attach vendor info
  const enriched = items.map(p => {
    const vendor = db.users.findById(p.vendorId);
    return { ...p, vendor: vendor ? { id:vendor.id, storeName:vendor.storeName, storeCity:vendor.storeCity, rating:vendor.rating } : null };
  });

  res.json({ success:true, total, page:Number(page), limit:Number(limit), pages:Math.ceil(total/Number(limit)), products:enriched });
});

// GET /api/products/featured
router.get('/featured', (req, res) => {
  const list = db.products.findAll().filter(p => p.isActive && p.isFeatured).slice(0, 8);
  res.json({ success:true, products: list });
});

// GET /api/products/new
router.get('/new', (req, res) => {
  const list = db.products.findAll()
    .filter(p => p.isActive && p.isNew)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);
  res.json({ success:true, products: list });
});

// GET /api/products/vendor/:vendorId
router.get('/vendor/:vendorId', (req, res) => {
  const list = db.products.findByVendor(req.params.vendorId);
  res.json({ success:true, products: list });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const p = db.products.findById(req.params.id);
  if (!p || !p.isActive) return res.status(404).json({ success:false, message:'Produit introuvable' });
  const vendor  = db.users.findById(p.vendorId);
  const reviews = db.reviews.findByProduct(p.id);
  res.json({ success:true, product:{
    ...p,
    vendor: vendor ? { id:vendor.id, storeName:vendor.storeName, storeCity:vendor.storeCity, storeAddress:vendor.storeAddress, rating:vendor.rating, totalSales:vendor.totalSales } : null,
    reviews,
  }});
});

// POST /api/products — créer produit (vendeur)
router.post('/', verifyToken, isVendor, (req, res) => {
  const { name, shortDesc, description, price, salePrice, category, colors, sizes, stock, tags } = req.body;
  if (!name || !price || !category) return res.status(422).json({ success:false, message:'Champs requis: name, price, category' });
  const p = db.products.create({
    name, shortDesc, description, price:Number(price),
    salePrice: salePrice ? Number(salePrice) : null,
    category, colors: colors || [], sizes: sizes || [],
    stock: Number(stock) || 0, vendorId: req.user.id,
    rating:0, reviewCount:0, badge:null,
    tags: tags || [], isFeatured:false, isNew:true,
    gradient:'linear-gradient(135deg,#667eea,#764ba2)', emoji:'👗',
  });
  res.status(201).json({ success:true, product:p });
});

// PUT /api/products/:id
router.put('/:id', verifyToken, isVendor, (req, res) => {
  const p = db.products.findById(req.params.id);
  if (!p) return res.status(404).json({ success:false, message:'Produit introuvable' });
  if (p.vendorId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success:false, message:'Non autorisé' });
  const updated = db.products.update(req.params.id, req.body);
  res.json({ success:true, product:updated });
});

// DELETE /api/products/:id — soft delete
router.delete('/:id', verifyToken, isVendor, (req, res) => {
  const p = db.products.findById(req.params.id);
  if (!p) return res.status(404).json({ success:false, message:'Produit introuvable' });
  if (p.vendorId !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success:false, message:'Non autorisé' });
  db.products.delete(req.params.id);
  res.json({ success:true, message:'Produit supprimé' });
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', verifyToken, (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) return res.status(422).json({ success:false, message:'rating et comment requis' });
  const user = db.users.findById(req.user.id);
  const r = db.reviews.create({
    productId: req.params.id, userId: req.user.id,
    userName: `${user.firstName} ${user.lastName[0]}.`,
    rating: Number(rating), comment,
  });
  // Update product rating
  const all = db.reviews.findByProduct(req.params.id);
  const avg = all.reduce((s,rv) => s + rv.rating, 0) / all.length;
  db.products.update(req.params.id, { rating: Math.round(avg*10)/10, reviewCount: all.length });
  res.status(201).json({ success:true, review:r });
});

module.exports = router;
