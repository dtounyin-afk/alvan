// ============================================================
// ModaAfrik — Persistance JSON sur fichier
// Remplace la base en mémoire par des fichiers JSON persistants
// ============================================================
const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'json');

// Créer le dossier data/json si inexistant
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(name) { return path.join(DATA_DIR, name + '.json'); }

function read(name, defaultVal = []) {
  try {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) return defaultVal;
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch { return defaultVal; }
}

function write(name, data) {
  try { fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8'); }
  catch (e) { console.error('[Store] write error:', name, e.message); }
}

// ── Collections ──────────────────────────────────────────────
// Initialiser avec valeurs vides si premiers démarrage
const Store = {
  // Users (admin par défaut)
  users: {
    findAll:    ()     => read('users', []),
    findById:   (id)   => read('users', []).find(u => u.id === id),
    findByEmail:(email)=> read('users', []).find(u => u.email === email?.toLowerCase()),
    create:     (data) => {
      const users = read('users', []);
      const u = { ...data, createdAt: new Date().toISOString() };
      users.push(u); write('users', users); return u;
    },
    update: (id, data) => {
      const users = read('users', []);
      const i = users.findIndex(u => u.id === id);
      if (i < 0) return null;
      users[i] = { ...users[i], ...data };
      write('users', users); return users[i];
    },
    delete: (id) => {
      write('users', read('users', []).filter(u => u.id !== id));
    },
  },

  // Products
  products: {
    findAll:      ()       => read('products', []),
    findById:     (id)     => read('products', []).find(p => p.id === id),
    findByVendor: (vid)    => read('products', []).filter(p => p.vendorId === vid && p.isActive),
    create: (data) => {
      const products = read('products', []);
      const p = { ...data, createdAt: new Date().toISOString(), isActive: true };
      products.unshift(p); write('products', products); return p;
    },
    update: (id, data) => {
      const products = read('products', []);
      const i = products.findIndex(p => p.id === id);
      if (i < 0) return null;
      products[i] = { ...products[i], ...data };
      write('products', products); return products[i];
    },
    delete: (id) => {
      const products = read('products', []);
      const i = products.findIndex(p => p.id === id);
      if (i >= 0) { products[i].isActive = false; write('products', products); }
    },
  },

  // Orders
  orders: {
    findAll:       ()    => read('orders', []),
    findById:      (id)  => read('orders', []).find(o => o.id === id),
    findByCustomer:(cid) => read('orders', []).filter(o => o.customerId === cid),
    findByVendor:  (vid) => read('orders', []).filter(o => o.items?.some(i => i.vendorId === vid)),
    create: (data) => {
      const orders = read('orders', []);
      const o = { ...data, createdAt: new Date().toISOString() };
      orders.unshift(o); write('orders', orders); return o;
    },
    updateStatus: (id, status) => {
      const orders = read('orders', []);
      const i = orders.findIndex(o => o.id === id);
      if (i < 0) return null;
      orders[i].status = status; orders[i].updatedAt = new Date().toISOString();
      write('orders', orders); return orders[i];
    },
  },

  // Reviews
  reviews: {
    findAll:       ()    => read('reviews', []),
    findByProduct: (pid) => read('reviews', []).filter(r => r.productId === pid),
    create: (data) => {
      const reviews = read('reviews', []);
      const r = { ...data, createdAt: new Date().toISOString() };
      reviews.unshift(r); write('reviews', reviews); return r;
    },
  },

  // Categories
  categories: {
    findAll:    ()     => read('categories', defaultCategories()),
    findBySlug: (slug) => read('categories', defaultCategories()).find(c => c.slug === slug),
  },

  // Shipping rates
  shippingRates: {
    douala:      { label:'Douala',       price:2000 },
    yaounde:     { label:'Yaoundé',      price:2000 },
    bafoussam:   { label:'Bafoussam',    price:3500 },
    bamenda:     { label:'Bamenda',      price:3500 },
    garoua:      { label:'Garoua',       price:5000 },
    maroua:      { label:'Maroua',       price:5500 },
    ngaoundere:  { label:'Ngaoundéré',   price:4500 },
    bertoua:     { label:'Bertoua',      price:4000 },
    ebolowa:     { label:'Ebolowa',      price:3000 },
    kribi:       { label:'Kribi',        price:3000 },
    limbe:       { label:'Limbé',        price:2500 },
    buea:        { label:'Buea',         price:2500 },
    kumba:       { label:'Kumba',        price:3000 },
  },
};

function defaultCategories() {
  return [
    { id:'cat-001', name:'Robes & Pagnes',      slug:'robes-pagnes',  icon:'👗', productCount:0 },
    { id:'cat-002', name:'Boubous',             slug:'boubous',       icon:'🥻', productCount:0 },
    { id:'cat-003', name:'Accessoires',         slug:'accessoires',   icon:'👜', productCount:0 },
    { id:'cat-004', name:'Chaussures',          slug:'chaussures',    icon:'👡', productCount:0 },
    { id:'cat-005', name:'Bijoux & Perles',     slug:'bijoux',        icon:'💎', productCount:0 },
    { id:'cat-006', name:'Enfants',             slug:'enfants',       icon:'👶', productCount:0 },
    { id:'cat-007', name:'Hommes',              slug:'hommes',        icon:'👔', productCount:0 },
  ];
}

// Initialiser l'admin par défaut si aucun utilisateur
const bcrypt = require('bcryptjs');
(function initAdmin() {
  const users = read('users', []);
  if (!users.find(u => u.role === 'admin')) {
    users.push({
      id: 'admin-0',
      firstName: 'Admin', lastName: 'ModaAfrik',
      email: 'admin@modaafrik.cm',
      password: bcrypt.hashSync('ModaAfrik@Admin2025!', 10),
      phone: '', role: 'admin',
      isActive: true, createdAt: new Date().toISOString(),
    });
    write('users', users);
    console.log('[Store] Admin créé : admin@modaafrik.cm');
  }
})();

module.exports = Store;
