const router = require('express').Router();
const db     = require('../data/db');
const { verifyToken, isVendor } = require('../middleware/auth');

const safeVendor = (u) => ({
  id: u.id, storeName: u.storeName, storeDesc: u.storeDesc,
  storeCity: u.storeCity, storeAddress: u.storeAddress,
  storeSlug: u.storeSlug, rating: u.rating, totalSales: u.totalSales,
  avatar: u.avatar, firstName: u.firstName, lastName: u.lastName,
  phone: u.phone, createdAt: u.createdAt, isActive: u.isActive,
});

// GET /api/vendors
router.get('/', (req, res) => {
  const vendors = db.users.findAll()
    .filter(u => u.role === 'vendor' && u.isActive)
    .map(u => {
      const products  = db.products.findByVendor(u.id);
      const orders    = db.orders.findByVendor(u.id);
      return { ...safeVendor(u), productCount: products.length, orderCount: orders.length };
    });
  res.json({ success:true, vendors });
});

// GET /api/vendors/dashboard/stats — vendeur connecté
router.get('/dashboard/stats', verifyToken, isVendor, (req, res) => {
  const vid      = req.user.id;
  const products = db.products.findByVendor(vid);
  const orders   = db.orders.findByVendor(vid);

  const totalRevenue   = orders.reduce((s,o) => s + o.vendorAmount, 0);
  const monthOrders    = orders.filter(o => new Date(o.createdAt) > new Date(Date.now() - 30*24*3600*1000));
  const monthRevenue   = monthOrders.reduce((s,o) => s + o.vendorAmount, 0);
  const pendingOrders  = orders.filter(o => o.status === 'pending').length;
  const outOfStock     = products.filter(p => p.stock === 0).length;
  const avgRating      = products.length ? (products.reduce((s,p) => s + p.rating, 0) / products.length).toFixed(1) : 0;
  const totalReviews   = products.reduce((s,p) => s + p.reviewCount, 0);

  // Sales last 7 days
  const salesLast7 = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-i);
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString());
    return { date: d.toLocaleDateString('fr-FR',{weekday:'short'}), revenue: dayOrders.reduce((s,o) => s+o.vendorAmount,0), count: dayOrders.length };
  }).reverse();

  res.json({ success:true, stats:{
    totalRevenue, monthRevenue, totalOrders: orders.length, monthOrders: monthOrders.length,
    pendingOrders, productCount: products.length, outOfStock, avgRating, totalReviews, salesLast7,
  }});
});

// GET /api/vendors/:id
router.get('/:id', (req, res) => {
  const u = db.users.findById(req.params.id);
  if (!u || u.role !== 'vendor') return res.status(404).json({ success:false, message:'Vendeur introuvable' });
  const products = db.products.findByVendor(u.id);
  const reviews  = products.flatMap(p => db.reviews.findByProduct(p.id)).slice(0,10);
  res.json({ success:true, vendor:{ ...safeVendor(u), productCount:products.length }, products, reviews });
});

// GET /api/vendors/:id/products
router.get('/:id/products', (req, res) => {
  const list = db.products.findByVendor(req.params.id);
  res.json({ success:true, products:list });
});

// PUT /api/vendors/dashboard — update store settings
router.put('/dashboard', verifyToken, isVendor, (req, res) => {
  const allowed = ['storeName','storeDesc','storeCity','storeAddress','avatar'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const user = db.users.update(req.user.id, updates);
  const { password, ...safe } = user;
  res.json({ success:true, vendor:safe });
});

module.exports = router;
