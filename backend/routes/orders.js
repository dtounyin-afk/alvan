const router = require('express').Router();
const db     = require('../data/db');
const { verifyToken, isVendor } = require('../middleware/auth');

const COMMISSION = 0.10;

const genOrderNumber = () => 'MA-' + String(db.orders.findAll().length + 1).padStart(5,'0');

// POST /api/orders — passer commande
router.post('/', verifyToken, (req, res) => {
  const { items, deliveryOption, deliveryCity, paymentMethod, firstName, lastName, phone, address } = req.body;

  if (!items || !items.length) return res.status(422).json({ success:false, message:'Panier vide' });
  if (!deliveryOption) return res.status(422).json({ success:false, message:'Option de livraison requise' });
  if (!paymentMethod)  return res.status(422).json({ success:false, message:'Méthode de paiement requise' });

  // Validate items & compute prices
  const enrichedItems = [];
  let subtotal = 0;
  for (const item of items) {
    const p = db.products.findById(item.productId);
    if (!p || !p.isActive) return res.status(404).json({ success:false, message:`Produit ${item.productId} introuvable` });
    if (p.stock < item.qty) return res.status(400).json({ success:false, message:`Stock insuffisant pour: ${p.name}` });
    const unitPrice = p.salePrice || p.price;
    subtotal += unitPrice * item.qty;
    enrichedItems.push({ productId:p.id, name:p.name, qty:item.qty, price:unitPrice, size:item.size||'', color:item.color||'', vendorId:p.vendorId });
    // Deduct stock
    db.products.update(p.id, { stock: p.stock - item.qty });
  }

  // Delivery cost
  let deliveryCost = 0;
  if (deliveryOption === 'local')       deliveryCost = 1000;
  if (deliveryOption === 'interurbain') {
    const rate = db.shippingRates[deliveryCity?.toLowerCase()];
    if (!rate) return res.status(400).json({ success:false, message:'Ville de destination invalide' });
    deliveryCost = rate.price;
  }

  const total      = subtotal + deliveryCost;
  const commission = Math.round(subtotal * COMMISSION);
  const vendorAmount = subtotal - commission;

  const order = db.orders.create({
    orderNumber: genOrderNumber(),
    customerId: req.user.id,
    items: enrichedItems,
    deliveryOption, deliveryCity: deliveryCity || '',
    deliveryCost, subtotal, total, commission, vendorAmount,
    paymentMethod, status: 'pending',
    firstName: firstName || '', lastName: lastName || '',
    phone: phone || '', address: address || '',
  });

  res.status(201).json({ success:true, order });
});

// GET /api/orders — commandes du client connecté
router.get('/', verifyToken, (req, res) => {
  const orders = db.orders.findByCustomer(req.user.id)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success:true, orders });
});

// GET /api/orders/vendor — commandes du vendeur
router.get('/vendor', verifyToken, isVendor, (req, res) => {
  const orders = db.orders.findByVendor(req.user.id)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success:true, orders });
});

// GET /api/orders/:id
router.get('/:id', verifyToken, (req, res) => {
  const order = db.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ success:false, message:'Commande introuvable' });
  // Only owner, their vendor, or admin
  const isOwner  = order.customerId === req.user.id;
  const isVendorOrder = order.items.some(i => i.vendorId === req.user.id);
  if (!isOwner && !isVendorOrder && req.user.role !== 'admin')
    return res.status(403).json({ success:false, message:'Non autorisé' });
  res.json({ success:true, order });
});

// PUT /api/orders/:id/status
router.put('/:id/status', verifyToken, isVendor, (req, res) => {
  const { status } = req.body;
  const allowed = ['pending','processing','shipped','delivered','cancelled'];
  if (!allowed.includes(status)) return res.status(422).json({ success:false, message:'Statut invalide' });
  const order = db.orders.findById(req.params.id);
  if (!order) return res.status(404).json({ success:false, message:'Commande introuvable' });
  const isVendorOrder = order.items.some(i => i.vendorId === req.user.id);
  if (!isVendorOrder && req.user.role !== 'admin')
    return res.status(403).json({ success:false, message:'Non autorisé' });
  const updated = db.orders.updateStatus(req.params.id, status);
  res.json({ success:true, order:updated });
});

module.exports = router;
